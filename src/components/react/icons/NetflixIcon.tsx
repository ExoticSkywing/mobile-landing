interface NetflixIconProps {
	className?: string;
}

export const NetflixIcon = ({ className }: NetflixIconProps) => {
	return (
		<img
			src="/assets/netflix公司-100.png"
			alt="netflix"
			className={`${className} !h-8 !w-8`}
			style={{ objectFit: "contain" }}
		/>
	);
};
