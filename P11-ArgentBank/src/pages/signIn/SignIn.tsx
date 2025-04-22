/** @format */

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import signin from "./signin.module.scss";
import classNames from "classnames";
import { loginUser, fetchUserProfile } from "../../utils/authService";
import { loginUserSuccess, setAuthState } from "../../store/slices/usersSlice";
import { AppDispatch } from "../../store/Store";

const SignIn: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const dispatch = useDispatch<AppDispatch>(); // Typage correct de dispatch
	const navigate = useNavigate();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			const result = await loginUser({ email, password });
			console.log("Login successful:", result);

			const token: string = result.body.token;

			// await dispatch(loginUserSuccess({ email, token: token }));
			dispatch(loginUserSuccess({ email, token }));

			const userProfile = await fetchUserProfile(token);

			// dispatch(updateCurrentUser(userProfile));
			dispatch(setAuthState(userProfile));

			navigate("/User");
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unknown error occurred");
			}
		}
	};

	return (
		<main className={signin["signin-page-main"]}>
			<section className={signin["sign-in-content"]}>
				<i
					className={classNames(
						"fa",
						"fa-user-circle",
						signin["sign-in-icon"]
					)}></i>
				<h1>Sign In</h1>
				<form onSubmit={handleSubmit}>
					<div className={signin["input-wrapper"]}>
						<label htmlFor="username">Username</label>
						<input
							type="email"
							id="username"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className={signin["input-wrapper"]}>
						<label htmlFor="password">Password</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					{error && <p className={signin["error-message"]}>{error}</p>}
					{/* <div className={signin["input-remember"]}>
						<input type="checkbox" id="remember-me" />
						<label htmlFor="remember-me">Remember me</label>
					</div> */}
					<button className={signin["sign-in-button"]}>Sign In</button>
				</form>
			</section>
		</main>
	);
};

export default SignIn;
