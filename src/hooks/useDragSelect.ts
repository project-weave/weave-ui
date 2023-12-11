import { Dispatch, SetStateAction, useState } from "react";

export type DragMouseEnterHandler<T> = (item: T) => void;
export type DragMouseUpHandler = () => void;
export type DragMouseDownHandler<T> = (item: T) => void;

type useDragSelectReturn<T> = {
  isAdding: boolean;
  isDragging: boolean;
  onMouseDown: DragMouseDownHandler<T>;
  onMouseEnter: DragMouseEnterHandler<T>;
  onMouseUp: DragMouseUpHandler;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  setIsDragging: Dispatch<SetStateAction<boolean>>;
};

export default function useDragSelect<T>(
  selected: Set<T>,
  setSelected: Dispatch<SetStateAction<Set<T>>>
): useDragSelectReturn<T> {
  const [isDragging, setIsDragging] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const onMouseDown: DragMouseDownHandler<T> = (item: T) => {
    setIsDragging(true);

    setIsDragging(true);
    setSelected((prev) => {
      const newSelected = new Set(prev);
      if (selected.has(item)) {
        setIsAdding(false);
        newSelected.delete(item);
      } else {
        setIsAdding(true);
        newSelected.add(item);
      }
      return newSelected;
    });
  };

  const onMouseEnter: DragMouseEnterHandler<T> = (item: T) => {
    if (isDragging) {
      setSelected((prev) => {
        const newSelected = new Set(prev);
        if (isAdding) {
          newSelected.add(item);
        } else {
          newSelected.delete(item);
        }
        return newSelected;
      });
    }
  };

  const onMouseUp: DragMouseUpHandler = () => {
    setIsDragging(false);
  };

  return {
    isAdding,
    isDragging,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    setIsAdding,
    setIsDragging
  };
}
