<!-- @format -->

````bash
# Local development
pnpm run vercel:dev
# Equivalent to: vercel dev (with automatic vercel.json removal)

# Production
pnpm run vercel:prod
# Equivalent to: vercel --prod (with automatic vercel.json creation)

# Manual configuration
pnpm run vercel:config dev   # Prepare for dev
pnpm run vercel:config prod  # Prepare for prod
pnpm run vercel:config clean # Clean vercel.json

# Git Workflow - 3 levels according to your needs
pnpm run vercel:commit   # 🎯 Simple: Only restore vercel.json
pnpm run commit-ready    # ⚡ Fast: Prepare commit + Git preview (daily usage)
pnpm run pre-commit      # 🔍 Complete: Lint + formatting + everything (important commit)

# Cleanup
pnpm run vercel:clean
# Remove vercel.json if present
```

# 🚀 Vercel Automation - Usage Guide

This guide explains how to use automation to manage Vercel configurations according to environment, with integrated Git workflow.

## 🎯 Problem Solved

- **Locally**: `vercel dev` doesn't work with a `vercel.json` file
- **In production**: `vercel --prod` absolutely needs the `vercel.json` file
- **Git/CI-CD**: The repository must contain `vercel.json` for automatic Vercel deployments
- **Solution**: Complete automation via pnpm scripts with integrated Git workflow

## 📋 Available Scripts

### pnpm Scripts (recommended)

```bash
# Local development
pnpm run vercel:dev
# Equivalent to: vercel dev (with automatic vercel.json removal)

# Production
pnpm run vercel:prod
# Equivalent to: vercel --prod (with automatic vercel.json creation)

# Manual configuration
pnpm run vercel:config dev   # Prepare for dev
pnpm run vercel:config prod  # Prepare for prod
pnpm run vercel:config clean # Clean vercel.json

# Cleanup
pnpm run vercel:clean
# Remove vercel.json if present
````

### Direct bash script

```bash
# If you prefer using the script directly
./scripts/vercel-config.sh dev    # Prepare for development
./scripts/vercel-config.sh prod   # Prepare for production
./scripts/vercel-config.sh clean  # Clean files
```

## 🔄 Recommended Workflow

### 1. Local development

```bash
pnpm run vercel:dev
```

✅ Script automatically removes `vercel.json` then runs `vercel dev`

### 2. Production deployment

```bash
pnpm run vercel:prod
```

✅ Script copies `vercel.only-prod.json` to `vercel.json` then runs `vercel --prod`

### 3. Integrated Git workflow

```bash
# During development
pnpm run vercel:dev          # vercel.json is removed

# Before committing - 3 options depending on context:

# 🎯 Option 1: Simple restoration (fast)
pnpm run vercel:commit       # Just restore vercel.json

# ⚡ Option 2: Daily preparation (recommended)
pnpm run commit-ready        # Restore + clean + Git preview
git add .
git commit -m "feat: ..."   # vercel.json est inclus dans le commit

# 🔍 Option 3: Commit important (complet)
pnpm run pre-commit          # Restaure + nettoie + lint + formatage
git add .
git commit -m "feat: ..."   # Code parfaitement formaté et vérifié

# Après le commit, retour en mode dev
pnpm run vercel:dev          # Re-supprime vercel.json pour le développement
```

## 🎯 Détail des commandes Git

### **`pnpm run vercel:commit`** - Action ciblée ⚡⚡⚡

**Ce qu'elle fait :**

- ✅ Restaure uniquement `vercel.json` depuis `vercel.only-prod.json`
- ✅ Affiche un message de confirmation
- ⏱️ **Ultra rapide** (2 secondes)

**Quand l'utiliser :**

- Vous voulez juste restaurer `vercel.json` manuellement
- Action ponctuelle sans autres vérifications

### **`pnpm run commit-ready`** - Usage quotidien ⚡⚡

**Ce qu'elle fait :**

- ✅ Restaure `vercel.json`
- ✅ **Affiche `git status`** (pour voir ce qui va être committé)
- ❌ Pas de nettoyage Copilot (géré par le hook automatique)
- ❌ Pas de sync pnpm (géré par le hook automatique)
- ❌ Pas de lint/formatage (plus rapide)
- ⏱️ **Ultra rapide** (5 secondes)

**Quand l'utiliser :**

- **Usage quotidien recommandé**
- Commits standards pendant le développement
- Quand vous voulez voir l'aperçu Git avant de committer

### **`pnpm run pre-commit`** - Commit de qualité ⚡

**Ce qu'elle fait :**

- ✅ Nettoie les sauvegardes Copilot
- ✅ Synchronise pnpm
- ✅ Restaure `vercel.json`
- ✅ **Vérifie le lint** (bloque si erreurs)
- ✅ **Formate automatiquement le code**
- ⏱️ **Plus lent** (30-45 secondes)

**Quand l'utiliser :**

- Commits importants (features, releases)
- Avant de pousser sur la branche principale
- Quand vous voulez être sûr que tout est parfait

## 📊 Tableau comparatif

| Action                   | `vercel:commit` | `commit-ready` | `pre-commit` |
| ------------------------ | :-------------: | :------------: | :----------: |
| **Restaure vercel.json** |       ✅        |       ✅       |      ✅      |
| **Nettoie Copilot**      |       ❌        |       ❌       |      ✅      |
| **Sync pnpm**            |       ❌        |       ❌       |      ✅      |
| **Aperçu Git**           |       ❌        |       ✅       |      ❌      |
| **Vérifie lint**         |       ❌        |       ❌       |      ✅      |
| **Formate code**         |       ❌        |       ❌       |      ✅      |
| **Vitesse**              |     ⚡⚡⚡      |     ⚡⚡⚡     |      ⚡      |
| **Usage**                |    Ponctuel     | **Quotidien**  |  Important   |

### 4. Nettoyage après production

```bash
pnpm run vercel:clean
```

✅ Supprime `vercel.json` pour éviter les conflits lors du prochain développement

## 📁 Structure des fichiers

```
app/
├── vercel.json            ← Dans Git (pour Vercel automatique)
├── vercel.only-prod.json  ← Sauvegarde (identique à vercel.json)
└── scripts/
    └── vercel-config.sh   ← Script d'automatisation
```

## 🔄 Cycle de vie des fichiers

### **État Git (repository)**

- ✅ `vercel.json` est **committé** (requis pour Vercel automatique)
- ✅ `vercel.only-prod.json` est **committé** (sauvegarde)

### **État Local pendant le développement**

- ❌ `vercel.json` est **supprimé** temporairement (pour `vercel dev`)
- ✅ `vercel.only-prod.json` reste **présent**

### **État Local avant commit**

- ✅ `vercel.json` est **restauré** automatiquement par les scripts
- ✅ `vercel.only-prod.json` reste **présent**

## ⚠️ Important

- **Ne jamais** modifier manuellement `vercel.json`
- **Toujours** modifier `vercel.only-prod.json` pour les changements de config
- **Utiliser** les scripts pnpm pour éviter les erreurs
- **Pour les commits quotidiens** : utiliser `pnpm run commit-ready`
- **Pour les commits importants** : utiliser `pnpm run pre-commit`

## 🐛 Dépannage

### Si `vercel dev` ne fonctionne pas

```bash
pnpm run vercel:clean  # Supprime vercel.json
pnpm run vercel:dev    # Relance en mode dev
```

### Si `vercel --prod` échoue

```bash
pnpm run vercel:config prod  # Vérifie la configuration
pnpm run vercel:prod         # Relance le déploiement
```

### Vérifier l'état des fichiers

```bash
ls -la vercel*.json
# Devrait montrer :
# - vercel.only-prod.json (toujours présent)
# - vercel.json (présent seulement pour production)
```

## 🎉 Avantages

✅ **Plus de renommage manuel**
✅ **Impossible d'oublier la configuration**  
✅ **Workflow automatisé et sûr**
✅ **Compatible avec pnpm**
✅ **Scripts intégrés au package.json**

---

_Ce système garantit que vous ne ferez plus jamais `vercel --prod` sans le fichier `vercel.json` requis !_
