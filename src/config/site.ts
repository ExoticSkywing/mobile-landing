import { socialLinks } from "./socialLinks";

export const siteConfig = {
	name: "网络优化加速包",
	subtitle: "ParaSpace | 平行空间",
	description: "Here you can write a brief description of your application. Tell users about its main features and benefits in 1-2 sentences.",
	keywords: ["mobile app", "landing page", "astro", "react", "typescript"],
	logo: "https://api.minio.1yo.cc/nebuluxe/halosparkpix/image_picker_01F84B7A-35F3-4D91-AD6F-FDAD24992A12-27543-00000E42E227CB9D.jpg",
	// Whether to crop the logo into a fixed square card
	logoCrop: false,
	storeLinks: {
		apple: "#",
		google: "#",
	},
	socialLinks,
} as const;