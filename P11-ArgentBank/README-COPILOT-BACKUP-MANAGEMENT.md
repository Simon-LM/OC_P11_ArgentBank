<!-- @format -->

# 🤖 Gestion des Sauvegardes GitHub Copilot - Guide Rapide

> **Solution automatique** pour éviter les conflits de sauvegardes Copilot/VS Code lors des redémarrages et commits avec pnpm

## 🚀 Utilisation Rapide

### Commandes Essentielles

```bash
# Nettoyage des sauvegardes Copilot
pnpm run clean:copilot

# Synchronisation pnpm (résout les conflits npm/pnpm)
pnpm run sync:pnpm

# Préparation complète avant commit
pnpm run commit-ready

# Installation du hook automatique (une seule fois)
bash scripts/install-git-hooks.sh
```

## 🔧 Installation Initiale

### 1. Installer le Hook Pre-commit (Une seule fois)

```bash
bash scripts/install-git-hooks.sh
```

### 2. Tester la Configuration

```bash
# Test du nettoyage
pnpm run clean:copilot

# Test de la synchronisation
pnpm run sync:pnpm

# Test complet
pnpm run commit-ready
```

## 🔄 Workflow Quotidien

### Développement Standard

```bash
# 1. Développer normalement dans VS Code
# ... coder, sauvegarder, etc ...

# 2. Avant un commit important (optionnel)
pnpm run commit-ready

# 3. Commit normal - le hook s'exécute automatiquement
git add .
git commit -m "feat: nouvelle fonctionnalité"
```

### Actions Automatiques du Hook

Lors de chaque commit, le hook exécute automatiquement :

- ✅ Nettoie les sauvegardes VS Code/Copilot
- ✅ Supprime `package-lock.json` (conflit npm/pnpm)
- ✅ Vérifie que pnpm est utilisé correctement
- ✅ Exécute ESLint et Prettier

## 🚨 Résolution des Problèmes Courants

### Problème : `package-lock.json` Réapparaît

```bash
# Le hook le supprime automatiquement, ou manuellement :
rm package-lock.json
pnpm install
```

### Problème : Sauvegardes Corrompues

```bash
# Nettoyage complet
pnpm run clean:copilot

# Redémarrer VS Code après nettoyage
```

### Problème : Hook Ne Se Déclenche Pas

```bash
# Réinstaller le hook
bash scripts/install-git-hooks.sh

# Tester manuellement
.git/hooks/pre-commit
```

### Problème : Cache pnpm Corrompu

```bash
# Nettoyer et réinstaller
rm -rf node_modules/
pnpm store prune
pnpm install
```

## 💡 Bonnes Pratiques

### ✅ À Faire

- **Toujours utiliser pnpm** dans ce projet
- **Laisser le hook activé** pour la cohérence
- **Exécuter `pnpm run commit-ready`** avant les commits importants
- **Nettoyer régulièrement** avec `pnpm run clean:copilot`

### ❌ À Éviter

- **Ne pas utiliser npm** dans ce projet pnpm
- **Ne pas contourner le hook** sauf cas exceptionnels
- **Ne pas ignorer les avertissements** des scripts

## 🔍 Commandes de Diagnostic

```bash
# Vérifier l'état Git
git status

# Vérifier les hooks installés
ls -la .git/hooks/pre-commit

# Tester les performances
time pnpm run commit-ready

# Vérifier la configuration VS Code
cat .vscode/settings.json | grep -E "(hotExit|packageManager)"
```

## 🎯 Cas d'Usage Spécifiques

### Contourner Temporairement le Hook

```bash
# Commit sans hook (urgence seulement)
git commit --no-verify -m "commit d'urgence"

# Désactiver temporairement
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled

# Réactiver
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

### Migration d'un Projet npm

```bash
# 1. Supprimer les artifacts npm
rm package-lock.json
rm -rf node_modules/

# 2. Installer avec pnpm
pnpm install

# 3. Installer les hooks
bash scripts/install-git-hooks.sh

# 4. Premier nettoyage
pnpm run commit-ready
```

## 📁 Architecture des Scripts

```
scripts/
├── clean-copilot-backups.sh    # Nettoyage des sauvegardes
├── sync-pnpm.sh                # Synchronisation pnpm
├── install-git-hooks.sh        # Installation des hooks
└── pre-commit-hook.sh           # Hook pre-commit

.vscode/
└── settings.json                # Configuration VS Code optimisée
```

## 🔗 Liens Utiles

- [Guide Complet Détaillé](./COPILOT_MANAGEMENT_GUIDE.md) - Documentation exhaustive
- [Documentation pnpm](https://pnpm.io/motivation)
- [VS Code Settings Reference](https://code.visualstudio.com/docs/getstarted/settings)

---

**✨ Avec cette configuration, vos sauvegardes Copilot sont gérées automatiquement !**

_Dernière mise à jour : 31 mai 2025_
