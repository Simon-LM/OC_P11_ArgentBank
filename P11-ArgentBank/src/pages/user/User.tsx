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
import { TransactionType } from "@prisma/client";

const User: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [isEditing, setIsEditing] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const transactionsPerPage = 10;

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
			<main className={user["user-page-main"]}>
				{/* --- Section Accueil et Édition --- */}
				<div>
					<h2 className={user["title"]}>
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
							className={user["edit-button"]}
							onClick={() => setIsEditing(true)}>
							Edit Name
						</button>
					)}
				</div>
				{/* --- Section Comptes --- */}
				<h2 className="sr-only">Accounts</h2>
				{accountsStatus === "loading" && <p>Loading accounts...</p>}
				{accountsStatus === "failed" && (
					<p className={user["error-message"]}>
						Error loading accounts: {accountsError}
					</p>
				)}
				{accountsStatus === "succeeded" &&
					accounts.map((account) => (
						<button
							className={classNames(user["account"], {
								[user["account-selected"]]: account.id === selectedAccountId, // Style si sélectionné
							})}
							key={account.id}
							// Rendre cliquable pour sélectionner
							onClick={() => dispatch(selectAccount(account.id))}
							style={{ cursor: "pointer" }} // Indiquer que c'est cliquable
						>
							<div className={user["account-content-wrapper"]}>
								<h3 className={user["account-title"]}>
									{account.type} (x{account.accountNumber})
								</h3>
								<p className={user["account-amount"]}>
									€{account.balance.toFixed(2)}
								</p>
								<p className={user["account-amount-description"]}>
									Available Balance
								</p>
							</div>
							<div
								className={classNames(
									user["account-content-wrapper"],
									user["cta"]
								)}>
								{/* Le bouton n'est plus nécessaire si la section est cliquable */}
								{/* <button className={user["transaction-button"]}>View transactions</button> */}
							</div>
						</button>
					))}
				{/* --- Section Transactions --- */}
				<>
					<h2 className="sr-only">Transactions for selected account</h2>
					{transactionsStatus === "loading" && <p>Loading transactions...</p>}
					{transactionsStatus === "failed" && (
						<p className={user["error-message"]}>
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
								currentTransactions.map((tx) => (
									<section className={user["transaction-detail"]} key={tx.id}>
										{/* ... (structure interne de la transaction existante) ... */}
										<div className={user["account-content-wrapper"]}>
											<h3 className={user["account-title"]}>
												{tx.description}
											</h3>
											<p className={user["account-amount-description"]}>
												{new Date(tx.date).toLocaleDateString()} - {tx.category}
											</p>
											<p className={user["account-amount"]}>
												{/* Afficher +/- explicitement peut être plus clair */}
												{tx.type === TransactionType.CREDIT ? "+" : "-"}
												{tx.amount.toFixed(2)} €
											</p>
											{tx.notes && (
												<p className={user["account-amount-description"]}>
													Notes: {tx.notes}
												</p>
											)}
										</div>
									</section>
								))
							)}

							{/* --- Contrôles de Pagination --- */}
							{totalPages > 1 && (
								<nav
									className={user["pagination-nav"]}
									aria-label="Transaction pagination">
									<button
										onClick={handlePreviousPage}
										disabled={currentPage === 1}
										className={user["pagination-button"]}
										aria-label="Go to previous page">
										<FaChevronLeft />
									</button>
									{pageNumbers.map((number) => (
										<button
											key={number}
											onClick={() => handlePageChange(number)}
											className={classNames(user["pagination-button"], {
												[user["pagination-button-current"]]:
													currentPage === number,
											})}
											aria-current={currentPage === number ? "page" : undefined}
											aria-label={`Go to page ${number}`}>
											{number}
										</button>
									))}
									<button
										onClick={handleNextPage}
										disabled={currentPage === totalPages}
										className={user["pagination-button"]}
										aria-label="Go to next page">
										<FaChevronRight />
									</button>
								</nav>
							)}
						</>
					)}
				</>
			</main>
		</>
	);
};

export default User;
