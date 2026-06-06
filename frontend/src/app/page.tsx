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
      {/* Header area */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[#e2e8f0] tracking-tight">Rounds</h1>
          <p className="text-xs text-[#475569] mt-1 font-mono">
            {isLoading ? "Loading…" : `${rounds.length} round${rounds.length !== 1 ? "s" : ""} · ${rounds.length} total`}
          </p>
        </div>
        <Link
          href="/create"
          className="text-xs px-3 py-1.5 rounded-md bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc] hover:bg-[#c084fc]/15 transition-colors font-medium"
        >
          + New Round
        </Link>
      </div>

      {/* Protocol timeline */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-[#1A1F3A] rounded w-1/4 mb-3" />
              <div className="h-3 bg-[#1A1F3A] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : rounds.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-sm text-[#475569] mb-4">No rounds have been created.</p>
          <Link
            href="/create"
            className="text-xs px-3 py-1.5 rounded-md bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc] hover:bg-[#c084fc]/15 transition-colors font-medium"
          >
            Create the first round
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.reverse().map((id) => (
            <RoundCard key={id.toString()} roundId={id} />
          ))}
        </div>
      )}

      {/* Protocol footer */}
      <div className="mt-10 pt-6 border-t border-[#1A1F3A] flex items-center gap-4 text-[10px] text-[#334155]">
        <span>Confidential Multi-Agent Consensus</span>
        <span className="w-1 h-1 rounded-full bg-[#1A1F3A]" />
        <span>FHE-encrypted voting</span>
        <span className="w-1 h-1 rounded-full bg-[#1A1F3A]" />
        <span>Threshold decryption</span>
      </div>
    </div>
  );
}
