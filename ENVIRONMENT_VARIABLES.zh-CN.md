# 环境变量配置文档

[English](ENVIRONMENT_VARIABLES.md) | 简体中文

本文档详细说明了 TOTP Manager 应用所需的所有环境变量、配置方法和示例值。

## 目录

- [环境变量列表](#环境变量列表)
- [配置方法](#配置方法)
- [本地开发配置](#本地开发配置)
- [生产环境配置](#生产环境配置)
- [安全最佳实践](#安全最佳实践)
- [故障排除](#故障排除)

## 环境变量列表

### 必需的环境变量

#### HASH_SALT

- **说明**：密码哈希盐值，用于 PBKDF2-SHA256 密码哈希
- **类型**：字符串（密钥）
- **必需**：是
- **默认值**：无（生产环境必须设置）
- **示例值**：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
- **安全级别**：高度敏感
- **配置位置**：Cloudflare Secret（不要在代码或配置文件中明文存储）
- **相关需求**：需求 2.1, 5.1, 13.1

**生成方法：**

```bash
# 使用 OpenSSL 生成随机盐值
openssl rand -hex 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 或使用 Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**设置方法：**

```bash
# 使用 Wrangler CLI 设置（推荐）
wrangler secret put HASH_SALT
# 然后输入生成的盐值

# 或在 Cloudflare Dashboard 中设置
# Pages 项目 → Settings → Environment variables → Add variable
```

---

#### DATABASE (D1 Binding)

- **说明**：Cloudflare D1 数据库绑定
- **类型**：D1 数据库绑定
- **必需**：是
- **配置位置**：`wrangler.toml`
- **相关需求**：需求 2.1, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6

**配置方法：**

1. 创建 D1 数据库：

```bash
wrangler d1 create totp_db
```

2. 将输出的配置添加到 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DATABASE"
database_name = "totp_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

3. 在 Cloudflare Dashboard 中绑定：
   - Pages 项目 → Settings → Functions → D1 database bindings
   - Variable name: `DATABASE`
   - D1 database: 选择你的数据库

---

### 可选的环境变量

#### PW_ITERATIONS

- **说明**：PBKDF2 密码哈希迭代次数
- **类型**：数字（字符串格式）
- **必需**：否
- **默认值**：`100000`
- **推荐值**：`100000` - `600000`
- **示例值**：`100000`
- **安全级别**：中等
- **配置位置**：`wrangler.toml` 的 `[vars]` 部分或 Cloudflare Dashboard
- **相关需求**：需求 2.2, 5.1, 13.1

**说明：**
- 更高的迭代次数提供更好的安全性，但会增加 CPU 使用
- OWASP 推荐最少 100,000 次迭代
- 根据服务器性能调整，确保响应时间在可接受范围内

**配置方法：**

在 `wrangler.toml` 中：

```toml
[vars]
PW_ITERATIONS = "100000"
```

或在 Cloudflare Dashboard 中：
- Pages 项目 → Settings → Environment variables
- Add variable: `PW_ITERATIONS` = `100000`

---

#### SESSION_SECRET

- **说明**：会话令牌签名密钥（当前版本未使用，预留用于未来增强）
- **类型**：字符串（密钥）
- **必需**：否
- **默认值**：无
- **示例值**：`session-secret-key-change-in-production`
- **安全级别**：高度敏感
- **配置位置**：Cloudflare Secret

**注意**：当前版本使用简化的会话管理（用户名作为 token），未来版本可能使用此密钥进行 JWT 签名。

---

## 配置方法

### 方法 1: Wrangler CLI（推荐用于密钥）

**优点**：
- 密钥加密存储
- 不会出现在代码或日志中
- 支持本地和远程环境

**设置密钥：**

```bash
# 设置密钥（会提示输入值）
wrangler secret put HASH_SALT

# 列出所有密钥（不显示值）
wrangler secret list

# 删除密钥
wrangler secret delete HASH_SALT
```

---

### 方法 2: wrangler.toml 配置文件（用于非敏感配置）

**优点**：
- 版本控制
- 易于团队共享
- 支持不同环境配置

**缺点**：
- 不适合存储密钥
- 会被提交到 Git

**配置示例：**

```toml
name = "totp-manager"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

# D1 数据库绑定
[[d1_databases]]
binding = "DATABASE"
database_name = "totp_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 非敏感环境变量
[vars]
PW_ITERATIONS = "100000"

# 生产环境配置
[env.production]
vars = { PW_ITERATIONS = "150000" }

# 开发环境配置
[env.development]
vars = { PW_ITERATIONS = "100000" }
```

---

### 方法 3: Cloudflare Dashboard（用于手动配置）

**优点**：
- 图形界面，易于使用
- 支持加密变量
- 可以为不同环境设置不同值

**步骤：**

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → 选择项目
3. 点击 **Settings** → **Environment variables**
4. 点击 **Add variable**
5. 输入变量名和值
6. 选择环境（Production / Preview）
7. 点击 **Save**
8. 重新部署项目使更改生效

**设置加密变量：**
- 勾选 **Encrypt** 选项
- 加密后的变量值不会在 Dashboard 中显示

---

### 方法 4: .dev.vars 文件（仅用于本地开发）

**优点**：
- 本地开发方便
- 自动加载
- 不会被提交到 Git（已在 .gitignore 中）

**缺点**：
- 仅用于本地开发
- 不适用于生产环境

**创建 .dev.vars 文件：**

```bash
# 在 totp-manager 目录创建 .dev.vars
cat > .dev.vars << EOF
HASH_SALT=local-dev-salt-not-for-production
PW_ITERATIONS=100000
EOF
```

**注意**：
- `.dev.vars` 文件已在 `.gitignore` 中，不会被提交
- 仅在运行 `wrangler pages dev` 时自动加载
- 不要在生产环境使用此文件

---

## 本地开发配置

### 步骤 1: 创建本地数据库

```bash
# 创建数据库
wrangler d1 create totp_db

# 应用迁移
npm run db:migrate:local
```

### 步骤 2: 配置环境变量

**选项 A: 使用 .dev.vars 文件（推荐）**

```bash
# 创建 .dev.vars 文件
cat > .dev.vars << EOF
HASH_SALT=local-dev-salt-change-this
PW_ITERATIONS=100000
EOF
```

**选项 B: 使用 wrangler secret（本地）**

```bash
# 设置本地密钥
wrangler secret put HASH_SALT --local
```

### 步骤 3: 启动开发服务器

```bash
# 启动 Vite 开发服务器
npm run dev

# 在另一个终端启动 Wrangler（用于测试 Functions）
wrangler pages dev dist --local
```

### 验证配置

```bash
# 测试注册 API
curl -X POST http://localhost:8788/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# 应该返回成功响应
```

---

## 生产环境配置

### 首次部署

#### 步骤 1: 创建 D1 数据库

```bash
wrangler d1 create totp_db
```

复制输出的配置到 `wrangler.toml`。

#### 步骤 2: 设置环境变量

```bash
# 生成安全的盐值
SALT=$(openssl rand -hex 32)
echo "Generated HASH_SALT: $SALT"

# 设置密钥
wrangler secret put HASH_SALT
# 粘贴上面生成的盐值
```

#### 步骤 3: 应用数据库迁移

```bash
npm run db:migrate:remote
```

#### 步骤 4: 部署应用

```bash
npm run deploy
```

### 更新环境变量

```bash
# 更新密钥
wrangler secret put HASH_SALT

# 或在 Dashboard 中更新
# Pages → Settings → Environment variables → Edit
```

**注意**：更新环境变量后需要重新部署。

### 多环境配置

**生产环境（Production）：**

```toml
[env.production]
vars = { PW_ITERATIONS = "150000" }

[[env.production.d1_databases]]
binding = "DATABASE"
database_name = "totp_db_prod"
database_id = "prod-database-id"
```

**预览环境（Preview）：**

```toml
[env.preview]
vars = { PW_ITERATIONS = "100000" }

[[env.preview.d1_databases]]
binding = "DATABASE"
database_name = "totp_db_preview"
database_id = "preview-database-id"
```

**部署到特定环境：**

```bash
# 部署到生产环境
wrangler pages deploy dist --env production

# 部署到预览环境
wrangler pages deploy dist --env preview
```

---

## 安全最佳实践

### 1. 密钥管理

✅ **应该做：**
- 使用强随机盐值（至少 32 字节）
- 使用 `wrangler secret` 或 Cloudflare Dashboard 加密变量
- 为不同环境使用不同的密钥
- 定期轮换密钥（建议每 90 天）
- 限制访问权限（仅必要人员）

❌ **不应该做：**
- 在代码中硬编码密钥
- 将密钥提交到 Git
- 在日志中打印密钥
- 在生产环境使用默认值
- 与他人共享密钥（使用密钥管理系统）

### 2. 迭代次数配置

- **开发环境**：100,000 次（快速测试）
- **生产环境**：150,000 - 600,000 次（根据性能调整）
- **监控**：定期检查响应时间，确保在可接受范围内

### 3. 环境隔离

- 为开发、预览、生产环境使用不同的数据库
- 为每个环境设置独立的密钥
- 使用 Cloudflare 的环境变量作用域功能

### 4. 访问控制

- 使用 Cloudflare API Token 而非 Global API Key
- 为 CI/CD 创建专用的 API Token，仅授予必要权限
- 定期审查和撤销不再使用的 Token

### 5. 审计和监控

- 启用 Cloudflare 审计日志
- 监控环境变量更改
- 记录密钥轮换历史
- 设置告警通知

---

## 故障排除

### 问题 1: HASH_SALT 未设置

**错误信息：**
```
Error: HASH_SALT is not set
```

**解决方案：**

```bash
# 检查密钥是否存在
wrangler secret list

# 如果不存在，设置密钥
wrangler secret put HASH_SALT

# 或在本地开发中创建 .dev.vars
echo "HASH_SALT=local-dev-salt" > .dev.vars
```

---

### 问题 2: 数据库连接失败

**错误信息：**
```
Error: D1_ERROR: no such database
```

**解决方案：**

1. 检查 `wrangler.toml` 中的数据库配置：

```toml
[[d1_databases]]
binding = "DATABASE"
database_name = "totp_db"
database_id = "your-actual-database-id"
```

2. 确保数据库已创建：

```bash
wrangler d1 list
```

3. 如果数据库不存在，创建它：

```bash
wrangler d1 create totp_db
```

4. 应用迁移：

```bash
npm run db:migrate:local  # 本地
npm run db:migrate:remote # 远程
```

---

### 问题 3: 环境变量未生效

**症状**：更新环境变量后，应用仍使用旧值

**解决方案：**

1. 重新部署应用：

```bash
npm run deploy
```

2. 清除 Cloudflare 缓存：
   - Dashboard → Pages → 项目 → Deployments
   - 点击最新部署的 **...** → **Retry deployment**

3. 验证环境变量：

```bash
# 在 Function 中打印环境变量（仅用于调试）
console.log('PW_ITERATIONS:', env.PW_ITERATIONS);
```

**注意**：不要在生产环境打印敏感信息！

---

### 问题 4: 本地开发环境变量不加载

**症状**：`.dev.vars` 文件存在，但变量未加载

**解决方案：**

1. 确保文件名正确：`.dev.vars`（不是 `.env` 或 `dev.vars`）

2. 确保文件在正确的目录（`totp-manager/`）

3. 重启 Wrangler 开发服务器：

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
wrangler pages dev dist --local
```

4. 检查文件格式（不要有多余的空格或引号）：

```bash
# 正确格式
HASH_SALT=value

# 错误格式
HASH_SALT = "value"  # 不要有空格和引号
```

---

### 问题 5: CI/CD 部署失败

**错误信息：**
```
Error: Authentication error
```

**解决方案：**

1. 检查 GitHub Secrets 是否正确设置：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

2. 验证 API Token 权限：
   - Account - Cloudflare Pages - Edit
   - Account - D1 - Edit

3. 检查 Token 是否过期：
   - Cloudflare Dashboard → My Profile → API Tokens
   - 查看 Token 状态

4. 重新生成 Token：
   - 创建新的 API Token
   - 更新 GitHub Secrets

---

## 环境变量检查清单

### 本地开发

- [ ] 创建 `.dev.vars` 文件
- [ ] 设置 `HASH_SALT`
- [ ] 设置 `PW_ITERATIONS`（可选）
- [ ] 创建本地 D1 数据库
- [ ] 应用数据库迁移
- [ ] 测试 API 端点

### 生产部署

- [ ] 创建远程 D1 数据库
- [ ] 更新 `wrangler.toml` 中的 `database_id`
- [ ] 使用 `wrangler secret put` 设置 `HASH_SALT`
- [ ] 在 `wrangler.toml` 或 Dashboard 设置 `PW_ITERATIONS`
- [ ] 应用远程数据库迁移
- [ ] 部署应用
- [ ] 验证环境变量生效
- [ ] 测试生产环境功能

### CI/CD

- [ ] 在 GitHub 设置 `CLOUDFLARE_API_TOKEN`
- [ ] 在 GitHub 设置 `CLOUDFLARE_ACCOUNT_ID`
- [ ] 验证 API Token 权限
- [ ] 测试 CI 工作流
- [ ] 测试部署工作流
- [ ] 验证自动部署成功

---

## 相关资源

- [Cloudflare Pages 环境变量文档](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)
- [Wrangler Secret 命令文档](https://developers.cloudflare.com/workers/wrangler/commands/#secret)
- [Cloudflare D1 绑定文档](https://developers.cloudflare.com/d1/platform/bindings/)
- [OWASP 密码存储指南](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Cloudflare API Token 文档](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

---

## 附录：完整配置示例

### wrangler.toml

```toml
name = "totp-manager"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

# D1 数据库绑定
[[d1_databases]]
binding = "DATABASE"
database_name = "totp_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 非敏感环境变量
[vars]
PW_ITERATIONS = "100000"

# 生产环境配置
[env.production]
vars = { PW_ITERATIONS = "150000" }

[[env.production.d1_databases]]
binding = "DATABASE"
database_name = "totp_db_prod"
database_id = "prod-database-id"

# 预览环境配置
[env.preview]
vars = { PW_ITERATIONS = "100000" }

[[env.preview.d1_databases]]
binding = "DATABASE"
database_name = "totp_db_preview"
database_id = "preview-database-id"
```

### .dev.vars（本地开发）

```bash
# 密码哈希盐值
HASH_SALT=local-dev-salt-change-this-in-production

# PBKDF2 迭代次数
PW_ITERATIONS=100000
```

### .env.example（模板）

```bash
# Cloudflare Pages Functions 环境变量示例

# 密码哈希盐值（生产环境必须设置）
# 使用 wrangler secret put HASH_SALT 命令设置
# HASH_SALT=your-secure-random-salt-value

# PBKDF2 迭代次数（默认: 100000）
PW_ITERATIONS=100000

# D1 数据库 ID（从 wrangler d1 create 命令获取）
# DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

**最后更新**：2024-01-08

**维护者**：TOTP Manager 开发团队

**反馈**：如有问题或建议，请提交 Issue 或 Pull Request。
