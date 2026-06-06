"use client";

import { useReadContract } from "wagmi";
import { CONCLAVE_ADDRESS, CONCLAVE_ABI } from "@/lib/contract";
import { Phase, roundStatus, type Round } from "@/types/round";

export function useRoundCount() {
  return useReadContract({
    address: CONCLAVE_ADDRESS,
    abi: CONCLAVE_ABI,
    functionName: "roundCount",
    query: { refetchInterval: 5000 },
  });
}

export function useRound(roundId: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONCLAVE_ADDRESS,
    abi: CONCLAVE_ABI,
    functionName: "getRound",
    args: [roundId],
    query: { refetchInterval: 5000, enabled: roundId > 0n },
  });

  let round: Round | undefined;
  if (data) {
    const [creator, taskURI, quorum, votesSubmitted, revisionsSubmitted, revisionsEnabled, phaseRaw, consensusScore, createdAt, finalizedAt, revealedAt] = data;
    const phase = phaseRaw as Phase;
    const base = { creator, taskURI, quorum: Number(quorum), votesSubmitted: Number(votesSubmitted), revisionsSubmitted: Number(revisionsSubmitted), revisionsEnabled, phase, consensusScore: Number(consensusScore), createdAt, finalizedAt, revealedAt };
    round = { id: roundId, ...base, status: roundStatus(base) };
  }

  return { round, isLoading, error, refetch };
}

export function useAgentStatus(roundId: bigint, address: `0x${string}` | undefined) {
  const { data: isAgentData } = useReadContract({
    address: CONCLAVE_ADDRESS,
    abi: CONCLAVE_ABI,
    functionName: "isAgent",
    args: [roundId, address!],
    query: { enabled: !!address && roundId > 0n, refetchInterval: 5000 },
  });

  const { data: hasVotedData } = useReadContract({
    address: CONCLAVE_ADDRESS,
    abi: CONCLAVE_ABI,
    functionName: "hasVoted",
    args: [roundId, address!],
    query: { enabled: !!address && roundId > 0n, refetchInterval: 5000 },
  });

  const { data: hasRevisedData } = useReadContract({
    address: CONCLAVE_ADDRESS,
    abi: CONCLAVE_ABI,
    functionName: "hasRevised",
    args: [roundId, address!],
    query: { enabled: !!address && roundId > 0n, refetchInterval: 5000 },
  });

  return { isAgent: !!isAgentData, hasVoted: !!hasVotedData, hasRevised: !!hasRevisedData };
}
