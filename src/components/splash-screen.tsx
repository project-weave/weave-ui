/**
 * White intro screen shown on first load: the Weave mark draws itself once, then the screen fades
 * away to reveal the page. Pure CSS (see `.splash` in globals.css), so it works before hydration and
 * is skipped entirely for people who prefer reduced motion.
 */
export default function SplashScreen() {
  return (
    <div aria-hidden="true" className="splash">
      <svg className="w-11" fill="none" viewBox="18.53 26 62.94 52">
        <path
          className="splash-draw"
          d="M24 30C20 56 24 74 38 74C50 74 61 62 61 48C61 40 56 36 50 36C44 36 39 40 39 48C39 62 50 74 62 74C76 74 80 56 76 30"
          pathLength={1}
          stroke="#9747FF"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={8}
        />
      </svg>
    </div>
  );
}
