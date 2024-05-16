import { Dispatch, SetStateAction, useState } from "react";

export type DragStartHandler<T> = (item: T) => void;
export type DragEndHandler = () => void;
export type DragMoveHandler<T> = (item: T) => void;

type useDragSelectReturn<T> = {
  isAdding: boolean;
  isDragging: boolean;
  onDragEnd: DragEndHandler;
  onDragMove: DragMoveHandler<T>;
  onDragStart: DragStartHandler<T>;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  setIsDragging: Dispatch<SetStateAction<boolean>>;
};

export default function useDragSelect<T>(
  selected: Set<T>,
  setSelected: Dispatch<SetStateAction<Set<T>>>
): useDragSelectReturn<T> {
  const [isDragging, setIsDragging] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const onDragStart: DragMoveHandler<T> = (item: T) => {
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

  const onDragMove: DragStartHandler<T> = (item: T) => {
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

  const onDragEnd: DragEndHandler = () => {
    setIsDragging(false);
  };

  return {
    isAdding,
    isDragging,
    onDragEnd,
    onDragMove,
    onDragStart,
    setIsAdding,
    setIsDragging
  };
}
