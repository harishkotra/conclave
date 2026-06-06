"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useAgents } from "@/hooks/useAgents";
import { useCofhe } from "@/hooks/useCofhe";
import { CONCLAVE_ADDRESS, CONCLAVE_ABI } from "@/lib/contract";
import { Phase } from "@/types/round";
import { FheTypes } from "@cofhe/sdk";

interface Props { roundId: bigint }

function AgentRow({
  address, hasVoted, hasRevised, roundId,
}: {
  address: `0x${string}`;
  hasVoted: boolean;
  hasRevised: boolean;
  roundId: bigint;
}) {
  const { address: connectedAddr } = useAccount();
  const { cofheClient } = useCofhe();
  const isMe = connectedAddr?.toLowerCase() === address.toLowerCase();
  const [localScore, setLocalScore] = useState<number | null>(null);

  const { data: roundData } = useReadContract({
    address: CONCLAVE_ADDRESS, abi: CONCLAVE_ABI,
    functionName: "getRound", args: [roundId],
    query: { enabled: roundId > 0n },
  });
  const phase = (roundData as any)?.[6] as Phase | undefined;

  const { data: myHandle } = useReadContract({
    address: CONCLAVE_ADDRESS, abi: CONCLAVE_ABI,
    functionName: "getMyScoreHandle", args: [roundId],
    query: { enabled: isMe && hasVoted && localScore === null },
  });

  async function handleDecrypt() {
    if (!cofheClient || !myHandle) return;
    try {
      const value = await cofheClient.decryptForView(myHandle, FheTypes.Uint32).execute();
      setLocalScore(Number(value));
    } catch (e) { console.error("decrypt failed:", e); }
  }

  const status = !hasVoted ? "pending"
    : phase === Phase.Revision && !hasRevised ? "voted"
    : phase === Phase.Voting ? "voted"
    : "final";

  const statusColor = status === "pending" ? "#eab308"
    : status === "voted" ? "#c084fc"
    : "#22c55e";
  const statusLabel = status === "pending" ? "awaiting vote"
    : status === "voted" ? "voted"
    : "final";

  const ctxtCount = hasVoted ? (hasRevised ? 2 : 1) : 0;

  return (
    <div className={`rounded-lg border px-4 py-3 ${
      isMe ? "border-[#c084fc]/30 bg-[#c084fc]/5" : "border-[#1A1F3A] bg-[#1A1F3A]/30"
    }`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
            <span className="text-[11px] font-mono" style={{ color: statusColor }}>{statusLabel}</span>
            {isMe && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#c084fc]/10 text-[#c084fc] font-mono">you</span>
            )}
          </div>
          <p className="text-xs font-mono text-[#475569] truncate mt-0.5">{address}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-[#334155]">ciphertexts</p>
          <p className="text-sm font-mono text-[#64748b]">{ctxtCount}</p>
        </div>
      </div>

      {isMe && hasVoted && localScore === null && myHandle && (
        <button onClick={handleDecrypt}
          className="mt-2 text-[10px] px-2 py-1 rounded bg-[#1A1F3A] hover:bg-[#1A1F3A]/80 text-[#64748b] transition-colors"
        >
          Decrypt my score (local-only)
        </button>
      )}
      {localScore !== null && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] text-[#475569]">Your score:</span>
          <span className="text-sm font-mono text-[#22c55e] font-bold">{localScore}</span>
          <span className="text-[10px] text-[#334155]">/ 100</span>
        </div>
      )}
    </div>
  );
}

export function AgentList({ roundId }: Props) {
  const { agents, count } = useAgents(roundId);
  if (count === 0) return null;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold tracking-widest text-[#475569] uppercase">Participants</h2>
        <span className="text-[10px] text-[#334155] font-mono">{count} agents</span>
      </div>
      <div className="space-y-2">
        {agents.map((a) => (
          <AgentRow key={a.address} address={a.address} hasVoted={a.hasVoted} hasRevised={a.hasRevised} roundId={roundId} />
        ))}
      </div>
      <p className="mt-3 text-[10px] text-[#334155] leading-relaxed">
        Each ciphertext is an FHE-encrypted uint32. The contract performs FHE.add, FHE.sub, and FHE.div
        entirely over encrypted values.
      </p>
    </div>
  );
}
