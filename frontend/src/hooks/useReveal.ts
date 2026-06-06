"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { toHex } from "viem";
import { CONCLAVE_ADDRESS, CONCLAVE_ABI } from "@/lib/contract";
import { useCofhe } from "./useCofhe";

export function useReveal(roundId: bigint) {
  const { getClient } = useCofhe();
  const [decrypting, setDecrypting] = useState(false);

  const { data: ctHash } = useReadContract({
    address: CONCLAVE_ADDRESS,
    abi: CONCLAVE_ABI,
    functionName: "getConsensusHandle",
    args: [roundId],
  });

  const { writeContract, data: hash, isPending: isTxPending } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  async function revealConsensus() {
    if (!ctHash) return;
    setDecrypting(true);
    try {
      const client = await getClient();
      const result = await client.decryptForTx(ctHash).withoutPermit().execute();
      const ctHashBytes32 =
        typeof result.ctHash === "bigint"
          ? toHex(result.ctHash, { size: 32 })
          : (result.ctHash as `0x${string}`);
      writeContract({
        address: CONCLAVE_ADDRESS,
        abi: CONCLAVE_ABI,
        functionName: "revealConsensus",
        args: [roundId, ctHashBytes32, Number(result.decryptedValue), result.signature],
      });
    } finally {
      setDecrypting(false);
    }
  }

  return { revealConsensus, decrypting, isTxPending, isConfirming, isSuccess };
}
