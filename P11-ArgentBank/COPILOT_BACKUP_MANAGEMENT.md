<!-- @format -->

# 🤖 Guide Complet : Gestion des Sauvegardes GitHub Copilot avec pnpm

> **Problème résolu** : Conflits de sauvegardes Copilot/VS Code lors des redémarrages et commits avec pnpm

## 📋 **Table des Matières**

1. [Problème Initial](#-problème-initial)
2. [Solutions Implémentées](#-solutions-implémentées)
3. [Flux de Travail Recommandé](#-flux-de-travail-recommandé)
4. [Résolution des Conflits Courants](#-résolution-des-conflits-courants)
5. [Commandes Rapides](#-commandes-rapides)
6. [Bonnes Pratiques](#-bonnes-pratiques)

---

## 🚨 **Problème Initial**

### Symptômes Observés

- ✗ Anciennes sauvegardes de fichiers réapparaissent au redémarrage de VS Code
- ✗ Conflits entre npm et pnpm (package-lock.json vs pnpm-lock.yaml)
- ✗ Sauvegardes Copilot non synchronisées avec l'état Git
- ✗ Cache VS Code corrompu causant des incohérences

### Causes Racines

- **VS Code** : `files.hotExit` activé par défaut
- **Copilot** : Sauvegardes automatiques non nettoyées
- **Gestionnaire de paquets** : Mélange npm/pnpm dans le même projet
- **Cache** : Accumulation de fichiers temporaires

---

## ✅ **Solutions Implémentées**

### 1. **Configuration VS Code Optimisée**

- `files.hotExit: "off"` - Désactive les sauvegardes automatiques à la fermeture
- Exclusion des dossiers temporaires de l'indexation
- Configuration `npm.packageManager: "pnpm"` pour forcer l'utilisation de pnpm

### 2. **Scripts de Nettoyage Automatique**

#### 🧹 **Nettoyage des Sauvegardes Copilot**

```bash
pnpm run clean:copilot
# ou directement
bash scripts/clean-copilot-backups.sh
```

#### 🔄 **Synchronisation pnpm**

```bash
pnpm run sync:pnpm
# ou directement
bash scripts/sync-pnpm.sh
```

#### 🚀 **Préparation de Commit**

```bash
pnpm run commit-ready
```

Cette commande :

- Nettoie les sauvegardes Copilot
- Synchronise avec pnpm
- Affiche l'état Git

### 3. **Hook Pre-commit Automatique**

#### Installation du Hook

```bash
bash scripts/install-git-hooks.sh
```

Le hook s'exécute automatiquement avant chaque commit et :

- ✅ Nettoie les sauvegardes VS Code/Copilot
- ✅ Vérifie l'absence de `package-lock.json`
- ✅ Synchronise avec pnpm
- ✅ Exécute les linters
- ✅ Formate le code

### 4. **Gitignore Mis à Jour**

Les fichiers suivants sont maintenant ignorés :

```gitignore
# Sauvegardes VS Code et Copilot
.vscode/workspaceStorage/
.history/
*.backup
*.bak
*.autosave

# Conflits de package managers
package-lock.json
yarn.lock
```

## 🎯 **Flux de Travail Recommandé**

### Avant de Fermer VS Code

```bash
pnpm run commit-ready
```

### Avant un Commit Important

```bash
# Nettoyage complet
pnpm run clean:copilot
pnpm run sync:pnpm

# Vérification
git status

# Commit (le hook se déclenche automatiquement)
git commit -m "votre message"
```

### En Cas de Problème de Synchronisation

```bash
# Forcer la synchronisation
pnpm run sync:pnpm

# Nettoyer complètement le cache
rm -rf .vscode/workspaceStorage/
rm -rf .history/
pnpm store prune
```

## 🚨 **Résolution des Conflits Courants**

### Package-lock.json Détecté

```bash
# Le hook le supprimera automatiquement
# Ou manuellement :
rm package-lock.json
pnpm install
```

### Sauvegardes Corrompues

```bash
# Nettoyage complet
pnpm run clean:copilot
# Redémarrer VS Code
```

### Problèmes de Cache pnpm

```bash
# Nettoyer le store pnpm
pnpm store prune
# Réinstaller
pnpm install
```

## 📋 **Commandes Rapides**

| Action             | Commande                            |
| ------------------ | ----------------------------------- |
| Nettoyage rapide   | `pnpm run clean:copilot`            |
| Sync pnpm          | `pnpm run sync:pnpm`                |
| Préparation commit | `pnpm run commit-ready`             |
| Installation hook  | `bash scripts/install-git-hooks.sh` |
| Test hook          | `.git/hooks/pre-commit`             |

## 💡 **Bonnes Pratiques**

1. **Exécutez `pnpm run commit-ready` avant de fermer VS Code**
2. **Utilisez toujours pnpm, jamais npm** dans ce projet
3. **Le hook pre-commit protège contre les erreurs courantes**
4. **En cas de doute, nettoyez avec `pnpm run clean:copilot`**

---

✨ **Avec cette configuration, vos sauvegardes Copilot seront gérées automatiquement et vous éviterez les conflits !**
