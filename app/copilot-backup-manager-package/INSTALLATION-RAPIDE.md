<!-- @format -->

# 🚀 Installation Rapide - Copilot Backup Manager

## 📦 Pour un Nouveau Projet

### 1. Copier le Package

```bash
# Copiez le dossier copilot-backup-manager-package dans votre nouveau projet
cp -r copilot-backup-manager-package/ /chemin/vers/nouveau-projet/
cd /chemin/vers/nouveau-projet/
```

### 2. Installation en Une Commande

```bash
# Exécutez l'installateur
bash copilot-backup-manager-installer.sh
```

### 3. Test (optionnel)

```bash
# Vérifiez que tout fonctionne
bash test.sh
```

## 🎯 Utilisation Immédiate

```bash
# Commandes disponibles après installation
pnpm run clean:copilot      # Nettoyage
pnpm run commit-ready       # Préparation commit
pnpm run sync:pnpm          # Synchronisation

# Workflow automatique (recommandé)
git add .
git commit -m "message"     # Hook automatique !
```

## 📋 Checklist Post-Installation

- [ ] Dossier `scripts/` créé avec 5 fichiers
- [ ] `.vscode/settings.json` configuré
- [ ] Scripts ajoutés au `package.json`
- [ ] Hook pre-commit installé (`.git/hooks/pre-commit`)
- [ ] Test avec `pnpm run clean:copilot` réussi

## 🔄 Pour Projets Existants

Si vous avez déjà des scripts ou configuration :

1. **Sauvegardez** votre `.vscode/settings.json`
2. **Exécutez** l'installateur
3. **Fusionnez** manuellement vos paramètres si nécessaire

## 💡 Conseils

- ✅ Fonctionne avec npm, yarn, pnpm (détection automatique)
- ✅ Compatible avec tous projets JS/TS
- ✅ Sûr : ne modifie jamais vos fichiers de code
- ✅ Réversible : supprimez simplement le dossier `scripts/`

**Installation complète en moins de 30 secondes ! 🎉**
