import { ethers } from "ethers";
import { createCofheConfig, createCofheClient } from "@cofhe/sdk/node";
import { Ethers6Adapter } from "@cofhe/sdk/adapters";
import { Encryptable } from "@cofhe/sdk";
import { sepolia as sepoliaChain } from "@cofhe/sdk/chains";
import * as dotenv from "dotenv";
import { createWallet } from "./wallets";
import { scoreTask, type Task } from "./llm";
import CONCLAVE_ABI from "../artifacts/contracts/Conclave.sol/Conclave.json";

dotenv.config();

const RPC_URL       = process.env.SEPOLIA_RPC_URL!;
const CONTRACT_ADDR = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const POLL_INTERVAL = 30_000;

enum Phase { Voting = 0, Revision = 1, Finalized = 2, Revealed = 3 }

async function buildAgentContext(wallet: ethers.Wallet) {
  const { publicClient, walletClient } = await Ethers6Adapter(wallet.provider!, wallet);
  const config = createCofheConfig({
    environment: "sepolia",
    supportedChains: [sepoliaChain],
  });
  const client = createCofheClient(config);
  await client.connect(publicClient, walletClient);
  await client.permits.createSelf({ issuer: wallet.address });
  return client;
}

async function pollAndVote(wallet: ethers.Wallet, provider: ethers.JsonRpcProvider) {
  const contract = new ethers.Contract(CONTRACT_ADDR, CONCLAVE_ABI.abi, provider);
  const agentContract = contract.connect(wallet) as ethers.Contract;
  const roundCount: bigint = await contract.roundCount();

  for (let id = 1n; id <= roundCount; id++) {
    const round = await contract.getRound(id);
    const phase: Phase = Number(round.phase);

    if (phase === Phase.Finalized || phase === Phase.Revealed) continue;
    if (!(await contract.isAgent(id, wallet.address))) continue;

    // ── Voting phase ────────────────────────────────────────────────────────
    if (phase === Phase.Voting) {
      if (await contract.hasVoted(id, wallet.address)) continue;

      let task: Task;
      try {
        task = await fetch(round.taskURI).then((r) => r.json());
      } catch (e) {
        console.error(`[agent ${wallet.address.slice(0, 8)}] failed to fetch task for round ${id}:`, e);
        continue;
      }

      const score = await scoreTask(task);
      console.log(`[agent ${wallet.address.slice(0, 8)}] round ${id} → score ${score} (encrypting...)`);

      const cofheClient = await buildAgentContext(wallet);
      const [encrypted] = await cofheClient.encryptInputs([Encryptable.uint32(BigInt(score))]).execute();

      const tx = await agentContract.submitVote(id, encrypted);
      await tx.wait();
      console.log(`[agent ${wallet.address.slice(0, 8)}] round ${id} → vote submitted`);
    }

    // ── Revision phase ──────────────────────────────────────────────────────
    if (phase === Phase.Revision) {
      if (!await contract.hasVoted(id, wallet.address)) continue;
      if (await contract.hasRevised(id, wallet.address)) continue;

      let task: Task;
      try {
        task = await fetch(round.taskURI).then((r) => r.json());
      } catch (e) {
        console.error(`[agent ${wallet.address.slice(0, 8)}] failed to fetch task for round ${id}:`, e);
        continue;
      }

      const newScore = await scoreTask(task);
      console.log(`[agent ${wallet.address.slice(0, 8)}] round ${id} → revised score ${newScore} (encrypting...)`);

      const cofheClient = await buildAgentContext(wallet);
      const [encrypted] = await cofheClient.encryptInputs([Encryptable.uint32(BigInt(newScore))]).execute();

      const tx = await agentContract.reviseVote(id, encrypted);
      await tx.wait();
      console.log(`[agent ${wallet.address.slice(0, 8)}] round ${id} → revision submitted`);
    }
  }
}

function printUsage() {
  console.error("Usage: npx ts-node agent/index.ts --agent <1|2|3>");
  process.exit(1);
}

async function main() {
  if (!RPC_URL) throw new Error("SEPOLIA_RPC_URL not set");
  if (!CONTRACT_ADDR) throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS not set");

  const agentIdx = (() => {
    const idx = process.argv.indexOf("--agent");
    if (idx === -1 || !process.argv[idx + 1]) printUsage();
    return parseInt(process.argv[idx + 1], 10);
  })();

  if (agentIdx < 1 || agentIdx > 3) printUsage();

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet   = createWallet(agentIdx, provider);

  console.log(`Conclave agent ${agentIdx} started`);
  console.log(`Wallet: ${wallet.address}`);
  console.log(`Contract: ${CONTRACT_ADDR}`);

  const run = () => pollAndVote(wallet, provider).catch((e) => console.error("Poll error:", e));
  run();
  setInterval(run, POLL_INTERVAL);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
