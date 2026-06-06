import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const KEY_ENV_VARS = [
  "AGENT_1_PRIVATE_KEY",
  "AGENT_2_PRIVATE_KEY",
  "AGENT_3_PRIVATE_KEY",
] as const;

export function createWallets(provider: ethers.JsonRpcProvider): ethers.Wallet[] {
  return KEY_ENV_VARS.map((env, i) => {
    const key = process.env[env];
    if (!key) throw new Error(`${env} not set in .env`);
    return new ethers.Wallet(key, provider);
  });
}

export function createWallet(index: number, provider: ethers.JsonRpcProvider): ethers.Wallet {
  const env = KEY_ENV_VARS[index - 1];
  if (!env) throw new Error(`Invalid agent index: ${index}. Use 1, 2, or 3.`);
  const key = process.env[env];
  if (!key) throw new Error(`${env} not set in .env`);
  return new ethers.Wallet(key, provider);
}
