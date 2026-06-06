"use client";

import Link from "next/link";
import { useRoundCount } from "@/hooks/useRound";
import { RoundCard } from "@/components/RoundCard";

export default function HomePage() {
  const { data: roundCount, isLoading } = useRoundCount();

  const rounds = roundCount
    ? Array.from({ length: Number(roundCount) }, (_, i) => BigInt(i + 1))
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Rounds</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isLoading ? "Loading…" : `${rounds.length} round${rounds.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <Link
          href="/create"
          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          + New Round
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : rounds.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500 mb-4">No rounds yet.</p>
          <Link
            href="/create"
            className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            Create the first round
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {rounds.reverse().map((id) => (
            <RoundCard key={id.toString()} roundId={id} />
          ))}
        </div>
      )}
    </div>
  );
}
