"use client";

import { useState } from "react";
import { useVote } from "@/hooks/useVote";

export function VoteForm({ roundId }: { roundId: bigint }) {
  const [score, setScore] = useState(50);
  const { submitVote, encrypting, isTxPending, isConfirming, isSuccess, confirmedScore, confirmMyScore, canConfirm } = useVote(roundId);

  const busy = encrypting || isTxPending || isConfirming;

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-green-800/50 bg-green-900/20 p-5">
        <p className="text-green-400 font-medium mb-3">Vote submitted successfully.</p>
        {canConfirm && (
          confirmedScore !== null ? (
            <p className="text-sm text-slate-400">
              Confirmed: your encrypted score is <span className="text-green-300 font-mono">{confirmedScore}</span>
            </p>
          ) : (
            <button
              onClick={confirmMyScore}
              className="text-sm px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
            >
              Confirm my score (decrypt for view)
            </button>
          )
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
      <h3 className="text-sm font-medium text-slate-300 mb-4">Submit your encrypted score</h3>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">Score</span>
          <span className="text-2xl font-bold text-violet-400 font-mono">{score}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          disabled={busy}
          className="w-full accent-violet-500"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <button
        onClick={() => submitVote(score)}
        disabled={busy}
        className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
      >
        {encrypting
          ? "Encrypting with FHE…"
          : isTxPending
          ? "Sending transaction…"
          : isConfirming
          ? "Confirming…"
          : "Submit Encrypted Vote"}
      </button>

      <p className="text-xs text-slate-600 mt-3 text-center">
        Your score is encrypted client-side before submission. No one can read it.
      </p>
    </div>
  );
}
