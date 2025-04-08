const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy BlogRegistry contract
  const BlogRegistry = await ethers.getContractFactory("BlogRegistry");
  const blogRegistry = await BlogRegistry.deploy();
  await blogRegistry.waitForDeployment();

  const address = await blogRegistry.getAddress();
  console.log("BlogRegistry deployed to:", address);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });