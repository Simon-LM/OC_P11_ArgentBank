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

    // Chercher spécifiquement le titre h1, pas n'importe quel texte "Site Map"
    expect(
      screen.getByRole("heading", { level: 1, name: "Site Map" }),
    ).toBeInTheDocument();
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

    // Chercher spécifiquement les titres de section h2
    expect(
      screen.getByRole("heading", { level: 2, name: "Public Pages" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "User Dashboard" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Navigation & Help" }),
    ).toBeInTheDocument();
  });

  test("displays accessibility guide section", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Sitemap />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText("Accessibility Guide")).toBeInTheDocument();
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

    // Use specific selectors that target only the sitemap navigation
    const sitemapNav = screen.getByRole("navigation", { name: "Site Map" });

    // Test for links within the sitemap navigation only
    // Les liens contiennent à la fois le label et le path
    expect(sitemapNav).toContainElement(
      screen.getByRole("link", { name: /Home\s*\/$/i }),
    );
    expect(sitemapNav).toContainElement(
      screen.getByRole("link", { name: /Sign In\s*\/signin$/i }),
    );
    expect(sitemapNav).toContainElement(
      screen.getByRole("link", { name: /Site Map\s*\/sitemap$/i }),
    );
  });

  test("displays back to home link", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Sitemap />
        </BrowserRouter>
      </Provider>,
    );

    // Test for the specific "Return to Home Page" link text
    expect(
      screen.getByRole("link", { name: "← Return to Home Page" }),
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

      expect(
        screen.getByRole("navigation", { name: "Site Map" }),
      ).toHaveAttribute("aria-label", "Site Map");
      expect(
        screen.getByRole("heading", { level: 2, name: "Accessibility Guide" }),
      ).toHaveAttribute("id", "help-title");
    });
  });
});
