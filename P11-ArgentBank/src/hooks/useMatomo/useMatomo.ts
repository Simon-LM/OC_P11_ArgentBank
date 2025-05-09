/** @format */

type MatomoCommandParams = string | number | boolean | undefined;
type MatomoCommand = [string, ...MatomoCommandParams[]];

declare global {
	interface Window {
		_paq: MatomoCommand[];
	}
}

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

export function useMatomo() {
	return {
		trackPageView: (params?: PageViewParams) => {
			if (window._paq) {
				if (params) {
					const trackingData = ["trackPageView"];
					if (params.documentTitle) trackingData.push(params.documentTitle);
					window._paq.push(trackingData as MatomoCommand);
				} else {
					window._paq.push(["trackPageView"]);
				}
			}
		},
		trackEvent: (params: EventParams) => {
			if (window._paq) {
				window._paq.push([
					"trackEvent",
					params.category,
					params.action,
					params.name,
					params.value,
				] as MatomoCommand);
			}
		},
		trackSiteSearch: (params: SiteSearchParams) => {
			if (window._paq) {
				window._paq.push([
					"trackSiteSearch",
					params.keyword,
					params.category,
					params.count,
				] as MatomoCommand);
			}
		},
	};
}

export function isMatomoLoaded(): boolean {
	return typeof window !== "undefined" && !!window._paq;
}
