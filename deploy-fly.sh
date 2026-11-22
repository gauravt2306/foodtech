#!/bin/bash
# Fly.io deployment script for FoodTech API
# Run: chmod +x deploy-fly.sh && ./deploy-fly.sh

set -e

APP_NAME="foodtech-api"
DB_NAME="foodtech-db"

echo "🚀 Deploying FoodTech API to Fly.io"

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

# 4. Create PostgreSQL database
if ! flyctl postgres list | grep -q "$DB_NAME"; then
    echo "🐘 Creating PostgreSQL: $DB_NAME"
    flyctl postgres create --name "$DB_NAME" --region sea --vm-size shared-cpu-1x --volume-size 3

    echo "⏳ Waiting for database to be ready..."
    sleep 30
fi

# 5. Attach database (sets DATABASE_URL secret automatically)
echo "🔗 Attaching database..."
flyctl postgres attach "$DB_NAME" --app "$APP_NAME"

# 6. Set secrets (run these manually with your values)
echo ""
echo "🔑 SET THESE SECRETS MANUALLY:"
echo "flyctl secrets set JwtSettings__Secret=\"YOUR_32_CHAR_SECRET\" --app $APP_NAME"
echo "flyctl secrets set QR__SecretKey=\"YOUR_32_CHAR_SECRET\" --app $APP_NAME"
echo ""
read -p "Press Enter after setting secrets..."

# 7. Deploy
echo "🚀 Deploying..."
flyctl deploy --app "$APP_NAME" --dockerfile FoodTech.Api/Dockerfile

# 8. Show status
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