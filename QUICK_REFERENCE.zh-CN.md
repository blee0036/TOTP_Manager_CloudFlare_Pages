# 快速参考卡片

[English](QUICK_REFERENCE.md) | 简体中文

## 环境变量速查表

| 变量名 | 必需 | 默认值 | 设置方法 | 说明 |
|--------|------|--------|----------|------|
| `HASH_SALT` | ✅ 是 | 无 | `wrangler secret put` | 密码哈希盐值 |
| `PW_ITERATIONS` | ❌ 否 | `100000` | `wrangler.toml` 或 Dashboard | PBKDF2 迭代次数 |
| `DATABASE` | ✅ 是 | 无 | `wrangler.toml` 绑定 | D1 数据库绑定 |

## 常用命令

### 本地开发

```bash
# 安装依赖
npm install

# 创建本地数据库
npm run db:create

# 应用迁移
npm run db:migrate:local

# 启动开发服务器
npm run dev

# 启动 Wrangler（测试 Functions）
wrangler pages dev dist --local
```

### 数据库管理

```bash
# 创建数据库
wrangler d1 create totp_db

# 应用迁移（本地）
npm run db:migrate:local

# 应用迁移（远程）
npm run db:migrate:remote

# 查看迁移列表
npm run db:list:local
npm run db:list:remote

# 执行 SQL 查询
npm run db:query:local -- --command "SELECT * FROM users"
npm run db:query:remote -- --command "SELECT COUNT(*) FROM users"
```

### 环境变量设置

```bash
# 生成随机盐值
openssl rand -hex 32

# 设置密钥
wrangler secret put HASH_SALT

# 列出密钥
wrangler secret list

# 删除密钥
wrangler secret delete HASH_SALT
```

### 构建和部署

```bash
# 构建
npm run build

# 预览构建
npm run preview

# 一键部署（构建 + 迁移 + 部署）
npm run deploy

# 手动部署
wrangler pages deploy dist
```

### 测试

```bash
# 运行所有测试
npm test

# 运行测试（单次）
npm test -- --run

# 生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

### 代码质量

```bash
# 运行 linter
npm run lint

# 自动修复
npm run lint:fix

# 类型检查
npx vue-tsc --noEmit
```

## 首次部署检查清单

### 准备工作

- [ ] 安装 Node.js 18+
- [ ] 安装 Wrangler CLI: `npm install -g wrangler`
- [ ] 登录 Cloudflare: `wrangler login`
- [ ] 克隆仓库并安装依赖

### 数据库设置

- [ ] 创建 D1 数据库: `wrangler d1 create totp_db`
- [ ] 复制数据库配置到 `wrangler.toml`
- [ ] 应用迁移: `npm run db:migrate:remote`

### 环境变量

- [ ] 生成盐值: `openssl rand -hex 32`
- [ ] 设置 HASH_SALT: `wrangler secret put HASH_SALT`
- [ ] 设置 PW_ITERATIONS（可选）

### 部署

- [ ] 构建应用: `npm run build`
- [ ] 部署: `wrangler pages deploy dist`
- [ ] 验证部署成功
- [ ] 测试功能

### CI/CD（可选）

- [ ] 在 GitHub 设置 `CLOUDFLARE_API_TOKEN`
- [ ] 在 GitHub 设置 `CLOUDFLARE_ACCOUNT_ID`
- [ ] 推送代码触发自动部署
- [ ] 验证 CI/CD 工作流

## 故障排除速查

| 问题 | 解决方案 |
|------|----------|
| `HASH_SALT is not set` | `wrangler secret put HASH_SALT` |
| `D1_ERROR: no such table` | `npm run db:migrate:local` 或 `npm run db:migrate:remote` |
| `no such database` | 检查 `wrangler.toml` 中的 `database_id` |
| 环境变量未生效 | 重新部署: `npm run deploy` |
| `.dev.vars` 不加载 | 重启 Wrangler: `wrangler pages dev dist --local` |
| CI/CD 认证失败 | 检查 GitHub Secrets 和 API Token 权限 |

## API 端点速查

### 认证 API

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/logout` | 用户登出 |
| GET | `/api/auth/me` | 获取当前用户 |

### 密钥管理 API

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/keys` | 获取所有密钥 |
| POST | `/api/keys` | 添加新密钥 |
| PUT | `/api/keys/:id` | 更新密钥备注 |
| DELETE | `/api/keys/:id` | 删除密钥 |

## 项目结构速查

```
totp-manager/
├── src/                    # 前端源代码
│   ├── views/              # 页面组件
│   ├── components/         # 可复用组件
│   ├── stores/             # Pinia 状态管理
│   ├── composables/        # 组合式函数
│   ├── utils/              # 工具函数
│   └── i18n/               # 国际化
├── functions/              # Cloudflare Pages Functions
│   ├── api/                # API 端点
│   └── utils/              # 后端工具
├── migrations/             # 数据库迁移
├── .github/workflows/      # CI/CD 工作流
└── public/                 # 静态资源
```

## 支持的语言

🌍 18 种语言：en, zh-CN, zh-TW, ja, ko, fr, de, es, pt, ru, it, nl, pl, tr, ar, id, th, vi

## 相关文档

- 📖 [README.md](README.md) - 项目介绍和使用指南
- 🔧 [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - 环境变量详细文档
- 🚀 [.github/workflows/README.md](.github/workflows/README.md) - CI/CD 工作流文档
- 📋 [.env.example](.env.example) - 环境变量模板

## 获取帮助

- 📝 提交 Issue
- 💬 查看文档
- 🔍 搜索已知问题
- 📧 联系维护者
