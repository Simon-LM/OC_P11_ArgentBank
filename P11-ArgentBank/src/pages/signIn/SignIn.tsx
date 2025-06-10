/** @format */

import React, { useState } from "react";
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
    setError(null); // Réinitialiser les erreurs précédentes
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

      setAriaMessage("Authentication successful. Redirecting to your account.");

      navigate("/user");
    } catch (err) {
      setAriaMessage("Authentication failed. Please check your credentials.");
      trackEvent({
        category: "User",
        action: "Login",
        name: `Failed login: ${err instanceof Error ? err.message : "Unknown error"}`,
      });

      if (err instanceof Error) {
        setError(getErrorMessage(err.message));
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
      // setTimeout(() => setAriaMessage(null), 3000); // Retiré ou ajusté si l'erreur est affichée
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
            tony@stark.com / password123
          </span>
        </p>
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
