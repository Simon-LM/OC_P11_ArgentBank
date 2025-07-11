/** @format */

/**
 * Integration tests for TransactionSearch
 *
 * Integration scope tested:
 * - Timer and debouncing management (setTimeout)
 * - Global keyboard events (document.addEventListener)
 * - Complex user interactions (fireEvent + act)
 * - Integrations with external callbacks
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import TransactionSearch from "./TransactionSearch";

const defaultProps = {
  searchParams: { searchTerm: "", accountId: "acc1", page: 1 },
  onSearchChange: vi.fn(),
  isLoading: false,
  selectedAccount: { id: "acc1", accountNumber: "1234", type: "Checking" },
  onGlobalSearchToggle: vi.fn(),
  onNavigateToResults: vi.fn(),
};

describe("TransactionSearch - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("met à jour la valeur de l'input et déclenche onSearchChange après délai", async () => {
    vi.useFakeTimers();
    render(<TransactionSearch {...defaultProps} />);
    const input = screen.getByLabelText(/filter transactions/i);
    fireEvent.change(input, { target: { value: "test" } });
    expect(input).toHaveValue("test");
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith({
      searchTerm: "test",
      page: 1,
    });
    vi.useRealTimers();
  });

  it("affiche le bouton clear quand il y a du texte et le réinitialise", () => {
    vi.useFakeTimers();
    render(
      <TransactionSearch
        {...defaultProps}
        searchParams={{ ...defaultProps.searchParams, searchTerm: "foo" }}
      />,
    );
    const clearBtn = screen.getByLabelText(/clear search/i);
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith({
      searchTerm: "",
      page: 1,
    });
    vi.useRealTimers();
  });

  it("affiche le bouton global search et gère le mode global", () => {
    // Force "non-global" mode so the button triggers the callback
    render(
      <TransactionSearch
        {...defaultProps}
        searchParams={{
          ...defaultProps.searchParams,
          accountId: "acc1",
          searchTerm: "",
          page: 1,
        }}
      />,
    );
    const globalBtn = screen.getByRole("button", { name: /global search/i });
    expect(globalBtn).toBeInTheDocument();
    fireEvent.click(globalBtn);
    expect(defaultProps.onGlobalSearchToggle).toHaveBeenCalled();
  });

  it("gère le raccourci clavier Ctrl+Alt+F pour focus input", () => {
    render(<TransactionSearch {...defaultProps} />);
    const input = screen.getByLabelText(/filter transactions/i);
    expect(document.activeElement).not.toBe(input);
    act(() => {
      fireEvent.keyDown(document, { key: "f", ctrlKey: true, altKey: true });
    });
    expect(document.activeElement).toBe(input);
  });

  it("gère le raccourci clavier Ctrl+Alt+R pour naviguer vers les résultats", () => {
    render(<TransactionSearch {...defaultProps} />);
    act(() => {
      fireEvent.keyDown(document, { key: "r", ctrlKey: true, altKey: true });
    });
    expect(defaultProps.onNavigateToResults).toHaveBeenCalled();
  });

  it("navigue vers les résultats avec Entrée dans l'input", () => {
    render(<TransactionSearch {...defaultProps} />);
    const input = screen.getByLabelText(/filter transactions/i);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(defaultProps.onNavigateToResults).toHaveBeenCalled();
  });

  it("blur l'input avec Escape", () => {
    render(<TransactionSearch {...defaultProps} />);
    const input = screen.getByLabelText(/filter transactions/i);
    input.focus();
    expect(document.activeElement).toBe(input);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(document.activeElement).not.toBe(input);
  });
});
