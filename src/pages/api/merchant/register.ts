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

export const POST: APIRoute = async ({ request, locals, url }) => {
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
			code?: string;
			merchantId?: string;
			shopUrl?: string;
			supportUrl?: string;
			socialLinks?: {
				instagram?: string;
				telegram?: string;
				twitter?: string;
			};
		};

		const code = body.code?.trim().toUpperCase();
		const merchantId = body.merchantId?.trim().toLowerCase();
		const shopUrl = body.shopUrl?.trim();
		const supportUrl = body.supportUrl?.trim();

		// 验证必填字段
		if (!code || !merchantId || !shopUrl || !supportUrl) {
			return new Response(JSON.stringify({ success: false, error: '请填写所有必填字段' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 验证邀请码
		const inviteData = await env.LANDING_KV.get(`invite:${code}`, 'json') as InviteCode | null;
		if (!inviteData) {
			return new Response(JSON.stringify({ success: false, error: '邀请码无效' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		if (inviteData.usedAt) {
			return new Response(JSON.stringify({ success: false, error: '邀请码已被使用' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 验证商家 ID 格式
		const idRegex = /^[a-z0-9_-]{3,20}$/;
		if (!idRegex.test(merchantId)) {
			return new Response(JSON.stringify({ 
				success: false, 
				error: 'ID 格式无效' 
			}), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 检查商家 ID 是否已存在
		const existing = await env.LANDING_KV.get(`merchant:${merchantId}`);
		if (existing) {
			return new Response(JSON.stringify({ success: false, error: '该 ID 已被占用' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 验证 URL 格式
		const urlRegex = /^https?:\/\/.+/;
		if (!urlRegex.test(shopUrl) || !urlRegex.test(supportUrl)) {
			return new Response(JSON.stringify({ success: false, error: 'URL 格式无效' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const now = new Date().toISOString();

		// 保存商家配置
		const merchantConfig: MerchantConfig = {
			id: merchantId,
			shopUrl,
			supportUrl,
			socialLinks: body.socialLinks,
			inviteCode: code,
			createdAt: now,
			updatedAt: now,
		};
		await env.LANDING_KV.put(`merchant:${merchantId}`, JSON.stringify(merchantConfig));

		// 标记邀请码为已使用
		inviteData.usedAt = now;
		inviteData.usedBy = merchantId;
		await env.LANDING_KV.put(`invite:${code}`, JSON.stringify(inviteData));

		// 生成专属链接
		const merchantUrl = `${url.origin}/m/${merchantId}`;

		return new Response(JSON.stringify({ success: true, url: merchantUrl }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '注册失败' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
