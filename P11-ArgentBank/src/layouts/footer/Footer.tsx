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
			<div className="footer__privacy">
				<p className="footer__privacy-text">
					This site uses Matomo for traffic analysis in privacy-friendly mode:
				</p>

				<div className="footer__privacy-items">
					<p className="footer__privacy-item">
						<span className="footer__privacy-bullet">•</span> No cookies are
						used
					</p>
					<p className="footer__privacy-item">
						<span className="footer__privacy-bullet">•</span> IP addresses are
						anonymized
					</p>
					<p className="footer__privacy-item">
						<span className="footer__privacy-bullet">•</span> No data is shared
						with third parties
					</p>
					<p className="footer__privacy-item">
						<span className="footer__privacy-bullet">•</span> Analytics data is
						retained for 13 months
					</p>
				</div>

				<p className="footer__privacy-action">
					<a
						href="https://analytics.lostintab.com/index.php?module=CoreAdminHome&action=optOut"
						target="_blank"
						rel="noopener noreferrer"
						className="footer__privacy-action-link">
						Click here to opt out of tracking
					</a>
				</p>
			</div>
		</footer>
	);
};

export default Footer;
