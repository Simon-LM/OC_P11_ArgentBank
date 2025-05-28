<!-- @format -->

# Axe - Tests d'Accessibilité Intégrés

## 📋 Vue d'ensemble

Axe-core est un moteur de test d'accessibilité intégré directement dans les
tests existants de l'application ArgentBank. Cette approche moderne permet de
tester l'accessibilité en même temps que les fonctionnalités.

## 🚀 Approche Intégrée

✅ **Tests unifiés** - Accessibilité intégrée dans chaque test de composant
✅ **Maintenance simplifiée** - Pas de duplication de tests
✅ **Coverage automatique** - Tous les composants testés incluent l'accessibilité
✅ **CI/CD optimisé** - Un seul pipeline de tests
✅ **Developer Experience** - Tests d'accessibilité lors du développement

## 🏗️ Architecture

### Structure principale

- **Axe/config/** - Configuration des règles WCAG
- **Axe/utils/** - Setup global pour tous les tests
- **Axe/reports/** - Rapports générés
- **src/\*\*/\*.test.tsx** - Tests intégrés dans les composants

### Fichiers concernés

| Composant    | Fichier de test                                   | Status     |
| ------------ | ------------------------------------------------- | ---------- |
| EditUserForm | src/components/EditUserForm/EditUserForm.test.tsx | ✅ Intégré |
| Features     | src/components/Features/Features.test.tsx         | ✅ Intégré |
| Home         | `src/pages/home/Home.test.tsx`                    | ✅ Intégré |
| SignIn       | `src/pages/signIn/SignIn.test.tsx`                | ✅ Intégré |
| Header       | `src/layouts/header/Header.test.tsx`              | ✅ Intégré |
| Footer       | `src/layouts/footer/Footer.test.tsx`              | ✅ Intégré |

## 📦 Dépendances

### Packages installés

**Installation :** `pnpm add -D @axe-core/react axe-core jest-axe`

- **@axe-core/react** - Intégration React pour Axe
- **axe-core** - Moteur principal d'analyse d'accessibilité
- **jest-axe** - Matchers Jest/Vitest pour les tests

## ⚙️ Configuration

### Configuration Axe

**Fichier :** `Axe/config/axe.config.js`

**Règles WCAG configurées :**

- Contraste des couleurs (color-contrast)
- Navigation au clavier (keyboard)
- Gestion du focus (focus-management)

**Standards testés :** WCAG 2.1 A, AA, AAA

### Setup centralisé

**Fichier :** `Axe/utils/axe-setup.js`

Ce fichier contient la configuration globale pour tous les tests d'accessibilité.

## 🧪 Utilisation

### Commands principales

- **Tous les tests :** `pnpm run test`
- **Mode watch :** `pnpm run test:watch`
- **Mode développement :** `pnpm run test:dev`

### Import dans les tests

**Pattern standard pour chaque fichier de test :**

1. Importer jest-axe : `import { axe } from "jest-axe";`
2. Importer le setup : `import "../../../Axe/utils/axe-setup.js";`
3. Ajouter le test d'accessibilité

### Exemple de test

**Test d'accessibilité type :**

Le test vérifie qu'il n'y a aucune violation d'accessibilité dans le composant rendu.
La fonction axe analyse le DOM et retourne un rapport de conformité WCAG.

## 📊 Standards et Conformité

### Niveaux WCAG testés

- **WCAG 2.1 A** - Niveau de base
- **WCAG 2.1 AA** - Niveau standard (requis)
- **WCAG 2.1 AAA** - Niveau avancé (optionnel)

### Règles principales vérifiées

1. **Contraste des couleurs** - Ratio minimum 4.5:1
2. **Navigation au clavier** - Tous les éléments accessibles
3. **Étiquettes des formulaires** - Labels appropriés
4. **Structure sémantique** - Headings et landmarks
5. **Texte alternatif** - Images et médias

## 🔍 Comparaison Axe vs Pa11y

| Aspect                 | Axe CLI (Tests unitaires)     | Pa11y (Tests navigateur)        |
| ---------------------- | ----------------------------- | ------------------------------- |
| **Type**               | Tests unitaires JSDOM         | Tests navigateur statiques      |
| **Rendu visuel**       | ❌ JSDOM - pas de CSS calculé | ✅ Navigateur - CSS complet     |
| **Contraste couleurs** | ❌ **Ne peut PAS détecter**   | ✅ **Détecte correctement**     |
| **Structure DOM**      | ✅ Excellent                  | ✅ Excellent                    |
| **Navigation clavier** | ⚠️ Limité (simulation)        | ⚠️ État statique seulement      |
| **Intégration**        | Dans le code                  | Scripts externes                |
| **Rapidité**           | ⚡ Très rapide                | 🐌 Plus lent                    |
| **Couverture**         | Composants isolés             | Pages complètes (état statique) |
| **CI/CD**              | ✅ Natif                      | ✅ Via scripts                  |

### ⚠️ Limitation critique d'Axe CLI

**Axe CLI ne peut PAS détecter les violations de contraste** car :

- Il s'exécute dans JSDOM (simulation DOM)
- Les styles CSS ne sont pas calculés/rendus visuellement
- Pas d'accès aux couleurs finales affichées à l'écran

**Pa11y détecte les contrastes** car :

- Il utilise Puppeteer avec un vrai navigateur (Chromium)
- Les styles sont complètement calculés et rendus
- Analyse des couleurs réellement affichées

## 💡 Bonnes Pratiques

### Architecture recommandée

1. **Centralisation** - Tout le code Axe dans le dossier `Axe/`
2. **Setup unique** - Un seul fichier `Axe/utils/axe-setup.js`
3. **Configuration partagée** - Règles communes dans `Axe/config/`
4. **Tests intégrés** - Ajout aux tests existants, pas de doublons
5. **Imports relatifs** - Chemins depuis `src/` vers `Axe/`

### Règles de développement

✅ **Import obligatoire** - Toujours importer `axe-setup.js` dans chaque test
✅ **Test minimum** - Un test d'accessibilité par composant React
✅ **Configuration centralisée** - Utiliser `Axe/config/` plutôt qu'inline
✅ **Correction des violations** - Corriger avant merge
✅ **Documentation des exceptions** - Justifier si nécessaire

### Avantages de l'approche intégrée

| Aspect              | Avant (doublons)       | Après (intégré)       |
| ------------------- | ---------------------- | --------------------- |
| **Maintenance**     | 🔴 2x plus de fichiers | ✅ Fichiers unifiés   |
| **Synchronisation** | 🔴 Risque de décalage  | ✅ Toujours synchrone |
| **Coverage**        | 🔴 Partiel             | ✅ 100% automatique   |
| **Performance**     | 🔴 Tests séparés       | ✅ Tests groupés      |

## 🎯 Objectifs et Métriques

### KPIs d'accessibilité

- **0 violations critiques** - Impact "critical"
- **< 5 violations sérieuses** - Impact "serious"
- **100% couverture composants** - Tous les composants testés
- **Temps d'exécution < 30s** - Performance des tests

## 🐛 Dépannage

### Problèmes courants

**Tests lents :**

- Solution: Tester des composants isolés
- Éviter les tests de pages entières

**Faux positifs :**

- Solution: Configuration des règles personnalisées
- Exclusion de règles spécifiques si justifié

**Intégration Vitest :**

- Solution: Matchers jest-axe correctement configurés
- Vérifier l'import du setup centralisé

## 🎯 Recommandations d'usage

### Pour les tests de contraste couleurs

- **Utiliser Pa11y** pour les violations de contraste (tests navigateur)
- **Utiliser l'extension Axe navigateur** pour l'analyse manuelle complète
- **Axe CLI** sera silencieux sur les contrastes ⚠️

### Pour les autres violations d'accessibilité

- **Axe CLI** est parfait pour la structure DOM, labels, roles, etc.
- Tests rapides et intégrés au workflow de développement

### Stratégie recommandée

```bash
# Tests unitaires accessibilité (structure DOM)
npm test

# Tests navigateur accessibilité (contraste + rendu complet)
npm run pa11y
```

## 📊 Classification correcte des types de tests

### 🏗️ **Architecture de test d'accessibilité**

```text
Tests d'Accessibilité
├── 🧪 Tests Unitaires (Axe CLI)
│   ├── Structure DOM/ARIA
│   ├── Règles spécifiques
│   └── États composants React
│
├── 🌐 Tests Navigateur (Pa11y)
│   ├── Rendu CSS complet
│   ├── Contraste couleurs
│   └── Pages complètes statiques
│
├── 🔄 Tests E2E + Accessibilité (Cypress + Axe)
│   ├── Parcours utilisateur complets
│   ├── Interactions dynamiques
│   ├── États après actions utilisateur
│   ├── Rendu CSS complet + interactions
│   └── Flux métier accessibles
│
└── 🧪 Tests Unitaires (Axe CLI)
```

### 🎯 **Pa11y = Tests navigateur statiques**

Pa11y n'est **pas du E2E** mais du **"Browser Testing"** :

- ✅ **Vrai navigateur** (Puppeteer/Chromium)
- ✅ **CSS calculé** et rendu complet
- ❌ **Pas d'interactions** utilisateur
- ❌ **Pas de navigation** entre pages
- ❌ **Pas de scénarios** métier

## 🎯 Violations qu'Axe CLI détecte MIEUX que Pa11y

### 🔍 Avantages spécifiques d'Axe CLI

| Type de violation               | Axe CLI          | Pa11y                       | Pourquoi Axe CLI est meilleur     |
| ------------------------------- | ---------------- | --------------------------- | --------------------------------- |
| **Tests règles spécifiques**    | ✅ **Excellent** | ⚠️ Limité                   | Configuration fine par règle      |
| **Tests composants isolés**     | ✅ **Parfait**   | ❌ Pages entières seulement | Tests unitaires précis            |
| **Analyses ARIA avancées**      | ✅ **Excellent** | ⚠️ Basique                  | Moteur Axe natif plus sophistiqué |
| **Tests états dynamiques**      | ✅ **Parfait**   | ⚠️ Difficile                | Contrôle des états React          |
| **Tests formulaires complexes** | ✅ **Excellent** | ⚠️ Basique                  | Analyse fine des attributs        |
| **Règles personnalisées**       | ✅ **Excellent** | ❌ Impossible               | Configuration JavaScript          |

## 🚀 Axe + Cypress : La Combinaison Ultime

### 🎯 **Pourquoi ajouter Axe à Cypress ?**

**Cypress + Axe** combine le **meilleur des deux mondes** :

| Aspect                     | Cypress seul   | Cypress + Axe              | Avantage                         |
| -------------------------- | -------------- | -------------------------- | -------------------------------- |
| **Interactions réelles**   | ✅ Parfait     | ✅ **Parfait**             | Navigation, clics, formulaires   |
| **Rendu CSS complet**      | ✅ Parfait     | ✅ **Parfait**             | Contraste, layout, responsive    |
| **États dynamiques**       | ⚠️ Basique     | ✅ **Axe analyse l'état**  | Accessibilité après interactions |
| **Tests ARIA avancés**     | ❌ Manuel      | ✅ **Automatique Axe**     | Règles WCAG sophistiquées        |
| **Violations spécifiques** | ❌ Manuel      | ✅ **Moteur Axe complet**  | Configuration fine des règles    |
| **Rapports détaillés**     | ⚠️ Screenshots | ✅ **Rapports Axe + logs** | Diagnostic précis des violations |

### 🧪 **Violations UNIQUES détectées par Cypress + Axe**

#### 1. **Accessibilité post-interaction**

- Test l'accessibilité APRÈS chaque interaction utilisateur
- Vérification des états dynamiques des composants
- Validation du focus management après actions

#### 2. **Navigation dynamique accessible**

- Parcours utilisateur complet avec vérifications à chaque étape
- Test des états intermédiaires des formulaires
- Validation de l'accessibilité page par page

#### 3. **États d'erreur accessibles**

- Test des messages d'erreur et leur accessibilité
- Vérification du focus sur les champs en erreur
- Validation des annonces pour les lecteurs d'écran

#### 4. **Composants conditionnels**

- Test des éléments qui apparaissent/disparaissent dynamiquement
- Dropdown, modals, tooltips accessibles
- Validation des interactions complexes

### 🎯 **Installation Cypress + Axe**

**Dépendances requises :**

- `cypress` - Framework de test E2E
- `cypress-axe` - Plugin d'intégration Axe pour Cypress

**Configuration :**

- Fichier de configuration : `cypress/support/commands.js`
- Import du plugin cypress-axe
- Commandes personnalisées pour les règles d'accessibilité

### 📊 **Stratégie de test complète recommandée**

| Type de test                | Outil          | Fréquence   | Couverture                   |
| --------------------------- | -------------- | ----------- | ---------------------------- |
| **Développement quotidien** | Axe CLI (Jest) | Chaque push | Composants isolés            |
| **Contraste couleurs**      | Pa11y          | Nightly     | Pages statiques complètes    |
| **Parcours utilisateur**    | Cypress + Axe  | Pre-release | Interactions + accessibilité |
| **Audit complet**           | Extension Axe  | Mensuel     | Analyse manuelle experte     |

### 🚀 **Exemple concret pour ArgentBank**

**Test E2E + Accessibilité du login :**

**Étapes du test automatisé :**

1. **Page initiale** - Vérification accessibilité page login
2. **Saisie username** - Test état intermédiaire formulaire
3. **Saisie password** - Validation champs complétés
4. **Soumission** - Test interaction et navigation
5. **Page dashboard** - Accessibilité après connexion
6. **Menu utilisateur** - Test éléments dynamiques

**Test gestion d'erreurs :**

- Login avec champs vides
- Validation messages d'erreur accessibles
- Vérification du focus management correct

### 🎯 **Violations détectées UNIQUEMENT par Cypress + Axe**

1. **Focus management dynamique** - Où va le focus après une action ?
2. **ARIA live regions** - Annonces dynamiques fonctionnent-elles ?
3. **Navigation séquentielle** - Tab order après interactions
4. **États ARIA dynamiques** - `aria-expanded`, `aria-selected` après clic
5. **Contraste en contexte** - Couleurs d'états (hover, focus, error)
6. **Landmarks dynamiques** - Navigation entre sections après actions

### ✨ **Résumé : Triple couverture d'accessibilité**

```text
🏗️ Architecture complète d'accessibilité

1. 🧪 Axe CLI (Tests unitaires)
   └── Développement quotidien, composants isolés

2. 🌐 Pa11y (Tests navigateur statiques)
   └── Contraste couleurs, rendu CSS complet

3. 🚀 Cypress + Axe (Tests E2E + accessibilité)
   └── Parcours utilisateur, interactions réelles, états dynamiques
```

**Cette approche triple garantit une accessibilité parfaite à tous les niveaux !**

### 🧪 Exemples concrets - Axe CLI détecte

#### 1. **Violations ARIA sophistiquées**

**Règles avancées détectées par Axe CLI :**

- `aria-command-name` - Noms des commandes ARIA
- `aria-input-field-name` - Noms des champs de saisie
- `aria-required-children` - Enfants ARIA requis
- `aria-valid-attr-value` - Valeurs d'attributs ARIA valides
- `form-field-multiple-labels` - Labels multiples sur les formulaires

#### 2. **Structure complexe des formulaires**

- Labels manquants sur des champs cachés
- Attributs `aria-describedby` incorrects
- Relations `aria-labelledby` brisées
- Validation d'état `aria-invalid`

#### 3. **Tests d'états dynamiques**

**Test de l'accessibilité avant/après interaction :**

- Simulation d'interactions utilisateur (clic, saisie)
- Analyse des états des composants après changement
- Validation de l'accessibilité dans tous les états

#### 4. **Violation de structure sémantique**

- Ordre des headings (h1 → h3 sans h2)
- Landmarks manquants ou mal placés
- Structure de liste incorrecte

#### 5. **Tests règles spécifiques métier**

**Configuration sur mesure pour votre application :**

- `region: enabled` - Landmarks obligatoires
- `skip-link: enabled` - Liens d'évitement requis
- `landmark-unique: enabled` - Landmarks uniques

#### 6. **Validation composants React**

- Props d'accessibilité manquantes
- États ARIA incorrects dans les hooks
- Context d'accessibilité brisé

### ⚡ Performance et précision

**Axe CLI** est plus **rapide et précis** pour :

- Tests de régression accessibilité
- Validation continue en développement
- Détection early de violations structurelles
- Tests d'intégration composants

**Pa11y** reste meilleur pour :

- Contraste couleurs (rendu visuel)
- Tests utilisateur final complets
- Validation pages entières

---

**✨ Axe est installé et prêt pour les tests d'accessibilité automatisés !**

_Dernière mise à jour : 28 mai 2025_
_Version : 1.0.0_
_Status : ✅ Installé et configuré_
