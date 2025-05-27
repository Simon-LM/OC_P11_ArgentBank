#!/bin/bash
# Script d'archivage des rapports Lighthouse par date
# Utilisation: ./archive-reports.sh [YYYY-MM-DD]

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPORTS_DIR="./reports"
ARCHIVE_DIR="$REPORTS_DIR/archive"

# Fonction d'aide
show_help() {
    echo "Usage: $0 [DATE]"
    echo ""
    echo "Archive les rapports Lighthouse d'une date spécifique"
    echo ""
    echo "Arguments:"
    echo "  DATE    Date au format YYYY-MM-DD (ex: 2025-05-26)"
    echo "          Si aucune date n'est fournie, propose d'archiver les rapports d'hier"
    echo ""
    echo "Exemples:"
    echo "  $0 2025-05-26              # Archive les rapports du 26 mai 2025"
    echo "  $0                         # Propose d'archiver les rapports d'hier"
    echo ""
}

# Vérifier si nous sommes dans le bon dossier
if [[ ! -d "$REPORTS_DIR" ]]; then
    echo -e "${RED}❌ Erreur: Dossier reports non trouvé. Exécutez ce script depuis le dossier lighthouse.${NC}"
    exit 1
fi

# Gestion des arguments
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Déterminer la date à archiver
if [[ -n "$1" ]]; then
    TARGET_DATE="$1"
    # Validation du format de date
    if [[ ! "$TARGET_DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        echo -e "${RED}❌ Erreur: Format de date invalide. Utilisez YYYY-MM-DD${NC}"
        exit 1
    fi
else
    # Proposer la date d'hier par défaut
    YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)
    echo -e "${BLUE}📦 Archivage des rapports Lighthouse${NC}"
    echo -e "Date proposée: ${YELLOW}$YESTERDAY${NC}"
    read -p "Archiver les rapports du $YESTERDAY ? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo -e "${YELLOW}⏹️  Archivage annulé${NC}"
        exit 0
    fi
    TARGET_DATE="$YESTERDAY"
fi

echo -e "${BLUE}📦 Archivage des rapports Lighthouse du $TARGET_DATE${NC}"
echo

# Créer le dossier d'archive s'il n'existe pas
mkdir -p "$ARCHIVE_DIR"

# Compter les fichiers à archiver
FILES_TO_ARCHIVE=$(find "$REPORTS_DIR" -maxdepth 1 -name "*$TARGET_DATE*" -type f | wc -l)

if [[ $FILES_TO_ARCHIVE -eq 0 ]]; then
    echo -e "${YELLOW}⚠️  Aucun rapport trouvé pour la date $TARGET_DATE${NC}"
    exit 0
fi

echo -e "${GREEN}📊 Fichiers à archiver: $FILES_TO_ARCHIVE${NC}"
echo

# Lister les fichiers qui seront archivés
echo -e "${BLUE}📋 Fichiers à archiver:${NC}"
find "$REPORTS_DIR" -maxdepth 1 -name "*$TARGET_DATE*" -type f -exec basename {} \; | sed 's/^/  ✓ /'
echo

# Déplacer les fichiers vers l'archive
echo -e "${BLUE}📦 Déplacement des fichiers...${NC}"

find "$REPORTS_DIR" -maxdepth 1 -name "*$TARGET_DATE*" -type f | while read file; do
    if mv "$file" "$ARCHIVE_DIR/"; then
        echo "  ✅ $(basename "$file")"
    else
        echo "  ❌ Erreur lors du déplacement de $(basename "$file")"
    fi
done

echo
echo -e "${GREEN}✅ ARCHIVAGE TERMINÉ AVEC SUCCÈS !${NC}"
echo
echo -e "${BLUE}📊 Résumé :${NC}"
echo "  • Rapports archivés: $FILES_TO_ARCHIVE fichiers du $TARGET_DATE"
echo "  • Localisation: lighthouse/reports/archive/"
echo
echo -e "${GREEN}🎯 Prêt pour les prochains tests Lighthouse !${NC}"
