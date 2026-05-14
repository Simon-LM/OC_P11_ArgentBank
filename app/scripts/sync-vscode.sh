#!/bin/bash

# Script pour synchroniser l'état de VS Code avec Git
# Usage: ./scripts/sync-vscode.sh

echo "🔄 Synchronisation VS Code avec Git..."

# Fonction pour attendre que VS Code termine ses opérations
wait_for_vscode() {
    echo "⏳ Attente de la fin des opérations VS Code..."
    sleep 2
    
    # Vérifier s'il y a des processus VS Code en cours d'écriture
    local vscode_processes=$(ps aux | grep -v grep | grep -c "code\|vscode" || true)
    if [ $vscode_processes -gt 0 ]; then
        echo "📝 VS Code est actif, attente de 3 secondes supplémentaires..."
        sleep 3
    fi
}

# Forcer la sauvegarde dans VS Code (si disponible)
force_save_vscode() {
    if command -v code &> /dev/null; then
        echo "💾 Tentative de sauvegarde forcée via VS Code CLI..."
        # Commenté pour éviter l'ouverture automatique de VS Code
        # code --command workbench.action.files.saveAll 2>/dev/null || true
        echo "   ⚠️  Veuillez sauvegarder manuellement dans VS Code (Ctrl+S ou Ctrl+K S)"
        sleep 1
    fi
}

# Afficher l'état actuel
echo "📊 État actuel du repository:"
git status --porcelain

# Forcer la sauvegarde
force_save_vscode
wait_for_vscode

# Afficher les changements après sauvegarde
echo ""
echo "📊 État après sauvegarde:"
git status --porcelain

# Proposer d'ajouter les fichiers modifiés
if git diff --name-only | grep -q .; then
    echo ""
    echo "📝 Fichiers modifiés détectés:"
    git diff --name-only
    echo ""
    read -p "Ajouter tous les fichiers modifiés au staging? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add -A
        echo "✅ Fichiers ajoutés au staging"
    fi
fi

echo "✅ Synchronisation terminée!"
