<!-- @format -->

# 📋 Plan d'implémentation CI/CD - ArgentBank

## 🎯 Objectif

Mettre en place un pipeline CI/CD robuste pour ArgentBank en implémentant les fonctionnalités étape par étape, en testant chaque phase avant de passer à la suivante.

## 📅 Planning d'implémentation

### Phase 1 : CI de base (À implémenter maintenant)

**Durée estimée :** 1-2 heures

**Objectifs :**

- ✅ Workflow CI fonctionnel
- ✅ Tests et vérifications de base
- ✅ Feedback rapide sur les PRs

**Jobs à implémenter :**

```yaml
ci.yml:
├── Job: lint
│   ├── ESLint check
│   └── Format check
├── Job: typecheck
│   ├── TypeScript compilation
│   └── Type validation
├── Job: test
│   ├── Tests unitaires (Vitest)
│   ├── Tests d'intégration (Vitest)
│   └── Tests d'accessibilité (Axe intégré)
└── Job: build
    ├── Build Vite
    └── Vérification des outputs
```

**Tests de validation :**

1. Créer une PR avec une erreur de lint ❌
2. Créer une PR avec une erreur TypeScript ❌
3. Créer une PR avec un test qui échoue ❌
4. Créer une PR propre ✅

### Phase 2 : Déploiement automatique

**Durée estimée :** 1 heure

**Objectifs :**

- ✅ Déploiement automatique sur Vercel
- ✅ Preview deployments pour les PRs
- ✅ Production deployment sur main

**Jobs à ajouter :**

```yaml
deploy.yml (ou ajout à ci.yml):
├── Job: deploy-preview
│   ├── Conditions: Pull Request
│   ├── Deploy to Vercel Preview
│   └── Comment avec URL preview
└── Job: deploy-production
    ├── Conditions: Push to main
    ├── Deploy to Vercel Production
    └── Notification de succès
```

**Tests de validation :**

1. Créer une PR et vérifier le déploiement preview ✅
2. Merger sur main et vérifier le déploiement prod ✅

### Phase 3 : Analyse et reporting

**Durée estimée :** 1 heure

**Objectifs :**

- ✅ Coverage reports
- ✅ Bundle analysis
- ✅ Security audit

**Jobs à ajouter :**

```yaml
analysis.yml:
├── Job: coverage
│   ├── Generate coverage report
│   ├── Upload to Codecov (optionnel)
│   └── Comment PR avec coverage
├── Job: bundle-analysis
│   ├── Analyze bundle size
│   ├── Compare with baseline
│   └── Report size changes
└── Job: security
    ├── npm audit
    ├── Check vulnerabilities
    └── Report security issues
```

### Phase 4 : Tests d'accessibilité et performance (OBLIGATOIRES - Plus tard)

**Durée estimée :** 2-3 heures

**Objectifs :**

- ✅ Tests E2E avec Cypress (navigation utilisateur complète) - **OBLIGATOIRE**
- ✅ Tests de performance Lighthouse (Core Web Vitals) - **OBLIGATOIRE**
- ✅ Tests d'accessibilité Pa11y (conformité WCAG - priorité absolue) - **OBLIGATOIRE**

**Note importante :** Ces tests sont obligatoires pour la conformité WCAG et la qualité utilisateur, mais implémentés progressivement après avoir validé le CI de base.

## 🧪 Stratégie de test par phase

### Phase 1 - Tests de base

**Scénarios de test :**

1. **Test de lint échoue :**

   ```typescript
   // Ajouter une erreur de lint volontaire
   const unusedVariable = "test"; // ESLint error
   ```

2. **Test TypeScript échoue :**

   ```typescript
   // Ajouter une erreur de type volontaire
   const test: string = 123; // Type error
   ```

3. **Test unitaire échoue :**

   ```typescript
   // Modifier temporairement un test pour qu'il échoue
   expect(true).toBe(false); // Test failure
   ```

4. **Test de build échoue :**

   ```typescript
   // Import inexistant
   import { NonExistentComponent } from "./nowhere";
   ```

5. **Test succès complet :**
   - Code propre, lint ✅
   - Types corrects ✅
   - Tests passent ✅
   - Build réussi ✅

### Phase 2 - Tests de déploiement

**Scénarios de test :**

1. **PR avec preview deployment :**

   - Créer une PR avec un changement visible
   - Vérifier que le preview est accessible
   - Tester la fonctionnalité sur le preview

2. **Merge vers production :**
   - Merger la PR
   - Vérifier le déploiement en production
   - Tester la fonctionnalité en prod

## 📋 Checklist d'implémentation

### Phase 1 : CI de base

- [ ] Créer `.github/workflows/ci.yml`
- [ ] Configurer les jobs lint, typecheck, test, build
- [ ] Tester avec PR qui échoue (lint)
- [ ] Tester avec PR qui échoue (typecheck)
- [ ] Tester avec PR qui échoue (test)
- [ ] Tester avec PR qui échoue (build)
- [ ] Tester avec PR qui réussit complètement
- [ ] Vérifier les temps d'exécution (< 10 min)
- [ ] Documenter les résultats

### Phase 2 : Déploiement

- [ ] Ajouter les secrets Vercel dans GitHub
- [ ] Configurer le job de preview deployment
- [ ] Configurer le job de production deployment
- [ ] Tester le preview deployment avec une PR
- [ ] Tester le production deployment avec un merge
- [ ] Vérifier les URLs de déploiement
- [ ] Documenter les résultats

### Phase 3 : Analyse

- [ ] Configurer le coverage reporting
- [ ] Configurer l'analyse de bundle
- [ ] Configurer l'audit de sécurité
- [ ] Tester chaque fonctionnalité
- [ ] Optimiser les performances si nécessaire
- [ ] Documenter les résultats

## 🔧 Configuration requise

### Secrets GitHub à configurer (Phase 2)

```bash
# À ajouter dans GitHub Repository Settings > Secrets
VERCEL_TOKEN=           # Token Vercel
VERCEL_ORG_ID=         # ID organisation Vercel
VERCEL_PROJECT_ID=     # ID projet Vercel
```

### Scripts package.json requis (Phase 1)

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:ci": "eslint . --ext .ts,.tsx --format json --output-file eslint-report.json",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:ci": "vitest run --coverage --reporter=verbose",
    "build": "vite build"
  }
}
```

## 📊 Métriques de succès

### Explication des temps d'exécution

#### Comprendre l'exécution en parallèle dans GitHub Actions

**❓ Pourquoi Phase 1 = 4-8 min et Phase 2 = 1-2 min ?**

C'est parce que GitHub Actions peut exécuter des jobs **en parallèle** une fois que certaines conditions sont remplies !

**Phase 1 - Tests de base (4-8 minutes SÉQUENTIELS) :**

```yaml
Exécution séquentielle dans le même job :
lint (30s) → typecheck (45s) → test (3-5min) → build (1-2min)
Total : 4-8 minutes
```

**Phase 2 - Déploiement (1-2 minutes EN PARALLÈLE) :**

```yaml
Une fois que build est réussi :
├── deploy-preview (1-2min) // S'exécute en parallèle
└── autres tests peuvent continuer // En même temps !
```

**Temps total réel :** ~6-10 minutes MAXIMUM (pas 15+ minutes) car tout s'optimise en parallèle !

#### Stratégie d'optimisation des workflows

```yaml
Exemple concret d'exécution :
├── 0:00 → Démarrage du workflow
├── 0:30 → Lint terminé ✅
├── 1:15 → TypeCheck terminé ✅
├── 6:00 → Tests terminés ✅
├── 7:30 → Build terminé ✅ → 🚀 Déploiement démarre en parallèle
├── 8:00 → Coverage analysis (en parallèle avec déploiement)
├── 9:30 → Déploiement terminé ✅
└── 10:00 → Workflow complet ✅
```

**Temps total : 10 minutes**, pas 4+8+1+2=15 minutes !

#### Pourquoi 95% de taux de succès des WORKFLOWS ?

Le taux de 95% concerne le **succès des Pull Requests** (pas des tests individuels) :

- ✅ **95% des PRs passent le CI** sans intervention manuelle
- ✅ **5% nécessitent des corrections** (erreurs humaines, problèmes environnementaux)
- ✅ **Standard professionnel élevé** pour la qualité du workflow
- ✅ **Encourage l'excellence** et les bonnes pratiques

**IMPORTANT :** Les tests individuels doivent TOUJOURS être à 100% de réussite :

```yaml
Taux de réussite OBLIGATOIRES (100%) :
├── ✅ Tests unitaires (Vitest): 100% - BLOQUE LE MERGE
├── ✅ Tests d'intégration (Vitest): 100% - BLOQUE LE MERGE
├── ✅ Tests d'accessibilité (Axe): 100% - BLOQUE LE MERGE
├── ✅ Tests d'accessibilité (Pa11y): 100% - BLOQUE LE MERGE
├── ✅ Tests E2E (Cypress): 100% - BLOQUE LE MERGE
├── ⚠️  Lighthouse Performance: > 70% CI / > 85% Prod - WARNING
└── ⚠️  Lighthouse autres: > 90% - WARNING
```

### 🎯 Philosophie du CI/CD avec focus accessibilité

#### Priorités par ordre d'importance

1. **🔴 CRITIQUE - Accessibilité** (Bloque le merge)

   - Pa11y : Conformité WCAG 2.1 AA obligatoire
   - Axe intégré : Tests d'accessibilité dans chaque composant
   - Score Lighthouse accessibilité > 90

2. **🟠 HAUTE - Fonctionnel** (Bloque le merge)

   - Tests unitaires et d'intégration
   - Build réussi
   - TypeScript sans erreurs

3. **🟡 MOYENNE - Qualité** (Bloque le merge)

   - ESLint sans erreurs
   - Tests E2E critiques (Cypress)

4. **🟢 BASSE - Performance** (Warning, ne bloque pas)
   - Score Lighthouse performance > 70% (CI) / > 85% (Prod)
   - Bundle size analysis
   - Security audit

**Note Lighthouse :** Les scores Lighthouse varient entre local/CI/production. Le CI utilise des seuils plus bas car l'environnement n'est pas optimisé (pas de CDN, cache, etc.).

#### Stratégie de blocage des PRs

```yaml
Conditions de merge:
├── ✅ OBLIGATOIRE - Pa11y accessibility: 100% conforme WCAG 2.1 AA
├── ✅ OBLIGATOIRE - Tests unitaires: 100% passés
├── ✅ OBLIGATOIRE - Build: Succès
├── ✅ OBLIGATOIRE - TypeScript: 0 erreurs
├── ✅ OBLIGATOIRE - ESLint: 0 erreurs
├── ⚠️  WARNING - Lighthouse performance < 80 (merge autorisé avec warning)
└── ⚠️  WARNING - Bundle size increase > 10% (merge autorisé avec warning)
```

## 🚨 Points d'attention

### Configuration Vercel

- ✅ Root Directory configuré : `P11-ArgentBank`
- ✅ Build Command : `pnpm build`
- ✅ Install Command : `pnpm install`
- ✅ Output Directory : `dist`

### Working Directory GitHub Actions

```yaml
# IMPORTANT : Tous les jobs doivent utiliser
defaults:
  run:
    working-directory: P11-ArgentBank
```

### Cache Strategy

```yaml
# Optimiser les temps avec cache
- uses: actions/cache@v3
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

## 📝 Documentation des tests

Après chaque phase, documenter :

1. **Temps d'exécution** de chaque job
2. **Problèmes rencontrés** et solutions
3. **Optimisations** appliquées
4. **Recommandations** pour la suite

## 🚨 Note importante sur Lighthouse

### Différences de scores selon l'environnement

```bash
Lighthouse Local (Dev):        ~55-65% performance
Lighthouse Local (Build):      ~70-80% performance
Lighthouse CI/CD:              ~60-75% performance
Lighthouse Production:         ~85-95% performance
```

### Pourquoi ces différences ?

**Développement local :**

- ❌ Mode développement non-optimisé
- ❌ Hot reload et debugging actifs
- ❌ Pas de compression/minification

**CI/CD :**

- ✅ Build optimisé mais environnement limité
- ❌ Pas de CDN ni cache
- ❌ Ressources serveur partagées

**Production :**

- ✅ Build optimisé + CDN Vercel
- ✅ Cache et compression activés
- ✅ Infrastructure dédiée

### Stratégie recommandée

```yaml
Approche Lighthouse pour CI:
├── 🎯 Utiliser en mode RELATIF (détection de régression)
├── ⚠️  Seuils adaptés: Performance > 70% (CI) vs > 85% (Prod)
├── 📊 Comparer avec commit précédent (-10% = alert)
└── 🚨 Focus sur accessibilité: TOUJOURS 100%
```

## 🎯 Prochaine action

**Phase 1 - Étape 1 :** Créer le fichier `.github/workflows/ci.yml` avec les 4 jobs de base.

Êtes-vous prêt à commencer l'implémentation de la Phase 1 ?
