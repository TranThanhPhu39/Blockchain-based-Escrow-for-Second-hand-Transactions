const express = require('express');
const { ethers } = require('ethers');
const { faucetLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

const MOCK_USDC_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// Ưu tiên env var, fallback về địa chỉ deploy thực tế trên Amoy
const MOCK_USDC_ADDRESS = process.env.MOCK_USDC_ADDRESS || "0x715143e3223040A204C27375368FD15F26B4c066";
const FAUCET_AMOUNT = ethers.parseUnits("10000", 6); // 10,000 mUSDC

// POST /api/faucet  { address: "0x..." }
// faucetLimiter: 5 req/hour per IP — mỗi call tốn gas admin wallet
router.post('/', faucetLimiter, async (req, res) => {
  const { address } = req.body;
  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ message: 'Invalid wallet address' });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    const token = new ethers.Contract(MOCK_USDC_ADDRESS, MOCK_USDC_ABI, signer);

    const currentBalance = await token.balanceOf(address);
    const threshold = ethers.parseUnits("1000", 6);
    if (currentBalance >= threshold) {
      return res.json({ message: 'Already has sufficient balance', minted: false });
    }

    const tx = await token.mint(address, FAUCET_AMOUNT, { gasLimit: 100000 });
    await tx.wait();

    res.json({ message: 'Minted 10,000 mUSDC', txHash: tx.hash, minted: true });
  } catch (err) {
    console.error('[faucet] error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
