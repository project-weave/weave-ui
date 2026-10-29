require("./register-typescript.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { formatEventDateRange, isConsecutiveDay } = require("../src/utils/date.ts");

test("date summaries handle single dates, year boundaries, weekdays, and empty events", () => {
  assert.equal(formatEventDateRange(["2026-11-02"]), "Nov 2, 2026");
  assert.equal(formatEventDateRange(["2026-12-31", "2027-01-02"]), "Dec 31, 2026 – Jan 2, 2027");
  assert.equal(formatEventDateRange(["2023-01-02"], false), "Every Monday");
  assert.equal(formatEventDateRange([]), "");
});

test("dates with matching day numbers in different months are not consecutive", () => {
  assert.equal(isConsecutiveDay(new Date(2026, 0, 1), new Date(2026, 1, 2)), false);
  assert.equal(isConsecutiveDay(new Date(2026, 0, 31), new Date(2026, 1, 1)), true);
});
