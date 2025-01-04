/** @format */

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";

interface ProtectedRouteProps {
	children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const [isLoading, setIsLoading] = useState(true);
	const isAuthenticated = useSelector(
		(state: RootState) => state.users.isAuthenticated
	);
	const token = sessionStorage.getItem("authToken");

	useEffect(() => {
		if (token) {
			setIsLoading(false);
		} else {
			setIsLoading(false);
		}
	}, [token, isAuthenticated]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!isAuthenticated && !token) {
		return <Navigate to="/signin" replace />;
	}

	return children;
};

export default ProtectedRoute;
