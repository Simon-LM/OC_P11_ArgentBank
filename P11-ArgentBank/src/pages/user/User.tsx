/** @format */

import React, { useEffect, useState } from "react";
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
} from "../../store/slices/usersSlice";
import { updateUserProfile } from "../../utils/authService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import { TransactionType } from "@prisma/client";
import { TransactionType } from "../../types/transaction";

const User: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [isEditing, setIsEditing] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const transactionsPerPage = 10;
	const transactionHeadingRef = React.useRef<HTMLHeadingElement>(null);
	const [actionFeedback, setActionFeedback] = useState("");

	const {
		currentUser,
		isAuthenticated,
		accounts,
		accountsStatus,
		accountsError,
		selectedAccountId,
		transactions,
		transactionsStatus,
		transactionsError,
	} = useSelector((state: RootState) => state.users);

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
		setCurrentPage(1);
	}, [selectedAccountId]);

	useEffect(() => {
		if (transactionHeadingRef.current && selectedAccountId) {
			setTimeout(() => {
				transactionHeadingRef.current?.focus();
			}, 100);
		}
	}, [selectedAccountId]);

	if (!currentUser) {
		return <p>Loading user data...</p>;
	}

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
		} catch (error) {
			console.error("Failed to update user profile:", error);
		}
	};

	const filteredTransactions =
		transactionsStatus === "succeeded"
			? selectedAccountId
				? transactions.filter((tx) => tx.accountId === selectedAccountId)
				: transactions
			: [];

	const indexOfLastTransaction = currentPage * transactionsPerPage;
	const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
	const currentTransactions = filteredTransactions.slice(
		indexOfFirstTransaction,
		indexOfLastTransaction
	);

	const handleAccountSelect = (accountId: string) => {
		dispatch(selectAccount(accountId));
		const selectedAcc = accounts.find((acc) => acc.id === accountId);

		if (selectedAcc) {
			setActionFeedback(
				`Account ${selectedAcc.type} selected. Transactions filtered.`
			);

			setTimeout(() => setActionFeedback(""), 5000);
		}
	};

	const totalPages = Math.ceil(
		filteredTransactions.length / transactionsPerPage
	);

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const handlePreviousPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	};

	const pageNumbers = [];
	for (let i = 1; i <= totalPages; i++) {
		pageNumbers.push(i);
	}

	return (
		<>
			<main className={user["user-page"]}>
				{/* --- Section Accueil et Édition --- */}
				<div>
					<h2 className={user["user__title"]}>
						Welcome back
						<br />
						{currentUser.firstName} {currentUser.lastName} !
					</h2>
					{isEditing ? (
						<EditUserForm
							currentUser={currentUser}
							onSave={handleSave}
							onCancel={() => setIsEditing(false)}
						/>
					) : (
						<button
							className={user["user__edit-button"]}
							onClick={() => setIsEditing(true)}>
							Edit Name
						</button>
					)}
				</div>

				{/* --- Section Comptes --- */}
				<section aria-labelledby="accounts-heading">
					<h2 id="accounts-heading" className={user["section__heading"]}>
						Your Accounts
					</h2>
					{accountsStatus === "loading" && <p>Loading accounts...</p>}
					{accountsStatus === "failed" && (
						<p className={user["user__error"]}>
							Error loading accounts: {accountsError}
						</p>
					)}
					{accountsStatus === "succeeded" &&
						accounts.map((account) => (
							<button
								className={classNames(user["account"], {
									[user["account--selected"]]: account.id === selectedAccountId,
								})}
								key={account.id}
								// onClick={() => dispatch(selectAccount(account.id))}
								onClick={() => handleAccountSelect(account.id)}
								style={{ cursor: "pointer" }}>
								<div className={user["account__content"]}>
									<h3 className={user["account__title"]}>
										{account.type} (x{account.accountNumber})
									</h3>
									<p className={user["account__amount"]}>
										€{account.balance.toFixed(2)}
									</p>
									<p className={user["account__description"]}>
										Available Balance
									</p>
								</div>
								<div className={classNames(user["account__content"])}></div>

								<span className="sr-only" id={`account-${account.id}-desc`}>
									Selecting this account will filter transactions to show only
									those related to this account.
								</span>
							</button>
						))}
					{actionFeedback && (
						<div className="sr-only" role="status" aria-live="polite">
							{actionFeedback}
						</div>
					)}
				</section>

				{/* --- Section Transactions --- */}
				<>
					{/* <h2 className="sr-only">Transactions for selected account</h2> */}
					{/* <h2 className={user["section__heading"]}>Your Transactions</h2> */}
					<section aria-labelledby="transactions-heading">
						<h2
							id="transactions-heading"
							className={user["section__heading"]}
							ref={transactionHeadingRef}
							tabIndex={-1}
							aria-live="polite">
							{selectedAccountId
								? `Transactions for ${accounts.find((acc) => acc.id === selectedAccountId)?.type} (x${accounts.find((acc) => acc.id === selectedAccountId)?.accountNumber})`
								: "All Account Transactions"}
						</h2>

						{transactionsStatus === "loading" && <p>Loading transactions...</p>}
						{transactionsStatus === "failed" && (
							<p className={user["user__error"]}>
								Error loading transactions: {transactionsError}
							</p>
						)}
						{transactionsStatus === "succeeded" && (
							<>
								{/* Afficher les transactions de la page actuelle */}

								{currentTransactions.length === 0 ? (
									<p>
										{selectedAccountId
											? "No transactions found for this account."
											: "No transactions found."}
									</p>
								) : (
									<table
										className={user["transaction-table"]}
										aria-label="Transaction history">
										<caption className="sr-only">
											Details of your account transactions
										</caption>
										<thead className="sr-only">
											<tr>{/* En-têtes inchangés */}</tr>
										</thead>
										<tbody>
											{currentTransactions.map((tx) => (
												<tr className={user["transaction-row"]} key={tx.id}>
													<td className={user["transaction-row__cell"]}>
														<h3 className={user["transaction-row__title"]}>
															{tx.description}
														</h3>
													</td>
													<td className={user["transaction-row__cell"]}>
														{/* <p className={user["transaction-row__meta"]}>
															{new Date(tx.date).toLocaleDateString()} -{" "}
															{tx.category}
														</p> */}

														<p className={user["transaction-row__meta"]}>
															{new Date(tx.date).toLocaleDateString()}
															{tx.category && (
																<span
																	className={
																		user["transaction-row__category-tag"]
																	}>
																	{tx.category}
																</span>
															)}
														</p>
													</td>
													<td
														className={classNames(
															user["transaction-row__cell"],
															{
																[user["transaction-row__cell--amount-credit"]]:
																	tx.type === TransactionType.CREDIT,
																[user["transaction-row__cell--amount-debit"]]:
																	tx.type === TransactionType.DEBIT,
															}
														)}>
														<span
															className={user["transaction-row__amount"]}
															aria-label={`${tx.type === TransactionType.CREDIT ? "Crédit de" : "Débit de"} ${tx.amount.toFixed(2)} euros`}>
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

								{/* --- Contrôles de Pagination --- */}
								{totalPages > 1 && (
									<nav
										className={user["pagination__nav"]}
										aria-label="Transaction pagination">
										<div className={user["pagination__arrow--prev"]}>
											<button
												onClick={handlePreviousPage}
												disabled={currentPage === 1}
												className={user["pagination__button"]}
												aria-label="Go to previous page">
												<FaChevronLeft />
											</button>
										</div>

										<div className={user["pagination__numbers"]}>
											{/* Afficher seulement quelques pages au milieu si trop nombreuses */}
											{pageNumbers.length <= 7 ? (
												// Afficher toutes les pages si 7 ou moins
												pageNumbers.map((number) => (
													<button
														key={number}
														onClick={() => handlePageChange(number)}
														className={classNames(user["pagination__button"], {
															[user["pagination__button--current"]]:
																currentPage === number,
														})}
														aria-current={
															currentPage === number ? "page" : undefined
														}
														aria-label={`Go to page ${number}`}>
														{number}
													</button>
												))
											) : (
												// Pagination intelligente pour de nombreuses pages
												<>
													{/* Première page toujours visible */}
													<button
														onClick={() => handlePageChange(1)}
														className={classNames(user["pagination__button"], {
															[user["pagination__button--current"]]:
																currentPage === 1,
														})}
														aria-current={
															currentPage === 1 ? "page" : undefined
														}
														aria-label="Go to page 1">
														1
													</button>

													{/* Ellipse si nécessaire */}
													{currentPage > 3 && (
														<span className={user["pagination__ellipsis"]}>
															...
														</span>
													)}

													{/* Pages autour de la page courante */}
													{pageNumbers
														.filter(
															(num) =>
																num !== 1 &&
																num !== totalPages &&
																num >= currentPage - 1 &&
																num <= currentPage + 1
														)
														.map((number) => (
															<button
																key={number}
																onClick={() => handlePageChange(number)}
																className={classNames(
																	user["pagination__button"],
																	{
																		[user["pagination__button--current"]]:
																			currentPage === number,
																	}
																)}
																aria-current={
																	currentPage === number ? "page" : undefined
																}
																aria-label={`Go to page ${number}`}>
																{number}
															</button>
														))}

													{/* Ellipse si nécessaire */}
													{currentPage < totalPages - 2 && (
														<span className={user["pagination__ellipsis"]}>
															...
														</span>
													)}

													{/* Dernière page toujours visible */}
													<button
														onClick={() => handlePageChange(totalPages)}
														className={classNames(user["pagination__button"], {
															[user["pagination__button--current"]]:
																currentPage === totalPages,
														})}
														aria-current={
															currentPage === totalPages ? "page" : undefined
														}
														aria-label={`Go to page ${totalPages}`}>
														{totalPages}
													</button>
												</>
											)}
										</div>

										<div className={user["pagination__arrow--next"]}>
											<button
												onClick={handleNextPage}
												disabled={currentPage === totalPages}
												className={user["pagination__button"]}
												aria-label="Go to next page">
												<FaChevronRight />
											</button>
										</div>
									</nav>
								)}
							</>
						)}
					</section>
				</>
			</main>
		</>
	);
};

export default User;
