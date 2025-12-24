import type { APIRoute } from 'astro';

interface InviteCode {
	code: string;
	createdAt: string;
	usedAt?: string;
	usedBy?: string;
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
		const body = await request.json() as { code?: string };
		const code = body.code?.trim().toUpperCase();

		if (!code) {
			return new Response(JSON.stringify({ success: false, error: '请输入邀请码' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

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

		return new Response(JSON.stringify({ success: true }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '验证失败' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
