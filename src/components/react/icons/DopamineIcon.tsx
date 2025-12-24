import React from "react";

export const DopamineIcon = ({ className = "" }: { className?: string }) => {
	// 提取传入的尺寸类 (如 h-6 w-6)，但忽略颜色类，因为我们要用自己的彩色
	const sizeClasses = className.match(/[wh]-\d+/g)?.join(" ") || "w-6 h-6";

	return (
		<div className={`relative flex items-center justify-center ${sizeClasses}`}>
			{/* 底部：跳动的心脏 (多巴胺) */}
			<svg
				viewBox="0 0 24 24"
				fill="currentColor"
				className="absolute inset-0 h-full w-full text-rose-500 drop-shadow-sm animate-heartbeat origin-center"
				style={{ filter: "drop-shadow(0 2px 4px rgba(244, 63, 94, 0.3))" }}
			>
				<defs>
					<linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#fb7185" /> {/* rose-400 */}
						<stop offset="100%" stopColor="#e11d48" /> {/* rose-600 */}
					</linearGradient>
				</defs>
				<path
					d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
					fill="url(#heartGradient)"
				/>
			</svg>

			{/* 顶部：能量闪电 (肾上腺素) - 略微偏移和倾斜 */}
			<div className="absolute -right-1.5 -bottom-1 z-10 animate-pulse-fast">
				<svg
					viewBox="0 0 24 24"
					fill="currentColor"
					className="h-5 w-5 text-yellow-400 drop-shadow-md transform rotate-12"
					style={{ filter: "drop-shadow(0 1px 2px rgba(234, 179, 8, 0.5))" }}
				>
					<path
						d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
						fill="#facc15"
						stroke="white"
						strokeWidth="1.5"
						strokeLinejoin="round"
					/>
				</svg>
			</div>

			{/* 补充样式：定义心跳动画 */}
			<style>{`
				@keyframes heartbeat {
					0%, 100% { transform: scale(1); }
					50% { transform: scale(1.12); }
				}
				.animate-heartbeat {
					animation: heartbeat 1.5s ease-in-out infinite;
				}
				@keyframes pulse-fast {
					0%, 100% { opacity: 1; transform: rotate(12deg) scale(1); }
					50% { opacity: 0.9; transform: rotate(12deg) scale(1.05); }
				}
				.animate-pulse-fast {
					animation: pulse-fast 0.8s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
};
