const { expect } = require("chai");
const { ethers } = require("hardhat");
// const { ethers } = require("ethers");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("ETHDaddy", async () => {
  let result, ethDaddy;
  const NAME = "Sammed";
  const SYMBOL = "ETHSAM";
  beforeEach(async () => {
    [deployer, owner1] = await ethers.getSigners();
    // console.log(signer[0].address);

    const ETHDaddy = await ethers.getContractFactory("ETHDaddy");
    ethDaddy = await ETHDaddy.deploy(NAME, SYMBOL);
    //list a domain
    const transaction = await ethDaddy
      .connect(deployer)
      .list("sam.eth", tokens(10));
    await transaction.wait();
  });
  describe("Deployment", async () => {
    it("it name", async () => {
      result = await ethDaddy.name();
      expect(result).to.equal(NAME);
      1;
    });
    it("it symbol", async () => {
      result = await ethDaddy.symbol();
      expect(result).to.equal(SYMBOL);
    });
    it("it is owner ", async () => {
      result = await ethDaddy.owner();
      expect(result).to.equal(deployer.address);
    });
    it("return the max supply", async () => {
      const result = await ethDaddy.maxSupply();
      expect(result).to.be.equal(1);
    });
    it("return the totalsupplt", async () => {
      const result = await ethDaddy.totalSupply();
      expect(result).to.be.equal(0);
    });
  });
  describe("Domain", async () => {
    it("returns domain attribute", async () => {
      let domain = await ethDaddy.getDomain(1);
      expect(domain.name).to.be.equal("sam.eth");
      expect(domain.cost).to.be.equal("10000000000000000000");
      expect(domain.isOwned).to.be.equal(false);
    });
  });
  describe("minting", () => {
    const ID = 1;
    const AMOUNT = ethers.utils.parseEther("10", "ether");

    beforeEach(async () => {
      let transaction = await ethDaddy
        .connect(owner1)
        .mint(ID, { value: AMOUNT });
      await transaction.wait();
    });
    it("check the totalsupply", async () => {
      const result = await ethDaddy.totalSupply();
      expect(result).to.be.equal(1);
    });
    it("update the owner ", async () => {
      const owner = await ethDaddy.ownerOf(ID);
      expect(owner).to.be.equal(owner1.address);
    });
    it("update the domain status", async () => {
      const result = await ethDaddy.getDomain(ID);
      expect(result.isOwned).to.be.equal(true);
    });
    it("check the balance of contract ", async () => {
      const result = await ethDaddy.getBalance();
      expect(result).to.be.equal(AMOUNT);
    });
  });
  describe("withdraw", () => {
    const ID = 1;
    const AMOUNT = ethers.utils.parseEther("10", "ether");
    let beforeBalance;
    beforeEach(async () => {
      beforeBalance = await ethers.provider.getBalance(deployer.address);
      let transaction = await ethDaddy
        .connect(owner1)
        .mint(ID, { value: AMOUNT });
      await transaction.wait();
      transaction = await ethDaddy.connect(deployer).withdraw();
      await transaction.wait();
    });
    it("update the owner balance", async () => {
      const afterBalance = await ethers.provider.getBalance(deployer.address);
      expect(afterBalance).to.be.greaterThan(beforeBalance);
    });
    it("update the contract balance ", async () => {
      const result = await ethDaddy.getBalance();
      expect(result).to.be.equal(0);
    });
  });
});
