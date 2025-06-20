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
      {/* Element de test pour Pa11y - mauvais contraste intentionnel sur la page de connexion */}
      <div
        style={{
          color: "#bbb",
          backgroundColor: "#ddd",
          padding: "6px",
          fontSize: "12px",
          margin: "5px 0",
        }}
      >
        SignIn page contrast test element
      </div>
      <Link className={styles["error404__link"]} to="/">
        Return to the homepage
      </Link>{" "}
    </div>
  );
}

export default Error404;
