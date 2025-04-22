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

const User: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [isEditing, setIsEditing] = useState(false);

	// // Sélectionner les données utilisateur et l'état d'authentification
	// const { currentUser, isAuthenticated } = useSelector(
	// 	(state: RootState) => state.users
	// );

	// // Sélectionner l'état des transactions
	// const { transactions, transactionsStatus, transactionsError } = useSelector(
	// 	(state: RootState) => state.users
	// );

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

	// const filteredTransactions =
	// 	transactionsStatus === "succeeded" && selectedAccountId
	// 		? transactions.filter((tx) => tx.accountId === selectedAccountId)
	// 		: [];

	const filteredTransactions =
		transactionsStatus === "succeeded"
			? selectedAccountId
				? transactions.filter((tx) => tx.accountId === selectedAccountId)
				: transactions
			: [];

	return (
		<>
			<main className={user["bg-dark"]}>
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
						<section
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
						</section>
					))}

				{/* --- Section Transactions --- */}
				{/* Afficher seulement si un compte est sélectionné */}
				<>
					<h2 className="sr-only">Transactions for selected account</h2>
					{transactionsStatus === "loading" && <p>Loading transactions...</p>}
					{transactionsStatus === "failed" && (
						<p className={user["error-message"]}>
							Error loading transactions: {transactionsError}
						</p>
					)}
					{/* Utiliser filteredTransactions ici */}
					{transactionsStatus === "succeeded" && (
						<>
							{filteredTransactions.length === 0 ? (
								<p>No transactions found for this account.</p>
							) : (
								filteredTransactions.map((tx) => (
									<section className={user["transaction-detail"]} key={tx.id}>
										{" "}
										{/* Utiliser une classe différente ? */}
										<div className={user["account-content-wrapper"]}>
											{" "}
											{/* Réutiliser les styles ? */}
											<h3 className={user["account-title"]}>
												{tx.description}
											</h3>
											<p className={user["account-amount-description"]}>
												{new Date(tx.date).toLocaleDateString()} - {tx.category}
											</p>
											<p className={user["account-amount"]}>
												{tx.amount.toFixed(2)} € ({tx.type})
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
						</>
					)}
				</>
			</main>
		</>
	);
};

export default User;
