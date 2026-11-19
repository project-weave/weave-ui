import { CSSProperties } from "react";

import { cn } from "@/utils/cn";

type Edge = "bottom" | "left" | "right" | "top";

// direction the blur gets stronger in, i.e. towards the edge it is attached to
const GRADIENT_DIRECTION: Record<Edge, string> = {
  bottom: "to bottom",
  left: "to left",
  right: "to right",
  top: "to top"
};

// each layer blurs a little more and starts a little closer to the edge, giving a smooth ramp
const LAYERS = [
  { blur: 0.5, start: 0 },
  { blur: 1, start: 20 },
  { blur: 2, start: 40 },
  { blur: 4, start: 60 }
];

type ProgressiveBlurProps = {
  className?: string;
  edge: Edge;
  style?: CSSProperties;
  visible: boolean;
};

/**
 * A blur that ramps up towards one edge of a scroll area, hinting that there is more content past it.
 * Position it absolutely against the edge it should touch.
 */
export default function ProgressiveBlur({ className, edge, style, visible }: ProgressiveBlurProps) {
  const direction = GRADIENT_DIRECTION[edge];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-30 transition-opacity duration-300 ease-out motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
      style={style}
    >
      {LAYERS.map(({ blur, start }) => {
        const mask = `linear-gradient(${direction}, transparent ${start}%, black ${start + 25}%)`;
        return (
          <div
            className="absolute inset-0"
            key={blur}
            style={{
              WebkitBackdropFilter: `blur(${blur}px)`,
              WebkitMaskImage: mask,
              backdropFilter: `blur(${blur}px)`,
              maskImage: mask
            }}
          />
        );
      })}
      {/* soft fade to the card colour right at the edge */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(${direction}, rgb(255 255 255 / 0) 30%, rgb(255 255 255 / 0.85))` }}
      />
    </div>
  );
}
