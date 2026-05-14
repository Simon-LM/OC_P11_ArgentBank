#!/bin/bash
# Local test script to simulate Cypress CI/CD conditions

echo "🧪 Cypress CI/CD Simulation Test"
echo "================================"

# Check if local server is running
echo "📍 Checking local server..."
curl -s -I "http://localhost:3000" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Local server not accessible on http://localhost:3000"
    echo "Please start 'vercel dev' in another terminal"
    exit 1
fi
echo "✅ Local server accessible"

# Simulate CI/CD environment variables
export CI=true
export VERCEL_AUTOMATION_BYPASS_SECRET="test-local-bypass-secret"
export CYPRESS_BASE_URL="http://localhost:3000"

echo ""
echo "🔧 Environment variables configured:"
echo "   CI: $CI"
echo "   CYPRESS_BASE_URL: $CYPRESS_BASE_URL"
echo "   VERCEL_AUTOMATION_BYPASS_SECRET: $(if [ -n "$VERCEL_AUTOMATION_BYPASS_SECRET" ]; then echo '***SECRET_PRESENT***'; else echo 'NOT_FOUND'; fi)"

echo ""
echo "🚀 Running Cypress test with CI/CD simulation..."
echo "   (Bypass headers will be configured automatically)"

# Run Cypress with a specific test to reduce execution time
pnpm exec cypress run \
  --config baseUrl=$CYPRESS_BASE_URL \
  --spec "cypress/e2e/auth/login.cy.ts" \
  --browser electron \
  --headless

echo ""
echo "📋 Test completed"
echo "Check the logs above to confirm that:"
echo "   ✅ '🔐 [Cypress CI/CD] Configuring Vercel bypass headers...' appears"
echo "   ✅ '✅ [Cypress CI/CD] Vercel bypass headers configured successfully' appears"
echo "   ✅ Tests pass or at least start correctly"
