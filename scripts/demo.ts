/**
 * Conclave v3 — End-to-end demo on Sepolia
 *
 * Flow:
 *   1. Creator creates round (revisionsEnabled = true)
 *   2. 3 agents submit encrypted votes (Phase.Voting)
 *   3. Creator opens revision phase (Phase.Revision)
 *   4. 3 agents submit revised encrypted votes
 *   5. Creator finalizes (Phase.Finalized)
 *   6. Anyone reveals consensus (Phase.Revealed)
 *
 * Scores are fixed for determinism. Set USE_LLM=true to use live Claude scoring.
 */

import { ethers } from "ethers";
import { createCofheConfig, createCofheClient } from "@cofhe/sdk/node";
import { Ethers6Adapter } from "@cofhe/sdk/adapters";
import { Encryptable } from "@cofhe/sdk";
import { sepolia as sepoliaChain } from "@cofhe/sdk/chains";
import * as dotenv from "dotenv";
import { scoreTask } from "../agent/llm";
import ARTIFACT from "../artifacts/contracts/Conclave.sol/Conclave.json";
import * as path from "path";

dotenv.config();

const RPC_URL       = process.env.SEPOLIA_RPC_URL!;
const CONTRACT_ADDR = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const USE_LLM       = process.env.USE_LLM === "true";

const TASK_URI = process.env.DEMO_TASK_URI
  ?? `file://${path.resolve("frontend/public/demo-task.json")}`;

// Fixed scores used when USE_LLM=false (fast, deterministic)
const INITIAL_SCORES  = [72, 85, 63]; // avg = 73 (truncated: (72+85+63)/3 = 220/3 = 73)
const REVISED_SCORES  = [80, 88, 71]; // avg = 79 (truncated: (80+88+71)/3 = 239/3 = 79)

const DEMO_TASK = {
  content: "Conclave: confidential multi-agent consensus via FHE. Agents score tasks without seeing each other's scores.",
};

// ─── CoFHE client per wallet ─────────────────────────────────────────────────

async function makeCofheClient(wallet: ethers.Wallet) {
  const { publicClient, walletClient } = await Ethers6Adapter(wallet.provider!, wallet);
  const config = createCofheConfig({ environment: "node", supportedChains: [sepoliaChain] });
  const client = createCofheClient(config);
  await client.connect(publicClient, walletClient);
  await client.permits.createSelf({ issuer: wallet.address });
  return client;
}

async function encryptScore(wallet: ethers.Wallet, score: number) {
  const client = await makeCofheClient(wallet);
  const [encrypted] = await client.encryptInputs([Encryptable.uint32(BigInt(score))]).execute();
  return encrypted;
}

// ─── Logging ─────────────────────────────────────────────────────────────────

function log(msg: string) { console.log(`\n${msg}`); }
function banner(title: string) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${title}`);
  console.log("═".repeat(60));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!RPC_URL)       throw new Error("SEPOLIA_RPC_URL not set");
  if (!CONTRACT_ADDR) throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS not set");

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const creatorKey = process.env.PRIVATE_KEY!;
  if (!creatorKey) throw new Error("PRIVATE_KEY not set");

  const creator = new ethers.Wallet(creatorKey, provider);

  const agentKeys = [
    process.env.AGENT_1_PRIVATE_KEY,
    process.env.AGENT_2_PRIVATE_KEY,
    process.env.AGENT_3_PRIVATE_KEY,
  ];
  agentKeys.forEach((k, i) => { if (!k) throw new Error(`AGENT_${i + 1}_PRIVATE_KEY not set`); });
  const agents = agentKeys.map((k) => new ethers.Wallet(k!, provider));

  const contract = new ethers.Contract(CONTRACT_ADDR, ARTIFACT.abi, creator);

  banner("CONCLAVE v3 — Sepolia Integration Demo");
  log(`Contract : ${CONTRACT_ADDR}`);
  log(`Creator  : ${creator.address}`);
  agents.forEach((a, i) => log(`Agent ${i + 1}  : ${a.address}`));
  log(`Mode     : ${USE_LLM ? "Live LLM (Claude)" : "Fixed scores (deterministic)"}`);

  // ── 1. Create round ────────────────────────────────────────────────────────
  banner("Phase 1 — Create Round");
  log(`Task URI : ${TASK_URI}`);
  log("Creating round with revisionsEnabled = true …");

  const createTx = await contract.createRound(
    agents.map((a) => a.address),
    TASK_URI,
    true
  );
  const createReceipt = await createTx.wait();
  const roundId: bigint = await contract.roundCount();
  log(`Round #${roundId} created (tx: ${createReceipt.hash})`);

  // ── 2. Voting phase ────────────────────────────────────────────────────────
  banner("Phase 2 — Blind Voting");
  log("Each agent scores the task independently. No score is visible to others.");

  const scores: number[] = [];
  for (let i = 0; i < agents.length; i++) {
    let score: number;
    if (USE_LLM) {
      log(`Agent ${i + 1}: calling Claude to score task …`);
      score = await scoreTask(DEMO_TASK);
    } else {
      score = INITIAL_SCORES[i];
    }
    scores.push(score);
    log(`Agent ${i + 1}: encrypting score ${score} …`);

    const enc = await encryptScore(agents[i], score);
    const agentContract = contract.connect(agents[i]) as ethers.Contract;
    const tx = await agentContract.submitVote(roundId, enc);
    await tx.wait();
    log(`Agent ${i + 1}: vote submitted (score sealed in ciphertext)`);
  }

  const roundAfterVoting = await contract.getRound(roundId);
  log(`\nVotes: ${roundAfterVoting.votesSubmitted}/${roundAfterVoting.quorum}`);
  log("No individual score visible on-chain — sum and count are encrypted handles.");

  // ── 3. Open revision phase ─────────────────────────────────────────────────
  banner("Phase 3 — Open Revision Phase");
  log("Creator opens the revision window. The contract is now in Phase.Revision.");
  log("Agents can update scores. The contract computes:");
  log("  FHE.sub(encryptedSum, oldScore) → FHE.add(result, newScore)");
  log("All arithmetic is over ciphertexts — no plaintext is ever computed.");

  const openTx = await contract.openRevisionPhase(roundId);
  await openTx.wait();
  log("Revision phase open.");

  // ── 4. Revision phase ──────────────────────────────────────────────────────
  banner("Phase 4 — Informed Revision");

  const revisedScores: number[] = [];
  for (let i = 0; i < agents.length; i++) {
    let newScore: number;
    if (USE_LLM) {
      log(`Agent ${i + 1}: re-scoring with fresh reasoning …`);
      newScore = await scoreTask(DEMO_TASK);
    } else {
      newScore = REVISED_SCORES[i];
    }
    revisedScores.push(newScore);
    log(`Agent ${i + 1}: revised score ${newScore} (was ${scores[i]}) — encrypting …`);

    const enc = await encryptScore(agents[i], newScore);
    const agentContract = contract.connect(agents[i]) as ethers.Contract;
    const tx = await agentContract.reviseVote(roundId, enc);
    await tx.wait();
    log(`Agent ${i + 1}: revision submitted`);
  }

  const roundAfterRevision = await contract.getRound(roundId);
  log(`\nRevisions: ${roundAfterRevision.revisionsSubmitted}/${roundAfterRevision.quorum}`);

  // ── 5. Finalize ────────────────────────────────────────────────────────────
  banner("Phase 5 — Finalize");
  log("Computing FHE.div(encryptedSum, encryptedCount) …");

  const finalizeTx = await contract.finalizeRound(roundId);
  await finalizeTx.wait();
  log("Round finalized. Consensus handle ready for threshold decryption.");

  // ── 6. Reveal ──────────────────────────────────────────────────────────────
  banner("Phase 6 — Threshold Decryption & Reveal");
  log("Requesting decryption from Threshold Network …");

  const ctHash = await contract.getConsensusHandle(roundId);
  const revealClient = await makeCofheClient(creator);
  const result = await revealClient.decryptForTx(ctHash).withoutPermit().execute();
  log(`Threshold Network returned plaintext: ${result.decryptedValue}`);

  const revealTx = await contract.revealConsensus(
    roundId, result.ctHash, result.decryptedValue, result.signature
  );
  await revealTx.wait();

  // ── 7. Summary ─────────────────────────────────────────────────────────────
  banner("RESULT");

  const finalRound = await contract.getRound(roundId);
  const expected = USE_LLM
    ? null
    : Math.floor(revisedScores.reduce((a, b) => a + b, 0) / revisedScores.length);

  log(`Round       : #${roundId}`);
  log(`Phase       : Revealed (${finalRound.phase})`);
  log(`Consensus   : ${finalRound.consensusScore} / 100`);
  if (!USE_LLM) {
    log(`Expected    : ${expected} (${revisedScores.join(" + ")} / 3 = ${revisedScores.reduce((a,b)=>a+b,0)} / 3)`);
    const match = BigInt(expected!) === finalRound.consensusScore;
    log(`Verified    : ${match ? "✓ PASS" : "✗ FAIL — mismatch!"}`);
  }
  log(`\nIndividual scores: sealed. On-chain state shows only ciphertext handles.`);
  log(`Sepolia tx: https://sepolia.etherscan.io/address/${CONTRACT_ADDR}`);
}

main().catch((e) => {
  console.error("\nDemo failed:", e);
  process.exit(1);
});
