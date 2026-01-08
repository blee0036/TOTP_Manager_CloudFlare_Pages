# TOTP Manager

English | [简体中文](README.zh-CN.md)

📚 **[Documentation Index](DOCUMENTATION_INDEX.md)** | **[文档索引](DOCUMENTATION_INDEX.zh-CN.md)**

A modern TOTP (Time-based One-Time Password) manager built with Cloudflare Pages + Vue 3, featuring Material Design and support for 18 languages.

## Overview

TOTP Manager is a modern time-based one-time password management application that generates TOTP tokens entirely in the browser, eliminating the need for frequent server calls. The application uses a frontend-backend separation architecture, with Vue 3 + Vite for the frontend, Cloudflare Pages Functions for the backend API, and Cloudflare D1 database for data storage.

### Key Features

- 🔐 **Client-side TOTP Generation** - Tokens generated entirely in the browser, reducing server calls and improving response speed
- � **Materi al Design 3** - Modern UI following Google Material Design specifications
- 🌍 **18 Language Support** - Complete internationalization including RTL layout (Arabic)
- 🌓 **Light/Dark Theme** - Theme switching with automatic detection
- � ***Responsive Design** - Perfect adaptation for desktop and mobile devices
- � **QR Co*de Scanning** - Upload QR code images to automatically parse TOTP configuration
- � **D线ual Storage Modes** - Cloud sync (requires login) and local storage (temporary mode)
- � ***Real-time Search** - Client-side real-time search and filtering without server calls
- 📴 **Offline Support** - Offline access via Service Worker
- 🔒 **Security** - PBKDF2-SHA256 password hashing, HttpOnly cookies, CSP security headers

## Tech Stack

### Frontend
- **Framework**: Vue 3 (Composition API) + TypeScript
- **Build Tool**: Vite 5
- **UI Framework**: Vuetify 3 (Material Design)
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Internationalization**: Vue I18n
- **QR Code**: jsQR

### Backend
- **Runtime**: Cloudflare Pages Functions
- **Database**: Cloudflare D1 (SQLite)
- **Encryption**: Web Crypto API (PBKDF2-SHA256)

### Development Tools
- **Language**: TypeScript
- **Code Quality**: ESLint + Prettier
- **Testing**: Vitest (Unit Tests)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Cloudflare account (for deployment)
- Wrangler CLI (for database management and deployment)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/blee0036/TOTP_Manager_CloudFlare_Pages.git
cd TOTP_Manager_CloudFlare_Pages
```

2. **Install dependencies**

```bash
npm install
```

3. **Install Wrangler CLI** (if not already installed)

```bash
npm install -g wrangler
```

4. **Login to Cloudflare**

```bash
wrangler login
```

### Local Development

1. **Initialize local database**

```bash
# Create database (first run)
npm run db:create

# Apply database migrations
npm run db:migrate:local
```

2. **Start development server**

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

3. **Start Wrangler development server** (for testing Functions)

In another terminal window:

```bash
wrangler pages dev dist --local
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Management

### Local Development

```bash
# Create database (first run)
npm run db:create

# Apply migrations to local database
npm run db:migrate:local

# List local migrations
npm run db:list:local

# Execute SQL query (local)
npm run db:query:local -- --command "SELECT * FROM users"
```

### Production

```bash
# Apply migrations to remote database
npm run db:migrate:remote

# List remote migrations
npm run db:list:remote

# Execute SQL query (remote)
npm run db:query:remote -- --command "SELECT COUNT(*) FROM users"
```

### Creating New Migrations

1. Create a new file in the `migrations/` directory with format: `XXXX_description.sql`
2. Write SQL migration script
3. Apply migration: `npm run db:migrate:local` or `npm run db:migrate:remote`

Example:

```sql
-- migrations/0002_add_user_email.sql
ALTER TABLE users ADD COLUMN email TEXT;
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
```

## Deploy to Cloudflare Pages

### First Deployment

1. **Create D1 database**

```bash
wrangler d1 create totp_db
```

Copy the output database configuration to `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DATABASE"
database_name = "totp_db"
database_id = "your-database-id"  # Replace with actual ID
```

2. **Apply database migrations**

```bash
npm run db:migrate:remote
```

3. **Set environment variables**

```bash
# Set password hash salt (required)
wrangler secret put HASH_SALT
# Enter a secure random string, e.g.: your-secure-random-salt-value
```

4. **Build and deploy**

```bash
npm run deploy
```

Or execute step by step:

```bash
# Build
npm run build

# Deploy
wrangler pages deploy dist
```

### Subsequent Deployments

```bash
# One-click deployment (includes build and migrations)
npm run deploy
```

### Deploy via Cloudflare Dashboard

1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Pages** section
3. Click **Create a project**
4. Connect Git repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Add environment variables:
   - `HASH_SALT`: Password hash salt
   - `PW_ITERATIONS`: `100000` (optional)
7. Bind D1 database:
   - In **Settings** → **Functions** → **D1 database bindings**
   - Add binding: `DATABASE` → Select your database
8. Click **Save and Deploy**

## Environment Variables

### Required Variables

| Variable | Description | Default | Setup Method |
|----------|-------------|---------|--------------|
| `HASH_SALT` | Password hash salt (required) | None | `wrangler secret put HASH_SALT` |

### Optional Variables

| Variable | Description | Default | Setup Method |
|----------|-------------|---------|--------------|
| `PW_ITERATIONS` | PBKDF2 iterations | `100000` | Set in `wrangler.toml` `[vars]` section |

### Setting Environment Variables

**Method 1: Using Wrangler CLI (recommended for secrets)**

```bash
wrangler secret put HASH_SALT
```

**Method 2: In wrangler.toml (for non-sensitive config)**

```toml
[vars]
PW_ITERATIONS = "100000"
```

**Method 3: In Cloudflare Dashboard**

1. Go to Pages project settings
2. Navigate to **Settings** → **Environment variables**
3. Add variable
4. Redeploy project

### Local Development Environment Variables

Create `.dev.vars` file (do not commit to Git):

```bash
HASH_SALT=your-local-dev-salt
PW_ITERATIONS=100000
```

Wrangler will automatically load this file for local development.

## Documentation

- 📖 [Environment Variables](ENVIRONMENT_VARIABLES.md) - Detailed environment variable documentation
- 🚀 [CI/CD Workflows](.github/workflows/README.md) - GitHub Actions configuration guide
- 📋 [Quick Reference](QUICK_REFERENCE.md) - Common commands and cheat sheet

## Features

### Core Functionality

- ✅ **Client-side TOTP Generation** - Tokens generated entirely in browser without server calls
- ✅ **User Authentication** - Support for user registration, login, logout
- ✅ **Key Management** - Add, edit, delete TOTP keys
- ✅ **QR Code Scanning** - Upload QR code images to auto-parse configuration
- ✅ **Real-time Search** - Client-side real-time search and filter keys
- ✅ **Local Storage Mode** - Use without login (data stored in browser)

### User Interface

- ✅ **Material Design 3** - Modern Google Material Design interface
- ✅ **Light/Dark Theme** - Theme switching with automatic detection
- ✅ **Responsive Design** - Perfect adaptation for desktop and mobile
- ✅ **Animations** - Smooth Material Design animations and transitions

### Internationalization

- ✅ **18 Languages** - Support for:
  - Simplified Chinese (zh-CN), Traditional Chinese (zh-TW), English (en), Japanese (ja), Korean (ko)
  - French (fr), German (de), Spanish (es), Portuguese (pt), Russian (ru), Italian (it)
  - Dutch (nl), Polish (pl), Turkish (tr), Arabic (ar), Indonesian (id), Thai (th), Vietnamese (vi)
- ✅ **RTL Support** - Arabic automatically switches to right-to-left layout
- ✅ **Auto Detection** - Automatically selects based on browser language
- ✅ **Lazy Loading** - Optimized initial load performance

### Performance Optimization

- ✅ **Code Splitting** - Route and component lazy loading
- ✅ **Offline Support** - Offline access via Service Worker
- ✅ **Zero Function Calls** - Page access returns static resources directly
- ✅ **Client-side Computation** - TOTP generation and search performed client-side

### Security

- ✅ **PBKDF2-SHA256** - Password hashing with 100,000+ iterations
- ✅ **HttpOnly Cookie** - Session tokens use HttpOnly cookies
- ✅ **Security Headers** - CSP, X-Frame-Options, X-XSS-Protection
- ✅ **Input Validation** - Dual validation on frontend and backend
- ✅ **Environment Variables** - Sensitive configuration via environment variables

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit Pull Request

## License

MIT License

## Contact

For questions or suggestions, please submit an Issue or Pull Request.

---

**Note**: This project is for learning and demonstration purposes. Before using in production, ensure:
- Use strong random salt (`HASH_SALT`)
- Regular database backups
- Enable Cloudflare security features (WAF, Rate Limiting)
- Monitor application performance and error logs
