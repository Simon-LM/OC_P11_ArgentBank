/** @format */

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/Store";
import user from "./user.module.scss";
import classNames from "classnames";
import { useState } from "react";
import EditUserForm from "../../components/EditUserForm/EditUserForm";
import { updateCurrentUser } from "./usersSlice";
import { updateUserProfile } from "../../utils/authService";

const User: React.FC = () => {
	const dispatch = useDispatch();
	const currentUser = useSelector(
		(state: RootState) => state.users.currentUser
	);
	const [isEditing, setIsEditing] = useState(false);

	console.log("User data from store:", currentUser);

	if (!currentUser) {
		return <p>Loading user data...</p>;
	}

	const handleSave = async (data: {
		userName: string;
		firstName: string;
		lastName: string;
	}) => {
		console.log("New user data:", data);
		const token = sessionStorage.getItem("authToken");
		if (!token) {
			console.error("No auth token found.");
			// Optionnel: Rediriger vers la page de connexion
			return;
		}

		try {
			// Appel à l'API pour mettre à jour le userName
			const updatedUser = await updateUserProfile(data.userName, token);
			// Mettre à jour le Redux store avec le nouveau userName
			dispatch(updateCurrentUser({ userName: updatedUser.userName }));
			setIsEditing(false);
		} catch (error) {
			console.error("Failed to update user profile:", error);
			// Optionnel: Afficher une notification d'erreur à l'utilisateur
		}
	};

	return (
		<main className={user["bg-dark"]}>
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

			<h2 className="sr-only">Accounts</h2>

			{currentUser.accounts && currentUser.accounts.length > 0 ? (
				currentUser.accounts.map((account) => (
					<section className={user["account"]} key={account.accountNumber}>
						<div className={user["account-content-wrapper"]}>
							<h3 className={user["account-title"]}>
								{account.accountName} (x{account.accountNumber.slice(-4)})
							</h3>
							<p className={user["account-amount"]}>{account.balance}</p>
							<p className={user["account-amount-description"]}>
								{account.balanceType}
							</p>
						</div>
						<div
							className={classNames(
								user["account-content-wrapper"],
								user["cta"]
							)}>
							<button className={user["transaction-button"]}>
								View transactions
							</button>
						</div>
					</section>
				))
			) : (
				<p>Aucun compte disponible.</p>
			)}
		</main>
	);
};

export default User;
