# GitHub Actions 工作流

[English](README.md) | 简体中文

本项目包含两个 GitHub Actions 工作流，用于自动化测试和部署。

## 工作流说明

### CI 工作流 (ci.yml)

**触发条件：**
- 推送到 `main` 或 `develop` 分支
- 针对 `main` 或 `develop` 分支的 Pull Request

**执行步骤：**
1. 检出代码
2. 设置 Node.js 18 环境
3. 安装依赖
4. 运行代码检查（ESLint）
5. 运行类型检查（TypeScript）
6. 运行单元测试
7. 构建生产版本
8. 上传构建产物（保留 7 天）

**用途：**
- 确保代码质量
- 验证所有测试通过
- 验证构建成功

### Deploy 工作流 (deploy.yml)

**触发条件：**
- 推送到 `main` 分支
- 手动触发（workflow_dispatch）

**执行步骤：**
1. 检出代码
2. 设置 Node.js 18 环境
3. 安装依赖
4. 运行测试
5. 构建生产版本
6. 应用数据库迁移到远程 D1 数据库
7. 部署到 Cloudflare Pages
8. 创建部署摘要

**用途：**
- 自动部署到生产环境
- 自动应用数据库迁移
- 生成部署报告

## 配置 GitHub Secrets

在使用这些工作流之前，需要在 GitHub 仓库中配置以下 Secrets：

### 必需的 Secrets

1. **CLOUDFLARE_API_TOKEN**
   - 用途：认证 Cloudflare API 调用
   - 获取方式：
     1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
     2. 进入 **My Profile** → **API Tokens**
     3. 点击 **Create Token**
     4. 使用 **Edit Cloudflare Workers** 模板
     5. 添加权限：
        - Account - Cloudflare Pages - Edit
        - Account - D1 - Edit
     6. 复制生成的 Token

2. **CLOUDFLARE_ACCOUNT_ID**
   - 用途：指定 Cloudflare 账户
   - 获取方式：
     1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
     2. 选择任意域名
     3. 在右侧边栏找到 **Account ID**
     4. 复制 Account ID

### 配置步骤

1. 进入 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`

## 手动触发部署

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 选择 **Deploy to Cloudflare Pages** 工作流
4. 点击 **Run workflow**
5. 选择分支（默认 main）
6. 点击 **Run workflow** 按钮

## 查看工作流状态

### 在 Pull Request 中

- CI 工作流会自动运行
- 在 PR 页面底部查看检查状态
- 点击 **Details** 查看详细日志

### 在 Actions 标签中

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看所有工作流运行历史
4. 点击具体运行查看详细日志和步骤

## 工作流徽章

在 README.md 中添加工作流状态徽章：

```markdown
![CI](https://github.com/blee0036/TOTP_Manager_CloudFlare_Pages/workflows/CI/badge.svg)
![Deploy](https://github.com/blee0036/TOTP_Manager_CloudFlare_Pages/workflows/Deploy%20to%20Cloudflare%20Pages/badge.svg)
```

## 故障排除

### 部署失败：数据库迁移错误

**问题**：`Error: D1_ERROR: no such database`

**解决方案**：
1. 确保已在 Cloudflare 创建 D1 数据库
2. 确保 `wrangler.toml` 中的 `database_id` 正确
3. 检查 `CLOUDFLARE_ACCOUNT_ID` 是否正确

### 部署失败：权限错误

**问题**：`Error: Authentication error`

**解决方案**：
1. 检查 `CLOUDFLARE_API_TOKEN` 是否正确
2. 确保 API Token 有足够的权限（Pages Edit, D1 Edit）
3. 检查 Token 是否过期

### 测试失败

**问题**：CI 工作流在测试步骤失败

**解决方案**：
1. 在本地运行 `npm test` 确保测试通过
2. 检查测试日志找出失败原因
3. 修复测试或代码后重新推送

### 构建失败

**问题**：构建步骤失败

**解决方案**：
1. 在本地运行 `npm run build` 确保构建成功
2. 检查 TypeScript 类型错误
3. 检查依赖是否正确安装

## 自定义工作流

### 修改触发条件

编辑 `.github/workflows/ci.yml` 或 `deploy.yml`：

```yaml
on:
  push:
    branches: [main, develop, feature/*]  # 添加更多分支
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # 每周日午夜运行
```

### 添加通知

在工作流末尾添加通知步骤：

```yaml
- name: Notify on success
  if: success()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
      -H 'Content-Type: application/json' \
      -d '{"text":"Deployment successful!"}'

- name: Notify on failure
  if: failure()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
      -H 'Content-Type: application/json' \
      -d '{"text":"Deployment failed!"}'
```

### 添加环境变量

在部署步骤中添加环境变量：

```yaml
- name: Deploy to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy dist --project-name=totp-manager
  env:
    NODE_ENV: production
    CUSTOM_VAR: ${{ secrets.CUSTOM_VAR }}
```

## 最佳实践

1. **保护主分支**：在 GitHub 设置中启用分支保护，要求 CI 通过才能合并
2. **代码审查**：要求至少一个审查者批准 PR
3. **自动部署**：仅在 main 分支自动部署，其他分支手动触发
4. **环境隔离**：使用不同的 Cloudflare 项目用于开发和生产
5. **监控日志**：定期检查工作流日志，及时发现问题
6. **版本标签**：在重要发布时创建 Git 标签
7. **回滚计划**：保留之前的部署版本，以便快速回滚

## 相关资源

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Cloudflare Pages 部署文档](https://developers.cloudflare.com/pages/platform/deploy-hooks/)
- [Wrangler Action](https://github.com/cloudflare/wrangler-action)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
