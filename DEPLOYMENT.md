# FoodTech Application - Deployment Guide

This guide covers deploying the FoodTech application (HungerBox clone) to production environments.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│   Backend API   │────▶│  MongoDB Atlas  │
│  (Expo/EAS)     │     │   (Render)      │     │   (X.509)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Backend**: Node.js + Express + TypeScript on Render
- **Mobile**: React Native (Expo) built with EAS Build
- **Database**: MongoDB Atlas with X.509 certificate authentication

---

## Prerequisites

1. **GitHub Repository** with the codebase
2. **MongoDB Atlas Account** (M10+ for production)
3. **Render Account** (for backend hosting)
4. **Expo Account** (for EAS Build)
5. **X.509 Certificates** generated from MongoDB Atlas

---

## 1. MongoDB Atlas Setup

### 1.1 Create Cluster

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new project: `foodtech-production`
3. Build a cluster:
   - **Tier**: M10 (production) or M0 (development)
   - **Provider**: AWS / Google Cloud / Azure
   - **Region**: Choose closest to your users
   - **Cluster Name**: `foodtech-cluster`

### 1.2 Enable X.509 Authentication

1. Go to **Security** → **Authentication**
2. Enable **X.509 Certificate Authentication**
3. Add a database user:
   - **Authentication Method**: X.509
   - **Username**: `CN=foodtech-app,OU=Production,O=FoodTech,L=City,ST=State,C=US`
   - **Database**: `foodtech`
   - **Roles**: `readWrite` on `foodtech` database

### 1.3 Generate Client Certificates

1. In **Security** → **X.509 Certificates**
2. Click **Add New Certificate**
3. Download the **Client Certificate** (`.pem` file)
4. Download the **CA Certificate** (`.pem` file)
5. Store securely - these are your database credentials!

### 1.4 Configure Network Access

1. Go to **Security** → **Network Access**
2. For **Development**: Add `0.0.0.0/0` (allow all)
3. For **Production**: Add Render's IP ranges:
   - `34.192.0.0/12` (AWS us-east-1)
   - `52.0.0.0/8` (AWS us-east-1)
   - Or use **Peering Connection** for VPC-level access

### 1.5 Get Connection String

1. Click **Connect** → **Drivers**
2. Select **Node.js** version 4.0+
3. Copy connection string format:
   ```
   mongodb+srv://foodapp.enjrbrq.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509
   ```

---

## 2. Backend Deployment (Render)

### 2.1 Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `foodtech-api`
   - **Region**: Same as MongoDB cluster
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

### 2.2 Environment Variables

Add these in Render **Environment** tab:

```env
# Server
NODE_ENV=production
PORT=4000
API_PREFIX=/api/v1

# MongoDB (X.509)
MONGODB_URI=mongodb+srv://foodapp.enjrbrq.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509
MONGODB_DB=foodtech
MONGODB_TLS_CERT_FILE=/etc/secrets/client.pem
MONGODB_TLS_CA_FILE=/etc/secrets/ca.pem

# JWT (Generate secure 64-char secrets)
JWT_SECRET=your-super-secure-64-character-random-string-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=another-super-secure-64-character-random-string-here
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.expo.dev
```

### 2.3 Add Secret Files (X.509 Certificates)

1. In Render **Environment** → **Secret Files**
2. Add two secret files:
   - **Key**: `client.pem` → **Value**: Paste your client certificate content
   - **Key**: `ca.pem` → **Value**: Paste your CA certificate content
3. Mount path: `/etc/secrets/`

### 2.4 Health Check

1. In **Settings** → **Health Check Path**: `/health`
2. Ensure your backend has a `/health` endpoint returning 200 OK

### 2.5 Custom Domain (Optional)

1. In **Settings** → **Custom Domains**
2. Add your domain: `api.foodtech.yourdomain.com`
3. Configure DNS CNAME to Render's `.onrender.com` URL
4. Render provisions SSL automatically

### 2.6 Deploy

1. Click **Create Web Service**
2. Wait for build and deploy (5-10 minutes)
3. Verify at: `https://foodtech-api.onrender.com/health`

---

## 3. Mobile Deployment (EAS Build)

### 3.1 Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 3.2 Configure EAS

```bash
cd mobile
eas build:configure
```

Select **Android** platform. This creates `eas.json`.

### 3.3 Configure eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 3.4 Environment Variables for Mobile

Create `.env.production` in `mobile/`:

```env
EXPO_PUBLIC_API_URL=https://foodtech-api.onrender.com/api/v1
EXPO_PUBLIC_APP_ENV=production
```

### 3.5 Build for Production

```bash
# Build AAB for Play Store
eas build --platform android --profile production

# Or build APK for direct distribution
eas build --platform android --profile preview
```

### 3.6 Download and Distribute

1. Go to [EAS Build Dashboard](https://expo.dev/accounts/[username]/projects/foodtech/builds)
2. Download the `.aab` or `.apk` file
3. **Play Store**: Upload AAB via Play Console
4. **Direct**: Distribute APK via Firebase App Distribution or direct download

### 3.7 OTA Updates (Optional)

```bash
# Publish update
eas update --branch production --message "Bug fixes"

# Configure auto-update in app.json
"updates": {
  "enabled": true,
  "checkAutomatically": "ON_LOAD",
  "fallbackToCacheTimeout": 30000
}
```

---

## 4. Environment Configuration Summary

| Environment | Backend URL | Mobile Build | Database |
|-------------|-------------|--------------|----------|
| **Development** | `http://localhost:4000` | Expo Go (local) | Local/Atlas Dev |
| **Staging** | `https://foodtech-api-staging.onrender.com` | EAS Preview (APK) | Atlas Staging |
| **Production** | `https://foodtech-api.onrender.com` | EAS Production (AAB) | Atlas Production |

---

## 5. CI/CD Pipeline (GitHub Actions)

### 5.1 Backend Deploy Workflow

Create `.github/workflows/backend-deploy.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Build
        run: cd backend && npm run build
      - name: Deploy to Render
        uses: render/deploy-action@v1
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

### 5.2 Mobile Build Workflow

Create `.github/workflows/mobile-build.yml`:

```yaml
name: Build Mobile

on:
  push:
    branches: [main]
    paths:
      - 'mobile/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install EAS CLI
        run: npm install -g eas-cli
      - name: Login to Expo
        run: eas login --token ${{ secrets.EXPO_TOKEN }}
      - name: Build Android
        run: cd mobile && eas build --platform android --profile production --non-interactive
```

---

## 6. Secrets Management

### Required Secrets

| Secret | Description | Where |
|--------|-------------|-------|
| `JWT_SECRET` | 64-char random string | Render Env |
| `JWT_REFRESH_SECRET` | 64-char random string | Render Env |
| `MONGODB_TLS_CERT_FILE` | Client certificate | Render Secret File |
| `MONGODB_TLS_CA_FILE` | CA certificate | Render Secret File |
| `EXPO_TOKEN` | Expo access token | GitHub Secrets |
| `RENDER_API_KEY` | Render API key | GitHub Secrets |
| `RENDER_SERVICE_ID` | Render service ID | GitHub Secrets |

### Generate Secure Secrets

```bash
# JWT secrets (64 chars each)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 7. Monitoring & Observability

### 7.1 Backend Logs

- Render provides built-in logging
- View in Render Dashboard → **Logs**
- Add structured logging with `pino` or `winston`

### 7.2 Error Tracking

Recommended: **Sentry** or **Bugsnag**

```bash
# Backend
npm install @sentry/node

# Mobile
npx expo install @sentry/react-native
```

### 7.3 Database Monitoring

- MongoDB Atlas provides built-in metrics
- Set up alerts for:
  - Connection count > 80%
  - CPU > 70%
  - Memory > 80%
  - Slow queries

---

## 8. Rollback Procedures

### Backend Rollback

1. Go to Render Dashboard → **Deploys**
2. Click **Rollback** on previous successful deploy
2. Or: `git revert <commit> && git push`

### Mobile Rollback

1. **Play Store**: Release previous bundle version
2. **Direct APK**: Distribute previous APK
3. **OTA Updates**: `eas update --branch production --message "Rollback" --revision <previous>`

---

## 9. Security Checklist

- [ ] JWT secrets are 64+ characters, randomly generated
- [ ] X.509 certificates stored as secret files (not in env vars)
- [ ] MongoDB Network Access restricted to Render IPs
- [ ] CORS configured for production frontend URL only
- [ ] HTTPS enforced on all endpoints
- [ ] Rate limiting enabled on auth endpoints
- [ ] Helmet.js headers configured
- [ ] Input validation with Zod on all endpoints
- [ ] RBAC enforced on all protected routes
- [ ] QR tokens use HMAC + short expiry (30s)

---

## 10. Cost Estimation (Monthly)

| Service | Tier | Estimated Cost |
|---------|------|----------------|
| MongoDB Atlas | M10 (Production) | $57/month |
| Render Web Service | Standard | $25/month |
| EAS Build | Production | Included in Expo plan |
| Expo Account | Production | $29/month |
| **Total** | | **~$111/month** |

*Development tiers (M0, Render Free, Expo Free) = $0/month*

---

## 11. Troubleshooting

### Backend Won't Start

1. Check Render logs for errors
2. Verify environment variables are set
3. Check X.509 certificate paths: `/etc/secrets/client.pem`
4. Ensure MongoDB Network Access allows Render IPs

### Mobile Build Fails

1. Check EAS build logs
2. Verify `eas.json` configuration
3. Check for TypeScript errors: `npx tsc --noEmit`
4. Ensure all dependencies installed: `npm ci`

### Database Connection Fails

1. Verify X.509 certificates are valid (not expired)
2. Check MongoDB Atlas Network Access
3. Verify connection string format
4. Test locally with certificates first

### QR Scanner Not Working

1. Ensure `expo-camera` permissions granted
2. Test on physical device (not emulator)
3. Check camera device availability
4. Verify barcode scanner settings

---

## 12. Support & Maintenance

### Regular Tasks

- **Weekly**: Check Render logs, MongoDB metrics
- **Monthly**: Rotate JWT secrets, update dependencies
- **Quarterly**: Review security, update certificates
- **Annually**: Renew X.509 certificates (1 year validity)

### Useful Commands

```bash
# Backend local dev
cd backend && npm run dev

# Mobile local dev
cd mobile && npx expo start

# Type checking
cd backend && npx tsc --noEmit
cd mobile && npx tsc --noEmit

# Linting
cd backend && npm run lint
cd mobile && npm run lint

# Database backup (Atlas)
# Use Atlas UI → Backup → On-demand backup
```

---

*Document Version: 1.0*
*Last Updated: 2026-11-14*
*For FoodTech Application (HungerBox Clone)*