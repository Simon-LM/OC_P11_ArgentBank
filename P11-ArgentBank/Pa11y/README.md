<!-- @format -->

# Pa11y - Web Accessibility Tests

## 📋 Overview

Pa11y is an automated accessibility testing tool that analyzes web pages according to WCAG (Web Content Accessibility Guidelines) standards. This project uses Pa11y to test the accessibility of the ArgentBank application on 3 main pages:

- **Home page** (`/`) - Public page without authentication
- **Login page** (`/signIn`) - User login page
- **User dashboard** (`/user`) - Private page requiring authentication

## 🚀 Quick start

**Essential steps to launch Pa11y with Vercel dev**:

1. **Start server with serverless functions**:

   ```bash
   vercel dev
   ```

2. **Note the displayed port** (e.g.: `Available at http://localhost:3001`)

3. **Update Pa11y configuration**:

   ```bash
   pnpm run test:a11y-update-port
   # or manually:
   # pnpm run test:a11y-update-port 3001
   ```

4. **Run accessibility tests**:

   ```bash
   pnpm run test:a11y
   ```

**⚠️ Important**: Always use `vercel dev` instead of `pnpm run dev` for serverless functions!

## 🚀 Prerequisites

### Package manager

This project uses **pnpm** as package manager. Make sure it's installed:

```bash
npm install -g pnpm
```

### Serveur de développement

Le projet utilise **Vercel dev** pour les fonctions serverless en développement local :

```bash
pnpm install vercel -g
```

## 📦 Installation

1. **Installer les dépendances Pa11y** (depuis la racine du projet) :

```bash
pnpm install pa11y puppeteer
```

1. **Vérifier l'installation** :

```bash
npx pa11y --version
```

## 🏗️ Structure des fichiers

```text
Pa11y/
├── pa11y-auth.js              # Script d'authentification
├── run-pa11y-tests.js         # Script de test personnalisé (PRINCIPAL)
├── update-port.js             # Script utilitaire pour mettre à jour les ports
├── validate-setup.js          # Script de validation de la configuration
├── FOLDER_ORGANIZATION.md     # Organisation des dossiers
├── README.md                  # Cette documentation
└── screenshots/               # Captures d'écran organisées
    ├── debug/                 # Captures de débogage
    ├── errors/                # Captures d'erreurs
    └── success/               # Captures de succès
```

## ⚙️ Configuration

### Configuration Pa11y avec horodatage ✨

Cette configuration Pa11y utilise un **système d'horodatage automatique** pour toutes les captures d'écran.

#### Script personnalisé (Unique méthode)

Le script `run-pa11y-tests.js` utilise l'horodatage automatique :

```bash
pnpm run test:a11y
```

**Avantages** :

- ✅ **Horodatage automatique** de tous les fichiers de capture
- ✅ **Gestion avancée de l'authentification** avec captures de debug
- ✅ **Compatible Puppeteer** - pas de problèmes de navigateur
- ✅ **Messages de debug détaillés**
- ✅ **Tests des 3 pages** automatiquement

### Script d'authentification (`pa11y-auth.js`)

Script ES Module qui automatise la connexion avec les identifiants :

- **Email** : `tony@stark.com`
- **Mot de passe** : `password123`

Le script :

1. Navigue vers `/signIn`
2. Remplit automatiquement les champs email/mot de passe
3. Clique sur le bouton de connexion
4. Redirige vers `/user` pour les tests d'accessibilité

### Script personnalisé (`run-pa11y-tests.js`)

Script avancé qui :

- Teste 3 URLs avec gestion d'authentification
- Génère des captures d'écran organisées par type
- Fournit des rapports détaillés d'accessibilité
- Gère les erreurs et timeouts

## 🖥️ Utilisation

### Démarrage du serveur de développement

**⚠️ IMPORTANT - Fonctions Serverless requises** :

Ce projet utilise **Vercel dev** exclusivement car il contient des fonctions serverless dans le dossier `/api/`. Les commandes `npm run dev` ou `pnpm run dev` classiques ne fonctionneront pas correctement car elles ne prennent pas en charge les fonctions serverless.

**Seule méthode supportée** :

```bash
# Depuis la racine du projet
vercel dev
```

**Pourquoi Vercel dev est obligatoire** :

- Le projet contient des API serverless dans `/api/` (login, transactions, etc.)
- Ces fonctions nécessitent l'environnement Vercel pour fonctionner
- Pa11y teste des pages qui dépendent de ces APIs (authentification, données utilisateur)
- Sans Vercel dev, les tests d'authentification échoueront

**⚠️ Gestion des ports** :

Vercel dev utilise par défaut le port 3000, mais si ce port est occupé, il utilisera automatiquement le port suivant disponible (3001, 3002, etc.).

- **Vérifiez le port affiché** lors du démarrage de `vercel dev`
- **Mettez à jour la configuration Pa11y** si le port change
- **Exemple** : Si Vercel dev utilise le port 3001, utilisez le script de mise à jour : `node Pa11y/update-port.js 3001`

Le serveur sera accessible sur `http://localhost:PORT` (PORT affiché par Vercel dev)

## 🧪 Méthodes de test d'accessibilité

### ✅ Méthode Principale (Recommandée) - Avec horodatage automatique

```bash
# Depuis la racine du projet
pnpm run test:a11y
```

**Avantages** :

- ✅ **Horodatage automatique** de toutes les captures d'écran
- ✅ **Authentification robuste** avec captures de débogage
- ✅ **Gestion d'erreurs avancée**
- ✅ **Compatible tous environnements**
- ✅ **Rapports détaillés**
- ✅ **Tests des 3 pages** en une seule commande

### 🔍 Tests Individuels (Pour débogage spécifique)

```bash
# Test d'une page spécifique (sans screenshots automatiques)
npx pa11y http://localhost:3000/
npx pa11y http://localhost:3000/signIn

# Pour la page user, l'authentification manuelle est requise
```

**Note** : Pour des tests complets avec authentification automatique et screenshots, utilisez toujours `pnpm run test:a11y`.

## 📸 Gestion des captures d'écran

Les captures sont automatiquement organisées dans `screenshots/` avec des **noms horodatés** :

### Types de captures

- **`debug/`** : Captures pendant le processus d'authentification
- **`errors/`** : Captures en cas d'erreur ou d'échec de test
- **`success/`** : Captures en cas de succès du test

### Format des noms de fichiers

Tous les fichiers de capture d'écran utilisent maintenant un **format horodaté** :

```text
YYYY-MM-DD_HH-mm-ss_description.png
```

**Exemples** :

- `2025-05-27_14-30-15_home-page.png`
- `2025-05-27_14-30-16_debug_before_submit_click.png`
- `2025-05-27_14-30-17_error_after_login_wrong_page.png`

### Configuration automatique

- Les captures de **succès** sont générées automatiquement pour chaque page testée
- Les captures de **debug** et **erreur** sont générées selon les besoins pendant l'authentification
- Aucune configuration manuelle requise - les horodatages sont générés automatiquement

## 📊 Rapports

Les rapports sont générés au format JSON et peuvent être convertis en HTML.

## 🔧 Options de configuration avancées

### Timeout et Chrome

Les configurations importantes pour le comportement de Pa11y et Chrome peuvent être ajustées dans le script `run-pa11y-tests.js` :

- **Timeout général** :
  - Propriété : `timeout`
  - Valeur typique : `30000` (ms)
  - Configuration dans le script de test personnalisé
- **Arguments de lancement de Chrome** :
  - Propriété : `chromeLaunchConfig.args`
  - Valeurs typiques : `["--no-sandbox", "--disable-setuid-sandbox"]` pour les environnements CI.

Ces options sont définies directement dans le script personnalisé `run-pa11y-tests.js`.

### Standards d'accessibilité

Pa11y teste par défaut les standards **WCAG 2.1 AA**. Pour modifier :

```bash
npx pa11y --standard WCAG2A http://localhost:3000/
npx pa11y --standard WCAG2AAA http://localhost:3000/
```

### Ignorer certaines règles

```bash
npx pa11y --ignore "color-contrast;link-name" http://localhost:3000/
```

## 🐛 Dépannage

### Problèmes courants

1. **Serveur non démarré**

   ```bash
   Error: connect ECONNREFUSED 127.0.0.1:3000
   ```

   **Solution** : Démarrer le serveur avec `vercel dev` uniquement

2. **Timeout d'authentification**

   ```bash
   Error: Timeout waiting for navigation
   ```

   **Solution** : Augmenter le timeout dans le script `run-pa11y-tests.js`

3. **Problèmes de capture d'écran**

   ```bash
   Error: Failed to take screenshot
   ```

   **Solution** : Vérifier les permissions du dossier `screenshots/`

4. **Échec d'authentification**

   - Vérifier que les identifiants dans `pa11y-auth.js` sont corrects
   - S'assurer que les sélecteurs CSS sont à jour
   - Vérifier les captures dans `screenshots/debug/`

5. **Port incorrect**

   ```bash
   Error: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
   ```

   **Solution** : Vérifier le port utilisé par `vercel dev` et mettre à jour les scripts

   ```bash
   # 1. Vérifier le port utilisé par Vercel dev
   vercel dev
   # Note: Port affiché (ex: 3001)

   # 2. Mettre à jour automatiquement les scripts avec le bon port
   node Pa11y/update-port.js 3001
   ```

**💡 Script automatique** : Utilisez le script utilitaire pour automatiser cette tâche :

```bash
# Détection automatique du port et mise à jour
node Pa11y/update-port.js

# Ou spécifier un port manuellement
node Pa11y/update-port.js 3001
```

### Commandes de diagnostic

```bash
# Vérifier l'état du serveur
curl http://localhost:3000/

# Tester Pa11y sur une page simple
npx pa11y --version

# Vérifier les dépendances
pnpm list pa11y puppeteer

# Vérifier Vercel CLI
vercel --version
```

## ✅ Test de validation

### Validation automatique de la configuration

Avant de lancer les tests Pa11y, validez que votre configuration est correcte :

```bash
pnpm run test:a11y-validate
```

Ce script vérifie :

- ✅ Présence de tous les fichiers de configuration
- ✅ Installation des dépendances npm (pa11y, puppeteer, vercel)
- ✅ Validité de la structure des dossiers
- ✅ Structure des dossiers de captures d'écran
- ✅ Présence des scripts dans package.json

### Test complet de la configuration

Pour vérifier que tout fonctionne correctement :

1. **Démarrer le serveur** :

   ```bash
   vercel dev
   ```

2. **Tester Pa11y sur la page d'accueil** :

   ```bash
   npx pa11y http://localhost:3000/
   ```

3. **Lancer les tests complets** :

   ```bash
   pnpm run test:a11y
   ```

Si tout fonctionne, vous devriez voir des rapports d'accessibilité et des captures d'écran dans `Pa11y/screenshots/`.

## 🔗 Integration with the project

### Scripts pnpm

Les scripts suivants sont disponibles dans votre fichier `package.json` :

- `test:a11y": "node Pa11y/run-pa11y-tests.js"`
  - Exécute le script de test personnalisé avec horodatage automatique des screenshots.
- `test:a11y-update-port": "node Pa11y/update-port.js"`
  - Met à jour le port dans la configuration Pa11y en fonction du port utilisé par `vercel dev`.
- `test:a11y-validate": "node Pa11y/validate-setup.js"`
  - Valide la configuration Pa11y avant l'exécution des tests.
- `dev": "vercel dev"`
  - Démarre le serveur de développement avec Vercel.

### Utilisation

```bash
pnpm run test:a11y              # Tests Pa11y personnalisés avec horodatage
pnpm run test:a11y-update-port  # Mettre à jour les ports automatiquement
pnpm run test:a11y-validate     # Valider la configuration Pa11y
pnpm run dev                    # Serveur Vercel dev
```

## 📈 Versions et compatibilité

- **Pa11y** : v8.0.0 (installé)
- **Puppeteer** : v23.11.1 (installé)
- **Node.js** : v16+ recommandé
- **pnpm** : v7+ recommandé
- **Vercel CLI** : Dernière version

## 🚀 Prochaines étapes

1. **CI/CD** : Intégrer Pa11y dans le pipeline de déploiement
2. **Rapports** : Générer des rapports HTML détaillés
3. **Tests supplémentaires** : Ajouter plus de pages à tester
4. **Automatisation** : Planifier les tests d'accessibilité réguliers
5. **Intégration Vercel** : Optimiser pour les déploiements Vercel

## 📚 Ressources

- [Documentation Pa11y](https://pa11y.org/)
- [Standards WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Guide Vercel dev](https://vercel.com/docs/cli/dev)
- [Documentation pnpm](https://pnpm.io/)

---

**Note** : Ce projet utilise spécifiquement **pnpm** et **Vercel dev** pour optimiser les performances et gérer les fonctions serverless en développement local.
