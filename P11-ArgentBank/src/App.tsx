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
import { initializeAuth } from "./utils/authService";
import { AppDispatch } from "./store/Store";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import useSessionTimeout from "./hooks/useSessionTimeout/useSessionTimeout";
import { useMatomo, isMatomoLoaded } from "./hooks/useMatomo/useMatomo";

const SignIn = lazy(() => import("./pages/signIn/SignIn"));
const User = lazy(() => import("./pages/user/User"));
const Error404 = lazy(() => import("./pages/error404/Error404"));

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

          if (location.pathname === "/signIn") {
            pageTitle = "Argent Bank - Sign In";
          } else if (location.pathname === "/user") {
            pageTitle = "Argent Bank - User Dashboard";
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
            <Route path="/signIn" element={<SignIn />} />
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
