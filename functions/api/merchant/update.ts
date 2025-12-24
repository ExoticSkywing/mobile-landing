/// <reference types="@cloudflare/workers-types" />

interface Env {
	LANDING_KV: KVNamespace;
}

interface MerchantConfig {
	id: string;
	shopUrl: string;
	supportUrl: string;
	socialLinks?: {
		instagram?: string;
		telegram?: string;
		twitter?: string;
	};
	inviteCode: string;
	createdAt: string;
	updatedAt: string;
}

interface UpdateRequest {
	merchantId: string;
	code: string; // 用原邀请码验证身份
	shopUrl?: string;
	supportUrl?: string;
	socialLinks?: {
		instagram?: string;
		telegram?: string;
		twitter?: string;
	};
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const { request, env } = context;

	try {
		const data = await request.json() as UpdateRequest;
		const { merchantId, code, shopUrl, supportUrl, socialLinks } = data;

		const normalizedId = merchantId.toLowerCase();

		// 获取现有配置
		const existing = await env.LANDING_KV.get(`merchant:${normalizedId}`, 'json') as MerchantConfig | null;
		if (!existing) {
			return new Response(JSON.stringify({ success: false, error: '商家不存在' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 验证邀请码（用作身份验证）
		if (existing.inviteCode !== code) {
			return new Response(JSON.stringify({ success: false, error: '验证失败' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 验证 URL 格式
		if (shopUrl) {
			try { new URL(shopUrl); } catch {
				return new Response(JSON.stringify({ success: false, error: '购买链接格式无效' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		}
		if (supportUrl) {
			try { new URL(supportUrl); } catch {
				return new Response(JSON.stringify({ success: false, error: '支持链接格式无效' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		}

		// 更新配置
		const updatedConfig: MerchantConfig = {
			...existing,
			shopUrl: shopUrl || existing.shopUrl,
			supportUrl: supportUrl || existing.supportUrl,
			socialLinks: socialLinks || existing.socialLinks,
			updatedAt: new Date().toISOString(),
		};

		await env.LANDING_KV.put(`merchant:${normalizedId}`, JSON.stringify(updatedConfig));

		return new Response(JSON.stringify({ success: true }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '服务器错误' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
