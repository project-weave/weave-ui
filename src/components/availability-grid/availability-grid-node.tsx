export enum NodeType {
  PLACEHOLDER,
  ROW_HEADER,
  COLUMN_HEADER,
  TIME_SLOT,
  FIRST_CELL_IN_COLUMN,
  LAST_CELL_IN_COLUMN,
  COLUMN_HEADER_PLACEHOLDER
}

export class AvailabilityGridNode {
  displayedColIndex: number = 0;
  displayedRowIndex: number = 0;
  isNodeInLastActualCol: boolean = false;
  isNodeInLastDisplayedCol: boolean = false;
  isNodeInLastDisplayedRow: boolean = false;
  offsettedColIndex: number = 0;
  remHeight: number = 0;

  /*
  ********  Grid Configuration Example  ******** 
  
    CP = Column Header Placeholder
    C = Column Header 
    R = Row Header
    P = Placeholder
    F = First Cell in Column
    L = Last Cell in Column
    T = Time Slot

    CP C C C C C C C 
    P F F F F F F F
    R T T T T T T T
    R T T T T T T T
    R T T T T T T T
    R L L L L L L L 
  */

  getRenderType() {
    if (this.displayedColIndex === 0) {
      if (this.displayedRowIndex === 0) return NodeType.COLUMN_HEADER_PLACEHOLDER;
      if (this.displayedRowIndex === 1) return NodeType.PLACEHOLDER;
      return NodeType.ROW_HEADER;
    }
    if (this.displayedRowIndex === 0) return NodeType.COLUMN_HEADER;
    if (this.displayedRowIndex === 1) return NodeType.FIRST_CELL_IN_COLUMN;
    if (this.isNodeInLastDisplayedRow) return NodeType.LAST_CELL_IN_COLUMN;
    return NodeType.TIME_SLOT;
  }

  getSortedEventDatesIndex(): number {
    const renderType = this.getRenderType();
    if (
      renderType !== NodeType.COLUMN_HEADER &&
      renderType !== NodeType.TIME_SLOT &&
      renderType !== NodeType.FIRST_CELL_IN_COLUMN &&
      renderType !== NodeType.LAST_CELL_IN_COLUMN
    )
      return -1;

    return this.offsettedColIndex - 1;
  }

  getSortedEventTimesIndex(): number {
    const renderType = this.getRenderType();
    if (renderType !== NodeType.ROW_HEADER && renderType !== NodeType.TIME_SLOT) return -1;

    return this.displayedRowIndex - 2;
  }
}
