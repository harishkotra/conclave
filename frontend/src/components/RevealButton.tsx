"use client";

import { useReveal } from "@/hooks/useReveal";

export function RevealButton({ roundId }: { roundId: bigint }) {
  const { revealConsensus, decrypting, isTxPending, isConfirming, isSuccess } = useReveal(roundId);

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-green-800/50 bg-green-900/20 p-4">
        <p className="text-green-400 text-sm font-medium">Consensus revealed on-chain.</p>
      </div>
    );
  }

  const busy = decrypting || isTxPending || isConfirming;

  return (
    <button
      onClick={revealConsensus}
      disabled={busy}
      className="w-full py-2.5 rounded-lg bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
    >
      {decrypting
        ? "Requesting Threshold Network…"
        : isTxPending
        ? "Publishing proof…"
        : isConfirming
        ? "Confirming…"
        : "Reveal Consensus"}
    </button>
  );
}
