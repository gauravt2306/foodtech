#!/bin/bash
# Fly.io deployment script for FoodTech API
# Uses existing Render PostgreSQL database
# Run: chmod +x deploy-fly.sh && ./deploy-fly.sh

set -e

APP_NAME="foodtech-api"
# Render PostgreSQL connection string (already exists)
RENDER_PG="postgresql://foodtech_7rat_user:4ZRyeEcTkCABnVXw91kL3r5LwUfbEnMs@dpg-dbsjd8lg1s2s73fc72d0-a.oregon-postgres.render.com/foodtech_7rat"

echo "🚀 Deploying FoodTech API to Fly.io (using Render PostgreSQL)"

# Add flyctl to PATH
export FLYCTL_INSTALL="$HOME/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

# 1. Check flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "Installing flyctl..."
    curl -L https://fly.io/install.sh | sh
    export FLYCTL_INSTALL="$HOME/.fly"
    export PATH="$FLYCTL_INSTALL/bin:$PATH"
fi

# 2. Login (opens browser)
echo "🔐 Logging into Fly.io..."
flyctl auth login

# 3. Create app if not exists
if ! flyctl apps list | grep -q "$APP_NAME"; then
    echo "📦 Creating app: $APP_NAME"
    flyctl apps create "$APP_NAME" --org personal
fi

# 4. Set Render PostgreSQL connection string
echo "🐘 Setting Render PostgreSQL connection string..."
flyctl secrets set PostgreSql__ConnectionString="$RENDER_PG" --app "$APP_NAME"

# 5. Set secrets (run these manually with your values)
echo ""
echo "🔑 SET THESE SECRETS MANUALLY:"
echo "flyctl secrets set JwtSettings__Secret=\"YOUR_32_CHAR_SECRET\" --app $APP_NAME"
echo "flyctl secrets set QR__SecretKey=\"YOUR_32_CHAR_SECRET\" --app $APP_NAME"
echo ""
read -p "Press Enter after setting secrets..."

# 6. Deploy
echo "🚀 Deploying..."
flyctl deploy --app "$APP_NAME" --dockerfile FoodTech.Api/Dockerfile

# 7. Show status
echo ""
echo "✅ Deployment complete!"
flyctl status --app "$APP_NAME"
echo ""
echo "🌐 Your API: https://$APP_NAME.fly.dev"
echo "📊 Swagger:  https://$APP_NAME.fly.dev/swagger"
echo "❤️  Health:   https://$APP_NAME.fly.dev/health"
echo ""
echo "📝 View logs: flyctl logs --app $APP_NAME"
echo "🔧 SSH:       flyctl ssh console --app $APP_NAME"