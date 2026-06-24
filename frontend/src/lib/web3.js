// ============================================================
// lib/web3.js — Kết nối MetaMask + tương tác smart contract (frontend)
//
// QUY ƯỚC QUAN TRỌNG (đọc trước khi sửa file này):
//
// 1. escrowIdOnChain KHÔNG được tự encode ở frontend.
//    Luôn lấy giá trị này từ response của API POST /api/escrows
//    (field escrow.escrowIdOnChain mà backend đã encode sẵn bằng
//    objectIdToBytes32() trong escrow.controller.js — pad bên PHẢI).
//    Lý do: nếu frontend tự encode bằng ethers.zeroPadValue(...) hoặc
//    cách khác, giá trị bytes32 sẽ KHÔNG khớp với giá trị backend đã
//    lưu trong DB → eventListener.service.js sẽ không tìm thấy escrow
//    tương ứng khi nhận event on-chain (xem ghi chú trong
//    backend/controllers/escrow.controller.js, hàm objectIdToBytes32).
//
// 2. Đơn vị `amount`:
//    - Trong MongoDB (Escrow.amount) và trong UI: số "thường", human-readable.
//      Ví dụ amount = "450" nghĩa là 450 USDC.
//    - Trên smart contract: phải là raw units theo decimals của token.
//      MockUSDC dùng 6 decimals (KHÔNG phải 18 như ETH) → 450 USDC
//      = 450 * 10^6 = 450000000 (raw units).
//    - Hàm toTokenUnits()/fromTokenUnits() dưới đây xử lý quy đổi này.
//      LUÔN dùng 2 hàm này khi gửi/đọc amount tới/từ contract, không
//      tự nhân/chia 10^6 ở nơi khác để tránh sai sót rải rác nhiều chỗ.
//
// 3. Token thanh toán (MockUSDC) là MỘT địa chỉ CỐ ĐỊNH cho toàn bộ
//    app (không phải mỗi escrow có token riêng) — lấy từ
//    smart-contract/deployments/amoy.json (trường paymentToken/mockUSDC).
// ============================================================

import { ethers } from "ethers";
import EscrowABI from "../abi/EscrowContract.json";

// ──────────────────────────────────────────────────────────
// CONFIG — đọc từ biến môi trường Vite (xem .env.example)
// Vite chỉ expose biến có prefix VITE_ ra import.meta.env
// ──────────────────────────────────────────────────────────
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;
export const CHAIN_ID_HEX = import.meta.env.VITE_CHAIN_ID_HEX || "0x13882"; // 80002 = Polygon Amoy
export const TOKEN_DECIMALS = 6; // MockUSDC — KHÔNG phải 18

// ABI tối thiểu cho ERC20 — chỉ các hàm thực sự dùng (approve, allowance, balanceOf)
// Không cần ABI đầy đủ vì contract MockUSDC tuân theo chuẩn ERC20 thường
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// ──────────────────────────────────────────────────────────
// HELPER: quy đổi đơn vị token (human-readable <-> raw on-chain)
// ──────────────────────────────────────────────────────────

/**
 * Chuyển số "thường" (ví dụ "450" hoặc 450) sang raw units (BigInt)
 * để gửi lên smart contract.
 * @param {string|number} humanAmount - ví dụ "450" (= 450 USDC)
 * @returns {bigint} raw units, ví dụ 450000000n
 */
export const toTokenUnits = (humanAmount) => {
  return ethers.parseUnits(String(humanAmount), TOKEN_DECIMALS);
};

/**
 * Chuyển raw units (BigInt/string trả về từ contract) sang số "thường"
 * để hiển thị UI.
 * @param {bigint|string} rawAmount
 * @returns {string} ví dụ "450.0"
 */
export const fromTokenUnits = (rawAmount) => {
  return ethers.formatUnits(rawAmount, TOKEN_DECIMALS);
};

// ──────────────────────────────────────────────────────────
// HELPER: kiểm tra MetaMask có sẵn không
// Luôn gọi hàm này trước khi dùng window.ethereum để tránh
// crash trên máy/browser không có extension MetaMask.
// ──────────────────────────────────────────────────────────
export const isMetaMaskAvailable = () => {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
};

// ──────────────────────────────────────────────────────────
// CONNECT WALLET — xin quyền truy cập account từ MetaMask
// Trả về { provider, signer, address } để dùng tiếp cho các
// lệnh gọi contract khác trong cùng session.
// ──────────────────────────────────────────────────────────
export const connectWallet = async () => {
  if (!isMetaMaskAvailable()) {
    throw new Error("MetaMask không được tìm thấy. Vui lòng cài đặt MetaMask extension.");
  }

  // eth_requestAccounts mở popup MetaMask xin user kết nối
  // Nếu user từ chối, promise sẽ reject — caller cần try/catch
  await window.ethereum.request({ method: "eth_requestAccounts" });

  // Đảm bảo đúng network (Polygon Amoy) — nếu không đúng, xin chuyển network
  await ensureCorrectNetwork();

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
};

/**
 * Đảm bảo MetaMask đang ở đúng network Polygon Amoy.
 * Nếu không đúng, yêu cầu MetaMask chuyển sang (wallet_switchEthereumChain).
 * Nếu network chưa được thêm vào MetaMask, fallback sang wallet_addEthereumChain.
 */
const ensureCorrectNetwork = async () => {
  const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
  if (currentChainId === CHAIN_ID_HEX) return; // đã đúng network

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  } catch (switchError) {
    // Lỗi 4902 = network chưa tồn tại trong MetaMask của user → thêm mới
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: CHAIN_ID_HEX,
            chainName: "Polygon Amoy Testnet",
            nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
            rpcUrls: ["https://rpc-amoy.polygon.technology"],
            blockExplorerUrls: ["https://amoy.polygonscan.com"],
          },
        ],
      });
    } else {
      // User từ chối chuyển network, hoặc lỗi khác — báo lỗi rõ ràng cho caller
      throw new Error("Vui lòng chuyển MetaMask sang mạng Polygon Amoy Testnet để tiếp tục.");
    }
  }
};

// ──────────────────────────────────────────────────────────
// CONTRACT GETTERS — tạo instance contract gắn với signer hiện tại
// Gọi connectWallet() trước để có signer hợp lệ.
// ──────────────────────────────────────────────────────────

export const getEscrowContract = (signer) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error("VITE_CONTRACT_ADDRESS chưa được cấu hình trong .env");
  }
  return new ethers.Contract(CONTRACT_ADDRESS, EscrowABI.abi, signer);
};

export const getUsdcContract = (signer) => {
  if (!USDC_ADDRESS) {
    throw new Error("VITE_USDC_ADDRESS chưa được cấu hình trong .env");
  }
  return new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
};

// ──────────────────────────────────────────────────────────
// HIGH-LEVEL ACTIONS — các hành động on-chain dùng trong luồng escrow
// Mỗi hàm trả về { txHash, blockNumber } sau khi transaction được
// confirm (tx.wait()), để UI hiển thị/lưu lại nếu cần.
// ──────────────────────────────────────────────────────────

/**
 * Client approve cho contract Escrow được phép rút USDC từ wallet của
 * Client TRƯỚC KHI gọi deposit(). Đây là bước bắt buộc của chuẩn ERC20
 * (contract không thể tự rút token nếu chưa được approve).
 *
 * Hàm này tự kiểm tra allowance hiện tại — nếu đã đủ, BỎ QUA việc gọi
 * approve() lại (tiết kiệm 1 transaction/gas không cần thiết).
 *
 * @param {ethers.Signer} signer
 * @param {string} humanAmount - số "thường", ví dụ "450"
 */
export const approveUsdcIfNeeded = async (signer, humanAmount) => {
  const usdc = getUsdcContract(signer);
  const owner = await signer.getAddress();
  const requiredAmount = toTokenUnits(humanAmount);

  const currentAllowance = await usdc.allowance(owner, CONTRACT_ADDRESS);
  if (currentAllowance >= requiredAmount) {
    // Đã approve đủ từ trước — không cần gọi lại
    return null;
  }

  const tx = await usdc.approve(CONTRACT_ADDRESS, requiredAmount);
  const receipt = await tx.wait(1);
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

/**
 * Client tạo escrow on-chain — PHẢI gọi SAU KHI đã có escrowIdOnChain
 * từ response API POST /api/escrows (xem quy ước #1 ở đầu file).
 *
 * @param {ethers.Signer} signer
 * @param {string} escrowIdOnChain - bytes32 hex string, LẤY TỪ BACKEND
 * @param {string} freelancerAddress - địa chỉ wallet freelancer
 * @param {string} humanAmount - số "thường", ví dụ "450"
 */
export const createEscrowOnChain = async (signer, escrowIdOnChain, freelancerAddress, humanAmount) => {
  const contract = getEscrowContract(signer);
  const rawAmount = toTokenUnits(humanAmount);

  const tx = await contract.createEscrow(escrowIdOnChain, freelancerAddress, rawAmount);
  const receipt = await tx.wait(1);
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

/**
 * Client deposit USDC vào escrow (sau khi đã approve và đã createEscrow on-chain).
 * @param {ethers.Signer} signer
 * @param {string} escrowIdOnChain - bytes32 hex string
 */
export const depositToEscrow = async (signer, escrowIdOnChain) => {
  const contract = getEscrowContract(signer);
  const tx = await contract.deposit(escrowIdOnChain);
  const receipt = await tx.wait(1);
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

/**
 * Freelancer đánh dấu đã giao việc on-chain (markShipped).
 * Gọi sau khi đã submit deliverable qua API backend.
 * @param {ethers.Signer} signer
 * @param {string} escrowIdOnChain - bytes32 hex string
 */
export const markShippedOnChain = async (signer, escrowIdOnChain) => {
  const contract = getEscrowContract(signer);
  const tx = await contract.markShipped(escrowIdOnChain);
  const receipt = await tx.wait(1);
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

/**
 * Client xác nhận hoàn tất công việc → release tiền cho freelancer.
 * Đây là bước Client TỰ KÝ qua wallet của họ (không qua backend admin
 * wallet) — đúng theo ghi chú "approveWork desync" trong
 * escrow.controller.js: backend approveWork() chỉ đánh dấu Ý ĐỊNH,
 * còn việc release tiền THẬT phải qua hàm này.
 * @param {ethers.Signer} signer
 * @param {string} escrowIdOnChain - bytes32 hex string
 */
export const confirmDeliveryOnChain = async (signer, escrowIdOnChain) => {
  const contract = getEscrowContract(signer);
  const tx = await contract.confirmDelivery(escrowIdOnChain);
  const receipt = await tx.wait(1);
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

/**
 * Client hoặc Freelancer mở tranh chấp.
 * @param {ethers.Signer} signer
 * @param {string} escrowIdOnChain - bytes32 hex string
 * @param {string} evidenceURI - link bằng chứng (IPFS, Google Drive, v.v.)
 */
export const raiseDisputeOnChain = async (signer, escrowIdOnChain, evidenceURI) => {
  const contract = getEscrowContract(signer);
  const tx = await contract.raiseDispute(escrowIdOnChain, evidenceURI);
  const receipt = await tx.wait(1);
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
};

/**
 * Đọc trạng thái escrow trực tiếp từ smart contract (view function,
 * không tốn gas, không cần ký). Dùng để hiển thị thông tin "đã xác
 * nhận on-chain" trên UI, độc lập với DB.
 * @param {ethers.Provider|ethers.Signer} providerOrSigner
 * @param {string} escrowIdOnChain - bytes32 hex string
 */
export const getEscrowOnChainView = async (providerOrSigner, escrowIdOnChain) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, EscrowABI.abi, providerOrSigner);
  const result = await contract.getEscrow(escrowIdOnChain);

  // Map đúng enum Status của contract — PHẢI khớp thứ tự khai báo
  // trong EscrowContract.sol (xem cùng STATUS_MAP trong
  // backend/services/blockchain.service.js để tránh lệch tên).
  const STATUS_MAP = ["CREATED", "LOCKED", "SHIPPED", "DISPUTED", "RELEASED", "REFUNDED", "CANCELLED"];

  return {
    exists: result.exists,
    client: result.buyer,
    freelancer: result.seller,
    amount: fromTokenUnits(result.amount),
    status: STATUS_MAP[Number(result.status)] || "UNKNOWN",
    evidenceURI: result.evidenceURI,
    createdAt: new Date(Number(result.createdAt) * 1000),
    updatedAt: new Date(Number(result.updatedAt) * 1000),
  };
};

/**
 * Đọc số dư USDC của 1 địa chỉ (dùng cho trang Wallet).
 * @param {ethers.Provider|ethers.Signer} providerOrSigner
 * @param {string} address
 * @returns {string} số dư dạng human-readable, ví dụ "8430.0"
 */
export const getUsdcBalance = async (providerOrSigner, address) => {
  if (!USDC_ADDRESS) return "0";
  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, providerOrSigner);
  const raw = await usdc.balanceOf(address);
  return fromTokenUnits(raw);
};

/**
 * Đọc số dư native token (POL trên Polygon) của 1 địa chỉ.
 * @param {ethers.Provider} provider
 * @param {string} address
 * @returns {string} số dư dạng human-readable, ví dụ "1.42"
 */
export const getNativeBalance = async (provider, address) => {
  const raw = await provider.getBalance(address);
  return ethers.formatEther(raw); // native token luôn 18 decimals
};
