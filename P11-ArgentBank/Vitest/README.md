<!-- @format -->

# Guide des Tests Vitest - ArgentBank

## 📋 Vue d'ensemble

Ce dossier contient la documentation complète pour les tests Vitest du projet ArgentBank. Les fichiers de test restent co-localisés avec leurs composants respectifs pour faciliter la maintenance.

## 📁 Structure de la documentation

```
Vitest/
├── README.md                    # Ce fichier - Vue d'ensemble générale
├── UNIT_TESTS.md               # Guide des tests unitaires
├── INTEGRATION_TESTS.md        # Guide des tests d'intégration
├── TEST_ARCHITECTURE.md        # Architecture et conventions
├── CONFIGURATION.md            # Configuration Vitest
└── MAINTENANCE.md              # Guide de maintenance
```

## 🧪 Types de tests

### Tests Unitaires

- **Localisation** : `*.test.tsx` à côté des composants
- **Objectif** : Tester la logique isolée des composants
- **Documentation** : [UNIT_TESTS.md](./UNIT_TESTS.md)

### Tests d'Intégration

- **Localisation** : `*.integration.test.tsx` à côté des composants
- **Objectif** : Tester l'interaction entre composants et services
- **Documentation** : [INTEGRATION_TESTS.md](./INTEGRATION_TESTS.md)

## 📊 Statistiques actuelles

- **Total des fichiers de test** : 42 fichiers
- **Tests unitaires** : ~180 tests
- **Tests d'intégration** : ~64 tests
- **Couverture globale** : ~88%

## 🚀 Commandes principales

```bash
# Exécuter tous les tests
pnpm test

# Tests en mode développement
pnpm test:dev

# Tests en mode watch
pnpm test:watch

# Vérification des types
pnpm typecheck
```

## 📍 Localisation des tests

### Tests de composants

```
src/components/
├── ComponentName/
│   ├── ComponentName.tsx
│   ├── ComponentName.test.tsx           # Tests unitaires
│   └── ComponentName.integration.test.tsx  # Tests d'intégration (si applicable)
```

### Tests de pages

```
src/pages/
├── PageName/
│   ├── PageName.tsx
│   ├── PageName.test.tsx
│   └── PageName.integration.test.tsx
```

### Tests utilitaires et store

```
src/utils/
├── utilFunction.ts
└── utilFunction.test.ts

src/store/
├── slices/
│   ├── sliceName.ts
│   └── sliceName.test.ts
```

## 🎯 Guides spécialisés

- **[Architecture des tests](./TEST_ARCHITECTURE.md)** - Conventions et structure
- **[Tests unitaires](./UNIT_TESTS.md)** - Guide pratique des tests unitaires
- **[Tests d'intégration](./INTEGRATION_TESTS.md)** - Guide des tests d'intégration
- **[Configuration](./CONFIGURATION.md)** - Setup et configuration Vitest
- **[Maintenance](./MAINTENANCE.md)** - Bonnes pratiques de maintenance

## 🔗 Intégration avec les autres outils de test

- **[Lighthouse](../lighthouse/README.md)** - Tests de performance
- **[Axe](../Axe/README.md)** - Tests d'accessibilité automatisés
- **[Pa11y](../Pa11y/README.md)** - Tests d'accessibilité complémentaires

## 📝 Pour les développeurs

### Ajout d'un nouveau test

1. Créer le fichier de test à côté du composant
2. Suivre les conventions de nommage
3. Utiliser les patterns documentés
4. Vérifier la couverture de code

### Pour les IA

- Structure cohérente et prévisible
- Documentation extensive avec exemples
- Patterns réutilisables documentés
- Conventions claires pour tous types de tests

---

**Dernière mise à jour** : 29 mai 2025
**Mainteneur** : Équipe ArgentBank
