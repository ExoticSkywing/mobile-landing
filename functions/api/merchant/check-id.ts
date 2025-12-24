/// <reference types="@cloudflare/workers-types" />

interface Env {
	LANDING_KV: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
	const { request, env } = context;

	try {
		const { merchantId } = await request.json() as { merchantId: string };

		if (!merchantId || typeof merchantId !== 'string') {
			return new Response(JSON.stringify({ success: false, error: '请输入商家 ID' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 验证格式：只允许英文、数字、横杠、下划线，长度 3-20
		const idPattern = /^[a-zA-Z0-9_-]{3,20}$/;
		if (!idPattern.test(merchantId)) {
			return new Response(JSON.stringify({ 
				success: false, 
				error: '商家 ID 格式无效（3-20位，仅支持英文、数字、横杠、下划线）' 
			}), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 检查是否已存在
		const existing = await env.LANDING_KV.get(`merchant:${merchantId.toLowerCase()}`);
		if (existing) {
			return new Response(JSON.stringify({ success: false, error: '该商家 ID 已被使用' }), {
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
