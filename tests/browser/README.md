# Browser regression checks

Start the app with `npm run dev`, then open an isolated Playwright CLI session:

```sh
npx --yes --package @playwright/cli playwright-cli --session weave-regression open http://localhost:3000
npx --yes --package @playwright/cli playwright-cli --session weave-regression run-code --filename=tests/browser/scheduling.js
npx --yes --package @playwright/cli playwright-cli --session weave-regression close
```

Use your development server's actual port. The CLI's `open --config=/path/to/config.json` option supports an alternate installed browser. These checks intercept all event API requests and do not create or modify live events. Clipboard writes are also simulated inside the isolated browser.

The checks cover event errors and retry, creation failure recovery, keyboard controls, AM/PM search, save recovery and query refresh, mobile participant controls, reusing a selected name, profile switching and clearing a name without changing saved responses, dock actions, settings, clipboard feedback, responsive layout, and sticky date pagination.

Run `npm test` for the fast date, form-schema, and time-search unit tests.
