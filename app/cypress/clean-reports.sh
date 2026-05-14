#!/bin/bash

# Cypress reports cleanup script
# Usage: ./cypress/clean-reports.sh

REPORTS_DIR="cypress/reports"

echo "🧹 Cleaning old Cypress reports..."

# Create reports directory if it doesn't exist
mkdir -p "$REPORTS_DIR"
mkdir -p "$REPORTS_DIR/html"

# Remove all old individual reports
echo "📁 Removing individual reports..."
rm -f "$REPORTS_DIR"/mochawesome_*.json
rm -f "$REPORTS_DIR"/mochawesome_*.html

# Keep the consolidated report
echo "✅ Keeping consolidated report..."
echo "   - $REPORTS_DIR/merged-report.json"
echo "   - $REPORTS_DIR/html/merged-report.html"

# Remove old assets if they exist
if [ -d "$REPORTS_DIR/assets" ]; then
    echo "🗑️ Removing old assets..."
    rm -rf "$REPORTS_DIR/assets"
fi

echo "✨ Cleanup completed!"
echo "📊 Next report: pnpm run test:e2e:a11y:report"
