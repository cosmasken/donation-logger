import { network } from "hardhat";

const { viem, networkName } = await network.connect();

console.log(`🚀 Deploying DonationLogger to ${networkName}...`);

const DURATION_DAYS = 30; // 30 day campaign
const donationLogger = await viem.deployContract("DonationLogger", [DURATION_DAYS]);

console.log("✅ DonationLogger deployed at:", donationLogger.address);
console.log("🌐 View on explorer: https://explorer.testnet.rsk.co/address/" + donationLogger.address);
console.log(`📅 Campaign duration: ${DURATION_DAYS} days`);

console.log("🎉 Deployment successful!");
