"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONCLAVE_ADDRESS, CONCLAVE_ABI } from "@/lib/contract";
import { getCofheClient } from "@/lib/cofhe";
import { Encryptable } from "@cofhe/sdk";

export function useRevise() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { writeContractAsync, isPending, error } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  async function revise(roundId: bigint, score: number, walletClient: any) {
    setIsEncrypting(true);
    try {
      const client = await getCofheClient();
      await client.connect(walletClient.publicClient, walletClient);
      const [encrypted] = await client.encryptInputs([Encryptable.uint32(BigInt(score))]).execute();
      setIsEncrypting(false);

      const txHash = await writeContractAsync({
        address: CONCLAVE_ADDRESS,
        abi: CONCLAVE_ABI,
        functionName: "reviseVote",
        args: [roundId, encrypted],
      });
      setHash(txHash);
    } finally {
      setIsEncrypting(false);
    }
  }

  return { revise, isPending: isEncrypting || isPending || isConfirming, isSuccess, error };
}
