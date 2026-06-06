"use client";

interface Props {
  score: number;
  quorum: number;
}

export function ConsensusResult({ score, quorum }: Props) {
  const pct = score;

  return (
    <div className="rounded-xl border border-green-700/50 bg-green-900/10 p-6">
      <p className="text-sm text-slate-500 mb-2">Consensus Score</p>
      <div className="flex items-end gap-3 mb-4">
        <span className="text-5xl font-bold text-green-400">{score}</span>
        <span className="text-slate-500 text-lg mb-1">/ 100</span>
      </div>

      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-slate-600">
        Average of {quorum} encrypted agent scores · Individual scores permanently sealed
      </p>
    </div>
  );
}
