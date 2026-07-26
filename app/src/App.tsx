/** @format */

import { useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Header from "./layouts/header/Header";
import Home from "./pages/home/Home";
import Footer from "./layouts/footer/Footer";
import Sitemap from "./pages/sitemap/Sitemap";
import Error404 from "./pages/error404/Error404";
import { initializeAuth } from "./utils/authService";
import { AppDispatch } from "./store/Store";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import useSessionTimeout from "./hooks/useSessionTimeout/useSessionTimeout";
import { useMatomo, isMatomoLoaded } from "./hooks/useMatomo/useMatomo";

// SignIn/User stay code-split: real page weight (18KB+ gzip for User)
// that most loads never need. Sitemap/Error404 are tiny, static, and have
// no user-specific data — code-splitting them bought nothing but a
// Suspense fallback flash: the "Loading..." placeholder briefly renders,
// then gets replaced by the real page once its chunk arrives, growing
// the page and shoving the footer down. Measured directly (mobile
// Lighthouse, throttled 3G): on /sitemap this swap grows the page
// 903px -> 1561px around t=400ms, tripping CLS to 0.099 (footer moves
// out of the viewport) and dragging mobile performance to 92% (need
// 95%). Bundling them eagerly (both well under 1KB gzip) costs every
// page a couple KB in the shared chunk and removes the flash entirely.
const SignIn = lazy(() => import("./pages/signIn/SignIn"));
const User = lazy(() => import("./pages/user/User"));

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const sessionDuration = 5 * 60 * 1000;
  const location = useLocation();
  const { trackPageView } = useMatomo();

  useSessionTimeout(sessionDuration);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isMatomoLoaded()) {
        if (location.pathname.toLowerCase() !== "/user") {
          let pageTitle = "Argent Bank - Home";

          if (location.pathname === "/signin") {
            pageTitle = "Argent Bank - Sign In";
          } else if (location.pathname === "/user") {
            pageTitle = "Argent Bank - User Dashboard";
          } else if (location.pathname === "/sitemap") {
            pageTitle = "Argent Bank - Site Map";
          } else if (location.pathname === "/error404") {
            pageTitle = "Argent Bank - Page Not Found";
          }

          document.title = pageTitle;

          trackPageView({
            documentTitle: pageTitle,
            href: window.location.origin + location.pathname.toLowerCase(),
          });
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [location, trackPageView]);

  return (
    <>
      <Header />
      <main id="main-content">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <User />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/error404" />} />
            <Route path="/error404" element={<Error404 />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
