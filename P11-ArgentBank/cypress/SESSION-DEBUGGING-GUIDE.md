<!-- @format -->

# Troubleshooting Guide - Cypress Session Issues

## 🚨 Problem: "This session already exists"

### **Cause**

Cypress sessions persist between test files with `cacheAcrossSpecs: true`, causing identifier conflicts.

### **Implemented Solutions**

#### 1. **Unique Session Identifiers**

```typescript
// Before (problematic)
cy.loginWithSession(validUser);

// After (solution)
cy.loginWithSession(validUser, {
  sessionId: "unique-test-identifier",
  cacheAcrossSpecs: false,
});
```

#### 2. **Configuration Options**

- **`sessionId`**: Unique identifier to avoid conflicts
- **`cacheAcrossSpecs`**: `false` by default to avoid conflicts between files

#### 3. **Recommended Pattern per Test File**

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

## 🛠️ **Debugging Commands**

### **Manually Clean Sessions**

```bash
# Use the cleanup script
./scripts/clean-cypress-sessions.sh

# Or manually
rm -rf cypress/.sessions
rm -rf cypress/screenshots
rm -rf cypress/videos
rm -rf cypress/reports
```

### **Check Active Sessions**

```typescript
// In a Cypress test
cy.getAllSessions().then((sessions) => {
  console.log("Active sessions:", sessions);
});
```

### **Force a New Session**

```typescript
// Method 1: Use unique timestamp
const timestamp = Date.now();
cy.loginWithSession(validUser, { sessionId: `test-${timestamp}` });

// Method 2: Clean before creating
cy.clearAllSessions();
cy.loginWithSession(validUser, { sessionId: "fresh-session" });
```

## 🔄 **Session Patterns by Context**

### **Isolated Tests (Recommended)**

```typescript
beforeEach(() => {
  // Each test has its own session
  const testName = Cypress.currentTest.title.replace(/\s+/g, "-");
  cy.loginWithSession(validUser, {
    sessionId: testName,
    cacheAcrossSpecs: false,
  });
});
```

### **Shared Session in a File**

```typescript
let sessionId: string;

before(() => {
  // Generate unique ID for this test file
  sessionId = `${Cypress.spec.name}-${Date.now()}`;
});

beforeEach(() => {
  cy.loginWithSession(validUser, { sessionId, cacheAcrossSpecs: false });
});
```

### **Global Session (Advanced Usage)**

```typescript
// Only if really necessary
cy.loginWithSession(validUser, {
  sessionId: "global-session",
  cacheAcrossSpecs: true,
});
```

## 🐛 **Session Debugging**

### **Add Logs**

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

### **Check Session State**

```javascript
// In Cypress browser console
Cypress.session.getCurrentSessions().then((sessions) => {
  console.table(sessions);
});
```

## 🎯 **Best Practices**

### **✅ To Do**

- Use unique `sessionId` per test context
- Set `cacheAcrossSpecs: false` by default
- Clean sessions between runs when issues occur
- Use descriptive names for `sessionId`

### **❌ To Avoid**

- Reusing the same `sessionId` in multiple files
- Using `cacheAcrossSpecs: true` without justification
- Creating sessions without proper validation
- Ignoring session conflict errors

## 🚀 **Useful Commands**

```bash
# Tests with prior cleanup
./scripts/clean-cypress-sessions.sh && npm run cypress:run

# Test specific file
npx cypress run --spec "cypress/e2e/auth/rate-limiting-test.cy.ts"

# Debug mode with detailed logs
DEBUG=cypress:session npx cypress run
```

## 📊 **Session Monitoring**

To monitor session usage in CI/CD, add to `cypress.config.ts`:

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

This approach ensures that each test file uses its own sessions without conflicts.
