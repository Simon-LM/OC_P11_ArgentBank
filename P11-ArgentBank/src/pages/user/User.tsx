/** @format */

import React from "react";
import user from "./user.module.scss";

const User: React.FC = () => {
	return (
		<main className={user["bg-dark"]}>
			<div className="header">
				<h1>
					Welcome back
					<br />
					Tony Jarvis!
				</h1>
				<button className={user["edit-button"]}>Edit Name</button>
			</div>
			<h2 className="sr-only">Accounts</h2>
			<section className={user["account"]}>
				<div className={user["account-content-wrapper"]}>
					<h3 className={user["account-title"]}>
						Argent Bank Checking (x8349)
					</h3>
					<p className={user["account-amount"]}>$2,082.79</p>
					<p className={user["account-amount-description"]}>
						Available Balance
					</p>
				</div>
				<div className={user["account-content-wrapper cta"]}>
					<button className={user["transaction-button"]}>
						View transactions
					</button>
				</div>
			</section>
			<section className={user["account"]}>
				<div className={user["account-content-wrapper"]}>
					<h3 className={user["account-title"]}>Argent Bank Savings (x6712)</h3>
					<p className={user["account-amount"]}>$10,928.42</p>
					<p className={user["account-amount-description"]}>
						Available Balance
					</p>
				</div>
				<div className={user["account-content-wrapper cta"]}>
					<button className={user["transaction-button"]}>
						View transactions
					</button>
				</div>
			</section>
			<section className={user["account"]}>
				<div className={user["account-content-wrapper"]}>
					<h3 className={user["account-title"]}>
						Argent Bank Credit Card (x8349)
					</h3>
					<p className={user["account-amount"]}>$184.30</p>
					<p className={user["account-amount-description"]}>Current Balance</p>
				</div>
				<div className={user["account-content-wrapper cta"]}>
					<button className={user["transaction-button"]}>
						View transactions
					</button>
				</div>
			</section>
		</main>
	);
};

export default User;
