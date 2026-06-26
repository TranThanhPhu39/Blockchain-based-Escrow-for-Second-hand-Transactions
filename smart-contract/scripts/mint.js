const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../deployments/amoy.json"), "utf8")
  );

  const [owner] = await hre.ethers.getSigners();
  const recipient = process.env.RECIPIENT;
  const amount = process.env.AMOUNT || "10000";

  if (!recipient) {
    console.error("Usage: RECIPIENT=0x... AMOUNT=10000 npx hardhat run scripts/mint.js --network amoy");
    process.exit(1);
  }

  const mockUSDC = await hre.ethers.getContractAt("MockUSDC", deployment.mockUSDC, owner);
  const amountBig = hre.ethers.parseUnits(amount, 6);

  console.log(`Minting ${amount} mUSDC to ${recipient}...`);
  const tx = await mockUSDC.mint(recipient, amountBig);
  await tx.wait();
  console.log(`Done! Tx: ${tx.hash}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
