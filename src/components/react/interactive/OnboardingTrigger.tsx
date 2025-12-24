import { useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import OnboardingModal from "./OnboardingModal";

export default function OnboardingTrigger() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-sm font-medium transition-all active:scale-95"
			>
				<FiUserPlus className="w-4 h-4" />
				<span>入驻</span>
			</button>
			<OnboardingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	);
}
