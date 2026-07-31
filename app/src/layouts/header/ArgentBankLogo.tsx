/** @format */

import React from "react";

// Inline (not <img src="...">) on purpose: an externally-referenced SVG
// file is loaded in an isolated context that can't see the page's CSS
// custom properties, so `var(--accent)` below would fail silently there.
// Inlined in the DOM, the wordmark follows --accent/--accent-ink through
// every theme (dark, high-contrast, CVD, anti-glare) like the rest of the
// site's chrome. Colors/weight matched against the site's own tokens —
// see public/img/ArgentBankLogo.svg for the frozen, standalone version
// (fixed hex, no theme awareness, kept as a portable backup).
// viewBox tightened to the text's actual bounds (SVG getBBox: x=10 y=14.5
// w=430.98 h=70, in the original "0 0 500 100" coordinate space) — that
// box left ~14% of its width and ~30% of its height as dead margin, so
// the wordmark rendered visibly smaller than the raster logo it replaces
// inside the same 200x40 header slot. Verified against a real screenshot
// diff (headless Chrome, both builds, same viewport): the untightened
// version measured 171x17px vs. the old raster's 186x21px.
const ArgentBankLogo: React.FC = () => (
  <svg
    className="header__logo-image"
    viewBox="0 5 450 90"
    role="img"
    aria-hidden="true"
  >
    <text x="10" y="72" className="header__logo-wordmark">
      <tspan fill="var(--accent)">ARGENT</tspan>
      <tspan fill="var(--accent-ink)">BANK</tspan>
    </text>
  </svg>
);

export default ArgentBankLogo;
