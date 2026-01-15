import DeviceToggle from "@react/ui/DeviceToggle";
import { memo, useState } from "react";
import type { ScreenshotsProps } from "@/types/app";
import { areImagesEqual } from "@/types/app";
import { FiMaximize2 } from "react-icons/fi";

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url);

const Screenshots = ({ images }: ScreenshotsProps) => {
	const [activeDevice, setActiveDevice] = useState<"speed" | "quality">("speed");
	const currentImages = images[activeDevice];
	const isSpeed = activeDevice === "speed";

	return (
		<div className="mb-16">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
					性能效果
				</h2>
				<DeviceToggle activeDevice={activeDevice} onToggle={setActiveDevice} />
			</div>
			<div
				className={`relative overflow-hidden min-h-[${isSpeed ? "400px" : "300px"}]`}
			>
				<div className="screenshots-container overflow-x-auto scrollbar-thin scrollbar-track-gray-200 dark:scrollbar-track-white/5 scrollbar-thumb-gray-400 dark:scrollbar-thumb-white/10 hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-white/20">
					<div className="flex gap-6 pb-4">
						{currentImages.map((media, index) => {
							const isVideo = isVideoUrl(media);
							const commonClasses = `rounded-xl border border-gray-300 dark:border-white/10 object-cover shadow-lg ${isSpeed
								? "aspect-[9/16] w-[260px]"
								: "aspect-[4/3] w-[360px]"
								}`;

							return (
								<button
									key={media}
									type="button"
									onClick={() => {
										if (!isVideo) {
											window.openLightbox?.(index, activeDevice);
										}
									}}
									className="relative flex-shrink-0 overflow-hidden rounded-xl focus:outline-none group cursor-zoom-in"
								>
									{isVideo ? (
										<video
											src={media}
											className={commonClasses}
											muted
											loop
											playsInline
											autoPlay
										/>
									) : (
										<>
											<img
												src={media}
												alt={`Screenshot ${index + 1}`}
												className={`${commonClasses} transition-transform duration-500 group-hover:scale-105`}
												loading="lazy"
											/>
											{/* Zoom Hint Overlay */}
											<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]">
												<div className="bg-black/60 rounded-full p-3 backdrop-blur-md border border-white/20 transform scale-90 group-hover:scale-100 transition-transform shadow-xl">
													<FiMaximize2 className="w-5 h-5 text-white/90" />
												</div>
											</div>
										</>
									)}
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</div >
	);
};

export default memo(Screenshots, areImagesEqual);
