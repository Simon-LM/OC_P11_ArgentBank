/** @format */

import React from "react";

const Footer: React.FC = () => {
	return (
		<footer
			className="footer"
			data-testid="footer"
			role="contentinfo"
			aria-label="Page footer">
			<p className="footer__text">
				ArgentBank - Demo Project | Developed by
				<a
					href="https://www.simon-lm.dev"
					target="_blank"
					rel="noopener noreferrer"
					className="footer__link">
					Simon LM
				</a>
			</p>
		</footer>
	);
};

export default Footer;
