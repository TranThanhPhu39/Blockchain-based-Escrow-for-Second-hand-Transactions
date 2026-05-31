// ============================================================
// services/eventListener.service.js — Lắng nghe blockchain events
//
// Đây là TRÁI TIM của Backend 3
//
// Cách hoạt động:
// 1. Smart contract emit event khi có hành động xảy ra
// 2. ethers.js lắng nghe events qua WebSocket/Polling
// 3. Callback được gọi với dữ liệu event
// 4. Backend cập nhật MongoDB để đồng bộ với blockchain
//
// Tại sao cần event listener?
// Frontend gọi smart contract trực tiếp (không qua backend)
// Backend không biết khi nào có tiền được deposit/release
// → Phải lắng nghe blockchain để biết và cập nhật DB
// ============================================================

const { getContract } = require('../config/blockchain');
const { getBlockTimestamp } = require('./blockchain.service');
const Escrow         = require('../models/Escrow');
const TransactionLog = require('../models/TransactionLog');
const { ESCROW_STATUS } = require('../utils/constants');

// ============================================================
// HELPER: Lưu TransactionLog vào DB
// Idempotent: nếu txHash đã tồn tại → bỏ qua, không throw error
// ============================================================
const saveTransactionLog = async ({
  escrowDbId,
  escrowIdOnChain,
  txHash,
  blockNumber,
  blockTimestamp,
  contractAddress,
  eventType,
  eventData,
}) => {
  try {
    // insertOne với upsert: nếu txHash đã tồn tại thì không làm gì
    // Tránh lưu trùng khi event được emit nhiều lần (edge case)
    await TransactionLog.findOneAndUpdate(
      { txHash },   // filter: tìm theo txHash
      {             // update nếu không tìm thấy
        $setOnInsert: {
          escrow: escrowDbId,
          escrowIdOnChain,
          txHash,
          blockNumber,
          blockTimestamp,
          contractAddress,
          eventType,
          eventData,
          processed: true,
        },
      },
      { upsert: true, new: true } // upsert: tạo mới nếu không tồn tại
    );
    console.log(`📝 TransactionLog saved: [${eventType}] txHash=${txHash.slice(0, 10)}...`);
  } catch (err) {
    // Log lỗi nhưng không throw — không muốn crash listener vì lỗi log
    console.error(`❌ Failed to save TransactionLog: ${err.message}`);
  }
};

// ============================================================
// HELPER: Tìm Escrow trong DB từ escrowIdOnChain
// ============================================================
const findEscrowByChainId = async (escrowIdOnChain) => {
  const escrow = await Escrow.findOne({
    escrowIdOnChain: Number(escrowIdOnChain),
  });
  if (!escrow) {
    console.warn(`⚠️  Escrow #${escrowIdOnChain} not found in DB. Event might be from old data.`);
  }
  return escrow;
};

// ============================================================
// EVENT HANDLER 1: FundsDeposited
//
// Khi nào xảy ra:
//   Frontend (Buyer) gọi smart contract createEscrow() và gửi MATIC
//   → Contract lưu escrow và emit FundsDeposited
//
// Backend cần làm:
//   1. Tìm escrow trong DB bằng escrowIdOnChain
//   2. Cập nhật status → LOCKED
//   3. Lưu txHash và contractAddress
//   4. Lưu TransactionLog
// ============================================================
const handleFundsDeposited = async (escrowId, amount, event) => {
  console.log(`\n🔔 [FundsDeposited] escrowId=${escrowId}, amount=${amount}`);

  try {
    // event.log chứa thông tin raw về event (txHash, blockNumber, address)
    const txHash      = event.log.transactionHash;
    const blockNumber = event.log.blockNumber;
    const contractAddr = event.log.address;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    // Tìm escrow trong DB
    // escrowId từ event là BigInt → convert sang Number
    const escrow = await findEscrowByChainId(Number(escrowId));
    if (!escrow) return; // Không tìm thấy → bỏ qua

    // Cập nhật escrow
    escrow.status          = ESCROW_STATUS.LOCKED;
    escrow.txHash          = txHash;
    escrow.contractAddress = contractAddr.toLowerCase();
    // escrowIdOnChain có thể chưa được set nếu frontend tạo escrow DB trước
    escrow.escrowIdOnChain = Number(escrowId);
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → LOCKED`);

    // Lưu log
    await saveTransactionLog({
      escrowDbId:     escrow._id,
      escrowIdOnChain: Number(escrowId),
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: contractAddr,
      eventType:  'FundsDeposited',
      eventData:  { amount: amount.toString() },
    });
  } catch (err) {
    console.error(`❌ handleFundsDeposited error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 2: DisputeRaised
//
// Khi nào xảy ra:
//   Frontend (Buyer) gọi smart contract raiseDispute()
//   → Contract emit DisputeRaised
//
// Backend cần làm:
//   1. Cập nhật Escrow.status → DISPUTED
//   2. Lưu TransactionLog
//   (Backend 2 sẽ xử lý dispute logic: evidence, admin resolve)
// ============================================================
const handleDisputeRaised = async (escrowId, event) => {
  console.log(`\n🔔 [DisputeRaised] escrowId=${escrowId}`);

  try {
    const txHash      = event.log.transactionHash;
    const blockNumber = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(Number(escrowId));
    if (!escrow) return;

    escrow.status = ESCROW_STATUS.DISPUTED;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → DISPUTED`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: Number(escrowId),
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'DisputeRaised',
      eventData: {},
    });
  } catch (err) {
    console.error(`❌ handleDisputeRaised error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 3: FundsReleased
//
// Khi nào xảy ra:
//   - Backend gọi contract.releaseFunds() sau khi buyer confirm
//   - Hoặc auto release sau X ngày
//
// Backend cần làm:
//   1. Cập nhật Escrow.status → RELEASED
//   2. Lưu TransactionLog
// ============================================================
const handleFundsReleased = async (escrowId, seller, amount, event) => {
  console.log(`\n🔔 [FundsReleased] escrowId=${escrowId}, seller=${seller}, amount=${amount}`);

  try {
    const txHash      = event.log.transactionHash;
    const blockNumber = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(Number(escrowId));
    if (!escrow) return;

    escrow.status = ESCROW_STATUS.RELEASED;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → RELEASED`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: Number(escrowId),
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'FundsReleased',
      eventData: { seller, amount: amount.toString() },
    });
  } catch (err) {
    console.error(`❌ handleFundsReleased error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 4: BuyerRefunded
//
// Khi nào xảy ra:
//   Admin gọi contract.refundBuyer() sau khi resolve dispute
//
// Backend cần làm:
//   1. Cập nhật Escrow.status → REFUNDED
//   2. Lưu TransactionLog
// ============================================================
const handleBuyerRefunded = async (escrowId, buyer, amount, event) => {
  console.log(`\n🔔 [BuyerRefunded] escrowId=${escrowId}, buyer=${buyer}, amount=${amount}`);

  try {
    const txHash      = event.log.transactionHash;
    const blockNumber = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(Number(escrowId));
    if (!escrow) return;

    escrow.status = ESCROW_STATUS.REFUNDED;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → REFUNDED`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: Number(escrowId),
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'BuyerRefunded',
      eventData: { buyer, amount: amount.toString() },
    });
  } catch (err) {
    console.error(`❌ handleBuyerRefunded error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 5: AutoReleased
//
// Khi nào xảy ra:
//   Smart contract tự động release sau X ngày không có action
// ============================================================
const handleAutoReleased = async (escrowId, amount, event) => {
  console.log(`\n🔔 [AutoReleased] escrowId=${escrowId}, amount=${amount}`);

  try {
    const txHash      = event.log.transactionHash;
    const blockNumber = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(Number(escrowId));
    if (!escrow) return;

    escrow.status = ESCROW_STATUS.RELEASED;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → RELEASED (auto)`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: Number(escrowId),
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'AutoReleased',
      eventData: { amount: amount.toString() },
    });
  } catch (err) {
    console.error(`❌ handleAutoReleased error: ${err.message}`);
  }
};

// ============================================================
// MAIN: Khởi động tất cả event listeners
//
// contract.on('EventName', callback):
//   - ethers.js kết nối WebSocket tới Alchemy
//   - Mỗi khi contract emit event, callback được gọi ngay lập tức
//   - Các tham số = các field trong event (theo thứ tự trong ABI)
//   - Tham số CUỐI CÙNG luôn là `event` object (metadata)
// ============================================================
const startEventListeners = () => {
  const contract = getContract();

  console.log('👂 Starting blockchain event listeners...');

  // Listener: FundsDeposited(uint256 escrowId, uint256 amount)
  contract.on('FundsDeposited', handleFundsDeposited);

  // Listener: DisputeRaised(uint256 escrowId)
  contract.on('DisputeRaised', handleDisputeRaised);

  // Listener: FundsReleased(uint256 escrowId, address seller, uint256 amount)
  contract.on('FundsReleased', handleFundsReleased);

  // Listener: BuyerRefunded(uint256 escrowId, address buyer, uint256 amount)
  contract.on('BuyerRefunded', handleBuyerRefunded);

  // Listener: AutoReleased(uint256 escrowId, uint256 amount)
  contract.on('AutoReleased', handleAutoReleased);

  // Xử lý lỗi kết nối
  // Provider emit 'error' khi mất kết nối, rate limit, ...
  contract.runner.provider.on('error', (err) => {
    console.error(`❌ Provider error: ${err.message}`);
  });

  console.log('✅ Event listeners registered:');
  console.log('   - FundsDeposited  → LOCKED');
  console.log('   - DisputeRaised   → DISPUTED');
  console.log('   - FundsReleased   → RELEASED');
  console.log('   - BuyerRefunded   → REFUNDED');
  console.log('   - AutoReleased    → RELEASED');
};

/**
 * Dừng tất cả listeners (dùng khi shutdown server)
 */
const stopEventListeners = () => {
  const contract = getContract();
  contract.removeAllListeners();
  console.log('🛑 Event listeners stopped.');
};

module.exports = { startEventListeners, stopEventListeners };
