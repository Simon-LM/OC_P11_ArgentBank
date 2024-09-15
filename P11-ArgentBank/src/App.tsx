/** @format */

import { useState } from "react";
import Header from "./layouts/header/Header";
import Home from "./pages/home/Home";
import Footer from "./layouts/footer/Footer";

function App() {
	const [count, setCount] = useState(0);

	return (
		<>
			<Header />
			<Home />
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
			</div>
			<Footer />
		</>
	);
}

export default App;
