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
		navigate("/signin");
	};

	return (
		<nav className="header" role="banner">
			<a className="header__logo" href="./">
				<picture>
					<source srcSet={argentBankLogoAvif} type="image/avif" />
					<source srcSet={argentBankLogoWebp} type="image/webp" />
					<img
						className="header__logo-image"
						src={argentBankLogoPng}
						alt="Argent Bank Logo"
						width="200"
						height="38"
						title="Argent Bank - Your Trusted Online Banking Partner"
						loading="eager"
					/>
				</picture>
				<h1 className="sr-only">
					Argent Bank - Your Trusted Online Banking Partner Since 2020
				</h1>
			</a>
			<div className="header__nav">
				{isAuthenticated && currentUser ? (
					<>
						<Link to="/user" className="header__nav-item">
							<i className="fa fa-user-circle"></i>
							{currentUser.userName}
						</Link>
						<Link to="/" onClick={handleSignOut} className="header__nav-item">
							<i className="fa fa-sign-out"></i>Sign Out
						</Link>
					</>
				) : (
					<Link to="/signin" className="header__nav-item">
						<i className="fa fa-user-circle"></i>Sign In
					</Link>
				)}
			</div>
		</nav>
	);
};

export default Header;
