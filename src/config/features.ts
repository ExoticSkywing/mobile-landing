import { FiBox, FiStar, FiZap } from "react-icons/fi";
import { GiCrownedHeart } from "react-icons/gi";
import { SiNetflix } from "react-icons/si";
import type { Feature } from "@/types/app";

export const features: Feature[] = [
	{
		title: "多巴胺 × 肾上腺素",
		description: "全程高速兴奋流畅丝滑，拒绝卡顿阻塞，把最好的状态留给自己热爱的每一件事♥",
		icon: GiCrownedHeart,
	},
	{
		title: "24H 自动贩卖机",
		description: "24 小时自助，即买即用，操作简单，0秒使用，无需等待",
		icon: FiZap,
	},
	{
		title: "解锁流媒体服务",
		description: "无限制访问 Spotify、Netflix、YouTube 等流媒体服务，让您能自由的访问喜欢的内容",
		icon: SiNetflix,
	},
];
