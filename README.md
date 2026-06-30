  Blockchain-based Escrow for Second-hand Transactions

## Project Overview

Blockchain-based Escrow for Second-hand Transactions là nền tảng trung gian thanh toán dành cho giao dịch hàng hóa đã qua sử dụng. Hệ thống sử dụng Smart Contract để giữ tiền của người mua cho đến khi hàng hóa được xác nhận giao thành công hoặc tranh chấp được giải quyết.

Mục tiêu của dự án:

- Giảm thiểu lừa đảo trong giao dịch đồ cũ.
- Tăng niềm tin giữa Buyer và Seller.
- Tự động hóa quá trình release/refund bằng Smart Contract.
- Lưu trữ minh bạch lịch sử giao dịch trên Blockchain.
- Cung cấp cơ chế xử lý tranh chấp và bằng chứng số.

---

# System Architecture

```text
Buyer/Seller
     ↓
Frontend (Next.js + React)
     ↓
Backend API (Node.js + Express + MongoDB)
     ↓
Blockchain Integration (Ethers.js)
     ↓
Smart Contracts (Solidity + Hardhat)
     ↓
Polygon Amoy Testnet
```

---

# Technology Stack

## Frontend

- Next.js
- React
- Tailwind CSS
- Zustand
- Ethers.js
- MetaMask / WalletConnect

## Backend

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer
- Cloudinary
- Nodemailer

## Smart Contracts

- Solidity
- Hardhat
- OpenZeppelin
- Chai / Mocha

## Blockchain

- Polygon Amoy Testnet
- Alchemy RPC

---

# Repository Structure

```text
Blockchain-based-Escrow-for-Second-hand-Transactions/
│
├── frontend/          # Web application
├── backend/           # REST API + MongoDB + Blockchain integration
├── smart-contract/    # Solidity smart contracts
├── docs/              # Technical documentation
├── .github/           # GitHub workflows and templates
│
├── README.md
├── .gitignore
└── LICENSE
```

---

# Core Features

- User Registration and Login
- Wallet Connection
- Create Escrow
- Deposit Stablecoin
- Shipping Information Tracking
- Confirm Delivery
- Raise Dispute
- Upload Evidence
- Admin/Juror Resolution
- Smart Contract Release/Refund
- Transaction Logs
- Notifications

---

# User Roles

| Role | Description |
|------|------------|
| Buyer | Người mua tạo escrow và nạp tiền |
| Seller | Người bán giao hàng và nhận tiền |
| Admin | Quản trị viên xử lý tranh chấp |
| Juror (Optional) | Hội đồng bỏ phiếu giải quyết tranh chấp |

---

# Project Modules

## Frontend

- User Interface
- Wallet Integration
- API Communication
- State Management

## Backend

- Authentication
- Escrow APIs
- Dispute APIs
- Upload APIs
- Notification APIs
- Blockchain Event Listener

## Smart Contracts

- Escrow Contract
- Dispute Contract
- Treasury Contract

---

# Development Team Responsibilities

## Frontend Team (3 Members)

- Authentication & Wallet UI
- Dashboard & Escrow Pages
- Dispute UI & Notifications

## Backend Team (3 Members)

- Backend 1: Core API & Database
- Backend 2: Dispute & File Storage
- Backend 3: Blockchain Integration

## Smart Contract Team (2 Members)

- Contract 1: Escrow Core Logic
- Contract 2: Dispute Logic, Treasury, Testing

---

# Git Workflow

## Main Branches

```text
main    → Stable release / Demo version
dev     → Integration branch
```

## Feature Branches

```text
frontend/*
backend/*
contract/*
```

### Examples

```text
frontend/dashboard
backend/auth-escrow
backend/dispute-upload
backend/blockchain-listener
contract/escrow-core
contract/dispute-treasury
```

---

# Development Process

```text
1. Pull latest code from dev
2. Create personal feature branch
3. Implement assigned tasks
4. Commit and push changes
5. Open Pull Request to dev
6. Code review and merge
7. Test integrated system
8. Merge dev to main for release
```

---

# Escrow Lifecycle

```text
CREATED
→ LOCKED
→ SHIPPED
→ RELEASED
```

If dispute occurs:

```text
CREATED
→ LOCKED
→ SHIPPED
→ DISPUTED
→ RELEASED or REFUNDED
```

---

# Backend Status Constants

```text
CREATED
LOCKED
SHIPPED
DISPUTED
RELEASED
REFUNDED
CANCELLED
```

---

# Quick Start

## Clone Repository

```bash
git clone https://github.com/TranThanhPhu39/Blockchain-based-Escrow-for-Second-hand-Transactions.git
cd Blockchain-based-Escrow-for-Second-hand-Transactions
```

## Switch to Development Branch

```bash
git checkout dev
git pull origin dev
```

---

# Module Setup

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
npm install
npm run dev
```

## Smart Contracts

```bash
cd smart-contract
npm install
npx hardhat compile
```

---

# Documentation

| File | Description |
|------|------------|
| `backend/README.md` | Backend architecture and responsibilities |
| `frontend/README.md` | Frontend structure and conventions |
| `smart-contract/README.md` | Smart contract architecture |
| `docs/architecture.md` | Overall system architecture |
| `docs/workflow.md` | Git and team workflow |

---

# MVP Workflow

```text
Buyer registers and logs in
→ Connects wallet
→ Creates escrow
→ Deposits funds into smart contract
→ Seller ships product
→ Buyer confirms delivery OR raises dispute
→ Admin resolves dispute
→ Smart contract releases funds or refunds buyer
→ Backend updates transaction history
→ Notifications sent to users
```

---

# Future Enhancements

- Decentralized Jury Voting
- Chainlink Automation
- Embedded Wallets
- Gas Relayer
- Mobile Application
- Cross-border Stablecoin Support

---

# License

MIT License