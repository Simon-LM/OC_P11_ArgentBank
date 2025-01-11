/** @format */

import { Link } from "react-router-dom";
import styles from "./Error404.module.scss";

function Error404() {
	return (
		<div className={styles.error404}>
			<h2 className={styles["error404__title"]}>404</h2>
			<p className={styles["error404__text"]}>
				Oops, the page you are requesting does not exist.
			</p>
			<Link className={styles["error404__link"]} to="/">
				Return to the homepage
			</Link>{" "}
		</div>
	);
}

export default Error404;
