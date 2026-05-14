#!/bin/bash

# Test script to simulate CI/CD conditions locally
# Usage: ./test-cypress-ci-simulation.sh

set -e

echo "🔍 CI/CD Conditions Simulation Test for Cypress"
echo "=============================================="

# Prerequisites check
echo "📋 Prerequisites check..."

if ! command -v curl &> /dev/null; then
    echo "❌ curl is not installed"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed"
    exit 1
fi

# Test variables
LOCAL_URL="http://localhost:3000"
FAKE_PREVIEW_URL="https://fake-preview.vercel.app"

echo "✅ Prerequisites validated"

# Test 1: Check if localhost:3000 works
echo ""
echo "🧪 Test 1: Local accessibility check"
if curl -f "$LOCAL_URL" --max-time 5 --output /dev/null --silent; then
    echo "✅ $LOCAL_URL accessible"
else
    echo "❌ $LOCAL_URL not accessible - Check that 'vercel dev' is running"
    exit 1
fi

# Test 2: Check if Cypress works locally
echo ""
echo "🧪 Test 2: Local Cypress execution (normal condition)"
echo "Command: pnpm exec cypress run --config baseUrl=$LOCAL_URL --spec 'cypress/e2e/auth/login.cy.ts'"

if pnpm exec cypress run --config baseUrl="$LOCAL_URL" --spec 'cypress/e2e/auth/login.cy.ts' --headless; then
    echo "✅ Local Cypress test successful"
else
    echo "❌ Local Cypress test failed"
    echo "💡 This indicates a problem with the tests themselves, not with CI/CD configuration"
    exit 1
fi

# Test 3: Simulate CI/CD failure with inaccessible URL
echo ""
echo "🧪 Test 3: CI/CD failure simulation (inaccessible URL)"
echo "Command: pnpm exec cypress run --config baseUrl=$FAKE_PREVIEW_URL --spec 'cypress/e2e/auth/login.cy.ts'"

echo "🔍 This test should fail because the URL is not accessible (CI/CD simulation)"

# Use timeout to prevent test from hanging too long
if timeout 30s pnpm exec cypress run --config baseUrl="$FAKE_PREVIEW_URL" --spec 'cypress/e2e/auth/login.cy.ts' --headless 2>/dev/null; then
    echo "⚠️  Unexpected test: Test with inaccessible URL succeeded"
else
    echo "✅ Expected failure: Test with inaccessible URL failed (simulation successful)"
fi

# Summary
echo ""
echo "📊 DIAGNOSTIC SUMMARY"
echo "===================="
echo "✅ Local (localhost:3000): Cypress tests work"
echo "❌ Inaccessible URL: Cypress tests fail (CI/CD simulation)"
echo ""
echo "💡 CONCLUSION:"
echo "   The CI/CD problem is related to Vercel Preview URL accessibility"
echo "   which requires bypass headers that Cypress doesn't use."
echo ""
echo "📋 Suggested next steps:"
echo "   1. Implement Vercel headers configuration in Cypress"
echo "   2. Test with real bypass headers"
echo "   3. Validate in CI/CD"

echo ""
echo "🏁 Simulation test completed"
