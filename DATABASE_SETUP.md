# Database Setup Guide

This guide explains how to set up and manage the Cloudflare D1 database for the TOTP Manager application.

## Prerequisites

- Node.js and npm installed
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Authenticated with Cloudflare (`wrangler login`)

## Initial Setup

### Step 1: Create D1 Database

```bash
npm run db:create
```

This will output something like:

```
✅ Successfully created DB 'totp_db'

[[d1_databases]]
binding = "DATABASE"
database_name = "totp_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Step 2: Update wrangler.toml

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DATABASE"
database_name = "totp_db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # Replace with your actual ID
```

### Step 3: Apply Migrations (Local Development)

```bash
npm run db:migrate:local
```

Expected output:

```
Migrations to be applied:
┌────────────────────────────┐
│ Name                       │
├────────────────────────────┤
│ 0001_initial_schema.sql    │
└────────────────────────────┘
✅ Successfully applied 1 migration(s)
```

### Step 4: Verify Database Structure

```bash
npm run db:query:local -- --command "SELECT name FROM sqlite_master WHERE type='table'"
```

Expected output:

```
┌──────────────────┐
│ name             │
├──────────────────┤
│ users            │
│ totp_keys        │
│ d1_migrations    │
└──────────────────┘
```

## Production Deployment

### Step 1: Set Environment Variables

Set the password hash salt (do this once):

```bash
wrangler secret put HASH_SALT
```

When prompted, enter a secure random string (e.g., generate with `openssl rand -base64 32`).

### Step 2: Apply Migrations to Production

```bash
npm run db:migrate:remote
```

You'll be prompted to confirm:

```
⚠️  This will apply 1 migration(s) to the remote database.
⚠️  This action cannot be undone.

Migrations to be applied:
┌────────────────────────────┐
│ Name                       │
├────────────────────────────┤
│ 0001_initial_schema.sql    │
└────────────────────────────┘

Ok to proceed? (y/n)
```

Type `y` to proceed.

### Step 3: Verify Production Database

```bash
npm run db:query:remote -- --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### Step 4: Deploy Application

```bash
npm run deploy
```

This will:
1. Build the frontend (`npm run build`)
2. Apply any pending migrations (`npm run db:migrate:remote`)
3. Deploy to Cloudflare Pages (`wrangler pages deploy dist`)

## Database Management

### Viewing Data

**Local:**

```bash
# View all users
npm run db:query:local -- --command "SELECT * FROM users"

# View all keys
npm run db:query:local -- --command "SELECT * FROM totp_keys"

# View keys with user info
npm run db:query:local -- --command "SELECT k.*, u.username FROM totp_keys k JOIN users u ON k.user_id = u.id"
```

**Production:**

```bash
# View all users (be careful with production data!)
npm run db:query:remote -- --command "SELECT id, username, created_at FROM users"

# Count keys per user
npm run db:query:remote -- --command "SELECT u.username, COUNT(k.id) as key_count FROM users u LEFT JOIN totp_keys k ON u.id = k.user_id GROUP BY u.id"
```

### Backing Up Data

**Export data from production:**

```bash
# Export users
npm run db:query:remote -- --command "SELECT * FROM users" > backup_users.json

# Export keys
npm run db:query:remote -- --command "SELECT * FROM totp_keys" > backup_keys.json
```

### Clearing Data (Development Only)

**⚠️ WARNING: This will delete all data!**

```bash
# Clear local database
npm run db:query:local -- --command "DELETE FROM totp_keys"
npm run db:query:local -- --command "DELETE FROM users"
```

## Troubleshooting

### Migration Already Applied

If you see "migration already applied", it means the migration has been run before. This is normal and safe to ignore.

### Database Not Found

If you get "database not found" error:

1. Check that `database_id` in `wrangler.toml` is correct
2. Verify the database exists: `wrangler d1 list`
3. Create the database if needed: `npm run db:create`

### Foreign Key Constraint Failed

This usually means you're trying to:
- Delete a user that has keys (use CASCADE delete)
- Insert a key with invalid user_id

Solution: Ensure user exists before adding keys.

### Migration Failed

If a migration fails:

1. Check the SQL syntax in the migration file
2. Test locally first: `npm run db:migrate:local`
3. Check D1 logs for detailed error messages
4. If needed, create a rollback migration

## Environment Variables

### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `HASH_SALT` | Secret | Password hash salt | `your-secure-random-salt` |
| `PW_ITERATIONS` | Var | PBKDF2 iterations | `100000` |

### Setting Variables

**Secrets (sensitive data):**

```bash
wrangler secret put HASH_SALT
```

**Vars (non-sensitive):**

Edit `wrangler.toml`:

```toml
[vars]
PW_ITERATIONS = "100000"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Apply database migrations
        run: npx wrangler d1 migrations apply totp_db --remote
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      
      - name: Deploy to Cloudflare Pages
        run: npx wrangler pages deploy dist
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Best Practices

1. **Always test locally first** - Run migrations on local database before production
2. **Backup before major changes** - Export data before applying significant migrations
3. **Use transactions** - D1 automatically wraps migrations in transactions
4. **Version control** - Keep all migration files in git
5. **Never modify applied migrations** - Create new migrations to fix issues
6. **Document changes** - Add comments to migration files explaining the changes
7. **Monitor production** - Check logs after applying migrations to production

## Additional Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [SQL Reference](https://www.sqlite.org/lang.html)
