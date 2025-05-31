/** @format */

/**
 * Tests d'intégration pour le composant Header
 *
 * Ces tests couvrent les interactions complexes avec Redux,
 * la navigation, et les tests d'accessibilité.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";
import userReducer, {
  logoutUser,
  UsersState,
} from "../../store/slices/usersSlice";
import "../../../Axe/utils/axe-setup.js";

interface RootState {
  users: UsersState;
}

// Mock useNavigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

  test("dispatches logoutUser and navigates to home page when 'Sign Out' is clicked", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>,
    );

    const signOutLink = screen.getByText(/Sign Out/i);
    fireEvent.click(signOutLink);

    // Verify that logoutUser has been dispatched
    expect(spyDispatch).toHaveBeenCalledWith(logoutUser());

    // Verify that navigate has been called with '/'
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("redirects to home page after logout", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>,
    );

    const signOutLink = screen.getByText(/Sign Out/i);
    fireEvent.click(signOutLink);

    // Verify that navigate has been called with '/'
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // Tests d'accessibilité
  describe("Accessibility", () => {
    test("has no accessibility violations when logged out", async () => {
      const { container } = render(
        <Provider store={createTestStore(false)}>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </Provider>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("has no accessibility violations when logged in", async () => {
      const { container } = render(
        <Provider store={createTestStore(true)}>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </Provider>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
