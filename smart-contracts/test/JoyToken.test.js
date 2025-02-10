const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JoyToken", function () {
  let JoyToken;
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    JoyToken = await ethers.getContractFactory("JoyToken");
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await JoyToken.deploy();
    await token.deployed();
  });

  describe("Deployment", function () {
    it("should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });

    it("should have correct initial supply", async function () {
      const expectedSupply = ethers.utils.parseEther("1000000000"); // 1 billion tokens
      expect(await token.totalSupply()).to.equal(expectedSupply);
    });
  });

  describe("Transactions", function () {
    it("should transfer tokens between accounts", async function () {
      const amount = ethers.utils.parseEther("50");
      await token.transfer(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });

    it("should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      await expect(
        token.connect(addr1).transfer(addr2.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Minting", function () {
    it("should allow owner to mint new tokens", async function () {
      const amount = ethers.utils.parseEther("100");
      await token.mint(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });

    it("should prevent non-owners from minting", async function () {
      const amount = ethers.utils.parseEther("100");
      await expect(
        token.connect(addr1).mint(addr2.address, amount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Burning", function () {
    it("should allow users to burn their tokens", async function () {
      const amount = ethers.utils.parseEther("100");
      await token.transfer(addr1.address, amount);
      await token.connect(addr1).burn(amount);
      expect(await token.balanceOf(addr1.address)).to.equal(0);
    });
  });
});