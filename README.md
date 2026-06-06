<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/harishkotra/conclave/main/frontend/public/conclave-logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/harishkotra/conclave/main/frontend/public/conclave-logo-light.svg">
  <img src="https://raw.githubusercontent.com/harishkotra/conclave/main/frontend/public/conclave-logo-dark.svg" alt="Conclave">
</picture>

# Conclave — Confidential Multi-Agent Consensus Protocol

**Conclave** is a protocol for multiple AI agents to produce a consensus score on a subjective task — without ever revealing any individual agent's score. Using Fully Homomorphic Encryption (FHE), scores are encrypted on the client side, aggregated inside a smart contract, and the final consensus average is decrypted only once all agents have committed. No agent, contract deployer, or third party can see individual votes.

> Deployed on **Ethereum Sepolia** — built with [Fhenix CoFHE](https://fhenix.io).

---

## The Problem

When multiple AI agents evaluate the same task (e.g., an LLM output, a code review, or a creative brief), their individual scores carry valuable signal but are prone to:

- **Collusion** — agents adjust their scores after seeing others'.
- **Anchoring** — the first public score biases all subsequent scores.
- **Chilling effects** — agents hesitate to submit honest low/high scores if peers can see them.

Existing DAO voting or multi-sig schemes reveal every vote on-chain. What's needed is a way to compute the consensus *while keeping every individual vote secret*.

## The Solution

Conclave uses **Fully Homomorphic Encryption** (via Fhenix CoFHE) to perform arithmetic on encrypted data. Each agent encrypts their score on the client side and submits the ciphertext to the contract. The contract sums encrypted scores and (on finalize) computes the encrypted average. A threshold network of FHE nodes decrypts only the final average — individual scores remain encrypted forever.

```
                  ┌──────────────────────────────────────────────┐
                  │              Conclave Protocol                │
                  │                                              │
  Agent 1 ───────┤  encrypt(87) ─────┐                          │
                  │                   ▼                           │
  Agent 2 ───────┤  encrypt(92) ───► FHE.sum() ──► FHE.div()    │
                  │                   ▲            └──────┐       │
  Agent 3 ───────┤  encrypt(64) ─────┘                     ▼      │
                  │                                  avg = 81     │
                  │                                      │         │
                  │                          Threshold Decrypt    │
                  │                                      │         │
                  │                          Consensus: 81/100    │
                  └──────────────────────────────────────────────┘
```

## Protocol Flow

```
┌─────────┐    ┌─────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐
│ 1.      │    │ 2.      │    │ 3.       │    │ 4.        │    │ 5.       │
│ CREATE  │───►│ VOTE    │───►│ REVISION │───►│ FINALIZE  │───►│ REVEAL   │
│ Round   │    │ Phase   │    │ Phase    │    │ Phase     │    │ Consensus│
│         │    │         │    │ (opt.)   │    │           │    │          │
└─────────┘    └─────────┘    └──────────┘    └───────────┘    └──────────┘
```

| Phase | Description |
|---|---|
| **Create** | Creator deploys a round with agent addresses, task URI, and a revision toggle. The contract initializes encrypted accumulators in FHE. |
| **Vote** | Each agent encrypts a score (0–100) on their client using the CoFHE SDK and submits it. The contract adds each ciphertext to a running encrypted sum. |
| **Revision** *(optional)* | Creator opens a revision window. Agents who already voted can submit a new encrypted score. The contract subtracts the old ciphertext and adds the new one — still in the encrypted domain. |
| **Finalize** | Once quorum is met, the creator finalizes the round. The contract computes `encryptedSum / encryptedCount` in FHE and stores the encrypted average. |
| **Reveal** | The threshold FHE network decrypts the average and submits it on-chain. The final consensus score is stored in plaintext. Individual scores remain forever encrypted. |

## Why FHE?

FHE lets Conclave guarantee properties that are impossible with plaintext voting:

| Property | How Conclave achieves it |
|---|---|
| **Secrecy** | Scores encrypted end-to-end. Contract never sees plaintext. |
| **Correctness** | FHE arithmetic is deterministic — encrypted sum ÷ count = encrypted average. |
| **No collusion** | Agents cannot see any peer's score before committing. |
| **No anchoring** | No score is ever revealed before the consensus is computed. |
| **Verifiability** | Threshold network validates the decryption. |

## Tech Stack

| Layer | Technology |
|---|---|
| **Smart Contract** | Solidity ^0.8.28 (evmVersion: cancun) |
| **FHE Backend** | Fhenix CoFHE (packages: `@cofhe/sdk`, `@cofhe/hardhat-plugin`, `@fhenixprotocol/cofhe-contracts`) |
| **Blockchain** | Ethereum Sepolia |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Web3** | wagmi v2, viem v2 |
| **Agent Runner** | Node.js/TypeScript, OpenAI-compatible LLM API, 30s poll loop |
| **Testing** | Hardhat + chai (52 tests) |
| **Deployment** | Hardhat deploy script, ethers v6 |

### Package Versions

| Package | Version |
|---|---|
| `@cofhe/sdk` | ^0.6.0 |
| `@cofhe/hardhat-plugin` | ^0.6.0 |
| `@fhenixprotocol/cofhe-contracts` | ^0.1.4 |
| `hardhat` | ^2.22.3 |
| `solc` | 0.8.28 |
| `openai` | ^6.42.0 |

## Smart Contract Architecture

### Errors (18)

The contract uses Solidity custom errors for gas-efficient reverts:

```
RoundDoesNotExist       — roundId out of range
InvalidQuorum           — agent list < 2 or > 50
EmptyTaskURI            — task URI is empty
DuplicateAgent          — duplicate address in agent list
NotRegisteredAgent      — caller not in the agent list
NotRoundCreator         — only creator can open revision
AlreadyVoted            — agent already submitted a vote
HasNotVoted             — agent hasn't voted yet
RoundAlreadyFinalized   — phase is past voting
RoundNotFinalized       — must finalize before reveal
QuorumNotMet            — not enough votes submitted
ScoreOutOfRange         — decrypted score > MAX_SCORE (100)
RevisionNotOpen         — not in revision phase
RevisionAlreadyOpen     — already in revision phase
RevisionAlreadySubmitted — agent already revised
RevisionNotEnabled      — round was created without revision support
```

### Events (5)

```
RoundCreated(roundId, creator, quorum, taskURI, revisionsEnabled)
VoteSubmitted(roundId, agent, totalSubmitted)
RevisionPhaseOpened(roundId)
RevisionSubmitted(roundId, agent, totalRevisions)
RoundFinalized(roundId)
ConsensusRevealed(roundId, consensusScore)
```

### Struct

```solidity
struct Round {
    address creator;
    string  taskURI;
    uint32  quorum;
    uint32  votesSubmitted;
    uint32  revisionsSubmitted;
    bool    revisionsEnabled;
    Phase   phase;        // Voting | Revision | Finalized | Revealed
    euint32 encryptedSum;
    euint32 encryptedCount;
    euint32 consensusHandle;
    uint32  consensusScore;
    uint256 createdAt;
    uint256 finalizedAt;
    uint256 revealedAt;
}
```

### Key Design Decisions

- **FHE accumulators**: `encryptedSum` and `encryptedCount` are `euint32` values that live entirely in encrypted space. The contract never reads their plaintext.
- **Permission model**: `FHE.allowThis()` and `FHE.allow(score, msg.sender)` scope access to the contract and the submitting agent. No third party can unwrap a ciphertext.
- **Revision via subtraction**: To allow revisions, the contract performs `newSum = (encryptedSum - oldScore) + newScore` entirely in FHE. This avoids storing multiple ciphertexts per agent.
- **Threshold decryption**: `revealConsensus()` calls `FHE.publishDecryptResult()` which requires a valid signature from the Fhenix threshold network — no single party can forge a decryption.

## Project Structure

```
conclave/
├── contracts/
│   └── Conclave.sol              # Main protocol contract
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout + nav header
│   │   │   ├── page.tsx          # Landing page / round list
│   │   │   ├── create/
│   │   │   │   └── page.tsx      # Round creation wizard
│   │   │   └── round/
│   │   │       └── [id]/
│   │   │           └── page.tsx  # Round detail (vote/reveal)
│   │   ├── components/
│   │   │   ├── AgentList.tsx     # Participant identity cards
│   │   │   ├── ConnectButton.tsx # Wallet connection
│   │   │   ├── ConsensusResult.tsx # SVG ring meter
│   │   │   ├── FhePipeline.tsx   # Protocol flow visualization
│   │   │   ├── RoundCard.tsx     # Round timeline card
│   │   │   └── VoteForm.tsx      # Encrypted vote slider
│   │   ├── hooks/
│   │   │   ├── useAgents.ts      # Agent list + status
│   │   │   ├── useCofhe.ts       # CoFHE client singleton
│   │   │   ├── useReveal.ts      # Decrypt + reveal
│   │   │   ├── useRevise.ts      # Revision submission
│   │   │   ├── useRound.ts       # Round data fetch
│   │   │   └── useVote.ts        # Encrypted vote submit
│   │   ├── lib/
│   │   │   ├── abi.ts            # Contract ABI
│   │   │   ├── chain.ts          # Wagmi chain config
│   │   │   ├── cofhe.ts          # CoFHE init
│   │   │   ├── contract.ts       # Contract address
│   │   │   └── task.ts           # Task URI parser
│   │   └── types/
│   │       └── round.ts          # Phase enum, Round interface
│   ├── public/
│   │   ├── conclave-logo-dark.svg
│   │   ├── conclave-logo-light.svg
│   │   └── conclave-mark.svg     # Favicon
│   └── tailwind.config.ts
├── agent/
│   ├── index.ts                  # Main agent runner
│   ├── llm.ts                    # LLM client (OpenAI-compatible)
│   └── wallets.ts                # Agent wallet management
├── scripts/
│   └── deploy.ts                 # Hardhat deploy script
├── test/
│   ├── Conclave.test.ts          # 52 test cases
│   └── helpers/
│       └── fhe.ts                # Test FHE utilities
├── hardhat.config.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## Frontend

The frontend is a **Next.js 14** app with App Router and a **dark protocol aesthetic**:

- **Design system** (#040816 base, #070B1F surfaces, #c084fc accent, thin #1A1F3A borders) — inspired by Linear, Stripe, and Vercel. No gradients, blurs, or glow effects.
- **Landing page** (unauthenticated): Hero split-screen with animated SVG protocol flow, metrics inline, FHE explainer, and a comparison table (Traditional vs Conclave).
- **Round list** (wallet-gated): All rounds fetched from the contract, displayed as timeline cards with horizontal phase indicators.
- **Create workflow**: 4-step wizard (Task → Agents → Rules → Launch) with inline task entry (title, description, rubric) or URL paste.
- **Round detail**: Mission-control layout — protocol pipeline with live telemetry, agent list with ciphertext status, encrypted vote slider, revision panel, and consensus result ring meter.
- **Wallet**: wagmi `ConnectButton` with status indicator. All views are wallet-gated besides the landing page.

### Key Components

| Component | Purpose |
|---|---|
| `FhePipeline` | Vertical stage flow showing FHE operations per phase with timeline connectors |
| `AgentList` | Participant cards with status, ciphertext count, local decrypt |
| `ConsensusResult` | SVG ring meter showing the final consensus score |
| `RoundCard` | Protocol timeline with horizontal state indicators |
| `VoteForm` | Encrypted vote slider (0–100) with encrypt-then-submit flow |

## Agent Runner

The `agent/` directory contains a Node.js/TypeScript runner that:

1. Polls `getActiveRound` (or a configured roundId) every 30 seconds.
2. Fetches the task from the URI stored on-chain.
3. Sends the task to an OpenAI-compatible LLM API with a scoring rubric.
4. Encrypts the returned score using `@cofhe/sdk/node` + `Ethers6Adapter`.
5. Submits the encrypted `InEuint32` to `submitVote()` on the contract.
6. If a revision phase opens, scores again and calls `reviseVote()`.

### Environment

```
COFHE_PRIVATE_KEY=<agent wallet private key>
COFHE_RPC_URL=<sepolia RPC URL>
OPENAI_API_KEY=<LLM provider API key>
OPENAI_BASE_URL=<LLM provider base URL>    # optional, for compatible APIs
LLM_MODEL=<model name>                     # e.g. gpt-4o
```

## Testing

52 test cases covering the full protocol spec:

```
npx hardhat test
```

| Test Group | Tests |
|---|---|
| Create round | validation, duplicate agents, empty URI, max agents |
| Submit vote | encryption, submission, double-vote rejection, agent-only |
| Revision phase | open, revise, re-revision rejection, disabled-round |
| Finalize | quorum check, re-finalize rejection, encrypted average |
| Reveal | threshold decrypt, score validation, double-reveal |
| ACL | permission model, allowThis/allow scoping |
| Full E2E | no-revision path, with-revision path, all 6 phases |
| Integer truncation | score boundaries, div-by-zero safety |

## Deployment

### Contract

```
npx hardhat run scripts/deploy.ts --network sepolia
```

Deployed at **`0x0C83824a9800f9ED1e22ec289CB67E065ceA73C2`** (Sepolia, v3).

### Prerequisites

- `.env` with `SEPOLIA_RPC_URL` and `PRIVATE_KEY` (creator wallet).
- `COFHE_PRIVATE_KEY` for each agent wallet.
- Agent wallets require Sepolia ETH (~0.005 ETH per 2 txs) for gas.

### Gas

The contract uses **dynamic fee calculation**: `2 × baseFee + maxPriorityFeePerGas` (fetched via `provider.getFeeData()`). No hardcoded gas caps — avoids "max fee per gas less than block base fee" errors on Sepolia.

## Configuration

### `.env`

```env
SEPOLIA_RPC_URL=https://sepolia.gateway.tenderly.co
PRIVATE_KEY=...

# Frontend
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0C83824a9800f9ED1e22ec289CB67E065ceA73C2
NEXT_PUBLIC_COFHE_RPC_URL=https://sepolia.gateway.tenderly.co
```