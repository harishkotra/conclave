import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

export function createWallets(provider: ethers.JsonRpcProvider): ethers.Wallet[] {
  const keys = [
    process.env.AGENT_1_PRIVATE_KEY,
    process.env.AGENT_2_PRIVATE_KEY,
    process.env.AGENT_3_PRIVATE_KEY,
  ];

  return keys.map((key, i) => {
    if (!key) throw new Error(`AGENT_${i + 1}_PRIVATE_KEY not set in .env`);
    return new ethers.Wallet(key, provider);
  });
}
