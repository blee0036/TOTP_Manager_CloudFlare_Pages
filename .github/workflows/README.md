# GitHub Actions Workflows

English | [简体中文](README.zh-CN.md)

This project contains two GitHub Actions workflows for automated testing and deployment.

## Workflows Overview

### CI Workflow (ci.yml)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop` branches

**Steps:**
1. Checkout code
2. Setup Node.js 18 environment
3. Install dependencies
4. Run linter (ESLint)
5. Run type check (TypeScript)
6. Run unit tests
7. Build for production
8. Upload build artifacts (retained for 7 days)

**Purpose:**
- Ensure code quality
- Verify all tests pass
- Verify build succeeds

### Deploy Workflow (deploy.yml)

**Triggers:**
- Push to `main` branch
- Manual trigger (workflow_dispatch)

**Steps:**
1. Checkout code
2. Setup Node.js 18 environment
3. Install dependencies
4. Run tests
5. Build for production
6. Apply database migrations to remote D1 database
7. Deploy to Cloudflare Pages
8. Create deployment summary

**Purpose:**
- Automatically deploy to production
- Automatically apply database migrations
- Generate deployment report

## Configure GitHub Secrets

Before using these workflows, you need to configure the following Secrets in your GitHub repository:

### Required Secrets

1. **CLOUDFLARE_API_TOKEN**
   - Purpose: Authenticate Cloudflare API calls
   - How to get:
     1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
     2. Go to **My Profile** → **API Tokens**
     3. Click **Create Token**
     4. Use **Edit Cloudflare Workers** template
     5. Add permissions:
        - Account - Cloudflare Pages - Edit
        - Account - D1 - Edit
     6. Copy the generated Token

2. **CLOUDFLARE_ACCOUNT_ID**
   - Purpose: Specify Cloudflare account
   - How to get:
     1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
     2. Select any domain
     3. Find **Account ID** in the right sidebar
     4. Copy Account ID

### Configuration Steps

1. Go to GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

## Manual Deployment Trigger

1. Go to GitHub repository
2. Click **Actions** tab
3. Select **Deploy to Cloudflare Pages** workflow
4. Click **Run workflow**
5. Select branch (default main)
6. Click **Run workflow** button

## View Workflow Status

### In Pull Requests

- CI workflow runs automatically
- View check status at bottom of PR page
- Click **Details** to view detailed logs

### In Actions Tab

1. Go to GitHub repository
2. Click **Actions** tab
3. View all workflow run history
4. Click specific run to view detailed logs and steps

## Workflow Badges

Add workflow status badges to README.md:

```markdown
![CI](https://github.com/your-username/your-repo/workflows/CI/badge.svg)
![Deploy](https://github.com/your-username/your-repo/workflows/Deploy%20to%20Cloudflare%20Pages/badge.svg)
```

## Troubleshooting

### Deployment Failed: Database Migration Error

**Issue**: `Error: D1_ERROR: no such database`

**Solution**:
1. Ensure D1 database is created in Cloudflare
2. Ensure `database_id` in `wrangler.toml` is correct
3. Check if `CLOUDFLARE_ACCOUNT_ID` is correct

### Deployment Failed: Permission Error

**Issue**: `Error: Authentication error`

**Solution**:
1. Check if `CLOUDFLARE_API_TOKEN` is correct
2. Ensure API Token has sufficient permissions (Pages Edit, D1 Edit)
3. Check if Token is expired

### Test Failed

**Issue**: CI workflow fails at test step

**Solution**:
1. Run `npm test` locally to ensure tests pass
2. Check test logs to find failure reason
3. Fix tests or code, then push again

### Build Failed

**Issue**: Build step fails

**Solution**:
1. Run `npm run build` locally to ensure build succeeds
2. Check TypeScript type errors
3. Check if dependencies are correctly installed

## Customize Workflows

### Modify Triggers

Edit `.github/workflows/ci.yml` or `deploy.yml`:

```yaml
on:
  push:
    branches: [main, develop, feature/*]  # Add more branches
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Run every Sunday at midnight
```

### Add Notifications

Add notification steps at end of workflow:

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

### Add Environment Variables

Add environment variables in deployment step:

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

## Best Practices

1. **Protect Main Branch**: Enable branch protection in GitHub settings, require CI to pass before merging
2. **Code Review**: Require at least one reviewer to approve PR
3. **Auto Deploy**: Only auto-deploy on main branch, manually trigger for other branches
4. **Environment Isolation**: Use different Cloudflare projects for development and production
5. **Monitor Logs**: Regularly check workflow logs to identify issues early
6. **Version Tags**: Create Git tags for important releases
7. **Rollback Plan**: Keep previous deployment versions for quick rollback

## Related Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Pages Deployment Documentation](https://developers.cloudflare.com/pages/platform/deploy-hooks/)
- [Wrangler Action](https://github.com/cloudflare/wrangler-action)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
