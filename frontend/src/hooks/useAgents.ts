"use client";

import { useReadContracts } from "wagmi";
import { CONCLAVE_ADDRESS, CONCLAVE_ABI } from "@/lib/contract";

export interface AgentInfo {
  address: `0x${string}`;
  hasVoted: boolean;
  hasRevised: boolean;
}

export function useAgents(roundId: bigint) {
  const { data: agents } = useReadContracts({
    contracts: [
      {
        address: CONCLAVE_ADDRESS,
        abi: CONCLAVE_ABI,
        functionName: "getAgents",
        args: [roundId],
      },
    ],
    query: { enabled: roundId > 0n },
  }) as any;

  const agentAddresses: `0x${string}`[] = agents?.[0]?.result ?? [];

  const statusContracts = agentAddresses.flatMap((addr) => [
    { address: CONCLAVE_ADDRESS, abi: CONCLAVE_ABI, functionName: "hasVoted", args: [roundId, addr] },
    { address: CONCLAVE_ADDRESS, abi: CONCLAVE_ABI, functionName: "hasRevised", args: [roundId, addr] },
  ]);

  const { data: statusResults } = useReadContracts({
    contracts: statusContracts,
    query: { enabled: agentAddresses.length > 0, refetchInterval: 5000 },
  }) as any;

  const agentList: AgentInfo[] = agentAddresses.map((addr, i) => ({
    address: addr,
    hasVoted: !!statusResults?.[i * 2]?.result,
    hasRevised: !!statusResults?.[i * 2 + 1]?.result,
  }));

  return { agents: agentList, count: agentAddresses.length };
}
