# 商家入驻系统部署指南

## 概述

本系统允许你为下级商家/代理生成专属落地页，每个商家拥有独立的购买链接和技术支持链接。

## 部署步骤

### 1. 创建 Cloudflare KV Namespace

```bash
# 登录 Cloudflare
npx wrangler login

# 创建 KV namespace
npx wrangler kv:namespace create "LANDING_KV"

# 记录返回的 namespace ID，更新 wrangler.toml
```

### 2. 更新 wrangler.toml

将创建的 KV namespace ID 填入 `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "LANDING_KV"
id = "你的KV_NAMESPACE_ID"
```

### 3. 设置管理密钥

在 Cloudflare Pages 项目的 **Settings > Environment variables** 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `ADMIN_SECRET` | 自定义强密码 | 用于访问 /admin 管理后台 |

### 4. 部署

```bash
npm run build
npx wrangler pages deploy dist
```

或通过 Git 推送自动部署（需要先在 Cloudflare Pages 绑定 Git 仓库）。

## 使用流程

### 管理员操作

1. 访问 `https://你的域名/admin`
2. 输入管理密钥（ADMIN_SECRET）
3. 生成邀请码
4. 将邀请码发放给下级商家

### 商家入驻

1. 商家访问落地页
2. 点击页面底部「入驻」按钮
3. 输入收到的邀请码
4. 填写配置信息：
   - **商家 ID**：3-20位，英文/数字/横杠/下划线
   - **购买链接**：AFF 购买链接
   - **技术支持链接**：客服/Telegram 链接
   - **社交链接**：可选
5. 获取专属页面链接：`https://你的域名/m/商家ID`

### 商家更新配置

商家可以使用原邀请码通过 API 更新配置：

```bash
curl -X POST https://你的域名/api/merchant/update \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "商家ID",
    "code": "原邀请码",
    "shopUrl": "新购买链接",
    "supportUrl": "新支持链接"
  }'
```

## API 参考

### 商家相关

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/merchant/validate-code` | POST | 验证邀请码 |
| `/api/merchant/check-id` | POST | 检查商家 ID 是否可用 |
| `/api/merchant/register` | POST | 商家注册 |
| `/api/merchant/update` | POST | 更新商家配置 |

### 管理员相关（需要 Authorization 头）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/invite-codes` | GET | 获取所有邀请码 |
| `/api/admin/invite-codes` | POST | 生成邀请码 |
| `/api/admin/invite-codes` | DELETE | 删除邀请码 |
| `/api/admin/merchants` | GET | 获取所有商家 |
| `/api/admin/merchants` | DELETE | 删除商家 |

## 数据存储

所有数据存储在 Cloudflare KV 中：

- `invite:{code}` - 邀请码数据
- `merchant:{id}` - 商家配置数据

## 注意事项

1. **邀请码永久有效**，使用后标记为已使用
2. 商家 ID **不区分大小写**，统一存储为小写
3. 商家页面通过 **服务端渲染**，链接直接注入 HTML，用户看不到配置逻辑
4. 管理密钥请使用强密码并妥善保管
