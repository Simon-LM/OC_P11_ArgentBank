#!/bin/bash

# 🧹 Script de migration et nettoyage des rapports Lighthouse
# Consolide les anciens rapports dans la nouvelle structure

set -e

echo "🧹 MIGRATION DES RAPPORTS LIGHTHOUSE"
echo "====================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

OLD_REPORTS_DIR="./reports"
NEW_REPORTS_DIR="./lighthouse/reports"
ARCHIVE_DIR="./lighthouse/reports/archive"

# 1. Créer le dossier d'archive
echo -e "${BLUE}📁 Création du dossier d'archive...${NC}"
mkdir -p "$ARCHIVE_DIR"

# 2. Analyser l'ancien dossier
if [ -d "$OLD_REPORTS_DIR" ]; then
    echo -e "${YELLOW}📊 Analyse de l'ancien dossier reports/...${NC}"
    OLD_COUNT=$(ls -1 "$OLD_REPORTS_DIR" | wc -l)
    OLD_SIZE=$(du -sh "$OLD_REPORTS_DIR" | cut -f1)
    echo "   • Nombre de fichiers: $OLD_COUNT"
    echo "   • Taille totale: $OLD_SIZE"
    
    # 3. Déplacer les fichiers importants vers l'archive
    echo -e "${BLUE}📦 Migration des rapports vers l'archive...${NC}"
    
    # Copier tous les fichiers vers l'archive
    cp -r "$OLD_REPORTS_DIR"/* "$ARCHIVE_DIR/" 2>/dev/null || true
    
    # 4. Créer un index des fichiers archivés
    echo -e "${BLUE}📋 Création de l'index d'archive...${NC}"
    cat > "$ARCHIVE_DIR/README.md" << EOF
# Archive des Rapports Lighthouse

Fichiers migré depuis \`/reports/\` le $(date)

## Contenu
\`\`\`
$(ls -la "$ARCHIVE_DIR" | grep -v "^total" | grep -v "README.md")
\`\`\`

## Organisation
- **analysis.html/txt** : Analyses de performance
- **desktop-*.html** : Rapports desktop 
- **mobile-*.html** : Rapports mobile
- **home-*.html** : Tests page d'accueil
- **signin-*.html** : Tests page connexion
- **profile-*.html** : Tests page profil

## Note
Ces fichiers sont archivés pour référence historique.
Les nouveaux rapports sont générés dans \`lighthouse/reports/\`.
EOF

    echo -e "${GREEN}✅ Migration terminée: $OLD_COUNT fichiers archivés${NC}"
    
    # 5. Supprimer automatiquement l'ancien dossier
    echo ""
    echo -e "${RED}🗑️  Suppression de l'ancien dossier /reports/...${NC}"
    rm -rf "$OLD_REPORTS_DIR"
    echo -e "${GREEN}✅ Ancien dossier /reports/ supprimé${NC}"
    
else
    echo -e "${YELLOW}⚠️  Aucun ancien dossier /reports/ trouvé${NC}"
fi

# 6. Afficher le résumé
echo ""
echo -e "${GREEN}🎉 MIGRATION TERMINÉE${NC}"
echo "====================="
echo -e "📁 Nouveau dossier actif: ${BLUE}lighthouse/reports/${NC}"
echo -e "📦 Archive historique: ${BLUE}lighthouse/reports/archive/${NC}"
echo ""
echo "🔧 Structure finale:"
echo "lighthouse/reports/"
echo "├── lighthouse-report.html    # Dernier rapport"
echo "├── lighthouse-report.json    # Données JSON"
echo "└── archive/                  # Rapports archivés"
echo "    ├── README.md"
echo "    ├── analysis.html"
echo "    ├── desktop-*.html"
echo "    ├── mobile-*.html"
echo "    └── ..."
