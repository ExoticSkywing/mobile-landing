import type { APIRoute } from 'astro';

interface InviteCode {
	code: string;
	createdAt: string;
	usedAt?: string;
	usedBy?: string;
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

export const POST: APIRoute = async ({ request, locals }) => {
	const runtime = locals.runtime;
	const env = runtime?.env;

	if (!env?.LANDING_KV) {
		return new Response(JSON.stringify({ success: false, error: 'KV 未配置' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const body = await request.json() as {
			merchantId?: string;
			code?: string;
			shopUrl?: string;
			supportUrl?: string;
			socialLinks?: {
				instagram?: string;
				telegram?: string;
				twitter?: string;
			};
		};

		const merchantId = body.merchantId?.trim().toLowerCase();
		const code = body.code?.trim().toUpperCase();

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

		// 更新配置
		if (body.shopUrl) {
			const urlRegex = /^https?:\/\/.+/;
			if (!urlRegex.test(body.shopUrl)) {
				return new Response(JSON.stringify({ success: false, error: '购买链接格式无效' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			merchantData.shopUrl = body.shopUrl.trim();
		}

		if (body.supportUrl) {
			const urlRegex = /^https?:\/\/.+/;
			if (!urlRegex.test(body.supportUrl)) {
				return new Response(JSON.stringify({ success: false, error: '支持链接格式无效' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			merchantData.supportUrl = body.supportUrl.trim();
		}

		if (body.socialLinks) {
			merchantData.socialLinks = body.socialLinks;
		}

		merchantData.updatedAt = new Date().toISOString();

		await env.LANDING_KV.put(`merchant:${merchantId}`, JSON.stringify(merchantData));

		return new Response(JSON.stringify({ success: true }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '更新失败' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
