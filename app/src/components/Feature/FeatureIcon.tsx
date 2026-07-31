/** @format */

import React, { useId } from "react";

// Inline (not <img src="...">) on purpose: an externally-referenced SVG
// file is loaded in an isolated context that can't see the page's CSS
// custom properties, so `currentColor` — and through it --fg-base — would
// never reach it. Inlined in the DOM, the icons follow every theme (dark,
// high-contrast, CVD, anti-glare) like the rest of the site's chrome, the
// way the ring around them already followed --accent.
//
// Every shape is painted with a single `fill="currentColor"` and the areas
// that were white in the source files are punched out with a <mask> rather
// than painted over. Two reasons:
//   - the cut-outs become genuinely transparent, so whatever the active
//     theme puts behind the circle shows through them, with no second
//     token to keep in sync with the first;
//   - `currentColor` is the one paint value forced-colors mode (Windows
//     High Contrast) can reach, since it resolves against `color`, which
//     that mode does force. The PNGs these replace went through it
//     unchanged, as an opaque black-on-white disc.
//
// Accessibility, and why these carry no alternative text:
//   - RGAA 1.2 [A], decorative image: for an <svg>, aria-hidden="true" and
//     *none* of aria-label / aria-labelledby / aria-describedby /
//     role="img" / title, with no <title> or <desc>. The <h3> and <p> next
//     to each icon already state what the icon depicts, so naming it would
//     only make screen readers announce the same thing twice.
//   - RGAA 10.2 [A], content must survive with stylesheets off. This is
//     what the original 2024 implementation had to work around: the icons
//     were CSS background-images back then, which vanish along with the
//     stylesheet, so a text description sat behind them at z-index:-1 to
//     surface in that case. An inline <svg> is DOM content, not CSS, and
//     `fill` falls back to its own default when no author CSS applies —
//     the criterion is met structurally, and the fallback text that used
//     to stand in for it is gone.

const CHAT_FRONT_BUBBLE =
  "M 20 20 H 66 C 72.6 20 78 25.4 78 32 V 54 C 78 60.6 72.6 66 66 66 H 38 L 28 76 L 31 66 H 20 C 13.4 66 8 60.6 8 54 V 32 C 8 25.4 13.4 20 20 20 Z";

// useId() output contains delimiters (":" in React 18, "«»" in React 19)
// that have no business in an id referenced from url(#...). Stripping them
// keeps the reference valid while preserving per-instance uniqueness —
// duplicate ids across two icons would be an HTML validity error, i.e.
// RGAA 8.2 [A].
const useMaskId = (prefix: string) =>
  `${prefix}-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

const ChatIcon: React.FC = () => {
  const backMaskId = useMaskId("feature-icon-chat-back");
  const dotsMaskId = useMaskId("feature-icon-chat-dots");

  return (
    <svg
      className="feature-icon__svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
    >
      <defs>
        {/* Cuts the front bubble, plus a 7-unit halo around it, out of the
            bubble behind — that gap is what keeps the two readable as two
            shapes now that they are a single flat color. */}
        <mask id={backMaskId}>
          <rect width="100" height="100" fill="#fff" />
          <path
            d={CHAT_FRONT_BUBBLE}
            fill="#000"
            stroke="#000"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </mask>
        {/* The three dots, cut out instead of painted white. */}
        <mask id={dotsMaskId}>
          <rect width="100" height="100" fill="#fff" />
          <circle cx="31" cy="43" r="3.8" fill="#000" />
          <circle cx="43" cy="43" r="3.8" fill="#000" />
          <circle cx="55" cy="43" r="3.8" fill="#000" />
        </mask>
      </defs>
      <path
        mask={`url(#${backMaskId})`}
        d="M 50 38 H 76 C 81.5 38 86 42.5 86 48 V 66 C 86 71.5 81.5 76 76 76 H 70 L 75 88 L 63 76 H 50 C 44.5 76 40 71.5 40 66 V 64"
      />
      <path mask={`url(#${dotsMaskId})`} d={CHAT_FRONT_BUBBLE} />
    </svg>
  );
};

const MoneyIcon: React.FC = () => {
  const noteMaskId = useMaskId("feature-icon-money-note");

  return (
    <svg
      className="feature-icon__svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
    >
      <defs>
        {/* Alternating white (keep) / black (remove) passes carve the front
            note's inner frame line, the coin disc and the $ out of it, in
            the same stacking order the source file painted them. */}
        <mask id={noteMaskId}>
          <rect width="100" height="100" fill="#fff" />
          <rect x="20" y="46" width="48" height="24" fill="#000" />
          <rect x="22" y="48" width="44" height="20" fill="#fff" />
          <circle cx="44" cy="58" r="11" fill="#000" />
          <text
            x="44"
            y="65"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontSize="19"
            fill="#fff"
            textAnchor="middle"
          >
            $
          </text>
        </mask>
      </defs>
      {/* The two notes stacked behind, drawn as plain L-shaped edges. They
          don't overlap the front note, so they need no mask. */}
      <path d="M 24 24 H 84 V 56 H 79 V 29 H 24 Z" />
      <path d="M 20 33 H 78 V 65 H 73 V 38 H 20 Z" />
      <rect x="16" y="42" width="56" height="32" mask={`url(#${noteMaskId})`} />
    </svg>
  );
};

const SecurityIcon: React.FC = () => {
  const bodyMaskId = useMaskId("feature-icon-security-body");

  return (
    <svg
      className="feature-icon__svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
    >
      <defs>
        {/* The tick is cut out of the shield rather than stroked over it. */}
        <mask id={bodyMaskId}>
          <rect width="100" height="100" fill="#fff" />
          <path
            d="M 39 49 L 47 57 L 62 40"
            fill="none"
            stroke="#000"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      {/* Outer outline */}
      <path
        d="M 50 12 L 78 22 C 78 52 68 74 50 88 C 32 74 22 52 22 22 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Shield body */}
      <path
        d="M 50 18 L 73 26 C 73 50 64 69 50 81 C 36 69 27 50 27 26 Z"
        mask={`url(#${bodyMaskId})`}
      />
    </svg>
  );
};

interface FeatureIconProps {
  /** Icon key, e.g. "chat" — anything unknown renders nothing. */
  name: string;
}

const FeatureIcon: React.FC<FeatureIconProps> = ({ name }) => {
  switch (name) {
    case "chat":
      return <ChatIcon />;
    case "money":
      return <MoneyIcon />;
    case "security":
      return <SecurityIcon />;
    default:
      return null;
  }
};

export default FeatureIcon;
