import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiCopy, FiCheck, FiLoader, FiLock, FiUnlock, FiUsers, FiKey } from "react-icons/fi";

interface InviteCode {
	code: string;
	createdAt: string;
	usedAt?: string;
	usedBy?: string;
}

interface Merchant {
	id: string;
	shopUrl: string;
	supportUrl: string;
	socialLinks?: {
		instagram?: string;
		telegram?: string;
		twitter?: string;
	};
	inviteCode: string;
	registerIp?: string;
	createdAt: string;
	updatedAt: string;
}

interface ApiResponse {
	success: boolean;
	error?: string;
	codes?: InviteCode[];
	merchants?: Merchant[];
}

const STORAGE_KEY = "admin_secret";

export default function AdminPanel() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [secret, setSecret] = useState("");
	const [authError, setAuthError] = useState("");
	const [loading, setLoading] = useState(false);
	const [initializing, setInitializing] = useState(true);
	
	const [activeTab, setActiveTab] = useState<"codes" | "merchants">("codes");
	const [codes, setCodes] = useState<InviteCode[]>([]);
	const [merchants, setMerchants] = useState<Merchant[]>([]);
	const [generateCount, setGenerateCount] = useState(1);
	const [copiedCode, setCopiedCode] = useState<string | null>(null);

	const authHeaders = {
		"Content-Type": "application/json",
		"Authorization": `Bearer ${secret}`,
	};

	// 页面加载时尝试恢复会话
	useEffect(() => {
		const savedSecret = localStorage.getItem(STORAGE_KEY);
		if (savedSecret) {
			setSecret(savedSecret);
			autoLogin(savedSecret);
		} else {
			setInitializing(false);
		}
	}, []);

	// 自动登录
	const autoLogin = async (savedSecret: string) => {
		try {
			const res = await fetch("/api/admin/invite-codes", {
				headers: { "Authorization": `Bearer ${savedSecret}` },
			});
			if (res.status === 401) {
				localStorage.removeItem(STORAGE_KEY);
				setInitializing(false);
				return;
			}
			const data = await res.json() as ApiResponse;
			if (data.success) {
				setIsAuthenticated(true);
				setCodes(data.codes || []);
				loadMerchantsWithSecret(savedSecret);
			}
		} catch {
			// 网络错误时保留密钥，下次可重试
		} finally {
			setInitializing(false);
		}
	};

	// 使用指定密钥加载商家
	const loadMerchantsWithSecret = async (s: string) => {
		try {
			const res = await fetch("/api/admin/merchants", { 
				headers: { "Content-Type": "application/json", "Authorization": `Bearer ${s}` }
			});
			const data = await res.json() as ApiResponse;
			if (data.success) {
				setMerchants(data.merchants || []);
			}
		} catch {
			console.error("加载商家失败");
		}
	};

	// 验证管理员密钥
	const authenticate = async () => {
		if (!secret.trim()) {
			setAuthError("请输入管理密钥");
			return;
		}

		setLoading(true);
		setAuthError("");

		try {
			const res = await fetch("/api/admin/invite-codes", {
				headers: { "Authorization": `Bearer ${secret}` },
			});

			if (res.status === 401) {
				setAuthError("密钥无效");
				localStorage.removeItem(STORAGE_KEY);
				return;
			}

			const data = await res.json() as ApiResponse;
			if (data.success) {
				setIsAuthenticated(true);
				setCodes(data.codes || []);
				localStorage.setItem(STORAGE_KEY, secret);
				// 同时加载商家列表
				loadMerchants();
			} else {
				setAuthError(data.error || "验证失败");
			}
		} catch {
			setAuthError("网络错误");
		} finally {
			setLoading(false);
		}
	};

	// 加载邀请码列表
	const loadCodes = async () => {
		try {
			const res = await fetch("/api/admin/invite-codes", { headers: authHeaders });
			const data = await res.json() as ApiResponse;
			if (data.success) {
				setCodes(data.codes || []);
			}
		} catch {
			console.error("加载邀请码失败");
		}
	};

	// 加载商家列表
	const loadMerchants = async () => {
		try {
			const res = await fetch("/api/admin/merchants", { headers: authHeaders });
			const data = await res.json() as ApiResponse;
			if (data.success) {
				setMerchants(data.merchants || []);
			}
		} catch {
			console.error("加载商家列表失败");
		}
	};

	// 生成邀请码
	const generateCodes = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/admin/invite-codes", {
				method: "POST",
				headers: authHeaders,
				body: JSON.stringify({ count: generateCount }),
			});
			const data = await res.json() as ApiResponse;
			if (data.success) {
				loadCodes();
			}
		} catch {
			console.error("生成邀请码失败");
		} finally {
			setLoading(false);
		}
	};

	// 删除邀请码
	const deleteCode = async (code: string) => {
		if (!confirm(`确定删除邀请码 ${code}？`)) return;

		try {
			const res = await fetch("/api/admin/invite-codes", {
				method: "DELETE",
				headers: authHeaders,
				body: JSON.stringify({ code }),
			});
			const data = await res.json() as ApiResponse;
			if (data.success) {
				loadCodes();
			}
		} catch {
			console.error("删除失败");
		}
	};

	// 删除商家
	const deleteMerchant = async (merchantId: string) => {
		if (!confirm(`确定删除商家 ${merchantId}？此操作不可恢复。`)) return;

		try {
			const res = await fetch("/api/admin/merchants", {
				method: "DELETE",
				headers: authHeaders,
				body: JSON.stringify({ merchantId }),
			});
			const data = await res.json() as ApiResponse;
			if (data.success) {
				loadMerchants();
			}
		} catch {
			console.error("删除失败");
		}
	};

	// 复制邀请码
	const copyCode = async (code: string) => {
		try {
			await navigator.clipboard.writeText(code);
			setCopiedCode(code);
			setTimeout(() => setCopiedCode(null), 2000);
		} catch {
			// Fallback
			const textArea = document.createElement("textarea");
			textArea.value = code;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
			setCopiedCode(code);
			setTimeout(() => setCopiedCode(null), 2000);
		}
	};

	// 格式化日期
	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleString("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// 初始化中
	if (initializing) {
		return (
			<div className="max-w-md mx-auto mt-20">
				<div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 p-8 text-center">
					<FiLoader className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-spin mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-400">正在恢复会话...</p>
				</div>
			</div>
		);
	}

	// 未认证界面
	if (!isAuthenticated) {
		return (
			<div className="max-w-md mx-auto mt-20">
				<div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 p-8">
					<div className="text-center mb-6">
						<div className="w-16 h-16 mx-auto rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center mb-4">
							<FiLock className="w-8 h-8 text-violet-600 dark:text-violet-400" />
						</div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">管理后台</h1>
						<p className="text-gray-600 dark:text-gray-400 mt-2">请输入管理密钥以继续</p>
					</div>

					<div className="space-y-4">
						<input
							type="password"
							value={secret}
							onChange={(e) => setSecret(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && authenticate()}
							placeholder="管理密钥"
							className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all"
						/>
						{authError && (
							<p className="text-sm text-red-500 dark:text-red-400">{authError}</p>
						)}
						<button
							onClick={authenticate}
							disabled={loading}
							className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
						>
							{loading ? (
								<FiLoader className="w-5 h-5 animate-spin" />
							) : (
								<>
									<FiUnlock className="w-4 h-4" />
									<span>验证</span>
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		);
	}

	// 已认证界面
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">管理后台</h1>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
						<div className="w-2 h-2 rounded-full bg-green-500"></div>
						<span>已认证</span>
					</div>
					<button
						onClick={() => {
							localStorage.removeItem(STORAGE_KEY);
							setIsAuthenticated(false);
							setSecret("");
							setCodes([]);
							setMerchants([]);
						}}
						className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
					>
						退出
					</button>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl">
				<button
					onClick={() => { setActiveTab("codes"); loadCodes(); }}
					className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
						activeTab === "codes"
							? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm"
							: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
					}`}
				>
					<FiKey className="w-4 h-4" />
					<span>邀请码</span>
					<span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-white/10">
						{codes.length}
					</span>
				</button>
				<button
					onClick={() => { setActiveTab("merchants"); loadMerchants(); }}
					className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
						activeTab === "merchants"
							? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm"
							: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
					}`}
				>
					<FiUsers className="w-4 h-4" />
					<span>商家</span>
					<span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-white/10">
						{merchants.length}
					</span>
				</button>
			</div>

			{/* 邀请码面板 */}
			{activeTab === "codes" && (
				<div className="space-y-4">
					{/* 生成区 */}
					<div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-white/10">
						<span className="text-gray-700 dark:text-gray-300">生成</span>
						<input
							type="number"
							min={1}
							max={50}
							value={generateCount}
							onChange={(e) => setGenerateCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
							className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
						/>
						<span className="text-gray-700 dark:text-gray-300">个邀请码</span>
						<button
							onClick={generateCodes}
							disabled={loading}
							className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium transition-colors"
						>
							{loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiPlus className="w-4 h-4" />}
							<span>生成</span>
						</button>
					</div>

					{/* 邀请码列表 */}
					<div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
						<div className="grid grid-cols-[1fr,auto,auto,auto] gap-4 px-4 py-3 bg-gray-50 dark:bg-white/5 text-sm font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
							<span>邀请码</span>
							<span>创建时间</span>
							<span>状态</span>
							<span>操作</span>
						</div>
						<div className="divide-y divide-gray-100 dark:divide-white/5">
							{codes.length === 0 ? (
								<div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
									暂无邀请码，点击上方按钮生成
								</div>
							) : (
								codes.map((item) => (
									<div key={item.code} className="grid grid-cols-[1fr,auto,auto,auto] gap-4 px-4 py-3 items-center">
										<span className="font-mono text-gray-900 dark:text-white tracking-wider">
											{item.code}
										</span>
										<span className="text-sm text-gray-500 dark:text-gray-400">
											{formatDate(item.createdAt)}
										</span>
										<span>
											{item.usedAt ? (
												<span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
													已使用 · {item.usedBy}
												</span>
											) : (
												<span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
													可用
												</span>
											)}
										</span>
										<div className="flex items-center gap-2">
											<button
												onClick={() => copyCode(item.code)}
												className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
												title="复制"
											>
												{copiedCode === item.code ? (
													<FiCheck className="w-4 h-4 text-green-500" />
												) : (
													<FiCopy className="w-4 h-4" />
												)}
											</button>
											<button
												onClick={() => deleteCode(item.code)}
												className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
												title="删除"
											>
												<FiTrash2 className="w-4 h-4" />
											</button>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			)}

			{/* 商家面板 */}
			{activeTab === "merchants" && (
				<div className="space-y-4">
					{merchants.length === 0 ? (
						<div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-8 text-center text-gray-500 dark:text-gray-400">
							暂无商家入驻
						</div>
					) : (
						merchants.map((item) => (
							<div key={item.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
								{/* 头部：ID 和操作 */}
								<div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
									<div className="flex items-center gap-3">
										<span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
											{item.id}
										</span>
										<span className="px-2 py-0.5 text-xs rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300">
											{item.inviteCode}
										</span>
									</div>
									<button
										onClick={() => deleteMerchant(item.id)}
										className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
										title="删除商家"
									>
										<FiTrash2 className="w-4 h-4" />
									</button>
								</div>
								{/* 详情 */}
								<div className="px-4 py-3 space-y-2 text-sm">
									<div className="flex items-start gap-2">
										<span className="text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">购买链接</span>
										<a href={item.shopUrl} target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline break-all">
											{item.shopUrl}
										</a>
									</div>
									<div className="flex items-start gap-2">
										<span className="text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">技术支持</span>
										<a href={item.supportUrl} target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline break-all">
											{item.supportUrl}
										</a>
									</div>
									{item.socialLinks && (item.socialLinks.instagram || item.socialLinks.telegram || item.socialLinks.twitter) && (
										<div className="flex items-start gap-2">
											<span className="text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">社交链接</span>
											<div className="flex flex-wrap gap-2">
												{item.socialLinks.instagram && (
													<a href={item.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 text-xs rounded bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 hover:underline">
														Instagram
													</a>
												)}
												{item.socialLinks.telegram && (
													<a href={item.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:underline">
														Telegram
													</a>
												)}
												{item.socialLinks.twitter && (
													<a href={item.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 text-xs rounded bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 hover:underline">
														Twitter
													</a>
												)}
											</div>
										</div>
									)}
									<div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/5 text-xs text-gray-400 dark:text-gray-500">
										<span>注册 IP: {item.registerIp || '未知'}</span>
										<span>•</span>
										<span>入驻: {formatDate(item.createdAt)}</span>
										{item.updatedAt !== item.createdAt && (
											<>
												<span>•</span>
												<span>更新: {formatDate(item.updatedAt)}</span>
											</>
										)}
									</div>
								</div>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
