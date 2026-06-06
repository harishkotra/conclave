"use client";

import Link from "next/link";
import { useRound } from "@/hooks/useRound";
import type { RoundStatus } from "@/types/round";
import { Phase } from "@/types/round";

const STATE_LABELS: Record<RoundStatus, { label: string; done: boolean; active: boolean }> = {
  VOTING:    { label: "Voting",    done: false, active: true },
  REVISION:  { label: "Revision",  done: false, active: true },
  FINALIZED: { label: "Finalized", done: true,  active: false },
  REVEALED:  { label: "Revealed",  done: true,  active: false },
};

function ProtocolIndicator({ status, votes, quorum, revisions, revisionsEnabled }: {
  status: RoundStatus;
  votes: number; quorum: number;
  revisions: number; revisionsEnabled: boolean;
}) {
  const stages = [
    { key: "created",  label: "Created" },
    { key: "voting",   label: "Voting",  done: status !== "VOTING" || votes === quorum },
    { key: "revision", label: "Revision", done: !revisionsEnabled ? (status !== "VOTING") : (status !== "VOTING" && status !== "REVISION"), skip: !revisionsEnabled },
    { key: "final",    label: "Finalized", done: status === "FINALIZED" || status === "REVEALED" },
    { key: "reveal",   label: "Revealed",  done: status === "REVEALED" },
  ];

  return (
    <div className="flex items-center gap-0">
      {stages.filter(s => !s.skip).map((s, i) => {
        const isActive = !s.done && (
          (s.key === "voting" && status === "VOTING") ||
          (s.key === "revision" && status === "REVISION") ||
          (s.key === "final" && status === "FINALIZED") ||
          (s.key === "reveal" && status === "REVEALED")
        );
        return (
          <div key={s.key} className="flex items-center gap-0">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
              s.done
                ? "bg-[#22c55e]/10 text-[#22c55e]"
                : isActive
                ? "bg-[#c084fc]/10 text-[#c084fc]"
                : "bg-[#1A1F3A]/50 text-[#475569]"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                s.done ? "bg-[#22c55e]" : isActive ? "bg-[#c084fc]" : "bg-[#475569]"
              }`} />
              {s.label}
            </div>
            {i < stages.filter(s => !s.skip).length - 1 && (
              <div className="w-3 h-px bg-[#1A1F3A] mx-0.5" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function RoundCard({ roundId }: { roundId: bigint }) {
  const { round, isLoading } = useRound(roundId);

  if (isLoading || !round) {
    return (
      <div className="glass rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-[#1A1F3A] rounded w-1/4 mb-3" />
        <div className="h-3 bg-[#1A1F3A] rounded w-2/3" />
      </div>
    );
  }

  return (
    <Link href={`/round/${roundId}`}>
      <div className="glass-hover rounded-xl p-5 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono text-[#475569]">Round #{roundId.toString()}</span>
              {round.status === "REVEALED" && (
                <span className="text-lg font-bold text-[#22c55e]">{round.consensusScore}</span>
              )}
            </div>
            <p className="text-xs text-[#475569] truncate max-w-md font-mono">{round.taskURI}</p>
          </div>
          <ProtocolIndicator
            status={round.status}
            votes={round.votesSubmitted}
            quorum={round.quorum}
            revisions={round.revisionsSubmitted}
            revisionsEnabled={round.revisionsEnabled}
          />
        </div>

        {/* Participation summary */}
        <div className="flex items-center gap-4 text-[11px] text-[#475569]">
          <span>{round.votesSubmitted}/{round.quorum} voted</span>
          {round.revisionsEnabled && <span>{round.revisionsSubmitted}/{round.quorum} revised</span>}
          <span className="ml-auto text-[#334155] font-mono">
            {round.status === "REVEALED" ? "Consensus reached" : `${round.status.toLowerCase()}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
