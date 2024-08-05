import { useMemo, useRef, useState } from "react";

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

export enum DragMode {
  ADD,
  REMOVE,
  NONE
}

export type GridDragClearHandler = () => void;
export type GridDragStartHandler = (row: number, col: number) => void;
export type GridDragMoveHandler = (row: number, col: number) => void;
export type GridDragEndHandler = () => void;
export type GridDragSelectionCellCheck = (row: number, col: number) => boolean;
export type GridDragSelectionCellBorderCheck = (row: number, col: number) => CellBorderCheck;

type useGridDragSelectReturn = {
  dragMode: DragMode;
  isCellBorderOfSelectionArea: GridDragSelectionCellBorderCheck;
  isCellInSelectionArea: GridDragSelectionCellCheck;
  isDragging: boolean;
  onMouseDragMove: GridDragMoveHandler;
  onMouseDragStart: GridDragStartHandler;
  onTouchDragMove: GridDragMoveHandler;
  onTouchDragStart: GridDragStartHandler;
  onMouseDragEnd: GridDragEndHandler;
  onTouchDragEnd: GridDragEndHandler;
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

  const [dragMode, setDragMode] = useState<DragMode>(DragMode.NONE);

  const isDragging = useMemo(() => {
    return dragMode !== DragMode.NONE;
  }, [dragMode]);

  const onMouseDragStart: GridDragMoveHandler = (row: number, col: number) => {
    startCellPositionRef.current = { col, row };
    endCellPositionRef.current = { col, row };

    const element = mappingFunction(sortedRows[row], sortedCols[col]);
    if (!selected.includes(element)) {
      setDragMode(DragMode.ADD);
    } else {
      setDragMode(DragMode.REMOVE);
    }
  };

  const onMouseDragMove: GridDragMoveHandler = (row: number, col: number) => {
    if ((!isDragging && !startCellPositionRef.current) || !endCellPositionRef.current) return;

    endCellPositionRef.current = { col, row };
  };

  function onMouseDragEnd() {
    saveAndClearCurrentSelection();
    setDragMode(DragMode.NONE);
  }

  const onTouchDragStart: GridDragStartHandler = (row: number, col: number) => {
    if (row === -1 || col === -1) return;
    startCellPositionRef.current = { col, row };
    endCellPositionRef.current = { col, row };

    const element = mappingFunction(sortedRows[row], sortedCols[col]);
    if (!selected.includes(element)) {
      setDragMode(DragMode.ADD);
    } else {
      setDragMode(DragMode.REMOVE);
    }
  };

  const onTouchDragMove: GridDragMoveHandler = (row: number, col: number) => {
    if (row === -1 || col === -1) return;
    if (!isDragging || !startCellPositionRef.current || !endCellPositionRef.current) onTouchDragStart(row, col);

    endCellPositionRef.current = { col, row };
  };

  const onTouchDragEnd: GridDragEndHandler = () => {
    saveAndClearCurrentSelection();
    setDragMode(DragMode.NONE);
  };

  function saveAndClearCurrentSelection() {
    if (!isDragging) return;
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

    // NOTE: need to clear selection before calling add/remove
    // addSelection/removeSelection will cause the grid rerender
    // and we would like to show that the seleciton is completed when the grid is rerendered
    clearSelection();

    switch (dragMode) {
      case DragMode.ADD:
        addSelected(currentSelection);
        break;
      case DragMode.REMOVE:
        removeSelected(currentSelection);
        break;
      default:
        break;
    }
  }

  function clearSelection() {
    startCellPositionRef.current = null;
    endCellPositionRef.current = null;
  }

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
    dragMode,
    isCellBorderOfSelectionArea,
    isCellInSelectionArea,
    isDragging,
    onMouseDragMove,
    onMouseDragStart,
    onMouseDragEnd,
    onTouchDragMove,
    onTouchDragStart,
    onTouchDragEnd
  };
}

export function extractGridDragSelectData(e: TouchEvent) {
  const touch = e.touches[0];

  const touchX = touch.clientX;
  const touchY = touch.clientY;

  const touchedElement = document.elementFromPoint(touchX, touchY);
  return touchedElement?.getAttribute("grid-drag-select-attr");
}
