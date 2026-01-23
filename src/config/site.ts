import { socialLinks } from "./socialLinks";

export const siteConfig = {
	name: "网络高速调优计划",
	subtitle: "ParaSpace · 平行空间",
	officialSite: "#",
	description: "打开探索全球前沿 AI 工具并强劲AI赋能的高速通道，助力商家 TikTok 跨境电商顺利出海，更高效加速 GitHub 等办公访问。获取网络加速服务高达10Gbps的单线接入能力",
	keywords: ["网络加速", "TikTok", "小火箭", "shadowrocket", "AI", "clash", "loon", "流媒体解锁", "专线", "IEPL", "netflix", "telegram"],
	logo: "https://api.minio.1yo.cc/nebuluxe/halosparkpix/image_picker_F95682B2-5313-4C1E-882D-D84D126E4BE7-41909-00000F5A7D63DFE7.jpg",
	// Whether to crop the logo into a fixed square card
	logoCrop: false,
	storeLinks: {
		apple: "https://xingxy.manyuzo.com",
		google: "https://t.me/paraspacesupport",
	},
	// White Label Config
	proBenefits: {
		enabled: true,
		label: "权益",
	},
	socialLinks,
} as const;