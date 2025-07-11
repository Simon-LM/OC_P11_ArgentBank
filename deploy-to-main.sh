#!/bin/bash

 # Script to deploy the stabilized CI/CD workflow to main
# Usage: ./deploy-to-main.sh
#
# ⚠️  IMPORTANT - Deployment process:
# 1. This script creates a TEMPORARY branch (feature/ci-cd-stable-YYYYMMDD-HHMMSS)
# 2. You create a PR from this branch to main
# 3. Once merged, you MUST delete this temporary branch
# 4. Temporary branches MUST NOT accumulate!
#
# Cleanup after merge (the script will remind you of the commands):
# → git checkout main && git pull origin main
# → git branch -D feature/ci-cd-stable-YYYYMMDD-HHMMSS
# → git push origin --delete feature/ci-cd-stable-YYYYMMDD-HHMMSS

set -e  # Stop the script if an error occurs

echo "🚀 Déploiement du workflow CI/CD stabilisé vers main"
echo "=================================================="

 # Check that we are in the correct directory
if [ ! -f ".github/workflows/ci-cd.yml" ]; then
    echo "❌ Error: ci-cd.yml file not found. Make sure you are in the correct directory."
    exit 1
fi

 # Display current Git status
echo "📋 Current Git status:"
git status --porcelain

 # Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Uncommitted changes detected."
    echo "🔧 Adding and committing changes..."
    
    # Add modified files
    git add .github/workflows/ci-cd.yml
    
    # Create the commit with a descriptive message
    git commit -m "feat(ci): refactoring and stabilization of the CI/CD workflow

- Reliable propagation of the Preview URL between jobs (Deploy → Pa11y → Cypress → Lighthouse)
- Strict job ordering with correct dependencies
- Increased robustness of E2E and accessibility tests (Pa11y, Cypress)
- Cleanup of unnecessary exclusions and improved documentation
- Proper management of environment variables and Vercel secrets
- Lighthouse tests with stricter thresholds for quality validation

✅ Fully functional workflow, production-ready"
    
    echo "✅ Changes committed successfully"
else
    echo "ℹ️  No uncommitted changes detected"
fi

 # Get the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

 # Option 1: Direct push to main (if you are already on main)
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo "🎯 You are already on the main branch"
    echo "🚀 Pushing changes to origin/main..."
    git push origin main
    echo "✅ Deployment to main completed successfully!"
    
# Option 2: Create a PR via a feature branch
else
    echo "🌿 Creating a feature branch for the Pull Request..."
    
    # Create and switch to the feature branch
    FEATURE_BRANCH="feature/ci-cd-stable-$(date +%Y%m%d-%H%M%S)"
    git checkout -b "$FEATURE_BRANCH"
    echo "✅ Branch created: $FEATURE_BRANCH"
    
    # Push the feature branch
    echo "🚀 Pushing the feature branch to GitHub..."
    git push origin "$FEATURE_BRANCH"
    
    echo "✅ Feature branch pushed successfully!"
    echo ""
    echo "🔗 Next steps:"
    echo "   1. Go to GitHub: https://github.com/Simon-LM/OC_P11_ArgentBank"
    echo "   2. Create a Pull Request from '$FEATURE_BRANCH' to 'main'"
    echo "   3. Check that CI tests pass"
    echo "   4. Merge the Pull Request"
    echo "   5. 🧹 IMPORTANT: Delete the '$FEATURE_BRANCH' branch after merge (it is temporary)"
    echo ""
    echo "💡 Or use this direct link to create the PR:"
    echo "   https://github.com/Simon-LM/OC_P11_ArgentBank/compare/main...$FEATURE_BRANCH"
    echo ""
    echo "⚠️  REMINDER: This branch '$FEATURE_BRANCH' is temporary and must be deleted after the merge!"
    echo "   Cleanup commands (to run after merge):"
    echo "   → git checkout main && git pull origin main"
    echo "   → git branch -D '$FEATURE_BRANCH'"
    echo "   → git push origin --delete '$FEATURE_BRANCH'"
fi

echo ""
echo "🎉 Script completed successfully!"
echo "📝 The stabilized CI/CD workflow is now ready for production."
