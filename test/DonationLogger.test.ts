import { describe, it } from "node:test";
import { parseEther } from "viem";
import { network } from "hardhat";
import { strict as assert } from "node:assert";

const { viem, networkHelpers } = await network.connect();

describe("DonationLogger", function () {
  const DURATION_DAYS = 30;

  async function deployDonationLoggerFixture() {
    const donationLogger = await viem.deployContract("DonationLogger", [DURATION_DAYS]);
    return { donationLogger };
  }

  describe("Deployment", function () {
    it("Should set the right creator and deadline", async function () {
      const { donationLogger } = await networkHelpers.loadFixture(deployDonationLoggerFixture);
      
      const [deployer] = await viem.getWalletClients();
      const creator = await donationLogger.read.creator() as `0x${string}`;
      const deadline = await donationLogger.read.deadline() as bigint;
      
      const expectedDeadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(DURATION_DAYS * 24 * 60 * 60);
      
      assert.equal(creator.toLowerCase(), deployer.account.address.toLowerCase());
      assert(deadline >= expectedDeadline - 10n && deadline <= expectedDeadline + 10n);
    });
  });

  describe("Donations", function () {
    it("Should accept donations and emit event", async function () {
      const { donationLogger } = await networkHelpers.loadFixture(deployDonationLoggerFixture);
      
      const [, donor] = await viem.getWalletClients();
      
      await viem.assertions.emit(
        donationLogger.write.donate(["Great cause!"], { 
          value: parseEther("1"),
          account: donor.account 
        }),
        donationLogger,
        "Donated"
      );
      
      const totalRaised = await donationLogger.read.totalRaised();
      assert.equal(totalRaised, parseEther("1"));
    });

    it("Should reject zero donations", async function () {
      const { donationLogger } = await networkHelpers.loadFixture(deployDonationLoggerFixture);
      
      const [, donor] = await viem.getWalletClients();
      
      await viem.assertions.revertWith(
        donationLogger.write.donate(["No money"], { 
          value: 0n,
          account: donor.account 
        }),
        "Must send ETH"
      );
    });

    it("Should reject donations after deadline", async function () {
      const { donationLogger } = await networkHelpers.loadFixture(deployDonationLoggerFixture);
      
      const [, donor] = await viem.getWalletClients();
      
      await networkHelpers.time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);
      
      await viem.assertions.revertWith(
        donationLogger.write.donate(["Too late"], { 
          value: parseEther("1"),
          account: donor.account 
        }),
        "Campaign ended"
      );
    });

    it("Should accumulate multiple donations", async function () {
      const { donationLogger } = await networkHelpers.loadFixture(deployDonationLoggerFixture);
      
      const [, donor1, donor2] = await viem.getWalletClients();
      
      await donationLogger.write.donate(["First"], { 
        value: parseEther("1"),
        account: donor1.account 
      });
      
      await donationLogger.write.donate(["Second"], { 
        value: parseEther("2"),
        account: donor2.account 
      });
      
      const totalRaised = await donationLogger.read.totalRaised();
      assert.equal(totalRaised, parseEther("3"));
    });
  });

  describe("Withdrawals", function () {
    it("Should allow creator to withdraw after deadline", async function () {
      const { donationLogger } = await networkHelpers.loadFixture(deployDonationLoggerFixture);
      
      const [creator, donor] = await viem.getWalletClients();
      
      await donationLogger.write.donate(["Test donation"], { 
        value: parseEther("1"),
        account: donor.account 
      });
      
      await networkHelpers.time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);
      
      await viem.assertions.emit(
        donationLogger.write.withdraw(),
        donationLogger,
        "FundsWithdrawn"
      );
      
      const totalRaised = await donationLogger.read.totalRaised();
      assert.equal(totalRaised, 0n);
    });

    it("Should reject withdrawal before deadline", async function () {
      const { donationLogger } = await networkHelpers.loadFixture(deployDonationLoggerFixture);
      
      const [creator, donor] = await viem.getWalletClients();
      
      await donationLogger.write.donate(["Test donation"], { 
        value: parseEther("1"),
        account: donor.account 
      });
      
      await viem.assertions.revertWith(
        donationLogger.write.withdraw(),
        "Campaign still active"
      );
    });

    it("Should reject withdrawal by non-creator", async function () {
      const { donationLogger } = await networkHelpers.loadFixture(deployDonationLoggerFixture);
      
      const [, donor] = await viem.getWalletClients();
      
      await donationLogger.write.donate(["Test donation"], { 
        value: parseEther("1"),
        account: donor.account 
      });
      
      await networkHelpers.time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);
      
      await viem.assertions.revertWith(
        donationLogger.write.withdraw({ account: donor.account }),
        "Not creator"
      );
    });
  });

  describe("View functions", function () {
    it("Should return correct time remaining", async function () {
      const { donationLogger } = await networkHelpers.loadFixture(deployDonationLoggerFixture);
      
      const timeRemaining = await donationLogger.read.timeRemaining() as bigint;
      const expectedTime = BigInt(DURATION_DAYS * 24 * 60 * 60);
      
      assert(timeRemaining >= expectedTime - 10n && timeRemaining <= expectedTime + 10n);
      
      await networkHelpers.time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);
      
      const timeRemainingAfter = await donationLogger.read.timeRemaining();
      assert.equal(timeRemainingAfter, 0n);
    });

    it("Should return correct active status", async function () {
      const { donationLogger } = await networkHelpers.loadFixture(deployDonationLoggerFixture);
      
      const isActiveBefore = await donationLogger.read.isActive();
      assert.equal(isActiveBefore, true);
      
      await networkHelpers.time.increase(DURATION_DAYS * 24 * 60 * 60 + 1);
      
      const isActiveAfter = await donationLogger.read.isActive();
      assert.equal(isActiveAfter, false);
    });
  });
});
