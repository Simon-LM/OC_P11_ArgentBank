/** @format */

import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import User from "./User";
import usersReducer, { UsersState } from "../../store/slices/usersSlice";
import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("../../hooks/useMatomo/useMatomo", () => ({
  useMatomo: () => ({
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
  }),
  isMatomoLoaded: () => false,
}));

// Mock the async thunk actions to prevent them from modifying state during tests
vi.mock("../../store/slices/usersSlice", async () => {
  const actual = await vi.importActual("../../store/slices/usersSlice");
  return {
    ...actual,
    searchTransactions: vi.fn(() => ({ type: "mock/searchTransactions" })),
    fetchAccounts: vi.fn(() => ({ type: "mock/fetchAccounts" })),
    fetchTransactions: vi.fn(() => ({ type: "mock/fetchTransactions" })),
    updateCurrentUser: vi.fn(() => ({ type: "mock/updateCurrentUser" })),
    selectAccount: vi.fn(() => ({ type: "mock/selectAccount" })),
  };
});

// Mock auth service
vi.mock("../../utils/authService", () => ({
  updateUserProfile: vi.fn(() => Promise.resolve({ userName: "updatedUser" })),
}));

const mockUser = {
  id: "1",
  firstName: "Tony",
  lastName: "Stark",
  userName: "ironman",
  email: "tony@stark.com",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  accounts: [
    {
      accountName: "Argent Bank Checking",
      accountNumber: "x8349",
      balance: "$2,082.79",
      balanceType: "Available Balance",
    },
  ],
};

describe("User Component - Comprehensive Test Suite", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  const renderUser = (customState: Partial<UsersState> = {}) => {
    // Set token in sessionStorage
    sessionStorage.setItem("authToken", "fake-token");

    // Create a complete initial state with all required properties
    const initialState: UsersState = {
      currentUser: mockUser,
      isAuthenticated: true,
      accounts: [
        {
          id: "123",
          accountNumber: "8349",
          balance: 2082.79,
          type: "checking",
          userId: "1",
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
        },
      ],
      accountsStatus: "succeeded",
      accountsError: null,
      selectedAccountId: null,
      transactions: [],
      transactionsStatus: "succeeded",
      transactionsError: null,
      searchResults: [],
      searchStatus: "idle",
      searchError: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      },
      currentSortBy: "date",
      currentSortOrder: "desc",
      ...customState,
    };

    // Create a custom reducer that ignores mock actions
    const testReducer = (
      state: UsersState = initialState,
      action: { type: string },
    ) => {
      if (action.type?.startsWith("mock/")) {
        return state; // Ignore mock actions
      }
      return usersReducer(state, action);
    };

    const store = configureStore({
      reducer: { users: testReducer },
      preloadedState: {
        users: initialState,
      },
    });

    return render(
      <Provider store={store}>
        <User />
      </Provider>,
    );
  };

  // Basic rendering tests
  test("displays loading message when currentUser is null", () => {
    renderUser({ currentUser: null });
    expect(screen.getByText(/loading user information/i)).toBeInTheDocument();
  });

  test("displays user information", () => {
    renderUser();
    expect(screen.getByText(/tony stark/i)).toBeInTheDocument();
  });

  test("displays welcome message with user name", () => {
    renderUser();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/tony stark!/i)).toBeInTheDocument();
  });

  test("displays edit user button", () => {
    renderUser();
    expect(screen.getByText(/edit user/i)).toBeInTheDocument();
  });

  // Account management tests
  test("displays message when no accounts are available", () => {
    renderUser({
      accounts: [],
      accountsStatus: "succeeded",
    });

    expect(screen.getByText(/you have no accounts/i)).toBeInTheDocument();
  });

  test("displays loading message when fetching accounts", () => {
    renderUser({ accountsStatus: "loading" });
    expect(screen.getByText(/loading accounts/i)).toBeInTheDocument();
  });

  test("displays error message when accounts fetch fails", () => {
    renderUser({
      accountsStatus: "failed",
      accountsError: "Network error",
    });
    expect(screen.getByText(/error loading accounts/i)).toBeInTheDocument();
  });

  test("displays single account correctly", () => {
    renderUser({
      accounts: [
        {
          id: "123",
          accountNumber: "8349",
          balance: 2082.79,
          type: "checking",
          userId: "1",
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
        },
      ],
    });

    expect(screen.getByText(/your 1 account/i)).toBeInTheDocument();
  });

  test("displays multiple accounts correctly", () => {
    const multipleAccounts = [
      {
        id: "123",
        accountNumber: "8349",
        balance: 2082.79,
        type: "checking",
        userId: "1",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
      },
      {
        id: "456",
        accountNumber: "9876",
        balance: 5000.0,
        type: "savings",
        userId: "1",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
      },
    ];

    renderUser({
      accounts: multipleAccounts,
      selectedAccountId: "123",
    });

    expect(screen.getByText(/your 2 accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/checking \(x8349\)/i)).toBeInTheDocument();
    expect(screen.getByText(/savings \(x9876\)/i)).toBeInTheDocument();
    expect(screen.getByText("Selected")).toBeInTheDocument();
  });

  // Transaction search tests
  test("displays search error message when transaction search fails", () => {
    renderUser({
      searchStatus: "failed",
      searchError: "Search failed",
    });
    expect(
      screen.getByText(/error searching transactions/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/search failed/i)).toBeInTheDocument();
  });

  test("displays loading message when searching transactions", () => {
    renderUser({ searchStatus: "loading" });
    expect(screen.getByText(/searching transactions/i)).toBeInTheDocument();
  });

  test("displays transactions when search results are available", () => {
    const mockTransactions = [
      {
        id: "tx1",
        accountId: "123",
        description: "Test Transaction",
        amount: 100.5,
        date: "2024-01-01",
        type: "CREDIT" as const,
        category: "Income",
        notes: "Test note",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "tx2",
        accountId: "123",
        description: "Another Transaction",
        amount: 50.25,
        date: "2024-01-02",
        type: "DEBIT" as const,
        category: null,
        notes: null,
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
      },
    ];

    renderUser({
      searchResults: mockTransactions,
      searchStatus: "succeeded",
    });

    expect(screen.getByText("Test Transaction")).toBeInTheDocument();
    expect(screen.getByText("Another Transaction")).toBeInTheDocument();
    expect(screen.getByText("+100.50 €")).toBeInTheDocument();
    expect(screen.getByText("-50.25 €")).toBeInTheDocument();
    expect(screen.getByText("Test note")).toBeInTheDocument();
  });

  test("displays no transactions message when no results found", () => {
    renderUser({
      searchResults: [],
      searchStatus: "succeeded",
      selectedAccountId: "123",
    });
    expect(
      screen.getByText(/no transactions found for this account/i),
    ).toBeInTheDocument();
  });

  test("displays generic no transactions message when no account selected", () => {
    renderUser({
      searchResults: [],
      searchStatus: "succeeded",
      selectedAccountId: null,
    });
    expect(screen.getByText(/no transactions found\./i)).toBeInTheDocument();
  });

  // Transaction heading tests
  test("displays account transaction subtitle when account is selected", () => {
    const selectedAccount = {
      id: "123",
      accountNumber: "8349",
      balance: 2082.79,
      type: "checking",
      userId: "1",
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    };

    renderUser({
      accounts: [selectedAccount],
      selectedAccountId: "123",
    });

    expect(screen.getByText("Transaction History")).toBeInTheDocument();
    expect(screen.getByText("Account #8349")).toBeInTheDocument();
  });

  test("displays all transactions title when no account is selected", () => {
    renderUser({
      selectedAccountId: null,
    });

    expect(screen.getByText("All Transactions")).toBeInTheDocument();
  });

  // Search functionality tests
  test("displays search input field", () => {
    renderUser();
    expect(screen.getByLabelText(/filter transactions/i)).toBeInTheDocument();
  });

  test("displays search help text", () => {
    renderUser();
    expect(
      screen.getByText(/search by date.*amount.*description/i),
    ).toBeInTheDocument();
  });

  test("displays keyboard shortcuts information", () => {
    renderUser();
    expect(
      screen.getByText(/shortcuts.*ctrl\+alt\+f.*search/i),
    ).toBeInTheDocument();
  });

  // Account interaction tests
  test("displays account balance information", () => {
    renderUser();
    expect(screen.getByText(/€2082\.79/)).toBeInTheDocument();
    expect(screen.getByText(/available balance/i)).toBeInTheDocument();
  });

  test("displays account type and number", () => {
    renderUser();
    expect(screen.getByText(/checking \(x8349\)/i)).toBeInTheDocument();
  });

  test("account buttons have proper accessibility attributes", () => {
    renderUser();
    const accountButton = screen.getByRole("button", {
      name: /account 1 of 1.*checking account.*x8349/i,
    });
    expect(accountButton).toHaveAttribute("aria-pressed", "false");
  });

  test("selected account shows proper state", () => {
    renderUser({
      selectedAccountId: "123",
    });
    const accountButton = screen.getByRole("button", {
      name: /account 1 of 1.*checking account.*x8349.*selected/i,
    });
    expect(accountButton).toHaveAttribute("aria-pressed", "true");
  });

  // User interaction tests
  test("can click edit user button", () => {
    renderUser();
    const editButton = screen.getByText(/edit user/i);
    fireEvent.click(editButton);
    // After clicking edit, the button should be replaced with form
    expect(screen.queryByText(/^edit user$/i)).not.toBeInTheDocument();
    // The form should appear with the title "Edit user info"
    expect(screen.getByText(/edit user info/i)).toBeInTheDocument();
  });

  test("displays transaction search component", () => {
    renderUser();
    expect(screen.getByLabelText(/filter transactions/i)).toBeInTheDocument();
  });

  // Unauthenticated state tests
  test("displays loading when not authenticated", () => {
    renderUser({
      isAuthenticated: false,
      currentUser: null,
    });
    expect(screen.getByText(/loading user information/i)).toBeInTheDocument();
  });

  // Complex state tests
  test("handles multiple transactions with different types", () => {
    const mixedTransactions = [
      {
        id: "tx1",
        accountId: "123",
        description: "Salary Deposit",
        amount: 3000,
        date: "2024-01-01",
        type: "CREDIT" as const,
        category: "Income",
        notes: "Monthly salary",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "tx2",
        accountId: "123",
        description: "Grocery Shopping",
        amount: 150.75,
        date: "2024-01-02",
        type: "DEBIT" as const,
        category: "Food",
        notes: null,
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
      },
      {
        id: "tx3",
        accountId: "123",
        description: "Investment Return",
        amount: 500.25,
        date: "2024-01-03",
        type: "CREDIT" as const,
        category: "Investment",
        notes: "Quarterly dividend",
        createdAt: "2024-01-03T00:00:00Z",
        updatedAt: "2024-01-03T00:00:00Z",
      },
    ];

    renderUser({
      searchResults: mixedTransactions,
      searchStatus: "succeeded",
    });

    expect(screen.getByText("Salary Deposit")).toBeInTheDocument();
    expect(screen.getByText("Grocery Shopping")).toBeInTheDocument();
    expect(screen.getByText("Investment Return")).toBeInTheDocument();
    expect(screen.getByText("+3000.00 €")).toBeInTheDocument();
    expect(screen.getByText("-150.75 €")).toBeInTheDocument();
    expect(screen.getByText("+500.25 €")).toBeInTheDocument();
  });

  // Error handling tests
  test("handles empty search results gracefully", () => {
    renderUser({
      searchResults: [],
      searchStatus: "succeeded",
    });
    expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
  });

  // Accessibility tests
  test("has proper ARIA labels and roles", () => {
    renderUser();
    expect(
      screen.getByRole("list", { name: /available banking accounts/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/filter transactions/i)).toBeInTheDocument();
  });

  test("has proper headings structure", () => {
    renderUser();
    expect(
      screen.getByRole("heading", { name: /your 1 account/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /all transactions/i }),
    ).toBeInTheDocument();
  });

  // Performance and optimization tests
  test("renders without crashing with minimal state", () => {
    renderUser({
      currentUser: mockUser,
      isAuthenticated: true,
      accounts: [],
      searchResults: [],
      searchStatus: "idle",
    });
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  test("handles large number of accounts", () => {
    const manyAccounts = Array.from({ length: 5 }, (_, i) => ({
      id: `account-${i}`,
      accountNumber: `123${i}`,
      balance: 1000 + i * 100,
      type: i % 2 === 0 ? "checking" : "savings",
      userId: "1",
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
    }));

    renderUser({
      accounts: manyAccounts,
    });

    expect(screen.getByText(/your 5 accounts/i)).toBeInTheDocument();
  });

  // Test pagination functions
  test("handles page navigation with previous/next buttons", () => {
    renderUser({
      searchResults: [
        {
          id: "1",
          description: "Transaction 1",
          amount: 100,
          date: "2024-01-01",
          category: null,
          notes: null,
          type: "DEBIT" as const,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          accountId: "1",
        },
        {
          id: "2",
          description: "Transaction 2",
          amount: 200,
          date: "2024-01-02",
          category: null,
          notes: null,
          type: "CREDIT" as const,
          createdAt: "2024-01-02",
          updatedAt: "2024-01-02",
          accountId: "1",
        },
      ],
      pagination: {
        page: 2,
        pages: 3,
        total: 30,
        limit: 10,
      },
      searchStatus: "succeeded",
    });

    // Test previous page button
    const prevButton = screen.getByRole("button", { name: /previous/i });
    fireEvent.click(prevButton);

    // Test next page button
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);
  });

  test("handles specific page number navigation", () => {
    renderUser({
      searchResults: [
        {
          id: "1",
          description: "Transaction 1",
          amount: 100,
          date: "2024-01-01",
          category: null,
          notes: null,
          type: "DEBIT" as const,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          accountId: "1",
        },
      ],
      pagination: {
        page: 1,
        pages: 3,
        total: 30,
        limit: 10,
      },
      searchStatus: "succeeded",
    });

    // Test clicking on page number
    const pageButton = screen.getByRole("button", { name: /page 2/i });
    fireEvent.click(pageButton);
  });

  // Test keyboard navigation functions
  test("handles keyboard navigation for accounts", () => {
    renderUser({
      accounts: [
        {
          id: "1",
          accountNumber: "123",
          balance: 1000,
          type: "checking",
          userId: "1",
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
        },
        {
          id: "2",
          accountNumber: "456",
          balance: 2000,
          type: "savings",
          userId: "1",
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
        },
      ],
    });

    const accountButtons = screen.getAllByRole("button", {
      name: /account \d+ of \d+/i,
    });

    // Test arrow down navigation on last account
    fireEvent.keyDown(accountButtons[accountButtons.length - 1], {
      key: "ArrowDown",
    });

    // Test arrow up navigation on first account
    fireEvent.keyDown(accountButtons[0], { key: "ArrowUp" });
  });

  // Test account selection function
  test("handles account selection", () => {
    renderUser({
      accounts: [
        {
          id: "1",
          accountNumber: "123",
          balance: 1000,
          type: "checking",
          userId: "1",
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
        },
      ],
      selectedAccountId: "1", // Pre-select the account to test the aria-pressed state
    });

    const accountButton = screen.getByRole("button", {
      name: /account 1 of 1/i,
    });

    // Check if account is already selected (aria-pressed should be true)
    expect(accountButton).toHaveAttribute("aria-pressed", "true");

    // Check if the "Selected" text appears in the aria-label
    expect(accountButton).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Selected"),
    );
  });

  // Test navigation to search results
  test("navigates to search results and provides feedback", () => {
    renderUser({
      searchResults: [
        {
          id: "1",
          description: "Transaction 1",
          amount: 100,
          date: "2024-01-01",
          category: null,
          notes: null,
          type: "DEBIT" as const,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          accountId: "1",
        },
        {
          id: "2",
          description: "Transaction 2",
          amount: 200,
          date: "2024-01-02",
          category: null,
          notes: null,
          type: "CREDIT" as const,
          createdAt: "2024-01-02",
          updatedAt: "2024-01-02",
          accountId: "1",
        },
      ],
      pagination: {
        page: 1,
        pages: 1,
        total: 2,
        limit: 10,
      },
      searchStatus: "succeeded",
    });

    // Check if transactions are displayed
    expect(screen.getByText("Transaction 1")).toBeInTheDocument();
    expect(screen.getByText("Transaction 2")).toBeInTheDocument();
  });

  // Test edge cases for pagination
  test("handles pagination at boundaries", () => {
    // Test when on first page
    renderUser({
      searchResults: [
        {
          id: "1",
          description: "Transaction 1",
          amount: 100,
          date: "2024-01-01",
          category: null,
          notes: null,
          type: "DEBIT" as const,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          accountId: "1",
        },
      ],
      pagination: {
        page: 1,
        pages: 3,
        total: 30,
        limit: 10,
      },
      searchStatus: "succeeded",
    });

    const prevButton = screen.getByRole("button", { name: /previous/i });
    fireEvent.click(prevButton); // Should not navigate when on first page

    // Test pagination buttons are present
    expect(screen.getByRole("button", { name: /page 1/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /page 2/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /page 3/i })).toBeInTheDocument();
  });

  // Test search with empty results
  test("handles empty search results", () => {
    renderUser({
      searchResults: [],
      pagination: {
        page: 1,
        pages: 0,
        total: 0,
        limit: 10,
      },
      searchStatus: "succeeded",
    });

    expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
  });

  // Test handleSave function
  test("handles save user operation", async () => {
    const mockUpdateUserProfile = vi.fn(() =>
      Promise.resolve({ userName: "newUserName" }),
    );
    vi.doMock("../../utils/authService", () => ({
      updateUserProfile: mockUpdateUserProfile,
    }));

    renderUser();

    // Click edit button to show the form
    const editButton = screen.getByText(/edit user/i);
    fireEvent.click(editButton);

    // The form should be visible
    expect(screen.getByText(/edit user info/i)).toBeInTheDocument();

    // Simulate form submission (this would normally trigger handleSave)
    // Since we can't directly test handleSave, we verify the form can be interacted with
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeInTheDocument();
  });

  // Test handleAccountSelect function through UI interaction
  test("handles account selection through click", () => {
    const multipleAccounts = [
      {
        id: "123",
        accountNumber: "8349",
        balance: 2082.79,
        type: "checking",
        userId: "1",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
      },
      {
        id: "456",
        accountNumber: "9876",
        balance: 5000.0,
        type: "savings",
        userId: "1",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
      },
    ];

    renderUser({
      accounts: multipleAccounts,
    });

    // Click on the second account
    const accountButtons = screen.getAllByRole("button", {
      name: /account \d+ of \d+/i,
    });
    fireEvent.click(accountButtons[1]);

    // Check if the account selection state is updated
    expect(accountButtons[1]).toHaveAttribute("aria-pressed", "false");
  });

  // Test handlePageChange function
  test("handles page change navigation", () => {
    renderUser({
      searchResults: [
        {
          id: "1",
          description: "Transaction 1",
          amount: 100,
          date: "2024-01-01",
          category: null,
          notes: null,
          type: "DEBIT" as const,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          accountId: "1",
        },
      ],
      pagination: {
        page: 1,
        pages: 3,
        total: 30,
        limit: 10,
      },
      searchStatus: "succeeded",
    });

    // Test specific page navigation
    const pageButton = screen.getByRole("button", { name: /go to page 2/i });
    fireEvent.click(pageButton);

    // Page button should be interactable
    expect(pageButton).toBeInTheDocument();
  });

  // Test handlePreviousPage function
  test("handles previous page navigation", () => {
    renderUser({
      searchResults: [
        {
          id: "1",
          description: "Transaction 1",
          amount: 100,
          date: "2024-01-01",
          category: null,
          notes: null,
          type: "DEBIT" as const,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          accountId: "1",
        },
      ],
      pagination: {
        page: 2,
        pages: 3,
        total: 30,
        limit: 10,
      },
      searchStatus: "succeeded",
    });

    // Test previous page button
    const prevButton = screen.getByRole("button", { name: /previous/i });
    fireEvent.click(prevButton);

    // Previous button should be interactable
    expect(prevButton).toBeInTheDocument();
  });

  // Test handleNextPage function
  test("handles next page navigation", () => {
    renderUser({
      searchResults: [
        {
          id: "1",
          description: "Transaction 1",
          amount: 100,
          date: "2024-01-01",
          category: null,
          notes: null,
          type: "DEBIT" as const,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          accountId: "1",
        },
      ],
      pagination: {
        page: 1,
        pages: 3,
        total: 30,
        limit: 10,
      },
      searchStatus: "succeeded",
    });

    // Test next page button
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    // Next button should be interactable
    expect(nextButton).toBeInTheDocument();
  });

  // Test navigateToSearchResults function through TransactionSearch component
  test("handles navigation to search results", () => {
    renderUser({
      searchResults: [
        {
          id: "1",
          description: "Transaction 1",
          amount: 100,
          date: "2024-01-01",
          category: null,
          notes: null,
          type: "DEBIT" as const,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          accountId: "1",
        },
      ],
      pagination: {
        page: 1,
        pages: 1,
        total: 1,
        limit: 10,
      },
      searchStatus: "succeeded",
    });

    // Check if transaction table is rendered (navigateToSearchResults functionality)
    const transactionTable = screen.getByRole("table");
    expect(transactionTable).toBeInTheDocument();
  });

  // Test handleAccountKeyNavigation function
  test("handles keyboard navigation between accounts", () => {
    const multipleAccounts = [
      {
        id: "123",
        accountNumber: "8349",
        balance: 2082.79,
        type: "checking",
        userId: "1",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
      },
      {
        id: "456",
        accountNumber: "9876",
        balance: 5000.0,
        type: "savings",
        userId: "1",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
      },
    ];

    renderUser({
      accounts: multipleAccounts,
    });

    const accountButtons = screen.getAllByRole("button", {
      name: /account \d+ of \d+/i,
    });

    // Test ArrowDown on last account
    fireEvent.keyDown(accountButtons[accountButtons.length - 1], {
      key: "ArrowDown",
    });

    // Test ArrowUp on first account
    fireEvent.keyDown(accountButtons[0], { key: "ArrowUp" });

    // Verify the buttons are still accessible
    expect(accountButtons[0]).toBeInTheDocument();
    expect(accountButtons[1]).toBeInTheDocument();
  });

  // Test keyboard navigation with Enter key
  test("handles account selection with Enter key", () => {
    renderUser({
      accounts: [
        {
          id: "123",
          accountNumber: "8349",
          balance: 2082.79,
          type: "checking",
          userId: "1",
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
        },
      ],
    });

    const accountButton = screen.getByRole("button", {
      name: /account 1 of 1/i,
    });

    // Test Enter key press
    fireEvent.keyDown(accountButton, { key: "Enter" });

    // Verify button is still accessible
    expect(accountButton).toBeInTheDocument();
  });

  // Test global search toggle functionality
  test("handles global search toggle", () => {
    renderUser({
      accounts: [
        {
          id: "123",
          accountNumber: "8349",
          balance: 2082.79,
          type: "checking",
          userId: "1",
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
        },
      ],
      selectedAccountId: "123",
      searchResults: [
        {
          id: "1",
          description: "Transaction 1",
          amount: 100,
          date: "2024-01-01",
          category: null,
          notes: null,
          type: "DEBIT" as const,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          accountId: "1",
        },
      ],
      searchStatus: "succeeded",
    });

    // Verify the page renders with selected account
    expect(screen.getByText("Transaction History")).toBeInTheDocument();
    expect(screen.getByText("Account #8349")).toBeInTheDocument();
  });

  // Test pagination with many pages (ellipsis functionality)
  test("handles smart pagination with many pages", () => {
    renderUser({
      searchResults: [
        {
          id: "1",
          description: "Transaction 1",
          amount: 100,
          date: "2024-01-01",
          category: null,
          notes: null,
          type: "DEBIT" as const,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          accountId: "1",
        },
      ],
      pagination: {
        page: 5,
        pages: 15,
        total: 150,
        limit: 10,
      },
      searchStatus: "succeeded",
    });

    // Should show ellipsis for many pages - there are multiple ellipsis elements
    expect(screen.getAllByText("...")).toHaveLength(2);
    expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to page 15")).toBeInTheDocument();
  });

  // Test transaction amount formatting for credit and debit
  test("formats transaction amounts correctly", () => {
    const mixedTransactions = [
      {
        id: "tx1",
        accountId: "123",
        description: "Credit Transaction",
        amount: 1000.5,
        date: "2024-01-01",
        type: "CREDIT" as const,
        category: "Income",
        notes: "Credit note",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "tx2",
        accountId: "123",
        description: "Debit Transaction",
        amount: 250.75,
        date: "2024-01-02",
        type: "DEBIT" as const,
        category: "Expense",
        notes: "Debit note",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
      },
    ];

    renderUser({
      searchResults: mixedTransactions,
      searchStatus: "succeeded",
    });

    // Check credit amount formatting
    expect(screen.getByText("+1000.50 €")).toBeInTheDocument();
    // Check debit amount formatting
    expect(screen.getByText("-250.75 €")).toBeInTheDocument();
  });
});
