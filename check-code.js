import hre from "hardhat";

async function main() {
  const code = await hre.ethers.provider.getCode("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
  console.log("MUTUAL_FUND_CODE_LENGTH:", code.length);
  const code2 = await hre.ethers.provider.getCode("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  console.log("FUND_TOKEN_CODE_LENGTH:", code2.length);
}

main().catch(console.error);
