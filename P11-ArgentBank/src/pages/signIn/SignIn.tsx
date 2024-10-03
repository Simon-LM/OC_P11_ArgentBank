/** @format */

import React from "react";
import signin from "./signin.module.scss";
import classNames from "classnames";

const SignIn: React.FC = () => {
	return (
		<main className={signin["bg-dark"]}>
			<section className={signin["sign-in-content"]}>
				<i
					className={classNames(
						"fa",
						"fa-user-circle",
						signin["sign-in-icon"]
					)}></i>
				<h1>Sign In</h1>
				<form>
					<div className={signin["input-wrapper"]}>
						<label htmlFor="username">Username</label>
						<input type="text" id="username" />
					</div>
					<div className={signin["input-wrapper"]}>
						<label htmlFor="password">Password</label>
						<input type="password" id="password" />
					</div>
					<div className={signin["input-remember"]}>
						<input type="checkbox" id="remember-me" />
						<label htmlFor="remember-me">Remember me</label>
					</div>
					{/* PLACEHOLDER DUE TO STATIC SITE */}
					{/* <a href="./User" className={signin["sign-in-button"]}>
						Sign In
					</a> */}
					{/* SHOULD BE THE BUTTON BELOW */}
					<button className={signin["sign-in-button"]}>Sign In</button>
				</form>
			</section>
		</main>
	);
};

export default SignIn;
