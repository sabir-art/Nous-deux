# À deux

Private shared household app in French. A couple uses one ChatGPT account across phones and iPad; each device chooses the person entering expenses. Records live in Cloudflare D1 and are scoped to the authenticated account. No household records are stored only in the browser.

## Features

- Common expenses split 50/50, cent-accurate balance, partial and full repayments.
- Editable and deletable expense history, monthly browsing, search, categories and CSV export.
- Shared shopping list with quantities and a separate task list with assignees, due dates and priorities.
- Shared monthly calendar, person filters, appointment date/time/place/notes, booking backlog with optional call-by date, and completed appointments. The home page lists upcoming dates.
- Configurable names, household title and optional monthly budget.
- Phone/tablet layouts, French labels, home-screen manifest and Apple touch icon.
- Active pages refresh every ten seconds and on focus. Offline writes are blocked with a clear message. Simultaneous writes use row versions to prevent silent overwrites.

## Access and accounting

Sites controls private authentication. Server routes require ChatGPT identity and scope every query and mutation to the stable user ID. Members are two labels within the same private account, not independent login identities. No money is transferred. Repayments record transfers already made outside the app. An odd cent is charged to the first person's share; this rule appears in settings and in the expense preview.

## Development

Use the Sites plugin workflow to install, build and publish. The source manifest declares the D1 `DB` binding. Migrations in `drizzle/` are applied by Sites on deployment. Do not edit applied migrations. The included starter scripts retain supported hosting integration.

Validation:

```sh
node --experimental-strip-types tests/domain.test.mjs
node tests/api.test.mjs
node node_modules/typescript/bin/tsc --noEmit
```

The API tests execute real route handlers and authentication helpers against isolated Miniflare D1 storage. They check input validation, account isolation, shared reads, record changes, stale-write conflicts and origin checks. Their Next headers shim exists only in the test bundle.

The app requires internet to load and save. It intentionally does not cache private financial data in a service worker. Home screen installation opens the live app.

## Migration vers GitHub

Ce dépôt conserve le code de la version existante, avec agenda, appels audio et notifications. Il ne contient aucune donnée du foyer ni les secrets de production. Cette version dépend encore de l’authentification ChatGPT/Sites et de Cloudflare D1. Le transfert sur GitHub ne constitue pas un déploiement indépendant : un hébergement et une authentification propre à l’application restent à mettre en place.
