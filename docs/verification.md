# Verification history

## 17 November 2026 — registration fixes and first deployment (WR-010)

**Local checks** on `feat/m2-m3-gap-fixes`, merged as PR #1 (`cbe9d86`). Environment: Windows, Node.js 24.13.0, Next.js 16.4.6.

| Command/check | Result | Evidence and limits |
|---|---|---|
| `npm audit --omit=dev --audit-level=high` | Passed | Passed after the lockfile updates to body-parser 2.4.0 and mongoose 8.24.10. Moderate `glob`/`minimatch` advisories through `swagger-jsdoc` remain (P-3). |
| `npm run verify` | Passed | Lint, types, 4 unit tests, 18 API tests (new: production `RATE_LIMIT_MAX`), production build. |
| `npm run test:e2e` | 14 passed | Now also covers registration review fixes R-1 to R-6 ([review findings](review-findings.md)). |
| GitHub Actions on PR #1 | Passed | Hosted CI on the reviewed branch before merge. |

**Deployed system:**
- **Frontend:** https://sw-dev-prac-ii-term-project.vercel.app (Vercel, `apps/web`).
- **API:** https://sw-dev-prac-ii-term-project.onrender.com (one Render instance).
- **Database:** MongoDB Atlas, seeded with the rule scenarios using private passwords.
- **Setup:** see [deployment](deployment.md).

| Check | Result | Who/how |
|---|---|---|
| API `/health` | 200, `environment: production` | HTTP request |
| API `/api/v1/workshops` | 8 seeded workshops, including the past and one-seat scenarios | HTTP request |
| API `/api/v1/auth/me` without a token | 401 | HTTP request |
| Vercel home page | 200; it renders workshops fetched through `API_URL` | HTTP request |
| Proxy `GET /api/backend/workshops` | 200 | HTTP request |
| Proxy POST with a foreign `Origin` | 403 "Invalid request origin" | HTTP request |
| `/registrations` as a guest | Redirects to `/login`. Next streams it as `NEXT_REDIRECT` plus a meta refresh, so the status is 200. | HTTP request |
| Deployed smoke test ([deployment §6](deployment.md#6-deployed-smoke-test)) | Passed: guest, member, the rules, move/cancel/persistence, admin, cookie and phone checks | The team, by hand, in a private browser window |

**Review status:** WR-010 is deployed and ready for human review. Remaining gaps:
- The free Render instance sleeps when idle; warm it up before presenting ([deployment §5](deployment.md#5-warm-up-before-the-demo)).
- The one browser console entry seen during the smoke test was a **409** from a move the rules refused (`PUT /api/backend/registrations/<id>`). Chrome logs every rejected request this way; the card showed the API's error message. That's expected behavior, not a defect.
- A full keyboard/screen-reader review and the whole-site design pass are still outstanding (WR-009).

## 11 November 2026 — Figma UI flow (WR-012)

Created the [editable FigJam board](https://www.figma.com/board/kRQSVv6OKELAeyeGuRfK8H) and [four exported design sections](design/ui-flow/README.md). The three journeys contain 55 native editable shapes and 54 connectors, plus separate title, notes, rules and demo guidance. Temporary draft graph versions were removed from the final board.

| Check | Result | Scope |
|---|---|---|
| Current source comparison | Checked | Actual routes, immediate signup session, role-specific `/registrations`, create/move/cancel behavior, soft deletion, backend conditions and access rules. WR-004 is explicitly marked planned. |
| Figma structure | Checked | Three journey sections, one rules section and a start section. Screen/action nodes and arrows remain editable. Connector bounds are within their journey sections. |
| Visual review | Checked | Each completed section rendered and inspected; a crossing admin logout arrow was corrected. Text, decisions, error outcomes, confirmations and notes are readable. |
| Local exports | Checked | Four PNG files downloaded from Figma, opened and checked as images. Mermaid files preserve the flow logic. |

This task changed design artifacts and documentation only. Application tests and remote CI were not rerun; the 8 November application results below remain historical evidence. WR-012 is ready for human review, not accepted or submitted. Final portal-format confirmation, attachment upload and navigation alignment after future changes remain separate steps.

## 8 November 2026 — WR-001–003

Checked the working tree based on `74793b4`, including the new plan/ticket docs, readable account flow, and truthful registration confirmation. Environment: Windows, Node.js 24.13.0, Next.js 16.4.2, React 19.3.1.

| Command/check | Result | Evidence and limits |
|---|---|---|
| `npm run verify` | Passed | Lint, strict TypeScript/Next types, 4 unit tests, 17 HTTP/MongoDB integration tests, production web build. |
| `npm run test:e2e` | 14 passed, none skipped | Production Next server, real Express API and disposable real MongoDB; Chromium. Six new auth cases, two new confirmation cases, and six existing journeys. |
| `git diff --check` | Passed | No whitespace errors in tracked changes. |
| Documentation review | Checked | Three supplied PDFs read; submission pages visually inspected; plan/ticket/source mapping and local document links checked. |

WR-002 adds required/whitespace validation, wrong-password retry, duplicate-email feedback, no-session-on-failure and admin-signup checks. WR-003 verifies that fabricated, another member's, repeated query values and admin views do not manufacture a success banner, and that cancellation removes a previously valid banner even with the old URL query. Existing member/admin CRUD, conditions, reference IDs and cookie/origin checks still pass.

The duplicate-email test intentionally triggers an upstream MongoDB duplicate-key log; the browser receives the existing friendly 409 response and no session. No backend controllers, dependency versions or hosting configuration changed in this batch.

**Review status:** WR-001–003 are ready for human review, not accepted. Remote CI was not triggered for this working tree. Dependency audit, Docker/Atlas persistence, deployed behavior and complete keyboard/screen-reader review were not rerun. The historical results below retain their original dates and do not establish those checks for today's changes.

## 21 October 2026 — baseline (historical)

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
