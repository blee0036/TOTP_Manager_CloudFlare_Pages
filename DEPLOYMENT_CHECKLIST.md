# 部署验证清单 (Deployment Checklist)

本文档提供了部署到 Cloudflare Pages 的完整验证清单。

## 部署前检查 (Pre-Deployment Checks)

### ✅ 1. 代码质量检查

- [x] 所有测试通过 (87/87 tests passed)
  ```bash
  npm test
  ```

- [x] 构建成功，无错误
  ```bash
  npm run build
  ```

- [x] TypeScript 类型检查通过
  ```bash
  vue-tsc -b
  ```

### ✅ 2. 配置文件检查

- [x] `wrangler.toml` 配置正确
  - [x] `pages_build_output_dir = "dist"`
  - [x] D1 数据库绑定配置
  - [x] 环境变量配置

- [x] `_routes.json` 配置正确
  - [x] API 路由 (`/api/*`) 使用 Functions
  - [x] 其他路由 (`/*`) 使用静态资源

- [x] `.env.example` 文档完整
  - [x] 所有必需的环境变量已记录

### ✅ 3. 数据库准备

- [ ] D1 数据库已创建
  ```bash
  npm run db:create
  ```

- [ ] `wrangler.toml` 中的 `database_id` 已更新

- [ ] 数据库迁移文件存在
  - [x] `migrations/0001_initial_schema.sql`

### ✅ 4. 构建输出验证

- [x] `dist/` 目录包含所有必要文件
  - [x] `index.html`
  - [x] `_routes.json` (需要复制)
  - [x] JavaScript bundles (代码分割)
  - [x] CSS 文件
  - [x] Favicon 和图标
  - [x] Service Worker (`sw.js`)
  - [x] Web App Manifest

- [x] 代码分割正常工作
  - [x] Vue vendor bundle
  - [x] Vuetify vendor bundle
  - [x] i18n vendor bundle
  - [x] 语言文件懒加载 (18 种语言)

## 部署步骤 (Deployment Steps)

### 步骤 1: 设置环境变量

**首次部署时需要设置密钥：**

```bash
# 设置密码哈希盐值（生成随机值）
wrangler secret put HASH_SALT
# 输入: $(openssl rand -base64 32) 的输出
```

**环境变量已在 `wrangler.toml` 中配置：**
- `PW_ITERATIONS = "100000"`

### 步骤 2: 应用数据库迁移

**⚠️ 重要：在部署应用之前先应用迁移**

```bash
# 本地测试（可选）
npm run db:migrate:local

# 生产环境
npm run db:migrate:remote
```

验证迁移成功：
```bash
npm run db:query:remote -- --command "SELECT name FROM sqlite_master WHERE type='table'"
```

预期输出：
- `users`
- `totp_keys`
- `d1_migrations`

### 步骤 3: 复制路由配置

**确保 `_routes.json` 在构建输出中：**

```bash
# Windows
copy _routes.json dist\_routes.json

# Linux/Mac
cp _routes.json dist/_routes.json
```

### 步骤 4: 部署到 Cloudflare Pages

**方式 1: 使用 npm 脚本（推荐）**

```bash
npm run deploy
```

这会自动执行：
1. `npm run build` - 构建前端
2. `npm run db:migrate:remote` - 应用数据库迁移
3. `wrangler pages deploy dist` - 部署到 Cloudflare Pages

**方式 2: 手动部署**

```bash
# 1. 构建
npm run build

# 2. 复制路由配置
copy _routes.json dist\_routes.json

# 3. 应用迁移
npm run db:migrate:remote

# 4. 部署
wrangler pages deploy dist
```

**方式 3: 通过 Cloudflare Dashboard**

1. 登录 Cloudflare Dashboard
2. 进入 Pages 项目
3. 连接 Git 仓库
4. 配置构建设置：
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `totp-manager`
5. 设置环境变量（在 Settings > Environment variables）
6. 触发部署

## 部署后验证 (Post-Deployment Verification)

### ✅ 1. 基础功能验证

访问部署的 URL（例如：`https://totp-manager.pages.dev`）

- [ ] **首页加载**
  - [ ] 页面正常显示
  - [ ] Material Design 样式正确
  - [ ] 无控制台错误

- [ ] **语言切换**
  - [ ] 语言选择器显示 18 种语言
  - [ ] 切换语言后界面文本更新
  - [ ] 阿拉伯语切换到 RTL 布局
  - [ ] 语言偏好保存到 LocalStorage

- [ ] **主题切换**
  - [ ] 明暗主题切换正常
  - [ ] 主题偏好保存到 LocalStorage
  - [ ] 自动主题检测工作正常

### ✅ 2. 临时模式验证（无需登录）

- [ ] **添加密钥**
  - [ ] 输入纯 Base32 密钥成功
  - [ ] 输入带空格的密钥自动规范化
  - [ ] 输入 otpauth:// URI 自动解析
  - [ ] 上传二维码图片自动填充
  - [ ] 备注必填验证工作
  - [ ] 密钥保存到 LocalStorage

- [ ] **查看令牌**
  - [ ] TOTP 令牌正确生成（6 位数字）
  - [ ] 倒计时进度条正常更新
  - [ ] 令牌每 30 秒自动刷新
  - [ ] 复制令牌功能正常
  - [ ] 搜索过滤功能正常

- [ ] **管理密钥**
  - [ ] 显示所有本地密钥
  - [ ] 编辑备注功能正常
  - [ ] 删除确认对话框显示
  - [ ] 删除后密钥从列表移除

### ✅ 3. 用户认证验证

- [ ] **注册功能**
  - [ ] 用户名长度验证（≥3）
  - [ ] 密码长度验证（≥6）
  - [ ] 注册成功后自动登录
  - [ ] 用户名重复时显示错误
  - [ ] API 调用 `/api/auth/register`

- [ ] **登录功能**
  - [ ] 正确的用户名和密码登录成功
  - [ ] 错误的凭据显示错误消息
  - [ ] 登录后设置会话 Cookie
  - [ ] 登录后重定向到令牌页面
  - [ ] API 调用 `/api/auth/login`

- [ ] **登出功能**
  - [ ] 登出后清除会话
  - [ ] 登出后重定向到登录页面
  - [ ] API 调用 `/api/auth/logout`

- [ ] **会话管理**
  - [ ] 刷新页面后会话保持
  - [ ] 会话过期后自动登出
  - [ ] 未登录时访问受保护页面重定向

### ✅ 4. 数据库功能验证

- [ ] **密钥 CRUD 操作**
  - [ ] 添加密钥到数据库
    - API: `POST /api/keys`
    - 验证备注必填
    - 验证 Base32 格式
  
  - [ ] 获取用户的所有密钥
    - API: `GET /api/keys`
    - 仅返回当前用户的密钥
  
  - [ ] 更新密钥备注
    - API: `PUT /api/keys/:id`
    - 验证备注不为空
    - 仅允许更新自己的密钥
  
  - [ ] 删除密钥
    - API: `DELETE /api/keys/:id`
    - 仅允许删除自己的密钥

- [ ] **数据隔离**
  - [ ] 用户 A 看不到用户 B 的密钥
  - [ ] 用户 A 无法修改用户 B 的密钥
  - [ ] 用户 A 无法删除用户 B 的密钥

### ✅ 5. 性能验证

- [ ] **加载性能**
  - [ ] 首屏加载时间 < 3 秒
  - [ ] Lighthouse Performance Score > 90
  - [ ] 代码分割正常工作
  - [ ] 语言文件懒加载

- [ ] **Service Worker**
  - [ ] Service Worker 注册成功
  - [ ] 离线访问功能正常
  - [ ] 静态资源缓存工作
  - [ ] API 请求使用网络优先策略

- [ ] **PWA 功能**
  - [ ] 可以添加到主屏幕
  - [ ] Web App Manifest 正确
  - [ ] 图标显示正常

### ✅ 6. 安全性验证

- [ ] **HTTP 安全头**
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-XSS-Protection: 1; mode=block`
  - [ ] `Content-Security-Policy` 设置
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`

- [ ] **Cookie 安全**
  - [ ] 会话 Cookie 设置 `HttpOnly`
  - [ ] 会话 Cookie 设置 `Secure`
  - [ ] 会话 Cookie 设置 `SameSite=Lax`

- [ ] **密码安全**
  - [ ] 密码使用 PBKDF2-SHA256 哈希
  - [ ] 迭代次数 ≥ 100000
  - [ ] 使用环境变量中的盐值

- [ ] **输入验证**
  - [ ] 所有用户输入经过验证
  - [ ] XSS 防护正常工作
  - [ ] SQL 注入防护（使用参数化查询）

### ✅ 7. 国际化验证

测试所有 18 种语言：

- [ ] 英语 (en)
- [ ] 简体中文 (zh-CN)
- [ ] 繁体中文 (zh-TW)
- [ ] 日语 (ja)
- [ ] 韩语 (ko)
- [ ] 法语 (fr)
- [ ] 德语 (de)
- [ ] 西班牙语 (es)
- [ ] 葡萄牙语 (pt)
- [ ] 俄语 (ru)
- [ ] 意大利语 (it)
- [ ] 荷兰语 (nl)
- [ ] 波兰语 (pl)
- [ ] 土耳其语 (tr)
- [ ] 阿拉伯语 (ar) - 验证 RTL 布局
- [ ] 印尼语 (id)
- [ ] 泰语 (th)
- [ ] 越南语 (vi)

每种语言验证：
- [ ] 所有界面文本正确翻译
- [ ] 字体渲染正常
- [ ] 布局不破坏

### ✅ 8. 跨浏览器验证

- [ ] **桌面浏览器**
  - [ ] Chrome/Edge (Chromium)
  - [ ] Firefox
  - [ ] Safari

- [ ] **移动浏览器**
  - [ ] Chrome Mobile (Android)
  - [ ] Safari Mobile (iOS)
  - [ ] Firefox Mobile

验证项目：
- [ ] 所有功能正常工作
- [ ] 响应式布局正确
- [ ] 触摸交互正常
- [ ] 二维码上传功能正常

### ✅ 9. 错误处理验证

- [ ] **网络错误**
  - [ ] 断网时显示离线提示
  - [ ] API 请求失败显示错误消息
  - [ ] 超时处理正常

- [ ] **输入错误**
  - [ ] 无效密钥格式显示具体错误
  - [ ] 空备注显示验证错误
  - [ ] 表单验证消息清晰

- [ ] **API 错误**
  - [ ] 401 错误重定向到登录
  - [ ] 404 错误显示友好消息
  - [ ] 500 错误显示通用错误消息

## 监控和日志 (Monitoring and Logs)

### Cloudflare Dashboard

1. **Pages 项目监控**
   - 访问量统计
   - 错误率
   - 响应时间

2. **D1 数据库监控**
   - 查询次数
   - 存储使用量
   - 错误日志

3. **Functions 日志**
   - 查看 API 调用日志
   - 检查错误堆栈
   - 监控性能

### 日志查看命令

```bash
# 查看 Pages 部署日志
wrangler pages deployment list

# 查看 Functions 日志（实时）
wrangler pages deployment tail

# 查看 D1 数据库统计
wrangler d1 info totp_db
```

## 回滚计划 (Rollback Plan)

如果部署出现问题：

### 方式 1: Cloudflare Dashboard 回滚

1. 进入 Pages 项目
2. 点击 "Deployments"
3. 找到上一个稳定版本
4. 点击 "Rollback to this deployment"

### 方式 2: 重新部署上一个版本

```bash
# 切换到上一个 Git 提交
git checkout <previous-commit-hash>

# 重新部署
npm run deploy

# 返回最新代码
git checkout main
```

### 数据库回滚

如果需要回滚数据库迁移：

1. 创建回滚迁移文件
2. 应用回滚迁移
3. 验证数据完整性

**⚠️ 注意：数据库回滚可能导致数据丢失，请谨慎操作！**

## 常见问题 (Troubleshooting)

### 问题 1: 构建失败

**症状：** `npm run build` 失败

**解决方案：**
```bash
# 清理缓存
rm -rf node_modules dist
npm install
npm run build
```

### 问题 2: API 调用 404

**症状：** 前端调用 API 返回 404

**可能原因：**
- `_routes.json` 未复制到 `dist/` 目录
- Functions 文件路径不正确

**解决方案：**
```bash
# 确保 _routes.json 在 dist 目录
copy _routes.json dist\_routes.json
wrangler pages deploy dist
```

### 问题 3: 数据库连接失败

**症状：** API 返回数据库错误

**可能原因：**
- `database_id` 配置错误
- 数据库未创建
- 迁移未应用

**解决方案：**
```bash
# 验证数据库存在
wrangler d1 list

# 应用迁移
npm run db:migrate:remote

# 验证表结构
npm run db:query:remote -- --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### 问题 4: 环境变量未生效

**症状：** 密码哈希失败或使用默认值

**解决方案：**
```bash
# 设置密钥
wrangler secret put HASH_SALT

# 验证环境变量
wrangler pages deployment list
# 在 Dashboard 中检查 Environment variables
```

### 问题 5: Service Worker 缓存问题

**症状：** 更新后仍显示旧版本

**解决方案：**
1. 清除浏览器缓存
2. 硬刷新（Ctrl+Shift+R）
3. 注销并重新注册 Service Worker

```javascript
// 在浏览器控制台执行
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
```

## 性能优化建议

### 1. 启用 Cloudflare 缓存

在 Cloudflare Dashboard 中：
- 启用 Auto Minify (JS, CSS, HTML)
- 启用 Brotli 压缩
- 配置 Browser Cache TTL

### 2. 优化图片

```bash
# 使用 sharp 优化图标
npm run generate:favicons
```

### 3. 监控性能

使用 Lighthouse 定期检查：
```bash
# 安装 Lighthouse CLI
npm install -g lighthouse

# 运行性能测试
lighthouse https://your-domain.pages.dev --view
```

## 总结

完成以上所有验证项后，部署即可视为成功。建议：

1. **定期备份数据库**
2. **监控错误日志**
3. **定期更新依赖**
4. **进行安全审计**
5. **收集用户反馈**

---

**部署日期：** _____________

**部署人员：** _____________

**版本号：** _____________

**备注：** _____________
