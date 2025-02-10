const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AIParticipation", function () {
  let AIParticipation;
  let JoyToken;
  let participation;
  let joyToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    JoyToken = await ethers.getContractFactory("JoyToken");
    AIParticipation = await ethers.getContractFactory("AIParticipation");
    
    [owner, addr1, addr2] = await ethers.getSigners();
    
    joyToken = await JoyToken.deploy();
    await joyToken.deployed();
    
    participation = await AIParticipation.deploy(joyToken.address);
    await participation.deployed();
  });

  describe("Participation Recording", function () {
    it("should record participation points correctly", async function () {
      await participation.recordParticipation(addr1.address, 100);
      expect(await participation.getParticipationPoints(addr1.address)).to.equal(100);
    });

    it("should enforce cooldown period", async function () {
      await participation.recordParticipation(addr1.address, 100);
      await expect(
        participation.recordParticipation(addr1.address, 100)
      ).to.be.revertedWith("Cooldown period not elapsed");
    });
  });

  describe("Reward Distribution", function () {
    it("should distribute rewards correctly", async function () {
      const rewardAmount = ethers.utils.parseEther("100");
      await joyToken.transfer(participation.address, rewardAmount);
      
      await participation.distributeRewards(addr1.address, rewardAmount);
      expect(await joyToken.balanceOf(addr1.address)).to.equal(rewardAmount);
    });
  });
});