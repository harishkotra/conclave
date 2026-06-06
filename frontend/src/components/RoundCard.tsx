"use client";

import Link from "next/link";
import { useRound } from "@/hooks/useRound";
import type { RoundStatus } from "@/types/round";

const STATUS_STYLES: Record<RoundStatus, string> = {
  VOTING:    "bg-yellow-900/60 text-yellow-300",
  REVISION:  "bg-orange-900/60 text-orange-300",
  FINALIZED: "bg-blue-900/60 text-blue-300",
  REVEALED:  "bg-green-900/60 text-green-300",
};

export function RoundCard({ roundId }: { roundId: bigint }) {
  const { round, isLoading } = useRound(roundId);

  if (isLoading || !round) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
        <div className="h-3 bg-slate-700 rounded w-2/3" />
      </div>
    );
  }

  const progress = round.quorum > 0
    ? Math.round((round.votesSubmitted / round.quorum) * 100)
    : 0;

  return (
    <Link href={`/round/${roundId}`}>
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 hover:border-violet-600/50 hover:bg-slate-800 p-5 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs text-slate-500 font-mono">Round #{roundId.toString()}</span>
            <p className="text-sm text-slate-300 mt-0.5 truncate max-w-xs">
              {round.taskURI}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-md font-medium ${STATUS_STYLES[round.status]}`}>
            {round.status}
          </span>
        </div>

        {round.status === "REVEALED" ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-400">{round.consensusScore}</span>
            <span className="text-sm text-slate-500">/ 100</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Votes</span>
              <span>{round.votesSubmitted} / {round.quorum}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
