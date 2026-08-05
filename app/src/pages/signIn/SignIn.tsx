/** @format */

import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import signin from "./signin.module.scss";
import { loginUser, fetchUserProfile } from "../../utils/authService";
import { loginUserSuccess, setAuthState } from "../../store/slices/usersSlice";
import { AppDispatch } from "../../store/Store";
import { useMatomo } from "../../hooks/useMatomo/useMatomo";
import { FaUserCircle, FaInfoCircle, FaEye, FaEyeSlash } from "react-icons/fa";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { trackEvent } = useMatomo();
  const [ariaMessage, setAriaMessage] = useState<string | null>(null);

  // handleSubmit awaits two network calls, so everything after the first
  // `await` — including the `finally` — can run long after the component has
  // gone: the user navigates away, or a test finishes. React ignores a
  // setState on an unmounted component in a real browser, but in jsdom the
  // environment is torn down with it, and the same update throws
  // "ReferenceError: window is not defined" from React's own scheduler.
  //
  // That is the intermittent failure fixed twice before in this codebase
  // (Footer.tsx, then five timers in User.tsx). Same defect, different
  // trigger: those were uncleared setTimeout callbacks, this is an awaited
  // promise, so the guard is a mounted flag rather than a timer registry.
  //
  // ⚠️ NOT COVERED BY A TEST, deliberately. A test that unmounts and then
  // resolves the promise passes with or without this guard — verified by
  // removing the guard and watching it still pass. The throw needs jsdom to
  // be torn down, which only happens when the whole test FILE ends, so it
  // cannot be provoked from inside one. Judge any future test of this by the
  // same standard: delete the guard first and check the test actually fails.
  //
  // The evidence this fixes it is the stack trace, which named
  // `setIsLoading(false)` in the `finally` below, at this file's line 82.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const getErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes("401")) {
      return "Invalid email or password";
    }

    if (
      errorMessage.toLowerCase().includes("email") ||
      errorMessage.toLowerCase().includes("username")
    ) {
      return "Invalid email address";
    }

    if (errorMessage.toLowerCase().includes("password")) {
      return "Incorrect password";
    }

    return "Unable to login. Please check your credentials.";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Reset previous errors
    setIsLoading(true);
    setAriaMessage("Authenticating...");
    try {
      const result = await loginUser({ email, password });

      trackEvent({
        category: "User",
        action: "Login",
        name: "Successful login",
      });

      const token: string = result.body.token;

      dispatch(loginUserSuccess({ email, token }));

      const userProfile = await fetchUserProfile(token);

      dispatch(setAuthState(userProfile));

      if (isMountedRef.current) {
        setAriaMessage(
          "Authentication successful. Redirecting to your account.",
        );
      }

      navigate("/user");
    } catch (err) {
      if (isMountedRef.current) {
        setAriaMessage("Authentication failed. Please check your credentials.");
      }
      trackEvent({
        category: "User",
        action: "Login",
        name: `Failed login: ${err instanceof Error ? err.message : "Unknown error"}`,
      });

      if (isMountedRef.current) {
        if (err instanceof Error) {
          setError(getErrorMessage(err.message));
        } else {
          setError("An unexpected error occurred");
        }
      }
    } finally {
      // The one that actually threw: `finally` runs on the success path too,
      // after `navigate("/user")` has already started tearing this component
      // down.
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={signin["signin-page"]}>
      <section className={signin["signin-form"]}>
        <FaUserCircle
          className={signin["signin-form__icon"]}
          aria-hidden="true"
        />

        <h2 id="signin-title" className={signin["signin-form__title"]}>
          Sign In
        </h2>

        <p className={signin["signin-form__demo-info"]}>
          <FaInfoCircle aria-hidden="true" />
          <span>
            <strong>Demo credentials:</strong>
            steve@rogers.com / Louvre123
          </span>
        </p>

        {/* Element de test pour Pa11y - mauvais contraste intentionnel sur la page de connexion */}
        {/* <div
          style={{
            color: "#bbb",
            backgroundColor: "#ddd",
            padding: "6px",
            fontSize: "12px",
            margin: "5px 0",
          }}
        >
          SignIn page contrast test element
        </div> */}

        <form onSubmit={handleSubmit} aria-labelledby="signin-title" noValidate>
          <div className={signin["signin-form__input-group"]}>
            <label htmlFor="email" id="email-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              autoComplete="email"
              aria-describedby={
                error && error.includes("email") ? "error-message" : undefined
              }
              aria-invalid={error && error.includes("email") ? "true" : "false"}
            />
          </div>
          <div className={signin["signin-form__input-group"]}>
            <label htmlFor="password">Password</label>

            <div className={signin["signin-form__password-field"]}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                autoComplete="current-password"
                aria-describedby={
                  error && error.includes("password")
                    ? "error-message"
                    : undefined
                }
                aria-invalid={
                  error && error.includes("password") ? "true" : "false"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={signin["signin-form__password-toggle"]}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FaEyeSlash aria-hidden="true" />
                ) : (
                  <FaEye aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={signin["signin-form__button"]}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? "Authenticating..." : "Connect"}
          </button>
        </form>
        {error && (
          <p
            id="error-message"
            className={signin["signin-form__error"]}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )}
        {ariaMessage && (
          <p className="sr-only" role="status" aria-live="polite">
            {ariaMessage}
          </p>
        )}
      </section>
    </div>
  );
};

export default SignIn;
