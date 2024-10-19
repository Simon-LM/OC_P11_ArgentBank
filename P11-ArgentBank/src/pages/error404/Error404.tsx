/** @format */

import { Link } from "react-router-dom";
import "./Error404.module.scss";

function Error404() {
	return (
		<div className="error404">
			<h2 className="error404__title">404</h2>
			<p className="error404__text">
				Oops, the page you are requesting does not exist.
			</p>
			<Link className="error404__link links" to="/">
				Return to the homepage
			</Link>
		</div>
	);
}

export default Error404;
