/** @format */

import { Suspense, lazy } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Header from "./layouts/header/Header";
import Home from "./pages/home/Home";
import Footer from "./layouts/footer/Footer";
import { initializeAuth } from "./utils/authService";
import { AppDispatch } from "./store/Store";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import useSessionTimeout from "./hooks/useSessionTimeout/useSessionTimeout";

const SignIn = lazy(() => import("./pages/signIn/SignIn"));
const User = lazy(() => import("./pages/user/User"));
const Error404 = lazy(() => import("./pages/error404/Error404"));

function App() {
	const dispatch = useDispatch<AppDispatch>();
	const sessionDuration = 5 * 60 * 1000;

	useSessionTimeout(sessionDuration);

	useEffect(() => {
		dispatch(initializeAuth());
	}, [dispatch]);

	return (
		<Router>
			<Header />
			<Suspense fallback={<div>Loading...</div>}>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/signIn" element={<SignIn />} />
					<Route
						path="/user"
						element={
							<ProtectedRoute>
								<User />
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<Navigate to="/error404" />} />
					<Route path="/error404" element={<Error404 />} />
				</Routes>
			</Suspense>
			<Footer />
		</Router>
	);
}

export default App;
