#!/bin/bash

# Script de validation de la documentation Cypress
# Vérifie que tous les liens internes fonctionnent correctement

set -e

echo "🔍 Validation de la documentation Cypress..."
echo "=============================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CYPRESS_DIR="$(dirname "$SCRIPT_DIR")"
DOC_DIR="$SCRIPT_DIR"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
TOTAL_LINKS=0
VALID_LINKS=0
BROKEN_LINKS=0

# Fonction pour vérifier si un fichier existe
check_file_exists() {
    local file_path="$1"
    local source_file="$2"
    local line_info="$3"
    
    if [[ -f "$file_path" ]]; then
        echo -e "  ${GREEN}✅${NC} $file_path"
        ((VALID_LINKS++))
        return 0
    else
        echo -e "  ${RED}❌${NC} $file_path (référencé dans $source_file $line_info)"
        ((BROKEN_LINKS++))
        return 1
    fi
}

# Fonction pour valider les liens dans un fichier
validate_markdown_links() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo -e "\n${BLUE}📄 Validation de $filename${NC}"
    echo "----------------------------------------"
    
    if [[ ! -f "$file" ]]; then
        echo -e "${RED}❌ Fichier introuvable: $file${NC}"
        return 1
    fi
    
    # Extraire tous les liens markdown de type [text](./path) ou [text](../path)
    local line_num=0
    while IFS= read -r line; do
        ((line_num++))
        
        # Rechercher les liens markdown relatifs
        while [[ $line =~ \[([^\]]*)\]\((\./[^)]+|\.\./[^)]+)\) ]]; do
            local link_text="${BASH_REMATCH[1]}"
            local link_path="${BASH_REMATCH[2]}"
            
            ((TOTAL_LINKS++))
            
            # Résoudre le chemin relatif
            local resolved_path
            if [[ $link_path == ./* ]]; then
                resolved_path="$(dirname "$file")/${link_path#./}"
            elif [[ $link_path == ../* ]]; then
                resolved_path="$(dirname "$file")/${link_path}"
            fi
            
            # Normaliser le chemin
            resolved_path=$(realpath -m "$resolved_path" 2>/dev/null || echo "$resolved_path")
            
            echo -n "  🔗 [$link_text]($link_path) -> "
            check_file_exists "$resolved_path" "$filename" "(ligne $line_num)"
            
            # Supprimer le lien traité de la ligne pour continuer la recherche
            line=${line/${BASH_REMATCH[0]}/}
        done
    done < "$file"
}

# Fonction principale de validation
main() {
    echo "📁 Dossier de documentation: $DOC_DIR"
    echo "📁 Dossier Cypress: $CYPRESS_DIR"
    echo ""
    
    # Vérifier que les fichiers principaux existent
    echo -e "${BLUE}🔍 Vérification des fichiers principaux${NC}"
    echo "----------------------------------------"
    
    local main_files=(
        "$DOC_DIR/ACCESSIBILITY_TESTS.md"
        "$DOC_DIR/BEST_PRACTICES.md"
        "$DOC_DIR/E2E_TESTS.md"
        "$DOC_DIR/INSTALLATION.md"
        "$DOC_DIR/MAINTENANCE.md"
        "$DOC_DIR/IMPLEMENTATION_STATUS.md"
        "$DOC_DIR/DOCUMENTATION_UPDATE.md"
        "$CYPRESS_DIR/README.md"
    )
    
    for file in "${main_files[@]}"; do
        if [[ -f "$file" ]]; then
            echo -e "${GREEN}✅${NC} $(basename "$file")"
        else
            echo -e "${RED}❌${NC} $(basename "$file") - MANQUANT"
            ((BROKEN_LINKS++))
        fi
    done
    
    # Valider les liens dans chaque fichier de documentation
    for file in "${main_files[@]}"; do
        if [[ -f "$file" ]]; then
            validate_markdown_links "$file"
        fi
    done
    
    # Rapport final
    echo ""
    echo "=============================================="
    echo -e "${BLUE}📊 RAPPORT DE VALIDATION${NC}"
    echo "=============================================="
    echo "📄 Fichiers analysés: ${#main_files[@]}"
    echo "🔗 Total liens vérifiés: $TOTAL_LINKS"
    echo -e "${GREEN}✅ Liens valides: $VALID_LINKS${NC}"
    echo -e "${RED}❌ Liens brisés: $BROKEN_LINKS${NC}"
    
    if [[ $BROKEN_LINKS -eq 0 ]]; then
        echo ""
        echo -e "${GREEN}🎉 SUCCÈS: Tous les liens de documentation sont valides !${NC}"
        return 0
    else
        echo ""
        echo -e "${RED}⚠️  ATTENTION: $BROKEN_LINKS lien(s) brisé(s) détecté(s)${NC}"
        echo "Veuillez corriger les liens brisés avant de continuer."
        return 1
    fi
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Script de validation de la documentation Cypress"
    echo ""
    echo "Options:"
    echo "  -h, --help     Afficher cette aide"
    echo "  -v, --verbose  Mode verbeux (affichage détaillé)"
    echo ""
    echo "Exemples:"
    echo "  $0                    # Validation standard"
    echo "  $0 --verbose          # Validation avec détails"
}

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            set -x
            shift
            ;;
        *)
            echo "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Exécution principale
main
exit $?
