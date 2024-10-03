/** @format */

import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { useState } from "react";
import Header from "./layouts/header/Header";
import Home from "./pages/home/Home";
import Footer from "./layouts/footer/Footer";
import SignIn from "./pages/signIn/SignIn";
import User from "./pages/user/User";
import Error404 from "./pages/error404/Error404";

function App() {
	// const [count, setCount] = useState(0);

	return (
		<Router>
			<Header />
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/SignIn" element={<SignIn />} />
					<Route path="/User" element={<User />} />
					<Route path="*" element={<Navigate to="/error404" />} />
					<Route path="/Error404" element={<Error404 />} />
				</Routes>
				{/* <div className="card">
					<button onClick={() => setCount((count) => count + 1)}>
						count is {count}
					</button>
				</div> */}
			</main>
			<Footer />
		</Router>
	);
}

export default App;
