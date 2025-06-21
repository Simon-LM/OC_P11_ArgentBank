/** @format */
/**
 * @fileoverview Tests d'intégration pour le composant App
 *
 * Scope d'intégration testé :
 * - Navigation et routage entre les pages
 * - Protection des routes avec authentification
 * - Intégration Redux store pour l'état d'authentification
 * - Gestion des routes invalides (404)
 */
import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userReducer, { UsersState } from "./store/slices/usersSlice";
import App from "./App";

// Définir RootState
interface RootState {
  users: UsersState;
}

// Store mock avec le state correct
const createTestStore = (isAuthenticated = false) => {
  const preloadedState: RootState = {
    users: {
      isAuthenticated,
      currentUser: isAuthenticated
        ? {
            id: "123",
            userName: "Tony",
            firstName: "Tony",
            lastName: "Stark",
            email: "tony@stark.com",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            accounts: [
              {
                accountName: "Argent Bank Checking",
                accountNumber: "x8349",
                balance: "$2,082.79",
                balanceType: "Available Balance",
              },
            ],
          }
        : null,
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
    },
  };

  return configureStore({
    reducer: {
      users: userReducer,
    },
    preloadedState,
  });
};

describe("App - Integration Tests", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  test("redirige vers Error404 pour une route invalide", async () => {
    window.history.pushState({}, "", "/invalid");

    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    expect(
      await screen.findByRole("heading", { name: /404/i }),
    ).toBeInTheDocument();
  });

  test("protège la route /user sans authentification", async () => {
    const unauthenticatedStore = createTestStore(false);

    window.history.pushState({}, "", "/user");

    render(
      <Provider store={unauthenticatedStore}>
        <App />
      </Provider>,
    );

    expect(await screen.findByText(/Sign In/i)).toBeInTheDocument();
  });
});
