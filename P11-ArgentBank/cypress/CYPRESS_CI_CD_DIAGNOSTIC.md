<!-- @format -->

# Diagnostic des échecs Cypress en CI/CD

## 🎯 Résumé exécutif

**PROBLÈME** : Tests Cypress fonctionnent en local mais échouent systématiquement en CI/CD  
**CAUSE RACINE** : Cypress ne peut pas accéder aux URLs Vercel Preview protégées car il manque les headers de bypass  
**SOLUTION** : Configurer Cypress pour utiliser les headers `x-vercel-protection-bypass` comme Pa11y

## 📋 Preuve de l'analyse

### Logs d'erreur CI/CD analysés

```
Tests:        3
Passing:      0  ← TOUS LES TESTS ÉCHOUENT
Failing:      1
Pending:      0
Skipped:      2
```

### Comparaison des outils de test

| Outil          | Local | CI/CD | Headers Vercel | Status       |
| -------------- | ----- | ----- | -------------- | ------------ |
| **Lighthouse** | ✅    | ✅    | ✅ Configurés  | Fonctionne   |
| **Pa11y**      | ✅    | ✅    | ✅ Configurés  | Fonctionne   |
| **Cypress**    | ✅    | ❌    | ❌ Manquants   | **PROBLÈME** |

## Problème identifié

Les tests Cypress **fonctionnent en local** mais **échouent en CI/CD**. Après analyse comparative avec Pa11y (qui fonctionne en CI/CD), la cause racine a été identifiée.

## Cause racine : Headers de bypass Vercel manquants

### Contexte

- En CI/CD, l'application est déployée sur Vercel Preview avec protection d'accès
- Pa11y fonctionne car il configure explicitement les headers de bypass Vercel
- Cypress échoue car il n'a pas accès à ces headers

### Comparaison Pa11y vs Cypress

#### ✅ Pa11y (FONCTIONNE en CI/CD)

```javascript
// Pa11y configure explicitement les headers de bypass
await page.setExtraHTTPHeaders({
  "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
});
```

#### ❌ Cypress (ÉCHOUE en CI/CD)

```typescript
// Cypress n'a pas de configuration pour les headers de bypass Vercel
// Il essaie d'accéder directement à CYPRESS_BASE_URL sans authentification
cy.visit("/signin"); // Échoue car pas d'accès au Preview protégé
```

## Détails techniques

### Environnement de test

- **Local** : `http://localhost:3000` (pas de protection) → ✅ Fonctionne
- **CI/CD** : `https://[preview-url].vercel.app` (protégé) → ❌ Échoue

### Configuration actuelle CI/CD

```yaml
- name: 🏃 Run Cypress E2E tests
  env:
    CYPRESS_BASE_URL: ${{ needs.deploy-preview.outputs.preview-url }}
    VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}
  run: |
    pnpm exec cypress run --config baseUrl=$CYPRESS_BASE_URL
```

### Problème

- La variable `VERCEL_AUTOMATION_BYPASS_SECRET` est disponible mais **Cypress ne l'utilise pas**
- Cypress ne peut pas accéder aux pages protégées du Preview

## Solutions possibles

### Option 1 : Configuration Cypress avec headers personnalisés

Implémenter un plugin Cypress pour injecter les headers de bypass automatiquement.

### Option 2 : Command Cypress personnalisée

Créer une commande `cy.visitWithBypass()` qui configure les headers.

### Option 3 : Intercepteur de requêtes

Utiliser `cy.intercept()` pour ajouter les headers à toutes les requêtes.

### Option 4 : Configuration globale dans support/e2e.ts

Configurer les headers au niveau global pour tous les tests.

## Recommandation

**Option 4** semble la plus appropriée car elle :

- Configure automatiquement tous les tests
- Maintient la compatibilité local/CI
- Ne nécessite pas de changement dans les tests existants

## Prochaines étapes

1. ⏳ **Implémentation de la solution** (après validation de l'analyse)
2. ⏳ Test en local avec simulation des conditions CI
3. ⏳ Validation en CI/CD

## Validation de l'analyse

### Environnement local ✅

- Serveur : `vercel dev` sur `http://localhost:3000`
- Cypress version : 14.4.0
- Tests : ✅ Passent (pas de protection d'accès)

### Environnement CI/CD ❌

- Serveur : Preview Vercel protégé
- URL : `https://[preview-url].vercel.app`
- Protection : Headers `x-vercel-protection-bypass` requis
- Tests : ❌ Échouent (pas d'accès autorisé)

Date : 22 juin 2025 - 16:25
