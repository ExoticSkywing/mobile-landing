/// <reference types="@cloudflare/workers-types" />

interface Env {
	LANDING_KV: KVNamespace;
	ADMIN_SECRET: string;
}

interface InviteCode {
	code: string;
	createdAt: string;
	usedAt?: string;
	usedBy?: string;
}

// 生成随机邀请码
function generateCode(length: number = 8): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除易混淆字符
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

// GET: 获取所有邀请码
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
		const list = await env.LANDING_KV.list({ prefix: 'invite:' });
		const codes: InviteCode[] = [];

		for (const key of list.keys) {
			const data = await env.LANDING_KV.get(key.name, 'json') as InviteCode;
			if (data) codes.push(data);
		}

		// 按创建时间倒序
		codes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		return new Response(JSON.stringify({ success: true, codes }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '服务器错误' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// POST: 生成新邀请码
export const onRequestPost: PagesFunction<Env> = async (context) => {
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
		const { count = 1 } = await request.json() as { count?: number };
		const generateCount = Math.min(Math.max(1, count), 50); // 限制 1-50 个

		const newCodes: InviteCode[] = [];
		const now = new Date().toISOString();

		for (let i = 0; i < generateCount; i++) {
			let code: string;
			let exists = true;

			// 确保生成唯一码
			while (exists) {
				code = generateCode();
				exists = !!(await env.LANDING_KV.get(`invite:${code}`));
			}

			const inviteCode: InviteCode = {
				code: code!,
				createdAt: now,
			};

			await env.LANDING_KV.put(`invite:${code!}`, JSON.stringify(inviteCode));
			newCodes.push(inviteCode);
		}

		return new Response(JSON.stringify({ success: true, codes: newCodes }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '服务器错误' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// DELETE: 删除邀请码
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
		const { code } = await request.json() as { code: string };

		if (!code) {
			return new Response(JSON.stringify({ success: false, error: '请指定邀请码' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		await env.LANDING_KV.delete(`invite:${code}`);

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
