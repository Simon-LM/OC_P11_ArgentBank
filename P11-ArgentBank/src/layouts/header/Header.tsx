/** @format */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { logoutUser } from "../../store/slices/usersSlice";
import argentBankLogoPng from "../../assets/img/argentBankLogo.png";
import argentBankLogoWebp from "../../assets/img/argentBankLogo.webp";
import argentBankLogoAvif from "../../assets/img/argentBankLogo.avif";

const Header: React.FC = () => {
	const isAuthenticated = useSelector(
		(state: RootState) => state.users.isAuthenticated
	);
	const currentUser = useSelector(
		(state: RootState) => state.users.currentUser
	);
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const handleSignOut = () => {
		dispatch(logoutUser());
		navigate("/");
	};

	return (
		<header className="header" role="banner" aria-labelledby="site-title">
			{/* Skip link pour l'accessibilité - visible uniquement au focus */}
			<a href="#main-content" className="skip-to-content">
				Skip to main content
			</a>

			<div className="header__logo-container">
				<a className="header__logo" href="./">
					<picture>
						<source srcSet={argentBankLogoAvif} type="image/avif" />
						<source srcSet={argentBankLogoWebp} type="image/webp" />
						<img
							className="header__logo-image"
							src={argentBankLogoPng}
							alt="Home page"
							width="200"
							height="38"
							title="Argent Bank - Your Trusted Online Banking Partner"
							loading="eager"
						/>
					</picture>
					<h1 id="site-title" className="sr-only">
						Argent Bank - Your Trusted Online Banking Partner Since 2020
					</h1>
				</a>
			</div>

			<nav aria-label="Main Navigation">
				<ul className="header__nav">
					{isAuthenticated && currentUser ? (
						<>
							<li>
								<Link
									to="/user"
									className="header__nav-item"
									aria-label="Access your profile and banking dashboard">
									<i className="fa fa-user-circle" aria-hidden="true"></i>
									<span>{currentUser.userName}</span>
								</Link>
							</li>
							<li>
								<button
									onClick={handleSignOut}
									className="header__nav-item header__nav-button"
									type="button"
									aria-label="Sign out and return to home page">
									<i className="fa fa-sign-out" aria-hidden="true"></i>
									<span>Sign Out</span>
								</button>
							</li>
						</>
					) : (
						<li>
							<Link to="/signin" className="header__nav-item">
								<i className="fa fa-user-circle" aria-hidden="true"></i>
								<span>Sign In</span>
							</Link>
						</li>
					)}
				</ul>
			</nav>
		</header>
	);
};

export default Header;
