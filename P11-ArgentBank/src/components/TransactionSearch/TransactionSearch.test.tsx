/** @format */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
  });

  it("affiche le champ de recherche et le label", () => {
    render(<TransactionSearch {...defaultProps} />);
    expect(screen.getByLabelText(/filter transactions/i)).toBeInTheDocument();

    const tips = screen.getByText(
      /search by date \(dd\/mm\/yyyy\), amount, description, category or notes/i,
    );
    expect(tips.tagName).toBe("P");
  });

  it("affiche la valeur initiale dans l'input", () => {
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

  it("affiche le bouton clear quand il y a du texte", () => {
    render(
      <TransactionSearch
        {...defaultProps}
        searchParams={{ ...defaultProps.searchParams, searchTerm: "foo" }}
      />,
    );

    const clearBtn = screen.getByLabelText(/clear search/i);
    expect(clearBtn).toBeInTheDocument();
  });

  it("n'affiche pas le bouton clear quand le champ est vide", () => {
    render(<TransactionSearch {...defaultProps} />);

    const clearBtn = screen.queryByLabelText(/clear search/i);
    expect(clearBtn).not.toBeInTheDocument();
  });

  it("affiche le spinner quand isLoading est true", () => {
    render(<TransactionSearch {...defaultProps} isLoading={true} />);
    expect(screen.getByText("⟳")).toBeInTheDocument();
  });

  it("n'affiche pas le spinner quand isLoading est false", () => {
    render(<TransactionSearch {...defaultProps} isLoading={false} />);
    expect(screen.queryByText("⟳")).not.toBeInTheDocument();
  });

  it("affiche le bouton global search quand un compte est sélectionné", () => {
    render(<TransactionSearch {...defaultProps} />);

    const globalBtn = screen.getByRole("button", { name: /global search/i });
    expect(globalBtn).toBeInTheDocument();
  });

  it("n'affiche pas le bouton global search quand aucun compte n'est sélectionné", () => {
    render(<TransactionSearch {...defaultProps} selectedAccount={null} />);

    const globalBtn = screen.queryByRole("button", { name: /global search/i });
    expect(globalBtn).not.toBeInTheDocument();
  });

  it("indique le mode global actif avec aria-pressed", () => {
    render(
      <TransactionSearch
        {...defaultProps}
        searchParams={{
          ...defaultProps.searchParams,
          accountId: undefined, // Mode global
        }}
      />,
    );

    const globalBtn = screen.getByRole("button", {
      name: /global search is active/i,
    });
    expect(globalBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("indique le mode non-global avec aria-pressed", () => {
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
});
