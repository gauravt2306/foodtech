# FoodTech Mobile - EAS Build Deployment Guide

This guide covers building and deploying the FoodTech React Native app using Expo Application Services (EAS).

---

## Quick Start

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure project
cd mobile
eas build:configure

# 4. Build for Android
eas build --platform android --profile production
```

---

## Prerequisites

### Accounts & Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20+ | Runtime |
| **npm** | 10+ | Package manager |
| **EAS CLI** | 5+ | Build management |
| **Expo Account** | - | EAS services |
| **GitHub** | - | Source control |

### Expo Account Setup

1. Create account at [expo.dev](https://expo.dev)
2. Verify email
3. Create organization (optional): `foodtech`
4. Note your **username** for build commands

---

## EAS Configuration

### eas.json Complete Configuration

```json
{
  "cli": {
    "version": ">= 5.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk",
        "image": "latest"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "image": "latest"
      },
      "channel": "preview"
    },
    "production": {
      "android": {
        "buildType": "app-bundle",
        "image": "latest"
      },
      "channel": "production",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### Profile Comparison

| Feature | Development | Preview | Production |
|---------|-------------|---------|------------|
| **Build Type** | Debug APK | Release APK | Release AAB |
| **Dev Client** | Yes | No | No |
| **Distribution** | Internal | Internal | Store/Internal |
| **Hermes** | Enabled | Enabled | Enabled |
| **Minify** | No | Yes | Yes |
| **Source Maps** | Yes | No | No |
| **Auto Increment** | No | No | Yes |

---

## Project Configuration

### app.json / app.config.js

```javascript
// mobile/app.config.js
export default ({ config }) => ({
  ...config,
  name: 'FoodTech',
  slug: 'foodtech',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FF5722'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.foodtech.app',
    infoPlist: {
      NSCameraUsageDescription: 'FoodTech needs camera access to scan QR codes for order handoff.',
      NSPhotoLibraryUsageDescription: 'FoodTech needs photo library access to scan QR codes from screenshots.',
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FF5722'
    },
    package: 'com.foodtech.app',
    versionCode: 1,
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE'
    ],
    googleServicesFile: './google-services.json'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-router',
    'expo-camera',
    'expo-image-picker',
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: true
        }
      }
    ],
    [
      'expo-updates',
      {
        username: 'your-expo-username',
        checkAutomatically: 'ON_LOAD'
      }
    ]
  ],
  extra: {
    eas: {
      projectId: 'your-project-id'
    }
  },
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 30000,
    url: 'https://u.expo.dev/your-project-id'
  },
  runtimeVersion: {
    policy: 'appVersion'
  }
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "start:dev": "expo start --dev-client",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "build:dev": "eas build --profile development --platform android",
    "build:preview": "eas build --profile preview --platform android",
    "build:prod": "eas build --profile production --platform android",
    "submit:prod": "eas submit --platform android --profile production",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "prebuild": "expo prebuild --clean"
  }
}
```

---

## Environment Variables

### Development (.env.development)

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_ENABLE_LOGGING=true
```

### Preview (.env.preview)

```env
EXPO_PUBLIC_API_URL=https://foodtech-api-staging.onrender.com/api/v1
EXPO_PUBLIC_APP_ENV=staging
EXPO_PUBLIC_ENABLE_LOGGING=true
```

### Production (.env.production)

```env
EXPO_PUBLIC_API_URL=https://foodtech-api.onrender.com/api/v1
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_ENABLE_LOGGING=false
```

### Using Environment Files

```bash
# Build with specific env
eas build --profile preview --platform android --non-interactive

# Or set in eas.json
"preview": {
  "env": {
    "EXPO_PUBLIC_API_URL": "https://foodtech-api-staging.onrender.com/api/v1"
  }
}
```

---

## Building

### Development Build (Debug APK)

```bash
# For testing with dev client
eas build --profile development --platform android

# Output: APK installable on device/emulator
# Includes dev menu, hot reload, debugging
```

### Preview Build (Release APK)

```bash
# For internal testing/QA
eas build --profile preview --platform android

# Output: Release APK (smaller, optimized)
# No dev menu, production JS bundle
```

### Production Build (AAB for Play Store)

```bash
# For Play Store submission
eas build --profile production --platform android

# Output: Android App Bundle (.aab)
# Optimized, signed, ready for Play Console
```

### Build with Specific Options

```bash
# Non-interactive (CI/CD)
eas build --profile production --platform android --non-interactive

# Local build (requires Docker)
eas build --profile production --platform android --local

# Clear cache and rebuild
eas build --profile production --platform android --clear-cache

# Build for specific git ref
eas build --profile production --platform android --git-ref v1.0.0
```

---

## Build Process Details

### What Happens During Build

```
1. 📦 Clone repository
2. 📥 Install dependencies (npm ci)
3. 🔧 Run prebuild (expo prebuild)
4. 🏗️  Configure Gradle
5. 📱 Build Android (Gradle)
6. 🔐 Sign artifacts
7. 📤 Upload to EAS
8. 🔗 Generate artifact URL
```

### Build Artifacts

| Profile | Artifact | Size | Use Case |
|---------|----------|------|----------|
| Development | `.apk` | ~50-80 MB | Development, debugging |
| Preview | `.apk` | ~30-50 MB | QA, internal testing |
| Production | `.aab` | ~20-40 MB | Play Store submission |

### Build Time Estimates

| Profile | Time (Cloud) | Time (Local) |
|---------|--------------|--------------|
| Development | 8-12 min | 5-8 min |
| Preview | 10-15 min | 8-12 min |
| Production | 12-18 min | 10-15 min |

---

## Code Signing

### Automatic (Recommended)

EAS manages keystores automatically:

```json
// eas.json
"production": {
  "android": {
    "credentialsSource": "remote"
  }
}
```

### Manual Keystore

```bash
# Generate keystore
keytool -genkeypair -v -keystore foodtech-release.keystore \
  -alias foodtech -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass <password> -keypass <password>

# Configure in eas.json
"production": {
  "android": {
    "credentialsSource": "local",
    "keystore": {
      "keystorePath": "./foodtech-release.keystore",
      "keystorePassword": "<password>",
      "keyAlias": "foodtech",
      "keyPassword": "<password>"
    }
  }
}
```

### Backup Keystore

**Critical**: Store keystore securely!

```bash
# Backup to secure location
cp foodtech-release.keystore ~/secure-backup/
# Or use 1Password, Bitwarden, etc.
```

---

## Submitting to Play Store

### Prerequisites

1. **Google Play Console** account ($25 one-time fee)
2. **Service Account** with Release Manager role
3. **App created** in Play Console

### Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project or select existing
3. **IAM & Admin** → **Service Accounts**
4. Create service account: `foodtech-play-store`
5. Grant **Release Manager** role
6. Create **JSON key** → Download

### Configure Submit

```json
// eas.json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-play-service-account.json",
      "track": "internal",
      "changesNotSentForReview": true
    }
  }
}
```

### Submit Build

```bash
# Submit latest production build
eas submit --platform android --profile production

# Submit specific build
eas submit --platform android --profile production --build-id <build-id>

# Submit to different track
eas submit --platform android --profile production --track beta
```

### Play Store Tracks

| Track | Use Case | Review Time |
|-------|----------|-------------|
| **Internal** | Team testing | Minutes |
| **Closed** | Beta testers | Hours |
| **Open** | Public beta | Hours |
| **Production** | Live users | Days |

---

## OTA Updates (Expo Updates)

### Configuration

```json
// app.config.js
updates: {
  enabled: true,
  checkAutomatically: 'ON_LOAD',
  fallbackToCacheTimeout: 30000,
  url: 'https://u.expo.dev/your-project-id'
},
runtimeVersion: {
  policy: 'appVersion'
}
```

### Publishing Updates

```bash
# Publish to production channel
eas update --branch production --message "Bug fixes and improvements"

# Publish to preview channel
eas update --branch preview --message "New feature preview"

# Rollback
eas update --branch production --message "Rollback" --revision <previous-revision>
```

### Update Strategies

| Strategy | When to Use |
|----------|-------------|
| **ON_LOAD** | Check on every app start |
| **ON_ERROR_RECOVERY** | Only after crash |
| **MANUAL** | Check via `Updates.checkForUpdateAsync()` |

### Runtime Version Policy

```json
// Auto-increment on version change
"runtimeVersion": { "policy": "appVersion" }

// Manual control
"runtimeVersion": "1.0.0"

// Native changes require new build
"runtimeVersion": { "policy": "nativeVersion" }
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/eas-build.yml
name: EAS Build

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

jobs:
  build-preview:
    name: Build Preview
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: cd mobile && npm ci
      - name: Type check
        run: cd mobile && npm run typecheck
      - name: Lint
        run: cd mobile && npm run lint
      - name: Install EAS CLI
        run: npm install -g eas-cli
      - name: Login to Expo
        run: eas login --token ${{ secrets.EXPO_TOKEN }}
      - name: Build Preview
        run: cd mobile && eas build --profile preview --platform android --non-interactive

  build-production:
    name: Build Production
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install dependencies
        run: cd mobile && npm ci
      - name: Install EAS CLI
        run: npm install -g eas-cli
      - name: Login to Expo
        run: eas login --token ${{ secrets.EXPO_TOKEN }}
      - name: Build Production
        run: cd mobile && eas build --profile production --platform android --non-interactive
      - name: Submit to Play Store
        run: cd mobile && eas submit --platform android --profile production --non-interactive
```

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `EXPO_TOKEN` | `eas login --token` output |
| `GOOGLE_PLAY_SERVICE_ACCOUNT` | Base64 encoded JSON key |

---

## Troubleshooting

### Common Build Errors

| Error | Solution |
|-------|----------|
| `Gradle build failed` | Check `eas build:inspect` logs, verify dependencies |
| `Keystore not found` | Run `eas credentials` to configure |
| `Out of memory` | Use `image: "large"` in eas.json |
| `Dependency conflict` | Use `--legacy-peer-deps` in package.json |
| `Camera permission denied` | Add permissions to app.config.js |

### Debugging Build Failures

```bash
# Inspect build logs
eas build:list
eas build:view <build-id>

# Local build with debug
eas build --profile preview --platform android --local --clear-cache

# Check credentials
eas credentials --platform android
```

### Common Runtime Issues

| Issue | Solution |
|-------|----------|
| `Network request failed` | Check API URL, enable cleartext for dev |
| `QR scanner not working` | Test on physical device, check permissions |
| `Font not loading` | Add `expo-font` plugin, preload fonts |
| `Splash screen stuck` | Check `expo-splash-screen` config |

---

## Performance Optimization

### Bundle Size Optimization

```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierConfig: {
      compress: {
        drop_console: true,
        pure_funcs: ['console.log'],
      },
    },
  },
  resolver: {
    blockList: [/.*\/__tests__\/.*/],
  },
};
```

### Hermes Optimization

```json
// app.config.js
"android": {
  "jsEngine": "hermes"
}
```

### Bundle Analyzer

```bash
# Analyze bundle
npx expo-doctor
npx react-native-bundle-visualizer
```

---

## Distribution Channels

### Internal Distribution

| Method | Command | Audience |
|--------|---------|----------|
| **EAS Build** | `eas build --profile preview` | Team via email/link |
| **Firebase App Distribution** | `eas build --profile preview` + upload | Testers with groups |
| **Direct APK** | Download from EAS | Ad-hoc sharing |

### Production Distribution

| Method | Command | Audience |
|--------|---------|----------|
| **Play Store** | `eas submit` | Public users |
| **Enterprise** | `eas build --profile production` + MDM | Employees only |
| **Website** | Download AAB → extract APK | Direct users |

---

## Monitoring Builds

### Build Notifications

```bash
# Enable email notifications
eas notification:enable --email your@email.com

# Slack integration (via webhook)
# Configure in Expo dashboard → Project → Integrations
```

### Build Metrics

Track in EAS Dashboard:
- **Build success rate**
- **Average build time**
- **Artifact sizes**
- **Platform distribution**

---

## Cost Management

### EAS Pricing (2024)

| Plan | Build Minutes | Price |
|------|---------------|-------|
| **Free** | 30/month | $0 |
| **Production** | 200/month | $29 |
| **Enterprise** | Unlimited | Custom |

### Optimization Tips

1. **Use preview builds** for PRs (cheaper than production)
2. **Cache dependencies** - EAS caches `node_modules` automatically
3. **Parallel builds** - Build Android/iOS simultaneously
4. **Local builds** - Free, uses your machine

---

## Security Best Practices

### Credentials

- [ ] Use **remote credentials** (EAS managed)
- [ ] Rotate **service account keys** quarterly
- [ ] Store keystore backup in **password manager**
- [ ] Never commit credentials to git

### App Security

```javascript
// app.config.js - Production hardening
android: {
  package: 'com.foodtech.app',
  versionCode: 1,
  permissions: ['CAMERA'], // Minimal permissions
  blockUntrustedTouches: true,
  usesCleartextTraffic: false, // Always false in production
}
```

### Certificate Pinning (Advanced)

```typescript
// services/api.ts
import { CertificatePinning } from 'expo-certificates';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

CertificatePinning.checkServerTrust('foodtech-api.onrender.com', [
  'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
]);
```

---

## Useful Commands Reference

```bash
# Project setup
eas init                    # Initialize EAS project
eas build:configure         # Create eas.json
eas credentials            # Manage credentials

# Building
eas build --profile development --platform android
eas build --profile preview --platform android
eas build --profile production --platform android
eas build --profile production --platform all
eas build --local --profile production --platform android

# Submitting
eas submit --platform android --profile production
eas submit --platform android --track beta

# Updates
eas update --branch production --message "Fix bug"
eas update --branch preview --message "New feature"
eas update:list --branch production
eas update:rollback --branch production

# Inspecting
eas build:list
eas build:view <build-id>
eas build:cancel <build-id>
eas build:inspect <build-id> --platform android

# Credentials
eas credentials --platform android
eas credentials:push --platform android
eas credentials:pull --platform android

# Project info
eas whoami
eas project:list
eas project:info
```

---

## Reference Links

- [EAS Documentation](https://docs.expo.dev/eas/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [EAS CLI Reference](https://docs.expo.dev/eas-cli/)
- [App Config](https://docs.expo.dev/versions/latest/config/app/)
- [Expo Plugins](https://docs.expo.dev/guides/config-plugins/)
- [Play Store Publishing](https://docs.expo.dev/distribution/publishing-to-play-store/)
- [Code Signing](https://docs.expo.dev/build-reference/code-signing/)

---

*Document Version: 1.0*
*Last Updated: 2026-11-14*
*For FoodTech Mobile App Deployment via EAS Build*