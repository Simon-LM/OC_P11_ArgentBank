/** @format */

import { Link } from "react-router-dom";
// import "./error404.scss";

function Error404() {
	return (
		<div className="error404">
			<h2 className="error404__title">404</h2>
			<p className="error404__text">
				Oups, La page que vous demandez n'existe pas.
			</p>
			<Link className="error404__link links" to="/">
				Retourner à la page d'accueil
			</Link>
		</div>
	);
}

export default Error404;
