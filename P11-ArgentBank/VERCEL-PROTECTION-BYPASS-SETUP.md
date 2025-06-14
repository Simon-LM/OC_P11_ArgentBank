<!-- @format -->

# Configuration du Contournement de Protection Vercel

## Problème Identifié

Les deployments Preview de Vercel sont protégés, ce qui empêche les tests automatisés (Cypress, Lighthouse, Pa11y) de s'exécuter en CI/CD. Les erreurs 401 Unauthorized se produisent car le token Vercel standard (`VERCEL_TOKEN`) n'est pas conçu pour contourner la protection des deployments.

## Solution Implémentée

Vercel propose un système spécifique appelé **"Protection Bypass for Automation"** qui génère un secret dédié pour permettre aux outils d'automatisation d'accéder aux deployments protégés.

### Fonctionnement

1. **Header spécial** : `x-vercel-protection-bypass` avec le secret généré
2. **Header optionnel** : `x-vercel-set-bypass-cookie: true` pour définir un cookie d'authentification
3. **Variable d'environnement** : `VERCEL_AUTOMATION_BYPASS_SECRET` disponible automatiquement dans les deployments

## Configuration Requise

### 1. Générer le Secret de Contournement

Dans votre tableau de bord Vercel :

1. Allez dans **Project Settings** → **Deployment Protection**
2. Activez **"Protection Bypass for Automation"**
3. Copiez le secret généré
4. Ajoutez-le comme secret GitHub : `VERCEL_AUTOMATION_BYPASS_SECRET`

### 2. Mise à Jour du Workflow CI/CD

Le workflow a été mis à jour pour utiliser :

```yaml
env:
  VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}

# Dans les requêtes curl
curl -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET"
```

### 3. Configuration Cypress

Le fichier `cypress/support/e2e.ts` a été mis à jour pour intercepter automatiquement toutes les requêtes en CI et ajouter les headers nécessaires :

```typescript
if (isCI && vercelBypassSecret) {
  beforeEach(() => {
    cy.intercept("**", (req) => {
      req.headers["x-vercel-protection-bypass"] = vercelBypassSecret;
      req.headers["x-vercel-set-bypass-cookie"] = "true";
    });
  });
}
```

## Tests Mis à Jour

### Cypress E2E

- ✅ Headers automatiquement ajoutés via l'intercepteur global
- ✅ Variable `VERCEL_AUTOMATION_BYPASS_SECRET` passée depuis le workflow

### Lighthouse

- ✅ Header `x-vercel-protection-bypass` ajouté aux requêtes curl
- ✅ Tests de connectivité avant exécution

### Pa11y

- ✅ Header `x-vercel-protection-bypass` ajouté aux requêtes curl
- ✅ Tests de connectivité avant exécution

## Actions Requises

### Immédiat

1. **Ajouter le secret GitHub** :

   ```bash
   # Dans GitHub → Settings → Secrets and variables → Actions
   VERCEL_AUTOMATION_BYPASS_SECRET=votre_secret_vercel
   ```

2. **Vérifier la protection Vercel** :
   - Le projet doit avoir la protection activée sur les Preview deployments
   - La fonctionnalité "Protection Bypass for Automation" doit être activée

### Test de Validation

1. Créer une PR de test
2. Vérifier que le workflow fonctionne sans erreurs 401
3. Confirmer que tous les tests (Cypress, Lighthouse, Pa11y) s'exécutent correctement

## Avantages de cette Solution

1. **Sécurisé** : Le secret est spécialement conçu pour l'automatisation
2. **Officiel** : Solution recommandée par Vercel
3. **Automatique** : Headers ajoutés automatiquement sans modification des tests
4. **Réversible** : Peut être désactivé facilement si nécessaire

## Références

- [Vercel Protection Bypass for Automation](https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)
- [Vercel Deployment Protection](https://vercel.com/docs/security/deployment-protection)

## Statut

- ✅ Code mis à jour
- ⏳ Secret GitHub à configurer
- ⏳ Tests de validation à effectuer
