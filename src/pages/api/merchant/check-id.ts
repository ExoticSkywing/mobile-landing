import type { APIRoute } from 'astro';

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
		const body = await request.json() as { merchantId?: string };
		const merchantId = body.merchantId?.trim().toLowerCase();

		if (!merchantId) {
			return new Response(JSON.stringify({ success: false, error: '请输入商家 ID' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 验证格式：3-20位，仅支持英文、数字、横杠、下划线
		const idRegex = /^[a-z0-9_-]{3,20}$/;
		if (!idRegex.test(merchantId)) {
			return new Response(JSON.stringify({ 
				success: false, 
				error: 'ID 格式无效（3-20位，仅支持英文、数字、横杠、下划线）' 
			}), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 检查是否已存在
		const existing = await env.LANDING_KV.get(`merchant:${merchantId}`);
		if (existing) {
			return new Response(JSON.stringify({ success: false, error: '该 ID 已被占用' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		return new Response(JSON.stringify({ success: false, error: '检查失败' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
