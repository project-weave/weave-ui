require("./register-typescript.cjs");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { EventFormSchema } = require("../src/types/Event.ts");

const base = {
  name: "Dinner",
  timeRange: { startTime: "09:00:00", endTime: "21:00:00" },
  timeZone: "America/Vancouver"
};

test("weekday creation accepts an unmounted specific-date field", () => {
  const result = EventFormSchema.parse({ ...base, availabilityType: 1, daysOfTheWeek: new Set(["2023-01-02"]) });
  assert.equal(result.daysOfTheWeek.size, 1);
  assert.equal(result.specificDates.size, 0);
});

test("specific-date creation accepts an unmounted weekday field", () => {
  const result = EventFormSchema.parse({ ...base, availabilityType: 0, specificDates: new Set(["2026-11-02"]) });
  assert.equal(result.specificDates.size, 1);
  assert.equal(result.daysOfTheWeek.size, 0);
});

test("the active selection remains required", () => {
  for (const availabilityType of [0, 1]) {
    const result = EventFormSchema.safeParse({ ...base, availabilityType });
    assert.equal(result.success, false);
    assert.equal(result.error.issues[0].path[0], availabilityType === 0 ? "specificDates" : "daysOfTheWeek");
  }
});

test("UTC is a valid event time zone", () => {
  const result = EventFormSchema.safeParse({
    ...base,
    timeZone: "UTC",
    availabilityType: 0,
    specificDates: new Set(["2026-11-02"])
  });
  assert.equal(result.success, true);
});

test("invalid and empty event time zones are rejected", () => {
  for (const timeZone of ["", "Not/A_Time_Zone"]) {
    const result = EventFormSchema.safeParse({
      ...base,
      timeZone,
      availabilityType: 0,
      specificDates: new Set(["2026-11-02"])
    });
    assert.equal(result.success, false);
  }
});
