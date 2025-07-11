/** @format */
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  loginUser,
  fetchUserProfile,
  updateUserProfile,
  initializeAuth,
} from "./authService";
// Removing unused imports

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loginUser Function", () => {
  // Valid response mock
  const mockValidLoginResponse = {
    status: 200,
    message: "User successfully logged in",
    body: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
  };

  // Invalid response mock
  const mockInvalidLoginResponse = {
    status: 401,
    message: "invalid signature",
  };

  test("returns a valid response with token for valid credentials", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockValidLoginResponse,
    });

    const result = await loginUser({
      email: "steve@rogers.com",
      password: "password123",
    });

    expect(result).toEqual(mockValidLoginResponse);
    expect(sessionStorage.getItem("authToken")).toBe(
      mockValidLoginResponse.body.token,
    );
  });

  test("throws an error for invalid credentials", async () => {
    // Mock fetch response to simulate a connection error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ "Content-Type": "application/json" }), // Simulate JSON header
      json: async () => mockInvalidLoginResponse, // mockInvalidLoginResponse contains { status: 401, message: "invalid signature" }
    });

    await expect(
      loginUser({
        email: "steve@rogers.com",
        password: "wrongpass",
      }),
    ).rejects.toThrow("Login failed: 401 - invalid signature");
  });

  test("throws an error for non-JSON error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ "Content-Type": "text/html" }), // Simuler un header non-JSON
      text: async () => "Internal Server Error Page", // Simuler une réponse texte/HTML
    });

    await expect(
      loginUser({
        email: "steve@rogers.com",
        password: "password123",
      }),
    ).rejects.toThrow("Login failed: 500 - Internal Server Error Page");
  });

  test("throws a generic error if response.text() also fails", async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      headers: new Headers({ "Content-Type": "text/html" }),
      // Simuler l'échec de .json() d'abord, puis de .text()
      json: vi.fn().mockRejectedValueOnce(new Error("Failed to parse JSON")),
      text: vi.fn().mockRejectedValueOnce(new Error("Failed to read text")),
    });

    await expect(
      loginUser({
        email: "user@example.com",
        password: "password",
      }),
      // The expected error is the one thrown by the last catch in loginUser,
      // which is the original error from text() in this case, since authService rethrows it.
    ).rejects.toThrow("Failed to read text");
  });
});

describe("fetchUserProfile Function", () => {
  const mockValidProfileResponse = {
    status: 200,
    message: "Successfully got user profile data",
    body: {
      email: "steve@rogers.com",
      firstName: "Steve",
      lastName: "Rogers",
      userName: "Captain",
      createdAt: "2024-09-15T15:25:33.375Z",
      updatedAt: "2024-12-24T16:49:18.315Z",
      id: "66e6fc6d339057ebf4c9701b",
      accounts: [
        {
          accountName: "Argent Bank Checking",
          accountNumber: "8349",
          balance: "$2,082.79",
          balanceType: "Available Balance",
        },
      ],
    },
  };

  test("successfully fetches user profile", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockValidProfileResponse,
    });

    const profile = await fetchUserProfile("valid-token");
    expect(profile).toEqual(mockValidProfileResponse.body);
  });
});

describe("updateUserProfile Function", () => {
  beforeEach(() => {
    // Clear any previous session data
    sessionStorage.clear();
  });

  test("should update user profile successfully", async () => {
    // Set required session values before calling updateUserProfile
    sessionStorage.setItem("userId", "66e6fc6d339057ebf4c9701b");
    sessionStorage.setItem("csrfToken", "test-csrf-token");

    // First mock: CSRF store request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    // Second mock: Profile update request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 200,
        message: "Profile updated",
        body: {
          id: "66e6fc6d339057ebf4c9701b",
          email: "steve@rogers.com",
          userName: "CaptainUpdated",
          firstName: "Steve",
          lastName: "Rogers",
          createdAt: "2024-09-15T15:25:33.375Z",
          updatedAt: "2024-12-24T16:49:18.315Z",
        },
      }),
    });

    // Third mock: fetchUserProfile call that happens inside updateUserProfile
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 200,
        message: "Successfully got user profile data",
        body: {
          id: "66e6fc6d339057ebf4c9701b",
          email: "steve@rogers.com",
          userName: "CaptainUpdated",
          firstName: "Steve",
          lastName: "Rogers",
          createdAt: "2024-09-15T15:25:33.375Z",
          updatedAt: "2024-12-24T16:49:18.315Z",
          accounts: [],
        },
      }),
    });

    const result = await updateUserProfile("CaptainUpdated", "valid-token");
    expect(result.userName).toBe("CaptainUpdated");
  });

  test("should throw an error if update fails", async () => {
    sessionStorage.setItem("userId", "66e6fc6d339057ebf4c9701b");
    sessionStorage.setItem("csrfToken", "test-csrf-token");

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        status: 400,
        message: "Bad request",
      }),
    });

    await expect(
      updateUserProfile("CaptainUpdated", "invalid-token"),
    ).rejects.toThrow();
  });
});

describe("initializeAuth Function", () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    mockDispatch.mockClear();
    sessionStorage.clear();
  });

  test("does nothing if no token in sessionStorage", async () => {
    // Ensure sessionStorage is empty
    sessionStorage.clear();

    const initAuthThunk = initializeAuth();
    await initAuthThunk(mockDispatch);

    // Verify no actions were dispatched
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test("loads user if there is a valid token", async () => {
    // Set up a valid token
    sessionStorage.setItem("authToken", "test-token");
    sessionStorage.setItem("expiresAt", (Date.now() + 100000).toString());

    // Mock API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 200,
        message: "Successfully got user profile data",
        body: {
          id: "66e6fc6d339057ebf4c9701b",
          email: "steve@rogers.com",
          userName: "Captain",
          firstName: "Steve",
          lastName: "Rogers",
          createdAt: "2024-09-15T15:25:33.375Z",
          updatedAt: "2024-12-24T16:49:18.315Z",
        },
      }),
    });

    const initAuthThunk = initializeAuth();
    await initAuthThunk(mockDispatch);

    // Check that setAuthState was called with the profile
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "users/setAuthState",
      }),
    );
  });

  test("logs out user if token has expired", async () => {
    // Set up an expired token
    sessionStorage.setItem("authToken", "test-token");
    sessionStorage.setItem("expiresAt", (Date.now() - 1000).toString());

    const initAuthThunk = initializeAuth();
    await initAuthThunk(mockDispatch);

    // Verify logoutUser was called
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "users/logoutUser",
      }),
    );
  });
});
