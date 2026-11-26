import { Check, Eye, Pencil, Star } from "lucide-react";

// Icons shown in front of toast text. Same stroke as the control dock icons.
export const TOAST_ICONS = {
  allTimes: <Star absoluteStrokeWidth strokeWidth={1.5} />,
  bestTimes: <Star absoluteStrokeWidth fill="currentColor" strokeWidth={1.5} />,
  done: <Check absoluteStrokeWidth strokeWidth={2} />,
  editing: <Pencil absoluteStrokeWidth strokeWidth={1.5} />,
  viewing: <Eye absoluteStrokeWidth strokeWidth={1.5} />
};
