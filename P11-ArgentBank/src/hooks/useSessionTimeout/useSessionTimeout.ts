/** @format */

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../store/slices/usersSlice";
import { RootState } from "../../store/Store";

const useSessionTimeout = (timeout: number) => {
  const dispatch = useDispatch();
  const timerRef = useRef<number | null>(null);
  const isAuthenticated = useSelector(
    (state: RootState) => state.users.isAuthenticated,
  );

  useEffect(() => {
    const startTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const expiresAt = new Date().getTime() + timeout;
      sessionStorage.setItem("expiresAt", expiresAt.toString());

      timerRef.current = window.setTimeout(() => {
        dispatch(logoutUser());
      }, timeout);
    };

    if (isAuthenticated) {
      startTimer();

      const resetTimer = () => {
        startTimer();
      };

      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("mousedown", resetTimer);
      window.addEventListener("keydown", resetTimer);
      window.addEventListener("touchstart", resetTimer);
      window.addEventListener("focus", resetTimer, true);

      window.addEventListener("keyup", resetTimer);
      document.addEventListener("focusin", resetTimer);
      document.addEventListener("scroll", resetTimer);
      document.addEventListener("selectionchange", resetTimer);

      const observer = new MutationObserver(resetTimer);
      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ["aria-activedescendant"],
      });

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("mousedown", resetTimer);
        window.removeEventListener("keydown", resetTimer);
        window.removeEventListener("touchstart", resetTimer);
        window.removeEventListener("focus", resetTimer, true);
      };
    }
  }, [dispatch, timeout, isAuthenticated]);
};

export default useSessionTimeout;
