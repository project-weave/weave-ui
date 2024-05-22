import { Dispatch, SetStateAction, useState } from "react";

export type DragStartHandler<T> = (item: T) => void;
export type DragEndHandler = () => void;
export type DragMoveHandler<T> = (item: T) => void;

export enum DragMode {
  ADD,
  REMOVE,
  NONE
}

type useDragSelectReturn<T> = {
  onDragEnd: DragEndHandler;
  onDragMove: DragMoveHandler<T>;
  onDragStart: DragStartHandler<T>;
  onTouchDragEnd: DragEndHandler;
  onTouchDragMove: DragMoveHandler<T>;
  onTouchDragStart: DragStartHandler<T>;
};

export default function useDragSelect<T>(
  selected: Set<T>,
  setSelected: Dispatch<SetStateAction<Set<T>>>
): useDragSelectReturn<T> {
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<DragMode>(DragMode.NONE);

  const onTouchDragMove: DragMoveHandler<T> = (item: T) => {
    if (!isDragging) return;

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

  const onTouchDragStart: DragStartHandler<T> = (item: T) => {
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
    setIsDragging(false);
  };

  const onDragStart: DragMoveHandler<T> = (item: T) => {
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

  const onDragMove: DragStartHandler<T> = (item: T) => {
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

  const onDragEnd: DragEndHandler = () => {
    setIsDragging(false);
  };

  return {
    onDragEnd,
    onDragMove,
    onDragStart,
    onTouchDragEnd,
    onTouchDragMove,
    onTouchDragStart
  };
}
