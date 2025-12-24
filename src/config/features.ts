import { FiBox } from "react-icons/fi";
import { SiNetflix } from "react-icons/si";
import { DopamineIcon } from "../components/react/icons/DopamineIcon";
import { VendingMachineIcon } from "../components/react/icons/VendingMachineIcon";
import { NetflixIcon } from "../components/react/icons/NetflixIcon";
import type { Feature } from "@/types/app";

export const features: Feature[] = [
	{
		title: "多巴胺 × 肾上腺素",
		description: "全程流畅丝滑，时刻保持高速，把最好的状态留给自己热爱的每一瞬间、每一帧♥",
		icon: DopamineIcon,
	},
	{
		title: "24H 自动贩卖机",
		description: "24 小时自助，即买即用，操作简单，0秒使用，无需等待",
		icon: VendingMachineIcon,
	},
	{
		title: "解锁流媒体服务",
		description: "无限制访问 Spotify、Netflix、YouTube 等流媒体服务，让您能自由的访问喜欢的内容",
		icon: NetflixIcon,
	},
];
