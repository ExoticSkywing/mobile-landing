import type { APIRoute } from 'astro';

interface Merchant {
	id: string;
	shopUrl: string;
	supportUrl: string;
	inviteCode: string;
	createdAt: string;
	updatedAt: string;
}

// GET: 获取所有商家
export const GET: APIRoute = async ({ request, locals }) => {
	const runtime = locals.runtime;
	const env = runtime?.env;

	if (!env?.LANDING_KV || !env?.ADMIN_SECRET) {
		return new Response(JSON.stringify({ success: false, error: 'KV 未配置' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const authHeader = request.headers.get('Authorization');
	if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
		return new Response(JSON.stringify({ success: false, error: '未授权' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const list = await env.LANDING_KV.list({ prefix: 'merchant:' });
		const merchants: Merchant[] = [];

		for (const key of list.keys) {
			const data = await env.LANDING_KV.get(key.name, 'json') as Merchant;
			if (data) merchants.push(data);
		}

		merchants.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		return new Response(JSON.stringify({ success: true, merchants }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '获取失败' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// DELETE: 删除商家
export const DELETE: APIRoute = async ({ request, locals }) => {
	const runtime = locals.runtime;
	const env = runtime?.env;

	if (!env?.LANDING_KV || !env?.ADMIN_SECRET) {
		return new Response(JSON.stringify({ success: false, error: 'KV 未配置' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const authHeader = request.headers.get('Authorization');
	if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
		return new Response(JSON.stringify({ success: false, error: '未授权' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const body = await request.json() as { merchantId?: string };
		if (!body.merchantId) {
			return new Response(JSON.stringify({ success: false, error: '缺少商家 ID' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		await env.LANDING_KV.delete(`merchant:${body.merchantId.toLowerCase()}`);

		return new Response(JSON.stringify({ success: true }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '删除失败' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
