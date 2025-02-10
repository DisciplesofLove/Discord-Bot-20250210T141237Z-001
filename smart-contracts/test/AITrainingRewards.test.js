const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AITrainingRewards", function () {
  let AITrainingRewards;
  let rewards;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    AITrainingRewards = await ethers.getContractFactory("AITrainingRewards");
    [owner, addr1, addr2] = await ethers.getSigners();
    rewards = await AITrainingRewards.deploy();
    await rewards.deployed();
  });

  describe("Basic functionality", function () {
    it("should be deployed successfully", async function () {
      expect(rewards.address).to.be.properAddress;
    });

    it("should allow setting reward rates", async function () {
      await rewards.setRewardRate(100);
      expect(await rewards.getRewardRate()).to.equal(100);
    });

    it("should calculate rewards correctly", async function () {
      await rewards.setRewardRate(100);
      const trainingTime = 3600; // 1 hour
      const expectedReward = 100 * trainingTime;
      expect(await rewards.calculateReward(trainingTime)).to.equal(expectedReward);
    });

    it("should track training sessions", async function () {
      await rewards.recordTrainingSession(addr1.address, 3600);
      expect(await rewards.getTrainingTime(addr1.address)).to.equal(3600);
    });
  });
});