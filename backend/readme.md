# Backend Architecture Documentation

## 1. Overview

Backend của dự án **Blockchain-based Escrow for Second-hand Transactions** được xây dựng bằng:

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Ethers.js
- Cloudinary
- Multer

Backend chịu trách nhiệm:

- Xác thực người dùng
- Quản lý escrow
- Upload bằng chứng
- Xử lý tranh chấp
- Gửi thông báo
- Đồng bộ dữ liệu blockchain
- Lưu lịch sử giao dịch

---

## 2. Backend Folder Structure

```text
backend/
├── package.json
├── server.js
├── .env
├── .gitignore
│
├── src/
│   ├── app.js
│   │
│   ├── config/
│   │   ├── db.js
│   │   ├── cloudinary.js
│   │   └── blockchain.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Escrow.js
│   │   ├── Dispute.js
│   │   ├── TransactionLog.js
│   │   └── Notification.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── escrow.routes.js
│   │   ├── dispute.routes.js
│   │   ├── upload.routes.js
│   │   ├── transaction.routes.js
│   │   └── notification.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── escrow.controller.js
│   │   ├── dispute.controller.js
│   │   ├── upload.controller.js
│   │   ├── transaction.controller.js
│   │   └── notification.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── error.middleware.js
│   │   └── upload.middleware.js
│   │
│   ├── services/
│   │   ├── blockchain.service.js
│   │   ├── eventListener.service.js
│   │   ├── notification.service.js
│   │   └── fileStorage.service.js
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── asyncHandler.js
│   │   └── constants.js
│   │
│   └── abi/
│       └── EscrowContract.json
```

---

## 3. Architecture Pattern

```text
Route → Controller → Service → Model → Database / Blockchain
```

Ví dụ:

```text
POST /api/escrows
        ↓
escrow.routes.js
        ↓
escrow.controller.js
        ↓
blockchain.service.js
        ↓
Escrow Smart Contract
        ↓
Escrow Model - MongoDB
```

---

## 4. Folder Responsibilities

| Folder/File | Vai trò |
|---|---|
| `server.js` | Khởi động backend server |
| `src/app.js` | Cấu hình Express app, middleware, routes |
| `src/config/` | Cấu hình database, Cloudinary, blockchain |
| `src/models/` | Định nghĩa MongoDB schemas |
| `src/routes/` | Khai báo API endpoints |
| `src/controllers/` | Xử lý request/response |
| `src/middleware/` | Middleware xác thực, phân quyền, upload, lỗi |
| `src/services/` | Xử lý business logic, blockchain, notification, file storage |
| `src/utils/` | Hàm tiện ích dùng chung |
| `src/abi/` | Lưu ABI của smart contract |

---

## 5. Development Responsibilities

Backend được chia thành 3 module lớn, mỗi thành viên chịu trách nhiệm một nhóm chức năng độc lập.

---

### Backend 1: Core API & Database

#### Responsibilities

Backend 1 phụ trách:

- Khởi tạo server và kết nối MongoDB
- Authentication
- User Management
- Escrow APIs
- JWT Authentication Middleware
- Role-based Authorization

#### Files Responsible

```text
server.js
src/config/db.js

src/models/
├── User.js
└── Escrow.js

src/routes/
├── auth.routes.js
└── escrow.routes.js

src/controllers/
├── auth.controller.js
└── escrow.controller.js

src/middleware/
├── auth.middleware.js
└── role.middleware.js
```

#### APIs Implemented

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

POST  /api/escrows
GET   /api/escrows
GET   /api/escrows/:id
PATCH /api/escrows/:id/shipping
```

#### Expected Output

- User đăng ký / đăng nhập
- Buyer tạo escrow
- Buyer/Seller xem danh sách escrow
- Seller cập nhật thông tin giao hàng

---

### Backend 2: Dispute & File Storage

#### Responsibilities

Backend 2 phụ trách:

- Upload file
- Lưu ảnh sản phẩm, ảnh giao hàng, bằng chứng
- Dispute APIs
- Notification APIs

#### Files Responsible

```text
src/models/
├── Dispute.js
└── Notification.js

src/routes/
├── dispute.routes.js
├── upload.routes.js
└── notification.routes.js

src/controllers/
├── dispute.controller.js
├── upload.controller.js
└── notification.controller.js

src/config/
└── cloudinary.js

src/services/
├── fileStorage.service.js
└── notification.service.js

src/middleware/
└── upload.middleware.js
```

#### APIs Implemented

```http
POST /api/upload

POST  /api/disputes
GET   /api/disputes
GET   /api/disputes/:id
POST  /api/disputes/:id/response
PATCH /api/disputes/:id/resolve

GET   /api/notifications
PATCH /api/notifications/:id/read
```

#### Expected Output

- Buyer mở tranh chấp
- Buyer upload bằng chứng
- Seller phản hồi tranh chấp
- Admin xem và xử lý dispute
- User nhận thông báo trong app

---

### Backend 3: Blockchain Integration

#### Responsibilities

Backend 3 phụ trách:

- Kết nối smart contract
- Đọc trạng thái escrow từ blockchain
- Gọi hàm release/refund
- Lắng nghe event blockchain
- Lưu transaction logs

#### Files Responsible

```text
src/config/
└── blockchain.js

src/models/
└── TransactionLog.js

src/routes/
└── transaction.routes.js

src/controllers/
└── transaction.controller.js

src/services/
├── blockchain.service.js
└── eventListener.service.js

src/abi/
└── EscrowContract.json
```

#### Core Functions

```javascript
getEscrowStatus(escrowId)
releaseFunds(escrowId)
refundBuyer(escrowId)
```

#### Events Listened

```text
EscrowCreated
FundsDeposited
DisputeRaised
FundsReleased
BuyerRefunded
AutoReleased
```

#### Event → Database Status

| Blockchain Event | Escrow Status |
|---|---|
| `FundsDeposited` | `LOCKED` |
| `DisputeRaised` | `DISPUTED` |
| `FundsReleased` | `RELEASED` |
| `BuyerRefunded` | `REFUNDED` |

#### TransactionLog Format

```javascript
{
  escrowId,
  eventName,
  txHash,
  blockNumber,
  walletAddress,
  amount,
  createdAt
}
```

#### Expected Output

- Backend đọc được smart contract
- Backend nghe event blockchain
- Backend tự cập nhật trạng thái escrow
- Backend lưu txHash và lịch sử giao dịch
- Admin resolve dispute có thể gọi contract

---

## 6. Shared Escrow Status

Tất cả backend phải dùng thống nhất bộ status sau:

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

## 7. Integration Workflow

```text
Backend 1 tạo escrow trong database
↓
Frontend gọi smart contract deposit
↓
Backend 3 nghe event FundsDeposited
↓
Backend 3 cập nhật Escrow.status = LOCKED
↓
Backend 1 cho Seller xem escrow đã LOCKED
↓
Seller cập nhật shipping info
↓
Buyer confirm hoặc mở dispute
↓
Backend 2 lưu dispute và evidence
↓
Admin xử lý dispute
↓
Backend 3 gọi smart contract refund/release
↓
Backend 3 nghe event
↓
Backend 2 gửi notification
```

---

## 8. Branch Convention

```text
main
dev
feature/auth-escrow
feature/dispute-upload
feature/blockchain-listener
```

| Người | Branch |
|---|---|
| Backend 1 | `feature/auth-escrow` |
| Backend 2 | `feature/dispute-upload` |
| Backend 3 | `feature/blockchain-listener` |

Tất cả Pull Request merge vào:

```text
dev
```

---

## 9. Setup & Run

```bash
cd backend
npm install
npm run dev
```

---

## 10. Environment Variables

```env
PORT=5000
MONGO_URI=
JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RPC_URL=
PRIVATE_KEY=
ESCROW_CONTRACT_ADDRESS=
```

---

## 11. Coding Rules

- Không code trực tiếp trên `main` hoặc `dev`.
- Mỗi người code trên branch riêng.
- Route chỉ định tuyến.
- Controller xử lý request/response.
- Service xử lý business logic.
- Model chỉ chứa schema.
- Middleware dùng cho xác thực, phân quyền, upload và lỗi.
- Nếu đổi cấu trúc thư mục, phải cập nhật `backend/README.md`.