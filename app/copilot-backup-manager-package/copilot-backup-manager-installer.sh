#!/bin/bash

# 🚀 Installation automatique du système de gestion Copilot
# Usage: curl -sSL https://raw.githubusercontent.com/votre-repo/copilot-backup-manager/main/install.sh | bash
# ou: bash install.sh

set -e

echo "🤖 Installation du gestionnaire de sauvegardes GitHub Copilot..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si on est dans un projet avec package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: package.json introuvable. Lancez ce script dans la racine de votre projet.${NC}"
    exit 1
fi

# Détecter le gestionnaire de paquets
PACKAGE_MANAGER="npm"
if [ -f "pnpm-lock.yaml" ] || command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
elif [ -f "yarn.lock" ] || command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
fi

echo -e "${BLUE}📦 Gestionnaire de paquets détecté: ${PACKAGE_MANAGER}${NC}"

# Créer le dossier scripts s'il n'existe pas
mkdir -p scripts

# Télécharger ou créer les scripts
echo -e "${YELLOW}📥 Installation des scripts...${NC}"

# Script de nettoyage principal
cat > scripts/clean-copilot-backups.sh << 'EOF'
#!/bin/bash

# Script de nettoyage des sauvegardes Copilot
echo "🧹 Nettoyage des sauvegardes VS Code/Copilot..."

# Supprimer les fichiers de sauvegarde temporaires
find . -name "*.backup" -type f -delete 2>/dev/null || true
find . -name "*.bak" -type f -delete 2>/dev/null || true
find . -name "*.autosave" -type f -delete 2>/dev/null || true
find . -name "*~" -type f -delete 2>/dev/null || true
find . -name "*.tmp" -type f -delete 2>/dev/null || true

# Nettoyer les dossiers VS Code temporaires
rm -rf .vscode/workspaceStorage/ 2>/dev/null || true
rm -rf .history/ 2>/dev/null || true
rm -f .vscode/.BROWSERSLISTRC 2>/dev/null || true
rm -f .vscode/argv.json 2>/dev/null || true

# Nettoyer les fichiers système
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
find . -name "Desktop.ini" -type f -delete 2>/dev/null || true

# Nettoyer le cache selon le gestionnaire de paquets
if [ -f "pnpm-lock.yaml" ] && [ -d "node_modules/.pnpm" ]; then
    echo "🗑️  Nettoyage du cache pnpm..."
    pnpm store prune 2>/dev/null || true
elif [ -f "yarn.lock" ] && command -v yarn &> /dev/null; then
    echo "🗑️  Nettoyage du cache yarn..."
    yarn cache clean 2>/dev/null || true
elif [ -f "package-lock.json" ] && command -v npm &> /dev/null; then
    echo "🗑️  Nettoyage du cache npm..."
    npm cache clean --force 2>/dev/null || true
fi

# Vérifier l'état Git
if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
    if git status --porcelain | grep -q "^??"; then
        echo "⚠️  Fichiers non suivis détectés après nettoyage:"
        git status --porcelain | grep "^??" | head -5
    fi
fi

echo "✅ Nettoyage terminé!"
EOF

# Script de synchronisation
cat > scripts/sync-package-manager.sh << 'EOF'
#!/bin/bash

# Script de synchronisation du gestionnaire de paquets
echo "🔄 Synchronisation du gestionnaire de paquets..."

# Détecter le gestionnaire de paquets
if [ -f "pnpm-lock.yaml" ]; then
    echo "📦 Utilisation de pnpm"
    # Supprimer les fichiers de verrouillage concurrents
    rm -f package-lock.json yarn.lock 2>/dev/null || true
    
    # Vérifier et nettoyer node_modules si nécessaire
    if [ -d "node_modules" ] && [ ! -d "node_modules/.pnpm" ]; then
        echo "🗑️  Nettoyage de node_modules (incompatible avec pnpm)"
        rm -rf node_modules
    fi
    
    # Installer avec pnpm
    pnpm install
    
elif [ -f "yarn.lock" ]; then
    echo "📦 Utilisation de yarn"
    rm -f package-lock.json 2>/dev/null || true
    yarn install
    
else
    echo "📦 Utilisation de npm"
    rm -f pnpm-lock.yaml yarn.lock 2>/dev/null || true
    npm install
fi

echo "✅ Synchronisation terminée!"
EOF

# Script combiné commit-ready
cat > scripts/commit-ready.sh << 'EOF'
#!/bin/bash

# Script de préparation avant commit
echo "🚀 Préparation pour commit..."

# Exécuter le nettoyage
bash scripts/clean-copilot-backups.sh

# Exécuter la synchronisation
bash scripts/sync-package-manager.sh

# Afficher le statut Git
if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
    echo "📊 Statut Git:"
    git status --short
else
    echo "⚠️  Pas de repository Git détecté"
fi

echo "✅ Projet prêt pour commit!"
EOF

# Hook pre-commit
cat > scripts/pre-commit-hook.sh << 'EOF'
#!/bin/bash

# Hook pre-commit pour nettoyage automatique
echo "🔗 Hook pre-commit: Nettoyage automatique..."

# Aller au répertoire du projet
cd "$(git rev-parse --show-toplevel)"

# Nettoyage des sauvegardes
bash scripts/clean-copilot-backups.sh

# Synchronisation
bash scripts/sync-package-manager.sh

# Linting (non-bloquant)
if [ -f "package.json" ]; then
    if grep -q '"lint"' package.json; then
        echo "🔍 Exécution du linting..."
        if [ -f "pnpm-lock.yaml" ]; then
            pnpm run lint || echo "⚠️  Warnings de linting détectés (non-bloquant)"
        elif [ -f "yarn.lock" ]; then
            yarn lint || echo "⚠️  Warnings de linting détectés (non-bloquant)"
        else
            npm run lint || echo "⚠️  Warnings de linting détectés (non-bloquant)"
        fi
    fi
    
    if grep -q '"format"' package.json; then
        echo "🎨 Formatage du code..."
        if [ -f "pnpm-lock.yaml" ]; then
            pnpm run format || true
        elif [ -f "yarn.lock" ]; then
            yarn format || true
        else
            npm run format || true
        fi
        
        # Ajouter les fichiers formatés
        git add . 2>/dev/null || true
    fi
fi

echo "✅ Hook pre-commit terminé!"
exit 0
EOF

# Script d'installation des hooks
cat > scripts/install-git-hooks.sh << 'EOF'
#!/bin/bash

# Installation des hooks Git
echo "🔗 Installation des hooks Git..."

# Vérifier qu'on est dans un repo Git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Erreur: Pas dans un repository Git"
    exit 1
fi

# Trouver le répertoire .git
GIT_DIR=$(git rev-parse --git-dir)
HOOKS_DIR="$GIT_DIR/hooks"

# Créer le répertoire hooks s'il n'existe pas
mkdir -p "$HOOKS_DIR"

# Copier le hook pre-commit
cp scripts/pre-commit-hook.sh "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "✅ Hook pre-commit installé dans $HOOKS_DIR/pre-commit"
echo "🎉 Le nettoyage automatique est maintenant actif!"
EOF

# Rendre tous les scripts exécutables
chmod +x scripts/*.sh

echo -e "${YELLOW}⚙️  Configuration VS Code...${NC}"

# Créer le dossier .vscode s'il n'existe pas
mkdir -p .vscode

# Configuration VS Code optimisée
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

echo -e "${YELLOW}📝 Mise à jour du .gitignore...${NC}"

# Ajouter les entrées au .gitignore s'il existe
if [ -f ".gitignore" ]; then
    # Vérifier si les entrées existent déjà
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
        echo -e "${GREEN}✅ .gitignore mis à jour${NC}"
    else
        echo -e "${BLUE}ℹ️  .gitignore déjà configuré${NC}"
    fi
fi

echo -e "${YELLOW}📦 Mise à jour du package.json...${NC}"

# Ajouter les scripts npm au package.json
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
    echo -e "${GREEN}✅ Scripts ajoutés au package.json${NC}"
fi

echo -e "${YELLOW}🔗 Installation du hook Git...${NC}"
bash scripts/install-git-hooks.sh

echo -e "${GREEN}🎉 Installation terminée!${NC}"
echo ""
echo -e "${BLUE}📋 Commandes disponibles:${NC}"
echo -e "  ${PACKAGE_MANAGER} run clean:copilot    # Nettoyage des sauvegardes"
echo -e "  ${PACKAGE_MANAGER} run sync:${PACKAGE_MANAGER}      # Synchronisation"
echo -e "  ${PACKAGE_MANAGER} run commit-ready     # Préparation commit"
echo -e "  ${PACKAGE_MANAGER} run install:hooks    # Réinstaller les hooks"
echo ""
echo -e "${BLUE}🔄 Le hook pre-commit est maintenant actif!${NC}"
echo -e "${YELLOW}💡 Testez avec: ${PACKAGE_MANAGER} run clean:copilot${NC}"
