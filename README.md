# À deux

Shared household app in French, accessible without a ChatGPT or GitHub account. Both partners use their household password; each device chooses the person entering expenses. Records live in Cloudflare D1. No household records are stored only in the browser.

## Features

- Common expenses split 50/50, cent-accurate balance, partial and full repayments.
- Editable and deletable expense history, monthly browsing, search, categories and CSV export.
- Shared shopping list with quantities and a separate task list with assignees, due dates and priorities.
- Shared monthly calendar, person filters, appointment date/time/place/notes, booking backlog with optional call-by date, and completed appointments. The home page lists upcoming dates.
- Configurable names, household title and optional monthly budget.
- Phone/tablet layouts, French labels, home-screen manifest and Apple touch icon.
- Active pages refresh every ten seconds and on focus. Offline writes are blocked with a clear message. Simultaneous writes use row versions to prevent silent overwrites.

## Access and accounting

The application authenticates with a household password and opaque 90-day sessions in Secure, HttpOnly, SameSite=Strict cookies. Only session token hashes are stored. The password uses salted PBKDF2-SHA256 (100,000 iterations, supported by Workers). Login attempts are limited in D1 per hashed IP and 15-minute bucket. APIs ignore ChatGPT identity headers and derive the existing household ID from server configuration. Initial setup requires a one-use bootstrap link; its secret is carried only in the URL fragment, cleared on load, and compared to a server-side SHA-256 hash. Setup is atomically disabled after the first password is saved. The public site shell exposes no household data. No money is transferred. Repayments record transfers already made outside the app. An odd cent is charged to the first person's share; this rule appears in settings and in the expense preview.

## Development

Use the Sites plugin workflow to install, build and publish. The source manifest declares the D1 `DB` binding. Migrations in `drizzle/` are applied by Sites on deployment. Do not edit applied migrations. The included starter scripts retain supported hosting integration.

Validation:

```sh
node --experimental-strip-types tests/domain.test.mjs
node tests/api.test.mjs
node tests/access.test.mjs
node tests/communication.test.mjs
node node_modules/typescript/bin/tsc --noEmit
```

The API tests execute real route handlers and authentication helpers against isolated Miniflare D1 storage. They check input validation, account isolation, shared reads, record changes, stale-write conflicts and origin checks. Their Next headers shim exists only in the test bundle.

The app requires internet to load and save. It intentionally does not cache private financial data in a service worker. Home screen installation opens the live app.

## Production configuration

Source code is mirrored on GitHub; runtime hosting and D1 remain on Sites/Cloudflare. GitHub Pages cannot execute these server routes. The site audience must permit anonymous access to the login page; all private data routes independently require a valid household session.

Server-only secrets: `HOUSEHOLD_OWNER_ID` (existing records owner), `HOUSE_SETUP_HASH` (SHA-256 of initial setup token), and the existing VAPID keys. Never commit their values. A fresh installation requires these settings, the database migrations and a new bootstrap link. Do not replace an existing setup token or household owner during routine deployments. Password recovery currently requires an owner-assisted maintenance operation; no email recovery is implemented.

After setup, share the ordinary site URL and the household password privately with the other partner. Each device can sign out independently. Adding the app to the iPhone/iPad or Android home screen is supported by its web manifest; cookie persistence depends on browser settings.
