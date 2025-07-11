/** @format */

import { describe, it, expect, beforeEach } from "vitest";
import { useMatomo, isMatomoLoaded } from "./useMatomo";

describe("useMatomo", () => {
  let originalPaq: typeof window._paq;

  beforeEach(() => {
    originalPaq = window._paq;
    window._paq = [];
  });

  afterEach(() => {
    window._paq = originalPaq;
  });

  it("trackPageView sans params pousse la commande de base", () => {
    const { trackPageView } = useMatomo();
    trackPageView();
    expect(window._paq[0]).toEqual(["trackPageView"]);
  });

  it("trackPageView avec documentTitle pousse la commande avec titre", () => {
    const { trackPageView } = useMatomo();
    trackPageView({ documentTitle: "Titre test" });
    expect(window._paq[0]).toEqual(["trackPageView", "Titre test"]);
  });

  it("trackEvent pousse la bonne commande", () => {
    const { trackEvent } = useMatomo();
    trackEvent({ category: "cat", action: "act", name: "nom", value: 42 });
    expect(window._paq[0]).toEqual(["trackEvent", "cat", "act", "nom", 42]);
  });

  it("trackSiteSearch pousse la bonne commande", () => {
    const { trackSiteSearch } = useMatomo();
    trackSiteSearch({ keyword: "mot", category: "cat", count: 3 });
    expect(window._paq[0]).toEqual(["trackSiteSearch", "mot", "cat", 3]);
  });
});

describe("isMatomoLoaded", () => {
  it("retourne true si _paq existe", () => {
    window._paq = [];
    expect(isMatomoLoaded()).toBe(true);
  });
  it("retourne false si _paq n'existe pas", () => {
    // @ts-expect-error: intentional suppression of window._paq to test isMatomoLoaded without _paq
    delete window._paq;
    expect(isMatomoLoaded()).toBe(false);
  });
});
