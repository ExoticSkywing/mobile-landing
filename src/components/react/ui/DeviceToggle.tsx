import { motion } from "framer-motion";
import { memo, useCallback } from "react";
import { FiTablet } from "react-icons/fi";
import { IoPhonePortraitOutline } from "react-icons/io5";
import type { DeviceToggleProps } from "@/types/ui";

const SHOW_IPAD = false;

const DeviceToggle = ({ activeDevice, onToggle }: DeviceToggleProps) => {
	const handleIphoneClick = useCallback(() => onToggle("iphone"), [onToggle]);
	const handleIpadClick = useCallback(() => onToggle("ipad"), [onToggle]);

	return (
		<div className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-200/80 dark:bg-white/[0.03] p-1 shadow-sm">
			<DeviceButton
				key="iphone"
				isActive={activeDevice === "iphone"}
				onClick={handleIphoneClick}
				label="展示"
				icon={<IoPhonePortraitOutline className="w-4 h-4" />}
			/>
			{SHOW_IPAD && (
				<DeviceButton
					key="ipad"
					isActive={activeDevice === "ipad"}
					onClick={handleIpadClick}
					label="iPad"
					icon={<FiTablet className="w-4 h-4" />}
				/>
			)}
		</div>
	);
};

const DeviceButton = memo(
	({
		isActive,
		onClick,
		label,
		icon,
	}: {
		isActive: boolean;
		onClick: () => void;
		label: string;
		icon: React.ReactNode;
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
			<span className="relative z-10 inline flex-shrink-0">{icon}</span>
			<span className="relative z-10">{label}</span>
		</motion.button>
	),
);

export default memo(DeviceToggle);
