"use client";

import { useReveal } from "@/hooks/useReveal";

export function RevealButton({ roundId }: { roundId: bigint }) {
  const { revealConsensus, decrypting, isTxPending, isConfirming, isSuccess } = useReveal(roundId);

  if (isSuccess) {
    return (
      <div className="rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5 px-4 py-3">
        <p className="text-xs text-[#22c55e] font-medium">Consensus revealed on-chain.</p>
      </div>
    );
  }

  const busy = decrypting || isTxPending || isConfirming;

  return (
    <button
      onClick={revealConsensus}
      disabled={busy}
      className="w-full text-[11px] px-3 py-2 rounded-md border border-[#1A1F3A] text-[#64748b] hover:text-[#94a3b8] hover:border-[#334155] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
    >
      {decrypting ? "Requesting Threshold Network…"
        : isTxPending ? "Publishing proof…"
        : isConfirming ? "Confirming…"
        : "Reveal Consensus"}
    </button>
  );
}
