/** @format */

import { createInstance } from "@datapunt/matomo-tracker-react";

interface PageViewParams {
	documentTitle?: string;
	href?: string;
	customDimensions?: Array<{
		id: number;
		value: string;
	}>;
}

interface EventParams {
	category: string;
	action: string;
	name?: string;
	value?: number;
	documentTitle?: string;
	href?: string;
	customDimensions?: Array<{
		id: number;
		value: string;
	}>;
}

interface SiteSearchParams {
	keyword: string;
	category?: string;
	count?: number;
	documentTitle?: string;
	href?: string;
	customDimensions?: Array<{
		id: number;
		value: string;
	}>;
}

const matomoInstance = createInstance({
	urlBase: "//analytics.lostintab.com/",
	siteId: 2,
	disabled: process.env.NODE_ENV !== "production",
	heartBeat: {
		active: true,
		seconds: 30,
	},
	linkTracking: true,
	configurations: {
		disableCookies: true,
		setSecureCookie: true,
		setRequestMethod: "POST",
	},
});

export function useMatomo() {
	return {
		trackPageView: (params?: PageViewParams) =>
			matomoInstance.trackPageView(params),
		trackEvent: (params: EventParams) => matomoInstance.trackEvent(params),
		trackSiteSearch: (params: SiteSearchParams) =>
			matomoInstance.trackSiteSearch(params),
	};
}

export { matomoInstance };
