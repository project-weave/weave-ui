import { CSSProperties } from "react";

import { cn } from "@/utils/cn";

type Edge = "bottom" | "left" | "right" | "top";

// direction the fade gets stronger in, i.e. towards the edge it is attached to
const GRADIENT_DIRECTION: Record<Edge, string> = {
  bottom: "to bottom",
  left: "to left",
  right: "to right",
  top: "to top"
};

type ProgressiveFadeProps = {
  className?: string;
  edge: Edge;
  style?: CSSProperties;
  visible: boolean;
};

/**
 * A progressive fade towards one edge of a scroll area, hinting that there is more content past it.
 * Position it absolutely against the edge it should touch.
 */
export default function ProgressiveFade({ className, edge, style, visible }: ProgressiveFadeProps) {
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
      {/* content fades out (to the card's white) towards the edge */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(${direction}, rgb(255 255 255 / 0), rgb(255 255 255 / 0.95))` }}
      />
    </div>
  );
}
