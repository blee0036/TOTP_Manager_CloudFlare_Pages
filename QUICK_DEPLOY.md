# 快速部署指南 (Quick Deploy Guide)

本指南提供了将 TOTP Manager 部署到 Cloudflare Pages 的快速步骤。

## 前提条件

- ✅ Node.js 18+ 已安装
- ✅ Cloudflare 账户
- ✅ Wrangler CLI 已安装并登录
  ```bash
  npm install -g wrangler
  wrangler login
  ```

## 快速部署（5 步）

### 1️⃣ 创建 D1 数据库

```bash
cd totp-manager
npm run db:create
```

**输出示例：**
```
✅ Successfully created DB 'totp_db'

[[d1_databases]]
binding = "DATABASE"
database_name = "totp_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**重要：** 复制 `database_id` 并更新 `wrangler.toml` 文件中的对应字段。

### 2️⃣ 设置环境变量

```bash
# 生成随机盐值
# Windows PowerShell:
$salt = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
echo $salt

# Linux/Mac:
openssl rand -base64 32

# 设置密钥
wrangler secret put HASH_SALT
# 粘贴上面生成的盐值
```

### 3️⃣ 应用数据库迁移

```bash
# 先在本地测试（可选）
npm run db:migrate:local

# 应用到生产环境
npm run db:migrate:remote
```

**验证迁移成功：**
```bash
npm run db:query:remote -- --command "SELECT name FROM sqlite_master WHERE type='table'"
```

预期输出应包含：`users`, `totp_keys`, `d1_migrations`

### 4️⃣ 构建项目

```bash
npm run build
```

**验证构建成功：**
- 检查 `dist/` 目录存在
- 检查 `dist/_routes.json` 存在（如果不存在，运行 `copy _routes.json dist\_routes.json`）

### 5️⃣ 部署到 Cloudflare Pages

**方式 A: 使用 npm 脚本（推荐）**

```bash
npm run deploy
```

这会自动执行构建、迁移和部署。

**方式 B: 手动部署**

```bash
wrangler pages deploy dist
```

**方式 C: 通过 Git 自动部署**

1. 将代码推送到 GitHub
2. 在 Cloudflare Dashboard 中连接仓库
3. 配置构建设置：
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `totp-manager`
4. 在 Settings > Environment variables 中设置 `HASH_SALT`
5. 触发部署

## 部署后验证

访问部署的 URL（例如：`https://totp-manager.pages.dev`）

### 快速测试清单

- [ ] 页面正常加载
- [ ] 可以切换语言（18 种语言）
- [ ] 可以切换主题（明暗模式）
- [ ] 临时模式：可以添加密钥并生成 TOTP
- [ ] 注册新用户成功
- [ ] 登录成功
- [ ] 可以添加、编辑、删除密钥

## 常见问题

### ❌ 问题：API 返回 404

**原因：** `_routes.json` 未复制到 `dist/` 目录

**解决：**
```bash
copy _routes.json dist\_routes.json
wrangler pages deploy dist
```

### ❌ 问题：数据库连接失败

**原因：** `database_id` 未配置或迁移未应用

**解决：**
1. 检查 `wrangler.toml` 中的 `database_id`
2. 运行 `npm run db:migrate:remote`

### ❌ 问题：环境变量未生效

**原因：** `HASH_SALT` 未设置

**解决：**
```bash
wrangler secret put HASH_SALT
```

## 更新部署

当代码更新后：

```bash
# 1. 拉取最新代码
git pull

# 2. 安装依赖（如果有更新）
npm install

# 3. 运行测试
npm test

# 4. 部署
npm run deploy
```

## 回滚

如果需要回滚到上一个版本：

1. 在 Cloudflare Dashboard 中进入 Pages 项目
2. 点击 "Deployments"
3. 找到上一个稳定版本
4. 点击 "Rollback to this deployment"

## 监控

### 查看日志

```bash
# 实时查看 Functions 日志
wrangler pages deployment tail

# 查看部署历史
wrangler pages deployment list
```

### 性能监控

在 Cloudflare Dashboard 中查看：
- 访问量统计
- 错误率
- 响应时间
- D1 数据库使用情况

## 下一步

- 📖 阅读完整的 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- 🔧 配置自定义域名
- 📊 设置监控和告警
- 🔒 进行安全审计
- 📱 测试 PWA 功能

## 支持

如有问题，请查看：
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - 数据库详细配置
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - 环境变量说明
- [README.md](./README.md) - 项目文档

---

**祝部署顺利！🚀**
