import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";

export type CellPosition = {
  col: number;
  row: number;
};

export type DragClearHandler = () => void;
export type DragMouseDownHandler = (row: number, col: number) => void;
export type DragMouseEnterHandler = (row: number, col: number) => void;
export type DragSaveHandler = () => void;
export type DragSelectionCellCheck = (row: number, col: number) => boolean;

type useGridDragSelectReturn<V> = {
  clearSelection: DragClearHandler;
  isAdding: boolean;
  isCellInSelectionArea: DragSelectionCellCheck;
  onMouseDown: DragMouseDownHandler;
  onMouseEnter: DragMouseEnterHandler;
  saveSelection: DragSaveHandler;
  selected: Set<V>;
  setSelected: Dispatch<SetStateAction<Set<V>>>;
};

export default function useGridDragSelect<T, U, V>(
  sortedRows: T[],
  sortedCols: U[],
  mappingFunction: (arg1: T, arg2: U) => V,
  selected: Set<V>,
  setSelected: Dispatch<SetStateAction<Set<V>>>
): useGridDragSelectReturn<V> {
  const startCellPositionRef = useRef<CellPosition | null>(null);
  const endCellPositionRef = useRef<CellPosition | null>(null);

  const [isSelecting, setIsSelecting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const onMouseEnter = useCallback(
    (row: number, col: number) => {
      if (isSelecting && startCellPositionRef.current && endCellPositionRef.current) {
        endCellPositionRef.current = { col, row };
      }
    },
    [isSelecting]
  );

  const onMouseDown = useCallback(
    (row: number, col: number) => {
      setIsSelecting(true);
      startCellPositionRef.current = { col, row };
      endCellPositionRef.current = { col, row };

      const element = mappingFunction(sortedRows[row], sortedCols[col]);

      if (selected.has(element)) {
        setIsAdding(false);
      } else {
        setIsAdding(true);
      }
    },
    [selected, sortedCols, sortedRows]
  );

  const saveSelection: DragSaveHandler = () => {
    if (!isSelecting) return;
    const selection = generateAllElementsWithinSelectionArea();

    setSelected((prevSelected) => {
      if (!isAdding) {
        return new Set([...prevSelected].filter((el) => !selection.includes(el)));
      } else {
        return new Set([...prevSelected, ...selection]);
      }
    });

    clearSelection();
  };

  function generateAllElementsWithinSelectionArea() {
    if (startCellPositionRef.current === null || endCellPositionRef.current === null) return [];
    const [minRow, maxRow] = [
      Math.min(startCellPositionRef.current.row, endCellPositionRef.current.row),
      Math.max(startCellPositionRef.current.row, endCellPositionRef.current.row)
    ];
    const [minCol, maxCol] = [
      Math.min(startCellPositionRef.current.col, endCellPositionRef.current.col),
      Math.max(startCellPositionRef.current.col, endCellPositionRef.current.col)
    ];
    const elements = [] as V[];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const element = mappingFunction(sortedRows[row], sortedCols[col]);
        elements.push(element);
      }
    }
    return elements;
  }

  const clearSelection: DragClearHandler = () => {
    setIsSelecting(false);
    startCellPositionRef.current = null;
    endCellPositionRef.current = null;
  };

  const isCellInSelectionArea: DragSelectionCellCheck = (row: number, col: number): boolean => {
    if (startCellPositionRef.current === null || endCellPositionRef.current === null) return false;
    const [minRow, maxRow] = [
      Math.min(startCellPositionRef.current.row, endCellPositionRef.current.row),
      Math.max(startCellPositionRef.current.row, endCellPositionRef.current.row)
    ];
    const [minCol, maxCol] = [
      Math.min(startCellPositionRef.current.col, endCellPositionRef.current.col),
      Math.max(startCellPositionRef.current.col, endCellPositionRef.current.col)
    ];
    return minRow <= row && row <= maxRow && minCol <= col && col <= maxCol;
  };

  return {
    clearSelection,
    isAdding,
    isCellInSelectionArea,
    onMouseDown,
    onMouseEnter,
    saveSelection,
    selected,
    setSelected
  };
}
