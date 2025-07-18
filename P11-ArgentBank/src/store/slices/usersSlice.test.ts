/** @format */

import { describe, test, expect, beforeEach } from "vitest";
import reducer, {
  loginUserSuccess,
  logoutUser,
  updateCurrentUser,
  setAuthState,
  UsersState,
  User,
  clearTransactionsError,
  selectAccount,
  clearSearchResults,
  setSearchSortOrder,
  setSearchFilters,
} from "./usersSlice";

describe("usersSlice", () => {
  const initialState: UsersState = {
    isAuthenticated: false,
    currentUser: null,
    accounts: [],
    accountsStatus: "idle",
    accountsError: null,
    selectedAccountId: null,
    transactions: [],
    transactionsStatus: "idle",
    transactionsError: null,
    searchResults: [],
    searchStatus: "idle",
    searchError: null,
    pagination: null,
    currentSortBy: "date",
    currentSortOrder: "desc",
  };

  const mockUser: User = {
    id: "1",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    userName: "johndoe",
    createdAt: "2024-03-14",
    updatedAt: "2024-03-14",
    accounts: [
      {
        accountName: "Checking",
        accountNumber: "123456",
        balance: "$1,000",
        balanceType: "Available Balance",
      },
    ],
  };

  beforeEach(() => {
    sessionStorage.clear();
  });

  test("devrait retourner l'état initial", () => {
    const result = reducer(undefined, { type: "@@INIT" });
    expect(result.isAuthenticated).toEqual(initialState.isAuthenticated);
    expect(result.currentUser).toEqual(initialState.currentUser);
    expect(result.accounts).toEqual(initialState.accounts);
  });

  test("devrait gérer loginUserSuccess", () => {
    const loginPayload = {
      email: "test@example.com",
      token: "fake-token",
    };

    const nextState = reducer(initialState, loginUserSuccess(loginPayload));
    expect(nextState.isAuthenticated).toBe(true);
    expect(sessionStorage.getItem("authToken")).toBe("fake-token");
  });

  test("devrait gérer logoutUser", () => {
    const loggedInState: UsersState = {
      ...initialState,
      isAuthenticated: true,
      currentUser: mockUser,
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
      transactions: [
        {
          id: "t1",
          amount: 1000,
          description: "Test",
          date: "2023-01-01",
          category: "Food",
          notes: null,
          type: "DEBIT",
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
          accountId: "123",
        },
      ],
    };

    const nextState = reducer(loggedInState, logoutUser());
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.currentUser).toBeNull();
    expect(nextState.accounts).toEqual([]);
    expect(nextState.transactions).toEqual([]);
    expect(sessionStorage.getItem("authToken")).toBeNull();
  });

  test("devrait gérer updateCurrentUser avec un utilisateur existant", () => {
    const currentState: UsersState = {
      ...initialState,
      currentUser: mockUser,
    };

    const update = {
      userName: "newUsername",
    };

    const nextState = reducer(currentState, updateCurrentUser(update));
    expect(nextState.currentUser?.userName).toBe("newUsername");
    expect(nextState.currentUser?.firstName).toBe(mockUser.firstName);
  });

  test("devrait gérer setAuthState", () => {
    const nextState = reducer(initialState, setAuthState(mockUser));
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.currentUser).toEqual(mockUser);
  });

  test("devrait gérer clearTransactionsError", () => {
    const stateWithError: UsersState = {
      ...initialState,
      transactionsError: "Une erreur est survenue",
    };

    const nextState = reducer(stateWithError, clearTransactionsError());
    expect(nextState.transactionsError).toBeNull();
  });

  test("devrait gérer selectAccount", () => {
    const accountId = "account123";
    const nextState = reducer(initialState, selectAccount(accountId));
    expect(nextState.selectedAccountId).toBe(accountId);

    const afterState = reducer(nextState, selectAccount(null));
    expect(afterState.selectedAccountId).toBeNull();
  });

  test("updateCurrentUser ne modifie rien si currentUser est null", () => {
    const currentState: UsersState = {
      ...initialState,
      currentUser: null,
    };
    const update = { userName: "nouveau" };
    const nextState = reducer(currentState, updateCurrentUser(update));
    expect(nextState.currentUser).toBeNull();
  });

  test("clearTransactionsError ne fait rien si pas d'erreur", () => {
    const stateSansErreur: UsersState = {
      ...initialState,
      transactionsError: null,
    };
    const nextState = reducer(stateSansErreur, clearTransactionsError());
    expect(nextState.transactionsError).toBeNull();
  });

  test("selectAccount avec le même ID ne change pas l'état", () => {
    const state: UsersState = {
      ...initialState,
      selectedAccountId: "abc",
    };
    const nextState = reducer(state, selectAccount("abc"));
    expect(nextState.selectedAccountId).toBe("abc");
  });

  test("reducer retourne l'état pour une action inconnue", () => {
    const state: UsersState = { ...initialState };
    const nextState = reducer(state, { type: "ACTION_INCONNUE" });
    expect(nextState).toEqual(state);
  });

  test("setAuthState avec un utilisateur partiel ne casse pas le reducer", () => {
    const partialUser = {
      id: "2",
      email: "partial@example.com",
      firstName: "Partial",
      lastName: "User",
      userName: "partialuser",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      accounts: [],
    };
    const nextState = reducer(initialState, setAuthState(partialUser));
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.currentUser).toEqual(partialUser);
  });

  test("devrait gérer clearSearchResults", () => {
    const stateWithSearchResults: UsersState = {
      ...initialState,
      searchResults: [
        {
          id: "t1",
          amount: 100,
          description: "Test Transaction",
          date: "2024-01-01",
          category: "Food",
          notes: "Test note",
          type: "DEBIT",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          accountId: "123",
        },
      ],
      searchStatus: "succeeded",
      searchError: "Test error",
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        pages: 1,
      },
    };

    const nextState = reducer(stateWithSearchResults, clearSearchResults());
    expect(nextState.searchResults).toEqual([]);
    expect(nextState.searchStatus).toBe("idle");
    expect(nextState.searchError).toBeNull();
    expect(nextState.pagination).toBeNull();
  });

  test("devrait gérer setSearchSortOrder", () => {
    const sortParams = {
      sortBy: "amount",
      sortOrder: "asc" as const,
    };

    const nextState = reducer(initialState, setSearchSortOrder(sortParams));
    expect(nextState.currentSortBy).toBe("amount");
    expect(nextState.currentSortOrder).toBe("asc");
    expect(nextState.pagination).toEqual({
      total: 0,
      page: 1,
      limit: 10,
      pages: 0,
    });
  });

  test("devrait gérer setSearchSortOrder avec pagination existante", () => {
    const stateWithPagination: UsersState = {
      ...initialState,
      pagination: {
        total: 50,
        page: 3,
        limit: 10,
        pages: 5,
      },
    };

    const sortParams = {
      sortBy: "date",
      sortOrder: "desc" as const,
    };

    const nextState = reducer(
      stateWithPagination,
      setSearchSortOrder(sortParams),
    );
    expect(nextState.currentSortBy).toBe("date");
    expect(nextState.currentSortOrder).toBe("desc");
    expect(nextState.pagination?.page).toBe(1); // Should reset to page 1
    expect(nextState.pagination?.total).toBe(50); // Should keep other pagination values
  });

  test("devrait gérer setSearchFilters", () => {
    const filters = {
      category: "Food",
      fromDate: "2024-01-01",
      toDate: "2024-01-31",
      minAmount: 10,
      maxAmount: 1000,
    };

    const nextState = reducer(initialState, setSearchFilters(filters));
    expect(nextState.pagination).toEqual({
      total: 0,
      page: 1,
      limit: 10,
      pages: 0,
    });
  });

  test("devrait gérer setSearchFilters avec pagination existante", () => {
    const stateWithPagination: UsersState = {
      ...initialState,
      pagination: {
        total: 30,
        page: 2,
        limit: 10,
        pages: 3,
      },
    };

    const filters = {
      category: "Entertainment",
      type: "DEBIT" as const,
    };

    const nextState = reducer(stateWithPagination, setSearchFilters(filters));
    expect(nextState.pagination?.page).toBe(1); // Should reset to page 1
    expect(nextState.pagination?.total).toBe(30); // Should keep other pagination values
  });

  test("devrait gérer setSearchFilters avec filtres vides", () => {
    const emptyFilters = {};

    const nextState = reducer(initialState, setSearchFilters(emptyFilters));
    expect(nextState.pagination).toEqual({
      total: 0,
      page: 1,
      limit: 10,
      pages: 0,
    });
  });
});
