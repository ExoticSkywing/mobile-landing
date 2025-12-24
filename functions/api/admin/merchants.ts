/// <reference types="@cloudflare/workers-types" />

interface Env {
	LANDING_KV: KVNamespace;
	ADMIN_SECRET: string;
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

// GET: 获取所有商家
export const onRequestGet: PagesFunction<Env> = async (context) => {
	const { request, env } = context;

	// 验证管理员密钥
	const authHeader = request.headers.get('Authorization');
	if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
		return new Response(JSON.stringify({ success: false, error: '未授权' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const list = await env.LANDING_KV.list({ prefix: 'merchant:' });
		const merchants: MerchantConfig[] = [];

		for (const key of list.keys) {
			const data = await env.LANDING_KV.get(key.name, 'json') as MerchantConfig;
			if (data) merchants.push(data);
		}

		// 按创建时间倒序
		merchants.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		return new Response(JSON.stringify({ success: true, merchants }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '服务器错误' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// DELETE: 删除商家
export const onRequestDelete: PagesFunction<Env> = async (context) => {
	const { request, env } = context;

	// 验证管理员密钥
	const authHeader = request.headers.get('Authorization');
	if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
		return new Response(JSON.stringify({ success: false, error: '未授权' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const { merchantId } = await request.json() as { merchantId: string };

		if (!merchantId) {
			return new Response(JSON.stringify({ success: false, error: '请指定商家 ID' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		await env.LANDING_KV.delete(`merchant:${merchantId.toLowerCase()}`);

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
