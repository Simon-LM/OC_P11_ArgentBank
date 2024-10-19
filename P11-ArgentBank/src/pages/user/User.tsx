/** @format */

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";
import user from "./user.module.scss";

const User: React.FC = () => {
	// const userData = useSelector((state: RootState) => state.users.users[0]);

	const currentUser = useSelector(
		(state: RootState) => state.users.currentUser
	);

	console.log("User data from store:", currentUser);

	if (!currentUser) {
		return <p>Loading user data...</p>;
	}
	return (
		<main className={user["bg-dark"]}>
			<div className="header">
				<h1>
					Welcome back
					<br />
					{currentUser.firstName} {currentUser.lastName} !
				</h1>
				<button className={user["edit-button"]}>Edit Name</button>
			</div>
			<h2 className="sr-only">Accounts</h2>

			{currentUser.accounts.map((account) => (
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
					<div className={user["account-content-wrapper cta"]}>
						<button className={user["transaction-button"]}>
							View transactions
						</button>
					</div>
				</section>
			))}
		</main>
	);
};

export default User;
