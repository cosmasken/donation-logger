import { network } from "hardhat";

const { viem, networkName } = await network.connect();

console.log(`🚀 Deploying DonationLogger to ${networkName}...`);

const donationLogger = await viem.deployContract("DonationLogger");

console.log("✅ DonationLogger deployed at:", donationLogger.address);
console.log("🌐 View on explorer: https://explorer.testnet.rsk.co/address/" + donationLogger.address);

// Test it works
console.log("🧪 Testing contract...");
const tx = await donationLogger.write.createCampaign(["Test Campaign"]);
console.log("✅ Test campaign created!");

console.log("🎉 Deployment successful!");
