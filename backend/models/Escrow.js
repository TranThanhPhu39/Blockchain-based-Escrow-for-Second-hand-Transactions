// ============================================================
// models/Escrow.js — Schema cho Escrow (Service Contract)
// ============================================================

const mongoose = require('mongoose');
const { ESCROW_STATUS } = require('../utils/constants');

const escrowSchema = new mongoose.Schema(
  {
    // ==================== BLOCKCHAIN DATA ====================
    contractAddress: { type: String, lowercase: true },
    escrowIdOnChain:  { type: String, lowercase: true },
    txHash:           { type: String },

    // ==================== PARTIES ====================
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client is required'],
    },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ==================== JOB INFORMATION ====================
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    serviceCategory:   { type: String, trim: true },
    skillRequirements: { type: String, trim: true },
    jobDescription:    { type: String, trim: true },

    // ==================== FINANCIAL TERMS ====================
    amount: {
      type: String,
      required: [true, 'Amount is required'],
      // Stored as string to preserve BigInt precision for on-chain amounts
    },
    paymentToken:        { type: String, default: 'USDT' },
    gasFeeResponsibility:{ type: String, default: 'client' },

    // ==================== DELIVERABLES ====================
    expectedDeliverables:     { type: String, trim: true },
    deliverableFormat:        [{ type: String }],
    submissionLinkRequirement:{ type: String, default: 'required' },

    // ==================== ACCEPTANCE CRITERIA ====================
    acceptanceChecklist: [{ type: String }],
    qualityStandard:     { type: String, trim: true },
    testingRequirement:  { type: String, default: 'none' },

    // ==================== TIMELINE ====================
    deadline:          { type: Date },
    gracePeriod:       { type: Number, default: 1 },   // days
    reviewPeriod:      { type: Number, default: 3 },   // days
    autoReleasePeriod: { type: Number, default: 5 },   // days — overrides env var

    // ==================== REVISION POLICY ====================
    numberOfRevisions: { type: String, default: '2' },
    revisionScope:     { type: String, trim: true },

    // ==================== CANCELLATION POLICY ====================
    clientCancellationRule:    { type: String, trim: true },
    freelancerWithdrawalRule:  { type: String, trim: true },
    refundRule:                { type: String, trim: true },

    // ==================== EVIDENCE RULES ====================
    acceptedEvidenceTypes: [{ type: String }],
    timestampSource:       { type: String, default: 'blockchain' },
    communicationLogUsage: { type: String, default: 'allowed' },

    // ==================== DISPUTE RESOLUTION ====================
    disputeReasons:          [{ type: String }],
    evidenceUploadRequirement:{ type: String, default: 'both' },
    reviewerDecisionOptions: [{ type: String }],
    appealPolicy:            { type: String, default: 'none' },

    // ==================== LEGAL & OWNERSHIP ====================
    intellectualPropertyTransfer: { type: String },
    confidentialityRequirement:   { type: String, default: 'public' },
    commercialUsageRights:        { type: String, default: 'commercial' },

    // ==================== CONTRACT INTEGRITY ====================
    // SHA-256 hash of all off-chain metadata — can be stored on-chain as contractURI
    contractMetadataHash: { type: String },

    // ==================== STATUS ====================
    status: {
      type: String,
      enum: {
        values: Object.values(ESCROW_STATUS),
        message: 'Invalid escrow status: {VALUE}',
      },
      default: ESCROW_STATUS.CREATED,
    },

    // ==================== DELIVERABLE SUBMISSION ====================
    deliverableInfo: {
      deliverableUrl: { type: String },
      workProof:      { type: String },
      submittedAt:    { type: Date },
      note:           { type: String },
    },

    // ==================== AUTO RELEASE ====================
    autoReleaseAt: { type: Date },
  },
  { timestamps: true }
);

escrowSchema.index({ client: 1, status: 1 });
escrowSchema.index({ freelancer: 1, status: 1 });

const Escrow = mongoose.model('Escrow', escrowSchema);
module.exports = Escrow;
