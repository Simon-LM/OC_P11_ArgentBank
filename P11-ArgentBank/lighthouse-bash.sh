#!/bin/bash

# Script bash pour lancer Lighthouse CLI avec configuration personnalisée
# Évite les problèmes d'ES modules de Vite

set -e

# Configuration par défaut
URL="http://localhost:3000"
OUTPUT_FORMAT="html"
OUTPUT_PATH="./lighthouse-report.html"
DEVICE="mobile"
CONFIG_PATH="./lighthouse.config.js"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --url URL              URL à tester (défaut: $URL)"
    echo "  --output FORMAT        Format de sortie: html, json, csv (défaut: $OUTPUT_FORMAT)"
    echo "  --output-path PATH     Chemin du fichier de sortie (défaut: $OUTPUT_PATH)"
    echo "  --mobile              Test en mode mobile (défaut)"
    echo "  --desktop             Test en mode desktop"
    echo "  --help                Affiche cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0"
    echo "  $0 --url http://localhost:3000/profile --desktop"
    echo "  $0 --output json --output-path ./reports/perf.json"
}

# Parse des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --url)
            URL="$2"
            shift 2
            ;;
        --output)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        --output-path)
            OUTPUT_PATH="$2"
            shift 2
            ;;
        --mobile)
            DEVICE="mobile"
            shift
            ;;
        --desktop)
            DEVICE="desktop"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Vérifier que l'URL est accessible
echo -e "${BLUE}🚀 Démarrage de l'audit Lighthouse...${NC}"
echo -e "${BLUE}📱 Mode: $DEVICE${NC}"
echo -e "${BLUE}🌐 URL: $URL${NC}"

echo -e "${YELLOW}🔍 Vérification de l'accessibilité de l'URL...${NC}"
if ! curl -s --max-time 10 "$URL" > /dev/null; then
    echo -e "${RED}❌ Erreur: L'URL $URL n'est pas accessible${NC}"
    echo -e "${YELLOW}💡 Suggestions:${NC}"
    echo -e "${YELLOW}   • Vérifiez que votre serveur de développement fonctionne${NC}"
    echo -e "${YELLOW}   • Lancez 'pnpm dev' dans un autre terminal${NC}"
    echo -e "${YELLOW}   • Vérifiez que l'URL est correcte${NC}"
    exit 1
fi

# Créer le dossier de sortie si nécessaire
OUTPUT_DIR=$(dirname "$OUTPUT_PATH")
if [[ "$OUTPUT_DIR" != "." && ! -d "$OUTPUT_DIR" ]]; then
    mkdir -p "$OUTPUT_DIR"
fi

# Configuration des flags Chrome
CHROME_FLAGS="--no-sandbox --disable-dev-shm-usage --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding --disable-extensions --disable-default-apps"

# Configuration selon le device
if [[ "$DEVICE" == "mobile" ]]; then
    FORM_FACTOR="mobile"
    THROTTLING_METHOD="simulate"
    SCREEN_EMULATION="--emulated-form-factor=mobile"
else
    FORM_FACTOR="desktop"
    THROTTLING_METHOD="simulate"
    SCREEN_EMULATION="--emulated-form-factor=desktop"
fi

echo -e "${YELLOW}⚡ Exécution de l'audit Lighthouse...${NC}"

# Commande Lighthouse avec gestion d'erreur améliorée
LIGHTHOUSE_CMD="npx lighthouse '$URL' \
    --output=$OUTPUT_FORMAT \
    --output-path='$OUTPUT_PATH' \
    --form-factor=$FORM_FACTOR \
    --throttling-method=$THROTTLING_METHOD \
    $SCREEN_EMULATION \
    --chrome-flags='$CHROME_FLAGS' \
    --only-categories=performance,accessibility,best-practices,seo \
    --skip-audits=unused-javascript,unused-css-rules \
    --max-wait-for-load=45000 \
    --preset=perf \
    --quiet"

# Exécuter Lighthouse avec timeout
if timeout 120 bash -c "$LIGHTHOUSE_CMD"; then
    echo ""
    echo -e "${GREEN}✅ Audit Lighthouse terminé avec succès !${NC}"
    echo -e "${GREEN}📁 Rapport sauvegardé: $OUTPUT_PATH${NC}"
    
    # Afficher le chemin absolu
    ABS_PATH=$(realpath "$OUTPUT_PATH")
    echo -e "${GREEN}🔗 Chemin absolu: $ABS_PATH${NC}"
    
    if [[ "$OUTPUT_FORMAT" == "html" ]]; then
        echo -e "${BLUE}💡 Ouvrez le rapport dans votre navigateur: file://$ABS_PATH${NC}"
    fi
    
    # Tenter d'extraire quelques métriques du rapport JSON si disponible
    if [[ "$OUTPUT_FORMAT" == "json" && -f "$OUTPUT_PATH" ]]; then
        echo ""
        echo -e "${BLUE}📊 MÉTRIQUES PRINCIPALES:${NC}"
        
        # Utiliser jq si disponible pour parser le JSON
        if command -v jq &> /dev/null; then
            PERFORMANCE_SCORE=$(jq -r '.categories.performance.score * 100 | round' "$OUTPUT_PATH" 2>/dev/null || echo "N/A")
            LCP=$(jq -r '.audits."largest-contentful-paint".displayValue // "N/A"' "$OUTPUT_PATH" 2>/dev/null || echo "N/A")
            CLS=$(jq -r '.audits."cumulative-layout-shift".displayValue // "N/A"' "$OUTPUT_PATH" 2>/dev/null || echo "N/A")
            FCP=$(jq -r '.audits."first-contentful-paint".displayValue // "N/A"' "$OUTPUT_PATH" 2>/dev/null || echo "N/A")
            
            echo -e "🎯 Performance: ${PERFORMANCE_SCORE}%"
            echo -e "⚡ First Contentful Paint: $FCP"
            echo -e "🖼️  Largest Contentful Paint: $LCP"
            echo -e "📐 Cumulative Layout Shift: $CLS"
        else
            echo -e "${YELLOW}💡 Installez 'jq' pour voir les métriques détaillées${NC}"
        fi
    fi
    
else
    echo ""
    echo -e "${RED}❌ Erreur lors de l'exécution de Lighthouse${NC}"
    echo -e "${YELLOW}💡 Cela peut arriver avec les applications Vite en développement${NC}"
    echo -e "${YELLOW}   Essayez de relancer l'audit ou utilisez une version de production${NC}"
    exit 1
fi
