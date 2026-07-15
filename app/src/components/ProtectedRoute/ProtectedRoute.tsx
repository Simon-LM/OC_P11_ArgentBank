/** @format */

import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";
import { useMatomo } from "../../hooks/useMatomo/useMatomo";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.users.isAuthenticated,
  );
  const token = sessionStorage.getItem("authToken");
  const location = useLocation();
  const { trackPageView } = useMatomo();

  useEffect(() => {
    // if (isAuthenticated && token && !isLoading) {
    // 	const trackTimeout = setTimeout(() => {
    // 		if (isMatomoLoaded()) {
    // 			const pageTitle = "Argent Bank - User Dashboard";
    // 			document.title = pageTitle;
    // 			trackPageView({
    // 				documentTitle: pageTitle,
    // 				href: window.location.origin + location.pathname,
    // 			});
    // 			console.log("Protected route tracked:", pageTitle, location.pathname);
    // 		}
    // 	}, 800);
    // 	return () => clearTimeout(trackTimeout);
    // }
  }, [isAuthenticated, token, location, trackPageView]);

  if (!isAuthenticated && !token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
