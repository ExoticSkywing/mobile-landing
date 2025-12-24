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

interface RegisterRequest {
	code: string;
	merchantId: string;
	shopUrl: string;
	supportUrl: string;
	socialLinks?: {
		instagram?: string;
		telegram?: string;
		twitter?: string;
	};
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const { request, env } = context;

	try {
		const data = await request.json() as RegisterRequest;
		const { code, merchantId, shopUrl, supportUrl, socialLinks } = data;

		// 验证邀请码
		const inviteData = await env.LANDING_KV.get(`invite:${code}`, 'json') as { usedAt?: string } | null;
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
		const idPattern = /^[a-zA-Z0-9_-]{3,20}$/;
		if (!idPattern.test(merchantId)) {
			return new Response(JSON.stringify({ 
				success: false, 
				error: '商家 ID 格式无效' 
			}), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 检查商家 ID 是否已存在
		const normalizedId = merchantId.toLowerCase();
		const existing = await env.LANDING_KV.get(`merchant:${normalizedId}`);
		if (existing) {
			return new Response(JSON.stringify({ success: false, error: '该商家 ID 已被使用' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 验证 URL 格式
		try {
			new URL(shopUrl);
			new URL(supportUrl);
		} catch {
			return new Response(JSON.stringify({ success: false, error: '链接格式无效' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const now = new Date().toISOString();

		// 保存商家配置
		const merchantConfig: MerchantConfig = {
			id: normalizedId,
			shopUrl,
			supportUrl,
			socialLinks,
			inviteCode: code,
			createdAt: now,
			updatedAt: now,
		};

		await env.LANDING_KV.put(`merchant:${normalizedId}`, JSON.stringify(merchantConfig));

		// 标记邀请码已使用
		await env.LANDING_KV.put(`invite:${code}`, JSON.stringify({
			...inviteData,
			usedAt: now,
			usedBy: normalizedId,
		}));

		// 生成最终链接
		const origin = new URL(request.url).origin;
		const finalUrl = `${origin}/m/${normalizedId}`;

		return new Response(JSON.stringify({ 
			success: true, 
			url: finalUrl,
			merchantId: normalizedId,
		}), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '服务器错误' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
