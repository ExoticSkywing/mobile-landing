import { useState, useEffect, useRef } from "react";
import { FiX, FiCheck, FiCopy, FiLoader, FiArrowRight, FiExternalLink, FiSettings, FiArrowLeft } from "react-icons/fi";

interface ApiResponse {
	success: boolean;
	error?: string;
	url?: string;
}

interface OnboardingModalProps {
	isOpen: boolean;
	onClose: () => void;
}

type Step = "code" | "config" | "success" | "manage-login" | "manage-config" | "manage-success";

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
	const [step, setStep] = useState<Step>("code");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	
	// Animation states
	const [isVisible, setIsVisible] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [stepAnimating, setStepAnimating] = useState(false);
	const prevStepRef = useRef<Step>("code");
	
	// Handle modal open/close animation
	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
			requestAnimationFrame(() => {
				requestAnimationFrame(() => setIsAnimating(true));
			});
		} else {
			setIsAnimating(false);
			const timer = setTimeout(() => setIsVisible(false), 200);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);
	
	// Animated step change
	const changeStep = (newStep: Step) => {
		if (newStep === step) return;
		prevStepRef.current = step;
		setStepAnimating(true);
		setTimeout(() => {
			setStep(newStep);
			setError("");
			setTimeout(() => setStepAnimating(false), 50);
		}, 150);
	};
	
	// Form data
	const [inviteCode, setInviteCode] = useState("");
	const [merchantId, setMerchantId] = useState("");
	const [shopUrl, setShopUrl] = useState("");
	const [supportUrl, setSupportUrl] = useState("");
	const [socialLinks, setSocialLinks] = useState<{ instagram?: string; telegram?: string; twitter?: string }>({
		instagram: "",
		telegram: "",
		twitter: "",
	});
	
	// Result
	const [finalUrl, setFinalUrl] = useState("");
	const [copied, setCopied] = useState(false);
	
	// Manage mode - existing merchant config
	const [existingConfig, setExistingConfig] = useState<{
		shopUrl: string;
		supportUrl: string;
		socialLinks: { instagram?: string; telegram?: string; twitter?: string };
	} | null>(null);

	const resetForm = () => {
		setStep("code");
		setError("");
		setInviteCode("");
		setMerchantId("");
		setShopUrl("");
		setSupportUrl("");
		setSocialLinks({ instagram: "", telegram: "", twitter: "" });
		setFinalUrl("");
		setCopied(false);
		setExistingConfig(null);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	// Step 1: 验证邀请码
	const validateCode = async () => {
		if (!inviteCode.trim()) {
			setError("请输入邀请码");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const res = await fetch("/api/merchant/validate-code", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: inviteCode.trim().toUpperCase() }),
			});

			const data = await res.json() as ApiResponse;

			if (data.success) {
				changeStep("config");
			} else {
				setError(data.error || "验证失败");
			}
		} catch {
			setError("网络错误，请重试");
		} finally {
			setLoading(false);
		}
	};

	// Step 2: 检查商家 ID
	const checkMerchantId = async (): Promise<boolean> => {
		try {
			const res = await fetch("/api/merchant/check-id", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ merchantId: merchantId.trim().toLowerCase() }),
			});

			const data = await res.json() as ApiResponse;
			if (!data.success) {
				setError(data.error || "ID 检查失败");
				return false;
			}
			return true;
		} catch {
			setError("网络错误，请重试");
			return false;
		}
	};

	// Step 2: 提交注册
	const submitRegistration = async () => {
		// 验证必填字段
		if (!merchantId.trim()) {
			setError("请输入商家 ID");
			return;
		}
		if (!shopUrl.trim()) {
			setError("请输入购买链接");
			return;
		}
		if (!supportUrl.trim()) {
			setError("请输入技术支持链接");
			return;
		}

		// 验证 URL 格式
		try {
			new URL(shopUrl);
		} catch {
			setError("购买链接格式无效，请输入完整 URL");
			return;
		}
		try {
			new URL(supportUrl);
		} catch {
			setError("技术支持链接格式无效，请输入完整 URL");
			return;
		}

		setLoading(true);
		setError("");

		// 先检查 ID 是否可用
		const idAvailable = await checkMerchantId();
		if (!idAvailable) {
			setLoading(false);
			return;
		}

		try {
			const res = await fetch("/api/merchant/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					code: inviteCode.trim().toUpperCase(),
					merchantId: merchantId.trim().toLowerCase(),
					shopUrl: shopUrl.trim(),
					supportUrl: supportUrl.trim(),
					socialLinks: {
						instagram: socialLinks.instagram?.trim() || undefined,
						telegram: socialLinks.telegram?.trim() || undefined,
						twitter: socialLinks.twitter?.trim() || undefined,
					},
				}),
			});

			const data = await res.json() as ApiResponse;

			if (data.success && data.url) {
				setFinalUrl(data.url);
				changeStep("success");
			} else {
				setError(data.error || "注册失败");
			}
		} catch {
			setError("网络错误，请重试");
		} finally {
			setLoading(false);
		}
	};

	const copyUrl = async () => {
		try {
			await navigator.clipboard.writeText(finalUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback
			const textArea = document.createElement("textarea");
			textArea.value = finalUrl;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand("copy");
			document.body.removeChild(textArea);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	if (!isVisible) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div 
				className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
				onClick={handleClose}
			/>
			
			{/* Modal */}
			<div 
				className={`relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden transition-all ${
					isAnimating 
						? 'opacity-100 scale-100 translate-y-0 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]' 
						: 'opacity-0 scale-90 translate-y-20 duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]'
				}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
						{step === "code" && "商家入驻"}
						{step === "config" && "配置信息"}
						{step === "success" && "入驻成功"}
						{step === "manage-login" && "管理配置"}
						{step === "manage-config" && "修改配置"}
						{step === "manage-success" && "更新成功"}
					</h2>
					<button
						onClick={handleClose}
						className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
					>
						<FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
					</button>
				</div>

				{/* Content */}
				<div className={`p-6 transition-all duration-150 ${stepAnimating ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'}`}>
					{/* Step 1: 输入邀请码 */}
					{step === "code" && (
						<div className="space-y-4">
							<p className="text-sm text-gray-600 dark:text-gray-400">
								请输入您的专属邀请码以开始入驻
							</p>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									邀请码
								</label>
								<input
									type="text"
									value={inviteCode}
									onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
									placeholder="请输入邀请码"
									className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all tracking-widest text-center text-lg font-mono"
									maxLength={12}
								/>
							</div>
							{error && (
								<p className="text-sm text-red-500 dark:text-red-400">{error}</p>
							)}
							<button
								onClick={validateCode}
								disabled={loading}
								className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
							>
								{loading ? (
									<FiLoader className="w-5 h-5 animate-spin" />
								) : (
									<>
										<span>验证并继续</span>
										<FiArrowRight className="w-4 h-4" />
									</>
								)}
							</button>
							
							<div className="pt-4 border-t border-gray-100 dark:border-white/5 text-center">
								<button
									onClick={() => changeStep("manage-login")}
									className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
								>
									<FiSettings className="w-4 h-4" />
									<span>已入驻？管理配置</span>
								</button>
							</div>
						</div>
					)}

					{/* Step 2: 配置信息 */}
					{step === "config" && (
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									商家 ID <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={merchantId}
									onChange={(e) => setMerchantId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
									placeholder="例如：myshop"
									className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all"
									maxLength={20}
								/>
								<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
									3-20位，仅支持英文、数字、横杠、下划线
								</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									购买链接 <span className="text-red-500">*</span>
								</label>
								<input
									type="url"
									value={shopUrl}
									onChange={(e) => setShopUrl(e.target.value)}
									placeholder="https://your-shop.com/..."
									className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									技术支持链接 <span className="text-red-500">*</span>
								</label>
								<input
									type="url"
									value={supportUrl}
									onChange={(e) => setSupportUrl(e.target.value)}
									placeholder="https://t.me/..."
									className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all"
								/>
							</div>

							{/* 社交链接（可选） */}
							<div className="pt-2 border-t border-gray-100 dark:border-white/5">
								<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
									社交链接 <span className="text-gray-400 font-normal">（可选）</span>
								</p>
								<div className="space-y-3">
									<input
										type="url"
										value={socialLinks.instagram || ""}
										onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
										placeholder="Instagram 链接"
										className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all text-sm"
									/>
									<input
										type="url"
										value={socialLinks.telegram || ""}
										onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })}
										placeholder="Telegram 链接"
										className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all text-sm"
									/>
									<input
										type="url"
										value={socialLinks.twitter || ""}
										onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
										placeholder="Twitter/X 链接"
										className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all text-sm"
									/>
								</div>
							</div>

							{error && (
								<p className="text-sm text-red-500 dark:text-red-400">{error}</p>
							)}

							<button
								onClick={submitRegistration}
								disabled={loading}
								className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
							>
								{loading ? (
									<FiLoader className="w-5 h-5 animate-spin" />
								) : (
									<>
										<span>完成入驻</span>
										<FiCheck className="w-4 h-4" />
									</>
								)}
							</button>
						</div>
					)}

					{/* Step 3: 成功 */}
					{step === "success" && (
						<div className="space-y-4 text-center">
							<div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
								<FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
									恭喜，入驻成功！
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									您的专属页面已生成，请复制以下链接
								</p>
							</div>
							<div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
								<p className="text-sm text-gray-900 dark:text-white break-all font-mono">
									{finalUrl}
								</p>
							</div>
							<div className="flex gap-3">
								<button
									onClick={copyUrl}
									className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
								>
									{copied ? (
										<>
											<FiCheck className="w-4 h-4" />
											<span>已复制</span>
										</>
									) : (
										<>
											<FiCopy className="w-4 h-4" />
											<span>复制链接</span>
										</>
									)}
								</button>
								<a
									href={finalUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 font-medium transition-colors"
								>
									<FiExternalLink className="w-4 h-4" />
									<span>预览</span>
								</a>
							</div>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								请妥善保管您的邀请码，后续修改配置时需要验证
							</p>
						</div>
					)}

					{/* Manage Step 1: 验证身份 */}
					{step === "manage-login" && (
						<div className="space-y-4">
							<button
								onClick={() => { changeStep("code"); setMerchantId(""); setInviteCode(""); }}
								className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
							>
								<FiArrowLeft className="w-4 h-4" />
								<span>返回入驻</span>
							</button>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								请输入您的商家 ID 和邀请码验证身份
							</p>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									商家 ID
								</label>
								<input
									type="text"
									value={merchantId}
									onChange={(e) => setMerchantId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
									placeholder="您注册时使用的 ID"
									className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									邀请码
								</label>
								<input
									type="text"
									value={inviteCode}
									onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
									placeholder="您注册时使用的邀请码"
									className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all tracking-widest text-center font-mono"
									maxLength={12}
								/>
							</div>
							{error && (
								<p className="text-sm text-red-500 dark:text-red-400">{error}</p>
							)}
							<button
								onClick={async () => {
									if (!merchantId.trim() || !inviteCode.trim()) {
										setError("请填写商家 ID 和邀请码");
										return;
									}
									setLoading(true);
									setError("");
									try {
										const res = await fetch(`/api/merchant/config?id=${merchantId.trim()}&code=${inviteCode.trim()}`);
										const data = await res.json() as ApiResponse & { 
											config?: { shopUrl: string; supportUrl: string; socialLinks?: { instagram?: string; telegram?: string; twitter?: string } } 
										};
										if (data.success && data.config) {
											setExistingConfig({
												...data.config,
												socialLinks: data.config.socialLinks || { instagram: "", telegram: "", twitter: "" }
											});
											setShopUrl(data.config.shopUrl);
											setSupportUrl(data.config.supportUrl);
											setSocialLinks({
												instagram: data.config.socialLinks?.instagram || "",
												telegram: data.config.socialLinks?.telegram || "",
												twitter: data.config.socialLinks?.twitter || "",
											});
											changeStep("manage-config");
										} else {
											setError(data.error || "验证失败");
										}
									} catch {
										setError("网络错误，请重试");
									} finally {
										setLoading(false);
									}
								}}
								disabled={loading}
								className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
							>
								{loading ? (
									<FiLoader className="w-5 h-5 animate-spin" />
								) : (
									<>
										<span>验证身份</span>
										<FiArrowRight className="w-4 h-4" />
									</>
								)}
							</button>
						</div>
					)}

					{/* Manage Step 2: 修改配置 */}
					{step === "manage-config" && (
						<div className="space-y-4">
							<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
								<span>商家：</span>
								<span className="font-mono text-gray-900 dark:text-white">{merchantId}</span>
							</div>
							
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									购买链接
								</label>
								<input
									type="url"
									value={shopUrl}
									onChange={(e) => setShopUrl(e.target.value)}
									placeholder="https://your-shop.com/..."
									className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									技术支持链接
								</label>
								<input
									type="url"
									value={supportUrl}
									onChange={(e) => setSupportUrl(e.target.value)}
									placeholder="https://t.me/..."
									className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all"
								/>
							</div>

							<div className="pt-2 border-t border-gray-100 dark:border-white/5">
								<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
									社交链接 <span className="text-gray-400 font-normal">（可选）</span>
								</p>
								<div className="space-y-3">
									<input
										type="url"
										value={socialLinks.instagram || ""}
										onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
										placeholder="Instagram 链接"
										className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all text-sm"
									/>
									<input
										type="url"
										value={socialLinks.telegram || ""}
										onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })}
										placeholder="Telegram 链接"
										className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all text-sm"
									/>
									<input
										type="url"
										value={socialLinks.twitter || ""}
										onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
										placeholder="Twitter/X 链接"
										className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all text-sm"
									/>
								</div>
							</div>

							{error && (
								<p className="text-sm text-red-500 dark:text-red-400">{error}</p>
							)}

							<button
								onClick={async () => {
									if (!shopUrl.trim() || !supportUrl.trim()) {
										setError("请填写购买链接和技术支持链接");
										return;
									}
									try { new URL(shopUrl); } catch { setError("购买链接格式无效"); return; }
									try { new URL(supportUrl); } catch { setError("技术支持链接格式无效"); return; }
									
									setLoading(true);
									setError("");
									try {
										const res = await fetch("/api/merchant/update", {
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({
												merchantId: merchantId.trim(),
												code: inviteCode.trim(),
												shopUrl: shopUrl.trim(),
												supportUrl: supportUrl.trim(),
												socialLinks: {
													instagram: socialLinks.instagram?.trim() || undefined,
													telegram: socialLinks.telegram?.trim() || undefined,
													twitter: socialLinks.twitter?.trim() || undefined,
												},
											}),
										});
										const data = await res.json() as ApiResponse;
										if (data.success) {
											changeStep("manage-success");
										} else {
											setError(data.error || "更新失败");
										}
									} catch {
										setError("网络错误，请重试");
									} finally {
										setLoading(false);
									}
								}}
								disabled={loading}
								className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
							>
								{loading ? (
									<FiLoader className="w-5 h-5 animate-spin" />
								) : (
									<>
										<span>保存修改</span>
										<FiCheck className="w-4 h-4" />
									</>
								)}
							</button>
						</div>
					)}

					{/* Manage Step 3: 更新成功 */}
					{step === "manage-success" && (
						<div className="space-y-4 text-center">
							<div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
								<FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
									配置已更新
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									您的商家页面配置已成功更新
								</p>
							</div>
							<a
								href={`/m/${merchantId}`}
								target="_blank"
								rel="noopener noreferrer"
								className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
							>
								<FiExternalLink className="w-4 h-4" />
								<span>查看页面</span>
							</a>
							<button
								onClick={handleClose}
								className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 font-medium transition-colors"
							>
								关闭
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
