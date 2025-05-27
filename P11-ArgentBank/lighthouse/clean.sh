#!/bin/bash

# Script de nettoyage du dossier Lighthouse
# Ce script supprime les fichiers de test redondants tout en gardant les plus récents

echo "🧹 Nettoyage du dossier Lighthouse..."

# Aller dans le dossier lighthouse
cd "$(dirname "$0")"

# 1. Nettoyer le dossier reports
echo "📁 Nettoyage du dossier reports..."

# Créer un dossier temporaire pour les fichiers à conserver
mkdir -p reports/temp

# Identifier les derniers rapports de chaque type
latest_reports=($(ls -t reports/lighthouse-*.html 2>/dev/null | head -3))
desktop_report=$(find reports -name "lighthouse-*" -type f -exec grep -l "Mode: Desktop" {} \; | head -1)
mobile_report=$(find reports -name "lighthouse-*" -type f -exec grep -l "Mode: Mobile" {} \; | head -1)

# Fichiers importants à conserver
important_files=(
  "reports/lighthouse-report.json"
  "reports/lighthouse-report.html"
  "reports/index.html"
  "reports/baseline.json"
  "reports/dev-report.html"
)

# Copier les derniers rapports
for report in "${latest_reports[@]}"; do
  if [ -f "$report" ]; then
    cp "$report" reports/temp/
    echo "✅ Conservé: $report"
  fi
done

# Copier les rapports desktop et mobile spécifiques s'ils ne sont pas déjà inclus
if [ -n "$desktop_report" ] && [ -f "$desktop_report" ]; then
  cp "$desktop_report" reports/temp/
  echo "✅ Conservé: $desktop_report (Desktop)"
fi

if [ -n "$mobile_report" ] && [ -f "$mobile_report" ]; then
  cp "$mobile_report" reports/temp/
  echo "✅ Conservé: $mobile_report (Mobile)"
fi

# Copier les fichiers importants
for file in "${important_files[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" reports/temp/
    echo "✅ Conservé: $file"
  fi
done

# Assurer que le dossier archive existe (pour les futures archives)
if [ ! -d "reports/archive" ]; then
  echo "📁 Création du dossier archive pour les futures archives"
  mkdir -p reports/archive
else
  echo "✅ Dossier archive existant conservé"
fi

# Compter les fichiers
total_files=$(find reports -type f -not -path "reports/temp/*" -not -path "reports/archive/*" | wc -l)
kept_files=$(find reports/temp -type f -not -path "reports/temp/archive/*" | wc -l)
deleted_files=$((total_files - kept_files))

# Archiver les anciens rapports (plus de 7 jours) si l'option --archive est spécifiée
if [[ "$1" == "--archive" ]]; then
  echo "📦 Archivage des anciens rapports..."
  current_date=$(date +%s)
  find reports -maxdepth 1 -type f -name "lighthouse-*.html" -o -name "lighthouse-*.json" | while read file; do
    file_date=$(date -r "$file" +%s)
    days_old=$(( (current_date - file_date) / 86400 ))
    
    if [[ $days_old -gt 7 ]]; then
      archive_date=$(date -r "$file" +%Y-%m-%d)
      mkdir -p "reports/archive/$archive_date"
      cp "$file" "reports/archive/$archive_date/"
      echo "📦 Archivé: $file → reports/archive/$archive_date/"
    fi
  done
fi

# Supprimer tous les fichiers HTML et JSON dans le dossier reports sauf ceux dans archive
find reports -maxdepth 1 -type f \( -name "*.html" -o -name "*.json" \) -delete

# Déplacer les fichiers conservés
mv reports/temp/* reports/ 2>/dev/null
if [ -d "reports/temp/archive" ]; then
  # Copier les fichiers d'archive au lieu de remplacer le dossier
  cp -r reports/temp/archive/* reports/archive/ 2>/dev/null
fi
rmdir reports/temp 2>/dev/null

echo "🗑️ $deleted_files fichiers supprimés"
echo "💾 $kept_files fichiers conservés"

# 2. Nettoyer les scripts redondants
echo "📜 Vérification des scripts redondants..."

# Liste des scripts potentiellement redondants
redundant_scripts=(
  "lighthouse-bash.sh"
  "lighthouse-simple-test.sh"
  "lighthouse.sh"
)

for script in "${redundant_scripts[@]}"; do
  if [ -f "scripts/$script" ]; then
    echo "🗑️ Suppression du script redondant: scripts/$script"
    rm "scripts/$script"
  fi
done

echo "✨ Nettoyage terminé!"
