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
});
