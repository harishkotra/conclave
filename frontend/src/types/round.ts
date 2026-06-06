export enum Phase { Voting = 0, Revision = 1, Finalized = 2, Revealed = 3 }

export type RoundStatus = "VOTING" | "REVISION" | "FINALIZED" | "REVEALED";

export interface Round {
  id: bigint;
  creator: `0x${string}`;
  taskURI: string;
  quorum: number;
  votesSubmitted: number;
  revisionsSubmitted: number;
  revisionsEnabled: boolean;
  phase: Phase;
  consensusScore: number;
  createdAt: bigint;
  finalizedAt: bigint;
  revealedAt: bigint;
  status: RoundStatus;
}

export function roundStatus(r: Omit<Round, "id" | "status">): RoundStatus {
  if (r.phase === Phase.Revealed)  return "REVEALED";
  if (r.phase === Phase.Finalized) return "FINALIZED";
  if (r.phase === Phase.Revision)  return "REVISION";
  return "VOTING";
}
