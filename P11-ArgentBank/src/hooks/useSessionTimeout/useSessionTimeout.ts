/** @format */

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../pages/user/usersSlice";
import { RootState } from "../../store/Store";

const useSessionTimeout = (timeout: number) => {
	const dispatch = useDispatch();
	const timerRef = useRef<number | null>(null);
	const isAuthenticated = useSelector(
		(state: RootState) => state.users.isAuthenticated
	);

	useEffect(() => {
		const startTimer = () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}

			// Mettre à jour expiresAt dans sessionStorage
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
			window.addEventListener("keypress", resetTimer);

			return () => {
				if (timerRef.current) {
					clearTimeout(timerRef.current);
				}
				window.removeEventListener("mousemove", resetTimer);
				window.removeEventListener("keypress", resetTimer);
			};
		}
	}, [dispatch, timeout, isAuthenticated]);
};

export default useSessionTimeout;
