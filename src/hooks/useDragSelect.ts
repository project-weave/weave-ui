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
    // TODO: make sure it screen doesnt
    if (!isDragging) return;

    switch (mode) {
      case DragMode.NONE:
        onTouchDragStart(item);
        break;
      case DragMode.ADD:
        setSelected((prev) => {
          const newSelected = new Set(prev);
          newSelected.add(item);
          return newSelected;
        });
        break;
      case DragMode.REMOVE:
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
    setSelected((prev) => {
      const newSelected = new Set(prev);
      switch (mode) {
        case DragMode.ADD:
          newSelected.add(item);
          break;
        case DragMode.REMOVE:
          newSelected.delete(item);
          break;
        default:
          break;
      }
      return newSelected;
    });
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
