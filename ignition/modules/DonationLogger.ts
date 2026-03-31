import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DonationLoggerModule = buildModule("DonationLoggerModule", (m) => {
  const durationSeconds = m.getParameter("durationSeconds", 86400); // Default 24 hours

  const donationLogger = m.contract("DonationLogger", [durationSeconds]);

  return { donationLogger };
});

export default DonationLoggerModule;
