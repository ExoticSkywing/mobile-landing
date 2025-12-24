import type { APIRoute } from 'astro';

interface InviteCode {
	code: string;
	createdAt: string;
	usedAt?: string;
	usedBy?: string;
}

// 生成随机邀请码
function generateCode(length: number = 8): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

// GET: 获取所有邀请码
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
		const list = await env.LANDING_KV.list({ prefix: 'invite:' });
		const codes: InviteCode[] = [];

		for (const key of list.keys) {
			const data = await env.LANDING_KV.get(key.name, 'json') as InviteCode;
			if (data) codes.push(data);
		}

		codes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		return new Response(JSON.stringify({ success: true, codes }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '获取失败' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// POST: 生成邀请码
export const POST: APIRoute = async ({ request, locals }) => {
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
		const body = await request.json() as { count?: number };
		const count = Math.min(Math.max(body.count || 1, 1), 50);
		const newCodes: InviteCode[] = [];

		for (let i = 0; i < count; i++) {
			let code: string;
			let exists = true;

			while (exists) {
				code = generateCode();
				const existing = await env.LANDING_KV.get(`invite:${code}`);
				exists = !!existing;
			}

			const inviteCode: InviteCode = {
				code: code!,
				createdAt: new Date().toISOString(),
			};

			await env.LANDING_KV.put(`invite:${code!}`, JSON.stringify(inviteCode));
			newCodes.push(inviteCode);
		}

		return new Response(JSON.stringify({ success: true, codes: newCodes }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '生成失败' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// DELETE: 删除邀请码
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
		const body = await request.json() as { code?: string };
		if (!body.code) {
			return new Response(JSON.stringify({ success: false, error: '缺少邀请码' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		await env.LANDING_KV.delete(`invite:${body.code}`);

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
