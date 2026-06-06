"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useAccount, useWalletClient } from "wagmi";
import { useRound, useAgentStatus } from "@/hooks/useRound";
import { useRevise } from "@/hooks/useRevise";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { VoteForm } from "@/components/VoteForm";
import { FinalizeButton } from "@/components/FinalizeButton";
import { RevealButton } from "@/components/RevealButton";
import { ConsensusResult } from "@/components/ConsensusResult";
import { CONCLAVE_ADDRESS, CONCLAVE_ABI } from "@/lib/contract";
import { Phase } from "@/types/round";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  VOTING:    { label: "Voting in progress",          color: "text-yellow-400" },
  REVISION:  { label: "Revision phase open",         color: "text-orange-400" },
  FINALIZED: { label: "Finalized — ready to reveal", color: "text-blue-400" },
  REVEALED:  { label: "Consensus revealed",          color: "text-green-400" },
};

function OpenRevisionButton({ roundId }: { roundId: bigint }) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  return (
    <button
      onClick={() => writeContract({ address: CONCLAVE_ADDRESS, abi: CONCLAVE_ABI, functionName: "openRevisionPhase", args: [roundId] })}
      disabled={isPending || isConfirming}
      className="w-full py-2.5 rounded-lg bg-orange-700 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
    >
      {isPending || isConfirming ? "Opening…" : "Open Revision Phase"}
    </button>
  );
}

function ReviseForm({ roundId }: { roundId: bigint }) {
  const [score, setScore] = useState(50);
  const { data: walletClient } = useWalletClient();
  const { revise, isPending, isSuccess, error } = useRevise();

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-orange-800/50 bg-orange-900/20 p-4">
        <p className="text-sm text-orange-300">Revision submitted.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-800/50 bg-slate-800/50 p-5 space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-300 mb-0.5">Revise your score</p>
        <p className="text-xs text-slate-500">
          The round is in revision. Submit an updated score — you are computing on the group's encrypted
          signal without seeing it. Your new score replaces your old one.
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Score</span>
          <span className="font-mono font-bold text-orange-300">{score}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full accent-orange-500"
        />
      </div>
      {error && (
        <p className="text-xs text-red-400">{(error as any).shortMessage ?? error.message}</p>
      )}
      <button
        onClick={() => walletClient && revise(roundId, score, walletClient)}
        disabled={isPending || !walletClient}
        className="w-full py-2 rounded-lg bg-orange-700 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
      >
        {isPending ? "Submitting revision…" : "Submit Revision"}
      </button>
    </div>
  );
}

export default function RoundPage() {
  const params = useParams();
  const roundId = BigInt(params.id as string);
  const { address, isConnected } = useAccount();
  const { round, isLoading } = useRound(roundId);
  const { isAgent, hasVoted, hasRevised } = useAgentStatus(roundId, address);

  if (isLoading || !round) {
    return (
      <div className="max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/4" />
          <div className="h-4 bg-slate-800 rounded w-2/3" />
          <div className="h-32 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const isCreator = address?.toLowerCase() === round.creator.toLowerCase();
  const { label, color } = STATUS_LABELS[round.status];
  const progress = Math.round((round.votesSubmitted / round.quorum) * 100);
  const revisionProgress = round.quorum > 0
    ? Math.round((round.revisionsSubmitted / round.quorum) * 100)
    : 0;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/" className="hover:text-slate-300 transition-colors">Rounds</Link>
          <span>/</span>
          <span>#{roundId.toString()}</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Round #{roundId.toString()}</h1>
        <p className={`text-sm font-medium ${color}`}>{label}</p>
      </div>

      {/* Task */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
        <p className="text-xs text-slate-500 mb-1">Task URI</p>
        <a
          href={round.taskURI}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-violet-400 hover:text-violet-300 font-mono break-all transition-colors"
        >
          {round.taskURI}
        </a>
      </div>

      {/* Voting progress */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">Voting progress</span>
          <span className="text-sm font-mono text-slate-300">
            {round.votesSubmitted} / {round.quorum} agents
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Revision progress (only when relevant) */}
      {(round.phase === Phase.Revision || (round.phase >= Phase.Finalized && round.revisionsEnabled)) && (
        <div className="rounded-xl border border-orange-800/40 bg-slate-800/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Revision progress</span>
            <span className="text-sm font-mono text-slate-300">
              {round.revisionsSubmitted} / {round.quorum} agents
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${revisionProgress}%` }} />
          </div>
        </div>
      )}

      {/* Revealed */}
      {round.status === "REVEALED" && (
        <ConsensusResult score={round.consensusScore} quorum={round.quorum} />
      )}

      {/* Agent: vote */}
      {isConnected && isAgent && !hasVoted && round.phase === Phase.Voting && (
        <div>
          <h2 className="text-sm font-medium text-slate-400 mb-3">Your vote</h2>
          <VoteForm roundId={roundId} />
        </div>
      )}

      {isConnected && isAgent && hasVoted && round.phase === Phase.Voting && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <p className="text-sm text-slate-400">Vote submitted. Waiting for other agents…</p>
        </div>
      )}

      {/* Agent: revise */}
      {isConnected && isAgent && hasVoted && !hasRevised && round.phase === Phase.Revision && (
        <ReviseForm roundId={roundId} />
      )}

      {isConnected && isAgent && hasRevised && round.phase === Phase.Revision && (
        <div className="rounded-xl border border-orange-800/40 bg-slate-800/50 p-4">
          <p className="text-sm text-slate-400">Revision submitted. Waiting for other agents…</p>
        </div>
      )}

      {/* Creator actions */}
      {isConnected && isCreator && (
        <div>
          <h2 className="text-sm font-medium text-slate-400 mb-3">Creator actions</h2>
          <div className="space-y-3">
            {/* Open revision phase: voting done + revisions enabled */}
            {round.phase === Phase.Voting && round.votesSubmitted === round.quorum && round.revisionsEnabled && (
              <OpenRevisionButton roundId={roundId} />
            )}
            {/* Finalize: voting done + no revisions, OR revision phase open */}
            {round.phase === Phase.Voting && round.votesSubmitted === round.quorum && !round.revisionsEnabled && (
              <FinalizeButton roundId={roundId} />
            )}
            {round.phase === Phase.Revision && (
              <FinalizeButton roundId={roundId} />
            )}
            {round.phase === Phase.Finalized && (
              <RevealButton roundId={roundId} />
            )}
            {round.phase === Phase.Revealed && (
              <p className="text-sm text-slate-500">Round complete.</p>
            )}
          </div>
        </div>
      )}

      {/* Info row */}
      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
        <div className="rounded-lg border border-slate-800 p-3">
          <p className="mb-0.5">Creator</p>
          <p className="font-mono text-slate-400 truncate">{round.creator}</p>
        </div>
        <div className="rounded-lg border border-slate-800 p-3">
          <p className="mb-0.5">Created</p>
          <p className="text-slate-400">
            {new Date(Number(round.createdAt) * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
