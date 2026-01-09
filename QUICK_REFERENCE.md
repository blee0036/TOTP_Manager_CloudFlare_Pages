# Quick Reference Card

English | [简体中文](QUICK_REFERENCE.zh-CN.md)

## Environment Variables Cheat Sheet

| Variable | Required | Default | Setup Method | Description |
|----------|----------|---------|--------------|-------------|
| `HASH_SALT` | ✅ Yes | None | `wrangler secret put` | Password hash salt |
| `PW_ITERATIONS` | ❌ No | `100000` | `wrangler.toml` or Dashboard | PBKDF2 iterations |
| `DATABASE` | ✅ Yes | None | `wrangler.toml` binding | D1 database binding |

## Common Commands

### Local Development

```bash
# Install dependencies
npm install

# Create local database
npm run db:create

# Apply migrations
npm run db:migrate:local

# Start development server
npm run dev

# Start Wrangler (test Functions)
wrangler pages dev dist --local
```

### Database Management

```bash
# Create database
wrangler d1 create totp_db

# Apply migrations (local)
npm run db:migrate:local

# Apply migrations (remote)
npm run db:migrate:remote

# List migrations
npm run db:list:local
npm run db:list:remote

# Execute SQL query
npm run db:query:local -- --command "SELECT * FROM users"
npm run db:query:remote -- --command "SELECT COUNT(*) FROM users"
```

### Environment Variables Setup

```bash
# Generate random salt
openssl rand -hex 32

# Generate random salt
openssl rand -hex 32

# Set secret
wrangler pages secret put HASH_SALT --project-name=totp-manager

# List secrets
wrangler pages secret list --project-name=totp-manager

# Delete secret
wrangler secret delete HASH_SALT
```

### Build and Deploy

```bash
# Build
npm run build

# Preview build
npm run preview

# One-click deploy (build + migrate + deploy)
npm run deploy

# Manual deploy
wrangler pages deploy dist
```

### Testing

```bash
# Run all tests
npm test

# Run tests (single run)
npm test -- --run

# Generate coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

### Code Quality

```bash
# Run linter
npm run lint

# Auto fix
npm run lint:fix

# Type check
npx vue-tsc --noEmit
```

## First Deployment Checklist

### Preparation

- [ ] Install Node.js 18+
- [ ] Install Wrangler CLI: `npm install -g wrangler`
- [ ] Login to Cloudflare: `wrangler login`
- [ ] Clone repository and install dependencies

### Database Setup

- [ ] Create D1 database: `wrangler d1 create totp_db`
- [ ] Copy database config to `wrangler.toml`
- [ ] Apply migrations: `npm run db:migrate:remote`

### Environment Variables

- [ ] Generate salt: `openssl rand -hex 32`
- [ ] Set HASH_SALT: `wrangler pages secret put HASH_SALT --project-name=totp-manager`
- [ ] Set PW_ITERATIONS (optional)

### Deployment

- [ ] Build application: `npm run build`
- [ ] Deploy: `wrangler pages deploy dist`
- [ ] Verify deployment success
- [ ] Test functionality

### CI/CD (Optional)

- [ ] Set `CLOUDFLARE_API_TOKEN` in GitHub
- [ ] Set `CLOUDFLARE_ACCOUNT_ID` in GitHub
- [ ] Push code to trigger auto-deployment
- [ ] Verify CI/CD workflows

## Troubleshooting Cheat Sheet

| Issue | Solution |
|-------|----------|
| `HASH_SALT is not set` | `wrangler pages secret put HASH_SALT --project-name=totp-manager` |
| `D1_ERROR: no such table` | `npm run db:migrate:local` or `npm run db:migrate:remote` |
| `no such database` | Check `database_id` in `wrangler.toml` |
| Environment variables not effective | Redeploy: `npm run deploy` |
| `.dev.vars` not loading | Restart Wrangler: `wrangler pages dev dist --local` |
| CI/CD authentication failed | Check GitHub Secrets and API Token permissions |

## API Endpoints Cheat Sheet

### Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### Key Management API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/keys` | Get all keys |
| POST | `/api/keys` | Add new key |
| PUT | `/api/keys/:id` | Update key remark |
| DELETE | `/api/keys/:id` | Delete key |

## Project Structure Cheat Sheet

```
totp-manager/
├── src/                    # Frontend source code
│   ├── views/              # Page components
│   ├── components/         # Reusable components
│   ├── stores/             # Pinia state management
│   ├── composables/        # Composable functions
│   ├── utils/              # Utility functions
│   └── i18n/               # Internationalization
├── functions/              # Cloudflare Pages Functions
│   ├── api/                # API endpoints
│   └── utils/              # Backend utilities
├── migrations/             # Database migrations
├── .github/workflows/      # CI/CD workflows
└── public/                 # Static assets
```

## Supported Languages

🌍 18 languages: en, zh-CN, zh-TW, ja, ko, fr, de, es, pt, ru, it, nl, pl, tr, ar, id, th, vi

## Related Documentation

- 📖 [README.md](README.md) - Project introduction and usage guide
- 🔧 [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - Detailed environment variables documentation
- 🚀 [.github/workflows/README.md](.github/workflows/README.md) - CI/CD workflows documentation
- 📋 [.env.example](.env.example) - Environment variables template

## Get Help

- 📝 Submit Issue
- 💬 Check documentation
- 🔍 Search known issues
- 📧 Contact maintainers
