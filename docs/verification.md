# Local verification record

Executed on 20 October 2026 on Windows with Node.js 24.13.0, Next.js 16.4.2, and React 19.3.1.

| Check | Result | What it establishes |
|---|---|---|
| `npm run verify` | Passed | ESLint, Next route types and strict TypeScript, 3 unit tests, 16 API integration tests, production build. |
| `npm run lint` and `npm run build` after retry-control change | Passed | The final web source lints and builds; build includes TypeScript validation. |
| `npm run test:e2e` | 5 passed | Production web/API/MongoDB journeys described below. |
| Desktop and phone visual inspection | Reviewed | Catalog at 1440px and 390px widths, plus workshop detail. No browser page errors or horizontal overflow on the catalog. |
| Demo start, Ctrl+C, restart | Checked | Development stack starts on Windows; ports 3000/5000 are released after shutdown and can be reused. |
| `npm audit --omit=dev` | 0 vulnerabilities | Registry audit for the installed production dependency graph only. Full audit still reports development-tool advisories; see [testing](testing.md#dependency-audit-limitation). |
| Git ignore checks | Passed | Local API configuration, web environment file, and temporary reference downloads are ignored. |

The browser journeys exercise guest search and saved-workshop persistence, phone overflow, member signup/reserve/duplicate/move/cancel/logout, member admin-page denial, admin workshop create/edit/delete, admin management of another member's registration, HTTP-only session cookies, hidden bearer tokens, and cross-origin mutation rejection. Requests use the real Express controllers and a disposable real MongoDB process rather than an API mock.

The API suite covers authorization and ownership, UTC date boundaries, duplicates, capacity, concurrent duplicate and last-seat requests, the three-active-registration limit, registration moves and cancellation, workshop capacity updates, soft-delete history, reactivation limits, and repeatable seeding. Focused unit checks cover timezone-sensitive date behavior.

This record does not establish that every manual acceptance item has been reviewed. Persistent Docker/Atlas operation, public hosting, GitHub-hosted CI execution, full keyboard/screen-reader review, and course presentation/submission remain unverified here. The CI workflow is configured locally and runs after the repository is pushed to GitHub. Use the [human black box checklist](testing.md) before submission.
