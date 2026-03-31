import hre from "hardhat";

async function main() {
  console.log("Deploying CampaignFactory...");

  const factory = await hre.viem.deployContract("CampaignFactory");
  
  console.log("CampaignFactory deployed to:", factory.address);
  
  console.log("Verify with:");
  console.log(`npx hardhat verify --network rootstockTestnet ${factory.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
