<!-- @format -->

# Guide de Résolution - Problèmes de Session Cypress

## 🚨 Problème : "This session already exists"

### **Cause**

Les sessions Cypress persistent entre les fichiers de test avec `cacheAcrossSpecs: true`, causant des conflits d'identifiants.

### **Solutions Implémentées**

#### 1. **Identifiants de Session Uniques**

```typescript
// Avant (problématique)
cy.loginWithSession(validUser);

// Après (solution)
cy.loginWithSession(validUser, {
  sessionId: "unique-test-identifier",
  cacheAcrossSpecs: false,
});
```

#### 2. **Options de Configuration**

- **`sessionId`** : Identifiant unique pour éviter les conflits
- **`cacheAcrossSpecs`** : `false` par défaut pour éviter les conflits entre fichiers

#### 3. **Pattern Recommandé par Fichier de Test**

```typescript
// cross-browser.cy.ts
cy.loginWithSession(validUser, {
  sessionId: "cross-browser",
  cacheAcrossSpecs: false,
});

// rate-limiting-test.cy.ts
cy.loginWithSession(validUser, {
  sessionId: "rate-limiting-test",
  cacheAcrossSpecs: false,
});

// profile.cy.ts
cy.loginWithSession(validUser, {
  sessionId: "profile",
  cacheAcrossSpecs: false,
});
```

## 🛠️ **Commandes de Débogage**

### **Nettoyer les Sessions Manuellement**

```bash
# Utiliser le script de nettoyage
./scripts/clean-cypress-sessions.sh

# Ou manuellement
rm -rf cypress/.sessions
rm -rf cypress/screenshots
rm -rf cypress/videos
rm -rf cypress/reports
```

### **Vérifier les Sessions Actives**

```typescript
// Dans un test Cypress
cy.getAllSessions().then((sessions) => {
  console.log("Sessions actives:", sessions);
});
```

### **Forcer une Nouvelle Session**

```typescript
// Méthode 1: Utiliser un timestamp unique
const timestamp = Date.now();
cy.loginWithSession(validUser, { sessionId: `test-${timestamp}` });

// Méthode 2: Nettoyer avant de créer
cy.clearAllSessions();
cy.loginWithSession(validUser, { sessionId: "fresh-session" });
```

## 🔄 **Patterns de Session par Contexte**

### **Tests Isolés (Recommandé)**

```typescript
beforeEach(() => {
  // Chaque test a sa propre session
  const testName = Cypress.currentTest.title.replace(/\s+/g, "-");
  cy.loginWithSession(validUser, {
    sessionId: testName,
    cacheAcrossSpecs: false,
  });
});
```

### **Session Partagée dans un Fichier**

```typescript
let sessionId: string;

before(() => {
  // Générer un ID unique pour ce fichier de test
  sessionId = `${Cypress.spec.name}-${Date.now()}`;
});

beforeEach(() => {
  cy.loginWithSession(validUser, { sessionId, cacheAcrossSpecs: false });
});
```

### **Session Globale (Usage Avancé)**

```typescript
// Seulement si vraiment nécessaire
cy.loginWithSession(validUser, {
  sessionId: "global-session",
  cacheAcrossSpecs: true,
});
```

## 🐛 **Debugging des Sessions**

### **Ajouter des Logs**

```typescript
Cypress.Commands.add("loginWithSession", (user: User, options = {}) => {
  const sessionKey = `user-${user.email}-${options.sessionId || "default"}`;

  console.log(`🔐 Creating session: ${sessionKey}`);
  console.log(`📋 Options:`, options);

  cy.session(
    sessionKey,
    () => {
      console.log(`⚡ Executing login for session: ${sessionKey}`);
      // ... rest of implementation
    },
    {
      validate: () => {
        console.log(`✅ Validating session: ${sessionKey}`);
        // ... validation logic
      },
    },
  );
});
```

### **Vérifier l'État des Sessions**

```javascript
// Dans la console du navigateur Cypress
Cypress.session.getCurrentSessions().then((sessions) => {
  console.table(sessions);
});
```

## 🎯 **Meilleures Pratiques**

### **✅ À Faire**

- Utiliser des `sessionId` uniques par contexte de test
- Définir `cacheAcrossSpecs: false` par défaut
- Nettoyer les sessions entre les runs en cas de problème
- Utiliser des noms descriptifs pour les `sessionId`

### **❌ À Éviter**

- Réutiliser le même `sessionId` dans plusieurs fichiers
- Utiliser `cacheAcrossSpecs: true` sans justification
- Créer des sessions sans validation appropriée
- Ignorer les erreurs de conflit de session

## 🚀 **Commands Utiles**

```bash
# Tests avec nettoyage préalable
./scripts/clean-cypress-sessions.sh && npm run cypress:run

# Test d'un fichier spécifique
npx cypress run --spec "cypress/e2e/auth/rate-limiting-test.cy.ts"

# Mode debug avec logs détaillés
DEBUG=cypress:session npx cypress run
```

## 📊 **Monitoring des Sessions**

Pour surveiller l'utilisation des sessions en CI/CD, ajouter dans `cypress.config.ts` :

```typescript
setupNodeEvents(on, config) {
  on('before:spec', (spec) => {
    console.log(`🎬 Starting spec: ${spec.name}`);
  });

  on('after:spec', (spec, results) => {
    console.log(`🏁 Finished spec: ${spec.name}`);
    console.log(`📊 Tests: ${results.stats.tests}, Failures: ${results.stats.failures}`);
  });
}
```

Cette approche garantit que chaque fichier de test utilise ses propres sessions sans conflits.
