const { getContract } = require('../config/blockchain');
const Escrow = require('../models/Escrow');
const { ESCROW_STATUS } = require('../utils/constants');

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
let releaseTimer = null;

const runAutoRelease = async () => {
  try {
    const overdueEscrows = await Escrow.find({
      status: ESCROW_STATUS.SUBMITTED,
      autoReleaseAt: { $lte: new Date() },
      escrowIdOnChain: { $exists: true, $ne: null },
    });

    if (overdueEscrows.length === 0) return;

    console.log(`\n⏰ Auto-release: ${overdueEscrows.length} overdue escrow(s) found`);
    const contract = getContract();

    for (const escrow of overdueEscrows) {
      try {
        console.log(`🔄 Auto-releasing escrow ${escrow._id}...`);
        const tx = await contract.autoRelease(escrow.escrowIdOnChain);
        await tx.wait();
        console.log(`✅ Auto-released escrow ${escrow._id}, tx=${tx.hash}`);
        // DB status update happens via FundsReleased event → handleFundsReleased
      } catch (err) {
        console.error(`❌ Auto-release failed for ${escrow._id}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`❌ runAutoRelease error: ${err.message}`);
  }
};

const startAutoRelease = () => {
  console.log('⏰ Auto-release service started (checks every hour)');
  runAutoRelease();
  releaseTimer = setInterval(runAutoRelease, CHECK_INTERVAL_MS);
};

const stopAutoRelease = () => {
  if (releaseTimer) {
    clearInterval(releaseTimer);
    releaseTimer = null;
  }
};

module.exports = { startAutoRelease, stopAutoRelease };
