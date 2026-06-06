import { ethers } from "hardhat";

async function main() {
  const Factory  = await ethers.getContractFactory("Conclave");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  console.log("Conclave deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
