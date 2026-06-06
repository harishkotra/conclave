"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONCLAVE_ADDRESS, CONCLAVE_ABI } from "@/lib/contract";

export function FinalizeButton({ roundId }: { roundId: bigint }) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-blue-800/50 bg-blue-900/20 p-4">
        <p className="text-blue-400 text-sm font-medium">Round finalized. FHE average computed.</p>
      </div>
    );
  }

  return (
    <button
      onClick={() =>
        writeContract({
          address: CONCLAVE_ADDRESS,
          abi: CONCLAVE_ABI,
          functionName: "finalizeRound",
          args: [roundId],
        })
      }
      disabled={isPending || isConfirming}
      className="w-full py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
    >
      {isPending || isConfirming ? "Finalizing…" : "Finalize Round"}
    </button>
  );
}
