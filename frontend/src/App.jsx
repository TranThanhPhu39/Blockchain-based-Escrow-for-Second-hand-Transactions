import { BrowserProvider, Contract, Interface, JsonRpcProvider, parseUnits } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  Briefcase,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Code2,
  Coins,
  CreditCard,
  FileCheck2,
  FileText,
  Fingerprint,
  Gavel,
  Github,
  Globe2,
  GraduationCap,
  Home,
  Layers3,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  Moon,
  Palette,
  PenTool,
  Radio,
  ReceiptText,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  TimerReset,
  TrendingUp,
  UploadCloud,
  User,
  Users,
  Vote,
  Wallet,
  X,
  Zap
} from "lucide-react";

const routes = [
  "landing",
  "login",
  "register",
  "dashboard",
  "create",
  "details",
  "submit",
  "approval",
  "disputes",
  "wallet",
  "notifications",
  "profile",
  "admin"
];

const routeSet = new Set(routes);

const translations = {
  en: {
    brand: "EscrowX",
    product: "Decentralized Service Escrow Platform",
    tagline: "Smart escrow for freelance and digital service payments.",
    nav: {
      landing: "Landing Page",
      login: "Login",
      register: "Register",
      auth: "Sign In / Register",
      dashboard: "Dashboard",
      create: "Post Contract",
      jobs: "Browse Jobs",
      details: "Escrow Details",
      submit: "Deliverables",
      approval: "Approval",
      disputes: "Dispute Center",
      wallet: "Wallet",
      notifications: "Notifications",
      profile: "User Profile",
      admin: "Admin Panel"
    },
    common: {
      createJob: "Post a Contract",
      viewDashboard: "View Dashboard",
      connectWallet: "Connect MetaMask",
      signTransaction: "Sign Transaction",
      createEscrow: "Create Escrow",
      submitWork: "Submit Deliverables",
      approveWork: "Approve & Release Funds",
      openDispute: "Open Dispute",
      voteRelease: "Vote Release Funds",
      voteRefund: "Vote Refund Client",
      email: "Email",
      password: "Password",
      fullName: "Full Name",
      confirmPassword: "Confirm Password",
      walletAddress: "Wallet Address",
      role: "Role",
      client: "Client",
      freelancer: "Freelancer",
      amount: "Amount",
      deadline: "Deadline",
      status: "Status",
      service: "Service",
      action: "Action",
      contract: "Smart Contract",
      copied: "Copied",
      markAsRead: "Mark as read",
      depositFunds: "Deposit Funds"
    },
    status: {
      created: "CREATED",
      accepted: "ACCEPTED",
      deposited: "DEPOSITED",
      submitted: "SUBMITTED",
      revisionRequested: "REVISION REQUESTED",
      disputed: "DISPUTED",
      reviewingDispute: "REVIEWING DISPUTE",
      released: "RELEASED",
      refunded: "REFUNDED",
      cancelled: "CANCELLED",
      // Legacy / UI-only keys
      locked: "LOCKED",
      delivered: "DELIVERED",
      approved: "APPROVED",
      active: "Active",
      completed: "Completed",
      pending: "Pending",
      inProgress: "In progress",
      reviewing: "Reviewing",
      resolved: "Resolved",
      open: "Open",
      connected: "Connected",
      disconnected: "Disconnected"
    },
    landing: {
      title: "Smart Escrow for Secure Freelance Payments",
      subtitle: "Client deposits stablecoins into smart contracts. Funds are automatically released when work is approved.",
      heroEyebrow: "Trustless payment infrastructure for freelancers",
      metrics: [
        ["Total Escrow Volume", "$2.84M"],
        ["Active Jobs", "1,248"],
        ["Dispute Resolution Rate", "97.8%"],
        ["Average Completion Time", "3.6 days"]
      ],
      howTitle: "How it works",
      howSubtitle: "Transparent by design",
      steps: [
        ["Create Service Contract", "Client defines scope, budget, deadline, and freelancer wallet."],
        ["Deposit Stablecoins", "USDT or VNDC is locked inside an escrow smart contract."],
        ["Freelancer Delivers Work", "Deliverables and proof are submitted for client review."],
        ["Client Approves", "Approval triggers the release transaction preview."],
        ["Funds Released", "The smart contract pays the freelancer automatically."]
      ],
      categoriesTitle: "Service categories",
      categoriesSubtitle: "Built for freelance and digital service workflows.",
      benefitsTitle: "Why choose EscrowX",
      benefits: [
        ["Trustless payments", "Funds are locked by code before work starts."],
        ["Transparent workflow", "Every milestone has a readable contract state."],
        ["Faster settlement", "Approved work can be paid without manual banking delays."],
        ["Reduced fraud", "Neither side can quietly move escrowed funds."],
        ["Blockchain verification", "Wallets, balances, and signatures are modeled as on-chain actions."]
      ]
    },
    dashboard: {
      title: "Escrow Operations Dashboard",
      subtitle: "Monitor freelance service contracts, settlement status, and dispute exposure.",
      cards: [
        ["Total Escrow Value", "842,500 USDT", "+18.4% this month"],
        ["Active Jobs", "128", "42 awaiting delivery"],
        ["Completed Jobs", "1,920", "99.1% success rate"],
        ["Open Disputes", "7", "3 jury votes pending"]
      ],
      tabs: {
        active: "Active Jobs",
        completed: "Completed Jobs",
        disputes: "Disputes"
      },
      feedTitle: "Live contract feed",
      adoptionTitle: "Service distribution"
    },
    auth: {
      loginTitle: "Access EscrowX",
      loginSubtitle: "Sign in with email or connect MetaMask to continue.",
      registerTitle: "Create your escrow identity",
      registerSubtitle: "Set up a client or freelancer profile with wallet-ready credentials.",
      emailMethod: "Email + Password",
      walletMethod: "MetaMask Wallet",
      roleHelp: "Choose how you will use EscrowX first. You can switch later.",
      registerSuccess: "Account created! Sign in to continue.",
      sessionTitle: "Secure session",
      sessionCopy: "Your credentials are handled by the backend API. Connect MetaMask to attach a wallet address to your account.",
      escrowTitle: "Non-custodial escrow",
      escrowCopy: "Funds remain locked in the smart contract until the work is approved or a dispute is resolved."
    },
    create: {
      title: "Post a Service Contract",
      subtitle: "Define the scope, budget, and deadline. Freelancers will browse and accept your listing.",
      serviceName: "Service Name",
      description: "Job Description",
      budget: "Budget",
      deadline: "Deadline",
      previewTitle: "Contract Preview",
      previewCopy: "EscrowX will prepare a smart contract draft and simulate a stablecoin deposit request.",
      postedTitle: "Your Posted Contracts",
      noPosted: "No contracts posted yet.",
      jobsTitle: "Available Jobs",
      jobsSubtitle: "Browse open contracts from clients and accept the ones that match your skills.",
      noJobs: "No jobs available right now.",
      statusOpen: "Open",
      statusAssigned: "Assigned",
      lockBtn: "Accept Job",
      viewBtn: "View Details"
    },
    details: {
      title: "Escrow Details",
      subtitle: "Smart contract state, parties, value, and workflow timeline.",
      jobId: "Job ID",
      client: "Client",
      freelancer: "Freelancer",
      escrowAmount: "Escrow Amount",
      contractAddress: "Smart Contract Address",
      workflow: "Workflow Timeline",
      timelineNote: "Contract workflow stages",
      depositCopy: "Freelancer accepted. Deposit funds into the smart contract to start the job.",
      autoReleaseTitle: "Auto-release countdown",
      autoReleaseCopy: "Funds release automatically to freelancer if client takes no action."
    },
    submit: {
      title: "Deliverable Submission",
      subtitle: "Submit your deliverables and work proof for client review.",
      deliverableUrl: "Deliverable URL",
      workProof: "Work Proof",
      notes: "Notes",
      proofPlaceholder: "IPFS hash, Figma link, GitHub commit, or signed delivery note"
    },
    approval: {
      title: "Approval Center",
      subtitle: "Client reviews submitted work and decides whether to release or dispute funds.",
      deliverableTitle: "Submitted deliverable",
      qualityScore: "Delivery confidence score",
      approvalCopy: "Approving work simulates a signed release transaction to the freelancer."
    },
    dispute: {
      title: "Dispute Center",
      subtitle: "Review evidence, vote on the outcome, and keep funds locked until resolution.",
      evidence: "Submitted Evidence",
      screenshots: "Screenshots",
      deliverables: "Deliverable Links",
      juryProgress: "Jury voting progress",
      outcome: "Resolution status",
      outcomeCopy: "Cast a vote to release funds to the freelancer or refund the client. Requires administrator authorization.",
      adminNote: "Dispute resolution is restricted to platform administrators."
    },
    wallet: {
      title: "Wallet Integration",
      subtitle: "Connect your MetaMask wallet, manage balances, and sign on-chain transactions.",
      address: "Wallet address",
      connection: "Connection status",
      balance: "Wallet Balance",
      eth: "ETH",
      usdt: "USDT",
      modalTitle: "Simulated Transaction Approval",
      method: "Method",
      network: "Network",
      gas: "Gas sponsor",
      approveBiometric: "Approve with biometric"
    },
    notifications: {
      title: "Notifications",
      subtitle: "Stay updated on all escrow activity in real time.",
      triggerDemo: "Trigger demo toast",
      deposit: ["Deposit Success", "650 USDT has been locked in the service escrow contract."],
      submitted: ["Work Submitted", "Deliverables were submitted for client review."],
      approved: ["Work Approved", "Client approval is ready for transaction signing."],
      released: ["Funds Released", "Smart contract released payment to the freelancer."],
      disputeOpened: ["Dispute Opened", "Funds remain locked while evidence is reviewed."],
      disputeResolved: ["Dispute Resolved", "Jury decision finalized the escrow outcome."],
      locked: ["Job Accepted", "Contract locked. Waiting for client to deposit funds."],
      requireLogin: ["Account required", "Please create an account to use this feature."]
    },
    profile: {
      title: "User Profile",
      subtitle: "Reputation, wallet identity, and service escrow performance.",
      name: "Nguyen An",
      role: "Freelancer",
      reputation: "Reputation Score",
      completedJobs: "Completed Jobs",
      successRate: "Success Rate",
      verification: "Verification level",
      security: "Security settings",
      verifications: ["MetaMask linked", "Email verified", "2FA enabled"],
      historyTitle: "Contract History",
      noHistory: "No completed contracts yet.",
      logout: "Sign Out"
    },
    footer: {
      company: "Company",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      rights: "© 2026 EscrowX. Decentralized service escrow platform prototype."
    }
  },
  vi: {
    brand: "EscrowX",
    product: "Nền tảng ký quỹ dịch vụ phi tập trung",
    tagline: "Ký quỹ thông minh cho thanh toán freelance và dịch vụ số.",
    nav: {
      landing: "Trang chủ",
      login: "Đăng nhập",
      register: "Đăng ký",
      auth: "Đăng ký / Đăng nhập",
      dashboard: "Bảng điều khiển",
      create: "Đăng hợp đồng",
      jobs: "Tìm việc",
      details: "Chi tiết ký quỹ",
      submit: "Nộp sản phẩm",
      approval: "Phê duyệt",
      disputes: "Trung tâm tranh chấp",
      admin: "Quản trị",
      wallet: "Ví",
      notifications: "Thông báo",
      profile: "Hồ sơ người dùng"
    },
    common: {
      createJob: "Đăng hợp đồng",
      viewDashboard: "Xem bảng điều khiển",
      connectWallet: "Kết nối MetaMask",
      signTransaction: "Ký giao dịch",
      createEscrow: "Tạo ký quỹ",
      submitWork: "Nộp sản phẩm",
      approveWork: "Phê duyệt & Giải ngân",
      openDispute: "Mở tranh chấp",
      voteRelease: "Bỏ phiếu giải ngân",
      voteRefund: "Bỏ phiếu hoàn tiền",
      email: "Email",
      password: "Mật khẩu",
      fullName: "Họ và tên",
      confirmPassword: "Xác nhận mật khẩu",
      walletAddress: "Địa chỉ ví",
      role: "Vai trò",
      client: "Khách hàng",
      freelancer: "Freelancer",
      amount: "Số tiền",
      deadline: "Hạn hoàn thành",
      status: "Trạng thái",
      service: "Dịch vụ",
      action: "Thao tác",
      contract: "Hợp đồng thông minh",
      copied: "Đã sao chép",
      markAsRead: "Đánh dấu đã đọc",
      depositFunds: "Nạp tiền ký quỹ"
    },
    status: {
      created: "ĐÃ TẠO",
      accepted: "ĐÃ NHẬN VIỆC",
      deposited: "ĐÃ NẠP TIỀN",
      submitted: "ĐÃ NỘP BÀI",
      revisionRequested: "YÊU CẦU SỬA",
      disputed: "TRANH CHẤP",
      reviewingDispute: "ĐANG XEM XÉT",
      released: "ĐÃ GIẢI NGÂN",
      refunded: "ĐÃ HOÀN TIỀN",
      cancelled: "ĐÃ HỦY",
      // Legacy / UI-only keys
      locked: "ĐANG KHÓA",
      delivered: "ĐÃ BÀN GIAO",
      approved: "ĐÃ PHÊ DUYỆT",
      active: "Đang hoạt động",
      completed: "Đã hoàn thành",
      pending: "Đang chờ",
      inProgress: "Đang thực hiện",
      reviewing: "Đang xem xét",
      resolved: "Đã xử lý",
      open: "Đang mở",
      connected: "Đã kết nối",
      disconnected: "Chưa kết nối"
    },
    landing: {
      title: "Ký quỹ thông minh cho thanh toán dịch vụ freelance an toàn",
      subtitle: "Khách hàng nạp stablecoin vào hợp đồng thông minh. Tiền được tự động giải ngân khi sản phẩm được phê duyệt.",
      heroEyebrow: "Hạ tầng thanh toán phi tập trung cho freelancer",
      metrics: [
        ["Tổng giá trị ký quỹ", "2,84 triệu USD"],
        ["Công việc đang chạy", "1.248"],
        ["Tỷ lệ xử lý tranh chấp", "97,8%"],
        ["Thời gian hoàn thành trung bình", "3,6 ngày"]
      ],
      howTitle: "Cách hoạt động",
      howSubtitle: "Minh bạch theo thiết kế",
      steps: [
        ["Tạo hợp đồng dịch vụ", "Khách hàng nhập phạm vi, ngân sách, hạn và ví freelancer."],
        ["Nạp stablecoin", "USDT hoặc VNDC được khóa trong hợp đồng ký quỹ."],
        ["Freelancer bàn giao", "Sản phẩm và bằng chứng được gửi để khách hàng xem xét."],
        ["Khách hàng phê duyệt", "Phê duyệt sẽ tạo giao dịch giải ngân cần ký."],
        ["Tiền được giải ngân", "Hợp đồng thông minh tự động trả tiền cho freelancer."]
      ],
      categoriesTitle: "Danh mục dịch vụ",
      categoriesSubtitle: "Phù hợp cho freelance và các dịch vụ số.",
      benefitsTitle: "Vì sao chọn EscrowX",
      benefits: [
        ["Thanh toán không cần niềm tin tuyệt đối", "Tiền được khóa bằng mã trước khi bắt đầu làm việc."],
        ["Quy trình minh bạch", "Mỗi mốc đều có trạng thái hợp đồng dễ hiểu."],
        ["Tất toán nhanh hơn", "Sản phẩm được duyệt có thể thanh toán không chờ ngân hàng."],
        ["Giảm gian lận", "Hai bên không thể tự ý rút tiền đang ký quỹ."],
        ["Xác thực blockchain", "Ví, số dư và chữ ký được mô phỏng như thao tác on-chain."]
      ]
    },
    dashboard: {
      title: "Bảng điều khiển ký quỹ",
      subtitle: "Theo dõi hợp đồng dịch vụ, trạng thái tất toán và rủi ro tranh chấp.",
      cards: [
        ["Tổng giá trị ký quỹ", "842.500 USDT", "+18,4% tháng này"],
        ["Công việc đang chạy", "128", "42 việc đang chờ bàn giao"],
        ["Công việc hoàn thành", "1.920", "Tỷ lệ thành công 99,1%"],
        ["Tranh chấp mở", "7", "3 lượt bỏ phiếu đang chờ"]
      ],
      tabs: {
        active: "Công việc đang chạy",
        completed: "Công việc hoàn thành",
        disputes: "Tranh chấp"
      },
      feedTitle: "Luồng hợp đồng trực tiếp",
      adoptionTitle: "Phân bổ dịch vụ"
    },
    auth: {
      loginTitle: "Truy cập EscrowX",
      loginSubtitle: "Đăng nhập bằng email hoặc kết nối MetaMask để tiếp tục.",
      registerTitle: "Tạo danh tính ký quỹ",
      registerSubtitle: "Thiết lập hồ sơ khách hàng hoặc freelancer với thông tin ví.",
      emailMethod: "Email + mật khẩu",
      walletMethod: "Ví MetaMask",
      roleHelp: "Chọn cách bạn dùng EscrowX trước. Bạn có thể đổi sau.",
      registerSuccess: "Tài khoản đã được tạo! Đăng nhập để tiếp tục.",
      sessionTitle: "Phiên đăng nhập bảo mật",
      sessionCopy: "Thông tin đăng nhập được xử lý bởi backend API. Kết nối MetaMask để gắn địa chỉ ví vào tài khoản.",
      escrowTitle: "Ký quỹ không lưu ký",
      escrowCopy: "Tiền được khóa trong hợp đồng thông minh cho đến khi công việc được phê duyệt hoặc tranh chấp được giải quyết."
    },
    create: {
      title: "Đăng hợp đồng dịch vụ",
      subtitle: "Mô tả phạm vi, ngân sách và thời hạn. Freelancer sẽ duyệt và nhận việc của bạn.",
      serviceName: "Tên dịch vụ",
      description: "Mô tả công việc",
      budget: "Ngân sách",
      deadline: "Hạn hoàn thành",
      previewTitle: "Xem trước hợp đồng",
      previewCopy: "EscrowX sẽ tạo bản nháp hợp đồng thông minh và mô phỏng yêu cầu nạp stablecoin.",
      postedTitle: "Hợp đồng đã đăng",
      noPosted: "Chưa có hợp đồng nào được đăng.",
      jobsTitle: "Việc đang mở",
      jobsSubtitle: "Duyệt các hợp đồng từ khách hàng và nhận việc phù hợp với kỹ năng của bạn.",
      noJobs: "Hiện không có việc nào.",
      statusOpen: "Chờ nhận",
      statusAssigned: "Đã có người",
      lockBtn: "Nhận việc",
      viewBtn: "Xem chi tiết"
    },
    details: {
      title: "Chi tiết ký quỹ",
      subtitle: "Trạng thái hợp đồng, các bên tham gia, giá trị và timeline xử lý.",
      jobId: "Mã công việc",
      client: "Khách hàng",
      freelancer: "Freelancer",
      escrowAmount: "Số tiền ký quỹ",
      contractAddress: "Địa chỉ hợp đồng",
      workflow: "Tiến trình hợp đồng",
      timelineNote: "Các giai đoạn quy trình hợp đồng",
      depositCopy: "Freelancer đã nhận việc. Nạp tiền vào hợp đồng thông minh để bắt đầu công việc.",
      autoReleaseTitle: "Đếm ngược tự giải ngân",
      autoReleaseCopy: "Tiền tự động chuyển cho freelancer nếu khách hàng không phản hồi."
    },
    submit: {
      title: "Nộp sản phẩm",
      subtitle: "Gửi sản phẩm và bằng chứng công việc để khách hàng xem xét.",
      deliverableUrl: "Đường dẫn sản phẩm",
      workProof: "Bằng chứng công việc",
      notes: "Ghi chú",
      proofPlaceholder: "IPFS hash, link Figma, commit GitHub hoặc biên bản bàn giao"
    },
    approval: {
      title: "Trung tâm phê duyệt",
      subtitle: "Khách hàng xem sản phẩm và quyết định giải ngân hoặc mở tranh chấp.",
      deliverableTitle: "Sản phẩm đã nộp",
      qualityScore: "Điểm tin cậy bàn giao",
      approvalCopy: "Phê duyệt sẽ mô phỏng giao dịch giải ngân có chữ ký cho freelancer."
    },
    dispute: {
      title: "Trung tâm tranh chấp",
      subtitle: "Xem bằng chứng, bỏ phiếu kết quả và giữ tiền khóa đến khi xử lý xong.",
      evidence: "Bằng chứng đã nộp",
      screenshots: "Ảnh chụp màn hình",
      deliverables: "Liên kết sản phẩm",
      juryProgress: "Tiến độ bỏ phiếu của hội đồng",
      outcome: "Trạng thái xử lý",
      outcomeCopy: "Bỏ phiếu giải ngân cho freelancer hoặc hoàn tiền cho khách hàng. Yêu cầu quyền quản trị viên.",
      adminNote: "Xử lý tranh chấp chỉ dành cho quản trị viên nền tảng."
    },
    wallet: {
      title: "Tích hợp ví",
      subtitle: "Kết nối ví MetaMask, quản lý số dư và ký giao dịch on-chain.",
      address: "Địa chỉ ví",
      connection: "Trạng thái kết nối",
      balance: "Số dư ví",
      eth: "ETH",
      usdt: "USDT",
      modalTitle: "Mô phỏng phê duyệt giao dịch",
      method: "Phương thức",
      network: "Mạng",
      gas: "Nhà tài trợ phí gas",
      approveBiometric: "Duyệt bằng sinh trắc học"
    },
    notifications: {
      title: "Thông báo",
      subtitle: "Cập nhật tức thời mọi hoạt động ký quỹ của bạn.",
      triggerDemo: "Kích hoạt toast mẫu",
      deposit: ["Nạp tiền thành công", "650 USDT đã được khóa trong hợp đồng ký quỹ dịch vụ."],
      submitted: ["Đã nộp sản phẩm", "Sản phẩm đã được gửi để khách hàng xem xét."],
      approved: ["Sản phẩm được phê duyệt", "Phê duyệt của khách hàng đã sẵn sàng để ký giao dịch."],
      released: ["Đã giải ngân", "Hợp đồng thông minh đã trả tiền cho freelancer."],
      disputeOpened: ["Đã mở tranh chấp", "Tiền vẫn được khóa trong khi bằng chứng được xem xét."],
      disputeResolved: ["Tranh chấp đã xử lý", "Quyết định của hội đồng đã hoàn tất kết quả ký quỹ."],
      locked: ["Đã nhận việc", "Hợp đồng đã khóa. Chờ khách hàng nạp tiền."],
      requireLogin: ["Yêu cầu đăng nhập", "Xin vui lòng tạo tài khoản để sử dụng tính năng này."]
    },
    profile: {
      title: "Hồ sơ người dùng",
      subtitle: "Uy tín, định danh ví và hiệu suất dịch vụ ký quỹ.",
      name: "Nguyễn An",
      role: "Freelancer",
      reputation: "Điểm uy tín",
      completedJobs: "Công việc hoàn thành",
      successRate: "Tỷ lệ thành công",
      verification: "Cấp xác thực",
      security: "Cài đặt bảo mật",
      verifications: ["Đã liên kết MetaMask", "Email đã xác thực", "Đã bật 2FA"],
      historyTitle: "Lịch sử hợp đồng",
      noHistory: "Chưa có hợp đồng hoàn thành.",
      logout: "Đăng xuất"
    },
    footer: {
      company: "Công ty",
      terms: "Điều khoản dịch vụ",
      privacy: "Chính sách bảo mật",
      rights: "© 2026 EscrowX. Nguyên mẫu nền tảng ký quỹ dịch vụ phi tập trung."
    }
  }
};

const serviceCategories = [
  { icon: Palette, en: "UI/UX Design", vi: "Thiết kế UI/UX" },
  { icon: PenTool, en: "Logo Design", vi: "Thiết kế logo" },
  { icon: Code2, en: "Web Development", vi: "Phát triển web" },
  { icon: ShieldCheck, en: "Smart Contract Development", vi: "Phát triển smart contract" },
  { icon: FileText, en: "Content Writing", vi: "Viết nội dung" },
  { icon: Globe2, en: "Translation", vi: "Dịch thuật" },
  { icon: Megaphone, en: "Marketing", vi: "Marketing" },
  { icon: GraduationCap, en: "Online Tutoring", vi: "Gia sư trực tuyến" }
];

const jobs = {
  active: [
    {
      id: "JOB-2401",
      service: { en: "Logo Design for Startup", vi: "Thiết kế logo cho startup" },
      freelancer: "Linh Dao",
      amount: "450 USDT",
      deadline: "Jun 24, 2026",
      status: "locked"
    },
    {
      id: "JOB-2402",
      service: { en: "Landing Page Development", vi: "Phát triển landing page" },
      freelancer: "Minh Pham",
      amount: "1,250 USDT",
      deadline: "Jun 28, 2026",
      status: "inProgress"
    },
    {
      id: "JOB-2403",
      service: { en: "Smart Contract Audit", vi: "Kiểm toán smart contract" },
      freelancer: "Quang Le",
      amount: "2,800 USDT",
      deadline: "Jul 02, 2026",
      status: "submitted"
    }
  ],
  completed: [
    {
      id: "JOB-2394",
      service: { en: "Social Media Content Package", vi: "Gói nội dung mạng xã hội" },
      freelancer: "Hoa Tran",
      amount: "620 USDT",
      result: "released",
      tx: "0x7af3...19c2"
    },
    {
      id: "JOB-2388",
      service: { en: "English-Vietnamese Translation", vi: "Dịch Anh - Việt" },
      freelancer: "An Nguyen",
      amount: "320 USDT",
      result: "released",
      tx: "0xd41b...62aa"
    }
  ],
  disputes: [
    {
      id: "JOB-2379",
      service: { en: "Smart Contract Audit", vi: "Kiểm toán smart contract" },
      freelancer: "Bao Nguyen",
      amount: "1,900 USDT",
      status: "reviewing"
    },
    {
      id: "JOB-2365",
      service: { en: "Landing Page Development", vi: "Phát triển landing page" },
      freelancer: "Mai Ho",
      amount: "980 USDT",
      status: "open"
    }
  ]
};

const feed = [
  { en: "JOB-2401 locked 450 USDT", vi: "JOB-2401 đã khóa 450 USDT", tone: "cyan" },
  { en: "JOB-2403 submitted audit report", vi: "JOB-2403 đã nộp báo cáo kiểm toán", tone: "violet" },
  { en: "JOB-2394 released funds to freelancer", vi: "JOB-2394 đã giải ngân cho freelancer", tone: "emerald" },
  { en: "JOB-2379 entered jury review", vi: "JOB-2379 chuyển sang hội đồng xem xét", tone: "amber" }
];

const demand = [
  ["Web Development", 34],
  ["Design", 26],
  ["Smart Contracts", 18],
  ["Content", 12],
  ["Translation", 10]
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function text(value, language) {
  if (typeof value === "string") return value;
  return value?.[language] || value?.en || "";
}

function getInitialRoute() {
  if (typeof window === "undefined") return "landing";
  const route = window.location.hash.replace(/^#\/?/, "") || "landing";
  return routeSet.has(route) ? route : "landing";
}

function routeHash(route) {
  return route === "landing" ? "#/" : `#/${route}`;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
const AMOY_RPC = import.meta.env.VITE_AMOY_RPC_URL || "https://polygon-amoy.g.alchemy.com/v2/Zi4sE_2bG68-B6wAeCW4_";
const AMOY_RPC_LIST = [
  AMOY_RPC,
  "https://rpc-amoy.polygon.technology/",
  "https://polygon-amoy-bor-rpc.publicnode.com",
];

// Polygon Amoy requires minimum 25 Gwei tip cap. Hardcode safe values for testnet
// to avoid RPC fee estimation returning values below the network minimum.
function getGasParams() {
  return {
    maxPriorityFeePerGas: 30_000_000_000n, // 30 Gwei tip (above Amoy's 25 Gwei min)
    maxFeePerGas:         60_000_000_000n, // 60 Gwei cap (30 base + 30 tip buffer)
  };
}

// Bypass ethers.js Contract abstraction — encode calldata explicitly then send via signer.
// This avoids the BrowserProvider+Contract combo stripping calldata on Polygon Amoy.
async function sendContractTx(signer, functionName, args, gasLimit) {
  const iface = new Interface(ESCROW_ABI);
  const data = iface.encodeFunctionData(functionName, args);
  const feeParams = getGasParams();
  console.log(`[tx] ${functionName} data:`, data.slice(0, 20) + "...");
  return signer.sendTransaction({
    to: CONTRACT_ADDRESS,
    data,
    ...feeParams,
    gasLimit: BigInt(gasLimit),
  });
}

const ESCROW_ABI = [
  "function createContract(bytes32 contractId, address freelancer, uint256 amount, string contractURI)",
  "function acceptContract(bytes32 contractId)",
  "function deposit(bytes32 contractId)",
  "function submitWork(bytes32 contractId, string submissionURI)",
  "function approveWork(bytes32 contractId)",
  "function requestRevision(bytes32 contractId, string reason)",
  "function raiseDispute(bytes32 contractId, string evidenceURI)",
  "function uploadDefense(bytes32 contractId, string defenseURI)",
  "function castDisputeVote(bytes32 contractId, bool deliverablesMatch, bool acceptanceCriteriaMet, bool deadlineMet, bool revisionHistoryReviewed, bool submissionHistoryReviewed, bool blockchainTimelineReviewed, bool evidenceReviewed, bool voteForFreelancer, string reason)",
  "function cancelContract(bytes32 contractId)",
  "function paymentToken() view returns (address)",
  // getContract trả về struct → dùng JSON ABI format với type:"tuple" để ethers.js decode đúng
  {
    name: "getContract", type: "function", stateMutability: "view",
    inputs: [{ name: "contractId", type: "bytes32" }],
    outputs: [{
      name: "", type: "tuple",
      components: [
        { name: "exists",        type: "bool"    },
        { name: "client",        type: "address" },
        { name: "freelancer",    type: "address" },
        { name: "amount",        type: "uint256" },
        { name: "status",        type: "uint8"   },
        { name: "contractURI",   type: "string"  },
        { name: "submissionURI", type: "string"  },
        { name: "revisionCount", type: "uint256" },
        { name: "createdAt",     type: "uint256" },
        { name: "updatedAt",     type: "uint256" },
      ]
    }]
  }
];
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

let _tokenAddress = null;
let _tokenDecimals = null;
let _walletProvider = null; // provider được chọn bởi user (Coin98 hoặc MetaMask)

function setWalletProvider(provider) {
  _walletProvider = provider;
  _tokenAddress = null;
  _tokenDecimals = null;
}

function getWalletProvider() {
  return _walletProvider || window.ethereum;
}

// Trả về danh sách các wallet provider đang available (EIP-6963 + providers[])
function detectWallets() {
  const wallets = [];
  const seen = new Set();

  const addWallet = (provider) => {
    const id = provider.isCoin98 ? "coin98" : provider.isMetaMask ? "metamask" : Math.random().toString();
    if (seen.has(id)) return;
    seen.add(id);
    wallets.push({
      id,
      name: provider.isCoin98 ? "Coin98" : provider.isMetaMask ? "MetaMask" : "Browser Wallet",
      provider,
    });
  };

  if (window.ethereum?.providers?.length) {
    window.ethereum.providers.forEach(addWallet);
  } else if (window.ethereum) {
    addWallet(window.ethereum);
  }

  return wallets;
}

function objectIdToBytes32(id) {
  return ("0x" + String(id).padEnd(64, "0")).toLowerCase();
}

async function getContracts() {
  const eth = getWalletProvider();
  if (!eth) throw new Error("Wallet not found");
  if (!CONTRACT_ADDRESS) throw new Error("VITE_CONTRACT_ADDRESS not set");
  const AMOY_CHAIN_ID = "0x13882"; // 80002
  const chainId = await eth.request({ method: "eth_chainId" });
  if (chainId !== AMOY_CHAIN_ID) {
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_CHAIN_ID }]
      });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: AMOY_CHAIN_ID,
            chainName: "Polygon Amoy",
            nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
            rpcUrls: ["https://rpc-amoy.polygon.technology/"],
            blockExplorerUrls: ["https://amoy.polygonscan.com/"]
          }]
        });
      } else {
        throw new Error("Vui lòng chuyển sang mạng Polygon Amoy (chainId 80002)");
      }
    }
    _tokenAddress = null;
    _tokenDecimals = null;
    await new Promise((r) => setTimeout(r, 800));
  }
  const readProvider = new JsonRpcProvider(AMOY_RPC);
  const writeProvider = new BrowserProvider(eth);
  const signer = await writeProvider.getSigner();
  console.log("[getContracts] using RPC:", AMOY_RPC);
  if (!_tokenAddress) {
    console.log("[getContracts] calling paymentToken()...");
    const escrowRead = new Contract(CONTRACT_ADDRESS, ESCROW_ABI, readProvider);
    _tokenAddress = await escrowRead.paymentToken();
    console.log("[getContracts] tokenAddress:", _tokenAddress);
  }
  if (_tokenDecimals === null) {
    console.log("[getContracts] calling decimals()...");
    const tokenRead = new Contract(_tokenAddress, ERC20_ABI, readProvider);
    _tokenDecimals = Number(await tokenRead.decimals());
    console.log("[getContracts] decimals:", _tokenDecimals);
  }
  const escrowContract = new Contract(CONTRACT_ADDRESS, ESCROW_ABI, signer);
  const tokenContract = new Contract(_tokenAddress, ERC20_ABI, signer);
  return { escrow: escrowContract, token: tokenContract, decimals: _tokenDecimals };
}

// Lightweight version of getContracts — returns signer + ERC20 token + decimals without creating
// a Contract wrapper for the escrow (callers use sendContractTx instead).
async function getSignerAndDecimals() {
  const eth = getWalletProvider();
  if (!eth) throw new Error("Wallet not found");
  if (!CONTRACT_ADDRESS) throw new Error("VITE_CONTRACT_ADDRESS not set");
  const AMOY_CHAIN_ID = "0x13882";
  const chainId = await eth.request({ method: "eth_chainId" });
  if (chainId !== AMOY_CHAIN_ID) {
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: AMOY_CHAIN_ID }] });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await eth.request({ method: "wallet_addEthereumChain", params: [{ chainId: AMOY_CHAIN_ID, chainName: "Polygon Amoy", nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 }, rpcUrls: ["https://rpc-amoy.polygon.technology/"], blockExplorerUrls: ["https://amoy.polygonscan.com/"] }] });
      } else throw new Error("Please switch to Polygon Amoy (chainId 80002)");
    }
    _tokenAddress = null;
    _tokenDecimals = null;
    await new Promise(r => setTimeout(r, 800));
  }
  const readProvider = new JsonRpcProvider(AMOY_RPC);
  const writeProvider = new BrowserProvider(eth);
  const signer = await writeProvider.getSigner();
  if (!_tokenAddress) {
    const escrowRead = new Contract(CONTRACT_ADDRESS, ESCROW_ABI, readProvider);
    _tokenAddress = await escrowRead.paymentToken();
  }
  if (_tokenDecimals === null) {
    const tokenRead = new Contract(_tokenAddress, ERC20_ABI, readProvider);
    _tokenDecimals = Number(await tokenRead.decimals());
  }
  const token = new Contract(_tokenAddress, ERC20_ABI, signer);
  return { signer, token, decimals: _tokenDecimals };
}

async function apiRequest(path, { token, ...options } = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

function normalizeRole(value) {
  const role = String(value || "").toLowerCase();
  return role.includes("freelancer") ? "freelancer" : "client";
}

function shortAddress(address) {
  if (!address) return "Wallet";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatEscrowAmount(amount) {
  if (!amount) return "0 USDT";
  return String(amount).toUpperCase().includes("USDT") ? amount : `${amount} USDT`;
}

function escrowStatusKey(status) {
  switch (String(status || "CREATED").toUpperCase()) {
    case "CREATED":            return "created";
    case "ACCEPTED":           return "accepted";
    case "DEPOSITED":          return "deposited";
    case "SUBMITTED":          return "submitted";
    case "REVISION_REQUESTED": return "revisionRequested";
    case "DISPUTED":           return "disputed";
    case "REVIEWING_DISPUTE":  return "reviewingDispute";
    case "RELEASED":           return "released";
    case "REFUNDED":           return "refunded";
    case "CANCELLED":          return "cancelled";
    // v1 legacy fallbacks
    case "LOCKED":             return "deposited";
    case "IN_PROGRESS":        return "accepted";
    default:                   return "pending";
  }
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return fallback;
    return window.localStorage.getItem(key) || fallback;
  });

  useEffect(() => {
    window.localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue];
}

function getTheme(mode) {
  const isDark = mode === "dark";
  return {
    isDark,
    page: isDark
      ? "bg-slate-950 text-slate-100"
      : "bg-slate-50 text-slate-950",
    background: isDark
      ? "bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.2),transparent_26%),linear-gradient(135deg,#020617_0%,#071426_48%,#020617_100%)]"
      : "bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.18),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#eef6ff_52%,#f8fafc_100%)]",
    sidebar: isDark
      ? "border-white/10 bg-slate-950/78 backdrop-blur-xl"
      : "border-slate-200 bg-white/88 backdrop-blur-xl",
    header: isDark
      ? "border-white/10 bg-slate-950/72 backdrop-blur-xl"
      : "border-slate-200 bg-white/80 backdrop-blur-xl",
    card: isDark
      ? "border-white/10 bg-slate-900/58 text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl"
      : "border-slate-200 bg-white/92 text-slate-950 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur-xl",
    soft: isDark ? "border-white/10 bg-white/7" : "border-slate-200 bg-slate-50",
    softHover: isDark ? "hover:border-cyan-300/30 hover:bg-cyan-300/8" : "hover:border-blue-200 hover:bg-blue-50",
    heading: isDark ? "text-white" : "text-slate-950",
    text: isDark ? "text-slate-100" : "text-slate-900",
    muted: isDark ? "text-slate-400" : "text-slate-600",
    faint: isDark ? "text-slate-500" : "text-slate-500",
    border: isDark ? "border-white/10" : "border-slate-200",
    accentText: isDark ? "text-cyan-300" : "text-blue-700",
    accentBg: isDark
      ? "border-cyan-300/35 bg-cyan-300 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.28)]"
      : "border-blue-600 bg-blue-600 text-white shadow-[0_14px_26px_rgba(37,99,235,0.22)]",
    input: isDark
      ? "border-white/10 bg-slate-950/60 text-slate-100 placeholder:text-slate-500 caret-cyan-400 selection:bg-cyan-300 selection:text-slate-950 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/35"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 caret-blue-600 selection:bg-blue-200 selection:text-slate-950 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/35"
  };
}

function Button({ children, icon: Icon, theme, variant = "primary", size = "md", className = "", type = "button", ...props }) {
  const variants = {
    primary: theme.isDark
      ? "border border-cyan-300/40 bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.28)] hover:bg-cyan-300"
      : "border border-blue-600 bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)] hover:bg-blue-700",
    secondary: theme.isDark
      ? "border border-white/15 bg-white/8 text-slate-100 hover:border-cyan-300/45 hover:bg-cyan-300/10"
      : "border border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50",
    ghost: theme.isDark ? "text-slate-300 hover:bg-white/8 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
    danger: "border border-rose-400/45 bg-rose-500/90 text-white hover:bg-rose-500",
    success: "border border-emerald-300/40 bg-emerald-400 text-slate-950 hover:bg-emerald-300"
  };
  const sizes = {
    sm: "min-h-9 px-3 text-xs",
    md: "min-h-11 px-4 text-sm",
    lg: "min-h-12 px-5 text-base"
  };

  return (
    <button
      type={type}
      className={classNames(
        "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span className="min-w-0">{children}</span>
    </button>
  );
}

function Card({ children, theme, className = "" }) {
  return (
    <motion.div
      className={classNames("rounded-lg border p-5", theme.card, className)}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

function Badge({ children, theme, tone = "neutral", className = "" }) {
  const tones = {
    neutral: theme.isDark ? "border-slate-400/20 bg-slate-400/10 text-slate-300" : "border-slate-300 bg-slate-100 text-slate-700",
    cyan: theme.isDark ? "border-cyan-300/25 bg-cyan-400/12 text-cyan-200" : "border-blue-200 bg-blue-50 text-blue-700",
    emerald: "border-emerald-300/25 bg-emerald-400/12 text-emerald-500",
    violet: "border-violet-300/25 bg-violet-400/12 text-violet-500",
    amber: "border-amber-300/25 bg-amber-400/12 text-amber-600",
    rose: "border-rose-300/25 bg-rose-400/12 text-rose-500"
  };

  return (
    <span className={classNames("inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-bold", tones[tone], className)}>
      {children}
    </span>
  );
}

function Field({ label, icon: Icon, theme, children }) {
  return (
    <label className={classNames("grid gap-2 text-sm font-bold", theme.text)}>
      <span className="flex items-center gap-2">
        {Icon ? <Icon className={classNames("h-4 w-4", theme.accentText)} /> : null}
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput({ theme, ...props }) {
  return <input className={classNames("min-h-11 rounded-lg border px-3 text-sm transition", theme.input)} {...props} />;
}

function SelectInput({ theme, ...props }) {
  return <select className={classNames("min-h-11 rounded-lg border px-3 text-sm transition", theme.input)} {...props} />;
}

function TextArea({ theme, ...props }) {
  return <textarea className={classNames("min-h-28 rounded-lg border px-3 py-3 text-sm transition", theme.input)} {...props} />;
}

function InlineMessage({ message, theme, tone = "danger" }) {
  if (!message) return null;
  const toneClass = tone === "success"
    ? "border-emerald-300/25 bg-emerald-400/12 text-emerald-400"
    : "border-rose-300/25 bg-rose-400/12 text-rose-300";

  return (
    <div className={classNames("rounded-lg border px-3 py-2 text-sm font-bold", toneClass)}>
      {message}
    </div>
  );
}

function SectionTitle({ eyebrow, title, children, theme }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className={classNames("text-xs font-black uppercase tracking-[0.2em]", theme.accentText)}>{eyebrow}</p> : null}
        <h2 className={classNames("mt-1 text-2xl font-black leading-tight", theme.heading)}>{title}</h2>
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, theme, tone = "cyan" }) {
  const toneClasses = {
    cyan: "from-cyan-400/22 to-blue-500/10 text-cyan-400",
    emerald: "from-emerald-400/22 to-cyan-500/10 text-emerald-400",
    violet: "from-violet-400/22 to-cyan-500/10 text-violet-400",
    amber: "from-amber-400/22 to-blue-500/10 text-amber-400"
  };
  return (
    <Card theme={theme} className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={classNames("text-sm", theme.muted)}>{label}</p>
          <p className={classNames("mt-2 text-2xl font-black", theme.heading)}>{value}</p>
          <p className={classNames("mt-1 text-xs", theme.faint)}>{detail}</p>
        </div>
        <div className={classNames("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function ProgressBar({ value, theme }) {
  return (
    <div className={classNames("h-2 overflow-hidden rounded-full", theme.isDark ? "bg-white/8" : "bg-slate-200")}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

function Sidebar({ c, theme, route, navigate, open, setOpen, currentUser }) {
  const isLoggedIn = !!currentUser;
  const isAdmin = currentUser?.role === "admin";

  const allNav = [
    [Home, "landing"],
    [LogIn, "login"],
    [LayoutDashboardIcon, "dashboard"],
    [Briefcase, "create"],
    [ReceiptText, "details"],
    [UploadCloud, "submit"],
    [CheckCircle2, "approval"],
    [Gavel, "disputes"],
    [Wallet, "wallet"],
    [Bell, "notifications"],
    [BadgeCheck, "profile"],
    [ShieldCheck, "admin"]
  ];

  const protectedIds = new Set(["dashboard", "create", "details", "submit", "approval", "disputes", "wallet", "notifications", "profile"]);
  const adminOnly = new Set(["admin"]);
  const nav = allNav.filter(([, id]) => {
    if (adminOnly.has(id)) return isAdmin;
    if (protectedIds.has(id)) return isLoggedIn;
    if (id === "login") return !isLoggedIn;
    return true;
  });

  function navLabel(id) {
    if (id === "create") return c.nav.create;
    if (id === "login") return c.nav.auth;
    return c.nav[id];
  }

  const panel = (
    <aside className={classNames("flex h-full w-72 flex-col border-r", theme.sidebar)}>
      <div className="flex h-20 items-center gap-3 px-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-300/12 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.18)]">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div>
          <p className={classNames("text-lg font-black", theme.heading)}>{c.brand}</p>
          <p className={classNames("text-xs", theme.faint)}>{c.product}</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {nav.map(([Icon, id]) => {
          const active = route === id;
          return (
            <button
              key={id}
              className={classNames(
                "mb-1 flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm font-bold transition",
                active ? theme.accentBg : `${theme.soft} ${theme.softHover} ${theme.muted}`
              )}
              onClick={() => {
                navigate(id);
                setOpen(false);
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">{navLabel(id)}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4">
        <div className={classNames("rounded-lg border p-4", theme.soft)}>
          <p className={classNames("text-sm font-black", theme.heading)}>{c.tagline}</p>
          <p className={classNames("mt-2 text-xs leading-5", theme.faint)}>USDT / VNDC · Polygon · MetaMask</p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{panel}</div>
      <AnimatePresence>
        {open ? (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-slate-950/70" onClick={() => setOpen(false)} aria-label="Close menu" />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 26, stiffness: 260 }} className="relative h-full">
              {panel}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function LayoutDashboardIcon(props) {
  return <Layers3 {...props} />;
}

function Header({ c, theme, language, setLanguage, themeName, setThemeName, setMobileOpen, wallet, navigate }) {
  return (
    <header className={classNames("sticky top-0 z-20 border-b", theme.header)}>
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button theme={theme} icon={Menu} variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileOpen(true)} />
          <div className="min-w-0">
            <p className={classNames("truncate text-sm font-black", theme.heading)}>{c.brand}</p>
            <p className={classNames("truncate text-xs", theme.faint)}>{c.product}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className={classNames("flex rounded-lg border p-1", theme.soft)}>
            {["en", "vi"].map((code) => (
              <button
                key={code}
                className={classNames(
                  "min-h-8 rounded-md px-3 text-xs font-black transition",
                  language === code ? theme.accentBg : theme.muted
                )}
                onClick={() => setLanguage(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <Button
            theme={theme}
            icon={themeName === "dark" ? Sun : Moon}
            variant="secondary"
            size="sm"
            onClick={() => setThemeName(themeName === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          />
          <Button theme={theme} icon={Wallet} size="sm" variant={wallet.connected ? "secondary" : "primary"} onClick={() => navigate("wallet")}>
            <span className="hidden sm:inline">{wallet.connected ? wallet.short : c.common.connectWallet}</span>
            <span className="sm:hidden">{wallet.connected ? "0x" : "Wallet"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function LandingPage({ c, theme, language, navigate, currentUser, addToast }) {
  function guardedNavigate(route) {
    if (!currentUser) {
      addToast("requireLogin");
      navigate("login");
      return;
    }
    navigate(route);
  }

  return (
    <div className="space-y-10">
      <section className={classNames("relative overflow-hidden rounded-lg border p-6 sm:p-8 lg:p-10", theme.card)}>
        <div className="hero-grid absolute inset-0 opacity-80" />
        <div className="absolute right-[-80px] top-[-120px] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Badge theme={theme} tone="cyan">{c.landing.heroEyebrow}</Badge>
            <h1 className={classNames("mt-5 max-w-4xl text-4xl font-black leading-[1.12] tracking-tight sm:text-6xl", theme.heading)}>
              {c.landing.title}
            </h1>
            <p className={classNames("mt-5 max-w-2xl text-base leading-7 sm:text-lg", theme.muted)}>{c.landing.subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button theme={theme} icon={Rocket} size="lg" onClick={() => guardedNavigate("create")}>{c.common.createJob}</Button>
              <Button theme={theme} icon={LayoutDashboardIcon} size="lg" variant="secondary" onClick={() => guardedNavigate("dashboard")}>{c.common.viewDashboard}</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {c.landing.metrics.map(([label, value], index) => (
          <StatCard key={label} theme={theme} icon={[CircleDollarSign, Briefcase, Gavel, TimerReset][index]} label={label} value={value} detail="EscrowX network" tone={["cyan", "emerald", "violet", "amber"][index]} />
        ))}
      </div>

      <Card theme={theme}>
        <SectionTitle theme={theme} eyebrow={c.landing.howSubtitle} title={c.landing.howTitle} />
        <div className="grid gap-3 lg:grid-cols-5">
          {c.landing.steps.map(([label, detail], index) => (
            <motion.div key={label} className={classNames("relative rounded-lg border p-4", theme.soft)} whileHover={{ y: -4 }}>
              <div className={classNames("mb-4 flex h-10 w-10 items-center justify-center rounded-lg", index < 2 ? "bg-cyan-400/12 text-cyan-300" : "bg-blue-400/12 text-blue-300")}>
                <span className="text-sm font-black">0{index + 1}</span>
              </div>
              <p className={classNames("font-black leading-tight", theme.heading)}>{label}</p>
              <p className={classNames("mt-2 text-sm leading-6", theme.muted)}>{detail}</p>
              {index < c.landing.steps.length - 1 ? <ArrowRight className={classNames("absolute right-3 top-5 hidden h-4 w-4 lg:block", theme.accentText)} /> : null}
            </motion.div>
          ))}
        </div>
      </Card>

      <Card theme={theme}>
        <SectionTitle theme={theme} eyebrow={c.landing.categoriesSubtitle} title={c.landing.categoriesTitle} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {serviceCategories.map(({ icon: Icon, en, vi }) => (
            <motion.div key={en} className={classNames("rounded-lg border p-4 transition", theme.soft, theme.softHover)} whileHover={{ y: -4 }}>
              <Icon className={classNames("h-6 w-6", theme.accentText)} />
              <p className={classNames("mt-3 font-black", theme.heading)}>{language === "vi" ? vi : en}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card theme={theme}>
        <SectionTitle theme={theme} title={c.landing.benefitsTitle} />
        <div className="grid gap-4 md:grid-cols-5">
          {c.landing.benefits.map(([label, detail], index) => (
            <div key={label} className={classNames("rounded-lg border p-4", theme.soft)}>
              <ShieldCheck className={classNames("h-5 w-5", index % 2 ? "text-blue-400" : "text-cyan-400")} />
              <p className={classNames("mt-3 font-black leading-tight", theme.heading)}>{label}</p>
              <p className={classNames("mt-2 text-sm leading-6", theme.muted)}>{detail}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AuthPage({ type, c, theme, navigate, addToast, setApiToken, setCurrentUser, setWallet }) {
  const [isLogin, setIsLogin] = useState(type === "login");
  const [status, setStatus] = useState({ loading: false, message: "" });

  function switchTab(toLogin) {
    setIsLogin(toLogin);
    setStatus({ loading: false, message: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (!isLogin && password !== confirmPassword) {
      setStatus({ loading: false, message: "Password confirmation does not match." });
      return;
    }

    setStatus({ loading: true, message: "" });

    try {
      const payload = isLogin
        ? { email: form.get("email"), password }
        : {
            name: form.get("name"),
            email: form.get("email"),
            password,
          };
      const auth = await apiRequest(`/api/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      let nextUser = auth.user;
      const walletAddress = String(form.get("walletAddress") || "").trim();

      if (!isLogin && walletAddress) {
        try {
          const walletResult = await apiRequest("/api/auth/wallet", {
            method: "PATCH",
            token: auth.token,
            body: JSON.stringify({ walletAddress })
          });
          nextUser = walletResult.user;
        } catch (walletErr) {
          // wallet patch failed but account was created — still proceed to login
        }
      }

      if (isLogin) {
        window.localStorage.setItem("escrowx-token", auth.token);
        window.localStorage.setItem("escrowx-user", JSON.stringify(nextUser));
        setApiToken(auth.token);
        setCurrentUser(nextUser);
        if (nextUser?.walletAddress) {
          setWallet((current) => ({
            ...current,
            connected: true,
            address: nextUser.walletAddress,
            short: shortAddress(nextUser.walletAddress),
            status: c.status.connected
          }));
        }
        addToast("approved");
        navigate("dashboard");
      } else {
        setIsLogin(true);
        setStatus({ loading: false, message: c.auth.registerSuccess });
        return;
      }
    } catch (error) {
      setStatus({ loading: false, message: error.message });
      return;
    }

    setStatus({ loading: false, message: "" });
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-6">
      <Card theme={theme} className="w-full max-w-md p-6">
        <div className={classNames("mb-6 grid grid-cols-2 rounded-lg border p-1", theme.soft)}>
          <button
            type="button"
            onClick={() => switchTab(false)}
            className={classNames(
              "rounded-md py-2.5 text-sm font-black transition-all",
              !isLogin ? theme.accentBg : theme.muted
            )}
          >
            {c.nav.register}
          </button>
          <button
            type="button"
            onClick={() => switchTab(true)}
            className={classNames(
              "rounded-md py-2.5 text-sm font-black transition-all",
              isLogin ? theme.accentBg : theme.muted
            )}
          >
            {c.nav.login}
          </button>
        </div>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <Field theme={theme} label={c.common.fullName} icon={User}>
              <TextInput theme={theme} name="name" placeholder="Nguyen An" required />
            </Field>
          )}
          <Field theme={theme} label={c.common.email} icon={Mail}>
            <TextInput theme={theme} name="email" type="email" placeholder="founder@escrowx.io" required />
          </Field>
          <Field theme={theme} label={c.common.password} icon={LockKeyhole}>
            <TextInput theme={theme} name="password" type="password" placeholder="password" required minLength={8} />
          </Field>
          {!isLogin && (
            <>
              <Field theme={theme} label={c.common.confirmPassword} icon={LockKeyhole}>
                <TextInput theme={theme} name="confirmPassword" type="password" placeholder="password" required minLength={8} />
              </Field>
              <Field theme={theme} label={c.common.walletAddress} icon={Wallet}>
                <TextInput theme={theme} name="walletAddress" placeholder="0x..." />
              </Field>
            </>
          )}
          <InlineMessage message={status.message} theme={theme} />
          <Button theme={theme} type="submit" icon={isLogin ? LogIn : Rocket} disabled={status.loading}>
            {status.loading ? "Connecting..." : isLogin ? c.nav.login : c.nav.register}
          </Button>
          {isLogin && (
            <Button theme={theme} icon={Wallet} variant="secondary" onClick={() => navigate("wallet")}>
              {c.auth.walletMethod}
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}

function DashboardPage({ c, theme, language, navigate, escrows, refreshEscrows, setSelectedEscrow, apiToken }) {
  const [tab, setTab] = useState("active");

  useEffect(() => {
    if (apiToken) refreshEscrows();
  }, [apiToken, refreshEscrows]);

  const liveRows = escrows.map((escrow) => ({
    id: escrow._id,
    service: escrow.serviceName,
    freelancer: escrow.freelancer?.name || escrow.freelancer?.walletAddress || "Freelancer",
    amount: formatEscrowAmount(escrow.amount),
    status: escrowStatusKey(escrow.status),
    raw: escrow
  }));
  const activeRows = liveRows.length ? liveRows.filter((row) => !["released", "refunded"].includes(row.status)) : null;
  const completedRows = liveRows.length ? liveRows.filter((row) => ["released", "refunded"].includes(row.status)) : null;
  const disputeRows = liveRows.length ? liveRows.filter((row) => row.raw.status === "DISPUTED") : null;

  return (
    <div className="space-y-6">
      <PageIntro title={c.dashboard.title} subtitle={c.dashboard.subtitle} theme={theme} />
      <div className="grid gap-4 md:grid-cols-4">
        {c.dashboard.cards.map(([label, value, detail], index) => (
          <StatCard key={label} theme={theme} icon={[CircleDollarSign, Briefcase, FileCheck2, AlertTriangle][index]} label={label} value={value} detail={detail} tone={["cyan", "emerald", "violet", "amber"][index]} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
        <Card theme={theme}>
          <SectionTitle theme={theme} title={c.nav.dashboard}>
            {["active", "completed", "disputes"].map((key) => (
              <Button key={key} theme={theme} size="sm" variant={tab === key ? "primary" : "secondary"} onClick={() => setTab(key)}>
                {c.dashboard.tabs[key]}
              </Button>
            ))}
          </SectionTitle>
          {tab === "active" ? <JobsTable type="active" rows={activeRows} c={c} theme={theme} language={language} navigate={navigate} setSelectedEscrow={setSelectedEscrow} /> : null}
          {tab === "completed" ? <JobsTable type="completed" rows={completedRows} c={c} theme={theme} language={language} navigate={navigate} setSelectedEscrow={setSelectedEscrow} /> : null}
          {tab === "disputes" ? <JobsTable type="disputes" rows={disputeRows} c={c} theme={theme} language={language} navigate={navigate} setSelectedEscrow={setSelectedEscrow} /> : null}
        </Card>
        <div className="grid gap-4">
          <Card theme={theme}>
            <SectionTitle theme={theme} title={c.dashboard.feedTitle} />
            <div className="grid gap-3">
              {feed.map((item) => (
                <div key={item.en} className={classNames("flex items-center gap-3 rounded-lg border p-3", theme.soft)}>
                  <span className={classNames("h-2.5 w-2.5 rounded-full", item.tone === "cyan" ? "bg-cyan-400" : item.tone === "emerald" ? "bg-emerald-400" : item.tone === "amber" ? "bg-amber-400" : "bg-violet-400")} />
                  <p className={classNames("text-sm", theme.text)}>{text(item, language)}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card theme={theme}>
            <SectionTitle theme={theme} title={c.dashboard.adoptionTitle} />
            <div className="grid gap-4">
              {demand.map(([label, value]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className={theme.text}>{label}</span>
                    <span className={theme.accentText}>{value}%</span>
                  </div>
                  <ProgressBar value={value} theme={theme} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function JobsTable({ type, rows, c, theme, language, navigate, setSelectedEscrow }) {
  const tableRows = rows || jobs[type];
  return (
    <div className={classNames("overflow-hidden rounded-lg border", theme.border)}>
      <div className={classNames("hidden grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr] px-4 py-3 text-xs font-black uppercase tracking-[0.14em] md:grid", theme.soft, theme.faint)}>
        <span>{c.common.service}</span>
        <span>{c.common.freelancer}</span>
        <span>{c.common.amount}</span>
        <span>{c.common.status}</span>
        <span>{c.common.action}</span>
      </div>
      {tableRows.map((job) => (
        <div key={job.id} className={classNames("grid gap-3 border-t px-4 py-4 md:grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr] md:items-center", theme.border)}>
          <div>
            <p className={classNames("font-black", theme.heading)}>{text(job.service, language)}</p>
            <p className={classNames("text-xs", theme.faint)}>{job.id}</p>
          </div>
          <p className={classNames("text-sm", theme.muted)}>{job.freelancer}</p>
          <p className={classNames("font-bold", theme.accentText)}>{job.amount}</p>
          <Badge theme={theme} tone={type === "disputes" ? "amber" : job.status === "released" ? "emerald" : "cyan"}>{c.status[job.status || job.result]}</Badge>
          <Button theme={theme} size="sm" variant="secondary" icon={type === "disputes" ? Gavel : ReceiptText} onClick={() => {
            if (job.raw) setSelectedEscrow(job.raw);
            navigate(type === "disputes" ? "disputes" : "details");
          }}>
            {type === "disputes" ? c.nav.disputes : c.nav.details}
          </Button>
        </div>
      ))}
    </div>
  );
}

function PageIntro({ title, subtitle, theme }) {
  return (
    <div>
      <h1 className={classNames("text-3xl font-black tracking-tight", theme.heading)}>{title}</h1>
      <p className={classNames("mt-2 max-w-3xl leading-7", theme.muted)}>{subtitle}</p>
    </div>
  );
}

function FormSection({ title, icon: Icon, theme, children }) {
  return (
    <div className="grid gap-4">
      <div className={classNames("flex items-center gap-2 border-b pb-3", theme.border)}>
        {Icon && <Icon className={classNames("h-4 w-4 shrink-0", theme.accentText)} />}
        <p className={classNames("text-xs font-black uppercase tracking-[0.18em]", theme.accentText)}>{title}</p>
      </div>
      {children}
    </div>
  );
}

function CheckboxRow({ label, checked, onChange, theme }) {
  return (
    <label className={classNames(
      "flex cursor-pointer select-none items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition",
      checked
        ? theme.isDark ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200" : "border-blue-400 bg-blue-50 text-blue-800"
        : `${theme.soft} ${theme.muted}`
    )}>
      <span className={classNames(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
        checked
          ? theme.isDark ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-blue-600 bg-blue-600 text-white"
          : theme.isDark ? "border-white/25" : "border-slate-300"
      )}>
        {checked && <CheckCircle2 className="h-3 w-3" />}
      </span>
      {label}
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} readOnly />
    </label>
  );
}

function CreateJobPage({ c, theme, navigate, addToast, apiToken, refreshEscrows, setSelectedEscrow, currentUser, escrows, availableEscrows, refreshAvailableEscrows }) {
  const [tab, setTab] = useState("post");
  // ── Controlled form state (all sections) ─────────────────────────────────
  const [fd, setFd] = useState({
    // Job Information
    serviceName:       "Landing Page Development",
    serviceCategory:   "",
    skillRequirements: "",
    jobDescription:    "Build a responsive Web3 landing page for a SaaS launch with pricing, FAQ, and wallet CTA.",
    // Financial Terms
    amount:               "1250",
    paymentToken:         "USDT",
    gasFeeResponsibility: "client",
    // Deliverables
    expectedDeliverables:      "",
    deliverableFormat:         [],
    submissionLinkRequirement: "required",
    // Acceptance Criteria
    acceptanceChecklist: [],
    qualityStandard:     "",
    testingRequirement:  "none",
    // Timeline
    deadline:          "2026-06-28",
    gracePeriod:       1,
    reviewPeriod:      3,
    autoReleasePeriod: 5,
    // Revision Policy
    numberOfRevisions: "2",
    revisionScope:     "",
    // Cancellation Policy
    clientCancellationRule:   "",
    freelancerWithdrawalRule: "",
    refundRule:               "",
    // Evidence Rules
    acceptedEvidenceTypes: [],
    timestampSource:       "blockchain",
    communicationLogUsage: "allowed",
    // Dispute Resolution
    disputeReasons:            [],
    evidenceUploadRequirement: "both",
    reviewerDecisionOptions:   [],
    appealPolicy:              "none",
    // Legal & Ownership
    intellectualPropertyTransfer: "",
    confidentialityRequirement:   "public",
    commercialUsageRights:        "commercial",
  });

  const [errors,  setErrors]  = useState({});
  const [status,  setStatus]  = useState({ loading: false, lockingId: null, message: "" });

  function set(field, value) {
    setFd(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  }

  function toggleArr(field, item) {
    setFd(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(x => x !== item)
        : [...prev[field], item],
    }));
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  }

  function validate() {
    const e = {};
    if (!fd.serviceName.trim())                              e.serviceName             = "Service name is required";
    if (!fd.jobDescription.trim())                           e.jobDescription          = "Job description is required";
    if (!fd.amount || parseFloat(fd.amount) <= 0)           e.amount                  = "Budget must be greater than 0";
    if (!fd.deadline || new Date(fd.deadline) <= new Date()) e.deadline               = "Deadline must be in the future";
    if (!fd.serviceCategory)                                 e.serviceCategory         = "Service category is required";
    if (!fd.expectedDeliverables.trim())                     e.expectedDeliverables    = "Expected deliverables is required";
    if (fd.acceptanceChecklist.length === 0)                 e.acceptanceChecklist     = "At least one acceptance criterion is required";
    if (!fd.reviewPeriod      || Number(fd.reviewPeriod)      <= 0) e.reviewPeriod      = "Review period must be greater than 0";
    if (!fd.autoReleasePeriod || Number(fd.autoReleasePeriod) <= 0) e.autoReleasePeriod = "Auto release period must be greater than 0";
    if (fd.acceptedEvidenceTypes.length === 0)               e.acceptedEvidenceTypes   = "At least one evidence type must be selected";
    if (!fd.intellectualPropertyTransfer)                    e.intellectualPropertyTransfer = "IP transfer must be selected";
    return e;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  async function handleSubmit(event) {
    event.preventDefault();
    if (!apiToken) {
      setStatus({ loading: false, lockingId: null, message: "Please log in before creating an escrow." });
      return;
    }
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setStatus({ loading: false, lockingId: null, message: "Please fix the errors highlighted above." });
      return;
    }
    setStatus({ loading: true, lockingId: null, message: "" });
    try {
      const result = await apiRequest("/api/escrows", {
        method: "POST",
        token: apiToken,
        body: JSON.stringify({
          ...fd,
          gracePeriod:       Number(fd.gracePeriod),
          reviewPeriod:      Number(fd.reviewPeriod),
          autoReleasePeriod: Number(fd.autoReleasePeriod),
        })
      });
      setSelectedEscrow(result.escrow);
      await refreshEscrows();
      addToast("deposit");
      navigate("details");
    } catch (error) {
      setStatus({ loading: false, lockingId: null, message: error.message });
      return;
    }
    setStatus({ loading: false, lockingId: null, message: "" });
  }

  async function handleLock(escrowId) {
    if (!apiToken) return;
    setStatus({ loading: true, lockingId: escrowId, message: "" });
    try {
      const result = await apiRequest(`/api/escrows/${escrowId}/lock`, {
        method: "PATCH",
        token: apiToken
      });
      setSelectedEscrow(result.escrow);
      await Promise.all([refreshEscrows(), refreshAvailableEscrows()]);
      addToast("locked");
      navigate("details");
    } catch (error) {
      setStatus({ loading: false, lockingId: null, message: error.message });
      return;
    }
    setStatus({ loading: false, lockingId: null, message: "" });
  }

  function postedJobStatus(escrow) {
    const s = escrow.status;
    if (s === "RELEASED" || s === "REFUNDED" || s === "CANCELLED") return null;
    if (s === "DISPUTED" || s === "REVIEWING_DISPUTE")       return { label: c.status.open,            tone: "rose"   };
    if (s === "SUBMITTED" || s === "REVISION_REQUESTED")     return { label: c.status.submitted,        tone: "amber"  };
    if (s === "DEPOSITED")                                   return { label: c.status.deposited,        tone: "violet" };
    if (s === "ACCEPTED")                                    return { label: c.status.accepted,         tone: "cyan"   };
    if (s === "CREATED" && escrow.freelancer)                return { label: c.create.statusAssigned,   tone: "cyan"   };
    return { label: c.create.statusOpen, tone: "emerald" };
  }

  const myPostedEscrows = escrows
    .filter(e => String(e.client?._id || e.client) === String(currentUser?._id || currentUser?.id))
    .filter(e => postedJobStatus(e) !== null);

  // ── Option lists ─────────────────────────────────────────────────────────
  const deliverableFormatOpts     = ["Source Code","Figma File","PDF","ZIP File","Deployment URL","GitHub Repository","Google Drive Link","Video Demo","Other"];
  const acceptanceChecklistOpts   = ["Matches project description","Meets all listed deliverables","Responsive design","No critical bugs","Source code is accessible","Deployment link works","Meets deadline","Other"];
  const evidenceTypeOpts          = ["GitHub commits","Screenshots","Video demo","Deployment URL","Source code repository","Chat messages","Transaction hash","Delivery link","Other"];
  const disputeReasonOpts         = ["Missing deliverables","Late delivery","Poor quality","Wrong scope","Non-payment concern","Freelancer inactivity","Client inactivity","Suspected scam","Other"];
  const reviewerDecisionOpts      = ["Release full payment to freelancer","Refund full amount to client","Split payment","Request additional evidence"];

  function Err({ field }) {
    return errors[field] ? <p className="mt-1 text-xs font-bold text-rose-400">{errors[field]}</p> : null;
  }

  // ── TABBED VIEW: "post" = đăng hợp đồng | "find" = tìm việc ──────────────
  return (
    <div className="space-y-6">
      <div className={classNames("grid grid-cols-2 gap-1 rounded-lg p-1", theme.soft)}>
        <button type="button" onClick={() => setTab("post")} className={classNames("rounded-md py-2.5 text-sm font-black transition-all", tab === "post" ? theme.accentBg : theme.muted)}>{c.create.title}</button>
        <button type="button" onClick={() => setTab("find")} className={classNames("rounded-md py-2.5 text-sm font-black transition-all", tab === "find" ? theme.accentBg : theme.muted)}>{c.create.jobsTitle}</button>
      </div>
      {tab === "post" && <>
      <PageIntro title={c.create.title} subtitle={c.create.subtitle} theme={theme} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">

        {/* ── FORM ── */}
        <form className="grid gap-6" onSubmit={handleSubmit} noValidate>

          {/* 1 · JOB INFORMATION */}
          <Card theme={theme}>
            <FormSection title="Job Information" icon={Briefcase} theme={theme}>
              <Field theme={theme} label={c.create.serviceName} icon={Briefcase}>
                <TextInput theme={theme} value={fd.serviceName} onChange={e => set("serviceName", e.target.value)} />
                <Err field="serviceName" />
              </Field>
              <Field theme={theme} label="Service Category" icon={Layers3}>
                <SelectInput theme={theme} value={fd.serviceCategory} onChange={e => set("serviceCategory", e.target.value)}>
                  <option value="">— Select category —</option>
                  <option>Web Development</option>
                  <option>UI/UX Design</option>
                  <option>Smart Contract Development</option>
                  <option>Content Writing</option>
                  <option>Marketing</option>
                  <option>Data Analysis</option>
                  <option>Other</option>
                </SelectInput>
                <Err field="serviceCategory" />
              </Field>
              <Field theme={theme} label="Skill Requirements" icon={GraduationCap}>
                <TextArea theme={theme} placeholder="e.g. React, Solidity, 2+ years, Figma experience…" value={fd.skillRequirements} onChange={e => set("skillRequirements", e.target.value)} />
              </Field>
              <Field theme={theme} label={c.create.description} icon={FileText}>
                <TextArea theme={theme} value={fd.jobDescription} onChange={e => set("jobDescription", e.target.value)} />
                <Err field="jobDescription" />
              </Field>
            </FormSection>
          </Card>

          {/* 2 · FINANCIAL TERMS */}
          <Card theme={theme}>
            <FormSection title="Financial Terms" icon={CircleDollarSign} theme={theme}>
              <div className="grid gap-4 md:grid-cols-3">
                <Field theme={theme} label={c.create.budget} icon={Coins}>
                  <TextInput theme={theme} type="number" min="0" value={fd.amount} onChange={e => set("amount", e.target.value)} />
                  <Err field="amount" />
                </Field>
                <Field theme={theme} label="Payment Token" icon={CreditCard}>
                  <SelectInput theme={theme} value={fd.paymentToken} onChange={e => set("paymentToken", e.target.value)}>
                    <option>USDT</option>
                    <option>VNDC</option>
                    <option>POL</option>
                  </SelectInput>
                </Field>
                <Field theme={theme} label="Gas Fee Responsibility" icon={Zap}>
                  <SelectInput theme={theme} value={fd.gasFeeResponsibility} onChange={e => set("gasFeeResponsibility", e.target.value)}>
                    <option value="client">Client pays gas fees</option>
                    <option value="freelancer">Freelancer pays gas fees</option>
                    <option value="each">Each party pays their own</option>
                  </SelectInput>
                </Field>
              </div>
            </FormSection>
          </Card>

          {/* 3 · DELIVERABLES */}
          <Card theme={theme}>
            <FormSection title="Deliverables" icon={FileCheck2} theme={theme}>
              <Field theme={theme} label="Expected Deliverables" icon={ClipboardCheck}>
                <TextArea theme={theme} placeholder="e.g. Fully responsive landing page with source code and deployment link…" value={fd.expectedDeliverables} onChange={e => set("expectedDeliverables", e.target.value)} />
                <Err field="expectedDeliverables" />
              </Field>
              <div>
                <p className={classNames("mb-3 text-sm font-bold", theme.text)}>Deliverable Format</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {deliverableFormatOpts.map(opt => (
                    <CheckboxRow key={opt} label={opt} checked={fd.deliverableFormat.includes(opt)} onChange={() => toggleArr("deliverableFormat", opt)} theme={theme} />
                  ))}
                </div>
              </div>
              <Field theme={theme} label="Submission Link Requirement" icon={Globe2}>
                <SelectInput theme={theme} value={fd.submissionLinkRequirement} onChange={e => set("submissionLinkRequirement", e.target.value)}>
                  <option value="required">Required</option>
                  <option value="optional">Optional</option>
                  <option value="none">Not Required</option>
                </SelectInput>
              </Field>
            </FormSection>
          </Card>

          {/* 4 · ACCEPTANCE CRITERIA */}
          <Card theme={theme}>
            <FormSection title="Acceptance Criteria" icon={BadgeCheck} theme={theme}>
              <div>
                <p className={classNames("mb-3 text-sm font-bold", theme.text)}>Acceptance Checklist</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {acceptanceChecklistOpts.map(opt => (
                    <CheckboxRow key={opt} label={opt} checked={fd.acceptanceChecklist.includes(opt)} onChange={() => toggleArr("acceptanceChecklist", opt)} theme={theme} />
                  ))}
                </div>
                <Err field="acceptanceChecklist" />
              </div>
              <Field theme={theme} label="Quality Standard" icon={Sparkles}>
                <TextArea theme={theme} placeholder="e.g. Lighthouse score ≥ 90, responsive on mobile, no console errors…" value={fd.qualityStandard} onChange={e => set("qualityStandard", e.target.value)} />
              </Field>
              <Field theme={theme} label="Testing Requirement" icon={Activity}>
                <SelectInput theme={theme} value={fd.testingRequirement} onChange={e => set("testingRequirement", e.target.value)}>
                  <option value="none">No testing required</option>
                  <option value="demo">Basic demo required</option>
                  <option value="screenshots">Screenshots required</option>
                  <option value="video">Video demo required</option>
                  <option value="test_cases">Test cases required</option>
                </SelectInput>
              </Field>
            </FormSection>
          </Card>

          {/* 5 · TIMELINE */}
          <Card theme={theme}>
            <FormSection title="Timeline" icon={Clock3} theme={theme}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Field theme={theme} label={c.create.deadline} icon={Clock3}>
                  <TextInput theme={theme} type="date" value={fd.deadline} onChange={e => set("deadline", e.target.value)} />
                  <Err field="deadline" />
                </Field>
                <Field theme={theme} label="Grace Period (days)" icon={TimerReset}>
                  <TextInput theme={theme} type="number" min="0" value={fd.gracePeriod} onChange={e => set("gracePeriod", e.target.value)} />
                </Field>
                <Field theme={theme} label="Review Period (days)" icon={FileCheck2}>
                  <TextInput theme={theme} type="number" min="1" value={fd.reviewPeriod} onChange={e => set("reviewPeriod", e.target.value)} />
                  <Err field="reviewPeriod" />
                </Field>
                <Field theme={theme} label="Auto Release (days)" icon={Zap}>
                  <TextInput theme={theme} type="number" min="1" value={fd.autoReleasePeriod} onChange={e => set("autoReleasePeriod", e.target.value)} />
                  <Err field="autoReleasePeriod" />
                </Field>
              </div>
            </FormSection>
          </Card>

          {/* 6 · REVISION POLICY */}
          <Card theme={theme}>
            <FormSection title="Revision Policy" icon={Radio} theme={theme}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field theme={theme} label="Number of Revisions" icon={Radio}>
                  <SelectInput theme={theme} value={fd.numberOfRevisions} onChange={e => set("numberOfRevisions", e.target.value)}>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="unlimited">Unlimited</option>
                  </SelectInput>
                </Field>
                <Field theme={theme} label="Revision Scope" icon={FileText}>
                  <TextArea theme={theme} placeholder="e.g. Bug fixes are free. New feature requests require a new contract…" value={fd.revisionScope} onChange={e => set("revisionScope", e.target.value)} />
                </Field>
              </div>
            </FormSection>
          </Card>

          {/* 7 · CANCELLATION & REFUND */}
          <Card theme={theme}>
            <FormSection title="Cancellation & Refund Policy" icon={X} theme={theme}>
              <Field theme={theme} label="Client Cancellation Rule" icon={Users}>
                <TextArea theme={theme} placeholder="e.g. Client may cancel before deposit with no penalty…" value={fd.clientCancellationRule} onChange={e => set("clientCancellationRule", e.target.value)} />
              </Field>
              <Field theme={theme} label="Freelancer Withdrawal Rule" icon={Users}>
                <TextArea theme={theme} placeholder="e.g. Freelancer may withdraw before client deposits with no penalty…" value={fd.freelancerWithdrawalRule} onChange={e => set("freelancerWithdrawalRule", e.target.value)} />
              </Field>
              <Field theme={theme} label="Refund Rule" icon={CircleDollarSign}>
                <TextArea theme={theme} placeholder="e.g. Full refund if cancelled before work starts. Partial refund based on progress…" value={fd.refundRule} onChange={e => set("refundRule", e.target.value)} />
              </Field>
            </FormSection>
          </Card>

          {/* 8 · EVIDENCE RULES */}
          <Card theme={theme}>
            <FormSection title="Evidence Rules for Dispute" icon={UploadCloud} theme={theme}>
              <div>
                <p className={classNames("mb-3 text-sm font-bold", theme.text)}>Accepted Evidence Types</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {evidenceTypeOpts.map(opt => (
                    <CheckboxRow key={opt} label={opt} checked={fd.acceptedEvidenceTypes.includes(opt)} onChange={() => toggleArr("acceptedEvidenceTypes", opt)} theme={theme} />
                  ))}
                </div>
                <Err field="acceptedEvidenceTypes" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field theme={theme} label="Timestamp Source" icon={Clock3}>
                  <SelectInput theme={theme} value={fd.timestampSource} onChange={e => set("timestampSource", e.target.value)}>
                    <option value="blockchain">Blockchain timestamp</option>
                    <option value="platform">Platform timestamp</option>
                    <option value="git">Git commit timestamp</option>
                    <option value="mixed">Mixed evidence timestamp</option>
                  </SelectInput>
                </Field>
                <Field theme={theme} label="Communication Log Usage" icon={MessageCircle}>
                  <SelectInput theme={theme} value={fd.communicationLogUsage} onChange={e => set("communicationLogUsage", e.target.value)}>
                    <option value="allowed">Allow platform messages as evidence</option>
                    <option value="not_allowed">Do not use platform messages</option>
                  </SelectInput>
                </Field>
              </div>
            </FormSection>
          </Card>

          {/* 9 · DISPUTE RESOLUTION */}
          <Card theme={theme}>
            <FormSection title="Dispute Resolution Terms" icon={Gavel} theme={theme}>
              <div>
                <p className={classNames("mb-3 text-sm font-bold", theme.text)}>Dispute Reasons</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {disputeReasonOpts.map(opt => (
                    <CheckboxRow key={opt} label={opt} checked={fd.disputeReasons.includes(opt)} onChange={() => toggleArr("disputeReasons", opt)} theme={theme} />
                  ))}
                </div>
              </div>
              <div>
                <p className={classNames("mb-3 text-sm font-bold", theme.text)}>Reviewer Decision Options</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {reviewerDecisionOpts.map(opt => (
                    <CheckboxRow key={opt} label={opt} checked={fd.reviewerDecisionOptions.includes(opt)} onChange={() => toggleArr("reviewerDecisionOptions", opt)} theme={theme} />
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field theme={theme} label="Evidence Upload Requirement" icon={UploadCloud}>
                  <SelectInput theme={theme} value={fd.evidenceUploadRequirement} onChange={e => set("evidenceUploadRequirement", e.target.value)}>
                    <option value="both">Required for both parties</option>
                    <option value="initiator">Required only for dispute initiator</option>
                    <option value="optional">Optional</option>
                  </SelectInput>
                </Field>
                <Field theme={theme} label="Appeal Policy" icon={ShieldCheck}>
                  <SelectInput theme={theme} value={fd.appealPolicy} onChange={e => set("appealPolicy", e.target.value)}>
                    <option value="none">No appeal</option>
                    <option value="one">One appeal allowed</option>
                    <option value="new_evidence">Appeal with new evidence only</option>
                  </SelectInput>
                </Field>
              </div>
            </FormSection>
          </Card>

          {/* 10 · LEGAL & OWNERSHIP */}
          <Card theme={theme}>
            <FormSection title="Legal & Ownership Terms" icon={ShieldCheck} theme={theme}>
              <Field theme={theme} label="Intellectual Property Transfer" icon={Fingerprint}>
                <SelectInput theme={theme} value={fd.intellectualPropertyTransfer} onChange={e => set("intellectualPropertyTransfer", e.target.value)}>
                  <option value="">— Select IP terms —</option>
                  <option value="transfer_on_payment">Transfers to client after payment release</option>
                  <option value="remains_freelancer">Remains with freelancer</option>
                  <option value="shared">Shared ownership</option>
                  <option value="custom">Custom</option>
                </SelectInput>
                <Err field="intellectualPropertyTransfer" />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field theme={theme} label="Confidentiality" icon={LockKeyhole}>
                  <SelectInput theme={theme} value={fd.confidentialityRequirement} onChange={e => set("confidentialityRequirement", e.target.value)}>
                    <option value="public">Public work allowed</option>
                    <option value="confidential">Confidential work</option>
                    <option value="nda">NDA required outside platform</option>
                  </SelectInput>
                </Field>
                <Field theme={theme} label="Commercial Usage Rights" icon={TrendingUp}>
                  <SelectInput theme={theme} value={fd.commercialUsageRights} onChange={e => set("commercialUsageRights", e.target.value)}>
                    <option value="commercial">Client may use commercially</option>
                    <option value="internal">Internal purposes only</option>
                    <option value="custom">Custom usage rights</option>
                  </SelectInput>
                </Field>
              </div>
            </FormSection>
          </Card>

          {/* SUBMIT */}
          <div className="grid gap-3">
            <InlineMessage message={status.message} theme={theme} />
            <Button theme={theme} type="submit" icon={Rocket} size="lg" disabled={status.loading}>
              {status.loading ? "Posting..." : c.common.createEscrow}
            </Button>
          </div>
        </form>

        {/* ── CONTRACT SUMMARY (sticky sidebar) ── */}
        <div className="grid gap-4 self-start xl:sticky xl:top-24">
          <Card theme={theme}>
            <SectionTitle theme={theme} eyebrow={c.common.contract} title={c.create.previewTitle} />
            <p className={classNames("mb-4 text-xs leading-5", theme.muted)}>{c.create.previewCopy}</p>
            <div className="grid gap-2.5 text-sm">
              {[
                ["Service",        fd.serviceName],
                ["Category",       fd.serviceCategory],
                ["Budget",         fd.amount ? `${fd.amount} ${fd.paymentToken}` : ""],
                ["Gas fees",       fd.gasFeeResponsibility === "client" ? "Client pays" : fd.gasFeeResponsibility === "freelancer" ? "Freelancer pays" : "Each pays own"],
                ["Deadline",       fd.deadline],
                ["Grace period",   fd.gracePeriod   ? `${fd.gracePeriod} day(s)`   : ""],
                ["Review period",  fd.reviewPeriod  ? `${fd.reviewPeriod} day(s)`  : ""],
                ["Auto release",   fd.autoReleasePeriod ? `${fd.autoReleasePeriod} day(s)` : ""],
                ["Revisions",      fd.numberOfRevisions],
                ["Sub. link",      fd.submissionLinkRequirement],
                ["Testing",        fd.testingRequirement !== "none" ? fd.testingRequirement : ""],
                ["Evidence req.",  fd.evidenceUploadRequirement === "both" ? "Both parties" : fd.evidenceUploadRequirement === "initiator" ? "Initiator only" : "Optional"],
                ["Appeal",         fd.appealPolicy === "none" ? "No appeal" : fd.appealPolicy === "one" ? "One appeal" : "New evidence only"],
                ["IP transfer",    fd.intellectualPropertyTransfer ? fd.intellectualPropertyTransfer.replace(/_/g, " ") : ""],
                ["Confidentiality",fd.confidentialityRequirement],
                ["Commercial use", fd.commercialUsageRights === "commercial" ? "Allowed" : fd.commercialUsageRights === "internal" ? "Internal only" : "Custom"],
              ].map(([label, value]) => value ? (
                <div key={label} className="flex justify-between gap-3">
                  <span className={classNames("shrink-0", theme.faint)}>{label}</span>
                  <span className={classNames("text-right font-bold capitalize", theme.text)}>{value}</span>
                </div>
              ) : null)}
            </div>
            {(fd.deliverableFormat.length > 0 || fd.acceptanceChecklist.length > 0 || fd.acceptedEvidenceTypes.length > 0) && (
              <div className={classNames("mt-4 grid gap-3 border-t pt-4", theme.border)}>
                {fd.deliverableFormat.length > 0 && (
                  <div>
                    <p className={classNames("mb-2 text-xs font-black uppercase tracking-wide", theme.faint)}>Formats</p>
                    <div className="flex flex-wrap gap-1">{fd.deliverableFormat.map(f => <Badge key={f} theme={theme} tone="cyan">{f}</Badge>)}</div>
                  </div>
                )}
                {fd.acceptanceChecklist.length > 0 && (
                  <div>
                    <p className={classNames("mb-2 text-xs font-black uppercase tracking-wide", theme.faint)}>Acceptance</p>
                    <div className="flex flex-wrap gap-1">{fd.acceptanceChecklist.map(f => <Badge key={f} theme={theme} tone="emerald">{f}</Badge>)}</div>
                  </div>
                )}
                {fd.acceptedEvidenceTypes.length > 0 && (
                  <div>
                    <p className={classNames("mb-2 text-xs font-black uppercase tracking-wide", theme.faint)}>Evidence</p>
                    <div className="flex flex-wrap gap-1">{fd.acceptedEvidenceTypes.map(f => <Badge key={f} theme={theme} tone="violet">{f}</Badge>)}</div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Posted contracts list */}
          {myPostedEscrows.length > 0 && (
            <Card theme={theme}>
              <SectionTitle theme={theme} title={c.create.postedTitle} />
              <div className="grid gap-3">
                {myPostedEscrows.map(job => {
                  const st = postedJobStatus(job);
                  return (
                    <div key={job._id} className={classNames("flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4", theme.soft)}>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={classNames("text-sm font-bold", theme.text)}>{job.serviceName}</p>
                          <Badge theme={theme} tone={st.tone}>{st.label}</Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs">
                          <span className={theme.faint}>{formatEscrowAmount(job.amount)}</span>
                          {job.deadline && <span className={theme.faint}>{new Date(job.deadline).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <Button theme={theme} icon={ReceiptText} variant="secondary" size="sm" onClick={() => { setSelectedEscrow(job); navigate("details"); }}>
                        {c.create.viewBtn}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
      </>}
      {tab === "find" && <>
        <PageIntro title={c.create.jobsTitle} subtitle={c.create.jobsSubtitle} theme={theme} />
        <InlineMessage message={status.message} theme={theme} />
        {availableEscrows.length === 0 ? (
          <Card theme={theme}>
            <p className={classNames("py-8 text-center", theme.muted)}>{c.create.noJobs}</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {availableEscrows.map(job => (
              <Card key={job._id} theme={theme}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={classNames("text-base font-black", theme.heading)}>{job.serviceName}</p>
                      {job.serviceCategory && <Badge theme={theme} tone="violet">{job.serviceCategory}</Badge>}
                      <Badge theme={theme} tone="emerald">{c.create.statusOpen}</Badge>
                    </div>
                    {job.jobDescription && (
                      <p className={classNames("mt-2 line-clamp-2 text-sm leading-6", theme.muted)}>{job.jobDescription}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <span className={theme.faint}>{c.common.amount}: <span className={classNames("font-bold", theme.accentText)}>{formatEscrowAmount(job.amount)}</span></span>
                      {job.deadline && <span className={theme.faint}>{c.common.deadline}: <span className={classNames("font-bold", theme.text)}>{new Date(job.deadline).toLocaleDateString()}</span></span>}
                      <span className={theme.faint}>{c.details.client}: <span className={classNames("font-bold", theme.text)}>{job.client?.name || "—"}</span></span>
                    </div>
                  </div>
                  <Button theme={theme} icon={LockKeyhole} variant="primary" disabled={status.loading && status.lockingId === job._id} onClick={() => handleLock(job._id)}>
                    {status.loading && status.lockingId === job._id ? "Accepting..." : c.create.lockBtn}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </>}
    </div>
  );
}

// Map on-chain uint8 → status string (khớp với enum Status trong contract)
const ON_CHAIN_STATUS_MAP = ["CREATED","ACCEPTED","DEPOSITED","SUBMITTED","REVISION_REQUESTED","DISPUTED","REVIEWING_DISPUTE","RELEASED","REFUNDED","CANCELLED"];

function EscrowDetailsPage({ c, theme, navigate, selectedEscrow, addToast, refreshEscrows, currentUser }) {
  const [txStatus, setTxStatus] = useState({ loading: false, message: "" });
  const [countdown, setCountdown] = useState("");
  // onChainNum: trạng thái đọc trực tiếp từ blockchain (không qua DB / event listener)
  // null = chưa fetch, -1 = contract chưa tồn tại on-chain, 0-9 = status enum
  const [onChainNum, setOnChainNum] = useState(null);
  const workflow = ["created", "accepted", "deposited", "submitted", "released"];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    refreshEscrows();
    const TERMINAL = new Set(["RELEASED", "REFUNDED", "CANCELLED"]);
    const interval = setInterval(() => {
      if (!selectedEscrow || TERMINAL.has(selectedEscrow.status)) return;
      refreshEscrows();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const escrow = selectedEscrow;

  const isClient     = escrow && currentUser && String(escrow.client?._id    || escrow.client)     === String(currentUser._id || currentUser.id);
  const isFreelancer = escrow && currentUser && String(escrow.freelancer?._id || escrow.freelancer) === String(currentUser._id || currentUser.id);

  // Đọc on-chain status mỗi 8s để không phụ thuộc vào event listener
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!escrow?.escrowIdOnChain) return;
    let cancelled = false;
    const fetchStatus = () => {
      getOnChainStatus(escrow.escrowIdOnChain)
        .then(n => { if (!cancelled) setOnChainNum(n); })
        .catch(() => {});
    };
    fetchStatus();
    const t = setInterval(fetchStatus, 8000);
    return () => { cancelled = true; clearInterval(t); };
  }, [escrow?.escrowIdOnChain]);

  // resolvedStatus: ưu tiên on-chain (real-time) hơn DB (có thể lag)
  const resolvedStatus = (onChainNum !== null && onChainNum >= 0)
    ? ON_CHAIN_STATUS_MAP[onChainNum]
    : escrow?.status;

  const statusKey = escrowStatusKey(resolvedStatus || escrow?.status);

  const canRegister  = isClient     && resolvedStatus === "CREATED" && escrow?.freelancer;
  const canAccept    = isFreelancer && resolvedStatus === "CREATED";
  const canDeposit   = isClient     && resolvedStatus === "ACCEPTED" && escrow?.freelancer;

  useEffect(() => {
    if (escrow?.status !== "SUBMITTED" || !escrow?.autoReleaseAt) { setCountdown(""); return; }
    const update = () => {
      const diff = new Date(escrow.autoReleaseAt) - Date.now();
      if (diff <= 0) { setCountdown("Processing..."); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${d}d ${h}h ${m}m`);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [escrow?.status, escrow?.autoReleaseAt]);

  // on-chain status: 0=CREATED 1=ACCEPTED 2=DEPOSITED 3=SUBMITTED 4=REVISION 5=DISPUTED 7=RELEASED 8=REFUNDED 9=CANCELLED
  async function getOnChainStatus(contractId) {
    const AMOY_CHAIN = "0x13882";

    // Helper: đọc trạng thái từ một provider bất kỳ.
    // Dùng provider.call() + Interface.decodeFunctionResult() trực tiếp thay vì
    // Contract wrapper, để tránh ambiguity của single-output unwrapping trong ethers v6.
    // Interface.decodeFunctionResult LUÔN trả về Result array (decoded[0] = struct).
    async function readFromProvider(label, provider) {
      const iface = new Interface(ESCROW_ABI);
      const callData = iface.encodeFunctionData("getContract", [contractId]);
      let raw;
      try {
        raw = await provider.call({ to: CONTRACT_ADDRESS, data: callData });
      } catch (callErr) {
        console.warn(`[getOnChainStatus][${label}] provider.call threw:`, callErr?.code, callErr?.message);
        throw callErr;
      }
      console.log(`[getOnChainStatus][${label}] raw=`, raw?.slice(0, 66));
      const decoded = iface.decodeFunctionResult("getContract", raw);
      const s = decoded[0];
      console.log(`[getOnChainStatus][${label}] exists=${s.exists} status=${s.status}`);
      return s.exists ? Number(s.status) : -1;
    }

    let lastErr;

    // 1. Ưu tiên wallet của user (MetaMask/Coin98)
    const eth = getWalletProvider();
    console.log("[getOnChainStatus] contractId=", contractId, "CONTRACT_ADDRESS=", CONTRACT_ADDRESS);
    if (eth) {
      try {
        const chainId = await eth.request({ method: "eth_chainId" });
        console.log("[getOnChainStatus] wallet chainId=", chainId, "expected=", AMOY_CHAIN);
        if (chainId === AMOY_CHAIN) {
          return await readFromProvider("wallet", new BrowserProvider(eth));
        }
      } catch (err) {
        console.warn("[getOnChainStatus] wallet error:", err?.code, err?.message);
        if (err?.code === "CALL_EXCEPTION") return -1;
        lastErr = err;
      }
    }

    // 2. Fallback: external RPC list
    for (const rpc of AMOY_RPC_LIST) {
      try {
        return await readFromProvider(rpc.slice(0, 40), new JsonRpcProvider(rpc));
      } catch (err) {
        console.warn("[getOnChainStatus] rpc error:", rpc.slice(0,30), err?.code, err?.message);
        if (err?.code === "CALL_EXCEPTION") return -1;
        lastErr = err;
      }
    }

    throw lastErr ?? new Error("All providers failed");
  }

  // Step 1 (client): Register contract on-chain → freelancer can then accept
  async function handleRegisterOnChain() {
    const freelancerWallet = escrow?.freelancer?.walletAddress;
    if (!escrow?.escrowIdOnChain || !freelancerWallet) {
      setTxStatus({ loading: false, message: "Freelancer chưa kết nối ví. Yêu cầu họ kết nối MetaMask trước." });
      return;
    }
    setTxStatus({ loading: true, message: "" });
    try {
      // Gọi getSignerAndDecimals() TRƯỚC để switch wallet sang Amoy.
      // Sau đó getOnChainStatus() dùng wallet provider (đã trên Amoy) → không bị lỗi RPC.
      const { signer, decimals } = await getSignerAndDecimals();

      const currentStatus = await getOnChainStatus(escrow.escrowIdOnChain).catch(() => -2);

      if (currentStatus === 1) {
        // Freelancer đã accept on-chain → cập nhật UI ngay, không cần gửi tx
        setOnChainNum(1);
        setTxStatus({ loading: false, message: "Freelancer đã chấp nhận hợp đồng. Bạn có thể nạp tiền bên dưới." });
        return;
      }
      if (currentStatus > 1) {
        setOnChainNum(currentStatus);
        setTxStatus({ loading: false, message: "Hợp đồng đã qua trạng thái đăng ký." });
        return;
      }
      if (currentStatus === 0) {
        setOnChainNum(0);
        setTxStatus({ loading: false, message: "Hợp đồng đã đăng ký on-chain. Chờ freelancer chấp nhận." });
        return;
      }

      // currentStatus === -1 (chưa có on-chain) hoặc -2 (RPC lỗi) → gửi tx tạo mới
      const amountBig = parseUnits(String(escrow.amount), decimals);
      const contractURI = `${API_BASE_URL}/api/escrows/${escrow._id}`;
      const tx = await sendContractTx(signer, "createContract",
        [escrow.escrowIdOnChain, freelancerWallet, amountBig, contractURI], 300000);
      await tx.wait();
      setOnChainNum(0);
      setTxStatus({ loading: false, message: "Hợp đồng đã đăng ký on-chain. Chờ freelancer chấp nhận để nạp tiền." });
      setTimeout(() => refreshEscrows(), 5000);
    } catch (err) {
      const msg = err?.reason || err?.message || "";
      if (msg.includes("ContractAlreadyExists")) {
        // Contract đã tồn tại nhưng status check trước đó fail → thử đọc lại
        const statusNow = await getOnChainStatus(escrow.escrowIdOnChain).catch(() => -2);
        if (statusNow === 1) {
          setOnChainNum(1);
          setTxStatus({ loading: false, message: "Freelancer đã chấp nhận hợp đồng. Bạn có thể nạp tiền bên dưới." });
        } else if (statusNow >= 0) {
          setOnChainNum(statusNow);
          setTxStatus({ loading: false, message: "Hợp đồng đã được đăng ký on-chain. Freelancer có thể chấp nhận." });
        } else {
          setTxStatus({ loading: false, message: "Hợp đồng đã được đăng ký on-chain. Freelancer có thể chấp nhận." });
        }
      } else {
        setTxStatus({ loading: false, message: msg });
      }
    }
  }

  // Step 2 (freelancer): Accept contract on-chain
  async function handleAcceptContract() {
    if (!escrow?.escrowIdOnChain) {
      setTxStatus({ loading: false, message: "Hợp đồng chưa được đăng ký on-chain." });
      return;
    }
    setTxStatus({ loading: true, message: "Đang gửi giao dịch chấp nhận..." });
    try {
      // Best-effort check: giúp hiện thông báo rõ hơn. Nếu RPC lỗi thì bỏ qua.
      const onChainStatus = await getOnChainStatus(escrow.escrowIdOnChain).catch(() => null);
      console.log("[acceptContract] on-chain status:", onChainStatus);
      if (onChainStatus === -1) {
        setTxStatus({ loading: false, message: "Client chưa đăng ký hợp đồng on-chain. Yêu cầu client bấm 'Đăng ký on-chain' trước." });
        return;
      }
      if (onChainStatus !== null && onChainStatus !== 0) {
        setTxStatus({ loading: false, message: "Hợp đồng đã được chấp nhận hoặc đã qua trạng thái này." });
        return;
      }
      const { signer } = await getSignerAndDecimals();
      const tx = await sendContractTx(signer, "acceptContract", [escrow.escrowIdOnChain], 150000);
      await tx.wait();
      setTxStatus({ loading: false, message: "Đã chấp nhận hợp đồng. Client có thể nạp tiền." });
      setTimeout(() => refreshEscrows(), 10000);
    } catch (err) {
      const msg = err?.reason || err?.message || "";
      if (msg.includes("ContractNotFound")) {
        setTxStatus({ loading: false, message: "Client chưa đăng ký hợp đồng on-chain. Yêu cầu client bấm 'Đăng ký on-chain' trước." });
      } else {
        setTxStatus({ loading: false, message: msg });
      }
    }
  }

  // Step 3 (client): Deposit funds — only after freelancer accepted (on-chain status = 1)
  async function handleDeposit() {
    const freelancerWallet = escrow?.freelancer?.walletAddress;
    if (!escrow?.escrowIdOnChain || !freelancerWallet) {
      setTxStatus({ loading: false, message: "Freelancer chưa kết nối ví." });
      return;
    }
    setTxStatus({ loading: true, message: "" });
    try {
      const { signer, token, decimals } = await getSignerAndDecimals();
      const signerAddress = await signer.getAddress();
      await apiRequest("/api/faucet", { method: "POST", body: JSON.stringify({ address: signerAddress }) })
        .catch(e => console.warn("[faucet]", e.message));

      const onChainStatus = await getOnChainStatus(escrow.escrowIdOnChain);
      console.log("[deposit] on-chain status:", onChainStatus);

      if (onChainStatus === -1) {
        setTxStatus({ loading: false, message: "Hợp đồng chưa được đăng ký on-chain. Bấm 'Đăng ký on-chain' trước." });
        return;
      }
      if (onChainStatus === 0) {
        setTxStatus({ loading: false, message: "Hợp đồng đã on-chain nhưng freelancer chưa chấp nhận. Hãy chờ." });
        return;
      }
      if (onChainStatus >= 2) {
        addToast("deposit");
        setTimeout(() => refreshEscrows(), 3000);
        setTxStatus({ loading: false, message: "" });
        return;
      }

      // onChainStatus === 1 (ACCEPTED) → approve ERC20, then deposit
      const amountBig = parseUnits(String(escrow.amount), decimals);
      const feeParams = getGasParams();
      console.log("[deposit] calling approve...");
      const approveTx = await token.approve(CONTRACT_ADDRESS, amountBig,
        { ...feeParams, gasLimit: 100000n });
      await approveTx.wait();
      console.log("[deposit] calling deposit...");
      const depositTx = await sendContractTx(signer, "deposit", [escrow.escrowIdOnChain], 200000);
      await depositTx.wait();
      console.log("[deposit] done");
      addToast("deposit");
      setTimeout(() => refreshEscrows(), 10000);
    } catch (err) {
      setTxStatus({ loading: false, message: err.reason || err.message });
      return;
    }
    setTxStatus({ loading: false, message: "" });
  }

  return (
    <div className="space-y-6">
      <PageIntro title={c.details.title} subtitle={c.details.subtitle} theme={theme} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard theme={theme} icon={Briefcase} label={c.details.jobId} value={escrow?._id ? escrow._id.slice(-8) : "JOB-2402"} detail={escrow?.serviceName || "Landing Page Development"} tone="cyan" />
        <StatCard theme={theme} icon={CircleDollarSign} label={c.details.escrowAmount} value={formatEscrowAmount(escrow?.amount || "1250")} detail="Polygon" tone="emerald" />
        <StatCard theme={theme} icon={Clock3} label={c.common.deadline} value={escrow?.deadline ? new Date(escrow.deadline).toLocaleDateString() : "Jun 28"} detail="Escrow deadline" tone="amber" />
        <StatCard theme={theme} icon={ShieldCheck} label={c.common.status} value={c.status[statusKey] || escrow?.status || c.status.locked} detail={escrow ? "On-chain record" : "Demo data"} tone="violet" />
      </div>
      {/* Step 1: Client đăng ký hợp đồng on-chain */}
      {canRegister && (
        <Card theme={theme}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className={classNames("text-lg font-black", theme.heading)}>Đăng ký hợp đồng on-chain</p>
              <p className={classNames("mt-1 text-sm leading-6", theme.muted)}>Bước 1 — Ghi hợp đồng lên blockchain. Freelancer sẽ nhận được thông báo để chấp nhận.</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              {txStatus.message && <InlineMessage message={txStatus.message} theme={theme} />}
              <Button theme={theme} icon={ShieldCheck} onClick={handleRegisterOnChain} disabled={txStatus.loading}>
                {txStatus.loading ? "Processing..." : "Đăng ký on-chain"}
              </Button>
            </div>
          </div>
        </Card>
      )}
      {/* Step 2: Freelancer chấp nhận */}
      {canAccept && (
        <Card theme={theme}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className={classNames("text-lg font-black", theme.heading)}>Chấp nhận hợp đồng</p>
              <p className={classNames("mt-1 text-sm leading-6", theme.muted)}>Bước 2 — Xác nhận bạn sẵn sàng thực hiện. Client sẽ nạp tiền ký quỹ sau khi bạn chấp nhận.</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              {txStatus.message && <InlineMessage message={txStatus.message} theme={theme} />}
              <Button theme={theme} icon={CheckCircle2} variant="primary" onClick={handleAcceptContract} disabled={txStatus.loading}>
                {txStatus.loading ? "Processing..." : "Chấp nhận hợp đồng"}
              </Button>
            </div>
          </div>
        </Card>
      )}
      {/* Step 3: Client nạp tiền (sau khi freelancer đã accept on-chain) */}
      {canDeposit && (
        <Card theme={theme}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className={classNames("text-lg font-black", theme.heading)}>{c.common.depositFunds}</p>
              <p className={classNames("mt-1 text-sm leading-6", theme.muted)}>Bước 3 — {c.details.depositCopy}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              {txStatus.message && <InlineMessage message={txStatus.message} theme={theme} />}
              <Button theme={theme} icon={CircleDollarSign} onClick={handleDeposit} disabled={txStatus.loading}>
                {txStatus.loading ? "Processing..." : c.common.depositFunds}
              </Button>
            </div>
          </div>
        </Card>
      )}
      {escrow?.status === "SUBMITTED" && escrow?.autoReleaseAt && countdown && (
        <Card theme={theme}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TimerReset className={classNames("h-5 w-5 shrink-0", theme.accent)} />
              <div>
                <p className={classNames("text-sm font-black", theme.heading)}>{c.details.autoReleaseTitle}</p>
                <p className={classNames("mt-0.5 text-xs", theme.muted)}>{c.details.autoReleaseCopy}</p>
              </div>
            </div>
            <p className={classNames("shrink-0 font-mono text-xl font-black tabular-nums", theme.text)}>{countdown}</p>
          </div>
        </Card>
      )}
      <Card theme={theme}>
        <SectionTitle theme={theme} eyebrow={c.details.timelineNote} title={c.details.workflow}>
          <Button theme={theme} icon={UploadCloud} variant="secondary" onClick={() => navigate("submit")}>{c.nav.submit}</Button>
          <Button theme={theme} icon={CheckCircle2} onClick={() => navigate("approval")}>{c.nav.approval}</Button>
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {workflow.map((state) => (
            <div
              key={state}
              className={classNames(
                "flex min-h-[76px] items-center justify-center rounded-lg border px-3 py-4 text-center text-[11px] font-black leading-tight break-words whitespace-normal",
                state === statusKey ? theme.accentBg : `${theme.soft} ${theme.faint}`
              )}
            >
              {c.status[state]}
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            [c.details.client, escrow?.client?.walletAddress || escrow?.client?.name || "0x91B4...3F21"],
            [c.details.freelancer, escrow?.freelancer?.walletAddress || escrow?.freelancer?.name || ""],
            [c.details.contractAddress, escrow?.contractAddress || "Not deployed yet"],
            [c.common.deadline, escrow?.deadline ? new Date(escrow.deadline).toLocaleString() : "2026-06-28 18:00 ICT"]
          ].map(([label, value]) => (
            <div key={label} className={classNames("rounded-lg border p-4", theme.soft)}>
              <p className={classNames("text-xs font-black uppercase tracking-[0.16em]", theme.faint)}>{label}</p>
              <p className={classNames("mt-2 break-all font-mono text-sm font-bold", theme.text)}>{value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SubmissionPage({ c, theme, addToast, apiToken, selectedEscrow, refreshEscrows, setSelectedEscrow }) {
  const [status, setStatus] = useState({ loading: false, message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    if (!apiToken || !selectedEscrow?._id) {
      setStatus({ loading: false, message: "Please log in and select an escrow first." });
      return;
    }

    const form = new FormData(event.currentTarget);
    setStatus({ loading: true, message: "" });

    try {
      if (selectedEscrow?.escrowIdOnChain) {
        try {
          const { signer } = await getSignerAndDecimals();
          const submissionURI = form.get("deliverableUrl") || "";
          const tx = await sendContractTx(signer, "submitWork",
            [selectedEscrow.escrowIdOnChain, submissionURI], 200000);
          await tx.wait();
        } catch (chainErr) {
          // User rejected → rethrow so flow stops
          if (chainErr.code === "ACTION_REJECTED") throw chainErr;
          // Contract revert (already submitted, wrong status…) → continue to DB update
        }
      }
      const result = await apiRequest(`/api/escrows/${selectedEscrow._id}/submit`, {
        method: "PATCH",
        token: apiToken,
        body: JSON.stringify({
          deliverableUrl: form.get("deliverableUrl"),
          workProof: form.get("workProof"),
          note: form.get("note")
        })
      });
      setSelectedEscrow(result.escrow);
      await refreshEscrows();
      addToast("submitted");
    } catch (error) {
      setStatus({ loading: false, message: error.reason || error.message });
      return;
    }

    setStatus({ loading: false, message: "" });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card theme={theme}>
        <PageIntro title={c.submit.title} subtitle={c.submit.subtitle} theme={theme} />
        <form
          className="mt-6 grid gap-4"
          onSubmit={handleSubmit}
        >
          <Field theme={theme} label={c.submit.deliverableUrl} icon={Globe2}>
            <TextInput theme={theme} name="deliverableUrl" defaultValue={selectedEscrow?.deliverableInfo?.deliverableUrl || "https://figma.com/file/escrowx-landing"} required />
          </Field>
          <Field theme={theme} label={c.submit.workProof} icon={UploadCloud}>
            <TextInput theme={theme} name="workProof" placeholder={c.submit.proofPlaceholder} defaultValue={selectedEscrow?.deliverableInfo?.workProof || ""} />
          </Field>
          <Field theme={theme} label={c.submit.notes} icon={FileText}>
            <TextArea theme={theme} name="note" defaultValue={selectedEscrow?.deliverableInfo?.note || "Delivered responsive landing page, component library, and handoff notes for the client."} />
          </Field>
          <InlineMessage message={status.message} theme={theme} />
          <Button theme={theme} icon={UploadCloud} type="submit" disabled={status.loading}>
            {status.loading ? "Submitting..." : c.common.submitWork}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function ApprovalPage({ c, theme, navigate, addToast, apiToken, selectedEscrow, refreshEscrows, setSelectedEscrow }) {
  const [status, setStatus] = useState({ loading: false, message: "" });

  async function approveSelectedEscrow() {
    if (!apiToken || !selectedEscrow?._id) {
      setStatus({ loading: false, message: "Please log in and select an escrow first." });
      return;
    }

    setStatus({ loading: true, message: "" });

    try {
      if (selectedEscrow?.escrowIdOnChain) {
        const { signer } = await getSignerAndDecimals();
        const tx = await sendContractTx(signer, "approveWork", [selectedEscrow.escrowIdOnChain], 200000);
        await tx.wait();
      }
      const result = await apiRequest(`/api/escrows/${selectedEscrow._id}/approve`, {
        method: "PATCH",
        token: apiToken
      });
      setSelectedEscrow(result.escrow);
      await refreshEscrows();
      addToast("approved");
    } catch (error) {
      setStatus({ loading: false, message: error.reason || error.message });
      return;
    }

    setStatus({ loading: false, message: "" });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
      <Card theme={theme}>
        <PageIntro title={c.approval.title} subtitle={c.approval.subtitle} theme={theme} />
        <div className={classNames("mt-6 rounded-lg border p-5", theme.soft)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={classNames("text-xl font-black", theme.heading)}>{c.approval.deliverableTitle}</p>
              <p className={classNames("mt-2 text-sm leading-6", theme.muted)}>{selectedEscrow?.deliverableInfo?.deliverableUrl || "Figma prototype, React repository, Lighthouse report, deployment URL."}</p>
            </div>
            <Badge theme={theme} tone="cyan">{c.status[escrowStatusKey(selectedEscrow?.status)] || c.status.submitted}</Badge>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className={theme.text}>{c.approval.qualityScore}</span>
              <span className={theme.accentText}>92%</span>
            </div>
            <ProgressBar value={92} theme={theme} />
          </div>
        </div>
      </Card>
      <Card theme={theme}>
        <SectionTitle theme={theme} title={c.common.action} />
        <p className={classNames("text-sm leading-6", theme.muted)}>{c.approval.approvalCopy}</p>
        <div className="mt-5 grid gap-3">
          <InlineMessage message={status.message} theme={theme} />
          <Button theme={theme} icon={CheckCircle2} variant="success" onClick={approveSelectedEscrow} disabled={status.loading}>
            {status.loading ? "Approving..." : c.common.approveWork}
          </Button>
          <Button theme={theme} icon={AlertTriangle} variant="danger" onClick={() => {
            addToast("disputeOpened");
            navigate("disputes");
          }}>{c.common.openDispute}</Button>
        </div>
      </Card>
    </div>
  );
}

function DisputeCenterPage({ c, theme, addToast, apiToken, currentUser, selectedEscrow, refreshEscrows }) {
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [status, setStatus] = useState({ loading: false, message: "" });

  const fetchDisputes = () => {
    if (!apiToken) return;
    apiRequest("/api/disputes", { token: apiToken })
      .then((data) => setDisputes(data.disputes || []))
      .catch(() => {});
  };

  useEffect(() => { fetchDisputes(); }, [apiToken]); // eslint-disable-line

  // Nếu freelancer đang có selectedEscrow và đã có dispute → tự chọn dispute đó
  useEffect(() => {
    if (!selectedEscrow || !disputes.length || !currentUser) return;
    const uid = currentUser?._id || currentUser?.id;
    const isFreelancer = String(selectedEscrow.freelancer?._id || selectedEscrow.freelancer) === String(uid);
    if (!isFreelancer) return;
    const related = disputes.find(d => String(d.escrow?._id || d.escrow) === String(selectedEscrow._id));
    if (related) setSelectedDispute(related);
  }, [disputes, selectedEscrow, currentUser]); // eslint-disable-line

  async function handleFinalize() {
    if (!selectedDispute) return;
    setStatus({ loading: true, message: "" });
    try {
      await apiRequest(`/api/disputes/${selectedDispute._id}/finalize`, {
        method: "POST", token: apiToken,
      });
      addToast("disputeResolved");
      fetchDisputes();
      setSelectedDispute(null);
    } catch (error) {
      setStatus({ loading: false, message: error.reason || error.message });
      return;
    }
    setStatus({ loading: false, message: "" });
  }

  async function handleVote(voteForFreelancer) {
    if (!selectedDispute) return;
    setStatus({ loading: true, message: "" });
    try {
      const { signer } = await getSignerAndDecimals();
      const reason = voteForFreelancer ? "Bỏ phiếu giải ngân cho freelancer" : "Bỏ phiếu hoàn tiền cho khách hàng";
      const tx = await sendContractTx(signer, "castDisputeVote", [
        selectedDispute.escrowIdOnChain,
        true, true, true, true, true, true, true,
        voteForFreelancer,
        reason,
      ], 300000);
      const receipt = await tx.wait();
      await apiRequest(`/api/disputes/${selectedDispute._id}/vote`, {
        method: "POST", token: apiToken,
        body: JSON.stringify({
          txHash: receipt.hash, voteForFreelancer, reason,
          deliverablesMatch: true, acceptanceCriteriaMet: true, deadlineMet: true,
          revisionHistoryReviewed: true, submissionHistoryReviewed: true,
          blockchainTimelineReviewed: true, evidenceReviewed: true,
        })
      });
      addToast("disputeResolved");
      fetchDisputes();
      setSelectedDispute(null);
    } catch (error) {
      setStatus({ loading: false, message: error.reason || error.message });
      return;
    }
    setStatus({ loading: false, message: "" });
  }

  async function handleUploadDefense(event) {
    event.preventDefault();
    if (!selectedDispute) return;
    setStatus({ loading: true, message: "" });
    try {
      const form = new FormData(event.currentTarget);
      const defenseURI = form.get("defenseURI") || "";
      const { signer } = await getSignerAndDecimals();
      const tx = await sendContractTx(signer, "uploadDefense",
        [selectedDispute.escrowIdOnChain, defenseURI], 200000);
      await tx.wait();
      await apiRequest(`/api/disputes/${selectedDispute._id}/defense`, {
        method: "PATCH", token: apiToken,
        body: JSON.stringify({ defenseFiles: [defenseURI || "defense-submitted"] })
      });
      addToast("submitted");
      fetchDisputes();
      event.target.reset();
    } catch (error) {
      setStatus({ loading: false, message: error.reason || error.message });
      return;
    }
    setStatus({ loading: false, message: "" });
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!apiToken || !selectedEscrow?._id) {
      setStatus({ loading: false, message: "Please log in and select an escrow first." });
      return;
    }
    if (!selectedEscrow?.escrowIdOnChain) {
      setStatus({ loading: false, message: "Escrow chưa có on-chain ID." });
      return;
    }
    const form = new FormData(event.currentTarget);
    const reason = form.get("reason");
    setStatus({ loading: true, message: "" });
    try {
      // 1. Tạo dispute record trong DB
      const result = await apiRequest("/api/disputes", {
        method: "POST",
        token: apiToken,
        body: JSON.stringify({ escrowId: selectedEscrow._id, reason })
      });
      const dispute = result.dispute;

      // 2. Gọi raiseDispute() on-chain — đổi status contract sang DISPUTED
      const evidenceURI = `${API_BASE_URL}/api/disputes/${dispute._id}`;
      const { signer } = await getSignerAndDecimals();
      const tx = await sendContractTx(signer, "raiseDispute",
        [selectedEscrow.escrowIdOnChain, evidenceURI], 200000);
      await tx.wait();

      setDisputes((prev) => [dispute, ...prev]);
      addToast("disputeOpened");
      if (refreshEscrows) await refreshEscrows();
      event.target.reset();
    } catch (error) {
      setStatus({ loading: false, message: error.reason || error.message });
      return;
    }
    setStatus({ loading: false, message: "" });
  }

  const uid = currentUser?._id || currentUser?.id;
  const isDisputeClient     = selectedDispute && String(selectedDispute.escrow?.client)     === String(uid);
  const isDisputeFreelancer = selectedDispute && String(selectedDispute.escrow?.freelancer) === String(uid);
  const isReviewer          = selectedDispute && !isDisputeClient && !isDisputeFreelancer;

  return (
    <div className="space-y-6">
      <PageIntro title={c.dispute.title} subtitle={c.dispute.subtitle} theme={theme} />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card theme={theme}>
          <SectionTitle theme={theme} title={c.dispute.evidence} />

          {/* ── Reviewer: bỏ phiếu cho dispute đã chọn ── */}
          {isReviewer && (
            <div className="grid gap-4">
              <div className={classNames("rounded-lg border p-4", theme.soft)}>
                <p className={classNames("text-sm font-bold", theme.text)}>{selectedDispute.escrow?.serviceName || "—"}</p>
                <p className={classNames("mt-1 text-xs break-all", theme.faint)}>ID: {selectedDispute._id}</p>
              </div>

              {/* Bằng chứng từ client */}
              <div className={classNames("rounded-lg border p-4", theme.soft)}>
                <p className={classNames("text-xs font-semibold mb-1", theme.muted)}>Lý do tranh chấp (client)</p>
                <p className={classNames("text-sm leading-5", theme.text)}>{selectedDispute.reason || "—"}</p>
                {selectedDispute.evidenceFiles?.length > 0 && (
                  <div className="mt-2 grid gap-1">
                    {selectedDispute.evidenceFiles.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer"
                        className={classNames("text-xs underline break-all", theme.accentText)}>
                        {url}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Bằng chứng phản bác từ freelancer */}
              <div className={classNames("rounded-lg border p-4", theme.soft)}>
                <p className={classNames("text-xs font-semibold mb-1", theme.muted)}>Bằng chứng phản bác (freelancer)</p>
                {selectedDispute.freelancerDefenseFiles?.length > 0 ? (
                  <div className="grid gap-1">
                    {selectedDispute.freelancerDefenseFiles.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer"
                        className={classNames("text-xs underline break-all", theme.accentText)}>
                        {url}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className={classNames("text-xs", theme.faint)}>Freelancer chưa nộp bằng chứng phản bác.</p>
                )}
              </div>

              <InlineMessage message={status.message} theme={theme} />
              <Button theme={theme} icon={Vote} variant="success" onClick={() => handleVote(true)} disabled={status.loading}>
                {status.loading ? "Đang xử lý..." : c.common.voteRelease}
              </Button>
              <Button theme={theme} icon={Gavel} variant="secondary" onClick={() => handleVote(false)} disabled={status.loading}>
                {c.common.voteRefund}
              </Button>
              {currentUser?.role === "admin" && (
                <Button theme={theme} icon={Gavel} variant="danger" onClick={handleFinalize} disabled={status.loading}>
                  {status.loading ? "Đang chốt..." : "Chốt kết quả (Admin)"}
                </Button>
              )}
            </div>
          )}

          {/* ── Freelancer: nộp bằng chứng phản bác ── */}
          {isDisputeFreelancer && (
            <form onSubmit={handleUploadDefense} className="grid gap-4">
              <div className={classNames("rounded-lg border p-4", theme.soft)}>
                <p className={classNames("text-sm font-bold", theme.text)}>{selectedDispute.escrow?.serviceName || "—"}</p>
                <p className={classNames("mt-1 text-xs", theme.faint)}>Trạng thái: {selectedDispute.status}</p>
              </div>
              <Field theme={theme} label="Link bằng chứng phản bác" icon={UploadCloud}>
                <TextInput theme={theme} name="defenseURI" placeholder="https://drive.google.com/..." required />
              </Field>
              <InlineMessage message={status.message} theme={theme} />
              <Button theme={theme} icon={UploadCloud} type="submit" disabled={status.loading}>
                {status.loading ? "Đang nộp..." : "Nộp bằng chứng phản bác"}
              </Button>
            </form>
          )}

          {/* ── Client: xem trạng thái dispute đã mở ── */}
          {isDisputeClient && (
            <div className="grid gap-4">
              <div className={classNames("rounded-lg border p-4", theme.soft)}>
                <p className={classNames("text-sm font-bold", theme.text)}>{selectedDispute.escrow?.serviceName || "—"}</p>
                <p className={classNames("mt-2 text-xs leading-5", theme.muted)}>{selectedDispute.reason}</p>
              </div>
              <p className={classNames("text-sm", theme.muted)}>Đang chờ freelancer nộp bằng chứng phản bác. Sau đó các reviewer sẽ bỏ phiếu.</p>
              {currentUser?.role === "admin" && (
                <>
                  <InlineMessage message={status.message} theme={theme} />
                  <Button theme={theme} icon={Gavel} variant="danger" onClick={handleFinalize} disabled={status.loading}>
                    {status.loading ? "Đang chốt..." : "Chốt kết quả (Admin)"}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ── Không chọn dispute → tạo mới hoặc demo ── */}
          {!selectedDispute && selectedEscrow && (
            <form onSubmit={handleCreate} className="grid gap-4">
              <div className={classNames("rounded-lg border p-4", theme.soft)}>
                <p className={classNames("text-sm font-bold", theme.text)}>{selectedEscrow.serviceName}</p>
                <p className={classNames("mt-1 text-xs", theme.faint)}>ID: {selectedEscrow._id}</p>
              </div>
              <Field theme={theme} label={c.dispute.evidence} icon={FileText}>
                <TextArea theme={theme} name="reason" placeholder="Describe the reason for this dispute..." required />
              </Field>
              <InlineMessage message={status.message} theme={theme} />
              <Button theme={theme} icon={AlertTriangle} variant="danger" type="submit" disabled={status.loading}>
                {status.loading ? "Opening..." : c.common.openDispute}
              </Button>
            </form>
          )}

          {!selectedDispute && !selectedEscrow && (
            <div className="grid gap-3 md:grid-cols-3">
              {[
                [FileText, c.dispute.deliverables, "https://github.com/client/job-2379"],
                [UploadCloud, c.dispute.screenshots, "ipfs://QmAuditEvidence42"],
                [ReceiptText, "Milestone Log", "Oracle checkpoint #18"]
              ].map(([Icon, label, value]) => (
                <div key={label} className={classNames("rounded-lg border p-4", theme.soft)}>
                  <Icon className={classNames("h-5 w-5", theme.accentText)} />
                  <p className={classNames("mt-3 font-black", theme.heading)}>{label}</p>
                  <p className={classNames("mt-2 break-all text-xs", theme.muted)}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card theme={theme}>
          <SectionTitle theme={theme} title={c.dispute.outcome} />
          {disputes.length ? (
            <div className="grid gap-3">
              {disputes.map((d) => (
                <button
                  key={d._id}
                  type="button"
                  onClick={() => setSelectedDispute(selectedDispute?._id === d._id ? null : d)}
                  className={classNames(
                    "w-full rounded-lg border p-4 text-left transition hover:opacity-80",
                    theme.soft,
                    selectedDispute?._id === d._id ? "ring-2 ring-cyan-400" : ""
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={classNames("text-sm font-bold", theme.text)}>{d.escrow?.serviceName || "—"}</p>
                    <Badge theme={theme} tone={d.status === "OPEN" ? "amber" : "emerald"}>{d.status}</Badge>
                  </div>
                  <p className={classNames("mt-2 text-xs leading-5", theme.muted)}>{d.reason}</p>
                </button>
              ))}
            </div>
          ) : (
            <>
              <p className={classNames("text-sm leading-6", theme.muted)}>{c.dispute.outcomeCopy}</p>
              <p className={classNames("mt-4 text-xs", theme.faint)}>{c.dispute.adminNote}</p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function WalletPage({ c, theme, wallet, setWallet, openSignModal, addToast, apiToken, setCurrentUser }) {
  const [status, setStatus] = useState({ loading: false, message: "" });
  const [walletOptions, setWalletOptions] = useState([]); // danh sách wallets khi có nhiều

  async function connectWithProvider(provider) {
    setWalletOptions([]);
    setWalletProvider(provider); // lưu provider được chọn vào module-level
    setStatus({ loading: true, message: "" });
    try {
      const [address] = await provider.request({ method: "eth_requestAccounts" });
      setWallet({ connected: true, address, short: shortAddress(address), eth: "0.00", usdt: "0", status: c.status.connected });
      if (apiToken) {
        const result = await apiRequest("/api/auth/wallet", {
          method: "PATCH",
          token: apiToken,
          body: JSON.stringify({ walletAddress: address })
        });
        window.localStorage.setItem("escrowx-user", JSON.stringify(result.user));
        setCurrentUser(result.user);
      }
      addToast("deposit");
    } catch (error) {
      setStatus({ loading: false, message: error.message });
      return;
    }
    setStatus({ loading: false, message: "" });
  }

  async function connectWallet() {
    const wallets = detectWallets();
    if (wallets.length === 0) {
      setStatus({ loading: false, message: "Không tìm thấy ví. Hãy cài MetaMask hoặc Coin98." });
      return;
    }
    if (wallets.length === 1) {
      await connectWithProvider(wallets[0].provider);
      return;
    }
    // Nhiều ví → cho user chọn
    setWalletOptions(wallets);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card theme={theme}>
        <PageIntro title={c.wallet.title} subtitle={c.wallet.subtitle} theme={theme} />
        <div className={classNames("mt-6 rounded-lg border p-5", theme.soft)}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/12 text-cyan-300">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className={classNames("text-sm", theme.faint)}>{c.wallet.connection}</p>
              <p className={classNames("font-black", theme.heading)}>{wallet.connected ? c.status.connected : c.status.disconnected}</p>
            </div>
          </div>
          <p className={classNames("mt-5 break-all font-mono text-sm", theme.text)}>{wallet.connected ? wallet.address : "0x0000...0000"}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button theme={theme} icon={Wallet} onClick={connectWallet} disabled={status.loading}>
              {status.loading ? "Connecting..." : c.common.connectWallet}
            </Button>
            <Button theme={theme} icon={Fingerprint} variant="secondary" onClick={openSignModal}>{c.common.signTransaction}</Button>
          </div>
          {walletOptions.length > 0 && (
            <div className={classNames("mt-4 rounded-lg border p-4", theme.soft)}>
              <p className={classNames("mb-3 text-sm font-semibold", theme.heading)}>Chọn ví để kết nối:</p>
              <div className="flex flex-col gap-2">
                {walletOptions.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => connectWithProvider(w.provider)}
                    className={classNames("flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition hover:opacity-80", theme.soft, theme.text)}
                  >
                    <Wallet className="h-5 w-5 shrink-0 text-cyan-400" />
                    {w.name}
                  </button>
                ))}
                <button
                  onClick={() => setWalletOptions([])}
                  className={classNames("mt-1 text-xs", theme.faint)}
                >
                  Huỷ
                </button>
              </div>
            </div>
          )}
          <InlineMessage message={status.message} theme={theme} />
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
        <StatCard theme={theme} icon={Coins} label={c.wallet.eth} value={`${wallet.eth} ETH`} detail="Polygon gas reserve" tone="cyan" />
        <StatCard theme={theme} icon={CircleDollarSign} label={c.wallet.usdt} value={`${wallet.usdt} USDT`} detail="Available stablecoin" tone="emerald" />
        <Card theme={theme}>
          <SectionTitle theme={theme} title={c.common.signTransaction} />
          <div className="grid gap-3 text-sm">
            {[
              [c.wallet.method, "releaseFunds(jobId)"],
              [c.common.amount, "1,250 USDT"],
              [c.wallet.network, "Polygon"],
              [c.wallet.gas, "EscrowX sponsored"]
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <span className={theme.faint}>{label}</span>
                <span className={classNames("text-right font-bold", theme.text)}>{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button theme={theme} icon={Wallet} onClick={openSignModal}>{c.common.signTransaction}</Button>
            <Button theme={theme} icon={Fingerprint} variant="secondary" onClick={openSignModal}>{c.wallet.approveBiometric}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function NotificationsPage({ c, theme, addToast, apiToken }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!apiToken) return;
    apiRequest("/api/notifications", { token: apiToken })
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {});
  }, [apiToken]);

  async function markRead(id) {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: "PATCH", token: apiToken });
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  }

  const demoKeys = ["deposit", "submitted", "approved", "released", "disputeOpened", "disputeResolved"];

  return (
    <div className="space-y-6">
      <PageIntro title={c.notifications.title} subtitle={c.notifications.subtitle} theme={theme} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {notifications.length ? notifications.map((n) => (
          <Card key={n._id} theme={theme} className={classNames("p-4", !n.isRead && "ring-1 ring-cyan-400/30")}>
            <Bell className={classNames("h-5 w-5", theme.accentText)} />
            <p className={classNames("mt-3 font-black", theme.heading)}>{n.title}</p>
            <p className={classNames("mt-2 text-sm leading-6", theme.muted)}>{n.message}</p>
            {!n.isRead && (
              <Button theme={theme} size="sm" variant="secondary" className="mt-4" onClick={() => markRead(n._id)}>
                {c.common.markAsRead}
              </Button>
            )}
          </Card>
        )) : demoKeys.map((key) => {
          const [title, message] = c.notifications[key];
          return (
            <Card key={key} theme={theme} className="p-4">
              <Bell className={classNames("h-5 w-5", theme.accentText)} />
              <p className={classNames("mt-3 font-black", theme.heading)}>{title}</p>
              <p className={classNames("mt-2 text-sm leading-6", theme.muted)}>{message}</p>
              <Button theme={theme} size="sm" variant="secondary" className="mt-4" onClick={() => addToast(key)}>{c.notifications.triggerDemo}</Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ProfilePage({ c, theme, currentUser, escrows, navigate, setSelectedEscrow, setApiToken, setCurrentUser, setWallet }) {
  const initials = currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "NA";

  const completedEscrows = escrows.filter(e => e.status === "RELEASED").filter(e => {
    const clientId = e.client?._id || e.client;
    const freelancerId = e.freelancer?._id || e.freelancer;
    const uid = String(currentUser?._id || currentUser?.id);
    return String(clientId) === uid || String(freelancerId) === uid;
  });

  function handleLogout() {
    window.localStorage.removeItem("escrowx-token");
    window.localStorage.removeItem("escrowx-user");
    setApiToken(null);
    setCurrentUser(null);
    setWallet((w) => ({ ...w, connected: false, address: "", short: "" }));
    navigate("landing");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.7fr_1fr]">
        <Card theme={theme} className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/12 text-3xl font-black text-cyan-300">
            {initials}
          </div>
          <h1 className={classNames("mt-4 text-2xl font-black", theme.heading)}>{currentUser?.name || c.profile.name}</h1>
          <p className={classNames("mt-1", theme.muted)}>{currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : c.profile.role}</p>
          <p className={classNames("mt-4 break-all font-mono text-sm", theme.accentText)}>{currentUser?.walletAddress || ""}</p>
          <Button theme={theme} icon={LogOut} variant="secondary" className="mt-5 w-full" onClick={handleLogout}>
            {c.profile.logout}
          </Button>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard theme={theme} icon={BadgeCheck} label={c.profile.reputation} value="98/100" detail={c.profile.verification} tone="cyan" />
          <StatCard theme={theme} icon={FileCheck2} label={c.profile.completedJobs} value={completedEscrows.length || "0"} detail="Released contracts" tone="emerald" />
          <StatCard theme={theme} icon={TrendingUp} label={c.profile.successRate} value="99.1%" detail={c.profile.security} tone="violet" />
          <Card theme={theme} className="md:col-span-3">
            <SectionTitle theme={theme} title={c.profile.security} />
            <div className="grid gap-3 md:grid-cols-3">
              {c.profile.verifications.map((item) => (
                <div key={item} className={classNames("flex items-center gap-3 rounded-lg border p-3", theme.soft)}>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className={classNames("text-sm font-bold", theme.text)}>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card theme={theme}>
        <SectionTitle theme={theme} title={c.profile.historyTitle} />
        {completedEscrows.length === 0 ? (
          <p className={classNames("py-4 text-sm", theme.muted)}>{c.profile.noHistory}</p>
        ) : (
          <div className="grid gap-3">
            {completedEscrows.map(job => {
              const isClient = String(job.client?._id || job.client) === String(currentUser?._id || currentUser?.id);
              return (
                <div key={job._id} className={classNames("flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4", theme.soft)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={classNames("font-bold text-sm", theme.text)}>{job.serviceName}</p>
                      <Badge theme={theme} tone="emerald">{c.status.released}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs">
                      <span className={theme.faint}>{formatEscrowAmount(job.amount)}</span>
                      <span className={theme.faint}>{isClient ? c.details.freelancer : c.details.client}: {isClient ? (job.freelancer?.name || "—") : (job.client?.name || "—")}</span>
                      {job.updatedAt && <span className={theme.faint}>{new Date(job.updatedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <Button theme={theme} icon={ReceiptText} variant="secondary" size="sm" onClick={() => { setSelectedEscrow(job); navigate("details"); }}>
                    {c.create.viewBtn}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Footer({ c, theme }) {
  const links = [
    [Mail, "contact@escrowx.io"],
    [MessageCircle, "Discord"],
    [Send, "Telegram"],
    [Github, "GitHub"],
    [Globe2, "Twitter/X"],
    [FileText, c.footer.terms],
    [ShieldCheck, c.footer.privacy]
  ];

  return (
    <footer className={classNames("mt-10 rounded-lg border p-6", theme.card)}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className={classNames("text-xl font-black", theme.heading)}>{c.brand}</p>
          <p className={classNames("mt-2 max-w-xl text-sm leading-6", theme.muted)}>{c.product}</p>
          <p className={classNames("mt-4 text-xs", theme.faint)}>{c.footer.rights}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map(([Icon, label]) => (
            <a key={label} className={classNames("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition", theme.soft, theme.softHover, theme.text)} href={label.includes("@") ? `mailto:${label}` : "#/"}>
              <Icon className={classNames("h-4 w-4", theme.accentText)} />
              <span>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function ToastStack({ toasts, removeToast, theme }) {
  return (
    <div className="fixed right-4 top-20 z-50 grid w-[min(360px,calc(100vw-32px))] gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={classNames("rounded-lg border p-4 shadow-2xl", theme.card)}
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96 }}
          >
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400/12 text-cyan-300">
                <toast.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={classNames("font-black", theme.heading)}>{toast.title}</p>
                <p className={classNames("mt-1 text-sm leading-5", theme.muted)}>{toast.message}</p>
              </div>
              <button className={theme.faint} onClick={() => removeToast(toast.id)} aria-label="Dismiss notification">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function SignTransactionModal({ open, onClose, c, theme, addToast }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="absolute inset-0 bg-slate-950/75" onClick={onClose} aria-label="Close transaction modal" />
          <motion.div
            className={classNames("relative w-full max-w-lg rounded-lg border p-6", theme.card)}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={classNames("text-xl font-black", theme.heading)}>{c.wallet.modalTitle}</p>
                <p className={classNames("mt-2 text-sm", theme.muted)}>JOB-2402 · releaseFunds</p>
              </div>
              <button className={theme.faint} onClick={onClose} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-3 text-sm">
              {[
                [c.wallet.method, "releaseFunds(jobId)"],
                [c.common.amount, "1,250 USDT"],
                [c.common.contract, "0xE5c8...42F9"],
                [c.wallet.network, "Polygon"],
                [c.wallet.gas, "EscrowX sponsored"]
              ].map(([label, value]) => (
                <div key={label} className={classNames("flex justify-between gap-3 rounded-lg border p-3", theme.soft)}>
                  <span className={theme.faint}>{label}</span>
                  <span className={classNames("text-right font-bold", theme.text)}>{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button theme={theme} icon={Wallet} onClick={() => {
                addToast("released");
                onClose();
              }}>{c.common.signTransaction}</Button>
              <Button theme={theme} icon={Fingerprint} variant="secondary" onClick={() => {
                addToast("released");
                onClose();
              }}>{c.wallet.approveBiometric}</Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AdminPage({ c, theme, apiToken }) {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null); // dispute id đang xử lý
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!apiToken) return;
    apiRequest("/api/disputes", { token: apiToken })
      .then((d) => setDisputes(d.disputes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiToken]);

  async function handleResolve(dispute, releaseToFreelancer) {
    setResolving(dispute._id);
    try {
      await apiRequest(`/api/disputes/${dispute._id}/resolve`, {
        method: "PATCH",
        token: apiToken,
        body: JSON.stringify({ releaseToFreelancer, resolutionNote: note })
      });
      setDisputes((prev) =>
        prev.map((d) =>
          d._id === dispute._id
            ? { ...d, status: releaseToFreelancer ? "RESOLVED_RELEASE" : "RESOLVED_REFUND" }
            : d
        )
      );
      setNote("");
    } catch (err) {
      alert(err.message);
    }
    setResolving(null);
  }

  const open = disputes.filter((d) => d.status === "OPEN");
  const resolved = disputes.filter((d) => d.status !== "OPEN");

  return (
    <AnimatePresence mode="wait">
      <motion.div key="admin" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
        <div>
          <h1 className={classNames("text-2xl font-black", theme.heading)}>Admin Panel</h1>
          <p className={classNames("mt-1 text-sm", theme.faint)}>Xử lý tranh chấp — gọi resolveDispute() on-chain bằng ví admin</p>
        </div>

        {loading && <p className={classNames("text-sm", theme.faint)}>Đang tải...</p>}

        {!loading && open.length === 0 && (
          <Card theme={theme}>
            <p className={classNames("text-sm", theme.faint)}>Không có tranh chấp nào đang mở.</p>
          </Card>
        )}

        {open.length > 0 && (
          <div className="space-y-4">
            <h2 className={classNames("text-lg font-bold", theme.heading)}>Tranh chấp đang mở ({open.length})</h2>
            {open.map((d) => (
              <Card key={d._id} theme={theme}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={classNames("font-bold", theme.heading)}>{d.escrow?.serviceName || "—"}</p>
                      <p className={classNames("mt-1 text-xs font-mono", theme.faint)}>{d._id}</p>
                    </div>
                    <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-xs font-bold text-yellow-400">OPEN</span>
                  </div>

                  <div className={classNames("grid gap-2 text-sm", theme.text)}>
                    <div className="flex justify-between">
                      <span className={theme.faint}>Số tiền</span>
                      <span className="font-bold">{d.escrow?.amount ?? "—"} mUSDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme.faint}>Người mở tranh chấp</span>
                      <span>{d.raisedBy?.name || "—"} ({d.raisedBy?.role || "—"})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={theme.faint}>Lý do</span>
                      <span className="text-right max-w-xs">{d.reason || "—"}</span>
                    </div>
                    {d.evidenceFiles?.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className={theme.faint}>Bằng chứng</span>
                        {d.evidenceFiles.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="truncate text-cyan-400 underline text-xs">{url}</a>
                        ))}
                      </div>
                    )}
                  </div>

                  <textarea
                    placeholder="Ghi chú quyết định (tuỳ chọn)..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className={classNames("w-full rounded-lg border px-3 py-2 text-sm", theme.soft, theme.text)}
                  />

                  <div className="flex flex-wrap gap-3">
                    <Button
                      theme={theme}
                      icon={CheckCircle2}
                      onClick={() => handleResolve(d, true)}
                      disabled={resolving === d._id}
                    >
                      {resolving === d._id ? "Đang xử lý..." : "Release → Freelancer"}
                    </Button>
                    <Button
                      theme={theme}
                      icon={TimerReset}
                      variant="secondary"
                      onClick={() => handleResolve(d, false)}
                      disabled={resolving === d._id}
                    >
                      {resolving === d._id ? "Đang xử lý..." : "Refund → Client"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {resolved.length > 0 && (
          <div className="space-y-3">
            <h2 className={classNames("text-lg font-bold", theme.heading)}>Đã xử lý ({resolved.length})</h2>
            {resolved.map((d) => (
              <Card key={d._id} theme={theme}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={classNames("font-bold", theme.heading)}>{d.escrow?.serviceName || "—"}</p>
                    <p className={classNames("text-xs", theme.faint)}>{d.resolutionNote || "Không có ghi chú"}</p>
                  </div>
                  <span className={classNames(
                    "rounded-full px-2 py-0.5 text-xs font-bold",
                    d.status === "RESOLVED_RELEASE" ? "bg-emerald-400/20 text-emerald-400" : "bg-blue-400/20 text-blue-400"
                  )}>
                    {d.status === "RESOLVED_RELEASE" ? "→ Freelancer" : "→ Client"}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const [language, setLanguage] = useStoredState("escrowx-language", "en");
  const [themeName, setThemeName] = useStoredState("escrowx-theme", "dark");
  const [route, setRoute] = useState(getInitialRoute);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [apiToken, setApiToken] = useState(() => window.localStorage.getItem("escrowx-token") || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = window.localStorage.getItem("escrowx-user");
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  const [wallet, setWallet] = useState({
    connected: false,
    address: "",
    short: "Wallet",
    eth: "0.00",
    usdt: "0",
    status: translations.en.status.disconnected
  });
  const [toasts, setToasts] = useState([]);
  const [escrows, setEscrows] = useState([]);
  const [availableEscrows, setAvailableEscrows] = useState([]);
  const [selectedEscrow, setSelectedEscrow] = useState(null);

  const theme = useMemo(() => getTheme(themeName), [themeName]);
  const c = translations[language];

  useEffect(() => {
    function syncRoute() {
      setRoute(getInitialRoute());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.addEventListener("hashchange", syncRoute);
    if (!window.location.hash) window.location.hash = "/";
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  useEffect(() => {
    setWallet((current) => ({ ...current, status: current.connected ? c.status.connected : c.status.disconnected }));
  }, [c.status.connected, c.status.disconnected]);

  useEffect(() => {
    if (currentUser?.walletAddress) {
      setWallet((w) => ({ ...w, connected: true, address: currentUser.walletAddress, short: shortAddress(currentUser.walletAddress) }));
    }
  }, []);

  function navigate(nextRoute) {
    const nextHash = routeHash(nextRoute);
    if (window.location.hash === nextHash) {
      setRoute(nextRoute);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.hash = nextHash;
    }
  }

  function addToast(kind) {
    const copy = c.notifications[kind] || c.notifications.deposit;
    const iconMap = {
      deposit: CircleDollarSign,
      submitted: UploadCloud,
      approved: CheckCircle2,
      released: Coins,
      disputeOpened: AlertTriangle,
      disputeResolved: Gavel,
      locked: LockKeyhole,
      requireLogin: LogIn
    };
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [
      { id, title: copy[0], message: copy[1], icon: iconMap[kind] || Bell },
      ...current.slice(0, 4)
    ]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 5200);
  }

  function removeToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  const refreshEscrows = useCallback(async () => {
    if (!apiToken) return;
    try {
      const data = await apiRequest("/api/escrows", { token: apiToken });
      const list = data.escrows || [];
      setEscrows(list);
      setSelectedEscrow(prev => prev ? (list.find(e => e._id === prev._id) || prev) : prev);
    } catch {}
  }, [apiToken]);

  const refreshAvailableEscrows = useCallback(async () => {
    if (!apiToken || currentUser?.role === "admin") return;
    try {
      const data = await apiRequest("/api/escrows/available", { token: apiToken });
      setAvailableEscrows(data.escrows || []);
    } catch {}
  }, [apiToken, currentUser?.role]);

  useEffect(() => {
    refreshAvailableEscrows();
  }, [refreshAvailableEscrows]);

  // SSE: nhận push từ server khi bất kỳ escrow nào thay đổi → tự refresh không cần reload
  useEffect(() => {
    if (!apiToken) return;
    const es = new EventSource(
      `${API_BASE_URL}/api/escrows/events?token=${encodeURIComponent(apiToken)}`
    );
    es.addEventListener("escrow-updated", () => {
      refreshEscrows();
      refreshAvailableEscrows();
    });
    return () => es.close();
  }, [apiToken, refreshEscrows, refreshAvailableEscrows]);

  const pageProps = {
    c,
    theme,
    language,
    navigate,
    addToast,
    wallet,
    setWallet,
    openSignModal: () => setSignOpen(true),
    apiToken,
    setApiToken,
    currentUser,
    setCurrentUser,
    escrows,
    refreshEscrows,
    availableEscrows,
    refreshAvailableEscrows,
    selectedEscrow,
    setSelectedEscrow
  };

  const pages = {
    landing: <LandingPage {...pageProps} />,
    login: currentUser ? <ProfilePage {...pageProps} /> : <AuthPage {...pageProps} type="login" />,
    register: currentUser ? <ProfilePage {...pageProps} /> : <AuthPage {...pageProps} type="register" />,
    dashboard: <DashboardPage {...pageProps} />,
    create: <CreateJobPage {...pageProps} />,
    details: <EscrowDetailsPage {...pageProps} />,
    submit: <SubmissionPage {...pageProps} />,
    approval: <ApprovalPage {...pageProps} />,
    disputes: <DisputeCenterPage {...pageProps} />,
    wallet: <WalletPage {...pageProps} />,
    notifications: <NotificationsPage {...pageProps} />,
    profile: <ProfilePage {...pageProps} />,
    admin: <AdminPage {...pageProps} />
  };

  return (
    <div className={classNames("min-h-screen overflow-hidden", theme.page)}>
      <div className={classNames("fixed inset-0 -z-10", theme.background)} />
      <div className="app-grid pointer-events-none fixed inset-0 -z-10 opacity-70" />
      <Sidebar c={c} theme={theme} route={route} navigate={navigate} open={mobileOpen} setOpen={setMobileOpen} currentUser={currentUser} />
      <div className="lg:pl-72">
        <Header
          c={c}
          theme={theme}
          language={language}
          setLanguage={setLanguage}
          themeName={themeName}
          setThemeName={setThemeName}
          setMobileOpen={setMobileOpen}
          wallet={wallet}
          navigate={navigate}
        />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {pages[route] || pages.landing}
            </motion.div>
          </AnimatePresence>
          <Footer c={c} theme={theme} />
        </main>
      </div>
      <ToastStack toasts={toasts} removeToast={removeToast} theme={theme} />
      <SignTransactionModal open={signOpen} onClose={() => setSignOpen(false)} c={c} theme={theme} addToast={addToast} />
    </div>
  );
}

export default App;
