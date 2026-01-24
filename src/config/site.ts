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
		apple: "https://xingxy.manyuzo.com/shop_cat/netsurf",
		google: "https://wiki.manyuzo.com/cutting-edge-tech/02.%E5%9B%BD%E9%99%85%E7%BD%91%E7%BB%9C%E5%86%B2%E6%B5%AA/05.telegram/00.intro#%E7%AE%80%E4%BB%8B-%E6%A6%82%E8%BF%B0",
	},
	// White Label Config
	proBenefits: {
		enabled: true,
		label: "权益",
		link: "https://1keyid.1yo.cc", // Custom Link
	},
	socialLinks,
} as const;