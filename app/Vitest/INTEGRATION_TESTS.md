<!-- @format -->

# Integration Testing Guide - Vitest

## 🎯 Objective

Integration tests verify the interaction between multiple components, services or modules. They test complete workflows and communication between different parts of the application.

## 📂 Location

Integration tests are named `*.integration.test.tsx` and placed next to the main component:

```
src/pages/User/
├── User.tsx
├── User.test.tsx                    # Unit tests
├── User.integration.test.tsx        # ← Integration tests here
└── user.module.scss
```

## 🧪 Integration test types

### 1. Complete user flow tests

#### Example: Authentication process

```typescript
// SignIn.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SignIn from './SignIn';
import { store } from '../../store/Store';

describe('SignIn Integration', () => {
  const renderSignInWithProviders = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </Provider>
    );
  };

  it('completes full authentication flow', async () => {
    renderSignInWithProviders();

    // Step 1: Fill the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    // Step 2: Submit
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Step 3: Verify the result
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });
});
```

### 2. Redux + Component interaction tests

#### Example: State management with actions

```typescript
// User.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi } from 'vitest';
import User from './User';
import usersSlice from '../../store/slices/usersSlice';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      users: usersSlice,
    },
    preloadedState: {
      users: {
        isAuthenticated: true,
        currentUser: { firstName: 'John', lastName: 'Doe' },
        ...initialState,
      },
    },
  });
};

describe('User Page Integration', () => {
  it('handles account selection and transaction filtering', async () => {
    const testStore = createTestStore({
      accounts: [
        { id: '1', type: 'Checking', balance: 1000 },
        { id: '2', type: 'Savings', balance: 2000 },
      ],
    });

    render(
      <Provider store={testStore}>
        <User />
      </Provider>
    );

    // Select an account
    fireEvent.click(screen.getByText(/checking/i));

    // Verify that transactions are filtered
    await waitFor(() => {
      expect(screen.getByText(/transactions for checking/i)).toBeInTheDocument();
    });
  });
});
```

### 3. API tests with mocking

#### Example: Interaction with external services

```typescript
// TransactionSearch.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TransactionSearch from './TransactionSearch';
import * as transactionService from '../../services/transactionService';

// Service mock
vi.mock('../../services/transactionService');
const mockedTransactionService = vi.mocked(transactionService);

describe('TransactionSearch Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches and displays results', async () => {
    // Setup mock response
    mockedTransactionService.searchTransactions.mockResolvedValue({
      results: [
        { id: '1', description: 'Coffee Shop', amount: -5.50 },
        { id: '2', description: 'Salary', amount: 2500.00 },
      ],
      pagination: { total: 2, page: 1 },
    });

    render(<TransactionSearch />);

    // Perform a search
    fireEvent.change(screen.getByLabelText(/search/i), {
      target: { value: 'coffee' }
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    // Verify results
    await waitFor(() => {
      expect(screen.getByText('Coffee Shop')).toBeInTheDocument();
      expect(mockedTransactionService.searchTransactions).toHaveBeenCalledWith({
        searchTerm: 'coffee',
      });
    });
  });
});
```

## 📋 Patterns and conventions

### Integration test structure

```typescript
describe('ComponentName Integration', () => {
  // Setup helpers
  const renderWithProviders = (props = {}) => {
    return render(
      <Provider store={testStore}>
        <MemoryRouter>
          <ComponentName {...defaultProps} {...props} />
        </MemoryRouter>
      </Provider>
    );
  };

  // Complete workflow tests
  describe('Complete User Workflows', () => {
    it('completes end-to-end user action', async () => {
      // Arrange - Setup initial state
      // Act - Perform user actions
      // Assert - Verify final state
    });
  });

  // Component interaction tests
  describe('Component Interactions', () => {
    it('parent and child communicate correctly', async () => {
      // Test props/events communication
    });
  });

  // Tests with asynchronous data
  describe('Async Data Flows', () => {
    it('handles loading and error states', async () => {
      // Test loading and error states
    });
  });
});
```

### Naming conventions

- **Files**: `ComponentName.integration.test.tsx`
- **Suites**: `describe('ComponentName Integration', () => {})`
- **Tests**: `it('completes [workflow description]', async () => {})`

### Reusable helpers

#### Provider wrapper

```typescript
const createTestWrapper = (initialState = {}) => {
  const testStore = createTestStore(initialState);

  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={testStore}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </Provider>
  );
};
```

#### Custom render

```typescript
const renderWithContext = (
  component: React.ReactElement,
  options: RenderOptions = {},
) => {
  return render(component, {
    wrapper: createTestWrapper(),
    ...options,
  });
};
```

## 🔧 Mocking strategies

### API Services

```typescript
// Complete module mock
vi.mock("../../services/apiService", () => ({
  fetchUserData: vi.fn(),
  updateUserProfile: vi.fn(),
  deleteUser: vi.fn(),
}));

// Partial mock
vi.mock("../../services/apiService", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchUserData: vi.fn(), // Mock only this function
  };
});
```

### Redux Store

```typescript
// Test store with initial state
const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable for tests
      }),
  });
};
```

### Navigation

```typescript
// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/test" }),
  };
});
```

## 📊 Existing integration tests

### Main pages

- ✅ `SignIn.integration.test.tsx`

  - Complete authentication flow
  - Error handling
  - Post-login redirection

- ✅ `User.integration.test.tsx`

  - Account selection
  - Transaction filtering
  - Pagination
  - Authentication token management

- ✅ `Home.integration.test.tsx`
  - Navigation between sections
  - Feature interactions

### Complex components

- ✅ `TransactionSearch.integration.test.tsx`

  - Search with filters
  - Result pagination
  - Loading states

- ✅ `EditUserForm.integration.test.tsx`
  - Form validation
  - Submission and error handling
  - Store updates

## 🎯 Typical test scenarios

### Authentication flow

1. **Successful login**

   - Credential entry
   - Form submission
   - Dashboard redirection
   - Global state update

2. **Error handling**
   - Incorrect credentials
   - Network issues
   - Expired token

### Data management

1. **Initial loading**

   - User data fetch
   - Account display
   - Transaction loading

2. **User interactions**
   - Account selection
   - Transaction search
   - Pagination
   - Data updates

## 🚀 Useful commands

```bash
# Integration tests only
pnpm test -- --grep="integration"

# Specific integration test
pnpm test -- User.integration.test.tsx

# With coverage for integration
pnpm test -- --coverage --grep="integration"

# Watch mode for development
pnpm test:watch -- --grep="integration"
```

## 📝 Checklist for new tests

### Planning

- [ ] Identify workflow to test
- [ ] Define required initial state
- [ ] List user interactions
- [ ] Plan final assertions

### Implementation

- [ ] Correct provider setup
- [ ] Appropriate dependency mocking
- [ ] Realistic user actions
- [ ] Asynchronous expectations handled

### Validation

- [ ] Test reproduces real use case
- [ ] No over-testing (redundancy with unit tests)
- [ ] Robust to implementation changes
- [ ] Reasonable execution time

## 🔗 Links with other tests

### Complementarity

- **Unit tests**: Isolated logic
- **Integration tests**: Complete workflows ← **You are here**
- **E2E tests (Cypress)**: Real user interface

### Coordination

- Avoid duplication between test types
- Focus on module interactions
- Test workflow edge cases

---

**Next step**: [Test Architecture](./TEST_ARCHITECTURE.md)
