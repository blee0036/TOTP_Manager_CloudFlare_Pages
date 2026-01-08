# Environment Variables Configuration

English | [简体中文](ENVIRONMENT_VARIABLES.zh-CN.md)

This document details all environment variables required for the TOTP Manager application, configuration methods, and example values.

## Table of Contents

- [Environment Variables List](#environment-variables-list)
- [Configuration Methods](#configuration-methods)
- [Local Development Setup](#local-development-setup)
- [Production Environment Setup](#production-environment-setup)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Environment Variables List

### Required Environment Variables

#### HASH_SALT

- **Description**: Password hash salt for PBKDF2-SHA256 password hashing
- **Type**: String (secret)
- **Required**: Yes
- **Default**: None (must be set in production)
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
- **Security Level**: Highly sensitive
- **Configuration Location**: Cloudflare Secret (do not store in plain text in code or config files)
- **Related Requirements**: Requirements 2.1, 5.1, 13.1

**Generation Methods:**

```bash
# Using OpenSSL to generate random salt
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Setup Method:**

```bash
# Using Wrangler CLI (recommended)
wrangler secret put HASH_SALT
# Then enter the generated salt

# Or set in Cloudflare Dashboard
# Pages project → Settings → Environment variables → Add variable
```

---

#### DATABASE (D1 Binding)

- **Description**: Cloudflare D1 database binding
- **Type**: D1 database binding
- **Required**: Yes
- **Configuration Location**: `wrangler.toml`
- **Related Requirements**: Requirements 2.1, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6

**Configuration Method:**

1. Create D1 database:

```bash
wrangler d1 create totp_db
```

2. Add the output configuration to `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DATABASE"
database_name = "totp_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

3. Bind in Cloudflare Dashboard:
   - Pages project → Settings → Functions → D1 database bindings
   - Variable name: `DATABASE`
   - D1 database: Select your database

---

### Optional Environment Variables

#### PW_ITERATIONS

- **Description**: PBKDF2 password hash iteration count
- **Type**: Number (string format)
- **Required**: No
- **Default**: `100000`
- **Recommended**: `100000` - `600000`
- **Example**: `100000`
- **Security Level**: Medium
- **Configuration Location**: `wrangler.toml` `[vars]` section or Cloudflare Dashboard
- **Related Requirements**: Requirements 2.2, 5.1, 13.1

**Notes:**
- Higher iteration counts provide better security but increase CPU usage
- OWASP recommends minimum 100,000 iterations
- Adjust based on server performance, ensure response time is acceptable

**Configuration Method:**

In `wrangler.toml`:

```toml
[vars]
PW_ITERATIONS = "100000"
```

Or in Cloudflare Dashboard:
- Pages project → Settings → Environment variables
- Add variable: `PW_ITERATIONS` = `100000`

---

#### SESSION_SECRET

- **Description**: Session token signing key (currently unused, reserved for future enhancement)
- **Type**: String (secret)
- **Required**: No
- **Default**: None
- **Example**: `session-secret-key-change-in-production`
- **Security Level**: Highly sensitive
- **Configuration Location**: Cloudflare Secret

**Note**: Current version uses simplified session management (username as token), future versions may use this key for JWT signing.

---

## Configuration Methods

### Method 1: Wrangler CLI (Recommended for Secrets)

**Advantages:**
- Secrets stored encrypted
- Won't appear in code or logs
- Supports local and remote environments

**Setting Secrets:**

```bash
# Set secret (will prompt for value)
wrangler secret put HASH_SALT

# List all secrets (doesn't show values)
wrangler secret list

# Delete secret
wrangler secret delete HASH_SALT
```

---

### Method 2: wrangler.toml Configuration File (For Non-Sensitive Config)

**Advantages:**
- Version controlled
- Easy to share with team
- Supports different environment configurations

**Disadvantages:**
- Not suitable for storing secrets
- Will be committed to Git

**Configuration Example:**

```toml
name = "totp-manager"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

# D1 database binding
[[d1_databases]]
binding = "DATABASE"
database_name = "totp_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Non-sensitive environment variables
[vars]
PW_ITERATIONS = "100000"

# Production environment config
[env.production]
vars = { PW_ITERATIONS = "150000" }

# Development environment config
[env.development]
vars = { PW_ITERATIONS = "100000" }
```

---

### Method 3: Cloudflare Dashboard (For Manual Configuration)

**Advantages:**
- Graphical interface, easy to use
- Supports encrypted variables
- Can set different values for different environments

**Steps:**

1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Pages** → Select project
3. Click **Settings** → **Environment variables**
4. Click **Add variable**
5. Enter variable name and value
6. Select environment (Production / Preview)
7. Click **Save**
8. Redeploy project for changes to take effect

**Setting Encrypted Variables:**
- Check **Encrypt** option
- Encrypted variable values won't be displayed in Dashboard

---

### Method 4: .dev.vars File (Local Development Only)

**Advantages:**
- Convenient for local development
- Automatically loaded
- Not committed to Git (already in .gitignore)

**Disadvantages:**
- Only for local development
- Not suitable for production

**Create .dev.vars file:**

```bash
# Create .dev.vars in totp-manager directory
cat > .dev.vars << EOF
HASH_SALT=local-dev-salt-not-for-production
PW_ITERATIONS=100000
EOF
```

**Note:**
- `.dev.vars` file is in `.gitignore`, won't be committed
- Only automatically loaded when running `wrangler pages dev`
- Do not use this file in production

---

## Local Development Setup

### Step 1: Create Local Database

```bash
# Create database
wrangler d1 create totp_db

# Apply migrations
npm run db:migrate:local
```

### Step 2: Configure Environment Variables

**Option A: Using .dev.vars file (recommended)**

```bash
# Create .dev.vars file
cat > .dev.vars << EOF
HASH_SALT=local-dev-salt-change-this
PW_ITERATIONS=100000
EOF
```

**Option B: Using wrangler secret (local)**

```bash
# Set local secret
wrangler secret put HASH_SALT --local
```

### Step 3: Start Development Server

```bash
# Start Vite development server
npm run dev

# In another terminal, start Wrangler (for testing Functions)
wrangler pages dev dist --local
```

### Verify Configuration

```bash
# Test registration API
curl -X POST http://localhost:8788/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# Should return success response
```

---

## Production Environment Setup

### First Deployment

#### Step 1: Create D1 Database

```bash
wrangler d1 create totp_db
```

Copy the output configuration to `wrangler.toml`.

#### Step 2: Set Environment Variables

```bash
# Generate secure salt
SALT=$(openssl rand -hex 32)
echo "Generated HASH_SALT: $SALT"

# Set secret
wrangler secret put HASH_SALT
# Paste the generated salt above
```

#### Step 3: Apply Database Migrations

```bash
npm run db:migrate:remote
```

#### Step 4: Deploy Application

```bash
npm run deploy
```

### Updating Environment Variables

```bash
# Update secret
wrangler secret put HASH_SALT

# Or update in Dashboard
# Pages → Settings → Environment variables → Edit
```

**Note**: After updating environment variables, you need to redeploy.

### Multi-Environment Configuration

**Production Environment:**

```toml
[env.production]
vars = { PW_ITERATIONS = "150000" }

[[env.production.d1_databases]]
binding = "DATABASE"
database_name = "totp_db_prod"
database_id = "prod-database-id"
```

**Preview Environment:**

```toml
[env.preview]
vars = { PW_ITERATIONS = "100000" }

[[env.preview.d1_databases]]
binding = "DATABASE"
database_name = "totp_db_preview"
database_id = "preview-database-id"
```

**Deploy to Specific Environment:**

```bash
# Deploy to production
wrangler pages deploy dist --env production

# Deploy to preview
wrangler pages deploy dist --env preview
```

---

## Security Best Practices

### 1. Secret Management

✅ **Should Do:**
- Use strong random salt (at least 32 bytes)
- Use `wrangler secret` or Cloudflare Dashboard encrypted variables
- Use different secrets for different environments
- Rotate secrets regularly (recommended every 90 days)
- Limit access permissions (only necessary personnel)

❌ **Should Not Do:**
- Hardcode secrets in code
- Commit secrets to Git
- Print secrets in logs
- Use default values in production
- Share secrets with others (use secret management system)

### 2. Iteration Count Configuration

- **Development Environment**: 100,000 iterations (fast testing)
- **Production Environment**: 150,000 - 600,000 iterations (adjust based on performance)
- **Monitoring**: Regularly check response times, ensure within acceptable range

### 3. Environment Isolation

- Use different databases for development, preview, production environments
- Set independent secrets for each environment
- Use Cloudflare's environment variable scoping feature

### 4. Access Control

- Use Cloudflare API Token instead of Global API Key
- Create dedicated API Token for CI/CD with only necessary permissions
- Regularly review and revoke unused Tokens

### 5. Audit and Monitoring

- Enable Cloudflare audit logs
- Monitor environment variable changes
- Record secret rotation history
- Set up alert notifications

---

## Troubleshooting

### Issue 1: HASH_SALT Not Set

**Error Message:**
```
Error: HASH_SALT is not set
```

**Solution:**

```bash
# Check if secret exists
wrangler secret list

# If doesn't exist, set secret
wrangler secret put HASH_SALT

# Or create .dev.vars for local development
echo "HASH_SALT=local-dev-salt" > .dev.vars
```

---

### Issue 2: Database Connection Failed

**Error Message:**
```
Error: D1_ERROR: no such database
```

**Solution:**

1. Check database configuration in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DATABASE"
database_name = "totp_db"
database_id = "your-actual-database-id"
```

2. Ensure database is created:

```bash
wrangler d1 list
```

3. If database doesn't exist, create it:

```bash
wrangler d1 create totp_db
```

4. Apply migrations:

```bash
npm run db:migrate:local  # Local
npm run db:migrate:remote # Remote
```

---

### Issue 3: Environment Variables Not Taking Effect

**Symptom**: After updating environment variables, application still uses old values

**Solution:**

1. Redeploy application:

```bash
npm run deploy
```

2. Clear Cloudflare cache:
   - Dashboard → Pages → Project → Deployments
   - Click **...** on latest deployment → **Retry deployment**

3. Verify environment variables:

```bash
# Print environment variables in Function (for debugging only)
console.log('PW_ITERATIONS:', env.PW_ITERATIONS);
```

**Note**: Do not print sensitive information in production!

---

### Issue 4: Local Development Environment Variables Not Loading

**Symptom**: `.dev.vars` file exists but variables not loaded

**Solution:**

1. Ensure filename is correct: `.dev.vars` (not `.env` or `dev.vars`)

2. Ensure file is in correct directory (`totp-manager/`)

3. Restart Wrangler development server:

```bash
# Stop current server (Ctrl+C)
# Restart
wrangler pages dev dist --local
```

4. Check file format (no extra spaces or quotes):

```bash
# Correct format
HASH_SALT=value

# Incorrect format
HASH_SALT = "value"  # No spaces and quotes
```

---

### Issue 5: CI/CD Deployment Failed

**Error Message:**
```
Error: Authentication error
```

**Solution:**

1. Check if GitHub Secrets are correctly set:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

2. Verify API Token permissions:
   - Account - Cloudflare Pages - Edit
   - Account - D1 - Edit

3. Check if Token is expired:
   - Cloudflare Dashboard → My Profile → API Tokens
   - Check Token status

4. Regenerate Token:
   - Create new API Token
   - Update GitHub Secrets

---

## Environment Variables Checklist

### Local Development

- [ ] Create `.dev.vars` file
- [ ] Set `HASH_SALT`
- [ ] Set `PW_ITERATIONS` (optional)
- [ ] Create local D1 database
- [ ] Apply database migrations
- [ ] Test API endpoints

### Production Deployment

- [ ] Create remote D1 database
- [ ] Update `database_id` in `wrangler.toml`
- [ ] Set `HASH_SALT` using `wrangler secret put`
- [ ] Set `PW_ITERATIONS` in `wrangler.toml` or Dashboard
- [ ] Apply remote database migrations
- [ ] Deploy application
- [ ] Verify environment variables are effective
- [ ] Test production environment functionality

### CI/CD

- [ ] Set `CLOUDFLARE_API_TOKEN` in GitHub
- [ ] Set `CLOUDFLARE_ACCOUNT_ID` in GitHub
- [ ] Verify API Token permissions
- [ ] Test CI workflow
- [ ] Test deployment workflow
- [ ] Verify automatic deployment success

---

## Related Resources

- [Cloudflare Pages Environment Variables Documentation](https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables)
- [Wrangler Secret Command Documentation](https://developers.cloudflare.com/workers/wrangler/commands/#secret)
- [Cloudflare D1 Bindings Documentation](https://developers.cloudflare.com/d1/platform/bindings/)
- [OWASP Password Storage Guide](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Cloudflare API Token Documentation](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

---

## Appendix: Complete Configuration Example

### wrangler.toml

```toml
name = "totp-manager"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

# D1 database binding
[[d1_databases]]
binding = "DATABASE"
database_name = "totp_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Non-sensitive environment variables
[vars]
PW_ITERATIONS = "100000"

# Production environment config
[env.production]
vars = { PW_ITERATIONS = "150000" }

[[env.production.d1_databases]]
binding = "DATABASE"
database_name = "totp_db_prod"
database_id = "prod-database-id"

# Preview environment config
[env.preview]
vars = { PW_ITERATIONS = "100000" }

[[env.preview.d1_databases]]
binding = "DATABASE"
database_name = "totp_db_preview"
database_id = "preview-database-id"
```

### .dev.vars (Local Development)

```bash
# Password hash salt
HASH_SALT=local-dev-salt-change-this-in-production

# PBKDF2 iteration count
PW_ITERATIONS=100000
```

### .env.example (Template)

```bash
# Cloudflare Pages Functions Environment Variables Example

# Password hash salt (must be set in production)
# Use wrangler secret put HASH_SALT command to set
# HASH_SALT=your-secure-random-salt-value

# PBKDF2 iteration count (default: 100000)
PW_ITERATIONS=100000

# D1 database ID (get from wrangler d1 create command)
# DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

**Last Updated**: 2024-01-08

**Maintainer**: TOTP Manager Development Team

**Feedback**: For questions or suggestions, please submit an Issue or Pull Request.
