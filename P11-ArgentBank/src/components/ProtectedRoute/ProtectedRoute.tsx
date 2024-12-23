/** @format */

import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";

interface ProtectedRouteProps {
	children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const isAuthenticated = useSelector(
		(state: RootState) => state.users.isAuthenticated
	);

	if (!isAuthenticated) {
		return <Navigate to="/signin" replace />;
	}

	return children;
};

export default ProtectedRoute;
