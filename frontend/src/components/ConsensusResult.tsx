"use client";

interface Props {
  score: number;
  quorum: number;
}

function Ring({ score }: { score: number }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative w-28 h-28">
      <svg width="112" height="112" viewBox="0 0 120 120" className="transform -rotate-90">
        <circle cx="60" cy="60" r={50} fill="none" stroke="rgba(30, 35, 60, 0.6)" strokeWidth="4" />
        <circle
          cx="60" cy="60" r={50}
          fill="none" stroke="#22c55e" strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={isNaN(offset) ? circ : offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-[#e2e8f0] tracking-tight">{score}</span>
      </div>
    </div>
  );
}

export function ConsensusResult({ score, quorum }: Props) {
  return (
    <div className="glass rounded-xl p-8">
      <div className="flex items-center gap-8">
        <Ring score={score} />
        <div>
          <p className="text-[11px] text-[#22c55e] font-medium tracking-wider uppercase mb-1">
            Consensus Achieved
          </p>
          <p className="text-sm text-[#64748b]">
            Average of {quorum} encrypted agent scores
          </p>
          <p className="text-[11px] text-[#475569] mt-2 font-mono">
            Individual scores permanently sealed
          </p>
        </div>
      </div>
      {/* Protocol completion bar */}
      <div className="mt-6 pt-4 border-t border-[#1A1F3A] flex items-center gap-3 text-[10px] text-[#334155]">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          Created
        </span>
        <span className="w-4 h-px bg-[#1A1F3A]" />
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          Voting
        </span>
        <span className="w-4 h-px bg-[#1A1F3A]" />
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          Finalized
        </span>
        <span className="w-4 h-px bg-[#1A1F3A]" />
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          Revealed
        </span>
      </div>
    </div>
  );
}
