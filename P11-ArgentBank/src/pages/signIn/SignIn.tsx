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
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const getErrorMessage = (errorMessage: string): string => {
		if (errorMessage.includes("401")) {
			return "Invalid email or password";
		}

		if (
			errorMessage.toLowerCase().includes("email") ||
			errorMessage.toLowerCase().includes("username")
		) {
			return "Invalid email address";
		}

		if (errorMessage.toLowerCase().includes("password")) {
			return "Incorrect password";
		}

		return "Unable to login. Please check your credentials.";
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true);
		try {
			const result = await loginUser({ email, password });
			console.log("Login successful:", result);

			const token: string = result.body.token;

			dispatch(loginUserSuccess({ email, token }));

			const userProfile = await fetchUserProfile(token);

			dispatch(setAuthState(userProfile));

			navigate("/User");
		} catch (err) {
			if (err instanceof Error) {
				setError(getErrorMessage(err.message));
			} else {
				setError("An unexpected error occurred");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className={signin["signin-page"]}>
			<h1 className="sr-only">Account Login - Argent Bank</h1>

			<section className={signin["signin-form"]}>
				<i
					className={classNames(
						"fa",
						"fa-user-circle",
						signin["signin-form__icon"]
					)}
					aria-hidden="true"></i>

				<h2 id="signin-title">Sign In</h2>

				<p className={signin["signin-form__demo-info"]}>
					<i className="fa fa-info-circle" aria-hidden="true"></i>
					<span>
						<strong>Demo credentials:</strong>
						tony@stark.com / password123
					</span>
				</p>
				<form onSubmit={handleSubmit} aria-labelledby="signin-title" noValidate>
					<div className={signin["signin-form__input-group"]}>
						<label htmlFor="email" id="email-label">
							Email
						</label>
						<input
							type="email"
							id="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							aria-required="true"
							aria-describedby={
								error && error.includes("email") ? "error-message" : undefined
							}
							aria-invalid={error && error.includes("email") ? "true" : "false"}
						/>
					</div>
					<div className={signin["signin-form__input-group"]}>
						<label htmlFor="password">Password</label>

						<div className={signin["signin-form__password-field"]}>
							<input
								type={showPassword ? "text" : "password"}
								id="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								aria-required="true"
								aria-describedby={
									error && error.includes("password")
										? "error-message"
										: undefined
								}
								aria-invalid={
									error && error.includes("password") ? "true" : "false"
								}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className={signin["signin-form__password-toggle"]}
								aria-label={showPassword ? "Hide password" : "Show password"}>
								<i
									className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
									aria-hidden="true"></i>
							</button>
						</div>
					</div>

					{isLoading && (
						<p className="sr-only" role="status" aria-live="polite">
							Authenticating your credentials...
						</p>
					)}

					{error && (
						<p
							className={signin["signin-form__error"]}
							role="alert"
							id="error-message">
							{error}
						</p>
					)}

					<button
						className={signin["signin-form__button"]}
						disabled={isLoading}
						aria-busy={isLoading}>
						{isLoading ? "Authenticating..." : "Connect"}
					</button>
				</form>
			</section>
		</main>
	);
};

export default SignIn;
