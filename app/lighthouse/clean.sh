#!/bin/bash

# Lighthouse folder cleanup script
# This script removes redundant test files while keeping the most recent ones

echo "🧹 Cleaning Lighthouse folder..."

# Go to lighthouse directory
cd "$(dirname "$0")"

# 1. Clean reports directory
echo "📁 Cleaning reports directory..."

# Create temporary folder for files to keep
mkdir -p reports/temp

# Identify latest reports of each type
latest_reports=($(ls -t reports/lighthouse-*.html 2>/dev/null | head -3))
desktop_report=$(find reports -name "lighthouse-*" -type f -exec grep -l "Mode: Desktop" {} \; | head -1)
mobile_report=$(find reports -name "lighthouse-*" -type f -exec grep -l "Mode: Mobile" {} \; | head -1)

# Important files to keep
important_files=(
  "reports/lighthouse-report.json"
  "reports/lighthouse-report.html"
  "reports/index.html"
  "reports/baseline.json"
  "reports/dev-report.html"
)

# Copy latest reports
for report in "${latest_reports[@]}"; do
  if [ -f "$report" ]; then
    cp "$report" reports/temp/
    echo "✅ Kept: $report"
  fi
done

# Copy specific desktop and mobile reports if not already included
if [ -n "$desktop_report" ] && [ -f "$desktop_report" ]; then
  cp "$desktop_report" reports/temp/
  echo "✅ Kept: $desktop_report (Desktop)"
fi

if [ -n "$mobile_report" ] && [ -f "$mobile_report" ]; then
  cp "$mobile_report" reports/temp/
  echo "✅ Kept: $mobile_report (Mobile)"
fi

# Copy important files
for file in "${important_files[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" reports/temp/
    echo "✅ Kept: $file"
  fi
done

# Ensure archive directory exists (for future archives)
if [ ! -d "reports/archive" ]; then
  echo "📁 Creating archive directory for future archives"
  mkdir -p reports/archive
else
  echo "✅ Existing archive directory kept"
fi

# Count files
total_files=$(find reports -type f -not -path "reports/temp/*" -not -path "reports/archive/*" | wc -l)
kept_files=$(find reports/temp -type f -not -path "reports/temp/archive/*" | wc -l)
deleted_files=$((total_files - kept_files))

# Archive old reports (older than 7 days) if --archive option is specified
if [[ "$1" == "--archive" ]]; then
  echo "📦 Archiving old reports..."
  current_date=$(date +%s)
  find reports -maxdepth 1 -type f -name "lighthouse-*.html" -o -name "lighthouse-*.json" | while read file; do
    file_date=$(date -r "$file" +%s)
    days_old=$(( (current_date - file_date) / 86400 ))
    
    if [[ $days_old -gt 7 ]]; then
      archive_date=$(date -r "$file" +%Y-%m-%d)
      mkdir -p "reports/archive/$archive_date"
      cp "$file" "reports/archive/$archive_date/"
      echo "📦 Archived: $file → reports/archive/$archive_date/"
    fi
  done
fi

# Delete all HTML and JSON files in reports directory except those in archive
find reports -maxdepth 1 -type f \( -name "*.html" -o -name "*.json" \) -delete

# Move kept files
mv reports/temp/* reports/ 2>/dev/null
if [ -d "reports/temp/archive" ]; then
  # Copy archive files instead of replacing the directory
  cp -r reports/temp/archive/* reports/archive/ 2>/dev/null
fi
rmdir reports/temp 2>/dev/null

echo "🗑️ $deleted_files files deleted"
echo "💾 $kept_files files kept"

# 2. Clean redundant scripts
echo "📜 Checking for redundant scripts..."

# List of potentially redundant scripts
redundant_scripts=(
  "lighthouse-bash.sh"
  "lighthouse-simple-test.sh"
  "lighthouse.sh"
)

for script in "${redundant_scripts[@]}"; do
  if [ -f "scripts/$script" ]; then
    echo "🗑️ Removing redundant script: scripts/$script"
    rm "scripts/$script"
  fi
done

echo "✨ Cleanup completed!"
