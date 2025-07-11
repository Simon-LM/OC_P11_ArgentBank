/** @format */

import { renderHook, act } from "@testing-library/react";
import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  afterEach,
  Mock,
} from "vitest";
import useMediaQuery from "./useMediaQuery";

// Defines the type of object returned by our matchMedia simulation
interface MockMediaQueryListInstance {
  matches: boolean;
  media: string;
  onchange: null | ((event: Partial<MediaQueryListEvent>) => void);
  addListener: Mock;
  removeListener: Mock;
  addEventListener: Mock;
  removeEventListener: Mock;
  dispatchEvent: Mock;
  simulateChange: (newMatches: boolean) => void;
}

// Helper to simulate window.matchMedia
const createMatchMediaMock = (initialMatches: boolean) => {
  const listeners: Array<(event: Partial<MediaQueryListEvent>) => void> = [];
  // This state is captured by the closure of mockImplementation and simulateChange
  let currentMatchesState = initialMatches;

  const mockFn = vi
    .fn()
    .mockImplementation((query: string): MockMediaQueryListInstance => {
      const mqlInstance: MockMediaQueryListInstance = {
        get matches() {
          return currentMatchesState;
        },
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(
          (
            type: string,
            listenerCb: (event: Partial<MediaQueryListEvent>) => void,
          ) => {
            if (type === "change") {
              listeners.push(listenerCb);
            }
          },
        ),
        removeEventListener: vi.fn(
          (
            type: string,
            listenerCb: (event: Partial<MediaQueryListEvent>) => void,
          ) => {
            if (type === "change") {
              const index = listeners.indexOf(listenerCb);
              if (index !== -1) {
                listeners.splice(index, 1);
              }
            }
          },
        ),
        dispatchEvent: vi.fn(),
        // Function to simulate a media query change
        simulateChange: (newMatchesValue: boolean) => {
          currentMatchesState = newMatchesValue; // Updates the captured state
          const eventArg = {
            matches: currentMatchesState,
            media: query,
          } as Partial<MediaQueryListEvent>;
          listeners.forEach((listener) => listener(eventArg));
        },
      };
      return mqlInstance;
    });
  return mockFn;
};

let currentMock: ReturnType<typeof createMatchMediaMock>; // Type: vi.Mock<[string], MockMediaQueryListInstance>

describe("useMediaQuery hook", () => {
  beforeEach(() => {
    // By default, the media query does not match
    currentMock = createMatchMediaMock(false);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: currentMock,
    });
  });

  afterEach(() => {
    // Clean up the mock
    vi.restoreAllMocks();
  });

  test("should return false when media query does not match initially", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 768px)");
  });

  test("should return true when media query matches initially", () => {
    // Simulate initial match by recreating the mock
    currentMock = createMatchMediaMock(true);
    Object.defineProperty(window, "matchMedia", {
      value: currentMock,
    });

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  test("should update when media query changes from false to true", () => {
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false); // Initial verification

    act(() => {
      // Get the instance returned by the call to window.matchMedia (currentMock)
      const mqlInstance = currentMock.mock.results[0].value;
      mqlInstance.simulateChange(true);
    });

    expect(result.current).toBe(true); // Verification after change
  });

  test("should update when media query changes from true to false", () => {
    // Simulate initial match
    currentMock = createMatchMediaMock(true);
    Object.defineProperty(window, "matchMedia", {
      value: currentMock,
    });

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true); // Initial verification

    act(() => {
      const mqlInstance = currentMock.mock.results[0].value;
      mqlInstance.simulateChange(false);
    });

    expect(result.current).toBe(false); // Verification after change
  });

  test("should add and remove event listener correctly", () => {
    const query = "(max-width: 600px)";
    const { unmount } = renderHook(() => useMediaQuery(query));

    // Verify that addEventListener was called
    const matchMediaInstance = currentMock.mock.results[0].value;
    expect(matchMediaInstance.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );

    // Simulate unmounting
    unmount();

    // Verify that removeEventListener was called with the same handler
    expect(matchMediaInstance.removeEventListener).toHaveBeenCalledWith(
      "change",
      (matchMediaInstance.addEventListener as Mock).mock.calls[0][1], // Gets the handler passed to addEventListener
    );
  });

  test("should re-evaluate and re-attach listener if query string changes", () => {
    const initialQuery = "(min-width: 768px)";
    const newQuery = "(min-width: 1024px)";
    currentMock = createMatchMediaMock(false); // Initial state for initialQuery
    Object.defineProperty(window, "matchMedia", { value: currentMock });

    const { rerender, result } = renderHook(
      ({ query }) => useMediaQuery(query),
      {
        initialProps: { query: initialQuery },
      },
    );

    expect(result.current).toBe(false); // Initial state with initialQuery
    expect(window.matchMedia).toHaveBeenCalledWith(initialQuery);
    const initialMatchMediaInstance = currentMock.mock.results[0].value;

    // Change the query and simulate that the new query matches
    // We need to recreate the mock to change the initial state that `useMediaQuery` will see for the new query
    act(() => {
      currentMock = createMatchMediaMock(true);
      Object.defineProperty(window, "matchMedia", { value: currentMock });
    });

    rerender({ query: newQuery });

    // After rerender, useMediaQuery runs again with newQuery.
    // window.matchMedia (our updated currentMock) is called.
    expect(window.matchMedia).toHaveBeenCalledWith(newQuery);
    // The hook should now reflect the state of the new mock (true).
    expect(result.current).toBe(true);

    // Verify that the old listener was removed (on the original instance)
    expect(initialMatchMediaInstance.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );

    // Verify that a new listener has been added (on the new instance, if applicable, or the current mock)
    // currentMock.mock.results[0] is the call for initialQuery
    // currentMock.mock.results[1] is the call for newQuery
    const newMatchMediaInstance = currentMock.mock.results[0].value; // The mock has been reset, so this is the first call to the *new* mock
    expect(newMatchMediaInstance.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
