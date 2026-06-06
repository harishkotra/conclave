"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONCLAVE_ADDRESS, CONCLAVE_ABI } from "@/lib/contract";

export function FinalizeButton({ roundId }: { roundId: bigint }) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  if (isSuccess) {
    return (
      <div className="rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5 px-4 py-3">
        <p className="text-xs text-[#22c55e] font-medium">Round finalized. FHE average computed.</p>
      </div>
    );
  }

  return (
    <button
      onClick={() => writeContract({ address: CONCLAVE_ADDRESS, abi: CONCLAVE_ABI, functionName: "finalizeRound", args: [roundId] })}
      disabled={isPending || isConfirming}
      className="w-full text-[11px] px-3 py-2 rounded-md border border-[#1A1F3A] text-[#64748b] hover:text-[#94a3b8] hover:border-[#334155] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
    >
      {isPending || isConfirming ? "Finalizing…" : "Finalize Round"}
    </button>
  );
}
