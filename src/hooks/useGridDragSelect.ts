import { Dispatch, SetStateAction, useState } from "react";

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
  const [startCellPosition, setStartCellPosition] = useState<CellPosition | null>(null);
  const [endCellPosition, setEndCellPosition] = useState<CellPosition | null>(null);

  const [isSelecting, setIsSelecting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  function cellPositionToElement(row: number, col: number): V {
    return mappingFunction(sortedRows[row], sortedCols[col]);
  }

  const onMouseEnter: DragMouseEnterHandler = (row: number, col: number) => {
    if (isSelecting && startCellPosition && endCellPosition) {
      setEndCellPosition({ col, row });
    }
  };

  const onMouseDown: DragMouseDownHandler = (row: number, col: number) => {
    setIsSelecting(true);
    setStartCellPosition({ col, row });
    setEndCellPosition({ col, row });

    if (selected.has(cellPositionToElement(row, col))) {
      setIsAdding(false);
    } else {
      setIsAdding(true);
    }
  };

  const saveSelection: DragSaveHandler = () => {
    if (!isSelecting) return;

    setSelected((prevSelected) => {
      const selection = generateAllElementsWithinSelectionArea();
      if (!isAdding) {
        return new Set([...prevSelected].filter((el) => !selection.includes(el)));
      } else {
        return new Set([...prevSelected, ...selection]);
      }
    });

    clearSelection();
  };

  function generateAllElementsWithinSelectionArea() {
    if (startCellPosition === null || endCellPosition === null) return [];
    const [minRow, maxRow] = [
      Math.min(startCellPosition.row, endCellPosition.row),
      Math.max(startCellPosition.row, endCellPosition.row)
    ];
    const [minCol, maxCol] = [
      Math.min(startCellPosition.col, endCellPosition.col),
      Math.max(startCellPosition.col, endCellPosition.col)
    ];
    const elements = [] as V[];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        elements.push(cellPositionToElement(row, col));
      }
    }
    return elements;
  }

  const clearSelection: DragClearHandler = () => {
    setIsSelecting(false);
    setStartCellPosition(null);
    setEndCellPosition(null);
  };

  const isCellInSelectionArea: DragSelectionCellCheck = (row: number, col: number): boolean => {
    if (startCellPosition === null || endCellPosition === null) return false;
    const [minRow, maxRow] = [
      Math.min(startCellPosition.row, endCellPosition.row),
      Math.max(startCellPosition.row, endCellPosition.row)
    ];
    const [minCol, maxCol] = [
      Math.min(startCellPosition.col, endCellPosition.col),
      Math.max(startCellPosition.col, endCellPosition.col)
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
