/** @format */

import { z } from "zod";
import { setAuthState, logoutUser } from "../store/slices/usersSlice";
import { AppDispatch } from "../store/Store";
import { usernameBlacklist } from "./blacklist";

// Schema for login API response
const loginResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  body: z.object({
    token: z.string(),
  }),
});

// Schema for user profile API response
const profileResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  body: z.object({
    id: z.string(),
    email: z.string(),
    userName: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    accounts: z
      .array(
        z.object({
          accountName: z.string(),
          accountNumber: z.string(),
          balance: z.string(),
          balanceType: z.string(),
        }),
      )
      .optional(),
  }),
});

// Schéma pour les données de connexion (credentials)
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export { loginSchema };

type LoginCredentials = z.infer<typeof loginSchema>;

export const loginUser = async (credentials: LoginCredentials) => {
  // Data validation with Zod
  const parsedCredentials = loginSchema.safeParse(credentials);
  if (!parsedCredentials.success) {
    // If validation fails, an error is thrown
    throw new Error(parsedCredentials.error.message);
  }

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
    redirect: "follow",
  };

  try {
    const response = await fetch(
      "/api/user/login", // Modification uniquement de la route
      requestOptions,
    );

    if (!response.ok) {
      // Attempt to read the error message, prioritizing JSON but falling back to text
      let errorMessage = `Login failed: ${response.status}`;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.message || JSON.stringify(errorData)}`;
        } catch (_jsonError) {
          // If JSON parsing fails, try to get text
          const textError = await response.text();
          errorMessage += ` - ${textError}`;
        }
      } else {
        // If not JSON, read as text
        const textError = await response.text();
        errorMessage += ` - ${textError}`;
      }
      throw new Error(errorMessage);
    }

    // Verify that the response is in JSON format
    const data = await response.json();

    // API response validation with Zod
    const parsedResponse = loginResponseSchema.safeParse(data);
    if (!parsedResponse.success) {
      throw new Error(JSON.stringify(parsedResponse.error.issues, null, 2));
    }

    const token = parsedResponse.data.body.token;

    // Set session duration (e.g. 1 hour)
    const expiresAt = new Date().getTime() + 5 * 60 * 1000; // 5 min in ms

    // Store token and expiration in sessionStorage
    sessionStorage.setItem("authToken", token);
    sessionStorage.setItem("expiresAt", expiresAt.toString());

    try {
      const userProfile = await fetchUserProfile(token);
      // Store important information in session
      sessionStorage.setItem("userId", userProfile.id);
      sessionStorage.setItem("currentUserName", userProfile.userName);
    } catch (error) {
      console.warn("Couldn't fetch user profile after login:", error);
      // Continue anyway, the user is logged in
    }

    return parsedResponse.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};
// Function to fetch user profile after login
export const fetchUserProfile = async (token: string) => {
  try {
    const response = await fetch("/api/user/profile", {
      // Route modification
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        `Fetch profile failed: ${response.status} - ${data.message}`,
      );
    }

    const data = await response.json();

    // API response validation with Zod
    const parsedResponse = profileResponseSchema.safeParse(data);
    if (!parsedResponse.success) {
      throw new Error(JSON.stringify(parsedResponse.error.issues, null, 2));
    }

    const user = parsedResponse.data.body;

    // If accounts is missing, initialize with empty array
    if (!user.accounts) {
      user.accounts = [];
    }

    // Si createdAt ou updatedAt sont absents, on les initialise
    if (!user.createdAt) {
      user.createdAt = new Date().toISOString();
    }
    if (!user.updatedAt) {
      user.updatedAt = new Date().toISOString();
    }

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const generateCSRFToken = () => {
  const token = Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem("csrfToken", token);
  return token;
};

export const validateUsername = (username: string): boolean => {
  const regex = new RegExp(usernameBlacklist.join("|"), "i");
  return !regex.test(username);
};

export const updateUserProfile = async (userName: string, token: string) => {
  try {
    if (!validateUsername(userName)) {
      throw new Error("Username contains inappropriate words or terms");
    }

    // Retrieve or generate a CSRF token
    const csrfToken =
      sessionStorage.getItem("csrfToken") || generateCSRFToken();

    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      throw new Error("User ID not found in session");
    }

    await fetch("/api/csrf/store", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        csrfToken,
      }),
    });

    const response = await fetch("/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-CSRF-Token": csrfToken, // Ajout du token CSRF
      },
      body: JSON.stringify({ userName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update profile: ${errorData.message}`);
    }

    sessionStorage.setItem("currentUserName", userName);

    const updatedProfile = await fetchUserProfile(token);
    return updatedProfile;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const initializeAuth = () => {
  return async (dispatch: AppDispatch) => {
    const token = sessionStorage.getItem("authToken");
    const expiresAt = sessionStorage.getItem("expiresAt");
    const storedUserName = sessionStorage.getItem("currentUserName");

    if (token && expiresAt) {
      const now = new Date().getTime();
      if (now > parseInt(expiresAt, 10)) {
        dispatch(logoutUser());
      } else {
        try {
          const userProfile = await fetchUserProfile(token);
          // Use the userName stored in sessionStorage if it exists
          if (storedUserName) {
            userProfile.userName = storedUserName;
          }
          dispatch(setAuthState(userProfile));
        } catch (error) {
          console.error("Failed to initialize authentication:", error);
          dispatch(logoutUser());
        }
      }
    }
  };
};
