/** @format */

import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/Store";
import { useMatomo, isMatomoLoaded } from "../../hooks/useMatomo/useMatomo";
import styles from "./sitemap.module.scss";

interface SitemapSection {
  title: string;
  description: string;
  pages: SitemapPage[];
}

interface SitemapPage {
  label: string;
  path: string;
  description: string;
  requiresAuth?: boolean;
}

const Sitemap: React.FC = () => {
  const location = useLocation();
  const { trackPageView } = useMatomo();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isAuthenticated = useSelector(
    (state: RootState) => state.users.isAuthenticated,
  );

  // Focus management for accessibility
  useEffect(() => {
    // Set focus on the main title when component mounts
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const trackingDelay = setTimeout(() => {
      if (isMatomoLoaded()) {
        const pageTitle = "Argent Bank - Site Map";
        document.title = pageTitle;

        const fullUrl = window.location.origin + location.pathname;

        trackPageView({
          documentTitle: pageTitle,
          href: fullUrl,
        });
      }
    }, 500);

    return () => clearTimeout(trackingDelay);
  }, [location, trackPageView]);

  const sitemapData: SitemapSection[] = [
    {
      title: "Public Pages",
      description: "Pages accessible to all visitors",
      pages: [
        {
          label: "Home",
          path: "/",
          description: "Welcome page with banking features overview",
        },
        {
          label: "Sign In",
          path: "/signin",
          description: "User authentication and login page",
        },
      ],
    },
    {
      title: "User Dashboard",
      description: "Authenticated user area (requires login)",
      pages: [
        {
          label: "User Dashboard",
          path: "/user",
          description: "Personal banking dashboard with account overview",
          requiresAuth: true,
        },
      ],
    },
    {
      title: "Navigation & Help",
      description: "Site navigation and assistance pages",
      pages: [
        {
          label: "Site Map",
          path: "/sitemap",
          description: "Complete overview of website structure and navigation",
        },
        {
          label: "Page Not Found",
          path: "/error404",
          description: "Error page for invalid or missing pages",
        },
      ],
    },
  ];

  return (
    <div className={styles["sitemap"]}>
      <div className={styles["sitemap__container"]}>
        <header className={styles["sitemap__header"]}>
          <h2 ref={titleRef} className={styles["sitemap__title"]} tabIndex={-1}>
            Site Map
          </h2>
          <p className={styles["sitemap__description"]}>
            Complete navigation structure of Argent Bank website. This page
            helps you find all available sections and pages quickly.
          </p>
        </header>

        <nav className={styles["sitemap__navigation"]} aria-label="Site Map">
          {sitemapData.map((section, sectionIndex) => (
            <section
              key={sectionIndex}
              className={styles["section"]}
              aria-labelledby={`section-${sectionIndex}`}
            >
              <h3
                id={`section-${sectionIndex}`}
                className={styles["section__title"]}
              >
                {section.title}
              </h3>
              <p className={styles["section__description"]}>
                {section.description}
              </p>

              <ul className={styles["pages"]}>
                {section.pages.map((page, pageIndex) => (
                  <li key={pageIndex} className={styles["pages__item"]}>
                    {page.requiresAuth && !isAuthenticated ? (
                      <div className={styles["page__disabled"]}>
                        <span className={styles["page__label"]}>
                          {page.label}
                        </span>
                        <span className={styles["page__auth-required"]}>
                          (Authentication required)
                        </span>
                        <p className={styles["page__description"]}>
                          {page.description}
                        </p>
                      </div>
                    ) : (
                      <>
                        <Link
                          to={page.path}
                          className={styles["page__link"]}
                          aria-describedby={`page-desc-${sectionIndex}-${pageIndex}`}
                        >
                          <span className={styles["page__label"]}>
                            {page.label}
                          </span>
                          <span className={styles["page__path"]}>
                            {page.path}
                          </span>
                        </Link>
                        <p
                          id={`page-desc-${sectionIndex}-${pageIndex}`}
                          className={styles["page__description"]}
                        >
                          {page.description}
                        </p>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <section className={styles["help"]} aria-labelledby="help-title">
          <h3 id="help-title" className={styles["help__title"]}>
            Accessibility Guide
          </h3>
          <div className={styles["help__content"]}>
            <div className={styles["help__column"]}>
              <h4>General Navigation</h4>
              <ul>
                <li>
                  <kbd>Tab</kbd> - Navigate between links
                </li>
                <li>
                  <kbd>Enter</kbd> - Activate selected link
                </li>
                <li>
                  <kbd>Shift + Tab</kbd> - Navigate backwards
                </li>
              </ul>
            </div>
            <div className={styles["help__column"]}>
              <h4>Transaction Search (User Dashboard)</h4>
              <ul>
                <li>
                  <kbd>Ctrl + Alt + F</kbd> - Focus search field
                </li>
                <li>
                  <kbd>Ctrl + Alt + R</kbd> - Navigate to results
                </li>
                <li>
                  <kbd>Enter</kbd> - Execute search
                </li>
                <li>
                  <kbd>Escape</kbd> - Exit search field
                </li>
                <li>
                  <kbd>Arrow Down</kbd> - Navigate to results
                </li>
              </ul>
            </div>
            <div className={styles["help__column"]}>
              <h4>Accessibility Features</h4>
              <ul>
                <li>Screen reader compatible</li>
                <li>High contrast support</li>
                <li>Semantic HTML structure</li>
                <li>ARIA landmarks and labels</li>
              </ul>
            </div>
          </div>
        </section>

        <footer className={styles["footer"]}>
          <p>
            <Link to="/" className={styles["footer__back-link"]}>
              ← Return to Home Page
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Sitemap;
