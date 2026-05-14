#!/bin/bash
# @format

# Script to retrieve Vercel information needed for GitHub secrets

echo "🔍 Retrieving Vercel information for GitHub Actions..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from app/"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm i -g vercel
fi

echo "🔗 Linking Vercel project..."
vercel link --yes

# Check if .vercel/project.json exists
if [ ! -f ".vercel/project.json" ]; then
    echo "❌ Error: .vercel/project.json not found. Make sure 'vercel link' succeeded."
    exit 1
fi

echo ""
echo "✅ Information retrieved!"
echo ""
echo "📋 Secrets to configure on GitHub:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Extract information from project.json file
ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)
PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)

echo "🔑 VERCEL_ORG_ID:"
echo "   $ORG_ID"
echo ""
echo "🔑 VERCEL_PROJECT_ID:" 
echo "   $PROJECT_ID"
echo ""
echo "🔑 VERCEL_TOKEN:"
echo "   Generate at: https://vercel.com/account/tokens"
echo "   (Create a new token with Deploy permissions)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next steps:"
echo "1. Go to GitHub: Settings > Secrets and variables > Actions"
echo "2. Add the 3 secrets above"
echo "3. Create a Pull Request to test preview deployment"
echo ""
echo "🎯 Configuration file saved in .vercel/"
