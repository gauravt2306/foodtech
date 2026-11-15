# FoodTech Backend (.NET 10) - Render Deployment Guide (X.509 Certificate Auth)

This guide provides steps for deploying the FoodTech .NET 10 backend API to Render using Docker with MongoDB X.509 certificate authentication.

---

## Quick Start

```bash
# 1. Push to GitHub
git add .
git commit -m "Prepare for Render deployment with X.509 auth"
git push origin main

# 2. Generate X.509 certificates for MongoDB Atlas
# 3. Configure MongoDB Atlas for X.509 authentication
# 4. Add certificates as Secret Files in Render
# 5. Deploy!
```

---

## MongoDB Atlas X.509 Setup (Required First)

### 1. Generate Client Certificate

```bash
# Generate private key and CSR
openssl req -newkey rsa:2048 -nodes -keyout client.key -out client.csr -subj "/CN=foodtech-client"

# Generate self-signed certificate (valid 1 year)
openssl x509 -req -in client.csr -signkey client.key -out client.crt -days 365

# Combine into PEM format (certificate + private key)
cat client.crt client.key > client.pem

# Download MongoDB Atlas CA certificate
# Go to Atlas → Connect → Drivers → C# → "I need the CA file"
# Or download from: https://www.mongodb.com/docs/atlas/security-x509/#download-the-ca-certificate
# Save as ca.pem
```

### 2. Configure MongoDB Atlas

1. **Security** → **Authentication** → **Enable X.509 Authentication**
2. **Database Access** → **Add New Database User** → **X.509**
   - Username: `CN=foodtech-client` (must match certificate CN)
   - Database User Privileges: `Atlas admin` or custom role with readWrite
3. **Network Access** → **Add IP Address** → `0.0.0.0/0` (Allow from anywhere)
4. **Clusters** → **Connect** → **Drivers** → **C# / .NET Standard 2.1+**
   - Copy connection string (NO password, uses `authSource=%24external&authMechanism=MONGODB-X509`)

**Connection String Format:**
```
mongodb+srv://cluster0.abc123.mongodb.net/foodtech?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority
```

---

## Render Service Configuration

### render.yaml (already configured)

```yaml
services:
  - type: web
    name: foodtech-api
    runtime: docker
    region: oregon
    plan: free
    dockerfilePath: ./FoodTech.Api/Dockerfile
    dockerContext: ./FoodTech.Api
    healthCheckPath: /health
    envVars:
      - key: ASPNETCORE_ENVIRONMENT
        value: Production
      - key: ASPNETCORE_URLS
        value: http://+:8080
      - key: ConnectionStrings__MongoDB
        sync: false
      - key: MongoDb__ClientCertificatePath
        value: /etc/secrets/client.pem
      - key: MongoDb__ClientCertificatePassword
        value: ""
      - key: JwtSettings__Secret
        sync: false
      - key: JwtSettings__Issuer
        value: foodtech-api
      - key: JwtSettings__Audience
        value: foodtech-app
      - key: JwtSettings__AccessTokenExpiryMinutes
        value: "60"
      - key: QR__SecretKey
        sync: false
    secretFiles:
      - key: client.pem
        path: /etc/secrets/client.pem
      - key: ca.pem
        path: /etc/secrets/ca.pem
    scaling:
      minInstances: 1
      maxInstances: 1
```

---

## Environment Variables (Render Dashboard → Environment)

### Non-Secret Variables

| Key | Value |
|-----|-------|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ASPNETCORE_URLS` | `http://+:8080` |
| `MongoDb__ClientCertificatePath` | `/etc/secrets/client.pem` |
| `MongoDb__ClientCertificatePassword` | *(empty)* |
| `JwtSettings__Issuer` | `foodtech-api` |
| `JwtSettings__Audience` | `foodtech-app` |
| `JwtSettings__AccessTokenExpiryMinutes` | `60` |

### Secret Variables (Mark "Secret" checkbox)

| Key | Value |
|-----|-------|
| `ConnectionStrings__MongoDB` | `mongodb+srv://cluster0.abc123.mongodb.net/foodtech?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority` |
| `JwtSettings__Secret` | `DEe7MzNbgCYlVXmmxFXeyWbiPV6I2a4H6gdylfVV6iiRRTaGlWyJeu1LlyMNOC2g` |
| `QR__SecretKey` | `64B9u6hZTxFkNq8P2GduEDHsbDqiJ3mq` |

---

## Secret Files (Render Dashboard → Environment → Secret Files)

**Add two secret files:**

| Key | Path | Content |
|-----|------|---------|
| `client.pem` | `/etc/secrets/client.pem` | Your `client.pem` (cert + private key) |
| `ca.pem` | `/etc/secrets/ca.pem` | MongoDB Atlas CA certificate |

### Certificate Format

**client.pem** (PEM with private key):
```
-----BEGIN CERTIFICATE-----
MIIF...
...
-----END CERTIFICATE-----
-----BEGIN PRIVATE KEY-----
MIIE...
...
-----END PRIVATE KEY-----
```

**ca.pem** (CA certificate only):
```
-----BEGIN CERTIFICATE-----
MIID...
...
-----END CERTIFICATE-----
```

---

## Complete .env Reference (for local development)

```env
# FoodTech .NET 10 Backend - Environment Variables (X.509 Certificate Auth)
# ============================================

# ASP.NET Core Configuration
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080

# MongoDB Connection (X.509 Certificate Authentication)
ConnectionStrings__MongoDB=mongodb+srv://cluster0.abc123.mongodb.net/foodtech?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority

# MongoDB X.509 Certificate Settings
MongoDb__ClientCertificatePath=/etc/secrets/client.pem
MongoDb__ClientCertificatePassword=

# JWT Authentication
JwtSettings__Secret=DEe7MzNbgCYlVXmmxFXeyWbiPV6I2a4H6gdylfVV6iiRRTaGlWyJeu1LlyMNOC2g
JwtSettings__Issuer=foodtech-api
JwtSettings__Audience=foodtech-app
JwtSettings__AccessTokenExpiryMinutes=60

# QR Code Signing
QR__SecretKey=64B9u6hZTxFkNq8P2GduEDHsbDqiJ3mq
```

---

## Deploy Steps

### Option 1: Blueprint (Recommended - uses render.yaml)

1. Render Dashboard → **Blueprints** → **New Blueprint Instance**
2. Connect `gauravt2306/foodtech` repo
3. Render provisions service + secret file placeholders
4. **Environment** → Add 3 secret variables above
5. **Environment** → **Secret Files** → Add `client.pem` and `ca.pem`
6. **Deploy**

### Option 2: Web Service (Manual)

1. **New** → **Web Service** → Connect repo
2. Runtime: **Docker**
3. Dockerfile: `FoodTech.Api/Dockerfile`
4. Context: `FoodTech.Api`
5. Add all environment variables above
6. **Secret Files** → Add `client.pem` and `ca.pem`
7. **Create Web Service**

---

## Local Development with Certificates

```bash
# 1. Place certificates in local folder
mkdir -p certs
cp client.pem certs/
cp ca.pem certs/

# 2. Run with local cert paths
export ConnectionStrings__MongoDB="mongodb+srv://cluster0.abc123.mongodb.net/foodtech?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority"
export MongoDb__ClientCertificatePath="./certs/client.pem"
export MongoDb__ClientCertificatePassword=""

dotnet run --project FoodTech.Api/src/FoodTech.Api
```

---

## Health Check & Verification

```bash
# Health endpoint
curl https://foodtech-api.onrender.com/health

# Expected response:
# {"status":"healthy","version":"1.0.0","timestamp":"...","databaseConnected":true}

# If databaseConnected: false → Check certificate, connection string, Atlas network access
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `databaseConnected: false` | Verify Atlas X.509 enabled, cert CN matches DB user, Network Access `0.0.0.0/0` |
| `Authentication failed` | Check client.pem has both cert + private key, CA cert is correct |
| `Certificate not found` | Verify Secret Files mounted at `/etc/secrets/client.pem` |
| `Connection timeout` | Atlas Network Access must allow `0.0.0.0/0` or Render IPs |
| `Invalid certificate` | Ensure PEM format, no extra whitespace, cert not expired |

---

## Generate Certificates Script

```bash
#!/bin/bash
# gen-certs.sh - Run locally to generate X.509 certs for MongoDB Atlas

openssl req -newkey rsa:2048 -nodes -keyout client.key -out client.csr -subj "/CN=foodtech-client"
openssl x509 -req -in client.csr -signkey client.key -out client.crt -days 365
cat client.crt client.key > client.pem

# Download ca.pem from MongoDB Atlas:
# https://www.mongodb.com/docs/atlas/security-x509/#download-the-ca-certificate

echo "client.pem created. Upload to Render Secret Files."
echo "Download ca.pem from Atlas and upload as second secret file."
```

---

## Free Tier Limits

| Limit | Value |
|-------|-------|
| **Hours/month** | 750 (24/7 for 1 service) |
| **Spin-down** | After 15 min inactivity |
| **Cold start** | ~10-30 seconds |
| **RAM** | 512 MB |
| **CPU** | Shared |

---

## Security Checklist

- [ ] X.509 enabled in MongoDB Atlas
- [ ] Certificate CN matches Atlas database user
- [ ] Private key included in client.pem
- [ ] CA certificate from Atlas (not self-signed)
- [ ] Network Access: `0.0.0.0/0` (or Render IP ranges)
- [ ] Strong JWT secret (64+ chars)
- [ ] QR secret key (32+ chars)
- [ ] HTTPS enforced (Render default)
- [ ] Secret Files used for certificates (not env vars)

---

## Reference Links

- [MongoDB Atlas X.509 Authentication](https://www.mongodb.com/docs/atlas/security-x509/)
- [Render Secret Files](https://render.com/docs/secret-files)
- [Render Docker Deploy](https://render.com/docs/deploy-docker-image)
- [.NET X509Certificate2.CreateFromPem](https://learn.microsoft.com/dotnet/api/system.security.cryptography.x509certificates.x509certificate2.createfrompem)

---

*Document Version: 3.0*  
*Last Updated: 2026-11-15*  
*For FoodTech .NET 10 Backend API Deployment on Render with X.509 Auth*