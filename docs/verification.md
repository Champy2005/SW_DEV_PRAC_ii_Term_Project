# Local verification record

Executed on 21 October 2026 on Windows with Node.js 24.13.0, Next.js 16.4.2, and React 19.3.1.

| Check | Result | What it establishes |
|---|---|---|
| `npm run verify` | Passed | ESLint, Next route types and strict TypeScript, 4 unit tests, 17 API integration tests, production build. |
| `npm run test:e2e` | 6 passed | Production web/API/MongoDB journeys described below. |
| GitHub Actions `Quality checks` | Passed (`39525304894`) | Clean Ubuntu checkout, production dependency audit, `verify`, and Playwright browser suite on `main`. |
| Desktop and phone visual inspection | Reviewed | Catalog at 1440px and 390px widths, plus workshop detail. No browser page errors or horizontal overflow on the catalog. |
| Demo start, Ctrl+C, restart | Checked | Development stack starts on Windows; ports 3000/5000 are released after shutdown and can be reused. |
| `npm audit --omit=dev` | 0 vulnerabilities | Registry audit for the installed production dependency graph only. Full audit still reports development-tool advisories; see [testing](testing.md#dependency-audit-limitation). |
| Git ignore checks | Passed | Local API configuration, web environment file, and temporary reference downloads are ignored. |

The browser journeys exercise guest search and saved-workshop persistence, phone overflow, member signup/reserve/reference-ID display/duplicate rejection/full-workshop rejection/move/cancel/logout, member admin-page denial, demo member 3-active limit and past-workshop closure, admin workshop create/edit/delete, admin management of another member's registration, HTTP-only session cookies, hidden bearer tokens, and cross-origin mutation rejection. Requests use the real Express controllers and a disposable real MongoDB process rather than an API mock.

The API suite covers authorization and ownership, UTC date boundaries, duplicates, capacity, concurrent duplicate and last-seat requests, the three-active-registration limit, registration moves and cancellation, workshop capacity updates, soft-delete history, reactivation limits, repeatable seeding, and repeatable rule-boundary scenario seeding. Focused unit checks cover timezone-sensitive date behavior and active-registration counting.

This record does not establish that every manual acceptance item has been reviewed. Persistent Docker/Atlas operation, public hosting, full keyboard/screen-reader review, and course presentation/submission remain unverified here. Use the [human black box checklist](testing.md) before submission.
