/** @format */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import Sitemap from "./Sitemap";
import userReducer, { UsersState } from "../../store/slices/usersSlice";
import "../../../Axe/utils/axe-setup.js";

interface RootState {
  users: UsersState;
}

// Mock useMatomo
vi.mock("../../hooks/useMatomo/useMatomo", () => ({
  useMatomo: () => ({
    trackPageView: vi.fn(),
  }),
  isMatomoLoaded: () => true,
}));

// Create mock store
const createTestStore = (isAuthenticated = false) => {
  const preloadedState: RootState = {
    users: {
      isAuthenticated,
      currentUser: isAuthenticated
        ? {
            id: "123",
            userName: "TestUser",
            firstName: "Test",
            lastName: "User",
            email: "test@test.com",
            createdAt: "2023-01-01T00:00:00.000Z",
            updatedAt: "2023-01-01T00:00:00.000Z",
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

describe("Sitemap Component", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore(false); // Not authenticated by default
  });

  test("renders sitemap title and description", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Sitemap />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText("Site Map")).toBeInTheDocument();
    expect(
      screen.getByText(/Complete navigation structure of Argent Bank website/i),
    ).toBeInTheDocument();
  });

  test("displays all navigation sections", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Sitemap />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText("Public Pages")).toBeInTheDocument();
    expect(screen.getByText("User Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Navigation & Help")).toBeInTheDocument();
  });

  test("displays navigation help section", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Sitemap />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText("Navigation Help")).toBeInTheDocument();
    expect(screen.getByText("Keyboard Navigation")).toBeInTheDocument();
    expect(screen.getByText("Accessibility Features")).toBeInTheDocument();
  });

  test("shows authentication required for protected pages when not logged in", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Sitemap />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText("(Authentication required)")).toBeInTheDocument();
  });

  test("allows access to protected pages when authenticated", () => {
    store = createTestStore(true); // Authenticated

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Sitemap />
        </BrowserRouter>
      </Provider>,
    );

    // Should not show authentication required message when authenticated
    expect(
      screen.queryByText("(Authentication required)"),
    ).not.toBeInTheDocument();
  });

  test("contains navigation links", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Sitemap />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /site map/i })).toBeInTheDocument();
  });

  test("displays back to home link", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Sitemap />
        </BrowserRouter>
      </Provider>,
    );

    expect(
      screen.getByRole("link", { name: /return to home page/i }),
    ).toBeInTheDocument();
  });

  // Accessibility tests
  describe("Accessibility", () => {
    test("has no accessibility violations", async () => {
      const { container } = render(
        <Provider store={store}>
          <BrowserRouter>
            <Sitemap />
          </BrowserRouter>
        </Provider>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test("has proper ARIA labels and structure", () => {
      render(
        <Provider store={store}>
          <BrowserRouter>
            <Sitemap />
          </BrowserRouter>
        </Provider>,
      );

      expect(screen.getByRole("navigation")).toHaveAttribute(
        "aria-label",
        "Site Map",
      );
      expect(screen.getByText("Navigation Help")).toHaveAttribute(
        "id",
        "help-title",
      );
    });
  });
});
