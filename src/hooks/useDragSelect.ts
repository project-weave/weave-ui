import { clearAllBodyScrollLocks, disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";

export type DragStartHandler<T> = (item: T) => void;
export type DragEndHandler = () => void;
export type DragMoveHandler<T> = (item: T) => void;

export enum DragMode {
  ADD,
  REMOVE,
  NONE
}

enum InputMethod {
  MOUSE,
  TOUCH,
  NONE
}

type useDragSelectReturn<T> = {
  onMouseDragEnd: DragEndHandler;
  onMouseDragMove: DragMoveHandler<T>;
  onMouseDragStart: DragStartHandler<T>;
  onTouchDragEnd: DragEndHandler;
  onTouchDragMove: DragMoveHandler<T>;
  onTouchDragStart: DragStartHandler<T>;
};

export default function useDragSelect<T>(
  selected: Set<T>,
  setSelected: Dispatch<SetStateAction<Set<T>>>,
  containerRef: RefObject<HTMLElement>
): useDragSelectReturn<T> {
  useEffect(() => {
    return clearAllBodyScrollLocks();
  }, []);

  // NOTE: This does not handle devices that use both mouse and touch
  const [inputMethod, setInputMethod] = useState(InputMethod.NONE);

  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<DragMode>(DragMode.NONE);

  const onMouseDragStart: DragMoveHandler<T> = (item: T) => {
    if (inputMethod === InputMethod.TOUCH) return;

    setInputMethod(InputMethod.MOUSE);
    setIsDragging(true);
    setSelected((prev) => {
      const newSelected = new Set(prev);
      if (!selected.has(item)) {
        setMode(DragMode.ADD);
        newSelected.add(item);
      } else {
        setMode(DragMode.REMOVE);
        newSelected.delete(item);
      }
      return newSelected;
    });
  };

  const onMouseDragMove: DragStartHandler<T> = (item: T) => {
    if (!isDragging) return;

    switch (mode) {
      case DragMode.ADD:
        if (selected.has(item)) return;
        setSelected((prev) => {
          const newSelected = new Set(prev);
          newSelected.add(item);
          return newSelected;
        });
        break;
      case DragMode.REMOVE:
        if (!selected.has(item)) return;
        setSelected((prev) => {
          const newSelected = new Set(prev);
          newSelected.delete(item);
          return newSelected;
        });
        break;
    }
  };

  const onMouseDragEnd: DragEndHandler = () => {
    setIsDragging(false);
  };

  const onTouchDragMove: DragMoveHandler<T> = (item: null | T) => {
    if (!item || !isDragging) return;

    if (containerRef && containerRef.current !== null) {
      disableBodyScroll(containerRef.current);
    }

    switch (mode) {
      case DragMode.NONE:
        onTouchDragStart(item);
        break;
      case DragMode.ADD:
        if (selected.has(item)) return;
        setSelected((prev) => {
          const newSelected = new Set(prev);
          newSelected.add(item);
          return newSelected;
        });
        break;
      case DragMode.REMOVE:
        if (!selected.has(item)) return;
        setSelected((prev) => {
          const newSelected = new Set(prev);
          newSelected.delete(item);
          return newSelected;
        });
        break;
    }
  };

  const onTouchDragStart: DragStartHandler<T> = (item: null | T) => {
    if (inputMethod === InputMethod.MOUSE) return;
    setInputMethod(InputMethod.TOUCH);

    if (containerRef && containerRef.current !== null) {
      disableBodyScroll(containerRef.current);
    }
    setIsDragging(true);
    // With Touch Drag, we need to put the onTouch handlers on the container element so we need to account for when drag start doesn't start on a target element
    if (item === null) {
      setMode(DragMode.NONE);
      return;
    }

    setSelected((prev) => {
      const newSelected = new Set(prev);
      if (!selected.has(item)) {
        setMode(DragMode.ADD);
        newSelected.add(item);
      } else {
        setMode(DragMode.REMOVE);
        newSelected.delete(item);
      }
      return newSelected;
    });
  };

  const onTouchDragEnd: DragEndHandler = () => {
    if (containerRef && containerRef.current !== null) {
      enableBodyScroll(containerRef.current);
    }
    setIsDragging(false);
  };

  return {
    onMouseDragEnd,
    onMouseDragMove,
    onMouseDragStart,
    onTouchDragEnd,
    onTouchDragMove,
    onTouchDragStart
  };
}
