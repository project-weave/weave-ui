async function checkScheduling(page) {
  const origin = new URL(page.url()).origin;
  if (!origin.startsWith("http")) throw new Error("Open the local app before running these checks.");
  const passed = [];
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
      consoleErrors.push(message.text());
    }
  });
  let missing = true;
  let creates = 0;
  let saves = 0;
  let reads = 0;
  let submittedTimeZone;
  let event = {
    id: "regression-missing",
    name: "Regression event",
    isSpecificDates: true,
    startTime: "09:00:00",
    endTime: "11:00:00",
    dates: ["2026-11-02", "2026-11-03", "2026-11-04"],
    timeZone: "America/Vancouver"
  };
  let responses = [
    { alias: "Alice", userId: "alice", availabilities: ["2026-11-02 09:00:00"] },
    { alias: "Bob", userId: "bob", availabilities: ["2026-11-02 09:00:00"] }
  ];
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const waitForMenusToClose = () => page.getByRole("menu").waitFor({ state: "hidden" });
  await page.unroute("**/api/v1/event**");
  await page.route("**/api/v1/event**", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      reads++;
      return route.fulfill({
        status: missing ? 404 : 200,
        contentType: "application/json",
        body: JSON.stringify(missing ? {} : { event, responses })
      });
    }
    if (request.url().endsWith("/availability")) {
      saves++;
      await new Promise((resolve) => setTimeout(resolve, 350));
      if (saves === 1) return route.fulfill({ status: 503, contentType: "application/json", body: "{}" });
      const body = request.postDataJSON();
      responses = [...responses.filter((response) => response.alias !== body.alias), { ...body, userId: "saved-user" }];
      return route.fulfill({ status: 200, contentType: "application/json", body: '{"success":true}' });
    }
    creates++;
    if (creates === 1) return route.fulfill({ status: 503, contentType: "application/json", body: "{}" });
    const body = request.postDataJSON();
    submittedTimeZone = body.time_zone;
    event = {
      ...event,
      id: "regression-created",
      name: body.name,
      dates: body.dates,
      isSpecificDates: body.is_specific_dates,
      startTime: body.start_time,
      endTime: body.end_time,
      timeZone: body.time_zone
    };
    return route.fulfill({ status: 200, contentType: "application/json", body: '{"event_id":"regression-created"}' });
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}/regression-missing`);
  await page.getByRole("heading", { name: "Event not found", exact: true }).waitFor();
  assert((await page.getByRole("heading", { name: "Mock Event", exact: true }).count()) === 0, "404 leaked demo data");
  missing = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await page.getByRole("heading", { name: event.name, exact: true }).waitFor();
  passed.push("event errors and retry");

  await page.goto(origin);
  const detectedTimeZone = await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  await page.getByPlaceholder("Event Name", { exact: true }).fill("Creation regression");
  const date = page.locator("#new-event-form [drag-select-attr]:not([disabled])").first();
  await date.focus();
  await page.keyboard.press("Space");
  assert((await date.getAttribute("aria-pressed")) === "true", "Keyboard date selection failed");
  await page.keyboard.press("Space");
  assert((await date.getAttribute("aria-pressed")) === "false", "Keyboard date deselection failed");
  await page.keyboard.press("Space");
  const selectedDateLabel = await date.getAttribute("aria-label");
  await page.getByText("Days of the week", { exact: true }).click();
  await page.getByRole("button", { name: "Monday", exact: true }).press("Space");
  await page.getByText("Specific dates", { exact: true }).click();
  assert(
    (await page.getByRole("button", { name: selectedDateLabel, exact: true }).getAttribute("aria-pressed")) === "true",
    "Switching date modes lost the selected date"
  );
  await page.getByText("Days of the week", { exact: true }).click();
  assert(
    (await page.getByRole("button", { name: "Monday", exact: true }).getAttribute("aria-pressed")) === "true",
    "Switching date modes lost the selected weekday"
  );
  await page.getByRole("button", { name: "Start time", exact: true }).press("Enter");
  await page.getByRole("combobox").fill("9am");
  await page.getByRole("option", { name: "9:00 AM", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByText("An error occurred while creating your event. Please try again later.", { exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForURL("**/regression-created");
  assert(creates === 2, "Creation did not retry exactly once");
  assert(submittedTimeZone === detectedTimeZone, "Creation submitted a different time zone than displayed");
  passed.push("keyboard selection, AM/PM search, weekday creation, and failed-create retry");

  event = {
    ...event,
    id: "regression-save",
    name: "Regression event with a long title that must wrap on smaller screens",
    isSpecificDates: true,
    startTime: "09:00:00",
    endTime: "11:00:00",
    dates: ["2026-11-02", "2026-11-03", "2026-11-04"]
  };
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${origin}/${event.id}`);
  await page.getByRole("button", { name: "Add your availability", exact: true }).click();
  const namePrompt = page.getByRole("dialog", { name: "Add your availability", exact: true });
  assert(
    (await namePrompt.getByRole("button", { name: "Back", exact: true }).count()) === 0,
    "Name prompt exposes participant switching"
  );
  await page.getByPlaceholder("What is your name?", { exact: true }).fill("Regression Person");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await namePrompt.waitFor({ state: "hidden" });
  const selected = () => page.locator('[grid-drag-select-attr][aria-pressed="true"]').count();
  const firstSlot = page.locator('[grid-drag-select-attr="0_0"]');
  await firstSlot.press("Space");
  assert((await selected()) === 1, "Keyboard time-slot selection failed");
  await firstSlot.press("Space");
  const firstBounds = await firstSlot.boundingBox();
  const lastBounds = await page.locator('[grid-drag-select-attr="2_0"]').boundingBox();
  await page.mouse.move(firstBounds.x + firstBounds.width / 2, firstBounds.y + firstBounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(lastBounds.x + lastBounds.width / 2, lastBounds.y + lastBounds.height / 2, { steps: 10 });
  await page.mouse.up();
  assert((await selected()) === 3, "Dragging did not select three time slots");
  const save = () =>
    page.getByRole("toolbar", { name: "Availability controls" }).getByRole("button", { name: "Save", exact: true });
  await save().click();
  assert((await page.locator("#availability-grid").getAttribute("aria-busy")) === "true", "Save has no pending state");
  assert(
    await page.getByRole("button", { name: "Participant profile: Regression Person", exact: true }).isDisabled(),
    "Participant can change during saving"
  );
  await page
    .getByText("An error occurred while saving your availability. Please try again later.", { exact: true })
    .waitFor();
  assert((await selected()) === 3, "Failed save lost the draft");
  const readsBeforeRetry = reads;
  await save().click();
  await page.getByText("Availability saved", { exact: true }).waitFor();
  await page.getByText("Availability saved", { exact: true }).waitFor({ state: "hidden" });
  assert(reads > readsBeforeRetry, "Save did not refetch event data");
  assert(saves === 2, "Unexpected duplicate saves");
  await page.getByRole("button", { name: "Participant profile: Regression Person", exact: true }).waitFor();
  passed.push("save pending state, draft recovery, retry, refetch, and participant identity");

  await page.getByRole("button", { name: "Edit your availability", exact: true }).click();
  await page.getByRole("button", { name: "Availability mode: Editing", exact: true }).waitFor();
  assert((await page.getByRole("dialog").count()) === 0, "Desktop asks a known participant for their name again");
  assert((await selected()) === 3, "Desktop re-entry did not load saved availability");
  await page.getByRole("button", { name: "Participant profile: Regression Person", exact: true }).click();
  assert(saves === 2, "Reopening availability submitted another response");
  assert(
    await page.getByRole("menuitem", { name: "Switch participant", exact: true }).isDisabled(),
    "Switching can discard an active draft"
  );
  assert(
    await page.getByRole("menuitem", { name: "Clear my name", exact: true }).isDisabled(),
    "Clearing a name can discard an active draft"
  );
  await page.getByRole("menuitem", { name: "Discard changes and view", exact: true }).click();
  await waitForMenusToClose();

  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole("heading", { name: event.name, exact: true }).waitFor();
  await page
    .getByRole("region", { name: "Event details", exact: true })
    .getByText("Responses", { exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Show participants", exact: true }).click();
  await page.getByRole("button", { name: "Bob", exact: true }).click();
  assert(
    (await page.getByRole("button", { name: "Bob", exact: true }).getAttribute("aria-pressed")) === "true",
    "Mobile filtering failed"
  );
  await page.getByRole("button", { name: "Show all responses", exact: true }).click();
  await page.getByRole("button", { name: "Hide participants", exact: true }).click();
  await page.getByRole("button", { name: "Availability mode: Viewing", exact: true }).click();
  await page.getByRole("menuitem", { name: "Edit your availability", exact: true }).click();
  await waitForMenusToClose();
  assert((await page.getByRole("dialog").count()) === 0, "Mobile asks a known participant for their name again");
  assert((await selected()) === 3, "Mobile re-entry did not load saved availability");
  await page.getByRole("button", { name: "Availability mode: Editing", exact: true }).click();
  assert(saves === 2, "Mode control submitted the form");
  await page.getByRole("menuitem", { name: "Discard changes and view", exact: true }).click();
  await waitForMenusToClose();
  assert(saves === 2, "Discard submitted the form");
  passed.push("mobile event details, participants, mode menu, and discard");

  await page.getByRole("button", { name: "Participant profile: Regression Person", exact: true }).click();
  await page.getByRole("menuitem", { name: "Switch participant", exact: true }).click();
  const switchPrompt = page.getByRole("dialog", { name: "Switch participant", exact: true });
  await switchPrompt.getByRole("button", { name: "Use a new name", exact: true }).click();
  await switchPrompt.getByPlaceholder("What is your name?", { exact: true }).fill("Discarded draft");
  await switchPrompt.getByRole("button", { name: "Continue", exact: true }).click();
  await switchPrompt.waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Availability mode: Editing", exact: true }).click();
  await page.getByRole("menuitem", { name: "Discard changes and view", exact: true }).click();
  await waitForMenusToClose();
  await page.getByRole("button", { name: "Availability mode: Viewing", exact: true }).click();
  await page.getByRole("menuitem", { name: "Add your availability", exact: true }).click();
  await waitForMenusToClose();
  assert((await page.getByRole("dialog").count()) === 0, "Unsaved named participant is prompted again");
  assert((await selected()) === 0, "A new name inherited another participant's availability");
  await page.getByRole("button", { name: "Participant profile: Discarded draft", exact: true }).waitFor();
  await page.getByRole("button", { name: "Availability mode: Editing", exact: true }).click();
  await page.getByRole("menuitem", { name: "Discard changes and view", exact: true }).click();
  await waitForMenusToClose();
  passed.push("saved and unsaved participant names are reused on desktop and mobile");

  await page.getByRole("button", { name: "Participant profile: Discarded draft", exact: true }).click();
  await page.getByRole("menuitem", { name: "Switch participant", exact: true }).click();
  await page.getByRole("button", { name: "Choose an existing participant", exact: true }).click();
  await page.getByRole("button", { name: "Bob", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await switchPrompt.waitFor({ state: "hidden" });
  assert((await selected()) === 1, "Switching did not load the chosen participant's availability");
  await page.getByRole("button", { name: "Participant profile: Bob", exact: true }).waitFor();
  await page.getByRole("button", { name: "Availability mode: Editing", exact: true }).click();
  await page.getByRole("menuitem", { name: "Discard changes and view", exact: true }).click();
  await waitForMenusToClose();
  await page.getByRole("button", { name: "Participant profile: Bob", exact: true }).click();
  await page.getByRole("menuitem", { name: "View my availability", exact: true }).click();
  await waitForMenusToClose();
  await page.getByRole("button", { name: "Show participants", exact: true }).click();
  assert(
    (await page.getByRole("button", { name: "Bob", exact: true }).getAttribute("aria-pressed")) === "true",
    "Profile filtering failed"
  );
  await page.getByRole("button", { name: "Participant profile: Bob", exact: true }).click();
  await page.getByRole("menuitem", { name: "Clear my name", exact: true }).click();
  await waitForMenusToClose();
  await page.getByRole("button", { name: "Participant profile: Guest", exact: true }).waitFor();
  assert(
    (await page.getByRole("button", { name: "Bob", exact: true }).getAttribute("aria-pressed")) === "false",
    "Clear name retained a participant filter"
  );
  assert(saves === 2 && responses.length === 3, "Clearing a name changed saved responses");
  await page.getByRole("button", { name: "Hide participants", exact: true }).click();
  await page.getByRole("button", { name: "Availability mode: Viewing", exact: true }).click();
  await page.getByRole("menuitem", { name: "Add your availability", exact: true }).click();
  await namePrompt.waitFor();
  assert(
    (await namePrompt.getByPlaceholder("What is your name?", { exact: true }).inputValue()) === "",
    "Clear name retained the previous name in the prompt"
  );
  await namePrompt.getByRole("button", { name: "Close", exact: true }).click();
  await namePrompt.waitFor({ state: "hidden" });
  passed.push("profile switching and clearing a name preserve saved responses");

  await page.getByRole("button", { name: "Event settings", exact: true }).click();
  const settings = page.getByRole("dialog", { name: "Event settings", exact: true });
  await settings.getByRole("button", { name: "Display time zone", exact: true }).click();
  await page.getByRole("combobox").fill("New York");
  await page.getByRole("option", { name: /New York/ }).click();
  await settings.getByRole("switch", { name: "Best Times", exact: true }).click();
  await settings.getByRole("button", { name: "Close", exact: true }).click();
  assert(
    (await page.getByRole("switch", { name: "Best Times", exact: true }).getAttribute("aria-checked")) === "true",
    "Settings did not update Best Times"
  );
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.regressionCopiedLink = text;
        }
      }
    })
  );
  await page.getByRole("button", { name: "Copy event link", exact: true }).click();
  await page.getByText("Event link copied", { exact: true }).waitFor();
  assert((await page.evaluate(() => window.regressionCopiedLink)) === page.url(), "Copied the wrong URL");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Clipboard unavailable");
        }
      }
    })
  );
  await page.getByRole("button", { name: "Copy event link", exact: true }).click();
  await page.getByText("Unable to copy the link. Copy it from your browser’s address bar.", { exact: true }).waitFor();
  passed.push("settings and truthful clipboard feedback");

  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(150);
    assert(
      (await page.evaluate(() => document.documentElement.scrollWidth)) <= width,
      `Horizontal overflow at ${width}px`
    );
  }
  passed.push("responsive layout from 320px to 1440px");

  event = {
    ...event,
    id: "regression-dates",
    endTime: "21:00:00",
    dates: Array.from({ length: 31 }, (_, i) => new Date(Date.UTC(2026, 10, 1 + i)).toISOString().slice(0, 10))
  };
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}/${event.id}`);
  const navigation = page.getByRole("navigation", { name: "Date navigation", exact: true });
  await navigation.getByText("Dates 1–3 of 31", { exact: true }).waitFor();
  assert(
    await navigation.getByRole("button", { name: "Previous dates", exact: true }).isDisabled(),
    "Previous is enabled on first page"
  );
  await page.mouse.wheel(0, 450);
  await page.waitForFunction(() => {
    const header = document.querySelector("#availability-grid > .sticky");
    return Math.abs(header.getBoundingClientRect().top - parseFloat(getComputedStyle(header).top)) < 1;
  });
  for (let i = 0; i < 10; i++) {
    const next = navigation.getByRole("button", { name: "Next dates", exact: true });
    if (await next.isDisabled()) break;
    await next.click();
  }
  await navigation.getByText("Dates 29–31 of 31", { exact: true }).waitFor();
  await page.setViewportSize({ width: 1440, height: 900 });
  await navigation.getByText("Dates 24–31 of 31", { exact: true }).waitFor();
  passed.push("sticky date navigation, pagination boundaries, and resize clamping");
  assert(pageErrors.length === 0, pageErrors.join("\n"));
  assert(consoleErrors.length === 0, consoleErrors.join("\n"));
  return { passed, creates, saves, unhandledPageErrors: pageErrors, consoleErrors };
}
