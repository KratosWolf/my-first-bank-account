#!/bin/bash
# scripts/setup-secrets.sh

echo "🔐 Setting up GitHub Secrets..."

# Check if GitHub CLI is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Please authenticate with GitHub CLI first: gh auth login"
    exit 1
fi

echo "📝 You'll need to provide the following secrets:"
echo ""
echo "1. VERCEL_TOKEN - Get from https://vercel.com/account/tokens"
echo "2. VERCEL_ORG_ID - Found in Vercel project settings"
echo "3. VERCEL_PROJECT_ID - Found in Vercel project settings"
echo "4. SLACK_WEBHOOK - Optional: Slack webhook URL for notifications"
echo "5. DISCORD_WEBHOOK - Optional: Discord webhook URL for notifications"
echo "6. DATABASE_URL - Production database connection string"
echo ""

read -p "Do you want to set up secrets now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    
    # Vercel Token
    read -p "Enter VERCEL_TOKEN: " -s VERCEL_TOKEN
    echo
    if [ ! -z "$VERCEL_TOKEN" ]; then
        gh secret set VERCEL_TOKEN --body="$VERCEL_TOKEN"
        echo "✅ VERCEL_TOKEN set"
    fi
    
    # Vercel Org ID
    read -p "Enter VERCEL_ORG_ID: " VERCEL_ORG_ID
    if [ ! -z "$VERCEL_ORG_ID" ]; then
        gh secret set VERCEL_ORG_ID --body="$VERCEL_ORG_ID"
        echo "✅ VERCEL_ORG_ID set"
    fi
    
    # Vercel Project ID
    read -p "Enter VERCEL_PROJECT_ID: " VERCEL_PROJECT_ID
    if [ ! -z "$VERCEL_PROJECT_ID" ]; then
        gh secret set VERCEL_PROJECT_ID --body="$VERCEL_PROJECT_ID"
        echo "✅ VERCEL_PROJECT_ID set"
    fi
    
    # Slack Webhook (optional)
    read -p "Enter SLACK_WEBHOOK (optional): " SLACK_WEBHOOK
    if [ ! -z "$SLACK_WEBHOOK" ]; then
        gh secret set SLACK_WEBHOOK --body="$SLACK_WEBHOOK"
        echo "✅ SLACK_WEBHOOK set"
    fi
    
    # Discord Webhook (optional)
    read -p "Enter DISCORD_WEBHOOK (optional): " DISCORD_WEBHOOK
    if [ ! -z "$DISCORD_WEBHOOK" ]; then
        gh secret set DISCORD_WEBHOOK --body="$DISCORD_WEBHOOK"
        echo "✅ DISCORD_WEBHOOK set"
    fi
    
    # Database URL
    read -p "Enter DATABASE_URL: " -s DATABASE_URL
    echo
    if [ ! -z "$DATABASE_URL" ]; then
        gh secret set DATABASE_URL --body="$DATABASE_URL"
        echo "✅ DATABASE_URL set"
    fi
    
    echo ""
    echo "🎉 Secrets configuration completed!"
    echo ""
    echo "📋 To verify secrets were set correctly:"
    echo "gh secret list"
    
else
    echo "⏭️  Skipping secrets setup."
    echo ""
    echo "💡 You can set secrets manually using:"
    echo "gh secret set SECRET_NAME --body=\"secret_value\""
fi

echo ""
echo "📚 For more information about required secrets, see:"
echo "https://github.com/KratosWolf/my-nextjs-app/blob/main/docs/DEPLOYMENT.md"