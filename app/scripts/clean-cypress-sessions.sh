#!/bin/bash

# Script to clean Cypress sessions and restart tests
# Usage: ./scripts/clean-cypress-sessions.sh

echo "🧹 Cleaning Cypress sessions..."

# Remove Cypress session cache
if [ -d "cypress/.sessions" ]; then
    rm -rf cypress/.sessions
    echo "✅ Session cache removed"
else
    echo "ℹ️  No session cache found"
fi

# Remove test screenshots and videos
if [ -d "cypress/screenshots" ]; then
    rm -rf cypress/screenshots
    echo "✅ Screenshots removed"
fi

if [ -d "cypress/videos" ]; then
    rm -rf cypress/videos
    echo "✅ Videos removed"
fi

# Remove previous reports
if [ -d "cypress/reports" ]; then
    rm -rf cypress/reports
    echo "✅ Reports removed"
fi

echo "🎯 Cleanup completed. You can now restart the tests."
echo ""
echo "Available commands:"
echo "  npm run cypress:open    # Graphical interface"
echo "  npm run cypress:run     # Headless execution"
echo "  npm run test:e2e        # Complete E2E tests"
