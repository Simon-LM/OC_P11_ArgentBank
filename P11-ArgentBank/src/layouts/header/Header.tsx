/** @format */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { logoutUser } from "../../pages/user/usersSlice";
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
		dispatch(logoutUser()); // Utilise logoutUser pour déconnecter l'utilisateur
		navigate("/signin"); // Rediriger vers la page de connexion après déconnexion
	};

	return (
		<nav className="main-nav" role="banner">
			<a className="main-nav-logo" href="./">
			<picture>
  <source
    srcSet={argentBankLogoWebp}
    type="image/webp"
  />
  <img
    className="main-nav-logo-image"
    src={argentBankLogoAvif}
    alt="Argent Bank Logo"
    width="200"
    height="55"
    title="Argent Bank - Your Trusted Online Banking Partner"
    loading="eager"
  />
</picture>
				<h1 className="sr-only">
					Argent Bank - Your Trusted Online Banking Partner Since 2020
				</h1>
			</a>

			{isAuthenticated && currentUser ? (
				<div className="main-nav">
					<Link to="/user" className="main-nav-item">
						<i className="fa fa-user-circle"></i>
						{currentUser.userName}
					</Link>
					<Link to="/" onClick={handleSignOut} className="main-nav-item">
						<i className="fa fa-sign-out"></i>Sign Out
					</Link>
				</div>
			) : (
				<Link to="/signin" className="main-nav-item">
					<i className="fa fa-user-circle"></i>Sign In
				</Link>
			)}
		</nav>
	);
};

export default Header;
