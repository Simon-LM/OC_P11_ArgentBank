/** @format */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TransactionSearch from "./TransactionSearch";

const defaultProps = {
  searchParams: { searchTerm: "", accountId: "acc1", page: 1 },
  onSearchChange: vi.fn(),
  isLoading: false,
  selectedAccount: { id: "acc1", accountNumber: "1234", type: "Checking" },
  onGlobalSearchToggle: vi.fn(),
  onNavigateToResults: vi.fn(),
};

describe("TransactionSearch - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("displays search field and label", () => {
    render(<TransactionSearch {...defaultProps} />);
    expect(screen.getByLabelText(/filter transactions/i)).toBeInTheDocument();

    const tips = screen.getByText(
      /search by date \(dd\/mm\/yyyy\), amount, description, category or notes/i,
    );
    expect(tips.tagName).toBe("P");
  });

  it("displays initial value in input", () => {
    render(
      <TransactionSearch
        {...defaultProps}
        searchParams={{
          ...defaultProps.searchParams,
          searchTerm: "test initial",
        }}
      />,
    );

    const input = screen.getByLabelText(/filter transactions/i);
    expect(input).toHaveValue("test initial");
  });

  it("displays clear button when there is text", () => {
    render(
      <TransactionSearch
        {...defaultProps}
        searchParams={{ ...defaultProps.searchParams, searchTerm: "foo" }}
      />,
    );

    const clearBtn = screen.getByLabelText(/clear search/i);
    expect(clearBtn).toBeInTheDocument();
  });

  it("does not display clear button when field is empty", () => {
    render(<TransactionSearch {...defaultProps} />);

    const clearBtn = screen.queryByLabelText(/clear search/i);
    expect(clearBtn).not.toBeInTheDocument();
  });

  it("displays spinner when isLoading is true", () => {
    render(<TransactionSearch {...defaultProps} isLoading={true} />);
    expect(screen.getByText("⟳")).toBeInTheDocument();
  });

  it("does not display spinner when isLoading is false", () => {
    render(<TransactionSearch {...defaultProps} isLoading={false} />);
    expect(screen.queryByText("⟳")).not.toBeInTheDocument();
  });

  it("displays global search button when an account is selected", () => {
    render(<TransactionSearch {...defaultProps} />);

    const globalBtn = screen.getByRole("button", { name: /global search/i });
    expect(globalBtn).toBeInTheDocument();
  });

  it("does not display global search button when no account is selected", () => {
    render(<TransactionSearch {...defaultProps} selectedAccount={null} />);

    const globalBtn = screen.queryByRole("button", { name: /global search/i });
    expect(globalBtn).not.toBeInTheDocument();
  });

  it("indicates active global mode with aria-pressed", () => {
    render(
      <TransactionSearch
        {...defaultProps}
        searchParams={{
          ...defaultProps.searchParams,
          accountId: undefined, // Global mode
        }}
      />,
    );

    const globalBtn = screen.getByRole("button", {
      name: /global search is active/i,
    });
    expect(globalBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("indicates non-global mode with aria-pressed", () => {
    render(
      <TransactionSearch
        {...defaultProps}
        searchParams={{
          ...defaultProps.searchParams,
          accountId: "acc1", // Mode non-global
        }}
      />,
    );

    const globalBtn = screen.getByRole("button", {
      name: /switch to global search/i,
    });
    expect(globalBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("affiche les instructions d'accessibilité", () => {
    render(<TransactionSearch {...defaultProps} />);

    const keyboardNav = screen.getByTestId("navigation-help");
    expect(keyboardNav).toBeInTheDocument();
    expect(keyboardNav).toHaveClass("sr-only");
    expect(keyboardNav.textContent).toMatch(
      /Use Enter to navigate to results/i,
    );

    const input = screen.getByLabelText(/filter transactions/i);
    expect(input).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining("search-formats"),
    );
  });

  it("affiche les raccourcis clavier dans l'aide", () => {
    render(<TransactionSearch {...defaultProps} />);

    const shortcuts = screen.getByText(
      /Shortcuts: ctrl\+alt\+f for search, ctrl\+alt\+r for results/i,
    );
    expect(shortcuts.tagName).toBe("SMALL");
  });

  it("debounces search changes and resets pagination", () => {
    vi.useFakeTimers();
    render(<TransactionSearch {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/filter transactions/i), {
      target: { value: "salary" },
    });

    expect(defaultProps.onSearchChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith({
      searchTerm: "salary",
      page: 1,
    });
  });

  it("clears a search term from the clear button", () => {
    vi.useFakeTimers();
    render(
      <TransactionSearch
        {...defaultProps}
        searchParams={{ ...defaultProps.searchParams, searchTerm: "rent" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /clear search/i }));
    vi.advanceTimersByTime(500);

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith({
      searchTerm: "",
      page: 1,
    });
  });

  it("uses the optional global toggle when switching from account mode", () => {
    render(<TransactionSearch {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /switch to global/i }));

    expect(defaultProps.onGlobalSearchToggle).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSearchChange).not.toHaveBeenCalled();
  });

  it("falls back to search params when no optional global toggle is provided", () => {
    render(
      <TransactionSearch {...defaultProps} onGlobalSearchToggle={undefined} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /switch to global/i }));

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith({
      accountId: undefined,
      page: 1,
    });
  });

  it("restores the selected account when leaving global mode", () => {
    render(
      <TransactionSearch
        {...defaultProps}
        searchParams={{ ...defaultProps.searchParams, accountId: undefined }}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /global search is active/i }),
    );

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith({
      accountId: "acc1",
      page: 1,
    });
  });

  it("supports keyboard navigation from the input", () => {
    render(<TransactionSearch {...defaultProps} />);

    const input = screen.getByLabelText(/filter transactions/i);
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(defaultProps.onNavigateToResults).toHaveBeenCalledTimes(2);
  });

  it("ignores alt-modified input shortcuts", () => {
    render(<TransactionSearch {...defaultProps} />);

    fireEvent.keyDown(screen.getByLabelText(/filter transactions/i), {
      key: "Enter",
      altKey: true,
    });

    expect(defaultProps.onNavigateToResults).not.toHaveBeenCalled();
  });

  it("blurs the input with Escape", () => {
    render(<TransactionSearch {...defaultProps} />);

    const input = screen.getByLabelText(/filter transactions/i);
    input.focus();
    fireEvent.keyDown(input, { key: "Escape" });

    expect(input).not.toHaveFocus();
  });

  it("handles global keyboard shortcuts", () => {
    render(<TransactionSearch {...defaultProps} />);

    const input = screen.getByLabelText(/filter transactions/i);
    fireEvent.keyDown(document, { key: "f", ctrlKey: true, altKey: true });
    fireEvent.keyDown(document, { key: "r", ctrlKey: true, altKey: true });

    expect(input).toHaveFocus();
    expect(defaultProps.onNavigateToResults).toHaveBeenCalledTimes(1);
  });

  it("does not navigate to results from the global shortcut while loading", () => {
    render(<TransactionSearch {...defaultProps} isLoading={true} />);

    fireEvent.keyDown(document, { key: "r", ctrlKey: true, altKey: true });

    expect(defaultProps.onNavigateToResults).not.toHaveBeenCalled();
  });
});
