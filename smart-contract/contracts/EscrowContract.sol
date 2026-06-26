// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable}       from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20}        from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20}     from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * Freelance escrow with the following state machine:
 *
 *  Client createContract
 *        │
 *        ▼
 *  Freelancer acceptContract  ──(5 days no response)──▶ triggerAutoban → CANCELLED + banned
 *        │
 *        ▼
 *  Client deposit
 *        │
 *        ▼
 *  Freelancer submitWork  ◀──────────────────────────────────────┐
 *        │                                                        │
 *        ▼                                                        │
 *  Client review                                                  │
 *   ├── approveWork   → RELEASED (freelancer paid)               │
 *   ├── requestRevision → REVISION_REQUESTED ──────────────────-─┘
 *   └── raiseDispute (+ evidence) → DISPUTED
 *            │
 *            ▼
 *   Freelancer uploadDefense → REVIEWING_DISPUTE
 *            │
 *            ▼
 *   Reviewers castDisputeVote (max 9 reviewers, 3-day window)
 *   Each vote includes a structured Dispute Checklist:
 *     • deliverablesMatch
 *     • acceptanceCriteriaMet
 *     • deadlineMet
 *     • revisionHistoryReviewed
 *     • submissionHistoryReviewed
 *     • blockchainTimelineReviewed
 *     • evidenceReviewed
 *     • voteForFreelancer + reason
 *            │
 *            ▼
 *   finalizeDispute  (majority wins → RELEASED or REFUNDED)
 */
contract EscrowContract is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Constants ────────────────────────────────────────────────────────────
    uint256 public constant ACCEPT_DEADLINE = 5 days;
    uint256 public constant DISPUTE_WINDOW  = 3 days;
    uint256 public constant MAX_REVIEWERS   = 9;

    // ── State machine ────────────────────────────────────────────────────────
    enum Status {
        CREATED,             // Client created, waiting for freelancer
        ACCEPTED,            // Freelancer accepted
        DEPOSITED,           // Client deposited funds
        SUBMITTED,           // Freelancer submitted work (client reviewing)
        REVISION_REQUESTED,  // Client wants changes
        DISPUTED,            // Client raised dispute, waiting for freelancer defense
        REVIEWING_DISPUTE,   // Reviewers voting on dispute
        RELEASED,            // Funds sent to freelancer
        REFUNDED,            // Funds returned to client
        CANCELLED            // Contract cancelled
    }

    // ── Structs ──────────────────────────────────────────────────────────────

    struct ContractData {
        bool    exists;
        address client;
        address freelancer;
        uint256 amount;
        Status  status;
        string  contractURI;    // off-chain: requirements, deliverables, deadline
        string  submissionURI;  // latest work submission
        uint256 revisionCount;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // One reviewer's checklist + vote
    struct ReviewVote {
        bool   voted;
        // Checklist items
        bool   deliverablesMatch;
        bool   acceptanceCriteriaMet;
        bool   deadlineMet;
        bool   revisionHistoryReviewed;
        bool   submissionHistoryReviewed;
        bool   blockchainTimelineReviewed;
        bool   evidenceReviewed;
        // Decision
        bool   voteForFreelancer;
        string reason;
        uint256 timestamp;
    }

    struct DisputeData {
        string  clientEvidenceURI;
        string  freelancerDefenseURI;
        uint256 raisedAt;
        uint256 reviewStartedAt;
        uint256 votesForFreelancer;
        uint256 votesForClient;
        address[] reviewerList;
        mapping(address => ReviewVote) votes;
        bool    finalized;
    }

    // ── Storage ──────────────────────────────────────────────────────────────
    IERC20 public immutable paymentToken;

    mapping(bytes32  => ContractData) private contracts;
    mapping(bytes32  => DisputeData)  private disputes;
    mapping(address  => bool)         public  bannedFreelancers;
    mapping(address  => bool)         public  isReviewer;

    // ── Events ───────────────────────────────────────────────────────────────
    event ContractCreated(bytes32 indexed contractId, address indexed client, address indexed freelancer, uint256 amount);
    event ContractAccepted(bytes32 indexed contractId, address indexed freelancer);
    event FundsDeposited(bytes32 indexed contractId, address indexed client, uint256 amount);
    event WorkSubmitted(bytes32 indexed contractId, address indexed freelancer, string submissionURI, uint256 revisionRound);
    event WorkApproved(bytes32 indexed contractId, address indexed client);
    event RevisionRequested(bytes32 indexed contractId, address indexed client, string reason, uint256 revisionCount);
    event DisputeRaised(bytes32 indexed contractId, address indexed client, string evidenceURI);
    event DefenseUploaded(bytes32 indexed contractId, address indexed freelancer, string defenseURI);
    event DisputeVoteCast(bytes32 indexed contractId, address indexed reviewer, bool voteForFreelancer);
    event DisputeFinalized(bytes32 indexed contractId, bool freelancerWon, uint256 votesForFreelancer, uint256 votesForClient);
    event FundsReleased(bytes32 indexed contractId, address indexed freelancer, uint256 amount);
    event ClientRefunded(bytes32 indexed contractId, address indexed client, uint256 amount);
    event FreelancerBanned(address indexed freelancer, bytes32 indexed triggerContractId);
    event ContractCancelled(bytes32 indexed contractId);
    event ReviewerAdded(address indexed reviewer);
    event ReviewerRemoved(address indexed reviewer);

    // ── Errors ───────────────────────────────────────────────────────────────
    error ContractAlreadyExists(bytes32 contractId);
    error ContractNotFound(bytes32 contractId);
    error InvalidAddress();
    error InvalidAmount();
    error InvalidStatus(Status current);
    error Unauthorized();
    error FreelancerIsBanned(address freelancer);
    error DeadlineNotReached();
    error DeadlineExpired();
    error AlreadyVoted();
    error MaxReviewersReached();
    error NotAReviewer();
    error AlreadyFinalized();
    error ReviewWindowOpen();
    error ReviewerAlreadyAdded();
    error ReviewerNotFound();

    // ── Constructor ──────────────────────────────────────────────────────────
    constructor(address tokenAddress, address initialOwner) Ownable(initialOwner) {
        if (tokenAddress == address(0) || initialOwner == address(0)) revert InvalidAddress();
        paymentToken = IERC20(tokenAddress);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  REVIEWER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    function addReviewer(address reviewer) external onlyOwner {
        if (reviewer == address(0))  revert InvalidAddress();
        if (isReviewer[reviewer])    revert ReviewerAlreadyAdded();
        isReviewer[reviewer] = true;
        emit ReviewerAdded(reviewer);
    }

    function removeReviewer(address reviewer) external onlyOwner {
        if (!isReviewer[reviewer]) revert ReviewerNotFound();
        isReviewer[reviewer] = false;
        emit ReviewerRemoved(reviewer);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  STEP 1 — CLIENT CREATES CONTRACT
    // ═══════════════════════════════════════════════════════════════════════

    function createContract(
        bytes32        contractId,
        address        freelancer,
        uint256        amount,
        string calldata contractURI   // IPFS / off-chain URI with requirements
    ) external {
        if (contracts[contractId].exists) revert ContractAlreadyExists(contractId);
        if (contractId == bytes32(0) || freelancer == address(0) || freelancer == msg.sender)
            revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (bannedFreelancers[freelancer]) revert FreelancerIsBanned(freelancer);

        contracts[contractId] = ContractData({
            exists:        true,
            client:        msg.sender,
            freelancer:    freelancer,
            amount:        amount,
            status:        Status.CREATED,
            contractURI:   contractURI,
            submissionURI: "",
            revisionCount: 0,
            createdAt:     block.timestamp,
            updatedAt:     block.timestamp
        });

        emit ContractCreated(contractId, msg.sender, freelancer, amount);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  STEP 2 — FREELANCER ACCEPTS (must be within 5 days)
    // ═══════════════════════════════════════════════════════════════════════

    function acceptContract(bytes32 contractId) external {
        ContractData storage c = _get(contractId);
        _onlyFreelancer(c);
        _requireStatus(c, Status.CREATED);
        if (block.timestamp > c.createdAt + ACCEPT_DEADLINE) revert DeadlineExpired();

        c.status    = Status.ACCEPTED;
        c.updatedAt = block.timestamp;
        emit ContractAccepted(contractId, msg.sender);
    }

    /**
     * @notice Anyone can call this after 5 days if the freelancer never accepted.
     *         Bans the freelancer and cancels the contract.
     */
    function triggerAutoban(bytes32 contractId) external {
        ContractData storage c = _get(contractId);
        _requireStatus(c, Status.CREATED);
        if (block.timestamp <= c.createdAt + ACCEPT_DEADLINE) revert DeadlineNotReached();

        c.status    = Status.CANCELLED;
        c.updatedAt = block.timestamp;

        if (!bannedFreelancers[c.freelancer]) {
            bannedFreelancers[c.freelancer] = true;
            emit FreelancerBanned(c.freelancer, contractId);
        }

        emit ContractCancelled(contractId);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  STEP 3 — CLIENT DEPOSITS FUNDS
    // ═══════════════════════════════════════════════════════════════════════

    function deposit(bytes32 contractId) external nonReentrant {
        ContractData storage c = _get(contractId);
        _onlyClient(c);
        _requireStatus(c, Status.ACCEPTED);

        c.status    = Status.DEPOSITED;
        c.updatedAt = block.timestamp;
        paymentToken.safeTransferFrom(msg.sender, address(this), c.amount);

        emit FundsDeposited(contractId, msg.sender, c.amount);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  STEP 4 — FREELANCER SUBMITS WORK (initial or after revision)
    // ═══════════════════════════════════════════════════════════════════════

    function submitWork(bytes32 contractId, string calldata submissionURI) external {
        ContractData storage c = _get(contractId);
        _onlyFreelancer(c);
        if (c.status != Status.DEPOSITED && c.status != Status.REVISION_REQUESTED)
            revert InvalidStatus(c.status);

        c.submissionURI = submissionURI;
        c.status        = Status.SUBMITTED;
        c.updatedAt     = block.timestamp;

        emit WorkSubmitted(contractId, msg.sender, submissionURI, c.revisionCount);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  STEP 5a — CLIENT APPROVES → funds released to freelancer
    // ═══════════════════════════════════════════════════════════════════════

    function approveWork(bytes32 contractId) external nonReentrant {
        ContractData storage c = _get(contractId);
        _onlyClient(c);
        _requireStatus(c, Status.SUBMITTED);

        emit WorkApproved(contractId, msg.sender);
        _releaseFunds(contractId, c);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  STEP 5b — CLIENT REQUESTS REVISION → freelancer must resubmit
    // ═══════════════════════════════════════════════════════════════════════

    function requestRevision(bytes32 contractId, string calldata reason) external {
        ContractData storage c = _get(contractId);
        _onlyClient(c);
        _requireStatus(c, Status.SUBMITTED);

        c.revisionCount++;
        c.status    = Status.REVISION_REQUESTED;
        c.updatedAt = block.timestamp;

        emit RevisionRequested(contractId, msg.sender, reason, c.revisionCount);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  STEP 5c — CLIENT RAISES DISPUTE (uploads evidence at the same time)
    // ═══════════════════════════════════════════════════════════════════════

    function raiseDispute(bytes32 contractId, string calldata evidenceURI) external {
        ContractData storage c = _get(contractId);
        _onlyClient(c);
        _requireStatus(c, Status.SUBMITTED);

        c.status    = Status.DISPUTED;
        c.updatedAt = block.timestamp;

        DisputeData storage d = disputes[contractId];
        d.clientEvidenceURI = evidenceURI;
        d.raisedAt          = block.timestamp;

        emit DisputeRaised(contractId, msg.sender, evidenceURI);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  DISPUTE — FREELANCER UPLOADS DEFENSE → opens voting window
    // ═══════════════════════════════════════════════════════════════════════

    function uploadDefense(bytes32 contractId, string calldata defenseURI) external {
        ContractData storage c = _get(contractId);
        _onlyFreelancer(c);
        _requireStatus(c, Status.DISPUTED);

        DisputeData storage d = disputes[contractId];
        d.freelancerDefenseURI = defenseURI;
        d.reviewStartedAt      = block.timestamp;

        c.status    = Status.REVIEWING_DISPUTE;
        c.updatedAt = block.timestamp;

        emit DefenseUploaded(contractId, msg.sender, defenseURI);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  DISPUTE — REVIEWER CASTS VOTE WITH CHECKLIST
    //  Max 9 reviewers · 3-day window · majority wins
    // ═══════════════════════════════════════════════════════════════════════

    function castDisputeVote(
        bytes32        contractId,
        // ── Dispute Checklist ──────────────────
        bool deliverablesMatch,
        bool acceptanceCriteriaMet,
        bool deadlineMet,
        bool revisionHistoryReviewed,
        bool submissionHistoryReviewed,
        bool blockchainTimelineReviewed,
        bool evidenceReviewed,
        // ── Decision ──────────────────────────
        bool           voteForFreelancer,
        string calldata reason
    ) external nonReentrant {
        if (!isReviewer[msg.sender]) revert NotAReviewer();

        ContractData storage c = _get(contractId);
        _requireStatus(c, Status.REVIEWING_DISPUTE);

        DisputeData storage d = disputes[contractId];
        if (d.finalized)                                            revert AlreadyFinalized();
        if (block.timestamp > d.reviewStartedAt + DISPUTE_WINDOW)  revert DeadlineExpired();
        if (d.votes[msg.sender].voted)                              revert AlreadyVoted();
        if (d.reviewerList.length >= MAX_REVIEWERS)                 revert MaxReviewersReached();

        d.votes[msg.sender] = ReviewVote({
            voted:                      true,
            deliverablesMatch:          deliverablesMatch,
            acceptanceCriteriaMet:      acceptanceCriteriaMet,
            deadlineMet:                deadlineMet,
            revisionHistoryReviewed:    revisionHistoryReviewed,
            submissionHistoryReviewed:  submissionHistoryReviewed,
            blockchainTimelineReviewed: blockchainTimelineReviewed,
            evidenceReviewed:           evidenceReviewed,
            voteForFreelancer:          voteForFreelancer,
            reason:                     reason,
            timestamp:                  block.timestamp
        });

        d.reviewerList.push(msg.sender);
        if (voteForFreelancer) d.votesForFreelancer++;
        else                   d.votesForClient++;

        emit DisputeVoteCast(contractId, msg.sender, voteForFreelancer);

        // Auto-finalize when all 9 slots are filled
        if (d.reviewerList.length == MAX_REVIEWERS) {
            _finalizeDispute(contractId, c, d);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  DISPUTE — ANYONE FINALIZES AFTER 3-DAY WINDOW CLOSES
    // ═══════════════════════════════════════════════════════════════════════

    function finalizeDispute(bytes32 contractId) external nonReentrant {
        ContractData storage c = _get(contractId);
        _requireStatus(c, Status.REVIEWING_DISPUTE);

        DisputeData storage d = disputes[contractId];
        if (d.finalized) revert AlreadyFinalized();
        if (
            d.reviewerList.length < MAX_REVIEWERS &&
            block.timestamp <= d.reviewStartedAt + DISPUTE_WINDOW
        ) revert ReviewWindowOpen();

        _finalizeDispute(contractId, c, d);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  CANCEL (before deposit only)
    // ═══════════════════════════════════════════════════════════════════════

    function cancelContract(bytes32 contractId) external {
        ContractData storage c = _get(contractId);
        _onlyClient(c);
        if (c.status != Status.CREATED && c.status != Status.ACCEPTED)
            revert InvalidStatus(c.status);

        c.status    = Status.CANCELLED;
        c.updatedAt = block.timestamp;
        emit ContractCancelled(contractId);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function getContract(bytes32 contractId) external view returns (ContractData memory) {
        ContractData storage c = contracts[contractId];
        if (!c.exists) revert ContractNotFound(contractId);
        return c;
    }

    function getDisputeSummary(bytes32 contractId) external view returns (
        string memory clientEvidenceURI,
        string memory freelancerDefenseURI,
        uint256       raisedAt,
        uint256       reviewStartedAt,
        uint256       votesForFreelancer,
        uint256       votesForClient,
        uint256       totalVotes,
        bool          finalized
    ) {
        DisputeData storage d = disputes[contractId];
        return (
            d.clientEvidenceURI,
            d.freelancerDefenseURI,
            d.raisedAt,
            d.reviewStartedAt,
            d.votesForFreelancer,
            d.votesForClient,
            d.reviewerList.length,
            d.finalized
        );
    }

    function getDisputeReviewers(bytes32 contractId) external view returns (address[] memory) {
        return disputes[contractId].reviewerList;
    }

    function getDisputeVote(bytes32 contractId, address reviewer) external view returns (ReviewVote memory) {
        return disputes[contractId].votes[reviewer];
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    function _finalizeDispute(
        bytes32 contractId,
        ContractData storage c,
        DisputeData  storage d
    ) private {
        d.finalized = true;
        // Majority wins; tie → refund client
        bool freelancerWon = d.votesForFreelancer > d.votesForClient;

        emit DisputeFinalized(contractId, freelancerWon, d.votesForFreelancer, d.votesForClient);

        if (freelancerWon) _releaseFunds(contractId, c);
        else               _refundClient(contractId, c);
    }

    function _releaseFunds(bytes32 contractId, ContractData storage c) private {
        c.status    = Status.RELEASED;
        c.updatedAt = block.timestamp;
        paymentToken.safeTransfer(c.freelancer, c.amount);
        emit FundsReleased(contractId, c.freelancer, c.amount);
    }

    function _refundClient(bytes32 contractId, ContractData storage c) private {
        c.status    = Status.REFUNDED;
        c.updatedAt = block.timestamp;
        paymentToken.safeTransfer(c.client, c.amount);
        emit ClientRefunded(contractId, c.client, c.amount);
    }

    function _get(bytes32 contractId) private view returns (ContractData storage) {
        ContractData storage c = contracts[contractId];
        if (!c.exists) revert ContractNotFound(contractId);
        return c;
    }

    function _onlyClient(ContractData storage c) private view {
        if (msg.sender != c.client) revert Unauthorized();
    }

    function _onlyFreelancer(ContractData storage c) private view {
        if (msg.sender != c.freelancer) revert Unauthorized();
    }

    function _requireStatus(ContractData storage c, Status expected) private view {
        if (c.status != expected) revert InvalidStatus(c.status);
    }
}
