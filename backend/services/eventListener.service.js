// ============================================================
// services/eventListener.service.js — Lắng nghe blockchain events
//
// Đây là TRÁI TIM của Backend 3
//
// Dùng polling (queryFilter theo block range) thay vì contract.on(),
// để tránh lỗi "filter not found" với Alchemy và các RPC provider khác.
// lastProcessedBlock được lưu vào MongoDB (EventListenerState) để không
// bỏ lỡ event khi server restart.
//
// LƯU Ý VỀ contractId (bytes32):
// Luôn giữ dạng hex string lowercase, không convert qua Number().
// Field tương ứng trong MongoDB (Escrow.escrowIdOnChain) cũng là String.
// ============================================================

const { getContract }       = require('../config/blockchain');
const { getBlockTimestamp } = require('./blockchain.service');
const Escrow               = require('../models/Escrow');
const TransactionLog       = require('../models/TransactionLog');
const EventListenerState   = require('../models/EventListenerState');
const { ESCROW_STATUS }     = require('../utils/constants');

// ============================================================
// CONFIG polling
// ============================================================
const POLL_INTERVAL_MS = 8000;
// Alchemy free tier giới hạn eth_getLogs CHỈ 10 block/request trên Polygon Amoy
const MAX_BLOCK_RANGE  = 10;

// Tên các event cần lắng nghe — PHẢI khớp 1:1 với EscrowContract.sol
const EVENT_NAMES = [
  'ContractCreated',
  'FundsDeposited',
  'ContractAccepted',
  'WorkSubmitted',
  'RevisionRequested',
  'WorkApproved',
  'DisputeRaised',
  'DefenseUploaded',
  'DisputeVoteCast',
  'DisputeFinalized',
  'FundsReleased',
  'ClientRefunded',
  'ContractCancelled',
  'FreelancerBanned',
];

let pollTimer = null;
let isPolling = false;

const normalizeId = (id) => String(id).toLowerCase();

// ============================================================
// HELPER: Lưu TransactionLog (idempotent theo txHash)
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
    await TransactionLog.findOneAndUpdate(
      { txHash },
      {
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
      { upsert: true, new: true }
    );
    console.log(`📝 TransactionLog saved: [${eventType}] txHash=${txHash.slice(0, 10)}...`);
  } catch (err) {
    console.error(`❌ Failed to save TransactionLog: ${err.message}`);
  }
};

// ============================================================
// HELPER: Tìm Escrow trong DB từ contractId (bytes32 hex string)
// ============================================================
const findEscrowByChainId = async (contractId) => {
  const normalizedId = normalizeId(contractId);
  const escrow = await Escrow.findOne({ escrowIdOnChain: normalizedId });
  if (!escrow) {
    console.warn(`⚠️  Escrow ${normalizedId} not found in DB. Event might be from old data.`);
  }
  return escrow;
};

// ============================================================
// HELPER: race với timeout
// ============================================================
const withTimeout = (promise, ms, label) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout sau ${ms}ms: ${label}`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

// ============================================================
// EVENT HANDLER 1: ContractCreated
// event ContractCreated(bytes32 indexed contractId, address indexed client,
//                       address indexed freelancer, uint256 amount)
// → Link contractId vào DB record
// ============================================================
const handleContractCreated = async (contractId, client, freelancer, amount, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [ContractCreated] contractId=${normalizedId}, client=${client}, freelancer=${freelancer}, amount=${amount}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const contractAddr   = event.log.address;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    escrow.contractAddress = contractAddr.toLowerCase();
    escrow.escrowIdOnChain = normalizedId;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} linked to on-chain contractId ${normalizedId}`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: contractAddr,
      eventType: 'ContractCreated',
      eventData: { client, freelancer, amount: amount.toString() },
    });
  } catch (err) {
    console.error(`❌ handleContractCreated error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 2: FundsDeposited
// event FundsDeposited(bytes32 indexed contractId, address indexed client, uint256 amount)
// → status LOCKED
// ============================================================
const handleFundsDeposited = async (contractId, client, amount, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [FundsDeposited] contractId=${normalizedId}, amount=${amount}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const contractAddr   = event.log.address;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    escrow.status          = ESCROW_STATUS.LOCKED;
    escrow.txHash          = txHash;
    escrow.contractAddress = contractAddr.toLowerCase();
    escrow.escrowIdOnChain = normalizedId;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → LOCKED`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: contractAddr,
      eventType: 'FundsDeposited',
      eventData: { client, amount: amount.toString() },
    });
  } catch (err) {
    console.error(`❌ handleFundsDeposited error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 3: ContractAccepted
// event ContractAccepted(bytes32 indexed contractId, address indexed freelancer)
// → status IN_PROGRESS (freelancer đã nhận việc)
// ============================================================
const handleContractAccepted = async (contractId, freelancer, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [ContractAccepted] contractId=${normalizedId}, freelancer=${freelancer}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    escrow.status = ESCROW_STATUS.IN_PROGRESS;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → IN_PROGRESS`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'ContractAccepted',
      eventData: { freelancer },
    });
  } catch (err) {
    console.error(`❌ handleContractAccepted error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 4: WorkSubmitted
// event WorkSubmitted(bytes32 indexed contractId, address indexed freelancer,
//                     string submissionURI, uint256 revisionRound)
// → status SUBMITTED
// ============================================================
const handleWorkSubmitted = async (contractId, freelancer, submissionURI, revisionRound, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [WorkSubmitted] contractId=${normalizedId}, freelancer=${freelancer}, round=${revisionRound}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    escrow.status = ESCROW_STATUS.SUBMITTED;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → SUBMITTED`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'WorkSubmitted',
      eventData: { freelancer, submissionURI, revisionRound: revisionRound.toString() },
    });
  } catch (err) {
    console.error(`❌ handleWorkSubmitted error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 5: RevisionRequested
// event RevisionRequested(bytes32 indexed contractId, address indexed client,
//                         string reason, uint256 revisionCount)
// → status IN_PROGRESS (freelancer cần làm lại)
// ============================================================
const handleRevisionRequested = async (contractId, client, reason, revisionCount, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [RevisionRequested] contractId=${normalizedId}, client=${client}, round=${revisionCount}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    escrow.status = ESCROW_STATUS.IN_PROGRESS;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → IN_PROGRESS (revision #${revisionCount})`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'RevisionRequested',
      eventData: { client, reason, revisionCount: revisionCount.toString() },
    });
  } catch (err) {
    console.error(`❌ handleRevisionRequested error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 6: WorkApproved
// event WorkApproved(bytes32 indexed contractId, address indexed client)
// → chỉ log (FundsReleased sẽ set status RELEASED)
// ============================================================
const handleWorkApproved = async (contractId, client, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [WorkApproved] contractId=${normalizedId}, client=${client}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'WorkApproved',
      eventData: { client },
    });
  } catch (err) {
    console.error(`❌ handleWorkApproved error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 7: DisputeRaised
// event DisputeRaised(bytes32 indexed contractId, address indexed client,
//                     string evidenceURI)
// → status DISPUTED
// ============================================================
const handleDisputeRaised = async (contractId, client, evidenceURI, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [DisputeRaised] contractId=${normalizedId}, client=${client}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    escrow.status = ESCROW_STATUS.DISPUTED;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → DISPUTED`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'DisputeRaised',
      eventData: { client, evidenceURI },
    });
  } catch (err) {
    console.error(`❌ handleDisputeRaised error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 8: DefenseUploaded
// event DefenseUploaded(bytes32 indexed contractId, address indexed freelancer,
//                       string defenseURI)
// → chỉ log
// ============================================================
const handleDefenseUploaded = async (contractId, freelancer, defenseURI, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [DefenseUploaded] contractId=${normalizedId}, freelancer=${freelancer}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'DefenseUploaded',
      eventData: { freelancer, defenseURI },
    });
  } catch (err) {
    console.error(`❌ handleDefenseUploaded error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 9: DisputeVoteCast
// event DisputeVoteCast(bytes32 indexed contractId, address indexed reviewer,
//                       bool voteForFreelancer)
// → chỉ log
// ============================================================
const handleDisputeVoteCast = async (contractId, reviewer, voteForFreelancer, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [DisputeVoteCast] contractId=${normalizedId}, reviewer=${reviewer}, voteForFreelancer=${voteForFreelancer}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'DisputeVoteCast',
      eventData: { reviewer, voteForFreelancer },
    });
  } catch (err) {
    console.error(`❌ handleDisputeVoteCast error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 10: DisputeFinalized
// event DisputeFinalized(bytes32 indexed contractId, bool freelancerWon,
//                        uint256 votesForFreelancer, uint256 votesForClient)
// → chỉ log (FundsReleased hoặc ClientRefunded sẽ set status)
// ============================================================
const handleDisputeFinalized = async (contractId, freelancerWon, votesForFreelancer, votesForClient, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [DisputeFinalized] contractId=${normalizedId}, freelancerWon=${freelancerWon}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'DisputeFinalized',
      eventData: {
        freelancerWon,
        votesForFreelancer: votesForFreelancer.toString(),
        votesForClient: votesForClient.toString(),
      },
    });
  } catch (err) {
    console.error(`❌ handleDisputeFinalized error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 11: FundsReleased
// event FundsReleased(bytes32 indexed contractId, address indexed freelancer,
//                     uint256 amount)
// → status RELEASED
// ============================================================
const handleFundsReleased = async (contractId, freelancer, amount, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [FundsReleased] contractId=${normalizedId}, freelancer=${freelancer}, amount=${amount}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    escrow.status = ESCROW_STATUS.RELEASED;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → RELEASED`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'FundsReleased',
      eventData: { freelancer, amount: amount.toString() },
    });
  } catch (err) {
    console.error(`❌ handleFundsReleased error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 12: ClientRefunded
// event ClientRefunded(bytes32 indexed contractId, address indexed client,
//                      uint256 amount)
// → status REFUNDED
// ============================================================
const handleClientRefunded = async (contractId, client, amount, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [ClientRefunded] contractId=${normalizedId}, client=${client}, amount=${amount}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    escrow.status = ESCROW_STATUS.REFUNDED;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → REFUNDED`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'ClientRefunded',
      eventData: { client, amount: amount.toString() },
    });
  } catch (err) {
    console.error(`❌ handleClientRefunded error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 13: ContractCancelled
// event ContractCancelled(bytes32 indexed contractId)
// → status CANCELLED
// ============================================================
const handleContractCancelled = async (contractId, event) => {
  const normalizedId = normalizeId(contractId);
  console.log(`\n🔔 [ContractCancelled] contractId=${normalizedId}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    const escrow = await findEscrowByChainId(normalizedId);
    if (!escrow) return;

    escrow.status = ESCROW_STATUS.CANCELLED;
    await escrow.save();
    console.log(`✅ Escrow ${escrow._id} → CANCELLED`);

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'ContractCancelled',
      eventData: {},
    });
  } catch (err) {
    console.error(`❌ handleContractCancelled error: ${err.message}`);
  }
};

// ============================================================
// EVENT HANDLER 14: FreelancerBanned
// event FreelancerBanned(address indexed freelancer, bytes32 indexed triggerContractId)
// → chỉ log
// ============================================================
const handleFreelancerBanned = async (freelancer, triggerContractId, event) => {
  const normalizedContractId = normalizeId(triggerContractId);
  console.log(`\n🔔 [FreelancerBanned] freelancer=${freelancer}, triggerContractId=${normalizedContractId}`);

  try {
    const txHash         = event.log.transactionHash;
    const blockNumber    = event.log.blockNumber;
    const blockTimestamp = await getBlockTimestamp(blockNumber);

    // Tìm escrow trigger để lưu log (best-effort)
    const escrow = await findEscrowByChainId(normalizedContractId);
    if (!escrow) return;

    await saveTransactionLog({
      escrowDbId:      escrow._id,
      escrowIdOnChain: normalizedContractId,
      txHash,
      blockNumber,
      blockTimestamp,
      contractAddress: event.log.address,
      eventType: 'FreelancerBanned',
      eventData: { freelancer, triggerContractId: normalizedContractId },
    });
  } catch (err) {
    console.error(`❌ handleFreelancerBanned error: ${err.message}`);
  }
};

// ============================================================
// Map tên event → handler tương ứng
// ============================================================
const EVENT_HANDLERS = {
  ContractCreated:    handleContractCreated,
  FundsDeposited:     handleFundsDeposited,
  ContractAccepted:   handleContractAccepted,
  WorkSubmitted:      handleWorkSubmitted,
  RevisionRequested:  handleRevisionRequested,
  WorkApproved:       handleWorkApproved,
  DisputeRaised:      handleDisputeRaised,
  DefenseUploaded:    handleDefenseUploaded,
  DisputeVoteCast:    handleDisputeVoteCast,
  DisputeFinalized:   handleDisputeFinalized,
  FundsReleased:      handleFundsReleased,
  ClientRefunded:     handleClientRefunded,
  ContractCancelled:  handleContractCancelled,
  FreelancerBanned:   handleFreelancerBanned,
};

// ============================================================
// DB: Đọc/lưu lastProcessedBlock (với timeout để tránh Mongoose buffering)
// ============================================================
const getLastProcessedBlock = async (contractAddress, provider) => {
  const addr = contractAddress.toLowerCase();
  let state = await withTimeout(
    EventListenerState.findOne({ contractAddress: addr }),
    8000,
    'MongoDB findOne (EventListenerState)'
  );

  if (!state) {
    const currentBlock = await provider.getBlockNumber();
    state = await withTimeout(
      EventListenerState.create({
        contractAddress: addr,
        lastProcessedBlock: currentBlock,
      }),
      8000,
      'MongoDB create (EventListenerState)'
    );
    console.log(`🆕 EventListenerState khởi tạo lần đầu tại block ${currentBlock}`);
  }

  return state.lastProcessedBlock;
};

const saveLastProcessedBlock = async (contractAddress, blockNumber) => {
  const addr = contractAddress.toLowerCase();
  await withTimeout(
    EventListenerState.findOneAndUpdate(
      { contractAddress: addr },
      { $set: { lastProcessedBlock: blockNumber } },
      { upsert: true }
    ),
    8000,
    'MongoDB findOneAndUpdate (EventListenerState)'
  );
};

// ============================================================
// POLL: 1 lần poll — query tất cả event trong khoảng block rồi dispatch
// ============================================================
const pollOnce = async () => {
  if (isPolling) {
    console.log('⏳ Đợt poll trước vẫn đang chạy, bỏ qua lần này...');
    return;
  }
  isPolling = true;

  try {
    await withTimeout(pollOnceInner(), 30000, 'pollOnce');
  } catch (err) {
    console.error(`❌ pollOnce error: ${err.message}`);
  } finally {
    isPolling = false;
  }
};

const pollOnceInner = async () => {
  const contract = getContract();
  const provider = contract.runner.provider;
  const contractAddress = await contract.getAddress();

  const currentBlock = await provider.getBlockNumber();
  let fromBlock = (await getLastProcessedBlock(contractAddress, provider)) + 1;

  if (fromBlock > currentBlock) {
    return;
  }

  while (fromBlock <= currentBlock) {
    const toBlock = Math.min(fromBlock + MAX_BLOCK_RANGE - 1, currentBlock);

    const rawLogs = await contract.queryFilter('*', fromBlock, toBlock);
    const allLogs = rawLogs.filter(
      (log) => log.fragment && EVENT_HANDLERS[log.fragment.name]
    );

    if (allLogs.length > 0) {
      console.log(`📦 Poll [${fromBlock}-${toBlock}]: tìm thấy ${allLogs.length} event`);
    }

    allLogs.sort((a, b) =>
      a.blockNumber !== b.blockNumber
        ? a.blockNumber - b.blockNumber
        : a.index - b.index
    );

    for (const log of allLogs) {
      const eventName = log.fragment.name;
      const handler = EVENT_HANDLERS[eventName];
      if (!handler) continue;

      const args = [...log.args, { log }];
      await handler(...args);
    }

    await saveLastProcessedBlock(contractAddress, toBlock);
    fromBlock = toBlock + 1;

    if (fromBlock <= currentBlock) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
};

// ============================================================
// MAIN: Khởi động event listener
// ============================================================
const startEventListeners = async () => {
  console.log('👂 Starting blockchain event listeners (polling mode)...');

  await pollOnce();
  pollTimer = setInterval(pollOnce, POLL_INTERVAL_MS);

  console.log(`✅ Event listeners registered (poll mỗi ${POLL_INTERVAL_MS / 1000}s):`);
  EVENT_NAMES.forEach((name) => console.log(`   - ${name}`));
};

const stopEventListeners = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  console.log('🛑 Event listeners stopped.');
};

module.exports = { startEventListeners, stopEventListeners };
