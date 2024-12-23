/** @format */

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/Store";
import { logoutUser } from "../../pages/user/usersSlice";

const useSessionTimeout = (timeout: number) => {
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		const timer = setTimeout(() => {
			dispatch(logoutUser());
		}, timeout);

		const resetTimer = () => {
			clearTimeout(timer);
			// Redémarrer le timer
			setTimeout(() => {
				dispatch(logoutUser());
			}, timeout);
		};

		window.addEventListener("mousemove", resetTimer);
		window.addEventListener("keypress", resetTimer);

		return () => {
			clearTimeout(timer);
			window.removeEventListener("mousemove", resetTimer);
			window.removeEventListener("keypress", resetTimer);
		};
	}, [dispatch, timeout]);
};

export default useSessionTimeout;
