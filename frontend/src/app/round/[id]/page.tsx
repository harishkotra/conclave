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
import { FhePipeline } from "@/components/FhePipeline";
import { AgentList } from "@/components/AgentList";
import { CONCLAVE_ADDRESS, CONCLAVE_ABI } from "@/lib/contract";
import { Phase } from "@/types/round";

function ProtocolStrip({ round }: { round: NonNullable<ReturnType<typeof useRound>["round"]> }) {
  const phases = [
    { key: "created",  label: "Created", done: true },
    { key: "voting",   label: "Voting",  done: round.phase > Phase.Voting || (round.phase === Phase.Voting && round.votesSubmitted === round.quorum) },
    { key: "revision", label: "Revision", done: round.phase > Phase.Revision || (round.phase === Phase.Revision && round.revisionsSubmitted === round.quorum), skip: !round.revisionsEnabled },
    { key: "final",    label: "Finalized", done: round.phase >= Phase.Finalized },
    { key: "reveal",   label: "Revealed",  done: round.phase === Phase.Revealed },
  ];

  return (
    <div className="glass rounded-xl p-4 mb-6">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-[#475569] shrink-0">Round #{round.id.toString()}</span>
        <div className="flex items-center gap-1 flex-wrap">
          {phases.filter(s => !s.skip).map((s, i) => (
            <div key={s.key} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono ${
                s.done ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-[#1A1F3A]/50 text-[#475569]"
              }`}>
                <span className={`w-1 h-1 rounded-full ${s.done ? "bg-[#22c55e]" : "bg-[#475569]"}`} />
                {s.label}
              </div>
              {i < phases.filter(s => !s.skip).length - 1 && (
                <span className="text-[#1A1F3A] text-[10px]">→</span>
              )}
            </div>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3 text-[10px] text-[#334155] font-mono shrink-0">
          <span>{round.votesSubmitted}/{round.quorum} votes</span>
          {round.revisionsEnabled && <span>{round.revisionsSubmitted}/{round.quorum} revisions</span>}
        </div>
      </div>
    </div>
  );
}

function OpenRevisionButton({ roundId }: { roundId: bigint }) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  return (
    <button
      onClick={() => writeContract({ address: CONCLAVE_ADDRESS, abi: CONCLAVE_ABI, functionName: "openRevisionPhase", args: [roundId] })}
      disabled={isPending || isConfirming}
      className="w-full text-[11px] px-3 py-2 rounded-md border border-[#1A1F3A] text-[#64748b] hover:text-[#94a3b8] hover:border-[#334155] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
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
      <div className="rounded-lg border border-[#c084fc]/20 bg-[#c084fc]/5 px-4 py-3">
        <p className="text-xs text-[#c084fc]">Revision submitted.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div>
        <p className="text-sm font-medium text-[#e2e8f0] mb-0.5">Revise your score</p>
        <p className="text-xs text-[#475569]">
          The round is in revision. Your new score replaces your old one — all arithmetic is over ciphertexts.
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#64748b]">
          <span>Score</span>
          <span className="font-mono font-bold text-[#c084fc]">{score}</span>
        </div>
        <input
          type="range" min={0} max={100} value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full accent-[#c084fc]"
        />
      </div>
      {error && <p className="text-xs text-red-400">{(error as any).shortMessage ?? error.message}</p>}
      <button
        onClick={() => walletClient && revise(roundId, score, walletClient)}
        disabled={isPending || !walletClient}
        className="w-full text-[11px] px-3 py-2 rounded-md border border-[#1A1F3A] text-[#64748b] hover:text-[#94a3b8] hover:border-[#334155] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
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
      <div className="max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#1A1F3A] rounded w-1/4" />
          <div className="h-4 bg-[#1A1F3A] rounded w-2/3" />
          <div className="h-32 bg-[#1A1F3A] rounded-xl" />
        </div>
      </div>
    );
  }

  const isCreator = address?.toLowerCase() === round.creator.toLowerCase();

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-[#475569] mb-4">
        <Link href="/" className="hover:text-[#64748b] transition-colors">Rounds</Link>
        <span>/</span>
        <span className="text-[#64748b]">Round #{roundId.toString()}</span>
      </div>

      {/* Protocol status strip */}
      <ProtocolStrip round={round} />

      {/* Mission control: two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — protocol execution flow */}
        <div className="lg:col-span-2 space-y-6">
          <FhePipeline
            phase={round.phase}
            votesSubmitted={round.votesSubmitted}
            quorum={round.quorum}
            consensusScore={round.status === "REVEALED" ? round.consensusScore : null}
          />

          {/* Agent actions */}
          {isConnected && isAgent && !hasVoted && round.phase === Phase.Voting && (
            <div>
              <p className="text-[10px] font-semibold tracking-widest text-[#475569] uppercase mb-3">Your Vote</p>
              <VoteForm roundId={roundId} />
            </div>
          )}
          {isConnected && isAgent && hasVoted && round.phase === Phase.Voting && (
            <div className="glass rounded-xl p-5">
              <p className="text-xs text-[#475569]">Vote submitted. Waiting for other agents…</p>
            </div>
          )}
          {isConnected && isAgent && hasVoted && !hasRevised && round.phase === Phase.Revision && (
            <div>
              <p className="text-[10px] font-semibold tracking-widest text-[#475569] uppercase mb-3">Your Revision</p>
              <ReviseForm roundId={roundId} />
            </div>
          )}
          {isConnected && isAgent && hasRevised && round.phase === Phase.Revision && (
            <div className="glass rounded-xl p-5">
              <p className="text-xs text-[#475569]">Revision submitted. Waiting for other agents…</p>
            </div>
          )}

          {/* Creator actions */}
          {isConnected && isCreator && (
            <div className="glass rounded-xl p-5 space-y-3">
              <p className="text-[10px] font-semibold tracking-widest text-[#475569] uppercase">Creator Actions</p>
              {round.phase === Phase.Voting && round.votesSubmitted === round.quorum && round.revisionsEnabled && (
                <OpenRevisionButton roundId={roundId} />
              )}
              {(round.phase === Phase.Voting && round.votesSubmitted === round.quorum && !round.revisionsEnabled) && (
                <FinalizeButton roundId={roundId} />
              )}
              {round.phase === Phase.Revision && <FinalizeButton roundId={roundId} />}
              {round.phase === Phase.Finalized && <RevealButton roundId={roundId} />}
              {round.phase === Phase.Revealed && (
                <p className="text-xs text-[#334155]">Round complete.</p>
              )}
            </div>
          )}

          {/* Completed stages */}
          {round.status === "REVEALED" && <ConsensusResult score={round.consensusScore} quorum={round.quorum} />}
        </div>

        {/* Right column — telemetry panel */}
        <div className="space-y-6">
          <AgentList roundId={roundId} />

          {/* Protocol telemetry */}
          <div className="glass rounded-xl p-5">
            <p className="text-[10px] font-semibold tracking-widest text-[#475569] uppercase mb-4">Telemetry</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#475569]">Participation</span>
                <span className="text-xs font-mono text-[#64748b]">{round.votesSubmitted}/{round.quorum}</span>
              </div>
              {round.revisionsEnabled && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#475569]">Revisions</span>
                  <span className="text-xs font-mono text-[#64748b]">{round.revisionsSubmitted}/{round.quorum}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#475569]">Ciphertexts</span>
                <span className="text-xs font-mono text-[#64748b]">{round.votesSubmitted + round.revisionsSubmitted}</span>
              </div>
              {round.revisionsEnabled && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#475569]">Revision round</span>
                  <span className="text-xs font-mono text-[#64748b]">{round.revisionsEnabled ? "enabled" : "disabled"}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#475569]">Status</span>
                <span className="text-xs font-mono text-[#64748b]">{round.status.toLowerCase()}</span>
              </div>
              {round.status === "REVEALED" && (
                <div className="flex items-center justify-between pt-2 border-t border-[#1A1F3A]">
                  <span className="text-[11px] text-[#475569]">Consensus</span>
                  <span className="text-sm font-bold text-[#22c55e]">{round.consensusScore}</span>
                </div>
              )}
            </div>
          </div>

          {/* Round info */}
          <div className="glass rounded-xl p-5">
            <p className="text-[10px] font-semibold tracking-widest text-[#475569] uppercase mb-3">Details</p>
            <div className="space-y-2 text-[11px]">
              <div>
                <p className="text-[#334155]">Creator</p>
                <p className="font-mono text-[#475569] truncate">{round.creator}</p>
              </div>
              <div>
                <p className="text-[#334155]">Created</p>
                <p className="text-[#475569]">{new Date(Number(round.createdAt) * 1000).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[#334155]">Task</p>
                <p className="font-mono text-[#475569] truncate text-[10px]">{round.taskURI}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
