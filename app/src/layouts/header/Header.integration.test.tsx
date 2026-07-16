/** @format */

/**
 * Integration tests for the Header component
 *
 * These tests cover complex interactions with Redux,
 * navigation, and accessibility tests.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";
import userReducer, {
  logoutUser,
  UsersState,
} from "../../store/slices/usersSlice";
import "../../../Axe/utils/axe-setup.js";

interface RootState {
  users: UsersState;
}

// Create mock store
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
    },
  };

  return configureStore({
    reducer: {
      users: userReducer,
    },
    preloadedState,
  });
};

describe("Header - Tests d'intégration", () => {
  let store: ReturnType<typeof createTestStore>;
  let spyDispatch: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore(true); // Authenticated by default
    spyDispatch = vi.spyOn(store, "dispatch");
  });

  test("navigates to home page then dispatches logoutUser once there", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/user"]}>
          <Header />
        </MemoryRouter>
      </Provider>,
    );

    const signOutLink = screen.getByText(/Sign Out/i);
    fireEvent.click(signOutLink);

    // logoutUser is deferred until the navigation to "/" has actually
    // landed (see Header.tsx) — asserting it synchronously would be a
    // false negative even when the component behaves correctly.
    await waitFor(() => {
      expect(spyDispatch).toHaveBeenCalledWith(logoutUser());
    });
  });

  test("redirects to home page after logout", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/user"]}>
          <Header />
        </MemoryRouter>
      </Provider>,
    );

    const signOutLink = screen.getByText(/Sign Out/i);
    fireEvent.click(signOutLink);

    await waitFor(() => {
      expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    });
  });

  // Accessibility tests
  describe("Accessibility", () => {
    test("has no accessibility violations when logged out", async () => {
      const { container } = render(
        <Provider store={createTestStore(false)}>
          <MemoryRouter initialEntries={["/user"]}>
            <Header />
          </MemoryRouter>
        </Provider>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("has no accessibility violations when logged in", async () => {
      const { container } = render(
        <Provider store={createTestStore(true)}>
          <MemoryRouter initialEntries={["/user"]}>
            <Header />
          </MemoryRouter>
        </Provider>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
