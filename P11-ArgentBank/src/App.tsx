/** @format */

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
import SignIn from "./pages/signIn/SignIn";
import User from "./pages/user/User";
import Error404 from "./pages/error404/Error404";
import { initializeAuth } from "./utils/authService";
import { AppDispatch } from "./store/Store";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import useSessionTimeout from "./hooks/useSessionTimeout/useSessionTimeout";

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
				<Route path="/Error404" element={<Error404 />} />
			</Routes>
			<Footer />
		</Router>
	);
}

export default App;
