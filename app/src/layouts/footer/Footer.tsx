/** @format */

// import React from "react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const [isExpanding, setIsExpanding] = useState(false);

  const handleToggle = () => {
    if (!isPrivacyOpen) {
      setIsExpanding(true);
      setTimeout(() => setIsExpanding(false), 400);
    }
    setIsPrivacyOpen(!isPrivacyOpen);
  };

  return (
    <footer
      className="footer"
      data-testid="footer"
      role="contentinfo"
      aria-label="Page footer"
    >
      <p className="footer__text">
        ArgentBank - Demo Project | Developed by
        <a
          href="https://www.simon-lm.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="footer__link"
        >
          Simon LM
        </a>
      </p>

      <p className="footer__sitemap">
        <Link to="/sitemap" className="footer__link">
          Site Map
        </Link>
      </p>

      <div
        className={`footer__privacy-compact ${isExpanding ? "expanding" : ""} ${isPrivacyOpen ? "open" : ""}`}
      >
        {/* <button
					className={`footer__privacy-toggle ${isPrivacyOpen ? "open" : ""}`}
					onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
					aria-expanded={isPrivacyOpen}
					aria-controls="privacy-details">
					{isPrivacyOpen
						? "Hide Privacy Information"
						: "Show Privacy Information"}
					<span className="toggle-icon" aria-hidden="true">
						{isPrivacyOpen ? "−" : "+"}
					</span>
				</button> */}

        <button
          className={`footer__privacy-toggle ${isPrivacyOpen ? "open" : ""}`}
          onClick={handleToggle}
          aria-expanded={isPrivacyOpen}
          aria-controls="privacy-details"
        >
          {isPrivacyOpen
            ? "Hide Privacy Information"
            : "Show Privacy Information"}
          <span className="toggle-icon" aria-hidden="true">
            {isPrivacyOpen ? "−" : "+"}
          </span>
        </button>

        <div
          id="privacy-details"
          role="region"
          className={`footer__privacy-content ${isPrivacyOpen ? "open" : ""}`}
          hidden={!isPrivacyOpen}
        >
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
              <span className="footer__privacy-bullet">•</span> No data is
              shared with third parties
            </p>
            <p className="footer__privacy-item">
              <span className="footer__privacy-bullet">•</span> Analytics data
              is retained for 13 months
            </p>
          </div>

          <p className="footer__privacy-action">
            <a
              href="https://analytics.lostintab.com/index.php?module=CoreAdminHome&action=optOut"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__privacy-action-link"
            >
              Click here to opt out of tracking
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
