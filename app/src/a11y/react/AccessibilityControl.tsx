/** @format */

"use client";

// Accessibility trigger (scaffolded template — you own it, edit freely):
// a button that opens the accessibility card.
//
// ⚠️ PLACEMENT: this component is meant to be placed IN THE PAGE FLOW
// (typically in your header), NOT as a floating `position: fixed` — a
// floating button overlaps content at high zoom (an accessibility defect).
// Render it wherever you want: <AccessibilityControl … />.

import {
  useState,
  useRef,
  useEffect,
  lazy,
  Suspense,
  type ReactNode,
} from "react";

// Lazy, and mounted only from the first open onward. The menu pulls in
// react-select and Emotion, measured at 31KB gzipped — over a third of the
// main bundle — for a panel most visitors never open. Same reasoning that
// took the menu's webfonts off every page load in 0.7.0: `display: none`
// stops the browser fetching fonts for a subtree, but a static import is
// resolved at build time and ships regardless. Only a dynamic import moves
// those bytes out of the initial download.
//
// `hasOpened` latches instead of tracking `menuOpen`, so the menu unmounts
// never — it mounts once, on first open, and stays. Preferences therefore
// keep their state across open/close exactly as before, and the chunk is
// fetched once.
const AccessibilityMenu = lazy(() => import("./AccessibilityMenu"));

// Default trigger icon — the package's own pictogram (half-dark/half-light
// eye + adjustment gauge: visual contrast settings), inlined so the
// scaffold ships zero image assets. It is a single-color glyph
// (`fill: currentColor` + transparency): the button's `color` drives it,
// so the theme/hover styles recolor it with plain `color`, no filters.
// Replace it via the `icon` prop.
function AccessibilityIcon() {
  return (
    <svg
      viewBox="-10 -10 230 230"
      width={24}
      height={24}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor" fillRule="evenodd" stroke="none">
        {/* Rounded frame (outer + inner ring) */}
        <path d="M 30,5 A 25,25 0 0 0 5,30 L 5,180 A 25,25 0 0 0 30,205 L 180,205 A 25,25 0 0 0 205,180 L 205,30 A 25,25 0 0 0 180,5 Z M 32,17 L 178,17 A 15,15 0 0 1 193,32 L 193,178 A 15,15 0 0 1 178,193 L 32,193 A 15,15 0 0 1 17,178 L 17,32 A 15,15 0 0 1 32,17 Z" />
        {/* Eye: solid left half (with the iris-left cut out as a
				    transparent hole via evenodd), outlined right half */}
        <path d="M 105,40 C 75,40 48,58 30,90 C 48,122 75,140 105,140 Z M 105,65 A 25,25 0 0 0 105,115 Z" />
        <path d="M 105,40 C 135,40 162,58 180,90 C 162,122 135,140 105,140 Z M 105,48 C 131,48 154,64 170,90 C 154,116 131,132 105,132 Z" />
        {/* Iris + pupil, split eye. The "light" halves are transparent
				    holes (the button shows through), never opaque white. Left:
				    a black pupil-left dot inside the iris-left hole above.
				    Right: a black iris-right holding a transparent pupil-right
				    hole. */}
        <path d="M 105,65 A 25,25 0 0 1 105,115 Z M 105,78 A 12,12 0 0 1 105,102 Z" />
        <path d="M 105,78 A 12,12 0 0 0 105,102 Z" />
        {/* Adjustment gauge: filled left, outlined right, round knob */}
        <path d="M 39,153 L 85,153 L 85,167 L 39,167 A 7,7 0 0 1 32,160 A 7,7 0 0 1 39,153 Z" />
        <path d="M 85,153 L 152,153 L 152,167 L 85,167 Z M 85,155 L 85,165 L 152,165 L 152,155 Z" />
        <path d="m 163.94166,146 a 14,14 0 1 1 0,28 14,14 0 0 1 0,-28 z m 0,6 a 8,8 0 1 0 0,16 8,8 0 0 0 0,-16 z" />
        {/* Gauge tick marks (split around the outlined section) */}
        <rect x={69} y={143} width={6} height={34} rx={2} />
        <rect x={89} y={143} width={6} height={12} rx={2} />
        <rect x={89} y={165} width={6} height={12} rx={2} />
        <rect x={109} y={143} width={6} height={12} rx={2} />
        <rect x={109} y={165} width={6} height={12} rx={2} />
        <rect x={129} y={143} width={6} height={12} rx={2} />
        <rect x={129} y={165} width={6} height={12} rx={2} />
      </g>
    </svg>
  );
}

interface AccessibilityControlProps {
  language: "fr" | "en";
  /** Corner the panel opens toward. */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  className?: string;
  /** Button icon (default: the package's accessibility pictogram). */
  icon?: ReactNode;
  /** Link to your accessibility statement (optional). */
  complianceUrl?: string;
}

export default function AccessibilityControl({
  language,
  position = "top-right",
  className = "",
  icon,
  complianceUrl,
}: AccessibilityControlProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Latches on the first open and never resets — see the lazy import above.
  const [hasOpened, setHasOpened] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape, returning focus to the button.
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [menuOpen]);

  const handleCloseMenu = () => {
    setMenuOpen(false);
    buttonRef.current?.focus();
  };

  const accessibilityText =
    language === "fr" ? "Options d'accessibilité" : "Accessibility options";

  return (
    <div
      className={`accessibility-control ${position} ${className}`}
      ref={menuRef}
    >
      <button
        className="accessibility-control__button"
        onClick={() => {
          setHasOpened(true);
          setMenuOpen((open) => !open);
        }}
        aria-expanded={menuOpen}
        aria-label={accessibilityText}
        data-tooltip={accessibilityText}
        ref={buttonRef}
      >
        <span className="accessibility-control__icon" aria-hidden="true">
          {icon ?? <AccessibilityIcon />}
        </span>
      </button>

      <div className={`accessibility-panel ${menuOpen ? "open" : ""}`}>
        {hasOpened && (
          <Suspense
            fallback={
              <p className="accessibility-panel__loading" role="status">
                {language === "fr" ? "Chargement…" : "Loading…"}
              </p>
            }
          >
            <AccessibilityMenu
              language={language}
              onClose={handleCloseMenu}
              complianceUrl={complianceUrl}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
