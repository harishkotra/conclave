"use client";

import { useState } from "react";
import { useVote } from "@/hooks/useVote";

export function VoteForm({ roundId }: { roundId: bigint }) {
  const [score, setScore] = useState(50);
  const { submitVote, encrypting, isTxPending, isConfirming, isSuccess, confirmedScore, confirmMyScore, canConfirm } = useVote(roundId);

  const busy = encrypting || isTxPending || isConfirming;

  if (isSuccess) {
    return (
      <div className="glass rounded-xl p-5">
        <p className="text-xs text-[#22c55e] font-medium mb-3">Vote submitted successfully.</p>
        {canConfirm && (
          confirmedScore !== null ? (
            <p className="text-xs text-[#475569]">
              Confirmed: your encrypted score is <span className="text-[#22c55e] font-mono">{confirmedScore}</span>
            </p>
          ) : (
            <button onClick={confirmMyScore}
              className="text-[10px] px-2 py-1 rounded bg-[#1A1F3A] hover:bg-[#1A1F3A]/80 text-[#64748b] transition-colors"
            >
              Decrypt my score (local-only)
            </button>
          )
        )}
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-5">
      <p className="text-sm font-medium text-[#e2e8f0] mb-4">Submit your encrypted score</p>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-[#475569]">Score</span>
          <span className="text-2xl font-bold text-[#c084fc] font-mono">{score}</span>
        </div>
        <input
          type="range" min={0} max={100} value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          disabled={busy}
          className="w-full accent-[#c084fc]"
        />
        <div className="flex justify-between text-[10px] text-[#334155] mt-1">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <button
        onClick={() => submitVote(score)}
        disabled={busy}
        className="w-full text-[11px] px-3 py-2 rounded-md border border-[#1A1F3A] text-[#64748b] hover:text-[#94a3b8] hover:border-[#334155] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {encrypting ? "Encrypting with FHE…"
          : isTxPending ? "Sending transaction…"
          : isConfirming ? "Confirming…"
          : "Submit Encrypted Vote"}
      </button>

      <p className="text-[10px] text-[#334155] mt-3 text-center">
        Your score is encrypted client-side before submission.
      </p>
    </div>
  );
}
