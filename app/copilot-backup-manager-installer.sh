#!/bin/bash

# 🚀 Automatic Copilot management system installation
# Usage: curl -sSL https://raw.githubusercontent.com/your-repo/copilot-backup-manager/main/install.sh | bash
# or: bash install.sh

set -e

echo "🤖 Installing GitHub Copilot backup manager..."

# Colors for messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in a project with package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this script from your project root.${NC}"
    exit 1
fi

# Detect package manager
PACKAGE_MANAGER="npm"
if [ -f "pnpm-lock.yaml" ] || command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
elif [ -f "yarn.lock" ] || command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
fi

echo -e "${BLUE}📦 Detected package manager: ${PACKAGE_MANAGER}${NC}"

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Download or create scripts
echo -e "${YELLOW}📥 Installing scripts...${NC}"

# Main cleanup script
cat > scripts/clean-copilot-backups.sh << 'EOF'
#!/bin/bash

# Copilot backup cleanup script
echo "🧹 Cleaning VS Code/Copilot backups..."

# Remove temporary backup files
find . -name "*.backup" -type f -delete 2>/dev/null || true
find . -name "*.bak" -type f -delete 2>/dev/null || true
find . -name "*.autosave" -type f -delete 2>/dev/null || true
find . -name "*~" -type f -delete 2>/dev/null || true
find . -name "*.tmp" -type f -delete 2>/dev/null || true

# Clean temporary VS Code directories
rm -rf .vscode/workspaceStorage/ 2>/dev/null || true
rm -rf .history/ 2>/dev/null || true
rm -f .vscode/.BROWSERSLISTRC 2>/dev/null || true
rm -f .vscode/argv.json 2>/dev/null || true

# Clean system files
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
find . -name "Desktop.ini" -type f -delete 2>/dev/null || true

# Clean cache according to package manager
if [ -f "pnpm-lock.yaml" ] && [ -d "node_modules/.pnpm" ]; then
    echo "🗑️  Cleaning pnpm cache..."
    pnpm store prune 2>/dev/null || true
elif [ -f "yarn.lock" ] && command -v yarn &> /dev/null; then
    echo "🗑️  Cleaning yarn cache..."
    yarn cache clean 2>/dev/null || true
elif [ -f "package-lock.json" ] && command -v npm &> /dev/null; then
    echo "🗑️  Cleaning npm cache..."
    npm cache clean --force 2>/dev/null || true
fi

# Check Git status
if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
    if git status --porcelain | grep -q "^??"; then
        echo "⚠️  Untracked files detected after cleanup:"
        git status --porcelain | grep "^??" | head -5
    fi
fi

echo "✅ Cleanup completed!"
EOF

# Package manager synchronization script
cat > scripts/sync-package-manager.sh << 'EOF'
#!/bin/bash

# Package manager synchronization script
echo "🔄 Synchronizing package manager..."

# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then
    echo "📦 Using pnpm"
    # Remove competing lock files
    rm -f package-lock.json yarn.lock 2>/dev/null || true
    
    # Check and clean node_modules if necessary
    if [ -d "node_modules" ] && [ ! -d "node_modules/.pnpm" ]; then
        echo "🗑️  Cleaning node_modules (incompatible with pnpm)"
        rm -rf node_modules
    fi
    
    # Install with pnpm
    pnpm install
    
elif [ -f "yarn.lock" ]; then
    echo "📦 Using yarn"
    rm -f package-lock.json 2>/dev/null || true
    yarn install
    
else
    echo "📦 Using npm"
    rm -f pnpm-lock.yaml yarn.lock 2>/dev/null || true
    npm install
fi

echo "✅ Synchronization completed!"
EOF

# Combined commit-ready script
cat > scripts/commit-ready.sh << 'EOF'
#!/bin/bash

# Pre-commit preparation script
echo "🚀 Preparing for commit..."

# Run cleanup
bash scripts/clean-copilot-backups.sh

# Run synchronization
bash scripts/sync-package-manager.sh

# Display Git status
if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
    echo "📊 Git status:"
    git status --short
else
    echo "⚠️  No Git repository detected"
fi

echo "✅ Project ready for commit!"
EOF

# Pre-commit hook
cat > scripts/pre-commit-hook.sh << 'EOF'
#!/bin/bash

# Pre-commit hook for automatic cleanup
echo "🔗 Pre-commit hook: Automatic cleanup..."

# Go to project directory
cd "$(git rev-parse --show-toplevel)"

# Backup cleanup
bash scripts/clean-copilot-backups.sh

# Synchronization
bash scripts/sync-package-manager.sh

# Linting (non-blocking)
if [ -f "package.json" ]; then
    if grep -q '"lint"' package.json; then
        echo "🔍 Running linting..."
        if [ -f "pnpm-lock.yaml" ]; then
            pnpm run lint || echo "⚠️  Linting warnings detected (non-blocking)"
        elif [ -f "yarn.lock" ]; then
            yarn lint || echo "⚠️  Linting warnings detected (non-blocking)"
        else
            npm run lint || echo "⚠️  Linting warnings detected (non-blocking)"
        fi
    fi
    
    if grep -q '"format"' package.json; then
        echo "🎨 Formatting code..."
        if [ -f "pnpm-lock.yaml" ]; then
            pnpm run format || true
        elif [ -f "yarn.lock" ]; then
            yarn format || true
        else
            npm run format || true
        fi
        
        # Add formatted files
        git add . 2>/dev/null || true
    fi
fi

echo "✅ Pre-commit hook completed!"
exit 0
EOF

# Git hooks installation script
cat > scripts/install-git-hooks.sh << 'EOF'
#!/bin/bash

# Git hooks installation
echo "🔗 Installing Git hooks..."

# Check that we're in a Git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a Git repository"
    exit 1
fi

# Find .git directory
GIT_DIR=$(git rev-parse --git-dir)
HOOKS_DIR="$GIT_DIR/hooks"

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Copy pre-commit hook
cp scripts/pre-commit-hook.sh "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Pre-commit hook installed in $HOOKS_DIR/pre-commit"
echo "🎉 Automatic cleanup is now active!"
EOF

# Make all scripts executable
chmod +x scripts/*.sh

echo -e "${YELLOW}⚙️  VS Code configuration...${NC}"

# Create .vscode directory if it doesn't exist
mkdir -p .vscode

# Optimized VS Code configuration
cat > .vscode/settings.json << EOF
{
  "files.hotExit": "off",
  "editor.formatOnSave": true,
  "npm.packageManager": "$PACKAGE_MANAGER",
  "files.exclude": {
    "**/.git": true,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true,
    "**/Thumbs.db": true,
    "**/.history": true,
    "**/.vscode/workspaceStorage": true,
    "**/node_modules/.cache": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/bower_components": true,
    "**/*.code-search": true,
    "**/.history": true,
    "**/.vscode/workspaceStorage": true
  },
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/*/**": true,
    "**/.hg/store/**": true,
    "**/.history/**": true,
    "**/.vscode/workspaceStorage/**": true
  }
}
EOF

echo -e "${YELLOW}📝 Updating .gitignore...${NC}"

# Add entries to .gitignore if it exists
if [ -f ".gitignore" ]; then
    # Check if entries already exist
    if ! grep -q "# Copilot Backup Manager" .gitignore; then
        cat >> .gitignore << 'EOF'

# Copilot Backup Manager
.vscode/workspaceStorage/
.history/
*.backup
*.bak
*.autosave
*~
*.tmp
.DS_Store
Thumbs.db
Desktop.ini
EOF
        echo -e "${GREEN}✅ .gitignore updated${NC}"
    else
        echo -e "${BLUE}ℹ️  .gitignore already configured${NC}"
    fi
fi

echo -e "${YELLOW}📦 Updating package.json...${NC}"

# Add npm scripts to package.json
if command -v node &> /dev/null; then
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (!pkg.scripts) pkg.scripts = {};
    
    pkg.scripts['clean:copilot'] = 'bash scripts/clean-copilot-backups.sh';
    pkg.scripts['sync:${PACKAGE_MANAGER}'] = 'bash scripts/sync-package-manager.sh';
    pkg.scripts['commit-ready'] = 'bash scripts/commit-ready.sh';
    pkg.scripts['install:hooks'] = 'bash scripts/install-git-hooks.sh';
    
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    echo -e "${GREEN}✅ Scripts added to package.json${NC}"
fi

echo -e "${YELLOW}🔗 Installing Git hook...${NC}"
bash scripts/install-git-hooks.sh

echo -e "${GREEN}🎉 Installation completed!${NC}"
echo ""
echo -e "${BLUE}📋 Available commands:${NC}"
echo -e "  ${PACKAGE_MANAGER} run clean:copilot    # Backup cleanup"
echo -e "  ${PACKAGE_MANAGER} run sync:${PACKAGE_MANAGER}      # Synchronization"
echo -e "  ${PACKAGE_MANAGER} run commit-ready     # Commit preparation"
echo -e "  ${PACKAGE_MANAGER} run install:hooks    # Reinstall hooks"
echo ""
echo -e "${BLUE}🔄 Pre-commit hook is now active!${NC}"
echo -e "${YELLOW}💡 Test with: ${PACKAGE_MANAGER} run clean:copilot${NC}"
