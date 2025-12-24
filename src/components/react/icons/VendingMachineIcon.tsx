interface VendingMachineIconProps {
	className?: string;
}

export const VendingMachineIcon = ({ className }: VendingMachineIconProps) => {
	return (
		<img
			src="/assets/自动贩卖机-100.png"
			alt="自动贩卖机"
			className={`${className} !h-9 !w-9`}
			style={{ objectFit: "contain" }}
		/>
	);
};
