/** @format */

import { useState, useEffect } from "react";

const useMediaQuery = (query: string): boolean => {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const mediaQueryList = window.matchMedia(query);
		const documentChangeHandler = () => setMatches(mediaQueryList.matches);

		// Set initial state
		documentChangeHandler();

		// Listen for changes
		mediaQueryList.addEventListener("change", documentChangeHandler);

		return () => {
			mediaQueryList.removeEventListener("change", documentChangeHandler);
		};
	}, [query]);

	return matches;
};

export default useMediaQuery;
