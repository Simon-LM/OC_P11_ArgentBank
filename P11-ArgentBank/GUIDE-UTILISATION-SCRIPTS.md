<!-- @format -->

# 🚀 Guide d'Utilisation des Scripts de Gestion Copilot

## 📋 Vue d'Ensemble

Votre projet dispose d'un système complet de gestion automatique des sauvegardes GitHub Copilot et des conflits pnpm/npm. Voici comment l'utiliser efficacement.

## 🎯 Scripts Disponibles

### 1. Scripts de Nettoyage

#### `pnpm run clean:copilot`

**Usage :** Nettoie toutes les sauvegardes automatiques de Copilot

```bash
pnpm run clean:copilot
```

**Quand l'utiliser :**

- Avant chaque commit important
- Quand VS Code devient lent
- Après une session de développement intensive

#### `pnpm run sync:pnpm`

**Usage :** Synchronise les dépendances et résout les conflits npm/pnpm

```bash
pnpm run sync:pnpm
```

**Quand l'utiliser :**

- Après l'installation de nouvelles dépendances
- Quand vous voyez des conflits package-lock.json vs pnpm-lock.yaml
- En cas d'erreurs de dépendances

### 2. Script Tout-en-Un

#### `pnpm run commit-ready`

**Usage :** Prépare complètement le projet pour un commit

```bash
pnpm run commit-ready
```

**Ce qu'il fait :**

- ✅ Nettoie les sauvegardes Copilot
- ✅ Synchronise pnpm
- ✅ Affiche le statut Git

**Utilisation recommandée :** Avant chaque commit important

### 3. Hook Automatique (Pre-commit)

#### Installation (une seule fois)

```bash
bash scripts/install-git-hooks.sh
```

**Ce qui se passe automatiquement à chaque commit :**

1. 🧹 Nettoyage des sauvegardes Copilot
2. 🔄 Synchronisation pnpm
3. 🔍 Linting du code (warnings seulement, n'empêche pas le commit)
4. 🎨 Formatage automatique du code
5. ➕ Ajout des fichiers formatés au commit

## 🔄 Workflows Recommandés

### Workflow 1 : Développement Quotidien

```bash
# 1. Travail normal dans VS Code
# 2. Le hook s'occupe automatiquement du nettoyage à chaque commit
git add .
git commit -m "feat: nouvelle fonctionnalité"
```

### Workflow 2 : Nettoyage Manuel

```bash
# Si vous voulez nettoyer manuellement
pnpm run clean:copilot

# Ou préparation complète
pnpm run commit-ready
git add .
git commit -m "refactor: amélioration du code"
```

### Workflow 3 : Résolution de Problèmes

```bash
# En cas de conflits ou de problèmes
pnpm run sync:pnpm        # Résout les conflits de dépendances
pnpm run clean:copilot    # Nettoie les sauvegardes
pnpm run commit-ready     # Vérification complète
```

## 🎯 Utilisation SANS Commit

### ⚡ Réponses Directes à vos Questions

**Q: Le nettoyage se fait automatiquement lors des commits ?**  
✅ **OUI** - Le hook pre-commit nettoie automatiquement à chaque `git commit`

**Q: Comment synchroniser sans commiter ?**  
✅ **OUI** - Utilisez exactement : `pnpm run clean:copilot`

**Q: Que faire avant de fermer VS Code sans commit ?**  
✅ **OUI** - Exécutez : `pnpm run clean:copilot`

### 🔄 Scénarios Pratiques SANS Commit

#### Scénario 1 : Fin de session de travail

```bash
# Avant de fermer VS Code sans commiter
pnpm run clean:copilot
```

**Pourquoi ?** Nettoie les sauvegardes temporaires accumulées pendant la session.

#### Scénario 2 : VS Code devient lent

```bash
# Pendant que vous développez
pnpm run clean:copilot
```

**Pourquoi ?** Libère l'espace disque et améliore les performances.

#### Scénario 3 : Longue session de développement

```bash
# Toutes les 2-3 heures, ou quand VS Code ralentit
pnpm run clean:copilot
```

**Pourquoi ?** Évite l'accumulation excessive de sauvegardes temporaires.

#### Scénario 4 : Changement de branche sans commit

```bash
# Avant de changer de branche avec des modifications non commitées
pnpm run clean:copilot
git stash push -m "WIP: travail en cours"
git checkout autre-branche
```

**Pourquoi ?** Évite les conflits de sauvegardes entre branches.

#### Scénario 5 : Redémarrage de VS Code fréquent

```bash
# Si vous redémarrez souvent VS Code
pnpm run clean:copilot
```

**Pourquoi ?** Évite les conflits de restauration de session.

## 🎮 Commandes de Développement

### Scripts de Test

```bash
# Tests unitaires
pnpm test                 # Tests en mode production
pnpm run test:watch      # Tests en mode watch

# Tests E2E
pnpm run test:e2e        # Tests Cypress
pnpm run cypress:open    # Interface Cypress

# Tests d'accessibilité
pnpm run test:a11y       # Pa11y
```

### Scripts de Build

```bash
pnpm run build           # Build production
pnpm run build:analyze   # Build avec analyse des bundles
pnpm run dev             # Serveur de développement
```

### Scripts de Qualité Code

```bash
pnpm run lint            # Linting
pnpm run format          # Formatage Prettier
pnpm run typecheck       # Vérification TypeScript
```

## 🚨 Gestion des Problèmes

### Problème : VS Code s'ouvre automatiquement

**Solution :** ✅ Déjà résolu ! Le script `sync-vscode.sh` a été modifié pour ne plus ouvrir VS Code automatiquement.

### Problème : Conflits package-lock.json vs pnpm-lock.yaml

```bash
pnpm run sync:pnpm
```

### Problème : VS Code devient lent

```bash
pnpm run clean:copilot
```

### Problème : Le hook ne fonctionne pas

```bash
# Réinstaller le hook
bash scripts/install-git-hooks.sh

# Vérifier les permissions
chmod +x ../.git/hooks/pre-commit
```

## 📊 Statut du Système

### Vérifier que tout fonctionne

```bash
# 1. Tester le nettoyage
pnpm run clean:copilot

# 2. Tester la synchronisation
pnpm run sync:pnpm

# 3. Vérifier le hook
ls -la ../.git/hooks/pre-commit

# 4. Test complet
pnpm run commit-ready
```

### Configuration VS Code

Les paramètres dans `.vscode/settings.json` empêchent la création excessive de sauvegardes :

- `"files.hotExit": "off"`
- `"editor.formatOnSave": true`
- Configuration pnpm optimisée

## 💡 Conseils d'Utilisation

### ✅ Bonnes Pratiques

- Laissez le hook pre-commit gérer automatiquement le nettoyage
- Utilisez `pnpm run commit-ready` avant les commits importants
- Exécutez `pnpm run clean:copilot` après de longues sessions de développement

### ❌ À Éviter

- Ne pas désactiver le hook pre-commit
- Ne pas mélanger npm et pnpm (utilisez toujours pnpm)
- Ne pas ignorer les warnings de linting (même s'ils n'empêchent pas le commit)

## 🔧 Personnalisation

### Modifier le comportement du hook

Éditez `scripts/pre-commit-hook.sh` pour :

- Ajouter d'autres vérifications
- Modifier les règles de linting
- Changer les patterns de nettoyage

### Ajouter de nouveaux scripts

Ajoutez dans `package.json` section `scripts` et créez le fichier correspondant dans `scripts/`.

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans le terminal
2. Consultez `COPILOT_MANAGEMENT_GUIDE.md` pour les détails techniques
3. Réinstallez le hook avec `bash scripts/install-git-hooks.sh`

**Le système est maintenant entièrement automatique ! 🎉**
