const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AIModelMarketplace", function () {
  let AIModelMarketplace;
  let marketplace;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    AIModelMarketplace = await ethers.getContractFactory("AIModelMarketplace");
    [owner, addr1, addr2] = await ethers.getSigners();
    marketplace = await AIModelMarketplace.deploy();
    await marketplace.deployed();
  });

  describe("Basic functionality", function () {
    it("should be deployed successfully", async function () {
      expect(marketplace.address).to.be.properAddress;
    });

    it("should allow listing an AI model", async function () {
      const modelId = "model123";
      const price = ethers.utils.parseEther("1");
      await marketplace.listModel(modelId, price);
      const listedModel = await marketplace.getModel(modelId);
      expect(listedModel.price).to.equal(price);
    });

    it("should allow purchasing a listed model", async function () {
      const modelId = "model123";
      const price = ethers.utils.parseEther("1");
      await marketplace.listModel(modelId, price);
      await marketplace.connect(addr1).purchaseModel(modelId, { value: price });
      const purchaser = await marketplace.getModelPurchaser(modelId);
      expect(purchaser).to.equal(addr1.address);
    });

    it("should prevent purchasing unlisted models", async function () {
      await expect(
        marketplace.connect(addr1).purchaseModel("nonexistent", { value: 100 })
      ).to.be.revertedWith("Model not listed");
    });
  });
});