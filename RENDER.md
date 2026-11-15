# FoodTech Backend (.NET 10) - Render Deployment Guide

This guide provides steps for deploying the FoodTech .NET 10 backend API to Render using Docker.

---

## Quick Start

```bash
# 1. Push to GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main

# 2. Connect repository to Render (Dashboard or CLI)
# 3. Configure environment variables
# 4. Deploy!
```

---

## Render Service Configuration

### Service Settings (via `render.yaml`)

| Setting | Value |
|---------|-------|
| **Name** | `foodtech-api` |
| **Runtime** | `docker` |
| **Region** | `Oregon (US West)` |
| **Branch** | `main` |
| **Dockerfile** | `FoodTech.Api/Dockerfile` |
| **Docker Context** | `FoodTech.Api` |
| **Health Check Path** | `/health` |
| **Auto-Deploy** | `Yes` |
| **Plan** | `Free` (512 MB RAM, shared CPU) |

---

## Environment Variables

### Required Variables (set in Render Dashboard → Environment)

```env
# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080

# MongoDB (use MongoDB Atlas Free M0 cluster)
ConnectionStrings__MongoDB=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/foodtech?retryWrites=true&w=majority

# JWT Authentication (generate secure secrets)
JwtSettings__Secret=<64-char-base64-string-min-32-chars>
JwtSettings__Issuer=foodtech-api
JwtSettings__Audience=foodtech-app
JwtSettings__AccessTokenExpiryMinutes=60

# QR Code Signing
QR__SecretKey=<32-char-secret-key>
```

### Generate Secrets

```bash
# JWT Secret (64 chars base64)
openssl rand -base64 48

# QR Secret Key (32 chars)
openssl rand -base64 24
```

---

## MongoDB Setup (MongoDB Atlas Free Tier)

Since Render doesn't offer managed MongoDB on free tier:

1. **Create MongoDB Atlas Account** → https://cloud.mongodb.com
2. **Create Free M0 Cluster** (512 MB, shared RAM)
3. **Database Access** → Add user with password auth
4. **Network Access** → Add `0.0.0.0/0` (Allow from anywhere) or Render's IP ranges
5. **Get Connection String** → Drivers → C# / .NET Standard 2.1+
6. **Replace `<password>`** in connection string

Connection string format:
```
mongodb+srv://foodtech-user:yourpassword@cluster0.abc123.mongodb.net/foodtech?retryWrites=true&w=majority
```

---

## Health Check Endpoint

The .NET backend includes a health check at `/health`:

```csharp
// Program.cs
app.MapHealthChecks("/health");
```

**Render Health Check Config:**
- **Path**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Threshold**: 3 failures before restart

---

## Deploy Steps

### Option 1: Render Dashboard (Recommended)

1. Go to https://dashboard.render.com
2. **New** → **Web Service** → **Build and deploy from a Git repository**
3. Connect GitHub → Select `foodtech` repo
4. **Configure:**
   - Name: `foodtech-api`
   - Runtime: `Docker`
   - Dockerfile Path: `FoodTech.Api/Dockerfile`
   - Docker Build Context: `FoodTech.Api`
5. **Environment Variables** → Add all required variables above
6. **Create Web Service** → Deploy starts automatically

### Option 2: Render CLI (Infrastructure as Code)

```bash
# Install CLI
npm install -g @render/cli

# Login
render login

# Deploy using render.yaml
render deploy --repo https://github.com/yourusername/foodtech
```

### Option 3: Blueprint (render.yaml)

1. Go to **Blueprints** in Render Dashboard
2. **New Blueprint Instance** → Connect repo
3. Render reads `render.yaml` and provisions everything

---

## Custom Domain Setup

1. **Settings** → **Custom Domains** → **Add Domain**
2. Enter: `api.foodtech.yourdomain.com`
3. **DNS Configuration** (at your DNS provider):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | api | foodtech-api.onrender.com | 300 |

4. Render auto-provisions **Let's Encrypt SSL** (auto-renews)

---

## Free Tier Limits

| Limit | Value |
|-------|-------|
| **Hours/month** | 750 (enough for 24/7) |
| **Spin-down** | After 15 min inactivity |
| **Cold start** | ~10-30 seconds |
| **RAM** | 512 MB |
| **CPU** | Shared |
| **Bandwidth** | 100 GB/month |

**Tip:** Ping the `/health` endpoint every 10 min to prevent spin-down:
```bash
# Add to cron or use UptimeRobot
curl https://api.foodtech.yourdomain.com/health
```

---

## Production Upgrade Path

| Plan | RAM | CPU | Price/Month | Spin-down |
|------|-----|-----|-------------|-----------|
| Free | 512 MB | Shared | $0 | Yes |
| Starter | 512 MB | 0.5 vCPU | $7 | No |
| Standard | 1 GB | 1 vCPU | $25 | No |
| Pro | 2 GB | 2 vCPU | $85 | No |

---

## Monitoring & Logs

### Render Dashboard
- **Logs** tab → Live logs, filter by level
- **Metrics** → CPU, Memory, Latency (p50/p95/p99), Request rate, Error rate
- **Alerts** → Set up email/Slack alerts for CPU > 80%, Memory > 85%, Error rate > 5%

### Application Logs (Serilog)
Structured JSON logs output to stdout (captured by Render):
```json
{
  "Timestamp": "2026-11-15T00:00:00.000Z",
  "Level": "Information",
  "Message": "HTTP GET /api/v1/employee/vendors",
  "Properties": { "DurationMs": 45, "UserId": "..." }
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Build fails** | Check Dockerfile paths, ensure `FoodTech.Api` context is correct |
| **Health check fails** | Verify `/health` endpoint returns 200, check port 8080 |
| **MongoDB connection error** | Check Atlas Network Access (0.0.0.0/0), verify connection string |
| **JWT error** | Ensure `JwtSettings__Secret` is ≥ 32 chars, base64 encoded |
| **CORS error** | Add `FRONTEND_URL` env var, configure CORS in `Program.cs` |
| **Port binding error** | Use `ASPNETCORE_URLS=http://+:8080`, don't hardcode port |

---

## Rollback

1. **Dashboard** → **Deploys** → Click previous successful deploy → **Rollback**
2. **Git** → `git revert HEAD && git push origin main`

---

## Cost Optimization

1. **Free tier** → 750 hrs/mo (24/7 for 1 service)
2. **Prevent cold starts** → External ping every 10 min (UptimeRobot free)
3. **Upgrade when needed** → Starter ($7/mo) removes spin-down

---

## Security Checklist

- [ ] Strong JWT secret (64+ chars)
- [ ] MongoDB Atlas: Password auth + IP allowlist (or 0.0.0.0/0 for Render)
- [ ] HTTPS enforced (Render default)
- [ ] CORS restricted to frontend domain
- [ ] Rate limiting enabled (in `Program.cs`)
- [ ] Security headers (Helmet equivalent in ASP.NET Core)

---

## Reference Links

- [Render Docker Deploy](https://render.com/docs/deploy-docker-image)
- [Render Environment Variables](https://render.com/docs/configure-environment-variables)
- [Render Custom Domains](https://render.com/docs/custom-domains)
- [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas/register)
- [ASP.NET Core on Render](https://render.com/docs/deploy-aspnet-core)
- [ASP.NET Core Health Checks](https://learn.microsoft.com/aspnet/core/host-and-deploy/health-checks)

---

*Document Version: 2.0*  
*Last Updated: 2026-11-15*  
*For FoodTech .NET 10 Backend API Deployment on Render*