# FoodTech Backend - Render Deployment Guide

This guide provides detailed steps for deploying the FoodTech backend API to Render.

---

## Quick Start

```bash
# 1. Push to GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main

# 2. Create Render Web Service (via dashboard or CLI)
# 3. Configure environment variables
# 4. Add X.509 certificates as secret files
# 5. Deploy!
```

---

## Render Service Configuration

### Service Settings

| Setting | Value |
|---------|-------|
| **Name** | `foodtech-api` |
| **Runtime** | `Node` |
| **Region** | `Oregon (US West)` or closest to MongoDB |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npm start` |
| **Auto-Deploy** | `Yes` |

### Instance Type

| Environment | Plan | Specs |
|-------------|------|-------|
| **Development** | Free | 512 MB RAM, shared CPU |
| **Staging** | Starter | 512 MB RAM, 0.5 CPU |
| **Production** | Standard | 1 GB RAM, 1 CPU |

---

## Environment Variables

### Required Variables

```env
# Server Configuration
NODE_ENV=production
PORT=4000
API_PREFIX=/api/v1

# MongoDB Atlas (X.509 Authentication)
MONGODB_URI=mongodb+srv://foodapp.enjrbrq.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509
MONGODB_DB=foodtech
MONGODB_TLS_CERT_FILE=/etc/secrets/client.pem
MONGODB_TLS_CA_FILE=/etc/secrets/ca.pem

# JWT Authentication
JWT_SECRET=<64-char-hex-string>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<64-char-hex-string>
JWT_REFRESH_EXPIRES_IN=30d

# CORS - Production frontend URL
FRONTEND_URL=https://your-app.expo.dev
```

### Optional Variables

```env
# File Uploads (Phase 5+)
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=5242880

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Secret Files (X.509 Certificates)

### Adding Certificates

1. Go to **Environment** → **Secret Files**
2. Click **Add Secret File**
3. Add two files:

**File 1: Client Certificate**
- **Key**: `client.pem`
- **Value**: Full content of your MongoDB Atlas client certificate (`.pem`)
- **Mount Path**: `/etc/secrets/client.pem`

**File 2: CA Certificate**
- **Key**: `ca.pem`
- **Value**: Full content of your MongoDB Atlas CA certificate (`.pem`)
- **Mount Path**: `/etc/secrets/ca.pem`

### Certificate Format

Certificates must be in PEM format:

```
-----BEGIN CERTIFICATE-----
MIIF...
...
-----END CERTIFICATE-----
```

### Verifying Certificates

```bash
# In Render shell (after deploy)
cat /etc/secrets/client.pem
cat /etc/secrets/ca.pem

# Test connection
node -e "
const { MongoClient } = require('mongodb');
const fs = require('fs');
const client = new MongoClient(process.env.MONGODB_URI, {
  tlsCertificateKeyFile: '/etc/secrets/client.pem',
  tlsCAFile: '/etc/secrets/ca.pem',
});
client.connect().then(() => console.log('Connected!')).catch(console.error);
"
```

---

## Health Check Endpoint

Ensure your backend has a health check at `/health`:

```typescript
// backend/src/routes/health.routes.ts
import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

export default router;
```

### Render Health Check Config

- **Path**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Threshold**: 3 failures before restart

---

## Custom Domain Setup

### 1. Add Domain in Render

1. Go to **Settings** → **Custom Domains**
2. Click **Add Domain**
3. Enter: `api.foodtech.yourdomain.com`

### 2. Configure DNS

Add CNAME record in your DNS provider:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | api | foodtech-api.onrender.com | 300 |

### 3. SSL Certificate

- Render automatically provisions **Let's Encrypt** SSL
- Certificate renews automatically
- Force HTTPS: Enabled by default

---

## Scaling Configuration

### Horizontal Scaling (Manual)

1. Go to **Settings** → **Scaling**
2. Set **Min Instances**: 1
3. Set **Max Instances**: 3 (adjust based on load)

### Vertical Scaling

Upgrade plan in **Settings** → **Plan**:

| Plan | RAM | CPU | Price/Month |
|------|-----|-----|-------------|
| Free | 512 MB | Shared | $0 |
| Starter | 512 MB | 0.5 | $7 |
| Standard | 1 GB | 1 | $25 |
| Pro | 2 GB | 2 | $85 |

---

## Environment-Specific Deployments

### Staging Environment

Create a separate Render service:

```yaml
# render.yaml (Infrastructure as Code)
services:
  - type: web
    name: foodtech-api-staging
    runtime: node
    region: oregon
    plan: starter
    buildCommand: npm ci && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: staging
      - key: MONGODB_DB
        value: foodtech-staging
      - key: FRONTEND_URL
        value: https://staging-app.expo.dev
    secretFiles:
      - client.pem
      - ca.pem
```

### Production Environment

```yaml
# render.yaml (Production)
services:
  - type: web
    name: foodtech-api
    runtime: node
    region: oregon
    plan: standard
    buildCommand: npm ci && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_DB
        value: foodtech
      - key: FRONTEND_URL
        value: https://foodtech.expo.dev
    secretFiles:
      - client.pem
      - ca.pem
    scaling:
      minInstances: 2
      maxInstances: 5
```

---

## Monitoring & Alerts

### Built-in Metrics

Render provides:
- **CPU Usage**
- **Memory Usage**
- **Request Latency (p50, p95, p99)**
- **Request Rate**
- **Error Rate**
- **Deploy History**

### Setting Up Alerts

1. Go to **Metrics** → **Alerts**
2. Create alerts for:
   - **CPU > 80%** for 5 minutes
   - **Memory > 85%** for 5 minutes
   - **Error Rate > 5%** for 2 minutes
   - **p95 Latency > 2000ms** for 5 minutes

### External Monitoring

Recommended integrations:
- **UptimeRobot** - External uptime monitoring
- **Datadog** / **New Relic** - APM
- **Sentry** - Error tracking

---

## Logs & Debugging

### Viewing Logs

1. Go to **Logs** tab in Render Dashboard
2. Filter by:
   - **Time range**
   - **Log level** (stdout/stderr)
   - **Search terms**

### Structured Logging

Add to your backend:

```typescript
// backend/src/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' 
    ? { target: 'pino-pretty' } 
    : undefined,
});
```

### Common Log Patterns

```bash
# Filter errors
render logs --service foodtech-api --grep "ERROR"

# Filter by request ID
render logs --service foodtech-api --grep "req-id:abc123"

# Follow live logs
render logs --service foodtech-api --tail
```

---

## Deployment Scripts

### package.json Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "test": "jest",
    "db:migrate": "tsx src/scripts/migrate.ts",
    "db:seed": "tsx src/scripts/seed.ts"
  }
}
```

### Pre-deploy Checklist

```bash
# 1. Type check
npm run build

# 2. Lint
npm run lint

# 3. Test
npm run test

# 4. Verify health endpoint locally
curl http://localhost:4000/health

# 5. Check bundle size
du -sh dist/
```

---

## Troubleshooting

### Build Failures

| Error | Solution |
|-------|----------|
| `tsc: command not found` | Add `typescript` to dependencies |
| `Module not found` | Check `tsconfig.json` paths, ensure all imports resolve |
| `Out of memory` | Upgrade to Standard plan or optimize build |

### Runtime Errors

| Error | Solution |
|-------|----------|
| `MongoServerSelectionError` | Check Network Access, verify certificates |
| `JWT_SECRET not defined` | Add to Environment Variables |
| `CORS error` | Verify FRONTEND_URL matches exactly |
| `Port already in use` | Use `PORT` env var, don't hardcode |

### Certificate Issues

| Error | Solution |
|-------|----------|
| `unable to verify the first certificate` | Ensure CA cert is correct and complete |
| `certificate has expired` | Regenerate certificates in MongoDB Atlas |
| `permission denied` | Check secret file mount path `/etc/secrets/` |

---

## Rollback Procedure

### Via Dashboard

1. Go to **Deploys** tab
2. Find previous successful deploy
3. Click **Rollback** → **Confirm**

### Via CLI

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# List deploys
render deploys list --service foodtech-api

# Rollback to specific deploy
render deploys rollback --service foodtech-api --deploy-id <deploy-id>
```

### Via Git

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or revert to specific commit
git revert <commit-hash>..HEAD
git push origin main
```

---

## Cost Optimization

### Free Tier Limits

- **750 hours/month** (enough for 1 service 24/7)
- **Spins down** after 15 min inactivity
- **Cold start** ~10-30 seconds

### Production Optimization

1. **Use Standard plan** - No spin-down, dedicated resources
2. **Enable caching** - Add Redis for session/cache
3. **Optimize queries** - Use MongoDB indexes, projection
4. **Connection pooling** - Configure Mongoose pool size

```typescript
// Optimal MongoDB connection options
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
});
```

---

## Security Hardening

### Render-Level Security

- [ ] **DDoS Protection** - Enabled by default
- [ ] **WAF** - Available on Pro+ plans
- [ ] **IP Allowlist** - Restrict admin endpoints
- [ ] **TLS 1.3** - Enforced automatically

### Application-Level Security

```typescript
// backend/src/app.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet({
  contentSecurityPolicy: false, // API doesn't need CSP
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);

// Stricter limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per 15 min
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
```

---

## Useful Render CLI Commands

```bash
# Install CLI
npm install -g @render/cli

# Login
render login

# List services
render services list

# View logs
render logs --service foodtech-api --tail

# Trigger deploy
render deploys trigger --service foodtech-api

# View env vars
render env-vars list --service foodtech-api

# Set env var
render env-vars set --service foodtech-api KEY=VALUE

# View secret files
render secret-files list --service foodtech-api

# Add secret file
render secret-files add --service foodtech-api --key client.pem --value "$(cat client.pem)"

# Scale service
render scaling update --service foodtech-api --min-instances 2 --max-instances 5
```

---

## Reference Links

- [Render Documentation](https://render.com/docs)
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Render Environment Variables](https://render.com/docs/configure-environment-variables)
- [Render Secret Files](https://render.com/docs/secret-files)
- [Render Custom Domains](https://render.com/docs/custom-domains)
- [MongoDB Atlas X.509](https://www.mongodb.com/docs/atlas/security-x509/)
- [Render CLI](https://github.com/render/cli)

---

*Document Version: 1.0*
*Last Updated: 2026-11-14*
*For FoodTech Backend API Deployment on Render*