/** @format */

/**
 * Integration tests for useSessionTimeout
 *
 * Integration scope:
 * - Redux + dispatch integration
 * - Timer and global event management
 * - Event listener lifecycle
 * - Complex user interaction testing
 */

import { renderHook } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { logoutUser } from "../../store/slices/usersSlice";
import useSessionTimeout from "./useSessionTimeout";
import type { ReactNode } from "react";

const mockDispatch = vi.fn();

// Redux store configuration for tests
const mockStore = configureStore({
  reducer: {
    users: () => ({ isAuthenticated: true }),
  },
});

// react-redux mock
vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={mockStore}>{children}</Provider>
);

describe("useSessionTimeout - Integration Tests", () => {
  const TEST_TIMEOUT = 5000;

  beforeEach(() => {
    vi.useFakeTimers();
    mockDispatch.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("triggers logoutUser after specified timeout", () => {
    renderHook(() => useSessionTimeout(TEST_TIMEOUT), {
      wrapper: TestWrapper,
    });

    vi.advanceTimersByTime(TEST_TIMEOUT);

    expect(mockDispatch).toHaveBeenCalledWith(logoutUser());
  });

  test("resets timer on mousemove", () => {
    renderHook(() => useSessionTimeout(TEST_TIMEOUT), {
      wrapper: TestWrapper,
    });

    // Advance by 3 seconds
    vi.advanceTimersByTime(3000);

    // Simulates mouse movement
    window.dispatchEvent(new MouseEvent("mousemove"));

    // Advance by 3 additional seconds
    vi.advanceTimersByTime(3000);

    // Should not be logged out
    expect(mockDispatch).not.toHaveBeenCalled();

    // Advance to the end of the new timeout
    vi.advanceTimersByTime(2000);
    expect(mockDispatch).toHaveBeenCalledWith(logoutUser());
  });

  test("resets timer on keydown", () => {
    renderHook(() => useSessionTimeout(TEST_TIMEOUT), {
      wrapper: TestWrapper,
    });

    // Advance by 3 seconds
    vi.advanceTimersByTime(3000);

    // Simulates keydown
    window.dispatchEvent(new KeyboardEvent("keydown"));

    // Advance by 3 additional seconds
    vi.advanceTimersByTime(3000);

    // Should not be logged out
    expect(mockDispatch).not.toHaveBeenCalled();

    // Advance to the end of the new timeout
    vi.advanceTimersByTime(2000);
    expect(mockDispatch).toHaveBeenCalledWith(logoutUser());
  });

  test("cleans up event listeners on unmount", () => {
    const { unmount } = renderHook(() => useSessionTimeout(TEST_TIMEOUT), {
      wrapper: TestWrapper,
    });

    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(5);
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "touchstart",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "focus",
      expect.any(Function),
      true,
    );
  });
});
