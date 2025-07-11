<!-- @format -->

# 📋 CI/CD Implementation Plan - ArgentBank

## 🎯 Objective

Implement a robust and secure CI/CD pipeline for ArgentBank with a **unified workflow** using the **Preview First** approach to prevent failed deployments to production.

## 🚨 Critical Issue Identified

**The current architecture (separate workflows) presents a major security flaw:**

- ❌ `ci.yml`, `accessibility-performance.yml` and `deploy.yml` are **independent**
- ❌ `deploy.yml` can deploy to production **even if other workflows fail**
- ❌ No dependencies between workflows
- ❌ Risk of deploying faulty code to production

**Solution:** Single workflow with strict dependencies between phases.

## 📅 Implementation Schedule (Target Architecture)

### **Phase 1: Creating secure unified workflow** ⚡ (New priority)

**Estimated duration:** 2-3 hours (with thorough testing)

**Objectives:**

- ✅ Single workflow with strict dependencies
- ✅ Preview First approach (secure)
- ✅ Auto-promotion to production if all tests pass
- ✅ Impossible to deploy if any test fails

**Structure of `complete-ci-cd.yml` workflow:**

```yaml
name: "🚀 Complete CI/CD Pipeline"

jobs:
  # Phase 1: Basic tests (blocking)
  ci-tests:
    name: "🔍 CI Tests (Lint, TypeCheck, Unit Tests, Build)"
    runs-on: ubuntu-latest
    steps: [setup, lint, typecheck, test, build]

  # Phase 2: Preview deployment (depends on ci-tests)
  deploy-preview:
    name: "📦 Deploy Preview"
    needs: ci-tests
    if: success()
    runs-on: ubuntu-latest
    outputs:
      preview-url: ${{ steps.deploy.outputs.url }}
    steps: [setup, deploy-preview-vercel, capture-url]

  # Phase 3: Advanced tests on Preview (depends on deploy-preview)
  accessibility-tests:
    name: "🧪 Accessibility & Performance Tests"
    needs: deploy-preview
    if: success()
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-type: [cypress, pa11y, lighthouse]
    steps: [setup, run-tests-on-preview]

  # Phase 4: Auto-promotion to Production (depends on EVERYTHING)
  promote-production:
    name: "🚀 Promote to Production"
    needs: [ci-tests, deploy-preview, accessibility-tests]
    if: success() && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps: [setup, promote-preview-to-production]
```

**Validation tests:**

1. **CI blocking test:** Create lint error → Verify nothing deploys ❌
2. **Accessibility blocking test:** Create Pa11y error → Verify production not updated ❌
3. **Complete success test:** Clean code → Verify full sequence ✅
4. **Feature branch test:** Verify only preview deploys (no promotion) ✅

### **Phase 2: Progressive and secure migration**

**Estimated duration:** 1 hour

**Objectives:**

- ✅ Migration without breaking existing setup
- ✅ Testing period for new workflow
- ✅ Rollback possible if issues occur

**Migration steps:**

```yaml
Step 2.1: Parallel testing (secure)
├── Create complete-ci-cd.yml
├── Keep old workflows (backup)
├── Test complete-ci-cd.yml on feature branch
├── Validate all scenarios
└── Adjust new workflow if needed

Step 2.2: Temporary deactivation (reversible)
├── Rename ci.yml → ci.yml.backup
├── Rename deploy.yml → deploy.yml.backup
├── Rename accessibility-performance.yml → accessibility-performance.yml.backup
├── Activate complete-ci-cd.yml in production
└── Monitor 2-3 commits for validation

Step 2.3: Validation and cleanup
├── Validate behavior on main
├── Check execution times
├── Optimize if necessary
├── Delete .backup files if everything OK
└── Update documentation
```

### **Phase 3: Optimization and monitoring**

**Estimated duration:** 1 hour

**Objectives:**

- ✅ Performance optimization
- ✅ Metrics monitoring
- ✅ Finalized documentation

**Optimizations:**

```yaml
Performance:
├── Parallel accessibility testing (matrix strategy)
├── Optimized cache for all phases
├── Shared artifacts between jobs
└── Conditional execution based on change type

Monitoring:
├── Execution time metrics
├── Success rate per phase
├── Alerts if thresholds exceeded
└── Deployment tracking dashboard
```

## 🧪 Testing Strategy by Phase

### Phase 1 - Basic Tests

**Test scenarios:**

1. **Lint test fails:**

   ```typescript
   // Add intentional lint error
   const unusedVariable = "test"; // ESLint error
   ```

2. **TypeScript test fails:**

   ```typescript
   // Add intentional type error
   const test: string = 123; // Type error
   ```

3. **Unit test fails:**

   ```typescript
   // Temporarily modify test to fail
   expect(true).toBe(false); // Test failure
   ```

4. **Build test fails:**

   ```typescript
   // Non-existent import
   import { NonExistentComponent } from "./nowhere";
   ```

5. **Complete success test:**
   - Clean code, lint ✅
   - Correct types ✅
   - Tests pass ✅
   - Build successful ✅

### Phase 2 - Deployment Tests

**Test scenarios:**

1. **PR with preview deployment:**

   - Create PR with visible change
   - Verify preview is accessible
   - Test functionality on preview

2. **Merge to production:**
   - Merge PR
   - Verify production deployment
   - Test functionality in prod

## 📋 Implementation Checklist (Target Architecture)

### **Phase 1: Secure unified workflow**

- [ ] **Analyze existing workflows**
  - [ ] Identify functional jobs in ci.yml
  - [ ] Identify functional jobs in accessibility-performance.yml
  - [ ] Identify functional jobs in deploy.yml
  - [ ] Document pnpm scripts used
- [ ] **Create `complete-ci-cd.yml`**
  - [ ] Job `ci-tests` (lint, typecheck, test, build)
  - [ ] Job `deploy-preview` (needs ci-tests, deploy preview)
  - [ ] Job `accessibility-tests` (needs deploy-preview, cypress+pa11y+lighthouse)
  - [ ] Job `promote-production` (needs all, condition main branch)
- [ ] **Test new workflow**
  - [ ] Test on feature branch (preview only)
  - [ ] Test with lint error (should block everything)
  - [ ] Test with Pa11y error (should block promotion)
  - [ ] Complete test on main (automatic promotion)
- [ ] **Performance validation**
  - [ ] Check execution time (< 15 min total)
  - [ ] Check test parallelization
  - [ ] Optimize if necessary

### **Phase 2: Progressive migration**

- [ ] **Secure preparation**
  - [ ] Backup existing workflows (.backup)
  - [ ] Rollback documentation
  - [ ] Migration test plan
- [ ] **Temporary migration**
  - [ ] Disable old workflows (rename)
  - [ ] Activate complete-ci-cd.yml
  - [ ] Monitor 2-3 commits
- [ ] **Validation and cleanup**
  - [ ] Verify PR behavior
  - [ ] Verify main behavior
  - [ ] Verify blocking on error
  - [ ] Delete old files if OK

### **Phase 3: Optimization**

- [ ] **Performance**
  - [ ] Optimize cache between jobs
  - [ ] Parallelize accessibility tests (matrix)
  - [ ] Share artifacts between jobs
- [ ] **Monitoring**
  - [ ] Add execution time metrics
  - [ ] Add critical failure alerts
  - [ ] Tracking dashboard (optional)
- [ ] **Documentation**
  - [ ] Update README with new workflow
  - [ ] Document blocking conditions
  - [ ] Troubleshooting guide

## 🔧 Required Configuration

### GitHub Secrets to configure (Phase 2)

```bash
# To add in GitHub Repository Settings > Secrets
VERCEL_TOKEN=           # Vercel token
VERCEL_ORG_ID=         # Vercel organization ID
VERCEL_PROJECT_ID=     # Vercel project ID
```

### Required package.json scripts (Phase 1)

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

## 📊 Success Metrics

### Execution Time Explanation

#### Understanding Parallel Execution in GitHub Actions

**❓ Why Phase 1 = 4-8 min and Phase 2 = 1-2 min?**

This is because GitHub Actions can execute jobs **in parallel** once certain conditions are met!

**Phase 1 - Basic tests (4-8 minutes SEQUENTIAL):**

```yaml
Sequential execution within same job:
lint (30s) → typecheck (45s) → test (3-5min) → build (1-2min)
Total: 4-8 minutes
```

**Phase 2 - Deployment (1-2 minutes IN PARALLEL):**

```yaml
Once build succeeds:
├── deploy-preview (1-2min) // Executes in parallel
└── other tests can continue // At same time!
```

**Real total time:** ~6-10 minutes MAXIMUM (not 15+ minutes) because everything optimizes in parallel!

#### Workflow Optimization Strategy

```yaml
Concrete execution example:
├── 0:00 → Workflow start
├── 0:30 → Lint completed ✅
├── 1:15 → TypeCheck completed ✅
├── 6:00 → Tests completed ✅
├── 7:30 → Build completed ✅ → 🚀 Deployment starts in parallel
├── 8:00 → Coverage analysis (in parallel with deployment)
├── 9:30 → Deployment completed ✅
└── 10:00 → Complete workflow ✅
```

**Total time: 10 minutes**, not 4+8+1+2=15 minutes!

#### Why 95% workflow success rate?

The 95% rate concerns **Pull Request success** (not individual tests):

- ✅ **95% of PRs pass CI** without manual intervention
- ✅ **5% require corrections** (human errors, environmental issues)
- ✅ **High professional standard** for workflow quality
- ✅ **Encourages excellence** and best practices

**IMPORTANT:** Individual tests must ALWAYS be 100% successful:

```yaml
REQUIRED success rates (100%):
├── ✅ Unit tests (Vitest): 100% - BLOCKS MERGE
├── ✅ Integration tests (Vitest): 100% - BLOCKS MERGE
├── ✅ Accessibility tests (Axe): 100% - BLOCKS MERGE
├── ✅ Accessibility tests (Pa11y): 100% - BLOCKS MERGE
├── ✅ E2E tests (Cypress): 100% - BLOCKS MERGE
├── ⚠️  Lighthouse Performance: > 70% CI / > 85% Prod - WARNING
└── ⚠️  Lighthouse others: > 90% - WARNING
```

### 🎯 CI/CD Philosophy with Accessibility Focus

#### Priorities by order of importance

1. **🔴 CRITICAL - Accessibility** (Blocks merge)

   - Pa11y: WCAG 2.1 AA compliance mandatory
   - Integrated Axe: Accessibility tests in each component
   - Lighthouse accessibility score > 90

2. **🟠 HIGH - Functional** (Blocks merge)

   - Unit and integration tests
   - Successful build
   - TypeScript without errors

3. **🟡 MEDIUM - Quality** (Blocks merge)

   - ESLint without errors
   - Critical E2E tests (Cypress)

4. **🟢 LOW - Performance** (Warning, does not block)
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

- ✅ Optimized build + Vercel CDN
- ✅ Cache and compression enabled
- ✅ Dedicated infrastructure

### Recommended Strategy

```yaml
Lighthouse approach for CI:
├── 🎯 Use in RELATIVE mode (regression detection)
├── ⚠️  Adapted thresholds: Performance > 70% (CI) vs > 85% (Prod)
├── 📊 Compare with previous commit (-10% = alert)
└── 🚨 Focus on accessibility: ALWAYS 100%
```

## 🎯 Next Action (Updated Plan)

**Phase 1 - Step 1:** Create the `.github/workflows/complete-ci-cd.yml` file with the following secure structure:

```yaml
# Structure of unified workflow to create
complete-ci-cd.yml:
├── ci-tests (lint + typecheck + test + build) - BLOCKING
├── deploy-preview (needs: ci-tests) - Deploy preview only
├── accessibility-tests (needs: deploy-preview) - Tests on preview - BLOCKING
└── promote-production (needs: all + main branch) - Auto-promotion if all OK
```

**Advantages of this approach:**

- 🛡️ **Maximum security**: Impossible to deploy to production if any test fails
- 🧪 **Tests on real environment**: Accessibility tests on Vercel Preview
- ⚡ **Optimized performance**: Single setup, jobs with dependencies
- 🔄 **Secure migration**: Keep old workflows as backup

**Are you ready to start creating the secure unified workflow?**

---

### 🚨 Critical Issue Reminder

The current architecture allows production deployments even when accessibility tests fail. The unified workflow definitively solves this security problem.
