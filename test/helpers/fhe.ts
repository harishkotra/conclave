import hre from "hardhat";
import { Encryptable, FheTypes } from "@cofhe/sdk";
import { mock_expectPlaintext } from "@cofhe/hardhat-plugin";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";

export async function cofheClient(signer: HardhatEthersSigner) {
  return hre.cofhe.createClientWithBatteries(signer);
}

export async function encryptScore(signer: HardhatEthersSigner, score: number) {
  const client = await cofheClient(signer);
  const [encrypted] = await client.encryptInputs([Encryptable.uint32(BigInt(score))]).execute();
  return encrypted;
}

export async function expectPlaintext(
  provider: HardhatEthersProvider,
  ctHash: bigint | string,
  expected: bigint
) {
  return mock_expectPlaintext(provider, ctHash, expected);
}

export { FheTypes };
