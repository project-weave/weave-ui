import { MouseEvent } from "react";

export function isLeftClick<T>(event: MouseEvent<T>): boolean {
  return event.button === 0;
}
