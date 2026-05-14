<!-- @format -->

# Axe - Integrated Accessibility Tests

## 📋 Overview

Axe-core is an accessibility testing engine integrated directly into the
existing tests of the ArgentBank application. This modern approach allows
testing accessibility at the same time as functionality.

## 🚀 Integrated Approach

✅ **Unified tests** - Accessibility integrated into each component test
✅ **Simplified maintenance** - No test duplication
✅ **Automatic coverage** - All tested components include accessibility
✅ **Optimized CI/CD** - Single test pipeline
✅ **Developer Experience** - Accessibility tests during development

## 🏗️ Architecture

### Main structure

- **Axe/config/** - WCAG rules configuration
- **Axe/utils/** - Global setup for all tests
- **Axe/reports/** - Generated reports
- **src/\*\*/\*.test.tsx** - Tests integrated into components

### Affected files

| Component    | Test file                                         | Status        |
| ------------ | ------------------------------------------------- | ------------- |
| EditUserForm | src/components/EditUserForm/EditUserForm.test.tsx | ✅ Integrated |
| Features     | src/components/Features/Features.test.tsx         | ✅ Integrated |
| Home         | `src/pages/home/Home.test.tsx`                    | ✅ Integrated |
| SignIn       | `src/pages/signIn/SignIn.test.tsx`                | ✅ Integrated |
| Header       | `src/layouts/header/Header.test.tsx`              | ✅ Integrated |
| Footer       | `src/layouts/footer/Footer.test.tsx`              | ✅ Integrated |

## 📦 Dependencies

### Installed packages

**Installation:** `pnpm add -D @axe-core/react axe-core jest-axe`

- **@axe-core/react** - React integration for Axe
- **axe-core** - Main accessibility analysis engine
- **jest-axe** - Jest/Vitest matchers for tests

## ⚙️ Configuration

### Axe Configuration

**File:** `Axe/config/axe.config.js`

**Configured WCAG rules:**

- Color contrast (color-contrast)
- Keyboard navigation (keyboard)
- Focus management (focus-management)

**Tested standards:** WCAG 2.1 A, AA, AAA

### Centralized setup

**File:** `Axe/utils/axe-setup.js`

This file contains the global configuration for all accessibility tests.

## 🧪 Usage

### Main commands

- **All tests:** `pnpm run test`
- **Watch mode:** `pnpm run test:watch`
- **Development mode:** `pnpm run test:dev`

### Import in tests

**Standard pattern for each test file:**

1. Import jest-axe: `import { axe } from "jest-axe";`
2. Import setup: `import "../../../Axe/utils/axe-setup.js";`
3. Add accessibility test

### Test example

**Typical accessibility test:**

The test verifies that there are no accessibility violations in the rendered component.
The axe function analyzes the DOM and returns a WCAG compliance report.

## 📊 Standards and Compliance

### Tested WCAG levels

- **WCAG 2.1 A** - Basic level
- **WCAG 2.1 AA** - Standard level (required)
- **WCAG 2.1 AAA** - Advanced level (optional)

### Main verified rules

1. **Color contrast** - Minimum ratio 4.5:1
2. **Keyboard navigation** - All elements accessible
3. **Form labels** - Appropriate labels
4. **Semantic structure** - Headings and landmarks
5. **Alternative text** - Images and media

## 🔍 Axe vs Pa11y Comparison

| Aspect                  | Axe CLI (Unit tests)       | Pa11y (Browser tests)         |
| ----------------------- | -------------------------- | ----------------------------- |
| **Type**                | JSDOM unit tests           | Static browser tests          |
| **Visual rendering**    | ❌ JSDOM - no computed CSS | ✅ Browser - complete CSS     |
| **Color contrast**      | ❌ **CANNOT detect**       | ✅ **Detects correctly**      |
| **DOM structure**       | ✅ Excellent               | ✅ Excellent                  |
| **Keyboard navigation** | ⚠️ Limited (simulation)    | ⚠️ Static state only          |
| **Integration**         | In code                    | External scripts              |
| **Speed**               | ⚡ Very fast               | 🐌 Slower                     |
| **Coverage**            | Isolated components        | Complete pages (static state) |
| **CI/CD**               | ✅ Native                  | ✅ Via scripts                |

### ⚠️ Critical Axe CLI limitation

**Axe CLI CANNOT detect contrast violations** because:

- It runs in JSDOM (DOM simulation)
- CSS styles are not computed/visually rendered
- No access to final colors displayed on screen

**Pa11y detects contrasts** because:

- It uses Puppeteer with a real browser (Chromium)
- Styles are completely computed and rendered
- Analysis of actually displayed colors

## 💡 Best Practices

### Recommended architecture

1. **Centralization** - All Axe code in `Axe/` folder
2. **Unique setup** - Single `Axe/utils/axe-setup.js` file
3. **Shared configuration** - Common rules in `Axe/config/`
4. **Integrated tests** - Add to existing tests, no duplicates
5. **Relative imports** - Paths from `src/` to `Axe/`

### Development rules

✅ **Mandatory import** - Always import `axe-setup.js` in each test
✅ **Minimum test** - One accessibility test per React component
✅ **Centralized configuration** - Use `Axe/config/` rather than inline
✅ **Fix violations** - Correct before merge
✅ **Document exceptions** - Justify if necessary

### Benefits of integrated approach

| Aspect              | Before (duplicates) | After (integrated)     |
| ------------------- | ------------------- | ---------------------- |
| **Maintenance**     | 🔴 2x more files    | ✅ Unified files       |
| **Synchronization** | 🔴 Risk of drift    | ✅ Always synchronized |
| **Coverage**        | 🔴 Partial          | ✅ 100% automatic      |
| **Performance**     | 🔴 Separate tests   | ✅ Grouped tests       |

## 🎯 Goals and Metrics

### Accessibility KPIs

- **0 critical violations** - "critical" impact
- **< 5 serious violations** - "serious" impact
- **100% component coverage** - All components tested
- **Execution time < 30s** - Test performance

## 🐛 Troubleshooting

### Common issues

**Slow tests:**

- Solution: Test isolated components
- Avoid full page tests

**False positives:**

- Solution: Custom rule configuration
- Exclude specific rules if justified

**Vitest integration:**

- Solution: jest-axe matchers correctly configured
- Verify centralized setup import

## 🎯 Usage recommendations

### For color contrast tests

- **Use Pa11y** for contrast violations (browser tests)
- **Use Axe browser extension** for complete manual analysis
- **Axe CLI** will be silent on contrasts ⚠️

### For other accessibility violations

- **Axe CLI** is perfect for DOM structure, labels, roles, etc.
- Fast tests integrated into development workflow

### Recommended strategy

```bash
# Unit accessibility tests (DOM structure)
npm test

# Browser accessibility tests (contrast + complete rendering)
npm run pa11y
```

## 📊 Correct classification of test types

### 🏗️ **Accessibility test architecture**

```text
Accessibility Tests
├── 🧪 Unit Tests (Axe CLI)
│   ├── DOM/ARIA structure
│   ├── Specific rules
│   └── React component states
│
├── 🌐 Browser Tests (Pa11y)
│   ├── Complete CSS rendering
│   ├── Color contrast
│   └── Complete static pages
│
├── 🔄 E2E + Accessibility Tests (Cypress + Axe)
│   ├── Complete user journeys
│   ├── Dynamic interactions
│   ├── States after user actions
│   ├── Complete CSS rendering + interactions
│   └── Accessible business flows
│
└── 🧪 Unit Tests (Axe CLI)
```

### 🎯 **Pa11y = Static browser tests**

Pa11y is **not E2E** but **"Browser Testing"**:

- ✅ **Real browser** (Puppeteer/Chromium)
- ✅ **Computed CSS** and complete rendering
- ❌ **No user interactions**
- ❌ **No navigation** between pages
- ❌ **No business scenarios**

## 🎯 Violations that Axe CLI detects BETTER than Pa11y

### 🔍 Specific advantages of Axe CLI

| Type of violation            | Axe CLI          | Pa11y              | Why Axe CLI is better                |
| ---------------------------- | ---------------- | ------------------ | ------------------------------------ |
| **Specific rule tests**      | ✅ **Excellent** | ⚠️ Limited         | Fine configuration per rule          |
| **Isolated component tests** | ✅ **Perfect**   | ❌ Full pages only | Precise unit tests                   |
| **Advanced ARIA analyses**   | ✅ **Excellent** | ⚠️ Basic           | More sophisticated native Axe engine |
| **Dynamic state tests**      | ✅ **Perfect**   | ⚠️ Difficult       | React state control                  |
| **Complex form tests**       | ✅ **Excellent** | ⚠️ Basic           | Fine attribute analysis              |
| **Custom rules**             | ✅ **Excellent** | ❌ Impossible      | JavaScript configuration             |

## 🚀 Axe + Cypress: The Ultimate Combination

### 🎯 **Why add Axe to Cypress?**

**Cypress + Axe** combines the **best of both worlds**:

| Aspect                     | Cypress alone  | Cypress + Axe              | Advantage                        |
| -------------------------- | -------------- | -------------------------- | -------------------------------- |
| **Real interactions**      | ✅ Perfect     | ✅ **Perfect**             | Navigation, clicks, forms        |
| **Complete CSS rendering** | ✅ Perfect     | ✅ **Perfect**             | Contrast, layout, responsive     |
| **Dynamic states**         | ⚠️ Basic       | ✅ **Axe analyzes state**  | Accessibility after interactions |
| **Advanced ARIA tests**    | ❌ Manual      | ✅ **Automatic Axe**       | Sophisticated WCAG rules         |
| **Specific violations**    | ❌ Manual      | ✅ **Complete Axe engine** | Fine rule configuration          |
| **Detailed reports**       | ⚠️ Screenshots | ✅ **Axe reports + logs**  | Precise violation diagnosis      |

### 🧪 **UNIQUE violations detected by Cypress + Axe**

#### 1. **Post-interaction accessibility**

- Test accessibility AFTER each user interaction
- Verification of dynamic component states
- Focus management validation after actions

#### 2. **Accessible dynamic navigation**

- Complete user journey with checks at each step
- Test of intermediate form states
- Page-by-page accessibility validation

#### 3. **Accessible error states**

- Test error messages and their accessibility
- Focus verification on error fields
- Screen reader announcement validation

#### 4. **Conditional components**

- Test elements that appear/disappear dynamically
- Accessible dropdowns, modals, tooltips
- Complex interaction validation

### 🎯 **Installing Cypress + Axe**

**Required dependencies:**

- `cypress` - E2E testing framework
- `cypress-axe` - Axe integration plugin for Cypress

**Configuration:**

- Configuration file: `cypress/support/commands.js`
- Import cypress-axe plugin
- Custom commands for accessibility rules

### 📊 **Recommended comprehensive testing strategy**

| Test type             | Tool           | Frequency   | Coverage                     |
| --------------------- | -------------- | ----------- | ---------------------------- |
| **Daily development** | Axe CLI (Jest) | Each push   | Isolated components          |
| **Color contrast**    | Pa11y          | Nightly     | Complete static pages        |
| **User journeys**     | Cypress + Axe  | Pre-release | Interactions + accessibility |
| **Complete audit**    | Axe Extension  | Monthly     | Expert manual analysis       |

### 🚀 **Concrete example for ArgentBank**

**E2E + Accessibility login test:**

**Automated test steps:**

1. **Initial page** - Login page accessibility verification
2. **Username input** - Intermediate form state test
3. **Password input** - Completed field validation
4. **Submission** - Interaction and navigation test
5. **Dashboard page** - Accessibility after login
6. **User menu** - Dynamic element testing

**Error handling test:**

- Login with empty fields
- Accessible error message validation
- Correct focus management verification

### 🎯 **Violations detected ONLY by Cypress + Axe**

1. **Dynamic focus management** - Where does focus go after an action?
2. **ARIA live regions** - Do dynamic announcements work?
3. **Sequential navigation** - Tab order after interactions
4. **Dynamic ARIA states** - `aria-expanded`, `aria-selected` after click
5. **Contextual contrast** - State colors (hover, focus, error)
6. **Dynamic landmarks** - Navigation between sections after actions

### ✨ **Summary: Triple accessibility coverage**

```text
🏗️ Complete accessibility architecture

1. 🧪 Axe CLI (Unit tests)
   └── Daily development, isolated components

2. 🌐 Pa11y (Static browser tests)
   └── Color contrast, complete CSS rendering

3. 🚀 Cypress + Axe (E2E + accessibility tests)
   └── User journeys, real interactions, dynamic states
```

**This triple approach ensures perfect accessibility at all levels!**

### 🧪 Concrete examples - Axe CLI detects

#### 1. **Sophisticated ARIA violations**

**Advanced rules detected by Axe CLI:**

- `aria-command-name` - ARIA command names
- `aria-input-field-name` - Input field names
- `aria-required-children` - Required ARIA children
- `aria-valid-attr-value` - Valid ARIA attribute values
- `form-field-multiple-labels` - Multiple labels on forms

#### 2. **Complex form structure**

- Missing labels on hidden fields
- Incorrect `aria-describedby` attributes
- Broken `aria-labelledby` relationships
- `aria-invalid` state validation

#### 3. **Dynamic state tests**

**Accessibility testing before/after interaction:**

- User interaction simulation (click, input)
- Component state analysis after changes
- Accessibility validation in all states

#### 4. **Semantic structure violations**

- Heading order (h1 → h3 without h2)
- Missing or misplaced landmarks
- Incorrect list structure

#### 5. **Business-specific rule tests**

**Custom configuration for your application:**

- `region: enabled` - Required landmarks
- `skip-link: enabled` - Required skip links
- `landmark-unique: enabled` - Unique landmarks

#### 6. **React component validation**

- Missing accessibility props
- Incorrect ARIA states in hooks
- Broken accessibility context

### ⚡ Performance and precision

**Axe CLI** is **faster and more precise** for:

- Accessibility regression tests
- Continuous validation in development
- Early detection of structural violations
- Component integration tests

**Pa11y** remains better for:

- Color contrast (visual rendering)
- Complete end-user tests
- Full page validation

---

**✨ Axe is installed and ready for automated accessibility testing!**

_Last updated: May 28, 2025_
_Version: 1.0.0_
_Status: ✅ Installed and configured_
