#!/bin/bash
# Lighthouse reports archiving script by date
# Usage: ./archive-reports.sh [YYYY-MM-DD]

set -e

# Colors for messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPORTS_DIR="./reports"
ARCHIVE_DIR="$REPORTS_DIR/archive"

# Help function
show_help() {
    echo "Usage: $0 [DATE]"
    echo ""
    echo "Archive Lighthouse reports from a specific date"
    echo ""
    echo "Arguments:"
    echo "  DATE    Date in YYYY-MM-DD format (ex: 2025-05-26)"
    echo "          If no date is provided, proposes to archive yesterday's reports"
    echo ""
    echo "Examples:"
    echo "  $0 2025-05-26              # Archive reports from May 26, 2025"
    echo "  $0                         # Propose to archive yesterday's reports"
    echo ""
}

# Check if we're in the right directory
if [[ ! -d "$REPORTS_DIR" ]]; then
    echo -e "${RED}❌ Error: Reports directory not found. Run this script from the lighthouse directory.${NC}"
    exit 1
fi

# Argument handling
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Determine date to archive
if [[ -n "$1" ]]; then
    TARGET_DATE="$1"
    # Date format validation
    if [[ ! "$TARGET_DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        echo -e "${RED}❌ Error: Invalid date format. Use YYYY-MM-DD${NC}"
        exit 1
    fi
else
    # Propose yesterday's date by default
    YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)
    echo -e "${BLUE}📦 Lighthouse reports archiving${NC}"
    echo -e "Proposed date: ${YELLOW}$YESTERDAY${NC}"
    read -p "Archive reports from $YESTERDAY? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo -e "${YELLOW}⏹️  Archiving cancelled${NC}"
        exit 0
    fi
    TARGET_DATE="$YESTERDAY"
fi

echo -e "${BLUE}📦 Archiving Lighthouse reports from $TARGET_DATE${NC}"
echo

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

# Count files to archive
FILES_TO_ARCHIVE=$(find "$REPORTS_DIR" -maxdepth 1 -name "*$TARGET_DATE*" -type f | wc -l)

if [[ $FILES_TO_ARCHIVE -eq 0 ]]; then
    echo -e "${YELLOW}⚠️  No reports found for date $TARGET_DATE${NC}"
    exit 0
fi

echo -e "${GREEN}📊 Files to archive: $FILES_TO_ARCHIVE${NC}"
echo

# List files that will be archived
echo -e "${BLUE}📋 Files to archive:${NC}"
find "$REPORTS_DIR" -maxdepth 1 -name "*$TARGET_DATE*" -type f -exec basename {} \; | sed 's/^/  ✓ /'
echo

# Move files to archive
echo -e "${BLUE}📦 Moving files...${NC}"

find "$REPORTS_DIR" -maxdepth 1 -name "*$TARGET_DATE*" -type f | while read file; do
    if mv "$file" "$ARCHIVE_DIR/"; then
        echo "  ✅ $(basename "$file")"
    else
        echo "  ❌ Error moving $(basename "$file")"
    fi
done

echo
echo -e "${GREEN}✅ ARCHIVING COMPLETED SUCCESSFULLY!${NC}"
echo
echo -e "${BLUE}📊 Summary:${NC}"
echo "  • Archived reports: $FILES_TO_ARCHIVE files from $TARGET_DATE"
echo "  • Location: lighthouse/reports/archive/"
echo
echo -e "${GREEN}🎯 Ready for next Lighthouse tests!${NC}"
