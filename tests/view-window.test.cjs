require("./register-typescript.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createViewWindowSlice } = require("../src/store/viewWindowSlice.ts");

// a minimal stand-in for the zustand store: just enough state for the view window slice
function createStore(dateCount, windowSize) {
  let state;
  const get = () => state;
  const set = (partial) => {
    state = { ...state, ...(typeof partial === "function" ? partial(state) : partial) };
  };
  state = {
    ...createViewWindowSlice(set, get),
    availabilityGridViewWindowSize: windowSize,
    eventData: { sortedEventDates: Array.from({ length: dateCount }, (_, i) => `2026-12-${String(i + 1).padStart(2, "0")}`) }
  };
  return get;
}

test("nothing counts as unseen when every date fits on screen", () => {
  const get = createStore(4, 5);
  get().markColumnsInViewSeen();
  assert.equal(get().getFirstUnseenColumn(), null);
});

test("dates past the first window stay unseen until scrolled to", () => {
  const get = createStore(10, 4);
  get().markColumnsInViewSeen();
  assert.equal(get().furthestColumnSeen, 3);
  assert.equal(get().getFirstUnseenColumn(), 4);

  get().nextPage();
  get().markColumnsInViewSeen();
  assert.equal(get().getFirstUnseenColumn(), 8);

  // scrolling back doesn't forget what was already seen
  get().setLeftMostColumnInView(0);
  get().markColumnsInViewSeen();
  assert.equal(get().getFirstUnseenColumn(), 8);

  get().setLeftMostColumnInView(get().getMaxLeftMostColumnInView());
  get().markColumnsInViewSeen();
  assert.equal(get().furthestColumnSeen, 9);
  assert.equal(get().getFirstUnseenColumn(), null);
});

test("before the grid has laid out, every date is unseen", () => {
  const get = createStore(10, 4);
  assert.equal(get().getFirstUnseenColumn(), 0);
});
