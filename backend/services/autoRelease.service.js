// NOTE: getContract() đã bị xóa khỏi import vì EscrowContract v2 không có
// hàm autoRelease(). approveWork() có modifier _onlyClient — backend dùng
// admin wallet không thể trigger thay client. Xem comment trong runAutoRelease.

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

    console.log(
      `\n⏰ [AutoRelease] ${overdueEscrows.length} overdue escrow(s) found — client action required`
    );

    for (const escrow of overdueEscrows) {
      // EscrowContract v2 không có hàm autoRelease().
      // approveWork() có _onlyClient modifier → admin wallet không thể gọi thay client.
      // Funds chỉ được release khi:
      //   1. Client tự gọi approveWork() qua MetaMask trên frontend
      //   2. Dispute được finalize với kết quả freelancer thắng
      // → Chỉ log cảnh báo để admin theo dõi. Notification sẽ được thêm ở Phase 3.
      console.warn(
        `⚠️  [AutoRelease] Escrow ${escrow._id} ("${escrow.serviceName || 'N/A'}") ` +
          `overdue since ${escrow.autoReleaseAt?.toISOString() ?? 'unknown'}. ` +
          `Client must approve on-chain. escrowIdOnChain: ${escrow.escrowIdOnChain}`
      );
    }
  } catch (err) {
    console.error(`❌ [AutoRelease] error: ${err.message}`);
  }
};

const startAutoRelease = () => {
  console.log('⏰ [AutoRelease] Monitor started — checks every hour for overdue SUBMITTED escrows');
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
