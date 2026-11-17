# Review findings

Issues found while reviewing the code. Each one says whether it is a **bug** (works incorrectly today, and no ticket plans the fix) or a **planned gap** (an existing ticket or design doc already expects it, but it is not built yet), plus the ticket that should own the fix. Nothing here has been fixed yet.

Status key: **Open** = not started · **Decide** = needs a product decision first · **Fixed** = done (link the commit).

## Registrations page, list and item — 17 November 2026

Reviewed: [registrations/page.tsx](../apps/web/src/app/registrations/page.tsx), [registrations-list.tsx](../apps/web/src/components/registrations-list.tsx) (`RegistrationsList` and `RegistrationItem`), checked against [controllers/registrations.js](../apps/api/controllers/registrations.js).

Checks run that day: `npm run verify` (lint, types, 4 unit, 17 API tests, build) and `npm run test:e2e` (14/14) passed. The confirmation notice (WR-003) is correct: it only appears when the member's own API list contains the reference.

| # | Finding | Type | Owner | Status |
|---|---|---|---|---|
| R-1 | No success feedback after move/cancel | Planned gap | WR-005, WR-008 | Open |
| R-2 | Past, upcoming and unavailable cards look the same | Planned gap | WR-005, WR-009 | Open |
| R-3 | Past registrations can still be moved or cancelled | Not specified | WR-006 | Decide |
| R-4 | Move list offers workshops the owner already holds | Planned gap | WR-006, WR-008 | Open |
| R-5 | Admin sees member wording on other members' records | Planned gap | WR-008 | Open |
| R-6 | Move button enabled with no workshop shown as selected | Bug (small) | WR-005 | Open |
| R-7 | Minor polish: pending timing, footnote, panel focus | Planned gap | WR-005, WR-009 | Open |

### R-1 — No success feedback after a move or cancel

- **Where:** `mutate()` in [registrations-list.tsx:73](../apps/web/src/components/registrations-list.tsx).
- **What happens:**
  - After a successful PUT or DELETE, the panel closes and `router.refresh()` reloads the data, but no message confirms the change.
  - On cancel, the card disappears and keyboard focus falls back to the top of the page, so screen-reader users hear nothing.
- **Why it's a planned gap:**
  - AGENTS.md asks for explicit success feedback.
  - [ui-flow.md](ui-flow.md) lists "changes/cancellation feedback" for the admin screen and "refreshed registration state" for members.
  - WR-005 covers the member lifecycle; WR-008 covers admin actions.
- **Fix idea:** keep a short `role="status"` message in `RegistrationsList` (not the item, because a cancelled item unmounts), e.g. "Registration moved to X" / "Registration cancelled". Move focus to it, or to the list heading.
- **Test impact:** [registration-confirmation.spec.ts:39](../tests/e2e/registration-confirmation.spec.ts) expects no `status` in `main` after a cancel. Change it to check that the *registration* notice is gone, not every status message.

### R-2 — Past, upcoming and unavailable cards look the same

- **Where:** the eyebrow and title around [registrations-list.tsx:111](../apps/web/src/components/registrations-list.tsx).
- **What happens:**
  - The demo member reads "You have 2 of 3 active workshop registrations" but sees three cards.
  - The only difference between them is a small eyebrow ("ON YOUR CALENDAR" vs "WORKSHOP REGISTRATION").
- **Why it's a planned gap:** [ui-flow.md](ui-flow.md) says to distinguish "registration state" and the three-active limit without relying on color alone. WR-005/WR-009.
- **Fix idea:** a text badge per card: *Upcoming* / *Past* / *Workshop unavailable*. Sorting upcoming first is optional.

### R-3 — Past registrations can still be moved or cancelled (decision needed)

- **Where:** the controls render for every card ([registrations-list.tsx:152](../apps/web/src/components/registrations-list.tsx)). The backend allows both actions on past records.
- **What happens:**
  - A member can delete their record of a workshop that already happened.
  - They can also move it to a new upcoming workshop, as long as they are under the 3-active limit.
- **Why "decide":**
  - The requirements (R04, R05, C05) don't say whether history can be edited.
  - C05 forbids registering after the date; editing a past registration is arguably the same thing.
  - No test covers this case.
- **Options:**
  - (a) hide Change/Cancel on past cards (UI only; the API stays permissive), or
  - (b) also reject moves *from* a past workshop in the API (a backend change, record it in `apps/api/UPSTREAM.md`), or
  - (c) keep the current behaviour and document it.
- **Recommendation:** (a), plus an API test if you choose (b).

### R-4 — Move list offers workshops the owner already holds

- **Where:** `options` in [registrations-list.tsx:67](../apps/web/src/components/registrations-list.tsx).
- **What happens:**
  - The dropdown excludes only the card's current workshop.
  - Choosing a workshop the same person is already registered for returns the API error "Member is already registered for this workshop".
- **Why it's a planned gap:** WR-006 covers "frontend guidance for creates and moves". The API is still the authority, so this is guidance, not a rule hole.
- **Fix idea:**
  - In `RegistrationsList`, build the set of workshop IDs per owner (`registration.user._id`) and pass it to each item to filter `options`. This works for admins too.
  - Full workshops can't be filtered, because the API doesn't return remaining seats. Leave those to the API error.

### R-5 — Admin sees member wording on other members' records

- **Where:** [registrations-list.tsx:111](../apps/web/src/components/registrations-list.tsx) ("ON YOUR CALENDAR"), [:172](../apps/web/src/components/registrations-list.tsx) ("Your place will be released"), [:203](../apps/web/src/components/registrations-list.tsx) ("Try something else.").
- **Why it's a planned gap:** WR-008 requires clear owner context for admin moves and cancellations.
- **Fix idea:**
  - Use `admin` to switch the copy, e.g. "Cancel Alex's registration? Their place will be released."
  - Name the member in the confirmation ([ui-flow.md](ui-flow.md): "confirmation with the affected record identified").

### R-6 — Move button enabled with no workshop shown as selected (bug)

- **Where:** the `workshopId` state ([registrations-list.tsx:63](../apps/web/src/components/registrations-list.tsx)) and the button ([:228](../apps/web/src/components/registrations-list.tsx)).
- **Steps:**
  1. Move a registration to workshop B.
  2. Click "Change workshop" again.
  3. `workshopId` still holds B, which is no longer in the options. The dropdown shows "Select a workshop", but "Move registration" is enabled.
- **Impact:** small. The browser's `required` check blocks the submit, so no bad request is sent, but the screen and the button disagree.
- **Fix:** reset `workshopId` to `""` in `toggle()` (or after success).

### R-7 — Minor polish

- **Buttons re-enable before the refresh finishes.** `setPending(false)` runs before `router.refresh()` completes ([:84–85](../apps/web/src/components/registrations-list.tsx)), so old data shows briefly with buttons enabled. Wrap the refresh in `useTransition` and treat its pending state as pending (WR-005: "pending/failed actions preserve useful state").
- **Footnote doesn't fit this page.** [page.tsx:73](../apps/web/src/app/registrations/page.tsx) says "Workshop capacity is the total group size", but this page never shows capacity.
- **Focus doesn't move into opened panels.** The panels open without moving focus, and the toggle buttons have `aria-expanded` but no `aria-controls` (WR-009 keyboard review).

## Project and tooling — 17 November 2026

| # | Finding | Type | Owner | Status |
|---|---|---|---|---|
| P-1 | `npm run dev:demo` crashes with a confusing error when port 5000 is busy | Bug | WR-011 | Open |
| P-2 | Next.js 16.4.2 has a security advisory | Dependency | WR-011 | Fixed, not committed |
| P-3 | API dependency advisories (`body-parser` high; `glob`/`minimatch` moderate, through `swagger-jsdoc`) | Assess | WR-011 | Open |

### P-1 — Confusing crash when the API port is busy

- **Where:** [apps/api/server.js:28](../apps/api/server.js).
- **What happens:** Express 5's `app.listen(port, host, callback)` also runs the callback when listening *fails*. The callback ignores the error and calls `server.address().port`, so a busy port shows `TypeError: Cannot read properties of null (reading 'port')` instead of "port 5000 is already in use".
- **Fix idea:** `app.listen(port, host, (error) => { if (error) return reject(error); ... })`. Optionally print a hint about `DEMO_API_PORT` / `PORT`. This is a backend change, so record it in `apps/api/UPSTREAM.md`.

### P-2 — Next.js security upgrade (fixed on 17 November, not committed)

- **Advisory:** `npm audit` reported a Next.js 16.4.2 advisory: information disclosure across root params when a `'use cache'` function is called through `unstable_cache()`. This app uses neither, so the real exposure was low.
- **Where the upgrade came from:**
  - `next dev`'s upgrade reminder ("Upgrade now") started an agent in a separate worktree, `../Project-next-upgrade`, on branch `chore/next-16.4.6`.
  - That branch was based on the initial commit `e5f9a4b`, not on this branch.
- **Change brought into `feat/m2-m3-gap-fixes`** (staged, not committed):
  - `next` and `eslint-config-next` go from 16.4.2 to 16.4.6 in `apps/web/package.json` and `package-lock.json`.
  - `npm install` added one `"peer": true` metadata line to the lockfile.
- **Left out on purpose:** the agent's `experimental.agentUpgrade: "security"` line. It only controls upgrade reminders and `"security"` is already the default, so `next.config.ts` is unchanged.
- **Cleanup:** the extra worktree folder and the `chore/next-16.4.6` branch (commit `1a3cbef`) were deleted.
- **Verified on 16.4.6:** `npm run verify` passed (lint, types, 4 unit, 17 API tests, build with no security reminder) and `npm run test:e2e` passed 14/14.

### P-3 — API dependency advisories

`npm audit --omit=dev` also flags `body-parser` (high, denial of service via compressed request body) and `glob`/`minimatch` (moderate, through `swagger-jsdoc`). AGENTS.md and WR-011 ask to assess these without unsafe automatic upgrades. Check `npm audit fix --dry-run` first.
