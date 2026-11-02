require("./register-typescript.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { matchesTimeSearch } = require("../src/utils/timeSearch.ts");

test("time search accepts common AM/PM input formats", () => {
  for (const query of ["9am", "9 AM", "9:00am", "900a", "09:00 AM"]) {
    assert.equal(matchesTimeSearch("9:00 AM", query), true, query);
  }
  for (const query of ["930pm", "9:30 PM", "93p"]) {
    assert.equal(matchesTimeSearch("9:30 PM", query), true, query);
  }
});

test("time search distinguishes AM from PM and rejects invalid times", () => {
  assert.equal(matchesTimeSearch("9:00 PM", "9am"), false);
  assert.equal(matchesTimeSearch("9:30 AM", "9:99"), false);
  assert.equal(matchesTimeSearch("9:00 AM", "not a time"), false);
});

test("time search supports broad hour searches and next-day midnight", () => {
  assert.equal(matchesTimeSearch("9:30 PM", "9"), true);
  assert.equal(matchesTimeSearch("10:00 AM", "1"), true);
  assert.equal(matchesTimeSearch("12:00 AM +1", "12am"), true);
  assert.equal(matchesTimeSearch("10:30 AM", ""), true);
});
