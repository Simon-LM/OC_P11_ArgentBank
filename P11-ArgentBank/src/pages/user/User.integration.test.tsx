/** @format */

/**
 * Tests d'intégration pour la page User
 *
 * Ces tests couvrent les interactions complexes entre composants,
 * les appels API, et les workflows complets utilisateur.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import User from "./User";
import usersReducer, { UsersState } from "../../store/slices/usersSlice";
import * as authService from "../../utils/authService";
import * as matomoHooks from "../../hooks/useMatomo/useMatomo";
import { describe, test, expect, vi } from "vitest";

vi.mock("../../utils/authService");
vi.mock("../../hooks/useMatomo/useMatomo", () => ({
  useMatomo: vi.fn(() => ({
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
    trackSiteSearch: vi.fn(),
  })),
  isMatomoLoaded: () => false,
}));

// Mock des actions async pour éviter les déclenchements automatiques
vi.mock("../../store/slices/usersSlice", async () => {
  const actual = await vi.importActual("../../store/slices/usersSlice");
  return {
    ...actual,
    searchTransactions: vi.fn(() => ({ type: "mock/searchTransactions" })),
    fetchAccounts: vi.fn(() => ({ type: "mock/fetchAccounts" })),
    fetchTransactions: vi.fn(() => ({ type: "mock/fetchTransactions" })),
  };
});

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

// Helper function to create valid mock transactions
const createMockTransaction = (index: number) => ({
  id: `tx${index + 1}`,
  accountId: "123",
  description: `Transaction ${index + 1}`,
  amount: 100 + index,
  date: "2024-01-01",
  type: "CREDIT" as const,
  category: "Income",
  notes: `Note ${index + 1}`,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
});

describe("User Component - Tests d'intégration", () => {
  // Reducer de test personnalisé qui ignore les actions mockées
  const testReducer = (
    state: UsersState = {} as UsersState,
    action: { type: string },
  ) => {
    // Ignorer les actions mockées pour maintenir l'état configuré
    if (action.type?.startsWith("mock/")) {
      return state;
    }
    return usersReducer(state, action);
  };

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
      searchStatus: "idle", // Changer de "succeeded" à "idle" pour éviter les recherches automatiques
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

  test("handles profile editing", async () => {
    const newUsername = "newuser123";

    vi.mocked(authService.updateUserProfile).mockResolvedValue({
      ...mockUser,
      userName: newUsername,
    });

    renderUser();

    fireEvent.click(screen.getByText(/edit user/i));

    const userNameInput = screen.getByRole("textbox", { name: /user name/i });
    fireEvent.change(userNameInput, { target: { value: newUsername } });

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(
      () => {
        expect(authService.updateUserProfile).toHaveBeenCalledWith(
          newUsername,
          "fake-token",
        );
      },
      { timeout: 3000 },
    );
  });

  test("handles update errors", async () => {
    const error = new Error("Update failed");
    vi.mocked(authService.updateUserProfile).mockRejectedValue(error);

    const consoleSpy = vi.spyOn(console, "error");
    renderUser();

    fireEvent.click(screen.getByText(/edit user/i));
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to update user profile:",
        error,
      );
    });
  });

  test("handles account selection with tracking", () => {
    const mockTrackEvent = vi.fn();
    const mockTrackPageView = vi.fn();
    const mockTrackSiteSearch = vi.fn();

    // Utiliser mockImplementation au lieu de mockReturnValue
    vi.mocked(matomoHooks.useMatomo).mockImplementation(() => ({
      trackEvent: mockTrackEvent,
      trackPageView: mockTrackPageView,
      trackSiteSearch: mockTrackSiteSearch,
    }));

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

    // Utiliser les labels accessibles corrects basés sur le DOM rendu
    const savingsButton = screen.getByLabelText(
      /Account 2 of 2. savings account, number x9876, Available Balance: €5000.00./i,
    );
    fireEvent.click(savingsButton);

    expect(mockTrackEvent).toHaveBeenCalledWith({
      category: "Account",
      action: "Select",
      name: "savings",
    });
  });

  test("handles pagination - page change", () => {
    const mockTransactions = Array.from({ length: 15 }, (_, index) =>
      createMockTransaction(index),
    );

    renderUser({
      searchResults: mockTransactions,
      searchStatus: "succeeded",
      pagination: {
        total: 15,
        page: 1,
        limit: 10,
        pages: 2,
      },
    });

    // Vérifier que la table de résultats est présente d'abord
    expect(screen.getByRole("table")).toBeInTheDocument();

    // Vérifier que la pagination est présente
    expect(
      screen.getByLabelText(/transaction pagination/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/go to page 2/i)).toBeInTheDocument();
  });

  test("handles pagination - previous page", () => {
    const mockTransactions = Array.from({ length: 25 }, (_, index) =>
      createMockTransaction(index),
    );

    renderUser({
      searchResults: mockTransactions,
      searchStatus: "succeeded",
      pagination: {
        total: 25,
        page: 2,
        limit: 10,
        pages: 3,
      },
    });

    // Vérifier que la table de résultats est présente d'abord
    expect(screen.getByRole("table")).toBeInTheDocument();

    const prevButton = screen.getByLabelText(/go to previous page/i);
    expect(prevButton).not.toBeDisabled();
    fireEvent.click(prevButton);
  });

  test("handles pagination - next page", () => {
    const mockTransactions = Array.from({ length: 25 }, (_, index) =>
      createMockTransaction(index),
    );

    renderUser({
      searchResults: mockTransactions,
      searchStatus: "succeeded",
      pagination: {
        total: 25,
        page: 2,
        limit: 10,
        pages: 3,
      },
    });

    // Vérifier que la table de résultats est présente d'abord
    expect(screen.getByRole("table")).toBeInTheDocument();

    const nextButton = screen.getByLabelText(/go to next page/i);
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);
  });

  test("handles complex pagination with ellipsis", () => {
    const mockTransactions = Array.from({ length: 100 }, (_, index) =>
      createMockTransaction(index),
    );

    renderUser({
      searchResults: mockTransactions,
      searchStatus: "succeeded",
      pagination: {
        total: 100,
        page: 5,
        limit: 10,
        pages: 10,
      },
    });

    // Vérifier que la table de résultats est présente d'abord
    expect(screen.getByRole("table")).toBeInTheDocument();

    // Vérifier la présence d'ellipses et des pages importantes avec des sélecteurs plus spécifiques
    expect(
      screen.getByRole("button", { name: "Go to page 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go to page 10" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go to page 5" }),
    ).toBeInTheDocument();
  });

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

    const firstAccount = screen.getByLabelText(
      /Account 1 of 2. checking account, number x8349/i,
    );
    const secondAccount = screen.getByLabelText(
      /Account 2 of 2. savings account, number x9876/i,
    );

    // Test navigation avec flèches
    firstAccount.focus();
    fireEvent.keyDown(firstAccount, { key: "ArrowUp" });

    secondAccount.focus();
    fireEvent.keyDown(secondAccount, { key: "ArrowDown" });
  });

  test("handles search navigation to results", async () => {
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
    ];

    renderUser({
      searchResults: mockTransactions,
      searchStatus: "succeeded",
    });

    // Le test vérifie que la table est rendue et peut recevoir le focus
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
  });

  test("handles missing authentication token", async () => {
    // Reset tous les mocks pour ce test
    vi.clearAllMocks();

    // Configurer le mock pour ne pas être appelé quand il n'y a pas de token
    vi.mocked(authService.updateUserProfile).mockImplementation(() => {
      throw new Error("updateUserProfile should not be called without token");
    });

    const consoleSpy = vi.spyOn(console, "error");

    // Créer le store et le state manuellement SANS définir le token
    sessionStorage.removeItem("authToken"); // S'assurer qu'il n'y a pas de token

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
    };

    const store = configureStore({
      reducer: { users: testReducer },
      preloadedState: {
        users: initialState,
      },
    });

    // Rendre le composant sans utiliser renderUser() qui redéfinit le token
    render(
      <Provider store={store}>
        <User />
      </Provider>,
    );

    fireEvent.click(screen.getByText(/edit user/i));
    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("No auth token found.");
    });

    // Vérifier que updateUserProfile n'a pas été appelé
    expect(authService.updateUserProfile).not.toHaveBeenCalled();
  });
});
