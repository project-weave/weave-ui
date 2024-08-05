import { clearAllBodyScrollLocks, disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { Dispatch, RefObject, SetStateAction, useEffect, useMemo, useState } from "react";

export type DragStartHandler<T> = (item: null | T) => void;
export type DragEndHandler = () => void;
export type DragMoveHandler<T> = (item: null | T) => void;

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
  const [dragMode, setDragMode] = useState<DragMode>(DragMode.NONE);

  const isDragging = useMemo(() => {
    return dragMode !== DragMode.NONE;
  }, [dragMode]);

  const onMouseDragStart: DragMoveHandler<T> = (item: null | T) => {
    if (item === null || inputMethod === InputMethod.TOUCH) return;

    setInputMethod(InputMethod.MOUSE);
    setSelected((prev) => {
      const newSelected = new Set(prev);
      if (!selected.has(item)) {
        setDragMode(DragMode.ADD);
        newSelected.add(item);
      } else {
        setDragMode(DragMode.REMOVE);
        newSelected.delete(item);
      }
      return newSelected;
    });
  };

  const onMouseDragMove: DragStartHandler<T> = (item: null | T) => {
    if (item === null || !isDragging) return;

    switch (dragMode) {
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
    if (item === null || inputMethod === InputMethod.MOUSE) return;
    if (containerRef && containerRef.current !== null) disableBodyScroll(containerRef.current);

    setInputMethod(InputMethod.TOUCH);
    setSelected((prev) => {
      const newSelected = new Set(prev);
      if (!selected.has(item)) {
        setDragMode(DragMode.ADD);
        newSelected.add(item);
      } else {
        setDragMode(DragMode.REMOVE);
        newSelected.delete(item);
      }
      return newSelected;
    });
  };

  const onMouseDragEnd: DragEndHandler = () => {
    setDragMode(DragMode.NONE);
  };

  const onTouchDragMove: DragMoveHandler<T> = (item: null | T) => {
    if (!item || !isDragging) return;
    if (containerRef && containerRef.current !== null) disableBodyScroll(containerRef.current);

    switch (dragMode) {
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

  const onTouchDragEnd: DragEndHandler = () => {
    if (containerRef && containerRef.current !== null) enableBodyScroll(containerRef.current);

    setDragMode(DragMode.NONE);
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
