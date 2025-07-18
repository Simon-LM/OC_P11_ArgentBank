/** @format */

import { describe, test, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userReducer, { UsersState } from "./store/slices/usersSlice";
import App from "./App";

// Mock store with correct state
const createTestStore = () => {
  const preloadedState = {
    users: {
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
    } as UsersState,
  };

  return configureStore({
    reducer: {
      users: userReducer,
    },
    preloadedState,
  });
};

describe("App", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  test("displays Home page by default", async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    expect(await screen.findByText(/No fees./i)).toBeInTheDocument();
  });

  test("displays Header on all pages", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  test("displays Footer on all pages", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
