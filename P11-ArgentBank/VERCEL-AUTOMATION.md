<!-- @format -->

````bash
# Développement local
pnpm run vercel:dev
# Équivalent à : vercel dev (avec suppression automatique de vercel.json)

# Production
pnpm run vercel:prod
# Équivalent à : vercel --prod (avec création automatique de vercel.json)

# Configuration manuelle
pnpm run vercel:config dev   # Prépare pour dev
pnpm run vercel:config prod  # Prépare pour prod
pnpm run vercel:config clean # Nettoie vercel.json

# Workflow Git - 3 niveaux selon vos besoins
pnpm run vercel:commit   # 🎯 Simple: Restaure uniquement vercel.json
pnpm run commit-ready    # ⚡ Rapide: Prépare commit + aperçu Git (usage quotidien)
pnpm run pre-commit      # 🔍 Complet: Lint + formatage + tout (commit important)

# Nettoyage
pnpm run vercel:clean
# Supprime vercel.json si présent
```on Vercel - Guide d'utilisation

Ce guide explique comment utiliser l'automatisation pour gérer les configurations Vercel selon l'environnement, avec un workflow Git intégré.

## 🎯 Problème résolu

- **En local** : `vercel dev` ne fonctionne pas avec un fichier `vercel.json`
- **En production** : `vercel --prod` a absolument besoin du fichier `vercel.json`
- **Git/CI-CD** : Le repository doit contenir `vercel.json` pour les déploiements automatiques Vercel
- **Solution** : Automatisation complète via des scripts pnpm avec workflow Git intégré

## 📋 Scripts disponibles

### Scripts pnpm (recommandés)

```bash
# Développement local
pnpm run vercel:dev
# Équivalent à : vercel dev (avec suppression automatique de vercel.json)

# Production
pnpm run vercel:prod
# Équivalent à : vercel --prod (avec création automatique de vercel.json)

# Configuration manuelle
pnpm run vercel:config dev   # Prépare pour dev
pnpm run vercel:config prod  # Prépare pour prod
pnpm run vercel:config clean # Nettoie vercel.json

# Nettoyage
pnpm run vercel:clean
# Supprime vercel.json si présent
````

### Script bash direct

```bash
# Si vous préférez utiliser le script directement
./scripts/vercel-config.sh dev    # Prépare pour développement
./scripts/vercel-config.sh prod   # Prépare pour production
./scripts/vercel-config.sh clean  # Nettoie les fichiers
```

## 🔄 Workflow recommandé

### 1. Développement local

```bash
pnpm run vercel:dev
```

✅ Le script supprime automatiquement `vercel.json` puis lance `vercel dev`

### 2. Déploiement production

```bash
pnpm run vercel:prod
```

✅ Le script copie `vercel.only-prod.json` vers `vercel.json` puis lance `vercel --prod`

### 3. Workflow Git intégré

```bash
# Pendant le développement
pnpm run vercel:dev          # vercel.json est supprimé

# Avant de committer - 3 options selon le contexte:

# 🎯 Option 1: Restauration simple (rapide)
pnpm run vercel:commit       # Juste restaure vercel.json

# ⚡ Option 2: Préparation quotidienne (recommandée)
pnpm run commit-ready        # Restaure + nettoie + aperçu Git
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
P11-ArgentBank/
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
