import type { APIRoute } from 'astro';

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
	registerIp?: string;
	createdAt: string;
	updatedAt: string;
}

export const GET: APIRoute = async ({ url, locals }) => {
	const runtime = locals.runtime;
	const env = runtime?.env;

	if (!env?.LANDING_KV) {
		return new Response(JSON.stringify({ success: false, error: 'KV 未配置' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const merchantId = url.searchParams.get('id')?.trim().toLowerCase();
		const code = url.searchParams.get('code')?.trim().toUpperCase();

		if (!merchantId || !code) {
			return new Response(JSON.stringify({ success: false, error: '请提供商家 ID 和邀请码' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 获取商家配置
		const merchantData = await env.LANDING_KV.get(`merchant:${merchantId}`, 'json') as MerchantConfig | null;
		if (!merchantData) {
			return new Response(JSON.stringify({ success: false, error: '商家不存在' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 验证邀请码
		if (merchantData.inviteCode !== code) {
			return new Response(JSON.stringify({ success: false, error: '邀请码不匹配' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 返回配置（不包含敏感信息）
		return new Response(JSON.stringify({ 
			success: true, 
			config: {
				shopUrl: merchantData.shopUrl,
				supportUrl: merchantData.supportUrl,
				socialLinks: merchantData.socialLinks,
			}
		}), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '获取配置失败' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
