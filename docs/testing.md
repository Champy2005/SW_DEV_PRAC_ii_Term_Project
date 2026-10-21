# Testing, human review, and presentation

Use scripts for repeatable evidence and human review for the observable product. A green script does not replace checking a complete member and admin journey. Checkboxes below are review instructions, not completed test results.

## Scripted verification

```powershell
npm ci
npm run setup
npm run verify
npx playwright install chromium
npm run test:e2e
```

`verify` is the aggregate for lint, TypeScript, focused unit tests, API integration tests, and the production web build. Playwright starts an isolated web/API/MongoDB stack. It should be possible to reproduce CI results locally with the same commands. First-time MongoDB/Chromium downloads need internet access.

| Layer | Useful evidence | Limits |
|---|---|---|
| Unit | Independent expected results for pure helpers, date boundaries, and shortlist state transitions. | Does not prove HTTP behavior, persistence, or the visible UI. |
| API integration | Real Express requests and an isolated MongoDB for login, role/ownership checks, CRUD, and rule boundaries. | Does not prove browser behavior or a production deployment. |
| Browser | Real navigation/forms through Next, Express, and MongoDB; assert visible outcomes after reload. | Coverage is limited to the journeys and environments exercised. |
| Human black box review | Understandable errors, responsive layout, keyboard access, navigation, and task completion. | Record browser, data mode, and steps so failures can be reproduced. |

Mocks can isolate a network failure. They cannot justify a claim that the real supplied backend or MongoDB was tested. Avoid snapshot-only and implementation-mirroring tests; exercise contracts, boundaries, and negative paths.

## Dependency audit limitation

The local audit on **20 October 2026** reported **zero production dependency vulnerabilities** with `npm audit --omit=dev`. The full `npm audit` reported **7 high-severity development dependency findings**, in chains through `eslint-config-next@16.4.2` and `nodemon` that depend on the affected `braces` versions (`<=3.0.3`). The full dependency audit is therefore not clean.

Track this as upstream tooling debt and rerun both commands after dependency updates. Keep the production dependency audit as a separate CI gate. Do not use forced downgrade fixes that break the chosen Next.js version or erase the distinction between runtime and development findings. These audit results describe the checked dependency tree; they do not establish the absence of application vulnerabilities.

## Functions — 20%

Follow acceptance IDs in [requirements](requirements.md). Use at least two different members and one admin.

- [ ] Guest browses and opens workshop details without an account (W01).
- [ ] New account captures name, email, tel, role, and password; correct credentials sign in and wrong credentials fail (U01–U03).
- [ ] Logout removes access to protected actions, including after a page reload (U04–U06).
- [ ] Member registers and sees a persistent record with a reference ID after refresh (W03, R01–R03).
- [ ] Member changes their registration to another workshop and cancels it; affected registration records refresh and the released seat is usable by another member (R04–R05).
- [ ] Second member cannot read, edit, or delete the first member's record by UI or direct request (U06, R03–R05).
- [ ] Admin creates, reads, edits, and deletes a workshop containing every required field (W02–W04).
- [ ] Admin views, edits, and deletes another user's registration (R06).
- [ ] Yesterday's workshop date is rejected on create and update; today's date follows the documented date policy (C01).
- [ ] A full workshop rejects another registration. Cancellation releases a place; capacity reduction and concurrent requests do not overbook (C02).
- [ ] Duplicate registration fails on initial creation and when moving a registration (C03).
- [ ] Three active workshops are allowed and a fourth is rejected; cancellation/historical dates update the count consistently (C04).
- [ ] Past-workshop registration fails even when bypassing the disabled UI (C05).

## Work quality — 5%

- [ ] Fresh checkout installs with `npm ci`; `setup` preserves existing local environment files.
- [ ] `verify` and browser checks produce reproducible results; actual commands and failures are recorded.
- [ ] API failures, expired/missing credentials, invalid IDs, and failed mutations have honest error states.
- [ ] Real API/database checks cover permissions and business-rule updates, not only successful creates.
- [ ] No secrets, private local environment files, build output, test database binaries, or copied lecture PDFs enter commits.
- [ ] Supplied backend attribution and changed behavior are documented.

## UX/UI — 3%

- [ ] Review catalog, detail, authentication, registrations, and admin screens on phone and desktop widths.
- [ ] Complete the primary journeys using keyboard navigation; check focus, labels, and readable contrast.
- [ ] Loading, empty, full, past, pending, error, and successful states are understandable.
- [ ] Active registration count and total workshop capacity are clear; the UI does not fabricate remaining places. Confirmations identify the correct record.

## UI flow documentation — 3%

- [ ] [UI flow](ui-flow.md) matches implemented screens and transitions.
- [ ] Guest, member, admin, failure, change, and cancellation paths are represented.
- [ ] Requirements can be traced to screens and acceptance IDs; screenshots, if added, match the current build.

## Presentation and demo — 4%

Orientation page 11 allocates no more than **7 minutes** for the presentation and **3 minutes** for questions. Rehearse with a seeded local stack and have a persistent database option available if demo binary downloads are restricted.

| Time | Show |
|---|---|
| 0:00–0:40 | Assigned Project 3 problem, roles, supplied backend. |
| 0:40–1:10 | UI flow diagram and brief architecture. |
| 1:10–3:20 | Guest browse, member sign in, register, change, cancel, refresh. |
| 3:20–4:40 | Admin workshop CRUD and another user's registration management. |
| 4:40–5:30 | Capacity, duplicate, three-active limit, and past-date rejection. |
| 5:30–6:15 | Class methods, real automated verification evidence, implementation decisions. |
| 6:15–7:00 | Additional feature, team division of work, remaining limitations. |

## Additional functionality — 2% extra credit

- [ ] Saved shortlist works across relevant screens and clearly differs from a registration.
- [ ] Saving does not consume capacity or count toward the three-active-workshop limit.
- [ ] Demonstrate the benefit briefly after mandatory functionality is stable.

## Recording evidence

For each verification run, record the date, commit or working state, command, result, and any relevant environment limitation. For a failure, record the acceptance ID, starting state, action, expected result, actual result, and reproduction steps. A skipped or unexecuted check remains a gap. Do not label the project fully verified from the existence of test files alone.
