/// <reference types="@cloudflare/workers-types" />

interface Env {
	LANDING_KV: KVNamespace;
}

interface InviteCode {
	code: string;
	createdAt: string;
	usedAt?: string;
	usedBy?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const { request, env } = context;

	try {
		const { code } = await request.json() as { code: string };

		if (!code || typeof code !== 'string') {
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
		return new Response(JSON.stringify({ success: false, error: '服务器错误' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
