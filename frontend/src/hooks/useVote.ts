"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { Encryptable, FheTypes } from "@cofhe/sdk";
import { CONCLAVE_ADDRESS, CONCLAVE_ABI } from "@/lib/contract";
import { useCofhe } from "./useCofhe";

export function useVote(roundId: bigint) {
  const { getClient } = useCofhe();
  const [encrypting, setEncrypting] = useState(false);
  const [myScoreCtHash, setMyScoreCtHash] = useState<`0x${string}` | null>(null);
  const [confirmedScore, setConfirmedScore] = useState<number | null>(null);

  const { writeContract, data: hash, isPending: isTxPending } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const { data: scoreHandle } = useReadContract({
    address: CONCLAVE_ADDRESS,
    abi: CONCLAVE_ABI,
    functionName: "getMyScoreHandle",
    args: [roundId],
    query: { enabled: isSuccess },
  });

  async function submitVote(score: number) {
    setEncrypting(true);
    try {
      const client = await getClient();
      const [encrypted] = await client.encryptInputs([Encryptable.uint32(BigInt(score))]).execute();
      writeContract({
        address: CONCLAVE_ADDRESS,
        abi: CONCLAVE_ABI,
        functionName: "submitVote",
        args: [roundId, encrypted as any],
      });
    } finally {
      setEncrypting(false);
    }
  }

  async function confirmMyScore() {
    if (!scoreHandle) return;
    try {
      const client = await getClient();
      const value = await client
        .decryptForView(scoreHandle, FheTypes.Uint32)
        .withPermit()
        .execute();
      setConfirmedScore(Number(value));
    } catch (e) {
      console.error("decryptForView failed:", e);
    }
  }

  return {
    submitVote,
    encrypting,
    isTxPending,
    isConfirming,
    isSuccess,
    confirmedScore,
    confirmMyScore,
    canConfirm: isSuccess && !!scoreHandle,
  };
}
