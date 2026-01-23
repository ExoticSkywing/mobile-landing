import { motion } from "framer-motion";
import { memo, useCallback } from "react";
import { IoDiamondOutline, IoRocketOutline } from "react-icons/io5";
import type { DeviceToggleProps } from "@/types/ui";

const DeviceToggle = ({ activeDevice, onToggle }: DeviceToggleProps) => {
	const handleSpeedClick = useCallback(() => onToggle("speed"), [onToggle]);
	const handleQualityClick = useCallback(() => onToggle("quality"), [onToggle]);

	return (
		<div className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-200/80 dark:bg-white/[0.03] p-1 shadow-sm">
			<DeviceButton
				key="speed"
				isActive={activeDevice === "speed"}
				onClick={handleSpeedClick}
				label="速度"
				icon={<IoRocketOutline className="w-4 h-4" />}
			/>
			<DeviceButton
				key="quality"
				isActive={activeDevice === "quality"}
				onClick={handleQualityClick}
				label="质量"
				icon={<IoDiamondOutline className="w-4 h-4" />}
				withSparkle={true}
				withPulse={true}
			/>
		</div>
	);
};

// Continuous Pulse: Ensures visibility at any time, not just on entry
const PulseText = ({ text }: { text: string }) => {
	return (
		<motion.span
			animate={{
				opacity: [0.8, 1, 0.8],
				textShadow: [
					"0 0 0px rgba(74,222,128,0)",
					"0 0 12px rgba(74,222,128,0.8)", // Intense Green Neon Glow
					"0 0 0px rgba(74,222,128,0)"
				],
				color: ["#9ca3af", "#4ade80", "#9ca3af"] // Gray -> Green -> Gray force color shift
			}}
			transition={{
				duration: 0.8, // Rapid Heartbeat (~75 BPM)
				repeat: Infinity,
				ease: "easeInOut"
			}}
			className="font-bold tracking-wide" // Thicker text for visibility
		>
			{text}
		</motion.span>
	);
}

const SparkleIcon = ({ icon }: { icon: React.ReactNode }) => {
	return (
		<div className="relative">
			{icon}
			<motion.div
				className="absolute -top-1.5 -right-1.5 text-green-400 dark:text-green-300 pointer-events-none"
				initial={{ opacity: 0, scale: 0 }}
				animate={{
					opacity: [0, 1, 0],
					scale: [0.5, 1.5, 0.5], // Expanded range
					rotate: [0, 90, 180]
				}}
				transition={{
					duration: 0.6, // Even faster bloom (was 0.8)
					repeat: Infinity,
					repeatDelay: 0.2, // Extreme frequency: 0.2s (was 0.5)
					ease: "easeInOut"
				}}
			>
				<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
				</svg>
			</motion.div>
		</div>
	);
};

const DeviceButton = memo(
	({
		isActive,
		onClick,
		label,
		icon,
		withSparkle = false,
		withPulse = false,
	}: {
		isActive: boolean;
		onClick: () => void;
		label: string;
		icon: React.ReactNode;
		withSparkle?: boolean;
		withPulse?: boolean;
	}) => (
		<motion.button
			type="button"
			onClick={onClick}
			className={`relative rounded-md px-3.5 py-1.5 text-sm font-medium flex items-center gap-1 sm:gap-2 ${isActive
				? "text-gray-900 dark:text-white"
				: "text-gray-600 dark:text-white/60 hover:text-gray-800 dark:hover:text-white"
				}`}
			whileTap={{ scale: 0.95 }}
		>
			{isActive && (
				<motion.div
					layoutId="activeDevice"
					className="absolute inset-0 rounded-md bg-white dark:bg-white/10 shadow-sm border border-gray-300/60 dark:border-white/5"
					transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
				/>
			)}
			<span className="relative z-10 inline flex-shrink-0">
				{withSparkle ? <SparkleIcon icon={icon} /> : icon}
			</span>
			<span className="relative z-10 min-w-[2em] text-center">
				{withPulse && !isActive ? <PulseText text={label} /> : label}
			</span>
		</motion.button>
	),
);

export default memo(DeviceToggle);
