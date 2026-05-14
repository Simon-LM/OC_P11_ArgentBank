/** @format */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import reducer, {
  fetchAccounts,
  fetchTransactions,
  searchTransactions,
} from "./usersSlice";

describe("usersSlice async thunks", () => {
  let store: ReturnType<
    typeof configureStore<{ users: ReturnType<typeof reducer> }>
  >;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    store = configureStore<{ users: ReturnType<typeof reducer> }>({
      reducer: { users: reducer },
    });
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    sessionStorage.clear();
  });

  it("fetchAccounts - succès", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        body: [
          {
            id: "1",
            accountNumber: "123",
            balance: "1000",
            type: "checking",
            userId: "1",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
        ],
      }),
    });
    await store.dispatch(fetchAccounts());
    const state = store.getState().users;
    expect(state.accountsStatus).toBe("succeeded");
    expect(state.accounts[0].balance).toBe(1000);
  });

  it("fetchAccounts - erreur token", async () => {
    await store.dispatch(fetchAccounts());
    const state = store.getState().users;
    expect(state.accountsStatus).toBe("failed");
    expect(state.accountsError).toMatch(/token/i);
  });

  it("fetchAccounts - erreur API", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Erreur API" }),
      status: 500,
    });
    await store.dispatch(fetchAccounts());
    const state = store.getState().users;
    expect(state.accountsStatus).toBe("failed");
    expect(state.accountsError).toMatch(/Erreur API/);
  });

  it("fetchAccounts - erreur API sans message", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
      status: 503,
    });

    await store.dispatch(fetchAccounts());

    const state = store.getState().users;
    expect(state.accountsStatus).toBe("failed");
    expect(state.accountsError).toBe("Failed to fetch accounts: 503");
  });

  it("fetchAccounts - format de réponse invalide", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ body: { id: "not-an-array" } }),
    });

    await store.dispatch(fetchAccounts());

    const state = store.getState().users;
    expect(state.accountsStatus).toBe("failed");
    expect(state.accountsError).toBe(
      "Invalid response format from server for accounts",
    );
  });

  it("fetchAccounts - erreur inconnue", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockRejectedValueOnce("network down");

    await store.dispatch(fetchAccounts());

    const state = store.getState().users;
    expect(state.accountsStatus).toBe("failed");
    expect(state.accountsError).toBe(
      "An unknown error occurred while fetching accounts",
    );
  });

  it("fetchTransactions - succès", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        body: [
          {
            id: "t1",
            amount: "42",
            description: "desc",
            date: "2024-01-01",
            category: null,
            notes: null,
            type: "DEBIT",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
            accountId: "1",
          },
        ],
      }),
    });
    await store.dispatch(fetchTransactions());
    const state = store.getState().users;
    expect(state.transactionsStatus).toBe("succeeded");
    expect(state.transactions[0].amount).toBe(42);
  });

  it("fetchTransactions - erreur API", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Erreur API" }),
      status: 500,
    });
    await store.dispatch(fetchTransactions());
    const state = store.getState().users;
    expect(state.transactionsStatus).toBe("failed");
    expect(state.transactionsError).toMatch(/Erreur API/);
  });

  it("fetchTransactions - erreur token", async () => {
    await store.dispatch(fetchTransactions());

    const state = store.getState().users;
    expect(state.transactionsStatus).toBe("failed");
    expect(state.transactionsError).toMatch(/token/i);
  });

  it("fetchTransactions - erreur API sans message", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
      status: 502,
    });

    await store.dispatch(fetchTransactions());

    const state = store.getState().users;
    expect(state.transactionsStatus).toBe("failed");
    expect(state.transactionsError).toBe("Failed to fetch transactions: 502");
  });

  it("fetchTransactions - format de réponse invalide", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ body: null }),
    });

    await store.dispatch(fetchTransactions());

    const state = store.getState().users;
    expect(state.transactionsStatus).toBe("failed");
    expect(state.transactionsError).toBe("Invalid response format from server");
  });

  it("fetchTransactions - erreur inconnue", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockRejectedValueOnce("network down");

    await store.dispatch(fetchTransactions());

    const state = store.getState().users;
    expect(state.transactionsStatus).toBe("failed");
    expect(state.transactionsError).toBe(
      "An unknown error occurred while fetching transactions",
    );
  });

  it("searchTransactions - succès", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        body: {
          transactions: [
            {
              id: "t1",
              amount: "42",
              description: "desc",
              date: "2024-01-01",
              category: null,
              notes: null,
              type: "DEBIT",
              createdAt: "2024-01-01",
              updatedAt: "2024-01-01",
              accountId: "1",
            },
          ],
          pagination: { total: 1, page: 1, limit: 10, pages: 1 },
        },
      }),
    });
    await store.dispatch(searchTransactions({}));
    const state = store.getState().users;
    expect(state.searchStatus).toBe("succeeded");
    expect(state.searchResults[0].amount).toBe(42);
    expect(state.pagination?.total).toBe(1);
  });

  it("searchTransactions - erreur API", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Erreur API" }),
      status: 500,
    });
    await store.dispatch(searchTransactions({}));
    const state = store.getState().users;
    expect(state.searchStatus).toBe("failed");
    expect(state.searchError).toMatch(/Erreur API/);
  });

  it("searchTransactions - erreur token", async () => {
    await store.dispatch(searchTransactions({}));

    const state = store.getState().users;
    expect(state.searchStatus).toBe("failed");
    expect(state.searchError).toMatch(/token/i);
  });

  it("searchTransactions - envoie tous les paramètres supportés", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        body: {
          transactions: [],
          pagination: { total: 0, page: 2, limit: 25, pages: 0 },
        },
      }),
    });

    await store.dispatch(
      searchTransactions({
        accountId: "acc1",
        searchTerm: "rent",
        category: "Housing",
        fromDate: "2024-01-01",
        toDate: "2024-01-31",
        minAmount: 10,
        maxAmount: 250,
        type: "DEBIT",
        page: 2,
        limit: 25,
        sortBy: "amount",
        sortOrder: "asc",
      }),
    );

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/transactions/search?");
    expect(calledUrl).toContain("accountId=acc1");
    expect(calledUrl).toContain("searchTerm=rent");
    expect(calledUrl).toContain("category=Housing");
    expect(calledUrl).toContain("fromDate=2024-01-01");
    expect(calledUrl).toContain("toDate=2024-01-31");
    expect(calledUrl).toContain("minAmount=10");
    expect(calledUrl).toContain("maxAmount=250");
    expect(calledUrl).toContain("type=DEBIT");
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).toContain("limit=25");
    expect(calledUrl).toContain("sortBy=amount");
    expect(calledUrl).toContain("sortOrder=asc");
  });

  it("searchTransactions - erreur API sans message", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
      status: 500,
    });

    await store.dispatch(searchTransactions({}));

    const state = store.getState().users;
    expect(state.searchStatus).toBe("failed");
    expect(state.searchError).toBe("Failed to search transactions: 500");
  });

  it("searchTransactions - format de réponse invalide", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ body: { transactions: null } }),
    });

    await store.dispatch(searchTransactions({}));

    const state = store.getState().users;
    expect(state.searchStatus).toBe("failed");
    expect(state.searchError).toBe("Invalid response format from server");
  });

  it("searchTransactions - erreur inconnue", async () => {
    sessionStorage.setItem("authToken", "token");
    fetchMock.mockRejectedValueOnce("network down");

    await store.dispatch(searchTransactions({}));

    const state = store.getState().users;
    expect(state.searchStatus).toBe("failed");
    expect(state.searchError).toBe(
      "An unknown error occurred while searching transactions",
    );
  });
});
