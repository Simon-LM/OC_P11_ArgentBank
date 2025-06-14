<!-- @format -->

# 📋 Plan d'implémentation CI/CD - ArgentBank

## 🎯 Objectif

Mettre en place un pipeline CI/CD robuste et sécurisé pour ArgentBank avec un **workflow unique** utilisant l'approche **Preview First** pour éviter les déploiements défaillants en production.

## 🚨 Problème critique identifié

**L'architecture actuelle (workflows séparés) présente un défaut de sécurité majeur :**

- ❌ `ci.yml`, `accessibility-performance.yml` et `deploy.yml` sont **indépendants**
- ❌ `deploy.yml` peut déployer en production **même si les autres workflows échouent**
- ❌ Aucune dépendance entre les workflows
- ❌ Risque de déployer du code défaillant en production

**Solution :** Workflow unique avec dépendances strictes entre les phases.

## 📅 Planning d'implémentation (Architecture cible)

### **Phase 1 : Création du workflow unique sécurisé** ⚡ (Nouvelle priorité)

**Durée estimée :** 2-3 heures (avec tests approfondis)

**Objectifs :**

- ✅ Workflow unique avec dépendances strictes
- ✅ Approche Preview First (sécurisée)
- ✅ Auto-promotion production si tous les tests passent
- ✅ Impossibilité de déployer si un test échoue

**Structure du workflow `complete-ci-cd.yml` :**

```yaml
name: "🚀 Complete CI/CD Pipeline"

jobs:
  # Phase 1: Tests de base (bloquants)
  ci-tests:
    name: "🔍 CI Tests (Lint, TypeCheck, Unit Tests, Build)"
    runs-on: ubuntu-latest
    steps: [setup, lint, typecheck, test, build]

  # Phase 2: Déploiement Preview (dépend de ci-tests)
  deploy-preview:
    name: "📦 Deploy Preview"
    needs: ci-tests
    if: success()
    runs-on: ubuntu-latest
    outputs:
      preview-url: ${{ steps.deploy.outputs.url }}
    steps: [setup, deploy-preview-vercel, capture-url]

  # Phase 3: Tests avancés sur Preview (dépend de deploy-preview)
  accessibility-tests:
    name: "🧪 Accessibility & Performance Tests"
    needs: deploy-preview
    if: success()
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-type: [cypress, pa11y, lighthouse]
    steps: [setup, run-tests-on-preview]

  # Phase 4: Auto-promotion Production (dépend de TOUT)
  promote-production:
    name: "🚀 Promote to Production"
    needs: [ci-tests, deploy-preview, accessibility-tests]
    if: success() && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps: [setup, promote-preview-to-production]
```

**Tests de validation :**

1. **Test de blocage CI :** Créer une erreur de lint → Vérifier que rien ne se déploie ❌
2. **Test de blocage accessibilité :** Créer une erreur Pa11y → Vérifier que la production n'est pas mise à jour ❌
3. **Test de réussite complète :** Code propre → Vérifier la séquence complète ✅
4. **Test sur branche feature :** Vérifier que seul le preview se déploie (sans promotion) ✅

### **Phase 2 : Migration progressive et sécurisée**

**Durée estimée :** 1 heure

**Objectifs :**

- ✅ Migration sans casser l'existant
- ✅ Période de test du nouveau workflow
- ✅ Rollback possible si problème

**Étapes de migration :**

```yaml
Étape 2.1: Test en parallèle (sécurisé)
├── Créer complete-ci-cd.yml
├── Conserver les anciens workflows (backup)
├── Tester complete-ci-cd.yml sur branche feature
├── Valider tous les cas de figure
└── Ajuster le nouveau workflow si nécessaire

Étape 2.2: Désactivation temporaire (réversible)
├── Renommer ci.yml → ci.yml.backup
├── Renommer deploy.yml → deploy.yml.backup
├── Renommer accessibility-performance.yml → accessibility-performance.yml.backup
├── Activer complete-ci-cd.yml en production
└── Surveiller 2-3 commits pour validation

Étape 2.3: Validation et nettoyage
├── Valider le comportement sur main
├── Vérifier les temps d'exécution
├── Optimiser si nécessaire
├── Supprimer les fichiers .backup si tout OK
└── Mettre à jour la documentation
```

### **Phase 3 : Optimisation et monitoring**

**Durée estimée :** 1 heure

**Objectifs :**

- ✅ Optimisation des performances
- ✅ Monitoring des métriques
- ✅ Documentation finalisée

**Optimisations :**

```yaml
Performance:
├── Parallélisation des tests accessibilité (matrix strategy)
├── Cache optimisé pour toutes les phases
├── Artifacts partagés entre jobs
└── Conditional execution selon le type de changement

Monitoring:
├── Métriques de temps d'exécution
├── Taux de succès par phase
├── Alertes si dépassement de seuils
└── Dashboard de suivi des déploiements
```

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

## 📋 Checklist d'implémentation (Architecture cible)

### **Phase 1 : Workflow unique sécurisé**

- [ ] **Analyser les workflows existants**
  - [ ] Identifier les jobs fonctionnels dans ci.yml
  - [ ] Identifier les jobs fonctionnels dans accessibility-performance.yml
  - [ ] Identifier les jobs fonctionnels dans deploy.yml
  - [ ] Documenter les scripts pnpm utilisés
- [ ] **Créer `complete-ci-cd.yml`**
  - [ ] Job `ci-tests` (lint, typecheck, test, build)
  - [ ] Job `deploy-preview` (needs ci-tests, deploy preview)
  - [ ] Job `accessibility-tests` (needs deploy-preview, cypress+pa11y+lighthouse)
  - [ ] Job `promote-production` (needs all, condition main branch)
- [ ] **Tester le nouveau workflow**
  - [ ] Test sur branche feature (preview seulement)
  - [ ] Test avec erreur lint (doit bloquer tout)
  - [ ] Test avec erreur Pa11y (doit bloquer promotion)
  - [ ] Test complet sur main (promotion automatique)
- [ ] **Validation des performances**
  - [ ] Vérifier temps d'exécution (< 15 min total)
  - [ ] Vérifier parallélisation des tests
  - [ ] Optimiser si nécessaire

### **Phase 2 : Migration progressive**

- [ ] **Préparation sécurisée**
  - [ ] Backup des workflows existants (.backup)
  - [ ] Documentation de rollback
  - [ ] Plan de test de migration
- [ ] **Migration temporaire**
  - [ ] Désactiver les anciens workflows (renommer)
  - [ ] Activer complete-ci-cd.yml
  - [ ] Surveiller 2-3 commits
- [ ] **Validation et nettoyage**
  - [ ] Vérifier comportement sur PR
  - [ ] Vérifier comportement sur main
  - [ ] Vérifier blocage en cas d'erreur
  - [ ] Supprimer les anciens fichiers si OK

### **Phase 3 : Optimisation**

- [ ] **Performance**
  - [ ] Optimiser cache entre jobs
  - [ ] Paralléliser tests accessibilité (matrix)
  - [ ] Partager artifacts entre jobs
- [ ] **Monitoring**
  - [ ] Ajouter métriques temps d'exécution
  - [ ] Ajouter alertes échec critique
  - [ ] Dashboard de suivi (optionnel)
- [ ] **Documentation**
  - [ ] Mettre à jour README avec nouveau workflow
  - [ ] Documenter les conditions de blocage
  - [ ] Guide de dépannage

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

## 🎯 Prochaine action (Plan actualisé)

**Phase 1 - Étape 1 :** Créer le fichier `.github/workflows/complete-ci-cd.yml` avec la structure sécurisée suivante :

```yaml
# Structure du workflow unique à créer
complete-ci-cd.yml:
├── ci-tests (lint + typecheck + test + build) - BLOQUANT
├── deploy-preview (needs: ci-tests) - Deploy preview uniquement
├── accessibility-tests (needs: deploy-preview) - Tests sur preview - BLOQUANT
└── promote-production (needs: all + main branch) - Auto-promotion si tout OK
```

**Avantages de cette approche :**

- 🛡️ **Sécurité maximale** : Impossible de déployer en production si un test échoue
- 🧪 **Tests sur environnement réel** : Tests d'accessibilité sur Preview Vercel
- ⚡ **Performance optimisée** : Un seul setup, jobs avec dépendances
- 🔄 **Migration sécurisée** : Conservation des anciens workflows en backup

**Êtes-vous prêt à commencer la création du workflow unique sécurisé ?**

---

### 🚨 Rappel du problème critique

L'architecture actuelle permet des déploiements production même en cas d'échec des tests d'accessibilité. Le workflow unique résout définitivement ce problème de sécurité.
