/** @format */

import React, { useState, useEffect, useRef } from "react";
import { SearchTransactionsParams } from "../../store/slices/usersSlice";
import styles from "./TransactionSearch.module.scss";

interface TransactionSearchProps {
  searchParams: SearchTransactionsParams;
  onSearchChange: (params: Partial<SearchTransactionsParams>) => void;
  isLoading: boolean;
  selectedAccount: {
    id: string;
    accountNumber: string;
    type: string;
  } | null;
  onGlobalSearchToggle?: () => void;
  onNavigateToResults?: () => void;
}

const TransactionSearch: React.FC<TransactionSearchProps> = ({
  searchParams,
  onSearchChange,
  isLoading,
  selectedAccount,
  onGlobalSearchToggle,
  onNavigateToResults,
}) => {
  const [inputValue, setInputValue] = useState(searchParams.searchTerm || "");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    setInputValue(searchParams.searchTerm || "");
  }, [searchParams.searchTerm]);

  const handleSearchChange = (value: string) => {
    setInputValue(value);

    if (searchTimeout) clearTimeout(searchTimeout);

    const timeout = setTimeout(() => {
      onSearchChange({
        searchTerm: value,
        page: 1,
      });
    }, 500);

    setSearchTimeout(timeout);
  };

  const handleGlobalSearchToggle = () => {
    if (onGlobalSearchToggle && isGlobalSearchMode === false) {
      onGlobalSearchToggle();
    } else {
      onSearchChange({
        accountId: searchParams.accountId ? undefined : selectedAccount?.id,
        page: 1,
      });
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  const searchLabel = "Filter transactions";

  const isGlobalSearchMode = !searchParams.accountId;

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      console.log(`Key pressed globally: ${e.key}, Alt: ${e.altKey}`);

      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "r" && !isLoading) {
        e.preventDefault();
        onNavigateToResults?.();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isLoading, onNavigateToResults]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.altKey) {
      return;
    }

    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      onNavigateToResults?.();
    }

    if (e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.blur();
    }

    if (e.key === "ArrowDown" && !e.altKey && !e.ctrlKey) {
      e.preventDefault();

      // const statusElement = document.createElement("div");
      // statusElement.setAttribute("role", "status");
      // statusElement.setAttribute("aria-live", "polite");
      // statusElement.textContent =
      // 	"Quitting search field. Navigating to transaction results.";
      // document.body.appendChild(statusElement);

      // setTimeout(() => {
      onNavigateToResults?.();
      // 	document.body.removeChild(statusElement);
      // }, 100);
    }
  };

  return (
    <div className={styles["transaction-search"]}>
      <label
        htmlFor="transaction-search-input"
        className={styles["transaction-search__label"]}
      >
        {searchLabel}
      </label>

      <p
        className={styles["transaction-search__search-tips"]}
        id="search-formats"
      >
        Search by date (DD/MM/YYYY), amount, description, category or notes
      </p>

      <div className={styles["transaction-search__search-row"]}>
        <div className={styles["transaction-search__container"]}>
          <input
            ref={searchInputRef}
            id="transaction-search-input"
            type="search"
            className={styles["transaction-search__input"]}
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            aria-describedby="search-formats navigation-help  keyboard-shortcuts"
          />

          {inputValue && (
            <button
              type="button"
              className={styles["transaction-search__button"]}
              onClick={() => handleSearchChange("")}
              aria-label="Clear search"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          {isLoading && (
            <div
              className={styles["transaction-search__spinner"]}
              aria-hidden="true"
            >
              ⟳
            </div>
          )}
        </div>

        {selectedAccount && (
          <button
            type="button"
            className={`${styles["transaction-search__global-button"]} ${
              isGlobalSearchMode
                ? styles["transaction-search__global-button--active"]
                : ""
            }`}
            onClick={handleGlobalSearchToggle}
            aria-pressed={isGlobalSearchMode}
            aria-label={
              isGlobalSearchMode
                ? "Global search is active"
                : "Switch to global search"
            }
          >
            Global search
          </button>
        )}
      </div>

      <span
        id="navigation-help"
        className="sr-only"
        data-testid="navigation-help"
      >
        Use Enter to navigate to results.
      </span>

      <p
        className={styles["transaction-search__keyboard-shortcuts"]}
        id="keyboard-shortcuts"
      >
        <small>Shortcuts: Ctrl+Alt+F for search, Ctrl+Alt+R for results</small>
      </p>
    </div>
  );
};

export default TransactionSearch;
