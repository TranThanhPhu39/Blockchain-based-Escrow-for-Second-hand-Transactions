import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Coins,
  Copy,
  CreditCard,
  Eye,
  FileCheck2,
  FileText,
  Fingerprint,
  Gavel,
  Globe2,
  Home,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogIn,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquareWarning,
  Moon,
  Network,
  PackageCheck,
  Phone,
  PlusCircle,
  QrCode,
  Radio,
  ReceiptText,
  RefreshCcw,
  Route,
  ScanLine,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sun,
  TimerReset,
  Truck,
  UploadCloud,
  UserCircle,
  UserPlus,
  Vote,
  Wallet,
  X,
  Zap
} from "lucide-react";

const translations = {
  en: {
    appName: "TrustLock",
    prototype: "Smart escrow for safer second-hand trading.",
    alerts: "Alerts",
    connect: "Connect",
    connected: "Connected",
    disconnected: "Disconnected",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    navGroups: {
      landing: "Landing Page",
      auth: "Authentication",
      dashboard: "Dashboard",
      escrow: "Escrow Pages",
      wallet: "Wallet Integration",
      notifications: "Notifications",
      user: "User info"
    },
    nav: {
      landing: "Landing Page",
      login: "Login",
      register: "Register",
      dashboard: "Dashboard",
      create: "Create escrow",
      details: "Escrow details",
      tracking: "Tracking",
      wallet: "Wallet",
      notifications: "Notifications",
      user: "User info"
    },
    pages: {
      landing: {
        title: "TrustLock",
        eyebrow: "Smart escrow for safer second-hand trading.",
        description:
          "Smart escrow for safer second-hand trading."
      },
      login: {
        title: "Login",
        eyebrow: "Authentication",
        description: "Access escrow orders with phone OTP, embedded wallet, or MetaMask signature."
      },
      register: {
        title: "Register",
        eyebrow: "Authentication",
        description: "Create a trading profile, generate a smart wallet, and enable account security."
      },
      dashboard: {
        title: "Dashboard",
        eyebrow: "Escrow operations",
        description: "Monitor active orders, completed releases, disputes, analytics, and transaction activity."
      },
      create: {
        title: "Create escrow",
        eyebrow: "Escrow Pages",
        description: "Create a USDT escrow with delivery rules, timeout logic, and dispute policy."
      },
      details: {
        title: "Escrow details",
        eyebrow: "Escrow Pages",
        description: "Review smart contract state, wallets, amount, timeout, milestones, and release actions."
      },
      tracking: {
        title: "Tracking",
        eyebrow: "Escrow Pages",
        description: "Follow shipment events, oracle checks, delivery data, and the buyer complaint window."
      },
      wallet: {
        title: "Wallet integration",
        eyebrow: "Wallet Integration",
        description: "Connect MetaMask, review balances, and sign escrow transactions with clear previews."
      },
      notifications: {
        title: "Notifications",
        eyebrow: "Escrow alerts",
        description: "Deposit success, release success, and dispute alerts for second-hand transactions."
      },
      user: {
        title: "User info",
        eyebrow: "Trust profile",
        description: "Profile, wallet address, reputation, completed trades, disputes, and security settings."
      }
    },
    common: {
      createEscrow: "Create escrow",
      viewDashboard: "View dashboard",
      viewDetails: "Details",
      connectWallet: "Connect MetaMask",
      copyAddress: "Copy address",
      approveRelease: "Approve release",
      openDispute: "Open dispute",
      viewTracking: "View tracking",
      signMetaMask: "Sign with MetaMask",
      biometric: "Approve with biometric",
      refresh: "Refresh balance",
      simulateAlerts: "Simulate alerts",
      newEscrow: "New escrow",
      action: "Action",
      contact: "Contact",
      contract: "Contract",
      escrowId: "Escrow",
      lifetime: "Lifetime",
      realtime: "Realtime",
      status: "Status",
      timeout: "Timeout",
      amount: "Amount",
      updated: "Updated",
      item: "Item",
      counterparty: "Counterparty"
    },
    status: {
      created: "CREATED",
      deposited: "DEPOSITED",
      locked: "LOCKED",
      shipping: "SHIPPING",
      delivered: "DELIVERED",
      complaint: "COMPLAINT WINDOW",
      released: "RELEASED",
      disputed: "DISPUTED",
      refunded: "REFUNDED",
      evidence: "Evidence requested",
      jury: "Jury voting",
      settled: "Settled",
      inTransit: "In transit",
      outForDelivery: "Out for delivery",
      oracleVerified: "Oracle verified",
      pending: "Pending",
      ready: "Ready",
      active: "Active"
    },
    landing: {
      heroBadge: "USDT escrow for safer second-hand transactions",
      headline: "Smart escrow for safer second-hand trading.",
      body:
        "Buyers deposit stablecoin into a smart contract. Funds stay safely locked and are only released after delivery confirmation, timeout, or dispute resolution.",
      stats: [
        ["$2.4M", "Total locked value"],
        ["3,100", "Active escrows"],
        ["96.8%", "Dispute resolution rate"],
        ["4.6h", "Avg delivery confirmation"]
      ],
      flowTitle: "How escrow works",
      flowSubtitle: "A simple flow students can present clearly",
      flow: [
        ["Buyer deposits", "USDT on Polygon"],
        ["Smart contract locks", "No platform custody"],
        ["Seller ships item", "Delivery proof is collected"],
        ["Oracle verifies", "API, QR, or manual proof"],
        ["Funds release", "Seller receives payment"]
      ],
      features: [
        ["Smart contract custody", "Funds are locked in smart contract until clear release rules are met."],
        ["Delivery verification", "Delivery can be checked with postal API, QR handoff, or manual evidence."],
        ["Dispute jury", "Jurors review IPFS evidence and vote using a commit-reveal style process."]
      ]
    },
    auth: {
      loginTitle: "Login to TrustLock",
      loginSubtitle: "Choose a familiar account method or continue with wallet ownership.",
      phoneOtp: "Phone OTP",
      email: "Email",
      password: "Password",
      remember: "Keep me signed in",
      reset: "Reset password",
      login: "Login",
      embeddedWallet: "Embedded wallet",
      metaMask: "MetaMask",
      securityTitle: "Fintech-grade account gate",
      securityText:
        "OTP, wallet signatures, and device checks protect releases, refunds, and dispute actions.",
      registerTitle: "Register a secure trading profile",
      fullName: "Full name",
      role: "Marketplace role",
      phone: "Phone",
      confirmPassword: "Confirm password",
      createAccount: "Create account",
      roles: ["Buyer", "Seller", "Buyer and seller"],
      stepsTitle: "From account to smart wallet",
      steps: ["Create account", "Generate smart wallet", "Enable OTP/Biometric", "Ready to trade"],
      securityVisual: "Security visual",
      securityVisualText:
        "OTP, biometric approval, and wallet signatures can protect high-value second-hand trades."
    },
    dashboard: {
      analyticsTitle: "Escrow activity analytics",
      feedTitle: "Live transaction feed",
      deliveryTitle: "Recent delivery status",
      adoptionTitle: "User adoption by region",
      tabs: {
        active: "Active orders",
        completed: "Completed orders",
        disputes: "Disputes"
      },
      stats: [
        ["Locked value", "2.4M USDT", "Across active contracts"],
        ["Active orders", "3,100", "Second-hand trades"],
        ["Completed", "18,420", "Released or refunded"],
        ["Disputes", "42", "5 in jury reveal"]
      ],
      analytics: [
        ["Release success", "96.8%", "Orders released or refunded without escalation"],
        ["Avg oracle check", "6h", "Delivery evidence polling interval"],
        ["Sponsored gas", "82%", "Transactions paid by relayer"],
        ["Median dispute time", "14h", "From evidence upload to reveal"]
      ],
      regions: [
        ["Ho Chi Minh City", 38],
        ["Ha Noi", 26],
        ["Da Nang", 14],
        ["Can Tho", 9],
        ["Hai Phong", 7],
        ["Other provinces", 6]
      ]
    },
    escrow: {
      builderTitle: "Create a second-hand item escrow",
      contractPreview: "Contract preview",
      item: "Item",
      reference: "Marketplace reference",
      token: "Token",
      network: "Network",
      buyerWallet: "Buyer wallet",
      sellerWallet: "Seller wallet",
      deliveryMethod: "Delivery method",
      acceptance: "Acceptance criteria",
      deliveryCards: [
        ["Postal API", "GHTK, Viettel Post, or postal API proof"],
        ["Hand delivery QR", "Buyer scans QR to confirm receipt"],
        ["Manual tracking", "Photos, tracking code, manual review"]
      ],
      previewRows: [
        ["Timeout", "24h complaint window"],
        ["Escrow fee", "0.35% sponsored"],
        ["Dispute jury", "5 jurors commit-reveal"]
      ],
      detailsTitle: "ESC-2408 iPhone 13 Pro",
      contractData: "Contract data",
      milestones: [
        ["Buyer deposits USDT", "680 USDT locked in Polygon escrow contract."],
        ["Seller ships item", "GHTK delivery is moving to Da Nang."],
        ["Oracle verifies", "API proof is checked every 6 hours."],
        ["Funds release", "Buyer confirmation or timeout signs payout."]
      ]
    },
    tracking: {
      statusBadge: "Current status",
      currentStatus: "Shipping",
      flowTitle: "Shipment timeline",
      oracleTitle: "Oracle verification panel",
      deliveryTitle: "Delivery information",
      countdownTitle: "Complaint window",
      countdownValue: "18h 12m",
      countdownText: "Starts after delivery proof is confirmed.",
      oracleRows: [
        ["Last check", "2 hours ago"],
        ["Next check", "In 4 hours"],
        ["Source", "GHTK/API delivery"],
        ["Result", "Shipping proof pending"]
      ],
      deliveryRows: [
        ["Escrow ID", "ESC-2408"],
        ["Item", "iPhone 13 Pro 256GB"],
        ["Carrier", "GHTK/API delivery"],
        ["Tracking code", "GHTK-8831"],
        ["Origin", "Ho Chi Minh City"],
        ["Destination", "Da Nang"]
      ],
      events: [
        ["Created", "Buyer and seller accepted the escrow terms."],
        ["Deposited", "680 USDT deposited on Polygon."],
        ["Locked", "Smart contract locked the funds."],
        ["Shipping", "Seller handed the package to the carrier."],
        ["Delivered", "Waiting for delivery proof."],
        ["Complaint window", "Buyer can approve or open a dispute."],
        ["Released", "Funds release after confirmation or timeout."]
      ]
    },
    wallet: {
      connectTitle: "Wallet connection",
      selectedAccount: "Selected account",
      nativeBalance: "Native balance",
      network: "Network",
      statusDefault: "Connect MetaMask to read wallet balance and sign escrow actions.",
      balanceAvailable: "Available",
      balanceLocked: "Locked",
      balanceReleased: "Released",
      gasSponsored: "Gas sponsored",
      transactionPreview: "Transaction preview before signing",
      previewRows: [
        ["Method", "releaseFunds(uint256 escrowId)"],
        ["Amount", "680 USDT"],
        ["Contract", "0xE5c8...42F9"],
        ["Network", "Polygon"],
        ["Gas sponsor", "Platform relayer"],
        ["Escrow", "ESC-2408"]
      ],
      signatureCaptured: "Signature captured"
    },
    notifications: {
      center: "Escrow alerts",
      depositButton: "Deposit success",
      releaseButton: "Release success",
      disputeButton: "Dispute alerts",
      alertTypes: "Alert types",
      types: [
        "Funds locked in smart contract",
        "Payment released to seller",
        "Dispute opened",
        "Jury selected",
        "Evidence upload required"
      ]
    },
    user: {
      name: "Linh Tran",
      email: "linh.tran@student.vn",
      trustScore: "Trust score",
      profileRows: [
        ["Wallet", "0x91B4...3F21"],
        ["Reputation", "4.9 stars"],
        ["Completed trades", "84"],
        ["Dispute history", "2 resolved"],
        ["Verification level", "Level 3"]
      ],
      verificationTitle: "Security and reputation",
      recentTitle: "Recent activity"
    },
    contact: {
      title: "Contact us",
      description:
        "TrustLock is a smart escrow prototype for safer second-hand transactions, built for classroom presentation and product demos.",
      cards: [
        ["Email", "support@escrowchain.vn"],
        ["Hotline", "+84 900 123 456"],
        ["Address", "University of Economics and Law, Ho Chi Minh City"],
        ["Facebook", "TrustLock Vietnam"]
      ],
      quickLinks: ["About", "How escrow works", "Security", "Dispute policy", "Terms"],
      footer: "© 2026 TrustLock. Smart escrow prototype for safer second-hand trading."
    }
  },
  vi: {
    appName: "TrustLock",
    prototype: "Ký quỹ thông minh cho giao dịch đồ cũ an toàn hơn.",
    alerts: "Thông báo",
    connect: "Kết nối",
    connected: "Đã kết nối",
    disconnected: "Chưa kết nối",
    theme: "Giao diện",
    dark: "Tối",
    light: "Sáng",
    navGroups: {
      landing: "Trang giới thiệu",
      auth: "Xác thực",
      dashboard: "Bảng điều khiển",
      escrow: "Trang ký quỹ",
      wallet: "Ví Web3",
      notifications: "Thông báo",
      user: "Thông tin người dùng"
    },
    nav: {
      landing: "Trang giới thiệu",
      login: "Đăng nhập",
      register: "Đăng ký",
      dashboard: "Bảng điều khiển",
      create: "Tạo giao dịch ký quỹ",
      details: "Chi tiết ký quỹ",
      tracking: "Theo dõi giao hàng",
      wallet: "Ví",
      notifications: "Thông báo",
      user: "Thông tin người dùng"
    },
    pages: {
      landing: {
        title: "TrustLock",
        eyebrow: "Ký quỹ thông minh cho giao dịch đồ cũ an toàn hơn.",
        description:
          "Ký quỹ thông minh cho giao dịch đồ cũ an toàn hơn."
      },
      login: {
        title: "Đăng nhập",
        eyebrow: "Xác thực",
        description: "Truy cập đơn ký quỹ bằng OTP điện thoại, ví tích hợp hoặc chữ ký MetaMask."
      },
      register: {
        title: "Đăng ký",
        eyebrow: "Xác thực",
        description: "Tạo hồ sơ giao dịch, tạo ví thông minh và bật bảo mật tài khoản."
      },
      dashboard: {
        title: "Bảng điều khiển",
        eyebrow: "Vận hành ký quỹ",
        description: "Theo dõi đơn đang hoạt động, giao dịch hoàn tất, tranh chấp, phân tích và dòng giao dịch."
      },
      create: {
        title: "Tạo giao dịch ký quỹ",
        eyebrow: "Trang ký quỹ",
        description: "Tạo ký quỹ USDT với quy tắc giao hàng, thời hạn và chính sách tranh chấp."
      },
      details: {
        title: "Chi tiết ký quỹ",
        eyebrow: "Trang ký quỹ",
        description: "Xem trạng thái hợp đồng thông minh, ví, số tiền, thời hạn, mốc xử lý và thao tác giải ngân."
      },
      tracking: {
        title: "Theo dõi giao hàng",
        eyebrow: "Trang ký quỹ",
        description: "Theo dõi sự kiện giao hàng, kiểm tra oracle, thông tin vận chuyển và thời gian khiếu nại."
      },
      wallet: {
        title: "Tích hợp ví",
        eyebrow: "Ví Web3",
        description: "Kết nối MetaMask, xem số dư và ký giao dịch ký quỹ với phần xem trước rõ ràng."
      },
      notifications: {
        title: "Thông báo",
        eyebrow: "Cảnh báo ký quỹ",
        description: "Thông báo nạp tiền thành công, giải ngân thành công và cảnh báo tranh chấp."
      },
      user: {
        title: "Thông tin người dùng",
        eyebrow: "Hồ sơ tin cậy",
        description: "Hồ sơ, địa chỉ ví, điểm uy tín, giao dịch hoàn tất, lịch sử tranh chấp và bảo mật."
      }
    },
    common: {
      createEscrow: "Tạo giao dịch ký quỹ",
      viewDashboard: "Xem bảng điều khiển",
      viewDetails: "Chi tiết",
      connectWallet: "Kết nối MetaMask",
      copyAddress: "Sao chép địa chỉ",
      approveRelease: "Duyệt giải ngân",
      openDispute: "Mở tranh chấp",
      viewTracking: "Xem theo dõi",
      signMetaMask: "Ký bằng MetaMask",
      biometric: "Duyệt bằng sinh trắc",
      refresh: "Làm mới số dư",
      simulateAlerts: "Tạo thông báo mẫu",
      newEscrow: "Tạo ký quỹ mới",
      action: "Thao tác",
      contact: "Liên hệ",
      contract: "Hợp đồng",
      escrowId: "Ký quỹ",
      lifetime: "Tổng cộng",
      realtime: "Thời gian thực",
      status: "Trạng thái",
      timeout: "Thời hạn",
      amount: "Số tiền",
      updated: "Cập nhật",
      item: "Sản phẩm",
      counterparty: "Đối tác"
    },
    status: {
      created: "ĐÃ TẠO",
      deposited: "ĐÃ NẠP",
      locked: "ĐÃ KHÓA",
      shipping: "ĐANG GIAO",
      delivered: "ĐÃ GIAO",
      complaint: "THỜI GIAN KHIẾU NẠI",
      released: "ĐÃ GIẢI NGÂN",
      disputed: "TRANH CHẤP",
      refunded: "ĐÃ HOÀN TIỀN",
      evidence: "Cần bổ sung bằng chứng",
      jury: "Hội đồng đang bỏ phiếu",
      settled: "Đã xử lý",
      inTransit: "Đang vận chuyển",
      outForDelivery: "Đang giao đến người mua",
      oracleVerified: "Oracle đã xác minh",
      pending: "Đang chờ",
      ready: "Sẵn sàng",
      active: "Đang hoạt động"
    },
    landing: {
      heroBadge: "Ký quỹ USDT cho giao dịch đồ cũ an toàn hơn",
      headline: "Ký quỹ thông minh cho giao dịch đồ cũ an toàn.",
      body:
        "Người mua nạp stablecoin vào hợp đồng thông minh. Tiền được khóa an toàn và chỉ giải ngân khi giao hàng được xác nhận, hết thời hạn khiếu nại hoặc hội đồng tranh chấp đưa ra quyết định.",
      stats: [
        ["2,4 triệu USD", "Tổng giá trị đang khóa"],
        ["3.100", "Giao dịch ký quỹ đang hoạt động"],
        ["96,8%", "Tỷ lệ xử lý tranh chấp"],
        ["4,6 giờ", "Thời gian xác nhận giao hàng trung bình"]
      ],
      flowTitle: "Cách ký quỹ hoạt động",
      flowSubtitle: "Quy trình đơn giản, dễ trình bày trên lớp",
      flow: [
        ["Người mua nạp tiền", "USDT trên Polygon"],
        ["Hợp đồng khóa tiền", "Nền tảng không giữ tiền"],
        ["Người bán giao hàng", "Thu thập bằng chứng giao hàng"],
        ["Oracle xác minh", "API, QR hoặc bằng chứng thủ công"],
        ["Giải ngân", "Người bán nhận tiền"]
      ],
      features: [
        ["Lưu ký bằng hợp đồng thông minh", "Tiền đang được khóa trong hợp đồng thông minh cho đến khi đủ điều kiện giải ngân."],
        ["Xác minh giao hàng", "Trạng thái giao hàng có thể kiểm tra bằng API bưu cục, QR bàn giao hoặc bằng chứng thủ công."],
        ["Hội đồng tranh chấp", "Hội đồng xem bằng chứng IPFS và bỏ phiếu theo cơ chế commit-reveal."]
      ]
    },
    auth: {
      loginTitle: "Đăng nhập vào TrustLock",
      loginSubtitle: "Chọn cách đăng nhập quen thuộc hoặc xác thực quyền sở hữu ví.",
      phoneOtp: "OTP điện thoại",
      email: "Email",
      password: "Mật khẩu",
      remember: "Duy trì đăng nhập",
      reset: "Đặt lại mật khẩu",
      login: "Đăng nhập",
      embeddedWallet: "Ví tích hợp",
      metaMask: "MetaMask",
      securityTitle: "Cổng tài khoản chuẩn fintech",
      securityText:
        "OTP, chữ ký ví và kiểm tra thiết bị bảo vệ thao tác giải ngân, hoàn tiền và tranh chấp.",
      registerTitle: "Đăng ký hồ sơ giao dịch an toàn",
      fullName: "Họ và tên",
      role: "Vai trò trên chợ",
      phone: "Số điện thoại",
      confirmPassword: "Xác nhận mật khẩu",
      createAccount: "Tạo tài khoản",
      roles: ["Người mua", "Người bán", "Vừa mua vừa bán"],
      stepsTitle: "Từ tài khoản đến ví thông minh",
      steps: ["Tạo tài khoản", "Tạo ví thông minh", "Bật OTP/Sinh trắc", "Sẵn sàng giao dịch"],
      securityVisual: "Minh họa bảo mật",
      securityVisualText:
        "OTP, duyệt sinh trắc và chữ ký ví giúp bảo vệ giao dịch đồ cũ có giá trị cao."
    },
    dashboard: {
      analyticsTitle: "Phân tích hoạt động ký quỹ",
      feedTitle: "Dòng giao dịch trực tiếp",
      deliveryTitle: "Trạng thái giao hàng gần đây",
      adoptionTitle: "Tỷ lệ người dùng theo khu vực",
      tabs: {
        active: "Đơn đang hoạt động",
        completed: "Đơn đã hoàn tất",
        disputes: "Tranh chấp"
      },
      stats: [
        ["Giá trị đang khóa", "2,4 triệu USDT", "Trong hợp đồng đang hoạt động"],
        ["Đơn đang hoạt động", "3.100", "Giao dịch đồ cũ"],
        ["Đã hoàn tất", "18.420", "Đã giải ngân hoặc hoàn tiền"],
        ["Tranh chấp", "42", "5 vụ đang reveal phiếu"]
      ],
      analytics: [
        ["Tỷ lệ giải ngân", "96,8%", "Đơn được giải ngân hoặc hoàn tiền không cần leo thang"],
        ["Kiểm tra oracle TB", "6 giờ", "Chu kỳ kiểm tra bằng chứng giao hàng"],
        ["Gas được tài trợ", "82%", "Giao dịch do relayer chi trả"],
        ["Thời gian tranh chấp", "14 giờ", "Từ tải bằng chứng đến reveal"]
      ],
      regions: [
        ["TP. Hồ Chí Minh", 38],
        ["Hà Nội", 26],
        ["Đà Nẵng", 14],
        ["Cần Thơ", 9],
        ["Hải Phòng", 7],
        ["Tỉnh khác", 6]
      ]
    },
    escrow: {
      builderTitle: "Tạo ký quỹ cho sản phẩm đồ cũ",
      contractPreview: "Xem trước hợp đồng",
      item: "Sản phẩm",
      reference: "Mã tham chiếu chợ",
      token: "Token",
      network: "Mạng",
      buyerWallet: "Ví người mua",
      sellerWallet: "Ví người bán",
      deliveryMethod: "Phương thức giao hàng",
      acceptance: "Điều kiện chấp nhận",
      deliveryCards: [
        ["API bưu cục", "GHTK, Viettel Post hoặc bằng chứng từ API bưu cục"],
        ["Bàn giao bằng QR", "Người mua quét QR để xác nhận đã nhận hàng"],
        ["Theo dõi thủ công", "Ảnh, mã vận đơn và kiểm duyệt thủ công"]
      ],
      previewRows: [
        ["Thời hạn", "24 giờ khiếu nại"],
        ["Phí ký quỹ", "0,35% được tài trợ"],
        ["Hội đồng tranh chấp", "5 thành viên commit-reveal"]
      ],
      detailsTitle: "ESC-2408 iPhone 13 Pro",
      contractData: "Dữ liệu hợp đồng",
      milestones: [
        ["Người mua nạp USDT", "680 USDT được khóa trong hợp đồng Polygon."],
        ["Người bán giao hàng", "Đơn GHTK đang được vận chuyển đến Đà Nẵng."],
        ["Oracle xác minh", "Bằng chứng API được kiểm tra mỗi 6 giờ."],
        ["Giải ngân", "Xác nhận của người mua hoặc hết thời hạn sẽ kích hoạt thanh toán."]
      ]
    },
    tracking: {
      statusBadge: "Trạng thái hiện tại",
      currentStatus: "Đang giao hàng",
      flowTitle: "Dòng thời gian giao hàng",
      oracleTitle: "Bảng xác minh oracle",
      deliveryTitle: "Thông tin giao hàng",
      countdownTitle: "Thời gian khiếu nại",
      countdownValue: "18 giờ 12 phút",
      countdownText: "Bắt đầu sau khi bằng chứng giao hàng được xác nhận.",
      oracleRows: [
        ["Lần kiểm tra gần nhất", "2 giờ trước"],
        ["Lần kiểm tra tiếp theo", "Sau 4 giờ"],
        ["Nguồn", "GHTK/API delivery"],
        ["Kết quả", "Đang chờ bằng chứng giao hàng"]
      ],
      deliveryRows: [
        ["Mã ký quỹ", "ESC-2408"],
        ["Sản phẩm", "iPhone 13 Pro 256GB"],
        ["Đơn vị vận chuyển", "GHTK/API delivery"],
        ["Mã theo dõi", "GHTK-8831"],
        ["Điểm gửi", "TP. Hồ Chí Minh"],
        ["Điểm nhận", "Đà Nẵng"]
      ],
      events: [
        ["Đã tạo", "Người mua và người bán chấp nhận điều khoản ký quỹ."],
        ["Đã nạp", "680 USDT đã được nạp trên Polygon."],
        ["Đã khóa", "Hợp đồng thông minh khóa tiền."],
        ["Đang giao", "Người bán đã giao hàng cho đơn vị vận chuyển."],
        ["Đã giao", "Đang chờ bằng chứng giao hàng."],
        ["Thời gian khiếu nại", "Người mua có thể duyệt hoặc mở tranh chấp."],
        ["Đã giải ngân", "Tiền được giải ngân sau xác nhận hoặc hết thời hạn."]
      ]
    },
    wallet: {
      connectTitle: "Kết nối ví",
      selectedAccount: "Tài khoản đã chọn",
      nativeBalance: "Số dư native",
      network: "Mạng",
      statusDefault: "Kết nối MetaMask để đọc số dư ví và ký thao tác ký quỹ.",
      balanceAvailable: "Khả dụng",
      balanceLocked: "Đang khóa",
      balanceReleased: "Đã giải ngân",
      gasSponsored: "Gas tài trợ",
      transactionPreview: "Xem trước giao dịch trước khi ký",
      previewRows: [
        ["Phương thức", "releaseFunds(uint256 escrowId)"],
        ["Số tiền", "680 USDT"],
        ["Hợp đồng", "0xE5c8...42F9"],
        ["Mạng", "Polygon"],
        ["Tài trợ gas", "Platform relayer"],
        ["Ký quỹ", "ESC-2408"]
      ],
      signatureCaptured: "Đã nhận chữ ký"
    },
    notifications: {
      center: "Cảnh báo ký quỹ",
      depositButton: "Nạp tiền thành công",
      releaseButton: "Giải ngân thành công",
      disputeButton: "Cảnh báo tranh chấp",
      alertTypes: "Loại cảnh báo",
      types: [
        "Tiền đang được khóa trong hợp đồng thông minh",
        "Thanh toán đã chuyển cho người bán",
        "Tranh chấp đã được mở",
        "Hội đồng đã được chọn",
        "Cần tải bằng chứng"
      ]
    },
    user: {
      name: "Linh Trần",
      email: "linh.tran@student.vn",
      trustScore: "Điểm tin cậy",
      profileRows: [
        ["Ví", "0x91B4...3F21"],
        ["Uy tín", "4,9 sao"],
        ["Giao dịch hoàn tất", "84"],
        ["Lịch sử tranh chấp", "2 vụ đã xử lý"],
        ["Cấp xác minh", "Cấp 3"]
      ],
      verificationTitle: "Bảo mật và uy tín",
      recentTitle: "Hoạt động gần đây"
    },
    contact: {
      title: "Liên hệ với chúng tôi",
      description:
        "TrustLock là nguyên mẫu ký quỹ thông minh giúp giao dịch đồ cũ an toàn hơn, phù hợp cho thuyết trình trên lớp và demo sản phẩm.",
      cards: [
        ["Email", "support@escrowchain.vn"],
        ["Hotline", "+84 900 123 456"],
        ["Địa chỉ", "Trường Đại học Kinh tế - Luật, TP. Hồ Chí Minh"],
        ["Facebook", "TrustLock Vietnam"]
      ],
      quickLinks: ["Giới thiệu", "Cách ký quỹ hoạt động", "Bảo mật", "Chính sách tranh chấp", "Điều khoản"],
      footer: "© 2026 TrustLock. Nguyên mẫu ký quỹ thông minh cho giao dịch đồ cũ an toàn hơn."
    }
  }
};

const navGroups = [
  { key: "landing", items: [{ id: "landing", icon: Home }] },
  { key: "auth", items: [{ id: "login", icon: LogIn }, { id: "register", icon: UserPlus }] },
  { key: "dashboard", items: [{ id: "dashboard", icon: LayoutDashboard }] },
  {
    key: "escrow",
    items: [
      { id: "create", icon: PlusCircle },
      { id: "details", icon: FileText },
      { id: "tracking", icon: Truck }
    ]
  },
  { key: "wallet", items: [{ id: "wallet", icon: Wallet }] },
  { key: "notifications", items: [{ id: "notifications", icon: Bell }] },
  { key: "user", items: [{ id: "user", icon: UserCircle }] }
];

const orderData = {
  active: [
    {
      id: "ESC-2408",
      item: { en: "iPhone 13 Pro", vi: "iPhone 13 Pro" },
      counterparty: { en: "Minh Camera Store", vi: "Cửa hàng Minh Camera" },
      amount: "680 USDT",
      status: "locked",
      milestone: { en: "GHTK delivery moving to Da Nang", vi: "Đơn GHTK đang chuyển đến Đà Nẵng" },
      updated: { en: "4 min ago", vi: "4 phút trước" },
      tone: "info"
    },
    {
      id: "ESC-2412",
      item: { en: "MacBook Air M2", vi: "MacBook Air M2" },
      counterparty: { en: "Ha Noi Laptop Hub", vi: "Ha Noi Laptop Hub" },
      amount: "940 USDT",
      status: "delivered",
      milestone: { en: "Oracle proof received", vi: "Đã nhận bằng chứng từ oracle" },
      updated: { en: "12 min ago", vi: "12 phút trước" },
      tone: "success"
    },
    {
      id: "ESC-2419",
      item: { en: "AirPods Pro 2", vi: "AirPods Pro 2" },
      counterparty: { en: "Can Tho Audio", vi: "Can Tho Audio" },
      amount: "145 USDT",
      status: "shipping",
      milestone: { en: "Buyer QR handoff pending", vi: "Đang chờ QR bàn giao từ người mua" },
      updated: { en: "28 min ago", vi: "28 phút trước" },
      tone: "warning"
    }
  ],
  completed: [
    {
      id: "ESC-2387",
      item: { en: "Sony A6400 Camera", vi: "Máy ảnh Sony A6400" },
      counterparty: { en: "Da Nang Studio", vi: "Da Nang Studio" },
      amount: "520 USDT",
      result: { en: "Released to seller", vi: "Đã giải ngân cho người bán" },
      tx: "0x8a19...91df",
      updated: { en: "Yesterday", vi: "Hôm qua" },
      tone: "success"
    },
    {
      id: "ESC-2371",
      item: { en: "Nintendo Switch OLED", vi: "Nintendo Switch OLED" },
      counterparty: { en: "Hai Phong Games", vi: "Hai Phong Games" },
      amount: "210 USDT",
      result: { en: "Refunded to buyer", vi: "Đã hoàn tiền cho người mua" },
      tx: "0x2f70...88c1",
      updated: { en: "May 24", vi: "24/05" },
      tone: "warning"
    },
    {
      id: "ESC-2356",
      item: { en: "ThinkPad X1 Carbon", vi: "ThinkPad X1 Carbon" },
      counterparty: { en: "Saigon Tech Resale", vi: "Saigon Tech Resale" },
      amount: "760 USDT",
      result: { en: "Released to seller", vi: "Đã giải ngân cho người bán" },
      tx: "0x7c2d...0b42",
      updated: { en: "May 23", vi: "23/05" },
      tone: "success"
    }
  ],
  disputes: [
    {
      id: "ESC-2394",
      item: { en: "Canon Lens 24-70", vi: "Ống kính Canon 24-70" },
      counterparty: { en: "Photo Market HCM", vi: "Photo Market HCM" },
      amount: "430 USDT",
      status: "jury",
      reason: { en: "Condition mismatch", vi: "Tình trạng sản phẩm không khớp" },
      updated: { en: "15 min ago", vi: "15 phút trước" },
      tone: "danger"
    },
    {
      id: "ESC-2368",
      item: { en: "Gaming Console", vi: "Máy chơi game" },
      counterparty: { en: "Retro Game VN", vi: "Retro Game VN" },
      amount: "188 USDT",
      status: "evidence",
      reason: { en: "Serial number not matching", vi: "Số serial không trùng khớp" },
      updated: { en: "1 hr ago", vi: "1 giờ trước" },
      tone: "warning"
    }
  ]
};

const transactionFeed = [
  { hash: "0x6a42...c912", event: { en: "Deposit locked", vi: "Tiền đã được khóa" }, value: "680 USDT", escrow: "ESC-2408" },
  { hash: "0x919d...57ba", event: { en: "Oracle update", vi: "Oracle cập nhật" }, value: { en: "Delivered", vi: "Đã giao" }, escrow: "ESC-2412" },
  { hash: "0x30ce...a711", event: { en: "Jury commit", vi: "Hội đồng commit phiếu" }, value: { en: "Hash stored", vi: "Hash đã lưu" }, escrow: "ESC-2394" },
  { hash: "0xa701...40fd", event: { en: "Release signed", vi: "Đã ký giải ngân" }, value: "520 USDT", escrow: "ESC-2387" }
];

const deliveryStatus = [
  { id: "ESC-2408", item: { en: "iPhone 13 Pro", vi: "iPhone 13 Pro" }, status: "inTransit", eta: { en: "18h", vi: "18 giờ" } },
  { id: "ESC-2412", item: { en: "MacBook Air M2", vi: "MacBook Air M2" }, status: "oracleVerified", eta: { en: "Completed", vi: "Hoàn tất" } },
  { id: "ESC-2419", item: { en: "AirPods Pro 2", vi: "AirPods Pro 2" }, status: "outForDelivery", eta: { en: "4h", vi: "4 giờ" } }
];

const jurors = [
  { name: "Juror 01", vote: { en: "Buyer", vi: "Người mua" }, status: { en: "Committed", vi: "Đã commit" } },
  { name: "Juror 02", vote: { en: "Hidden", vi: "Ẩn" }, status: { en: "Commit hash", vi: "Hash phiếu" } },
  { name: "Juror 03", vote: { en: "Seller", vi: "Người bán" }, status: { en: "Revealed", vi: "Đã reveal" } },
  { name: "Juror 04", vote: { en: "Hidden", vi: "Ẩn" }, status: { en: "Commit hash", vi: "Hash phiếu" } },
  { name: "Juror 05", vote: { en: "Buyer", vi: "Người mua" }, status: { en: "Revealed", vi: "Đã reveal" } }
];

const evidenceCards = [
  { title: { en: "Product photos", vi: "Ảnh sản phẩm" }, hash: "ipfs://bafy...91ca", owner: { en: "Buyer", vi: "Người mua" } },
  { title: { en: "Shipping proof", vi: "Bằng chứng giao hàng" }, hash: "ipfs://bafy...77f2", owner: { en: "Oracle", vi: "Oracle" } },
  { title: { en: "Chat receipt", vi: "Biên nhận trò chuyện" }, hash: "ipfs://bafy...18ab", owner: { en: "Seller", vi: "Người bán" } }
];

const notificationSeed = [
  {
    id: 1,
    type: { en: "Deposit success", vi: "Nạp tiền thành công" },
    title: { en: "Funds are locked in smart contract", vi: "Tiền đang được khóa trong hợp đồng thông minh" },
    message: {
      en: "680 USDT on Polygon was deposited for iPhone 13 Pro escrow ESC-2408.",
      vi: "680 USDT trên Polygon đã được nạp cho ký quỹ iPhone 13 Pro ESC-2408."
    },
    time: { en: "2 min ago", vi: "2 phút trước" },
    tone: "success",
    icon: CircleDollarSign
  },
  {
    id: 2,
    type: { en: "Release success", vi: "Giải ngân thành công" },
    title: { en: "Payment released to seller", vi: "Thanh toán đã chuyển cho người bán" },
    message: {
      en: "520 USDT was released after oracle delivery and buyer confirmation for ESC-2387.",
      vi: "520 USDT đã được giải ngân sau khi oracle xác minh giao hàng và người mua xác nhận cho ESC-2387."
    },
    time: { en: "Yesterday", vi: "Hôm qua" },
    tone: "success",
    icon: CheckCircle2
  },
  {
    id: 3,
    type: { en: "Dispute alert", vi: "Cảnh báo tranh chấp" },
    title: { en: "Jury selected", vi: "Hội đồng đã được chọn" },
    message: {
      en: "Five jurors were assigned to ESC-2394. Evidence upload is required before reveal.",
      vi: "Năm thành viên hội đồng đã được gán cho ESC-2394. Cần tải bằng chứng trước giai đoạn reveal."
    },
    time: { en: "24 min ago", vi: "24 phút trước" },
    tone: "danger",
    icon: MessageSquareWarning
  }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function text(value, language) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || "";
}

function shortAddress(address) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function balanceFromWei(hexValue) {
  const wei = BigInt(hexValue);
  const roundedCents = Number((wei * 100n) / 1000000000000000000n);
  return `${(roundedCents / 100).toFixed(2)} MATIC`;
}

function getTheme(isDark) {
  return {
    isDark,
    page: isDark
      ? "bg-slate-950 text-slate-100"
      : "bg-slate-100 text-slate-950",
    background: isDark
      ? "bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(139,92,246,0.16),transparent_28%),linear-gradient(135deg,#020617_0%,#08111f_48%,#020617_100%)]"
      : "bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#eef6ff_52%,#f8fafc_100%)]",
    sidebar: isDark
      ? "border-white/10 bg-slate-950/82 backdrop-blur-xl"
      : "border-slate-200 bg-white/88 backdrop-blur-xl",
    header: isDark
      ? "border-white/10 bg-slate-950/70 backdrop-blur-xl"
      : "border-slate-200 bg-white/80 backdrop-blur-xl",
    card: isDark
      ? "border-white/10 bg-slate-950/62 text-slate-100 shadow-[0_20px_70px_rgba(2,6,23,0.38)] backdrop-blur-xl"
      : "border-slate-200 bg-white/92 text-slate-950 shadow-[0_18px_42px_rgba(15,23,42,0.08)] backdrop-blur-xl",
    soft: isDark ? "border-white/10 bg-white/7" : "border-slate-200 bg-slate-50",
    softHover: isDark ? "hover:border-white/20 hover:bg-white/10" : "hover:border-blue-200 hover:bg-blue-50",
    heading: isDark ? "text-white" : "text-slate-950",
    text: isDark ? "text-slate-100" : "text-slate-900",
    muted: isDark ? "text-slate-400" : "text-slate-600",
    faint: isDark ? "text-slate-500" : "text-slate-500",
    border: isDark ? "border-white/10" : "border-slate-200",
    input: isDark
      ? "border-white/15 bg-white text-slate-900 placeholder:text-slate-500 caret-cyan-500 selection:bg-cyan-300 selection:text-slate-950 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 caret-cyan-500 selection:bg-cyan-200 selection:text-slate-950 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40",
    activeNav: isDark
      ? "border-cyan-300/35 bg-cyan-300/12 text-white shadow-[0_0_24px_rgba(34,211,238,0.18)]"
      : "border-blue-300 bg-blue-50 text-blue-800 shadow-sm",
    idleNav: isDark
      ? "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/7 hover:text-white"
      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950",
    accentText: isDark ? "text-cyan-300" : "text-blue-700",
    accentBg: isDark ? "bg-cyan-300 text-slate-950" : "bg-blue-600 text-white",
    footer: isDark ? "border-white/10 bg-slate-950/55" : "border-slate-200 bg-white/84"
  };
}

function Button({ children, icon: Icon, variant = "primary", size = "md", theme, className = "", ...props }) {
  const isDark = theme.isDark;
  const variants = {
    primary: isDark
      ? "border border-cyan-300/40 bg-cyan-400 text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.28)] hover:bg-cyan-300"
      : "border border-blue-600 bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)] hover:bg-blue-700",
    secondary: isDark
      ? "border border-white/15 bg-white/8 text-slate-100 hover:border-cyan-300/45 hover:bg-cyan-300/10"
      : "border border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50",
    ghost: isDark ? "text-slate-300 hover:bg-white/8 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
    danger: "border border-rose-400/45 bg-rose-500/90 text-white hover:bg-rose-500",
    warning: "border border-amber-300/40 bg-amber-300 text-slate-950 hover:bg-amber-200",
    emerald: "border border-emerald-300/40 bg-emerald-400 text-slate-950 hover:bg-emerald-300"
  };
  const sizes = {
    sm: "min-h-9 px-3 text-xs",
    md: "min-h-11 px-4 text-sm",
    lg: "min-h-12 px-5 text-base"
  };

  return (
    <button
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
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.28 }}
    >
      {children}
    </motion.div>
  );
}

function Badge({ children, tone = "neutral", className = "" }) {
  const tones = {
    neutral: "border-slate-400/20 bg-slate-400/10 text-slate-400",
    success: "border-emerald-300/25 bg-emerald-400/12 text-emerald-500 dark:text-emerald-200",
    info: "border-cyan-300/25 bg-cyan-400/12 text-cyan-600 dark:text-cyan-200",
    warning: "border-amber-300/25 bg-amber-400/12 text-amber-700 dark:text-amber-200",
    danger: "border-rose-300/25 bg-rose-400/12 text-rose-600 dark:text-rose-200",
    violet: "border-violet-300/25 bg-violet-400/12 text-violet-600 dark:text-violet-200"
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

function SectionTitle({ eyebrow, title, theme, children }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className={classNames("text-xs font-black uppercase tracking-[0.22em]", theme.accentText)}>{eyebrow}</p> : null}
        <h2 className={classNames("mt-1 text-2xl font-black", theme.heading)}>{title}</h2>
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

function ProgressBar({ value, theme }) {
  return (
    <div className={classNames("h-2 overflow-hidden rounded-full", theme.isDark ? "bg-white/8" : "bg-slate-200")}>
      <div className={classNames("h-full rounded-full bg-gradient-to-r", theme.isDark ? "from-cyan-300 to-violet-400" : "from-blue-500 to-cyan-500")} style={{ width: `${value}%` }} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail, theme, tone = "cyan" }) {
  const tones = {
    cyan: theme.isDark ? "from-cyan-300/25 to-blue-500/10 text-cyan-200" : "from-blue-100 to-cyan-50 text-blue-700",
    emerald: theme.isDark ? "from-emerald-300/25 to-cyan-500/10 text-emerald-200" : "from-emerald-100 to-cyan-50 text-emerald-700",
    violet: theme.isDark ? "from-violet-300/25 to-fuchsia-500/10 text-violet-200" : "from-violet-100 to-blue-50 text-violet-700",
    amber: theme.isDark ? "from-amber-300/25 to-orange-500/10 text-amber-200" : "from-amber-100 to-orange-50 text-amber-700",
    rose: theme.isDark ? "from-rose-300/25 to-pink-500/10 text-rose-200" : "from-rose-100 to-pink-50 text-rose-700"
  };

  return (
    <Card theme={theme} className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={classNames("text-sm font-semibold", theme.muted)}>{label}</p>
          <p className={classNames("mt-2 text-2xl font-black", theme.heading)}>{value}</p>
          <p className={classNames("mt-1 text-sm", theme.muted)}>{detail}</p>
        </div>
        <div className={classNames("rounded-lg border bg-gradient-to-br p-3", theme.border, tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function ContactSection({ c, theme, compact = false }) {
  const icons = [Mail, Phone, MapPin, MessageCircle];
  return (
    <Card theme={theme} className={classNames("overflow-hidden", compact ? "p-5" : "p-6")}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className={classNames("text-xs font-black uppercase tracking-[0.22em]", theme.accentText)}>{c.common.contact}</p>
          <h2 className={classNames("mt-2 text-3xl font-black", theme.heading)}>{c.contact.title}</h2>
          <p className={classNames("mt-3 max-w-2xl text-sm leading-7", theme.muted)}>{c.contact.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {c.contact.quickLinks.map((link) => (
              <button key={link} className={classNames("rounded-full border px-3 py-1.5 text-xs font-bold transition", theme.soft, theme.softHover)} type="button">
                {link}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {c.contact.cards.map(([label, value], index) => {
            const Icon = icons[index] || Mail;
            return (
              <div key={label} className={classNames("rounded-lg border p-4", theme.soft)}>
                <Icon className={classNames("h-5 w-5", theme.accentText)} />
                <p className={classNames("mt-3 text-sm font-bold", theme.heading)}>{label}</p>
                <p className={classNames("mt-1 text-sm leading-6", theme.muted)}>{value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function Footer({ c, theme, setCurrentPage }) {
  return (
    <footer className={classNames("mt-8 rounded-lg border p-5", theme.footer)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className={classNames("font-black", theme.heading)}>{c.appName}</p>
          <p className={classNames("mt-1 text-sm", theme.muted)}>{c.contact.footer}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {c.contact.quickLinks.map((link, index) => (
            <button
              key={link}
              className={classNames("rounded-lg px-3 py-2 text-xs font-bold transition", theme.isDark ? "text-slate-400 hover:bg-white/8 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950")}
              type="button"
              onClick={() => setCurrentPage(index === 1 ? "landing" : index === 2 ? "wallet" : index === 3 ? "notifications" : "landing")}
            >
              {link}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

function BlockchainFlow({ c, theme }) {
  const icons = [Wallet, LockKeyhole, Truck, Radio, Send];
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {c.landing.flow.map(([label, detail], index) => {
        const Icon = icons[index];
        return (
          <motion.div
            key={label}
            className={classNames("relative rounded-lg border p-4", theme.soft)}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <div className={classNames("flex h-10 w-10 items-center justify-center rounded-lg border", theme.isDark ? "border-cyan-300/25 bg-cyan-300/12 text-cyan-200" : "border-blue-200 bg-blue-50 text-blue-700")}>
              <Icon className="h-5 w-5" />
            </div>
            <p className={classNames("mt-4 font-black", theme.heading)}>{label}</p>
            <p className={classNames("mt-1 text-sm", theme.muted)}>{detail}</p>
            {index < c.landing.flow.length - 1 ? <ArrowRight className={classNames("absolute right-3 top-5 hidden h-4 w-4 md:block", theme.accentText)} /> : null}
          </motion.div>
        );
      })}
    </div>
  );
}

function LandingPage({ c, theme, setCurrentPage }) {
  const featureIcons = [ShieldCheck, Radio, Gavel];
  return (
    <div className="space-y-6">
      <section className={classNames("relative min-h-[560px] overflow-hidden rounded-lg border", theme.isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white")}>
        <div className={classNames("absolute inset-0", theme.isDark ? "hero-grid" : "bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:34px_34px]")} />
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute right-8 top-10 hidden w-[360px] opacity-70 lg:block">
          <svg viewBox="0 0 360 360" className="h-full w-full" aria-hidden="true">
            <circle cx="180" cy="180" r="122" fill="none" stroke={theme.isDark ? "rgba(34,211,238,0.2)" : "rgba(37,99,235,0.16)"} strokeWidth="1" />
            <circle cx="180" cy="180" r="82" fill="none" stroke={theme.isDark ? "rgba(139,92,246,0.22)" : "rgba(14,165,233,0.18)"} strokeWidth="1" strokeDasharray="8 10" />
            {[0, 60, 120, 180, 240, 300].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x = 180 + Math.cos(rad) * 122;
              const y = 180 + Math.sin(rad) * 122;
              return <circle key={angle} cx={x} cy={y} r="8" fill={theme.isDark ? "#22d3ee" : "#2563eb"} opacity="0.75" />;
            })}
          </svg>
        </div>

        <div className="relative z-10 flex min-h-[560px] max-w-5xl flex-col justify-end p-6 sm:p-8 lg:p-10">
          <Badge tone="info" className="w-fit">{c.landing.heroBadge}</Badge>
          <h1 className={classNames("mt-6 max-w-4xl text-4xl font-black leading-[1.2] tracking-tight sm:text-6xl lg:leading-[1.25]", theme.heading)}>{c.landing.headline}</h1>
          <p className={classNames("mt-5 max-w-3xl text-base leading-8", theme.muted)}>{c.landing.body}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button theme={theme} icon={PlusCircle} size="lg" onClick={() => setCurrentPage("create")}>{c.common.createEscrow}</Button>
            <Button theme={theme} icon={BarChart3} variant="secondary" size="lg" onClick={() => setCurrentPage("dashboard")}>{c.common.viewDashboard}</Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {c.landing.stats.map(([value, label]) => (
              <div key={label} className={classNames("rounded-lg border p-4 backdrop-blur-xl", theme.soft)}>
                <p className={classNames("text-2xl font-black", theme.heading)}>{value}</p>
                <p className={classNames("mt-1 text-sm", theme.muted)}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Card theme={theme}>
        <SectionTitle theme={theme} eyebrow={c.landing.flowSubtitle} title={c.landing.flowTitle} />
        <BlockchainFlow c={c} theme={theme} />
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {c.landing.features.map(([title, body], index) => {
          const Icon = featureIcons[index];
          return (
            <Card theme={theme} key={title}>
              <Icon className={classNames("h-7 w-7", theme.accentText)} />
              <h3 className={classNames("mt-4 font-black", theme.heading)}>{title}</h3>
              <p className={classNames("mt-2 text-sm leading-6", theme.muted)}>{body}</p>
            </Card>
          );
        })}
      </div>

      <ContactSection c={c} theme={theme} />
    </div>
  );
}

function LoginPage({ c, theme, setCurrentPage }) {
  const loginOptions = [
    { label: c.auth.phoneOtp, icon: Smartphone },
    { label: c.auth.embeddedWallet, icon: Fingerprint },
    { label: c.auth.metaMask, icon: Wallet }
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card theme={theme}>
        <SectionTitle theme={theme} eyebrow={c.auth.loginSubtitle} title={c.auth.loginTitle} />
        <form className="grid gap-4">
          <Field theme={theme} label={c.auth.phoneOtp} icon={Phone}>
            <TextInput theme={theme} placeholder="+84 90 123 4567" />
          </Field>
          <Field theme={theme} label={c.auth.email} icon={Mail}>
            <TextInput theme={theme} type="email" placeholder="student@university.edu.vn" />
          </Field>
          <Field theme={theme} label={c.auth.password} icon={KeyRound}>
            <TextInput theme={theme} type="password" placeholder="••••••••" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            {loginOptions.map((option) => (
              <button key={option.label} className={classNames("rounded-lg border p-3 text-left transition", theme.soft, theme.softHover)} type="button">
                <option.icon className={classNames("h-5 w-5", theme.accentText)} />
                <p className={classNames("mt-2 text-xs font-bold", theme.text)}>{option.label}</p>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className={classNames("flex items-center gap-2", theme.muted)}>
              <input className="h-4 w-4 accent-blue-600" type="checkbox" />
              {c.auth.remember}
            </label>
            <button className={classNames("font-bold", theme.accentText)} type="button">{c.auth.reset}</button>
          </div>
          <Button theme={theme} icon={LogIn} className="w-full" type="button">{c.auth.login}</Button>
          <Button theme={theme} icon={Wallet} variant="secondary" className="w-full" type="button" onClick={() => setCurrentPage("wallet")}>{c.common.connectWallet}</Button>
        </form>
      </Card>

      <div className="grid gap-4">
        <Card theme={theme} className={theme.isDark ? "bg-gradient-to-br from-cyan-400/12 via-slate-950/70 to-violet-500/14" : "bg-gradient-to-br from-blue-50 via-white to-cyan-50"}>
          <div className="flex items-start gap-4">
            <div className={classNames("rounded-lg border p-3", theme.isDark ? "border-cyan-300/25 bg-cyan-300/12 text-cyan-200" : "border-blue-200 bg-blue-50 text-blue-700")}>
              <Fingerprint className="h-6 w-6" />
            </div>
            <div>
              <h3 className={classNames("text-xl font-black", theme.heading)}>{c.auth.securityTitle}</h3>
              <p className={classNames("mt-2 leading-7", theme.muted)}>{c.auth.securityText}</p>
            </div>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            [ShieldCheck, c.status.active, c.auth.securityText],
            [ReceiptText, c.status.ready, c.pages.login.description]
          ].map(([Icon, title, body]) => (
            <Card theme={theme} key={title}>
              <Icon className={classNames("h-6 w-6", theme.accentText)} />
              <p className={classNames("mt-4 font-black", theme.heading)}>{title}</p>
              <p className={classNames("mt-2 text-sm leading-6", theme.muted)}>{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ c, theme }) {
  const stepIcons = [UserPlus, Wallet, Fingerprint, CheckCircle2];
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card theme={theme}>
        <SectionTitle theme={theme} eyebrow={c.pages.register.description} title={c.auth.registerTitle} />
        <form className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field theme={theme} label={c.auth.fullName} icon={UserCircle}>
              <TextInput theme={theme} placeholder={c.user.name} />
            </Field>
            <Field theme={theme} label={c.auth.role} icon={BadgeCheck}>
              <SelectInput theme={theme} defaultValue={c.auth.roles[0]}>
                {c.auth.roles.map((role) => <option key={role}>{role}</option>)}
              </SelectInput>
            </Field>
          </div>
          <Field theme={theme} label={c.auth.email} icon={Mail}>
            <TextInput theme={theme} type="email" placeholder="student@example.com" />
          </Field>
          <Field theme={theme} label={c.auth.phone} icon={Phone}>
            <TextInput theme={theme} placeholder="+84 91 222 3344" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field theme={theme} label={c.auth.password} icon={KeyRound}>
              <TextInput theme={theme} type="password" placeholder="••••••••" />
            </Field>
            <Field theme={theme} label={c.auth.confirmPassword} icon={LockKeyhole}>
              <TextInput theme={theme} type="password" placeholder="••••••••" />
            </Field>
          </div>
          <Button theme={theme} icon={UserPlus} type="button">{c.auth.createAccount}</Button>
        </form>
      </Card>

      <Card theme={theme}>
        <SectionTitle theme={theme} eyebrow={c.auth.securityVisual} title={c.auth.stepsTitle} />
        <div className="grid gap-4">
          {c.auth.steps.map((step, index) => {
            const Icon = stepIcons[index];
            return (
              <div key={step} className={classNames("flex items-center gap-4 rounded-lg border p-4", theme.soft)}>
                <div className={classNames("flex h-11 w-11 items-center justify-center rounded-lg border", theme.isDark ? "border-cyan-300/25 bg-cyan-300/12 text-cyan-200" : "border-blue-200 bg-blue-50 text-blue-700")}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={classNames("font-black", theme.heading)}>{step}</p>
                  <p className={classNames("text-sm", theme.muted)}>{index + 1} / 4</p>
                </div>
                {index < c.auth.steps.length - 1 ? <ArrowRight className={classNames("h-4 w-4", theme.accentText)} /> : <Check className="h-4 w-4 text-emerald-500" />}
              </div>
            );
          })}
        </div>
        <div className="mt-5 rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-4">
          <p className="font-black text-emerald-600 dark:text-emerald-100">{c.auth.securityVisual}</p>
          <p className={classNames("mt-2 text-sm leading-6", theme.muted)}>{c.auth.securityVisualText}</p>
        </div>
      </Card>
    </div>
  );
}

function DashboardPage({ c, theme, language, setCurrentPage }) {
  const [tab, setTab] = useState("active");
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {c.dashboard.stats.map(([label, value, detail], index) => (
          <StatCard
            key={label}
            theme={theme}
            icon={[Coins, Clock3, CheckCircle2, ShieldAlert][index]}
            label={label}
            value={value}
            detail={detail}
            tone={["cyan", "emerald", "violet", "rose"][index]}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card theme={theme}>
          <SectionTitle theme={theme} eyebrow={c.pages.dashboard.eyebrow} title={c.dashboard.analyticsTitle} />
          <div className="grid gap-3 sm:grid-cols-2">
            {c.dashboard.analytics.map(([label, value, detail], index) => (
              <div key={label} className={classNames("rounded-lg border p-4", theme.soft)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={classNames("text-sm font-bold", theme.heading)}>{label}</p>
                    <p className={classNames("mt-1 text-sm", theme.muted)}>{detail}</p>
                  </div>
                  <Badge tone={["info", "success", "violet", "warning"][index]}>{value}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card theme={theme}>
          <SectionTitle theme={theme} eyebrow={c.pages.dashboard.description} title={c.dashboard.adoptionTitle} />
          <div className="grid gap-4">
            {c.dashboard.regions.map(([region, value]) => (
              <div key={region}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className={classNames("font-bold", theme.heading)}>{region}</span>
                  <span className={theme.muted}>{value}%</span>
                </div>
                <ProgressBar value={value} theme={theme} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card theme={theme}>
          <SectionTitle theme={theme} eyebrow={c.common.status} title={c.dashboard.deliveryTitle} />
          <div className="grid gap-3">
            {deliveryStatus.map((delivery) => (
              <div key={delivery.id} className={classNames("flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4", theme.soft)}>
                <div>
                  <p className={classNames("font-black", theme.heading)}>{delivery.id} - {text(delivery.item, language)}</p>
                  <p className={classNames("mt-1 text-sm", theme.muted)}>{text(delivery.eta, language)}</p>
                </div>
                <Badge tone={delivery.status === "oracleVerified" ? "success" : "info"}>{c.status[delivery.status]}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card theme={theme}>
          <SectionTitle theme={theme} eyebrow={c.common.realtime} title={c.dashboard.feedTitle} />
          <div className="grid gap-3">
            {transactionFeed.map((tx) => (
              <div key={tx.hash} className={classNames("rounded-lg border p-4", theme.soft)}>
                <div className="flex items-center justify-between gap-3">
                  <p className={classNames("font-bold", theme.heading)}>{text(tx.event, language)}</p>
                  <Badge tone="info">{tx.escrow}</Badge>
                </div>
                <p className={classNames("mt-2 text-sm", theme.muted)}>{text(tx.value, language)}</p>
                <p className={classNames("mt-2 font-mono text-xs", theme.accentText)}>{tx.hash}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card theme={theme}>
        <SectionTitle theme={theme} eyebrow={c.pages.dashboard.title} title={c.dashboard.tabs[tab]}>
          <Button theme={theme} icon={PlusCircle} size="sm" onClick={() => setCurrentPage("create")}>{c.common.newEscrow}</Button>
        </SectionTitle>
        <div className={classNames("mb-5 flex flex-wrap gap-2 rounded-lg border p-1", theme.soft)}>
          {Object.entries(c.dashboard.tabs).map(([key, label]) => (
            <button
              key={key}
              className={classNames("min-h-10 rounded-lg px-4 text-sm font-bold transition", tab === key ? theme.accentBg : theme.muted)}
              type="button"
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "active" ? <ActiveOrdersTable c={c} theme={theme} language={language} setCurrentPage={setCurrentPage} /> : null}
        {tab === "completed" ? <CompletedOrdersTable c={c} theme={theme} language={language} /> : null}
        {tab === "disputes" ? <DisputesPanel c={c} theme={theme} language={language} /> : null}
      </Card>
    </div>
  );
}

function ActiveOrdersTable({ c, theme, language, setCurrentPage }) {
  return (
    <div className={classNames("overflow-hidden rounded-lg border", theme.border)}>
      <div className={classNames("hidden grid-cols-[0.9fr_1fr_1fr_0.75fr_1.35fr_0.85fr] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] md:grid", theme.soft, theme.faint)}>
        <span>{c.common.escrowId}</span>
        <span>{c.common.item}</span>
        <span>{c.common.counterparty}</span>
        <span>{c.common.amount}</span>
        <span>{c.common.status}</span>
        <span>{c.common.action}</span>
      </div>
      {orderData.active.map((order) => (
        <div key={order.id} className={classNames("grid gap-3 border-t px-4 py-4 md:grid-cols-[0.9fr_1fr_1fr_0.75fr_1.35fr_0.85fr] md:items-center", theme.border)}>
          <div>
            <p className={classNames("font-black", theme.heading)}>{order.id}</p>
            <p className={classNames("text-xs", theme.faint)}>{text(order.updated, language)}</p>
          </div>
          <p className={classNames("font-semibold", theme.text)}>{text(order.item, language)}</p>
          <p className={classNames("text-sm", theme.muted)}>{text(order.counterparty, language)}</p>
          <p className={classNames("font-bold", theme.accentText)}>{order.amount}</p>
          <div>
            <Badge tone={order.tone}>{c.status[order.status]}</Badge>
            <p className={classNames("mt-2 text-sm", theme.muted)}>{text(order.milestone, language)}</p>
          </div>
          <Button theme={theme} icon={Eye} size="sm" variant="secondary" onClick={() => setCurrentPage("details")}>{c.common.viewDetails}</Button>
        </div>
      ))}
    </div>
  );
}

function CompletedOrdersTable({ c, theme, language }) {
  return (
    <div className="grid gap-3">
      {orderData.completed.map((order) => (
        <div key={order.id} className={classNames("rounded-lg border p-4", theme.soft)}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className={classNames("font-black", theme.heading)}>{text(order.item, language)}</p>
              <p className={classNames("text-sm", theme.muted)}>{order.id} - {text(order.counterparty, language)}</p>
            </div>
            <Badge tone={order.tone}>{text(order.result, language)}</Badge>
          </div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <span className={theme.muted}>{c.common.amount} <b className={theme.text}>{order.amount}</b></span>
            <span className={theme.muted}>Tx <b className={classNames("font-mono", theme.accentText)}>{order.tx}</b></span>
            <span className={theme.muted}>{c.common.updated} <b className={theme.text}>{text(order.updated, language)}</b></span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DisputesPanel({ c, theme, language }) {
  return (
    <div className="grid gap-5">
      {orderData.disputes.map((order) => (
        <div key={order.id} className={classNames("rounded-lg border p-4", theme.soft)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={classNames("font-black", theme.heading)}>{text(order.item, language)}</p>
              <p className={classNames("mt-1 text-sm", theme.muted)}>{order.id} - {text(order.reason, language)}</p>
            </div>
            <Badge tone={order.tone}>{c.status[order.status]}</Badge>
          </div>
        </div>
      ))}
      <div className={classNames("rounded-lg border p-4", theme.isDark ? "border-violet-300/20 bg-violet-400/8" : "border-violet-200 bg-violet-50")}>
        <div className="flex items-center gap-2">
          <Vote className="h-5 w-5 text-violet-500" />
          <p className={classNames("font-black", theme.heading)}>{c.status.jury}</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          {jurors.map((juror) => (
            <div key={juror.name} className={classNames("rounded-lg border p-3 text-center", theme.soft)}>
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-violet-300/30 bg-violet-400/12 text-violet-500">
                <Gavel className="h-5 w-5" />
              </div>
              <p className={classNames("mt-2 text-sm font-bold", theme.heading)}>{juror.name}</p>
              <p className={classNames("text-xs", theme.muted)}>{text(juror.status, language)}</p>
              <Badge tone={text(juror.vote, language).includes("Hidden") || text(juror.vote, language).includes("Ẩn") ? "neutral" : "info"} className="mt-2">{text(juror.vote, language)}</Badge>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {evidenceCards.map((evidence) => (
          <div key={evidence.hash} className={classNames("rounded-lg border p-4", theme.soft)}>
            <UploadCloud className={classNames("h-5 w-5", theme.accentText)} />
            <p className={classNames("mt-3 font-bold", theme.heading)}>{text(evidence.title, language)}</p>
            <p className={classNames("mt-1 text-xs", theme.faint)}>{text(evidence.owner, language)}</p>
            <p className={classNames("mt-2 break-all font-mono text-xs", theme.accentText)}>{evidence.hash}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateEscrowPage({ c, theme, addNotification, setCurrentPage }) {
  const [amount, setAmount] = useState("680");
  const [deliveryMethod, setDeliveryMethod] = useState(c.escrow.deliveryCards[0][0]);

  function handleCreate() {
    addNotification({
      type: { en: "Deposit success", vi: "Nạp tiền thành công" },
      title: { en: "Escrow draft ready", vi: "Bản nháp ký quỹ đã sẵn sàng" },
      message: {
        en: `${amount || "0"} USDT escrow is ready for Polygon deposit and seller signature.`,
        vi: `Giao dịch ký quỹ ${amount || "0"} USDT đã sẵn sàng để nạp trên Polygon và chờ chữ ký người bán.`
      },
      tone: "success",
      icon: CircleDollarSign
    });
    setCurrentPage("details");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <Card theme={theme}>
        <SectionTitle theme={theme} eyebrow={c.pages.create.description} title={c.escrow.builderTitle} />
        <form className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field theme={theme} label={c.escrow.item} icon={PackageCheck}>
              <TextInput theme={theme} defaultValue="iPhone 13 Pro 256GB" />
            </Field>
            <Field theme={theme} label={c.escrow.reference} icon={ReceiptText}>
              <TextInput theme={theme} defaultValue="ChoTot listing #IP13-8842" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field theme={theme} label={c.common.amount} icon={CreditCard}>
              <TextInput theme={theme} value={amount} onChange={(event) => setAmount(event.target.value)} />
            </Field>
            <Field theme={theme} label={c.escrow.token} icon={Coins}>
              <SelectInput theme={theme} defaultValue="USDT"><option>USDT</option><option>USDC</option><option>DAI</option></SelectInput>
            </Field>
            <Field theme={theme} label={c.escrow.network} icon={Network}>
              <SelectInput theme={theme} defaultValue="Polygon"><option>Polygon</option><option>Base Sepolia</option><option>Arbitrum</option></SelectInput>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field theme={theme} label={c.escrow.buyerWallet} icon={Wallet}>
              <TextInput theme={theme} defaultValue="0x91B4...3F21" />
            </Field>
            <Field theme={theme} label={c.escrow.sellerWallet} icon={CircleDollarSign}>
              <TextInput theme={theme} defaultValue="0x70A1...B9C4" />
            </Field>
          </div>
          <div>
            <p className={classNames("mb-3 flex items-center gap-2 text-sm font-bold", theme.text)}>
              <Truck className={classNames("h-4 w-4", theme.accentText)} />
              {c.escrow.deliveryMethod}
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {c.escrow.deliveryCards.map(([label, detail], index) => {
                const Icon = [Radio, QrCode, ScanLine][index];
                return (
                  <button
                    key={label}
                    className={classNames("rounded-lg border p-4 text-left transition", deliveryMethod === label ? `${theme.accentBg} border-transparent` : `${theme.soft} ${theme.softHover}`)}
                    type="button"
                    onClick={() => setDeliveryMethod(label)}
                  >
                    <Icon className="h-6 w-6" />
                    <p className="mt-3 font-black">{label}</p>
                    <p className={classNames("mt-2 text-sm leading-6", deliveryMethod === label ? "opacity-85" : theme.muted)}>{detail}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <Field theme={theme} label={c.escrow.acceptance} icon={ClipboardCheck}>
            <TextArea theme={theme} defaultValue={c.pages.tracking.description} />
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button theme={theme} icon={FileCheck2} type="button" onClick={handleCreate}>{c.common.createEscrow}</Button>
            <Button theme={theme} icon={Wallet} variant="secondary" type="button" onClick={() => setCurrentPage("wallet")}>{c.common.connectWallet}</Button>
          </div>
        </form>
      </Card>

      <Card theme={theme}>
        <SectionTitle theme={theme} eyebrow={c.escrow.contractPreview} title="Polygon" />
        <div className={classNames("rounded-lg border p-4", theme.soft)}>
          <div className="flex items-center justify-between gap-3">
            <span className={theme.muted}>{c.common.amount}</span>
            <span className={classNames("text-2xl font-black", theme.heading)}>{amount || "0"} USDT</span>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className={theme.faint}>{c.escrow.deliveryMethod}</span>
              <span className={classNames("font-bold", theme.text)}>{deliveryMethod}</span>
            </div>
            {c.escrow.previewRows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <span className={theme.faint}>{label}</span>
                <span className={classNames("font-bold", theme.text)}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function EscrowDetailsPage({ c, theme, addNotification, setCurrentPage }) {
  const states = ["created", "deposited", "locked", "shipping", "delivered", "complaint", "released"];
  function handleRelease() {
    addNotification({
      type: { en: "Release success", vi: "Giải ngân thành công" },
      title: { en: "Release signature queued", vi: "Chữ ký giải ngân đã sẵn sàng" },
      message: {
        en: "Buyer approval for ESC-2408 is ready to be signed in MetaMask.",
        vi: "Duyệt giải ngân cho ESC-2408 đã sẵn sàng để ký trong MetaMask."
      },
      tone: "success",
      icon: CheckCircle2
    });
    setCurrentPage("wallet");
  }
  function handleDispute() {
    addNotification({
      type: { en: "Dispute alert", vi: "Cảnh báo tranh chấp" },
      title: { en: "Dispute draft opened", vi: "Bản nháp tranh chấp đã mở" },
      message: {
        en: "Evidence collection started for ESC-2408 inspection concerns.",
        vi: "Quá trình thu thập bằng chứng đã bắt đầu cho ESC-2408."
      },
      tone: "danger",
      icon: MessageSquareWarning
    });
    setCurrentPage("notifications");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard theme={theme} icon={CircleDollarSign} label={c.common.amount} value="680 USDT" detail="Polygon" tone="cyan" />
        <StatCard theme={theme} icon={Truck} label={c.common.status} value={c.status.shipping} detail="GHTK/API" tone="emerald" />
        <StatCard theme={theme} icon={TimerReset} label={c.common.timeout} value="18h" detail={c.tracking.countdownText} tone="amber" />
        <StatCard theme={theme} icon={Gavel} label={c.dashboard.tabs.disputes} value="0" detail={c.status.active} tone="violet" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <Card theme={theme}>
          <SectionTitle theme={theme} eyebrow={c.pages.details.eyebrow} title={c.escrow.detailsTitle} />
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {states.map((state) => (
              <div key={state} className={classNames("flex min-h-[72px] items-center justify-center rounded-lg border px-3 py-4 text-center text-[11px] font-black leading-tight break-words whitespace-normal", state === "locked" ? theme.accentBg : `${theme.soft} ${theme.faint}`)}>
                {c.status[state]}
              </div>
            ))}
          </div>
          <div className="grid gap-4">
            {c.escrow.milestones.map(([title, detail], index) => {
              const Icon = [CircleDollarSign, Truck, Radio, Send][index];
              const done = index < 2;
              return (
                <div key={title} className={classNames("flex gap-4 rounded-lg border p-4", theme.soft)}>
                  <div className={classNames("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border", done ? "border-emerald-300/30 bg-emerald-400/12 text-emerald-500" : `${theme.border} ${theme.faint}`)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={classNames("font-black", theme.heading)}>{title}</h3>
                    <p className={classNames("mt-1 text-sm leading-6", theme.muted)}>{detail}</p>
                  </div>
                  <span className={classNames("text-sm font-bold", theme.faint)}>0{index + 1}</span>
                </div>
              );
            })}
          </div>
        </Card>
        <div className="grid gap-4">
          <Card theme={theme}>
            <p className={classNames("text-xs font-black uppercase tracking-[0.22em]", theme.accentText)}>{c.escrow.contractData}</p>
            <div className="mt-4 grid gap-3 text-sm">
              {[[c.common.contract, "0xE5c8...42F9"], [c.escrow.buyerWallet, "0x91B4...3F21"], [c.escrow.sellerWallet, "0x70A1...B9C4"], [c.common.amount, "680 USDT"], [c.common.timeout, "24h"]].map(([label, value]) => (
                <div key={label} className={classNames("flex justify-between gap-3 rounded-lg border p-3", theme.soft)}>
                  <span className={theme.faint}>{label}</span>
                  <span className={classNames("text-right font-bold", theme.text)}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card theme={theme}>
            <p className={classNames("font-black", theme.heading)}>{c.common.action}</p>
            <div className="mt-4 grid gap-3">
              <Button theme={theme} icon={CheckCircle2} onClick={handleRelease}>{c.common.approveRelease}</Button>
              <Button theme={theme} icon={MessageSquareWarning} variant="danger" onClick={handleDispute}>{c.common.openDispute}</Button>
              <Button theme={theme} icon={Truck} variant="secondary" onClick={() => setCurrentPage("tracking")}>{c.common.viewTracking}</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TrackingPage({ c, theme }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard theme={theme} icon={Truck} label={c.tracking.statusBadge} value={c.tracking.currentStatus} detail="ESC-2408" tone="cyan" />
        <StatCard theme={theme} icon={Radio} label={c.tracking.oracleTitle} value={c.status.pending} detail={c.tracking.oracleRows[1][1]} tone="violet" />
        <StatCard theme={theme} icon={TimerReset} label={c.tracking.countdownTitle} value={c.tracking.countdownValue} detail={c.tracking.countdownText} tone="amber" />
        <StatCard theme={theme} icon={ShieldCheck} label={c.common.status} value={c.status.locked} detail="680 USDT" tone="emerald" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card theme={theme}>
          <SectionTitle theme={theme} eyebrow={c.pages.tracking.description} title={c.tracking.flowTitle} />
          <div className="grid gap-4">
            {c.tracking.events.map(([label, detail], index) => {
              const active = index === 3;
              const complete = index < 3;
              return (
                <div key={label} className="grid grid-cols-[auto_1fr] gap-4">
                  <div className="flex flex-col items-center">
                    <div className={classNames("flex h-11 w-11 items-center justify-center rounded-lg border", complete ? "border-emerald-300/30 bg-emerald-400/12 text-emerald-500" : active ? "border-cyan-300/30 bg-cyan-400/12 text-cyan-500" : `${theme.border} ${theme.faint}`)}>
                      {complete ? <CheckCircle2 className="h-5 w-5" /> : active ? <Truck className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                    </div>
                    {index < c.tracking.events.length - 1 ? <div className={classNames("h-10 w-px", theme.isDark ? "bg-white/10" : "bg-slate-200")} /> : null}
                  </div>
                  <div className="pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={classNames("font-black", theme.heading)}>{label}</p>
                      {active ? <Badge tone="info">{c.tracking.currentStatus}</Badge> : null}
                    </div>
                    <p className={classNames("mt-1 text-sm leading-6", theme.muted)}>{detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <div className="grid gap-4">
          <Card theme={theme}>
            <SectionTitle theme={theme} eyebrow="Oracle" title={c.tracking.oracleTitle} />
            <div className="grid gap-3">
              {c.tracking.oracleRows.map(([label, value]) => (
                <div key={label} className={classNames("flex justify-between gap-3 rounded-lg border p-3 text-sm", theme.soft)}>
                  <span className={theme.faint}>{label}</span>
                  <span className={classNames("text-right font-bold", theme.text)}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card theme={theme}>
            <SectionTitle theme={theme} eyebrow={c.common.status} title={c.tracking.deliveryTitle} />
            <div className="grid gap-3">
              {c.tracking.deliveryRows.map(([label, value]) => (
                <div key={label} className={classNames("flex justify-between gap-3 rounded-lg border p-3 text-sm", theme.soft)}>
                  <span className={theme.faint}>{label}</span>
                  <span className={classNames("text-right font-bold", theme.text)}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function WalletPage({ c, theme, wallet, setWallet, addNotification, language }) {
  async function connectMetaMask() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const balanceHex = await window.ethereum.request({ method: "eth_getBalance", params: [accounts[0], "latest"] });
        setWallet({
          connected: true,
          account: accounts[0],
          balance: balanceFromWei(balanceHex),
          network: "Polygon",
          signature: "",
          status: language === "vi" ? "MetaMask đã kết nối." : "MetaMask connected."
        });
        addNotification({
          type: { en: "Wallet connected", vi: "Ví đã kết nối" },
          title: { en: "MetaMask connected", vi: "MetaMask đã kết nối" },
          message: {
            en: `${shortAddress(accounts[0])} is ready to sign escrow actions.`,
            vi: `${shortAddress(accounts[0])} đã sẵn sàng ký thao tác ký quỹ.`
          },
          tone: "success",
          icon: Wallet
        });
      } catch (error) {
        setWallet((current) => ({ ...current, status: error?.message || "MetaMask connection failed" }));
      }
      return;
    }
    const demoAccount = "0x91B4f5B87F001A0B1d9e9730d38F0B6E27C83F21";
    setWallet({
      connected: true,
      account: demoAccount,
      balance: "18.42 MATIC",
      network: "Demo Polygon wallet",
      signature: "",
      status: language === "vi" ? "Đang dùng ví demo vì chưa phát hiện MetaMask." : "Demo wallet connected because MetaMask was not detected."
    });
  }

  async function signTransaction() {
    const demoSignature = `demo_sig_${Date.now().toString(16)}`;
    setWallet((current) => ({
      ...current,
      connected: true,
      account: current.account || "0x91B4f5B87F001A0B1d9e9730d38F0B6E27C83F21",
      balance: current.balance || "18.42 MATIC",
      signature: demoSignature,
      status: language === "vi" ? "Thông điệp giải ngân demo đã được ký." : "Demo release message signed."
    }));
    addNotification({
      type: { en: "Release success", vi: "Giải ngân thành công" },
      title: { en: "Demo signature created", vi: "Đã tạo chữ ký demo" },
      message: {
        en: "A prototype release signature was generated for ESC-2408.",
        vi: "Một chữ ký giải ngân mẫu đã được tạo cho ESC-2408."
      },
      tone: "success",
      icon: CheckCircle2
    });
  }

  async function copyAccount() {
    if (!wallet.account || !navigator.clipboard) return;
    await navigator.clipboard.writeText(wallet.account);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <Card theme={theme}>
        <SectionTitle theme={theme} eyebrow={c.common.connectWallet} title={c.wallet.connectTitle}>
          <Badge tone={wallet.connected ? "success" : "neutral"}>{wallet.connected ? c.connected : c.disconnected}</Badge>
        </SectionTitle>
        <div className={classNames("rounded-lg border p-5", theme.soft)}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className={classNames("text-sm", theme.muted)}>{c.wallet.selectedAccount}</p>
              <p className={classNames("mt-2 break-all text-2xl font-black", theme.heading)}>{wallet.account ? shortAddress(wallet.account) : c.disconnected}</p>
            </div>
            <div className={classNames("rounded-lg border p-3", theme.isDark ? "border-cyan-300/25 bg-cyan-300/12 text-cyan-200" : "border-blue-200 bg-blue-50 text-blue-700")}>
              <Wallet className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className={classNames("rounded-lg border p-4", theme.soft)}>
              <p className={classNames("text-sm", theme.muted)}>{c.wallet.nativeBalance}</p>
              <p className={classNames("mt-2 text-xl font-black", theme.heading)}>{wallet.balance || "0.00 MATIC"}</p>
            </div>
            <div className={classNames("rounded-lg border p-4", theme.soft)}>
              <p className={classNames("text-sm", theme.muted)}>{c.wallet.network}</p>
              <p className={classNames("mt-2 text-xl font-black", theme.heading)}>{wallet.network || "Polygon"}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button theme={theme} icon={Wallet} onClick={connectMetaMask}>{c.common.connectWallet}</Button>
          <Button theme={theme} icon={Copy} variant="secondary" onClick={copyAccount} disabled={!wallet.account}>{c.common.copyAddress}</Button>
        </div>
        <p className={classNames("mt-4 text-sm leading-6", theme.muted)}>{wallet.status}</p>
      </Card>
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard theme={theme} icon={Coins} label={c.wallet.balanceAvailable} value="1,840 USDT" detail={c.status.ready} tone="cyan" />
          <StatCard theme={theme} icon={LockKeyhole} label={c.wallet.balanceLocked} value="680 USDT" detail="ESC-2408" tone="violet" />
          <StatCard theme={theme} icon={CheckCircle2} label={c.wallet.balanceReleased} value="4,220 USDT" detail={c.common.lifetime} tone="emerald" />
          <StatCard theme={theme} icon={Zap} label={c.wallet.gasSponsored} value="82%" detail="Relayer" tone="amber" />
        </div>
        <Card theme={theme}>
          <SectionTitle theme={theme} eyebrow={c.pages.wallet.eyebrow} title={c.wallet.transactionPreview} />
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {c.wallet.previewRows.map(([label, value]) => (
              <div key={label} className={classNames("rounded-lg border p-3", theme.soft)}>
                <p className={theme.faint}>{label}</p>
                <p className={classNames("mt-1 font-bold", theme.text)}>{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button theme={theme} icon={Send} onClick={signTransaction}>{c.common.signMetaMask}</Button>
            <Button theme={theme} icon={Fingerprint} variant="secondary">{c.common.biometric}</Button>
            <Button theme={theme} icon={RefreshCcw} variant="ghost">{c.common.refresh}</Button>
          </div>
          {wallet.signature ? (
            <div className="mt-4 rounded-lg border border-emerald-300/25 bg-emerald-400/10 p-4 text-sm text-emerald-700 dark:text-emerald-100">
              <p className="font-black">{c.wallet.signatureCaptured}</p>
              <p className="mt-2 break-all font-mono text-xs">{wallet.signature}</p>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

function NotificationsPage({ c, theme, language, notifications, addNotification }) {
  function push(kind) {
    const payloads = {
      deposit: {
        type: { en: "Deposit success", vi: "Nạp tiền thành công" },
        title: { en: "Funds are locked in smart contract", vi: "Tiền đang được khóa trong hợp đồng thông minh" },
        message: { en: "145 USDT for AirPods Pro 2 was locked on Polygon.", vi: "145 USDT cho AirPods Pro 2 đã được khóa trên Polygon." },
        tone: "success",
        icon: CircleDollarSign
      },
      release: {
        type: { en: "Release success", vi: "Giải ngân thành công" },
        title: { en: "Payment released to seller", vi: "Thanh toán đã chuyển cho người bán" },
        message: { en: "Buyer confirmed delivery and 520 USDT was released.", vi: "Người mua xác nhận giao hàng và 520 USDT đã được giải ngân." },
        tone: "success",
        icon: CheckCircle2
      },
      dispute: {
        type: { en: "Dispute alert", vi: "Cảnh báo tranh chấp" },
        title: { en: "Evidence upload required", vi: "Cần tải bằng chứng" },
        message: { en: "Dispute opened for Canon lens ESC-2394. Jury has been selected.", vi: "Tranh chấp cho ống kính Canon ESC-2394 đã mở. Hội đồng đã được chọn." },
        tone: "danger",
        icon: AlertTriangle
      }
    };
    addNotification(payloads[kind]);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.78fr]">
      <Card theme={theme}>
        <SectionTitle theme={theme} eyebrow={c.pages.notifications.description} title={c.notifications.center} />
        <div className="grid gap-3">
          {notifications.map((item) => {
            const Icon = item.icon || Bell;
            return (
              <div key={item.id} className={classNames("flex gap-4 rounded-lg border p-4", theme.soft)}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-400/12 text-cyan-500">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={classNames("font-black", theme.heading)}>{text(item.title, language)}</h3>
                    <Badge tone={item.tone}>{text(item.type, language)}</Badge>
                  </div>
                  <p className={classNames("mt-1 text-sm leading-6", theme.muted)}>{text(item.message, language)}</p>
                </div>
                <span className={classNames("text-sm font-bold", theme.faint)}>{text(item.time, language)}</span>
              </div>
            );
          })}
        </div>
      </Card>
      <div className="grid gap-4">
        <Card theme={theme}>
          <p className={classNames("font-black", theme.heading)}>{c.common.simulateAlerts}</p>
          <div className="mt-4 grid gap-3">
            <Button theme={theme} icon={CircleDollarSign} onClick={() => push("deposit")}>{c.notifications.depositButton}</Button>
            <Button theme={theme} icon={CheckCircle2} variant="secondary" onClick={() => push("release")}>{c.notifications.releaseButton}</Button>
            <Button theme={theme} icon={MessageSquareWarning} variant="danger" onClick={() => push("dispute")}>{c.notifications.disputeButton}</Button>
          </div>
        </Card>
        <Card theme={theme}>
          <p className={classNames("font-black", theme.heading)}>{c.notifications.alertTypes}</p>
          <div className="mt-4 grid gap-3 text-sm">
            {c.notifications.types.map((item) => (
              <div key={item} className={classNames("flex items-center gap-3 rounded-lg border p-3", theme.soft)}>
                <Bell className={classNames("h-4 w-4", theme.accentText)} />
                <span className={theme.text}>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function UserInfoPage({ c, theme }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
      <Card theme={theme}>
        <div className="flex items-start gap-4">
          <div className={classNames("flex h-16 w-16 items-center justify-center rounded-lg border", theme.isDark ? "border-cyan-300/25 bg-cyan-300/12 text-cyan-200" : "border-blue-200 bg-blue-50 text-blue-700")}>
            <UserCircle className="h-9 w-9" />
          </div>
          <div className="min-w-0">
            <h2 className={classNames("text-2xl font-black", theme.heading)}>{c.user.name}</h2>
            <p className={classNames("break-all text-sm", theme.muted)}>{c.user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="success">{c.status.oracleVerified}</Badge>
              <Badge tone="info">{c.status.active}</Badge>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm font-bold">
            <span className={theme.text}>{c.user.trustScore}</span>
            <span className={theme.accentText}>91 / 100</span>
          </div>
          <ProgressBar value={91} theme={theme} />
        </div>
        <div className="mt-6 grid gap-3">
          {c.user.profileRows.map(([label, value]) => (
            <div key={label} className={classNames("flex justify-between gap-3 rounded-lg border p-3 text-sm", theme.soft)}>
              <span className={theme.faint}>{label}</span>
              <span className={classNames("text-right font-bold", theme.text)}>{value}</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-4">
        <Card theme={theme}>
          <SectionTitle theme={theme} eyebrow={c.pages.user.eyebrow} title={c.user.verificationTitle} />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [BadgeCheck, c.status.oracleVerified, c.auth.phoneOtp],
              [Wallet, c.common.connectWallet, c.wallet.selectedAccount],
              [Fingerprint, c.common.biometric, c.auth.securityVisual],
              [Gavel, c.status.jury, c.dashboard.tabs.disputes]
            ].map(([Icon, title, detail]) => (
              <div key={title} className={classNames("rounded-lg border p-4", theme.soft)}>
                <Icon className={classNames("h-6 w-6", theme.accentText)} />
                <p className={classNames("mt-3 font-black", theme.heading)}>{title}</p>
                <p className={classNames("mt-1 text-sm", theme.muted)}>{detail}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card theme={theme}>
          <p className={classNames("font-black", theme.heading)}>{c.user.recentTitle}</p>
          <div className="mt-4 grid gap-3">
            {[
              [c.common.approveRelease, "Sony A6400 Camera", "Yesterday"],
              [c.common.createEscrow, "iPhone 13 Pro", "2 days ago"],
              [c.notifications.disputeButton, "Canon Lens 24-70", "May 24"]
            ].map(([action, subject, time]) => (
              <div key={action} className={classNames("flex items-center justify-between gap-3 rounded-lg border p-3", theme.soft)}>
                <div>
                  <p className={classNames("font-bold", theme.heading)}>{action}</p>
                  <p className={classNames("text-sm", theme.muted)}>{subject}</p>
                </div>
                <span className={classNames("text-sm font-bold", theme.faint)}>{time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [themeName, setThemeName] = useState("dark");
  const [notifications, setNotifications] = useState(notificationSeed);
  const c = translations[language];
  const theme = useMemo(() => getTheme(themeName === "dark"), [themeName]);
  const [wallet, setWallet] = useState({
    connected: false,
    account: "",
    balance: "",
    network: "",
    signature: "",
    status: translations.en.wallet.statusDefault
  });

  const meta = c.pages[currentPage];

  function addNotification(notification) {
    setNotifications((items) => [
      {
        id: Date.now(),
        time: { en: "Just now", vi: "Vừa xong" },
        ...notification
      },
      ...items
    ]);
  }

  function navigate(page) {
    setCurrentPage(page);
    setSidebarOpen(false);
  }

  function switchLanguage(nextLanguage) {
    setLanguage(nextLanguage);
    setWallet((current) => ({
      ...current,
      status:
        current.status === translations.en.wallet.statusDefault || current.status === translations.vi.wallet.statusDefault
          ? translations[nextLanguage].wallet.statusDefault
          : current.status
    }));
  }

  const renderedPage = useMemo(() => {
    const props = { c, theme, language, setCurrentPage: navigate, addNotification, wallet, setWallet, notifications };
    switch (currentPage) {
      case "login":
        return <LoginPage {...props} />;
      case "register":
        return <RegisterPage {...props} />;
      case "dashboard":
        return <DashboardPage {...props} />;
      case "create":
        return <CreateEscrowPage {...props} />;
      case "details":
        return <EscrowDetailsPage {...props} />;
      case "tracking":
        return <TrackingPage {...props} />;
      case "wallet":
        return <WalletPage {...props} />;
      case "notifications":
        return <NotificationsPage {...props} />;
      case "user":
        return <UserInfoPage {...props} />;
      default:
        return <LandingPage {...props} />;
    }
  }, [currentPage, c, theme, language, wallet, notifications]);

  return (
    <div className={classNames("min-h-screen overflow-hidden", theme.page, themeName === "dark" ? "dark" : "")}>
      <div className={classNames("fixed inset-0", theme.background)} />
      <div className={classNames("fixed inset-0 opacity-35", themeName === "dark" ? "hero-grid" : "")} />
      <div className="relative flex min-h-screen">
        {sidebarOpen ? (
          <button
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-30 bg-slate-950/70 lg:hidden"
            type="button"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={classNames(
            "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            theme.sidebar,
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className={classNames("flex items-center justify-between border-b p-5", theme.border)}>
            <button className="flex items-center gap-3 text-left" type="button" onClick={() => navigate("landing")}>
              <div className={classNames("flex h-11 w-11 items-center justify-center rounded-lg border", theme.isDark ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.22)]" : "border-blue-200 bg-blue-50 text-blue-700")}>
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <p className={classNames("font-black", theme.heading)}>{c.appName}</p>
                <p className={classNames("text-xs font-bold", theme.faint)}>{c.prototype}</p>
              </div>
            </button>
            <button className={classNames("rounded-lg p-2 lg:hidden", theme.muted, theme.softHover)} type="button" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <div className="grid gap-4">
              {navGroups.map((group) => (
                <div key={group.key}>
                  <p className={classNames("mb-2 px-3 text-[11px] font-black uppercase tracking-[0.2em]", theme.faint)}>{c.navGroups[group.key]}</p>
                  <div className="grid gap-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = currentPage === item.id;
                      return (
                        <button
                          key={item.id}
                          className={classNames("flex min-h-11 items-center gap-3 rounded-lg border px-3 text-left text-sm font-bold transition", active ? theme.activeNav : theme.idleNav)}
                          type="button"
                          onClick={() => navigate(item.id)}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 truncate">{c.nav[item.id]}</span>
                          {item.id === "notifications" ? (
                            <span className={classNames("ml-auto rounded-full px-2 py-0.5 text-xs", active ? theme.accentBg : "bg-rose-400/15 text-rose-500")}>
                              {notifications.length}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className={classNames("border-t p-4", theme.border)}>
            <div className={classNames("rounded-lg border p-4", theme.soft)}>
              <div className="flex items-center gap-3">
                <div className={classNames("flex h-10 w-10 items-center justify-center rounded-full", theme.isDark ? "bg-cyan-300/12 text-cyan-200" : "bg-blue-50 text-blue-700")}>
                  <UserCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className={classNames("truncate text-sm font-black", theme.heading)}>{c.user.name}</p>
                  <p className={classNames("truncate text-xs", theme.faint)}>{wallet.account ? shortAddress(wallet.account) : c.disconnected}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className={classNames("sticky top-0 z-20 border-b px-4 py-4 lg:px-8", theme.header)}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <button className={classNames("rounded-lg border p-2 lg:hidden", theme.soft)} type="button" onClick={() => setSidebarOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </button>
                  <p className={classNames("text-xs font-black uppercase tracking-[0.22em]", theme.accentText)}>{meta.eyebrow}</p>
                </div>
                <h1 className={classNames("mt-2 text-2xl font-black sm:text-3xl", theme.heading)}>{meta.title}</h1>
                <p className={classNames("mt-1 max-w-3xl text-sm leading-6", theme.muted)}>{meta.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className={classNames("flex rounded-lg border p-1", theme.soft)}>
                  {["en", "vi"].map((lang) => (
                    <button
                      key={lang}
                      className={classNames("min-h-9 rounded-md px-3 text-xs font-black transition", language === lang ? theme.accentBg : theme.muted)}
                      type="button"
                      onClick={() => switchLanguage(lang)}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
                <Button
                  theme={theme}
                  icon={themeName === "dark" ? Moon : Sun}
                  variant="secondary"
                  size="sm"
                  onClick={() => setThemeName((current) => (current === "dark" ? "light" : "dark"))}
                >
                  {themeName === "dark" ? c.dark : c.light}
                </Button>
                <Button theme={theme} icon={Bell} variant="secondary" size="sm" onClick={() => navigate("notifications")}>
                  {c.alerts} {notifications.length}
                </Button>
                <Button theme={theme} icon={Wallet} size="sm" onClick={() => navigate("wallet")}>
                  {wallet.connected ? shortAddress(wallet.account) : c.connect}
                </Button>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentPage}-${language}-${themeName}`}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                transition={{ duration: 0.24 }}
              >
                {renderedPage}
              </motion.div>
            </AnimatePresence>
            <Footer c={c} theme={theme} setCurrentPage={navigate} />
          </div>
        </main>
      </div>
    </div>
  );
}
