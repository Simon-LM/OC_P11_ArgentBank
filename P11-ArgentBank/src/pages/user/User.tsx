/** @format */

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import user from "./user.module.scss";
import classNames from "classnames";
import EditUserForm from "../../components/EditUserForm/EditUserForm";
import {
  updateCurrentUser,
  fetchTransactions,
  fetchAccounts,
  selectAccount,
  searchTransactions,
  SearchTransactionsParams,
} from "../../store/slices/usersSlice";
import { updateUserProfile } from "../../utils/authService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { TransactionType } from "../../types/transaction";
import TransactionSearch, {
  TransactionSearchRef,
} from "../../components/TransactionSearch/TransactionSearch";
import { useMatomo, isMatomoLoaded } from "../../hooks/useMatomo/useMatomo";

const User: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const transactionHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const [actionFeedback, setActionFeedback] = useState("");
  const { trackEvent, trackPageView } = useMatomo();
  const tableHeadingRef = useRef<HTMLTableElement | null>(null);
  const transactionSearchRef = useRef<TransactionSearchRef>(null);

  const { searchResults, pagination, searchStatus, searchError } = useSelector(
    (state: RootState) => ({
      searchResults: state.users.searchResults || [],
      pagination: state.users.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      },
      searchStatus: state.users.searchStatus,
      searchError: state.users.searchError,
    }),
  );

  const {
    currentUser,
    isAuthenticated,
    accounts,
    accountsStatus,
    accountsError,
    selectedAccountId,
    // transactions,
    transactionsStatus,
    // transactionsError,
  } = useSelector((state: RootState) => state.users);

  const [searchParams, setSearchParams] = useState<SearchTransactionsParams>({
    accountId: selectedAccountId || undefined,
    page: 1,
    limit: 10,
    sortBy: "date",
    sortOrder: "desc",
  });

  const handleSearch = useCallback(() => {
    dispatch(searchTransactions(searchParams));
  }, [dispatch, searchParams]);

  useEffect(() => {
    const trackingDelay = setTimeout(() => {
      if (isMatomoLoaded()) {
        const pageTitle = "Argent Bank - User Dashboard";
        document.title = pageTitle;

        const normalizedPath = "/user";
        const fullUrl = window.location.origin + normalizedPath;

        window._paq.push([
          "setReferrerUrl",
          window.location.origin + "/signin",
        ]);
        window._paq.push(["setCustomUrl", fullUrl]);
        window._paq.push(["setDocumentTitle", pageTitle]);

        window._paq.push(["deleteCookies"]);
        window._paq.push(["setPagePerformanceTiming", 0]);
        window._paq.push(["trackPageView"]);

        trackPageView({
          documentTitle: pageTitle,
          href: fullUrl,
        });
      }
    }, 2000);

    return () => clearTimeout(trackingDelay);
  }, [trackEvent, trackPageView]);

  useEffect(() => {
    if (isAuthenticated) {
      if (accountsStatus === "idle") {
        dispatch(fetchAccounts());
      }
      if (transactionsStatus === "idle") {
        dispatch(fetchTransactions());
      }
    }
  }, [dispatch, isAuthenticated, accountsStatus, transactionsStatus]);

  useEffect(() => {
    // Only on initialization
    if (searchStatus === "idle") {
      if (
        isAuthenticated ||
        (accounts.length > 0 && !searchParams.searchTerm)
      ) {
        handleSearch();
      }
    }
  }, [
    searchStatus,
    isAuthenticated,
    accounts,
    searchParams.searchTerm,
    handleSearch,
  ]);

  useEffect(() => {
    if (searchStatus !== "idle" && searchStatus !== "loading") {
      handleSearch();
    }
    //   eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, handleSearch]);

  useEffect(() => {
    if (selectedAccountId !== searchParams.accountId) {
      setSearchParams((prev) => ({
        ...prev,
        accountId: selectedAccountId || undefined,
        page: 1,
      }));

      // Update browser URL
      const newUrl = new URL(window.location.href);
      if (selectedAccountId) {
        newUrl.searchParams.set("accountId", selectedAccountId);
      } else {
        // If selectedAccountId is null/undefined (e.g., "All transactions"), remove it from URL
        newUrl.searchParams.delete("accountId");
      }
      // Use replaceState to avoid adding to browser history for simple filter changes
      window.history.replaceState({ path: newUrl.href }, "", newUrl.href);
    }
  }, [selectedAccountId, searchParams.accountId]);

  useEffect(() => {
    // Update browser URL when search term changes
    const newUrl = new URL(window.location.href);
    if (searchParams.searchTerm) {
      newUrl.searchParams.set("searchTerm", searchParams.searchTerm);
    } else {
      newUrl.searchParams.delete("searchTerm");
    }
    window.history.replaceState({ path: newUrl.href }, "", newUrl.href);
  }, [searchParams.searchTerm]);

  useEffect(() => {
    // Update browser URL when page changes
    const newUrl = new URL(window.location.href);
    if (searchParams.page && searchParams.page > 1) {
      newUrl.searchParams.set("page", searchParams.page.toString());
    } else {
      newUrl.searchParams.delete("page");
    }
    window.history.replaceState({ path: newUrl.href }, "", newUrl.href);
  }, [searchParams.page]);

  useEffect(() => {
    if (transactionHeadingRef.current && selectedAccountId) {
      const focusTimeout = setTimeout(() => {
        transactionHeadingRef.current?.focus();
      }, 100);

      return () => clearTimeout(focusTimeout);
    }
  }, [selectedAccountId]);

  const handleSave = async (data: { userName: string }) => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found.");
      return;
    }
    try {
      const updatedUser = await updateUserProfile(data.userName, token);
      dispatch(updateCurrentUser({ userName: updatedUser.userName }));
      setIsEditing(false);

      trackEvent({
        category: "Profile",
        action: "Update",
        name: "Username updated",
      });
    } catch (error) {
      console.error("Failed to update user profile:", error);
    }
  };

  const handleAccountSelect = (accountId: string) => {
    dispatch(selectAccount(accountId));
    const selectedAcc = accounts.find((acc) => acc.id === accountId);

    if (selectedAcc) {
      setActionFeedback(
        `Account ${selectedAcc.type} selected. Transactions filtered.`,
      );

      setTimeout(() => setActionFeedback(""), 5000);
    }

    trackEvent({
      category: "Account",
      action: "Select",
      name: selectedAcc?.type || "Unknown account",
    });
  };

  const handlePageChange = (pageNumber: number) => {
    setSearchParams((prev) => ({
      ...prev,
      page: pageNumber,
    }));
  };

  const handlePreviousPage = () => {
    if (pagination && pagination.page > 1) {
      setSearchParams((prev) => ({
        ...prev,
        page: prev.page ? prev.page - 1 : 1,
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination && pagination.page < pagination.pages) {
      setSearchParams((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= (pagination?.pages || 1); i++) {
    pageNumbers.push(i);
  }

  const selectedAccount = selectedAccountId
    ? accounts.find((acc) => acc.id === selectedAccountId) || null
    : null;

  const navigateToSearchResults = () => {
    if (tableHeadingRef.current) {
      // First announce the number of transactions
      setActionFeedback(
        `${searchResults.length} transaction${searchResults.length !== 1 ? "s" : ""} found. Use arrow keys to navigate.`,
      );

      // Then move focus after a delay to allow the announcement
      setTimeout(() => {
        tableHeadingRef.current?.focus();
      }, 300);

      setTimeout(() => setActionFeedback(""), 5000);
    }
  };

  const handleAccountKeyNavigation = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (index === accounts.length - 1 && e.key === "ArrowDown") {
      e.preventDefault();
      transactionHeadingRef.current?.focus();
    }

    if (index === 0 && e.key === "ArrowUp") {
      e.preventDefault();
      const editButton = document.querySelector(
        `.${user["user__edit-button"]}`,
      );
      if (editButton instanceof HTMLElement) {
        editButton.focus();
      }
    }
  };

  return (
    <>
      <div className={user["user-page"]}>
        {/* --- Home and Edit Section --- */}

        {isAuthenticated && currentUser ? (
          <>
            <h2 className={user["user__title"]}>
              <span>Welcome back</span>
              {currentUser && ( // Show name only if currentUser exists
                <span className={user["user__title-name"]}>
                  {`${currentUser.firstName} ${currentUser.lastName}!`}
                </span>
              )}
            </h2>

            {/* Test element for Pa11y - intentional poor contrast */}
            {/* <div
							style={{
								color: "#ccc",
								backgroundColor: "#ddd",
								padding: "10px",
								margin: "10px 0",
							}}>
							This text has poor contrast for Pa11y testing
						</div> */}

            <div>
              {isEditing ? (
                <EditUserForm
                  currentUser={currentUser}
                  onSave={handleSave}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <button
                  className={user["user__edit-button"]}
                  onClick={() => setIsEditing(true)}
                >
                  Edit User
                </button>
              )}
            </div>

            {/* --- Accounts Section --- */}

            <section aria-labelledby="accounts-heading">
              <h2 id="accounts-heading" className={user["section__heading"]}>
                {accounts.length === 0
                  ? "You have no accounts"
                  : `Your ${accounts.length} ${accounts.length === 1 ? "Account" : "Accounts"}`}
              </h2>

              {accountsStatus === "loading" && <p>Loading accounts...</p>}
              {accountsStatus === "failed" && (
                <p className={user["user__error"]}>
                  Error loading accounts: {accountsError}
                </p>
              )}

              {accountsStatus === "succeeded" && (
                <ul
                  className={user["accounts-list"]}
                  aria-label="Available banking accounts"
                  role="list"
                >
                  {accounts.map((account, index) => (
                    <li
                      role="listitem"
                      key={account.id}
                      className={user["accounts-list__item"]}
                    >
                      <button
                        className={classNames(user["account"], {
                          [user["account--selected"]]:
                            account.id === selectedAccountId,
                        })}
                        onClick={() => handleAccountSelect(account.id)}
                        aria-pressed={account.id === selectedAccountId}
                        onKeyDown={(e) => handleAccountKeyNavigation(e, index)}
                        aria-label={
                          `Account ${index + 1} of ${accounts.length}. ` +
                          `${account.type} account, number x${account.accountNumber}, ` +
                          `Available Balance: €${account.balance.toFixed(2)}. ` +
                          (account.id === selectedAccountId ? "Selected." : "")
                        }
                      >
                        {account.id === selectedAccountId && (
                          <span className={user["account__selected-tag"]}>
                            Selected
                          </span>
                        )}

                        <div className={user["account__content"]}>
                          <div>
                            <h3
                              className={user["account__title"]}
                              aria-hidden="true"
                            >
                              {account.type} (x{account.accountNumber})
                            </h3>
                            <p
                              className={user["account__amount"]}
                              aria-hidden="true"
                            >
                              €{account.balance.toFixed(2)}
                            </p>
                            <p
                              className={user["account__description"]}
                              aria-hidden="true"
                            >
                              Available Balance
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {actionFeedback && (
                <div className="sr-only" role="status" aria-live="polite">
                  {actionFeedback}
                </div>
              )}
            </section>

            {/* --- Transactions Section --- */}
            <>
              <section aria-labelledby="transactions-heading">
                <h2
                  id="transactions-heading"
                  className={user["section__heading"]}
                  ref={transactionHeadingRef}
                  tabIndex={-1}
                >
                  {selectedAccount ? "Transaction History" : "All Transactions"}
                  {selectedAccount && (
                    <span className={user["section__subheading"]}>
                      Account #{selectedAccount.accountNumber}
                    </span>
                  )}
                </h2>

                <TransactionSearch
                  ref={transactionSearchRef}
                  searchParams={searchParams}
                  onSearchChange={(newParams) => {
                    setSearchParams((prev) => ({
                      ...prev,
                      ...newParams,
                    }));
                  }}
                  isLoading={searchStatus === "loading"}
                  selectedAccount={selectedAccount}
                  onGlobalSearchToggle={() => {
                    dispatch(selectAccount(null));
                    setSearchParams((prev) => ({
                      ...prev,
                      accountId: undefined,
                      page: 1,
                    }));
                    setActionFeedback(
                      "Global search activated. Showing transactions from all accounts.",
                    );
                    setTimeout(() => setActionFeedback(""), 5000);

                    // Navigate to results if transactions exist, otherwise focus search input
                    setTimeout(() => {
                      if (searchResults.length > 0) {
                        navigateToSearchResults();
                      } else {
                        // Focus back to search input if no results found
                        transactionSearchRef.current?.focusSearchInput();
                      }
                    }, 200);
                  }}
                  onNavigateToResults={navigateToSearchResults}
                />

                {searchStatus === "loading" && <p>Searching transactions...</p>}
                {searchStatus === "failed" && (
                  <p className={user["user__error"]}>
                    Error searching transactions: {searchError}
                  </p>
                )}

                {searchStatus === "succeeded" && (
                  <>
                    {/* Display transactions for the current page */}
                    {searchResults.length === 0 ? (
                      <p role="status" aria-live="polite">
                        {selectedAccountId
                          ? "No transactions found for this account."
                          : "No transactions found."}
                      </p>
                    ) : (
                      <table
                        className={user["transaction-table"]}
                        ref={tableHeadingRef}
                        tabIndex={-1}
                      >
                        <caption className="sr-only">
                          {selectedAccount
                            ? `${searchResults.length} transaction${searchResults.length !== 1 ? "s" : ""} found for ${selectedAccount.type} account ending in ${selectedAccount.accountNumber}.`
                            : `${searchResults.length} transaction${searchResults.length !== 1 ? "s" : ""} found across all accounts.`}
                        </caption>
                        <thead className="sr-only">
                          <tr>
                            <th scope="col">Transaction Description</th>
                            <th scope="col">Date and Category</th>
                            <th scope="col">Amount</th>
                            <th scope="col">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((tx) => (
                            <tr className={user["transaction-row"]} key={tx.id}>
                              <td className={user["transaction-row__cell"]}>
                                <span
                                  className={user["transaction-row__title"]}
                                >
                                  {tx.description}
                                </span>
                              </td>
                              <td className={user["transaction-row__cell"]}>
                                <p className={user["transaction-row__meta"]}>
                                  <span
                                    aria-label={`Date: ${new Date(tx.date).toLocaleDateString()}`}
                                  >
                                    {new Date(tx.date).toLocaleDateString()}
                                  </span>
                                  {tx.category && (
                                    <span
                                      className={
                                        user["transaction-row__category-tag"]
                                      }
                                      aria-label={`Category: ${tx.category}`}
                                    >
                                      {tx.category}
                                    </span>
                                  )}
                                </p>
                              </td>
                              <td
                                className={classNames(
                                  user["transaction-row__cell"],
                                  {
                                    [user[
                                      "transaction-row__cell--amount-credit"
                                    ]]: tx.type === TransactionType.CREDIT,
                                    [user[
                                      "transaction-row__cell--amount-debit"
                                    ]]: tx.type === TransactionType.DEBIT,
                                  },
                                )}
                              >
                                <span
                                  className={user["transaction-row__amount"]}
                                  aria-label={`${tx.type === TransactionType.CREDIT ? "Crédit de" : "Débit de"} ${tx.amount.toFixed(2)} euros`}
                                >
                                  {tx.type === TransactionType.CREDIT
                                    ? `+${tx.amount.toFixed(2)} €`
                                    : `-${tx.amount.toFixed(2)} €`}
                                </span>
                              </td>
                              <td className={user["transaction-row__cell"]}>
                                {tx.notes && (
                                  <p className={user["transaction-row__note"]}>
                                    {tx.notes}
                                  </p>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* --- Pagination Controls --- */}
                    {pagination.pages > 1 && (
                      <nav
                        className={user["pagination__nav"]}
                        aria-label="Transaction pagination"
                      >
                        <div className={user["pagination__arrow--prev"]}>
                          <button
                            onClick={handlePreviousPage}
                            disabled={pagination.page === 1}
                            className={user["pagination__button"]}
                            aria-label="Go to previous page"
                          >
                            <FaChevronLeft />
                          </button>
                        </div>

                        <div className={user["pagination__numbers"]}>
                          {/* Show only a few pages in the middle if too many */}
                          {pageNumbers.length <= 7 ? (
                            // Show all pages if 7 or fewer
                            pageNumbers.map((number) => (
                              <button
                                key={number}
                                onClick={() => handlePageChange(number)}
                                className={classNames(
                                  user["pagination__button"],
                                  {
                                    [user["pagination__button--current"]]:
                                      pagination.page === number,
                                  },
                                )}
                                aria-current={
                                  pagination.page === number
                                    ? "page"
                                    : undefined
                                }
                                aria-label={`Go to page ${number}`}
                              >
                                {number}
                              </button>
                            ))
                          ) : (
                            // Smart pagination for many pages
                            <>
                              {/* First page always visible */}
                              <button
                                onClick={() => handlePageChange(1)}
                                className={classNames(
                                  user["pagination__button"],
                                  {
                                    [user["pagination__button--current"]]:
                                      pagination.page === 1,
                                  },
                                )}
                                aria-current={
                                  pagination.page === 1 ? "page" : undefined
                                }
                                aria-label="Go to page 1"
                              >
                                1
                              </button>

                              {/* Ellipsis if needed */}
                              {pagination.page > 3 && (
                                <span className={user["pagination__ellipsis"]}>
                                  ...
                                </span>
                              )}

                              {/* Pages around current page */}
                              {pageNumbers
                                .filter(
                                  (num) =>
                                    num !== 1 &&
                                    num !== pagination.pages &&
                                    num >= pagination.page - 1 &&
                                    num <= pagination.page + 1,
                                )
                                .map((number) => (
                                  <button
                                    key={number}
                                    onClick={() => handlePageChange(number)}
                                    className={classNames(
                                      user["pagination__button"],
                                      {
                                        [user["pagination__button--current"]]:
                                          pagination.page === number,
                                      },
                                    )}
                                    aria-current={
                                      pagination.page === number
                                        ? "page"
                                        : undefined
                                    }
                                    aria-label={`Go to page ${number}`}
                                  >
                                    {number}
                                  </button>
                                ))}

                              {/* Ellipsis if needed */}
                              {pagination.page < pagination.pages - 2 && (
                                <span
                                  className={user["pagination__ellipsis"]}
                                  aria-label="Pages omitted for brevity"
                                >
                                  ...
                                </span>
                              )}

                              {/* Last page always visible */}
                              <button
                                onClick={() =>
                                  handlePageChange(pagination.pages)
                                }
                                className={classNames(
                                  user["pagination__button"],
                                  {
                                    [user["pagination__button--current"]]:
                                      pagination.page === pagination.pages,
                                  },
                                )}
                                aria-current={
                                  pagination.page === pagination.pages
                                    ? "page"
                                    : undefined
                                }
                                aria-label={`Go to page ${pagination.pages}`}
                              >
                                {pagination.pages}
                              </button>
                            </>
                          )}
                        </div>

                        <div className={user["pagination__arrow--next"]}>
                          <button
                            onClick={handleNextPage}
                            disabled={pagination.page >= pagination.pages}
                            className={user["pagination__button"]}
                            aria-label="Go to next page"
                          >
                            <FaChevronRight />
                          </button>
                        </div>
                      </nav>
                    )}
                  </>
                )}
              </section>
            </>
          </>
        ) : (
          <p>Loading user information...</p>
        )}
      </div>
    </>
  );
};

export default User;
