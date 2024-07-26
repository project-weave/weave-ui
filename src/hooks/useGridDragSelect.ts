import { useCallback, useRef, useState } from "react";

export type CellPosition = {
  col: number;
  row: number;
};

export type CellBorderCheck = {
  isBottomBorder: boolean;
  isLeftBorder: boolean;
  isRightBorder: boolean;
  isTopBorder: boolean;
};

export type GridDragClearHandler = () => void;
export type GridDragStartHandler = (row: number, col: number) => void;
export type GridDragMoveHandler = (row: number, col: number) => void;
export type GridDragSaveHandler = () => void;
export type GridDragSelectionCellCheck = (row: number, col: number) => boolean;
export type GridDragSelectionCellBorderCheck = (row: number, col: number) => CellBorderCheck;

type useGridDragSelectReturn = {
  isAdding: boolean;
  isCellBorderOfSelectionArea: GridDragSelectionCellBorderCheck;
  isCellInSelectionArea: GridDragSelectionCellCheck;
  isSelecting: boolean;
  onDragMove: GridDragMoveHandler;
  onDragStart: GridDragStartHandler;
  saveCurrentSelection: GridDragSaveHandler;
};

export default function useGridDragSelect<T, U, V>(
  sortedRows: T[],
  sortedCols: U[],
  mappingFunction: (arg1: T, arg2: U) => V,
  selected: V[],
  addSelected: (toAdd: V[]) => void,
  removeSelected: (toRemove: V[]) => void
): useGridDragSelectReturn {
  const startCellPositionRef = useRef<CellPosition | null>(null);
  const endCellPositionRef = useRef<CellPosition | null>(null);

  const [isSelecting, setIsSelecting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const onDragMove = useCallback(
    (row: number, col: number) => {
      if (isSelecting && startCellPositionRef.current && endCellPositionRef.current) {
        endCellPositionRef.current = { col, row };
      }
    },
    [isSelecting]
  );

  const onDragStart = useCallback(
    (row: number, col: number) => {
      setIsSelecting(true);
      startCellPositionRef.current = { col, row };
      endCellPositionRef.current = { col, row };

      const element = mappingFunction(sortedRows[row], sortedCols[col]);
      if (selected.includes(element)) {
        setIsAdding(false);
      } else {
        setIsAdding(true);
      }
    },
    [selected, sortedCols, sortedRows]
  );

  const saveCurrentSelection: GridDragSaveHandler = useCallback(() => {
    if (!isSelecting) return;

    const currentSelection = [] as V[];

    if (startCellPositionRef.current === null || endCellPositionRef.current === null) return [];
    const [minRow, maxRow] = [
      Math.min(startCellPositionRef.current.row, endCellPositionRef.current.row),
      Math.max(startCellPositionRef.current.row, endCellPositionRef.current.row)
    ];
    const [minCol, maxCol] = [
      Math.min(startCellPositionRef.current.col, endCellPositionRef.current.col),
      Math.max(startCellPositionRef.current.col, endCellPositionRef.current.col)
    ];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const el = mappingFunction(sortedRows[row], sortedCols[col]);
        currentSelection.push(el);
      }
    }

    clearCurrentSelection();

    if (!isAdding) {
      removeSelected(currentSelection);
    } else {
      addSelected(currentSelection);
    }
  }, [isAdding, isSelecting]);

  const clearCurrentSelection: GridDragClearHandler = useCallback(() => {
    setIsSelecting(false);
    startCellPositionRef.current = null;
    endCellPositionRef.current = null;
  }, []);

  const isCellInSelectionArea: GridDragSelectionCellCheck = (row: number, col: number): boolean => {
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

  const isCellBorderOfSelectionArea: GridDragSelectionCellBorderCheck = (row: number, col: number): CellBorderCheck => {
    if (startCellPositionRef.current === null || endCellPositionRef.current === null) {
      return {
        isBottomBorder: false,
        isLeftBorder: false,
        isRightBorder: false,
        isTopBorder: false
      };
    }

    const [minRow, maxRow] = [
      Math.min(startCellPositionRef.current.row, endCellPositionRef.current.row),
      Math.max(startCellPositionRef.current.row, endCellPositionRef.current.row)
    ];
    const [minCol, maxCol] = [
      Math.min(startCellPositionRef.current.col, endCellPositionRef.current.col),
      Math.max(startCellPositionRef.current.col, endCellPositionRef.current.col)
    ];

    return {
      isBottomBorder: maxRow === row && minCol <= col && col <= maxCol,
      isLeftBorder: minCol === col && minRow <= row && row <= maxRow,
      isRightBorder: maxCol === col && minRow <= row && row <= maxRow,
      isTopBorder: minRow === row && minCol <= col && col <= maxCol
    };
  };

  return {
    isAdding,
    isCellBorderOfSelectionArea,
    isCellInSelectionArea,
    isSelecting,
    onDragMove,
    onDragStart,
    saveCurrentSelection
  };
}
