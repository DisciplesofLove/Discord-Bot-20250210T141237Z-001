const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DatasetGovernance", function () {
  let DatasetGovernance;
  let governance;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    DatasetGovernance = await ethers.getContractFactory("DatasetGovernance");
    [owner, addr1, addr2] = await ethers.getSigners();
    governance = await DatasetGovernance.deploy();
    await governance.deployed();
  });

  describe("Basic functionality", function () {
    it("should be deployed successfully", async function () {
      expect(governance.address).to.be.properAddress;
    });

    it("should allow proposing dataset changes", async function () {
      await governance.proposeChange("dataset1", "Add new features");
      const proposal = await governance.getProposal(0);
      expect(proposal.dataset).to.equal("dataset1");
    });

    it("should allow voting on proposals", async function () {
      await governance.proposeChange("dataset1", "Add new features");
      await governance.connect(addr1).vote(0, true);
      const hasVoted = await governance.hasVoted(0, addr1.address);
      expect(hasVoted).to.be.true;
    });

    it("should execute approved proposals", async function () {
      await governance.proposeChange("dataset1", "Add new features");
      await governance.connect(addr1).vote(0, true);
      await governance.connect(addr2).vote(0, true);
      await governance.executeProposal(0);
      const proposal = await governance.getProposal(0);
      expect(proposal.executed).to.be.true;
    });
  });
});