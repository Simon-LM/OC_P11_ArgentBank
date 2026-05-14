<!-- @format -->

# Accessibility Testing Guide with Cypress-Axe

This guide explains how to implement and maintain automated accessibility tests with `cypress-axe` in the ArgentBank project.

## 📋 Overview

Automated accessibility tests allow detecting WCAG 2.1 standard violations directly in E2E tests, ensuring the application remains accessible to all users.

## 🎯 Accessibility testing objectives

- ✅ Verify WCAG 2.1 AA compliance
- ✅ Detect accessibility issues automatically
- ✅ Integrate accessibility into the development process
- ✅ Prevent accessibility regressions
- ✅ Generate detailed reports on violations

## 🛠️ Configuration

### Dependencies installation

```bash
pnpm add -D cypress-axe axe-core
```

### Configuration in cypress/support/e2e.ts

```typescript
import "cypress-axe";
```

### Cypress configuration (cypress.config.ts)

```typescript
export default defineConfig({
  e2e: {
    // Reporter configuration for accessibility tests
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/reports",
      overwrite: false,
      html: true,
      json: true,
      timestamp: "mmddyyyy_HHMMss",
    },
    // ...other configurations
  },
});
```

## 📁 Accessibility test structure

### Integration into existing tests

Accessibility tests are integrated directly into each E2E test file:

```text
cypress/
└── e2e/
    ├── auth/
    │   ├── login.cy.ts          # Login tests + accessibility
    │   └── logout.cy.ts         # Logout tests + accessibility
    ├── accounts/
    │   └── accounts.cy.ts       # Account tests + accessibility
    ├── profile/
    │   └── profile.cy.ts        # Profile tests + accessibility
    └── transactions/
        └── transactions/            # Transaction tests + accessibility
            ├── transactions-display.cy.ts      # Display tests
            └── transactions-functionality.cy.ts # Functionality tests
```

## 🔧 Using cypress-axe

### Basic pattern

```typescript
it("should be accessible", () => {
  // Inject axe-core
  cy.injectAxe();

  // Test accessibility with custom configuration
  cy.checkA11y(undefined, {
    rules: {
      // Ignore known contrast violations
      "color-contrast": { enabled: false },
    },
  });
});
```

### Advanced pattern with focus

```typescript
it("should be accessible with keyboard navigation", () => {
  cy.injectAxe();

  // Initial accessibility test
  cy.checkA11y(undefined, {
    rules: {
      "color-contrast": { enabled: false },
    },
  });

  // Test accessibility with focus on an element
  cy.get('button[class*="account"]').first().focus();
  cy.checkA11y(undefined, {
    rules: {
      "color-contrast": { enabled: false },
    },
  });
});
```

## 📝 Configured accessibility rules

### Disabled rules and why

1. **color-contrast**: Temporarily disabled
   - Reason: Known contrast violations in current design
   - Action: To be addressed in a dedicated design iteration

### Default enabled rules

- **keyboard**: Keyboard navigation
- **focus**: Focus management
- **aria**: ARIA attributes
- **forms**: Form labeling
- **headings**: Heading structure
- **images**: Alternative text
- **links**: Link accessibility

## 🚀 Configured NPM scripts

### Specific accessibility tests

```bash
# Run all tests with accessibility focus
pnpm run test:e2e:a11y

# Run tests with consolidated report
pnpm run test:e2e:a11y:report

# Clean old reports
pnpm run test:e2e:clean
```

### Scripts in package.json

```json
{
  "scripts": {
    "test:e2e:a11y": "cypress run --spec 'cypress/e2e/**/*.cy.ts'",
    "test:e2e:a11y:report": "cypress run --spec 'cypress/e2e/**/*.cy.ts' && pnpm run test:e2e:merge-reports",
    "test:e2e:merge-reports": "mochawesome-merge cypress/reports/mochawesome_*.json > cypress/reports/merged-report.json && marge cypress/reports/merged-report.json --reportDir cypress/reports/html",
    "test:e2e:clean": "bash cypress/clean-reports.sh"
  }
}
```

## 📊 Accessibility reports

### Report generation

Reports are automatically generated in `cypress/reports/`:

- **Individual reports**: `mochawesome_*.json` and `mochawesome_*.html`
- **Consolidated report**: `merged-report.json` and `html/merged-report.html`

### Result interpretation

- ✅ **Green**: No violations detected
- ❌ **Red**: Accessibility violations found
- ⚠️ **Orange**: Warnings to examine

### Violation example

```
Rule ID: aria-label-missing
Impact: Critical
Description: Ensure every form element has a label
Nodes: 2
```

## 🔍 Tests by page/functionality

### Login page (`login.cy.ts`)

```typescript
// Integrated accessibility tests
it("should allow a user to log in", function () {
  cy.injectAxe();
  cy.checkA11y(undefined, {
    rules: { "color-contrast": { enabled: false } },
  });

  // ...login test logic

  // Test after login
  cy.checkA11y(undefined, {
    rules: { "color-contrast": { enabled: false } },
  });
});

it("should be accessible on the login page", () => {
  cy.injectAxe();
  cy.checkA11y(undefined, {
    rules: { "color-contrast": { enabled: false } },
  });

  // Focus tests
  cy.get("input#email").focus();
  cy.checkA11y();

  cy.get("input#password").focus();
  cy.checkA11y();
});
```

### Accounts page (`accounts.cy.ts`)

```typescript
it("should be accessible on the accounts page", () => {
  cy.injectAxe();
  cy.checkA11y(undefined, {
    rules: { "color-contrast": { enabled: false } },
  });

  // Account button accessibility test
  cy.get('button[class*="account"]').first().focus();
  cy.checkA11y();

  // Test after account selection
  cy.get('button[class*="account"]').first().click();
  cy.checkA11y();
});
```

### Transactions page (`transactions-display.cy.ts` and `transactions-functionality.cy.ts`)

```typescript
it("should be accessible on the transactions page", () => {
  cy.injectAxe();
  cy.checkA11y(undefined, {
    rules: { "color-contrast": { enabled: false } },
  });

  // Transaction table test
  cy.get('table[class*="transaction-table"]').should("be.visible");
  cy.checkA11y();

  // Conditional pagination test (avoid disabled buttons)
  cy.get('button[class*="pagination"]').then(($buttons) => {
    const enabledButtons = $buttons.filter(":not(:disabled)");
    if (enabledButtons.length > 0) {
      cy.wrap(enabledButtons.first()).focus();
      cy.checkA11y();
    }
  });
});
```

## ⚠️ Important considerations

### Axe-core injection

- **Always inject** `cy.injectAxe()` at the beginning of each accessibility test
- **Do not inject** in `beforeEach` as it interferes with the login process
- **Inject individually** in each test that needs it

### Managing conditional elements

```typescript
// ✅ Good: Conditional verification
cy.get('button[class*="pagination"]').then(($buttons) => {
  const enabledButtons = $buttons.filter(":not(:disabled)");
  if (enabledButtons.length > 0) {
    cy.wrap(enabledButtons.first()).focus();
    cy.checkA11y();
  }
});

// ❌ Bad: Attempting to focus on a disabled element
cy.get('button[class*="pagination"]').first().focus(); // May fail
```

### Rule configuration

```typescript
// Recommended configuration to ignore known violations
const a11yConfig = {
  rules: {
    "color-contrast": { enabled: false }, // Temporarily disabled
    // Add other rules as needed
  },
};

cy.checkA11y(undefined, a11yConfig);
```

## 🚀 Maintenance and evolution

### Adding new accessibility tests

1. **Create the basic test** with functional verifications
2. **Add axe injection**: `cy.injectAxe()`
3. **Add verifications**: `cy.checkA11y()`
4. **Test interactions**: focus, keyboard navigation, etc.
5. **Configure rules** according to specific needs

### Violation tracking

1. **Run regularly** accessibility tests
2. **Analyze reports** to identify new violations
3. **Prioritize fixes** according to impact
4. **Re-enable rules** once violations are fixed

### CI/CD integration

```yaml
# Example for GitHub Actions
- name: Run accessibility tests
  run: |
    pnpm run test:e2e:a11y:report

- name: Upload accessibility reports
  uses: actions/upload-artifact@v3
  with:
    name: accessibility-reports
    path: cypress/reports/html/
```

## 📚 Resources

- [Cypress-Axe Documentation](https://github.com/component-driven/cypress-axe)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe-Core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Cypress Best Practices](./BEST_PRACTICES.md)

## 🎯 Next steps

1. **Fix contrast violations** identified
2. **Add accessibility tests** for new features
3. **Automate execution** in CI/CD pipeline
4. **Train the team** on accessibility best practices

---

> **Note**: This guide is part of the complete Cypress testing documentation. Also see [E2E_TESTS.md](./E2E_TESTS.md) and [BEST_PRACTICES.md](./BEST_PRACTICES.md) for a complete overview.
