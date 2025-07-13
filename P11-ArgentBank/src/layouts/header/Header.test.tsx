/** @format */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";
import userReducer, { UsersState } from "../../store/slices/usersSlice";

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

describe("Header", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore(true); // Authenticated by default
  });

  test("displays 'Sign In' link when user is not authenticated", () => {
    store = createTestStore(false);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sign Out/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tony/i)).not.toBeInTheDocument();
  });

  test("displays username and 'Sign Out' link when user is authenticated", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText(/Tony/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sign In/i)).not.toBeInTheDocument();
  });

  test("displays skip links including Site Map", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>,
    );

    // Vérifier que le lien "Skip to main content" est présent
    expect(screen.getByText("Skip to main content")).toBeInTheDocument();

    // Vérifier que le lien "Site Map" est présent en tant que lien skip
    const siteMapLink = screen.getByText("Site Map");
    expect(siteMapLink).toBeInTheDocument();
    expect(siteMapLink.closest("a")).toHaveAttribute("href", "/sitemap");
    expect(siteMapLink.closest("a")).toHaveClass("skip-to-content");
  });
});
