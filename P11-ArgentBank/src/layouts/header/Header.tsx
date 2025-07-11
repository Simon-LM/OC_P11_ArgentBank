/** @format */

import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/Store";
import { logoutUser } from "../../store/slices/usersSlice";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const Header: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useSelector(
    (state: RootState) => state.users.isAuthenticated,
  );
  const currentUser = useSelector(
    (state: RootState) => state.users.currentUser,
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSignOut = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  const isHomePage = location.pathname === "/";

  return (
    <header className="header" role="banner">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <h1 id="site-title" className="sr-only">
        Argent Bank - Your Trusted Online Banking Partner Since 2020
      </h1>

      <div className="header__logo-container">
        <a
          className="header__logo"
          href={isHomePage ? "/" : "./"}
          aria-label="Go to home page"
          aria-current={isHomePage ? "page" : undefined}
          onClick={isHomePage ? (e) => e.preventDefault() : undefined}
        >
          <picture>
            <source srcSet="/img/argentBankLogo.avif" type="image/avif" />
            <source srcSet="/img/argentBankLogo.webp" type="image/webp" />
            <img
              className="header__logo-image"
              src="/img/argentBankLogo.png"
              alt=""
              width="200"
              height="38"
              loading="eager"
            />
          </picture>
        </a>
      </div>

      <nav className="header__navigation" aria-label="Main Navigation">
        <ul className="header__nav">
          {isAuthenticated && currentUser ? (
            <>
              <li>
                <Link
                  to="/user"
                  className="header__nav-item"
                  aria-label="Access your profile and banking dashboard"
                >
                  <i className="fa fa-user-circle" aria-hidden="true"></i>
                  <span>{currentUser.userName}</span>
                </Link>
              </li>
              <li>
                {/* <button
									onClick={handleSignOut}
									className="header__nav-item header__nav-button"
									type="button"
									aria-label="Sign out and return to home page">
									<i className="fa fa-sign-out" aria-hidden="true"></i>
									<span>Sign Out</span>
								</button> */}
                <button
                  onClick={handleSignOut}
                  className="header__nav-item header__nav-button"
                  type="button"
                  aria-label="Sign out and return to home page"
                >
                  {/* Replace Font Awesome icon with React Icon component */}
                  <FaSignOutAlt aria-hidden="true" className="nav-icon" />
                  <span>Sign Out</span>
                </button>
              </li>
            </>
          ) : (
            <li>
              {/* <Link to="/signin" className="header__nav-item">
								<i className="fa fa-user-circle" aria-hidden="true"></i>
								<span>Sign In</span>
							</Link> */}

              <Link
                to="/signin"
                className="header__nav-item"
                aria-label="Sign In to your account"
              >
                {/* Replace Font Awesome icon with React Icon component */}
                <FaUserCircle aria-hidden="true" className="nav-icon" />
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
