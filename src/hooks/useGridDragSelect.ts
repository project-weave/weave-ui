import { clearAllBodyScrollLocks, disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

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

enum InputMethod {
  MOUSE,
  TOUCH,
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
  removeSelected: (toRemove: V[]) => void,
  containerRef: RefObject<HTMLElement>
): useGridDragSelectReturn {
  useEffect(() => {
    return clearAllBodyScrollLocks();
  }, []);

  const startCellPositionRef = useRef<CellPosition | null>(null);
  const endCellPositionRef = useRef<CellPosition | null>(null);

  const [inputMethod, setInputMethod] = useState(InputMethod.NONE);
  const [dragMode, setDragMode] = useState<DragMode>(DragMode.NONE);

  const isDragging = useMemo(() => {
    return dragMode !== DragMode.NONE;
  }, [dragMode]);

  function onMouseDragStart(row: number, col: number) {
    if (inputMethod === InputMethod.TOUCH) return;

    startCellPositionRef.current = { col, row };
    endCellPositionRef.current = { col, row };

    const element = mappingFunction(sortedRows[row], sortedCols[col]);
    setInputMethod(InputMethod.MOUSE);
    if (!selected.includes(element)) {
      setDragMode(DragMode.ADD);
    } else {
      setDragMode(DragMode.REMOVE);
    }
  }

  function onMouseDragMove(row: number, col: number) {
    if (!isDragging || !startCellPositionRef.current || !endCellPositionRef.current) return;

    endCellPositionRef.current = { col, row };
  }

  function onMouseDragEnd() {
    saveAndClearCurrentSelection();
  }

  function onTouchDragStart(row: number, col: number) {
    if (row === -1 || col === -1) return;
    if (containerRef && containerRef.current !== null) disableBodyScroll(containerRef.current);

    startCellPositionRef.current = { col, row };
    endCellPositionRef.current = { col, row };

    const element = mappingFunction(sortedRows[row], sortedCols[col]);

    setInputMethod(InputMethod.TOUCH);

    if (!selected.includes(element)) {
      setDragMode(DragMode.ADD);
    } else {
      setDragMode(DragMode.REMOVE);
    }
  }

  function onTouchDragMove(row: number, col: number) {
    if (
      row === -1 ||
      col === -1 ||
      !isDragging ||
      !startCellPositionRef.current ||
      !endCellPositionRef.current ||
      inputMethod === InputMethod.MOUSE
    )
      return;
    if (containerRef && containerRef.current !== null) disableBodyScroll(containerRef.current);
    endCellPositionRef.current = { col, row };
  }

  function onTouchDragEnd() {
    if (containerRef && containerRef.current !== null) enableBodyScroll(containerRef.current);
    saveAndClearCurrentSelection();
  }

  const saveAndClearCurrentSelection = useCallback(() => {
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
    clearCurrentSelection();

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
  }, [dragMode, isDragging]);

  const clearCurrentSelection: GridDragClearHandler = useCallback(() => {
    setDragMode(DragMode.NONE);
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
