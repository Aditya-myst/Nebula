import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Deploy FundToken
  console.log("📝 Deploying FundToken...");
  const FundToken = await hre.ethers.getContractFactory("FundToken");
  const fundToken = await FundToken.deploy();
  await fundToken.waitForDeployment();
  const fundTokenAddress = await fundToken.getAddress();
  console.log("✅ FundToken deployed to:", fundTokenAddress);

  // Deploy MutualFundDistribution (7 days interval)
  console.log("\n📝 Deploying MutualFundDistribution...");
  const MutualFundDistribution = await hre.ethers.getContractFactory("MutualFundDistribution");
  const distributionInterval = 0; // Set to 0 for instant testing
  const mutualFund = await MutualFundDistribution.deploy(fundTokenAddress, distributionInterval);
  await mutualFund.waitForDeployment();
  const mutualFundAddress = await mutualFund.getAddress();
  console.log("✅ MutualFundDistribution deployed to:", mutualFundAddress);

  // Save deployment info
  const deploymentInfo = {
    fundToken: fundTokenAddress,
    mutualFund: mutualFundAddress,
    network: hre.network.name,
    deployer: (await hre.ethers.getSigners())[0].address
  };

  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment info saved to deployment-info.json");
  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });