/** @format */

import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/Store";
import { resetUsers } from "../../pages/user/usersSilice";

const Header: React.FC = () => {
	const isAuthenticated = useSelector(
		(state: RootState) => state.users.isAuthenticated
	);
	const dispatch = useDispatch();

	const handleSignOut = () => {
		dispatch(resetUsers()); // Réinitialiser les utilisateurs et déconnecter l'utilisateur
	};

	return (
		<nav className="main-nav">
			<a className="main-nav-logo" href="./">
				<img
					className="main-nav-logo-image"
					src="./src/assets/img/argentBankLogo.svg"
					alt="Argent Bank Logo"
				/>
				<h1 className="sr-only">Argent Bank</h1>
			</a>

			{isAuthenticated ? (
				<>
					<Link to="/signin" onClick={handleSignOut}>
						<i className="fa fa-user-circle"></i>USER
					</Link>
					<Link to="/signin" onClick={handleSignOut}>
						<i className="fa fa-sign-out"></i>Sign Out
					</Link>
				</>
			) : (
				<Link to="/signin" className="main-nav-item">
					<i className="fa fa-user-circle"></i>Sign In
				</Link>
			)}
		</nav>
	);
};

export default Header;
