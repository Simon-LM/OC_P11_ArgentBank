/** @format */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
const mockLocation = { pathname: "/" };

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
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

  test("handles sign out when button is clicked", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>,
    );

    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(signOutButton);

    // Vérifier que la navigation a été appelée
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("logo has correct attributes on home page", () => {
    mockLocation.pathname = "/";

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>,
    );

    const logoLink = screen.getByRole("link", { name: /go to home page/i });

    // Sur la page d'accueil (mockLocation.pathname = "/"), le lien devrait avoir href="/"
    expect(logoLink).toHaveAttribute("href", "/");
    expect(logoLink).toHaveAttribute("aria-current", "page");
  });

  // WCAG 2.5.3 "Label in Name" [A]. The wordmark is an inline <svg> whose
  // <text> renders the literal string "ARGENTBANK", which makes it the
  // link's visible label — aria-hidden hides it from screen readers but
  // does not hide it from someone driving the browser by voice. If the
  // accessible name stopped containing that word, "click ArgentBank" would
  // silently do nothing. Lighthouse reports this one at weight 0, so the
  // accessibility score stays at 100% while the defect is live: this test
  // is the only thing that actually catches it.
  test("the logo link's accessible name contains its visible wordmark", () => {
    mockLocation.pathname = "/";

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>,
    );

    const logoLink = screen.getByRole("link", { name: /go to home page/i });
    const visibleText = logoLink.textContent?.replace(/\s+/g, "") ?? "";
    const accessibleName = logoLink.getAttribute("aria-label") ?? "";

    expect(visibleText).not.toBe("");
    expect(accessibleName.replace(/\s+/g, "").toLowerCase()).toContain(
      visibleText.toLowerCase(),
    );
  });

  test("prevents logo navigation when already on home page", () => {
    mockLocation.pathname = "/";

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>,
    );

    const logoLink = screen.getByRole("link", { name: /go to home page/i });
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });

    logoLink.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
  });

  test("logo points to the relative home link away from home page", () => {
    mockLocation.pathname = "/user";

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>,
    );

    const logoLink = screen.getByRole("link", { name: /go to home page/i });

    expect(logoLink).toHaveAttribute("href", "./");
    expect(logoLink).not.toHaveAttribute("aria-current");
  });
});
