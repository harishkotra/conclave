import { CONCLAVE_ABI } from "./abi";

export { CONCLAVE_ABI };

export const CONCLAVE_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? ""
) as `0x${string}`;
