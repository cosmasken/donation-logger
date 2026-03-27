import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DonationLoggerModule = buildModule("DonationLoggerModule", (m) => {
  const durationDays = m.getParameter("durationDays", 30);

  const donationLogger = m.contract("DonationLogger", [durationDays]);

  return { donationLogger };
});

export default DonationLoggerModule;
