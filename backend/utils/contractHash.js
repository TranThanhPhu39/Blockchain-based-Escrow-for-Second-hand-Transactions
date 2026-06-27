// ============================================================
// utils/contractHash.js — SHA-256 hash của các điều khoản hợp đồng
//
// Mục đích: phát hiện nếu dữ liệu hợp đồng trong DB bị thay đổi sau khi tạo.
// Hash được tính server-side từ các field bất biến (immutable contract terms)
// và lưu vào Escrow.contractMetadataHash lúc tạo.
//
// Cách hoạt động:
//   1. Chuẩn hoá tất cả field bất biến (null→'', Date→ISO, Array→sorted)
//   2. JSON.stringify theo thứ tự key cố định → chuỗi canonical
//   3. SHA-256(chuỗi canonical) → 64 ký tự hex
//
// Bất kỳ thay đổi nào với các field này sau khi tạo sẽ làm hash không khớp,
// cho phép frontend/admin phát hiện tampering.
// ============================================================

const crypto = require('crypto');

// Danh sách field bất biến — thứ tự CỐ ĐỊNH (quan trọng cho determinism)
// Không bao gồm: _id, client, freelancer, status, deliverableInfo,
//               escrowIdOnChain, txHash, autoReleaseAt, contractMetadataHash
// (những field này thay đổi theo vòng đời hợp đồng — không phải "điều khoản")
const HASH_FIELDS = [
  // Job Information
  'serviceName', 'serviceCategory', 'skillRequirements', 'jobDescription',
  // Financial Terms
  'amount', 'paymentToken', 'gasFeeResponsibility',
  // Deliverables
  'expectedDeliverables', 'deliverableFormat', 'submissionLinkRequirement',
  // Acceptance Criteria
  'acceptanceChecklist', 'qualityStandard', 'testingRequirement',
  // Timeline
  'deadline', 'gracePeriod', 'reviewPeriod', 'autoReleasePeriod',
  // Revision Policy
  'numberOfRevisions', 'revisionScope',
  // Cancellation Policy
  'clientCancellationRule', 'freelancerWithdrawalRule', 'refundRule',
  // Evidence Rules
  'acceptedEvidenceTypes', 'timestampSource', 'communicationLogUsage',
  // Dispute Resolution
  'disputeReasons', 'evidenceUploadRequirement', 'reviewerDecisionOptions', 'appealPolicy',
  // Legal & Ownership
  'intellectualPropertyTransfer', 'confidentialityRequirement', 'commercialUsageRights',
];

/**
 * Chuẩn hoá 1 giá trị field thành string để đưa vào hash
 * — null/undefined → ''
 * — Date → ISO 8601 string
 * — Array → sort rồi join bằng '|'
 * — Còn lại → String(val)
 */
const normalizeValue = (val) => {
  if (val === undefined || val === null) return '';
  if (val instanceof Date) return val.toISOString();
  if (Array.isArray(val)) return [...val].sort().join('|');
  return String(val);
};

/**
 * Tính SHA-256 hash của các điều khoản hợp đồng bất biến.
 *
 * @param {Object} escrowData - Mongoose document hoặc plain object chứa các field escrow
 * @returns {string} 64-char hex string (SHA-256)
 */
const computeContractHash = (escrowData) => {
  const canonical = {};
  for (const field of HASH_FIELDS) {
    canonical[field] = normalizeValue(escrowData[field]);
  }
  // JSON.stringify với key order cố định (HASH_FIELDS) → đảm bảo deterministic
  const payload = JSON.stringify(canonical);
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
};

module.exports = { computeContractHash, HASH_FIELDS };
