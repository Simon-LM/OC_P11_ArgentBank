<!-- @format -->

# Vitest Testing Guide - ArgentBank

## 📋 Overview

This folder contains complete documentation for Vitest tests in the ArgentBank project. Test files remain co-located with their respective components to facilitate maintenance.

## 📁 Documentation structure

```
Vitest/
├── README.md                    # This file - General overview
├── UNIT_TESTS.md               # Unit testing guide
├── INTEGRATION_TESTS.md        # Integration testing guide
├── TEST_ARCHITECTURE.md        # Architecture and conventions
├── CONFIGURATION.md            # Vitest configuration
└── MAINTENANCE.md              # Maintenance guide
```

## 🧪 Test types

### Unit Tests

- **Location**: `*.test.tsx` next to components
- **Purpose**: Test isolated component logic
- **Documentation**: [UNIT_TESTS.md](./UNIT_TESTS.md)

### Integration Tests

- **Location**: `*.integration.test.tsx` next to components
- **Purpose**: Test interaction between components and services
- **Documentation**: [INTEGRATION_TESTS.md](./INTEGRATION_TESTS.md)

## 📊 Current statistics

- **Total test files**: 42 files
- **Unit tests**: ~180 tests
- **Integration tests**: ~64 tests
- **Overall coverage**: ~88%

## 🚀 Main commands

```bash
# Run all tests
pnpm test

# Tests in development mode
pnpm test:dev

# Tests in watch mode
pnpm test:watch

# Type checking
pnpm typecheck
```

## 📍 Test location

### Component tests

```
src/components/
├── ComponentName/
│   ├── ComponentName.tsx
│   ├── ComponentName.test.tsx           # Unit tests
│   └── ComponentName.integration.test.tsx  # Integration tests (if applicable)
```

### Page tests

```
src/pages/
├── PageName/
│   ├── PageName.tsx
│   ├── PageName.test.tsx
│   └── PageName.integration.test.tsx
```

### Utility and store tests

```
src/utils/
├── utilFunction.ts
└── utilFunction.test.ts

src/store/
├── slices/
│   ├── sliceName.ts
│   └── sliceName.test.ts
```

## 🎯 Specialized guides

- **[Test Architecture](./TEST_ARCHITECTURE.md)** - Conventions and structure
- **[Unit Tests](./UNIT_TESTS.md)** - Practical unit testing guide
- **[Integration Tests](./INTEGRATION_TESTS.md)** - Integration testing guide
- **[Configuration](./CONFIGURATION.md)** - Vitest setup and configuration
- **[Maintenance](./MAINTENANCE.md)** - Maintenance best practices

## 🔗 Integration with other testing tools

- **[Lighthouse](../lighthouse/README.md)** - Performance testing
- **[Axe](../Axe/README.md)** - Automated accessibility testing
- **[Pa11y](../Pa11y/README.md)** - Complementary accessibility testing

## 📝 For developers

### Adding a new test

1. Create test file next to the component
2. Follow naming conventions
3. Use documented patterns
4. Verify code coverage

### For AIs

- Consistent and predictable structure
- Extensive documentation with examples
- Documented reusable patterns
- Clear conventions for all test types

---

**Last updated**: May 29, 2025
**Maintainer**: ArgentBank Team
