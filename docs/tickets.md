# Project 3 ticket board

Updated: 18 November 2026. [Plan](plan.md) · [Requirements](requirements.md) · [Verification](verification.md) · [Course delivery](course-delivery.md)

This is a local board in the repository, not externally created GitHub issues. Legacy `T-10`, `T-13`, and `T-50` labels in commit `74793b4` describe earlier work; the `WR-` IDs below are the new review sequence.

## At a glance

Current progress: **4 Accepted (WR-005–008), 6 Review (WR-001–003, WR-010, WR-012, WR-015), 1 Active (WR-014), 4 Queued (WR-004, WR-009, WR-011, WR-013)**. On 18 November the team tested WR-005–008 by hand and accepted them, finished reading the saved-workshops code, and booked the presentation slot. Deployed on 17 November: https://sw-dev-prac-ii-term-project.vercel.app. The latest local checks (17 November) passed: 4 unit tests, 18 API tests, lint, types, build and 14 browser journeys; CI also passed. On 11 November, the Figma UI-flow artifact and four PNG exports were added; application tests were not rerun for this design-only work. Existing implementation and passing automation are not human acceptance.

**Next, before the 18 November 23:00 deadline:** WR-013 slides and a timed rehearsal, then the WR-014 MCV submission. WR-004 (returning to the chosen workshop after sign-in) is optional polish: plain login (U03) already works. Full results and current limitations are in the [verification history](verification.md).

| Ticket | Deliverable | Existing baseline | Status | Depends on |
|---|---|---|---|---|
| [WR-001](#wr-001--plan-and-review-baseline) | Plan, tickets, course delivery requirements | Generic docs; no board | Review | — |
| [WR-002](#wr-002--readable-and-reliable-accounts) | Readable account flow and error cases | Working happy paths | Review | WR-001 |
| [WR-003](#wr-003--truthful-registration-confirmation) | Confirm only a real authorized registration | False-success bug at baseline; fixed | Review | WR-001 |
| [WR-004](#wr-004--guest-discovery-and-return-after-sign-in) | Guest discovery and return after sign-in | Catalog/search/detail present | Queued | WR-002 |
| [WR-005](#wr-005--member-registration-lifecycle) | Member create/view/move/cancel | Tested by the team on 18 Nov | Accepted | WR-003–004 |
| [WR-006](#wr-006--all-five-registration-conditions) | Date, capacity, duplicate and active-limit rules | API tests; tested by the team on 18 Nov | Accepted | WR-005 |
| [WR-007](#wr-007--admin-workshop-management) | Admin workshop CRUD | Tested by the team on 18 Nov | Accepted | WR-002 |
| [WR-008](#wr-008--admin-management-of-member-registrations) | Admin manages other members' records | Tested by the team on 18 Nov | Accepted | WR-005, WR-007 |
| [WR-009](#wr-009--responsive-accessible-ui-and-flow-design) | Phone/keyboard usability and UI flow | Responsive CSS; editable Figma flow available | Queued | WR-004–008 |
| [WR-010](#wr-010--persistent-deployment-and-vercel) | Persistent API/database and Vercel frontend | Deployed 17 Nov: Vercel + one Render API + Atlas; smoke test passed | Review | WR-006, WR-008 |
| [WR-011](#wr-011--regression-and-ci-evidence) | Current regression and CI evidence | CI and tests exist | Queued | WR-006, WR-008–010 |
| [WR-012](#wr-012--submission-design-artifact) | Exportable UI design artifact | Editable FigJam and four PNG exports | Review | WR-009 final alignment |
| [WR-013](#wr-013--seven-minute-presentation) | Slides and exact demo journey | Checklist only | Queued | WR-010–012 |
| [WR-014](#wr-014--final-submission-check) | Correct links, contributions and hand-in | Presentation slot booked | Active | WR-011–013 |
| [WR-015](#wr-015--optional-saved-workshops) | Saved-workshop shortlist polish | Present; code read by the team | Review | Required tickets first |

## First review batch

### WR-001 — Plan and review baseline

**Scope:** establish this board, the full delivery plan, source/requirement mapping, deadlines, and an honest distinction between existing code, verified work and human acceptance.

**Acceptance:** every requirement group and submission gate has a ticket; all tickets have acceptance/review steps; later testing examples are distinguished from mandatory project instructions; old results retain their dates.

**Verification:** cross-check current git history/source and the new PDF pages; review documentation links and board counts.

**Human review:** read [plan](plan.md), scan the table above, and open one ticket below. Confirm the next action and expected result are understandable.

**Evidence:** [plan](plan.md), [delivery checklist](course-delivery.md), updated requirements/course mapping/UI flow/testing docs, and this 15-ticket board. Source pages were checked against the new PDFs; local links were checked. Human acceptance is pending.

### WR-002 — Readable and reliable accounts

**Requirements:** U01–U06. **Scope:** format the account form and auth pages into readable code; preserve member/admin signup, HttpOnly authentication and existing navigation; add useful validation and failure feedback. No new auth framework.

**Acceptance:** all five signup fields work; whitespace-only name/telephone is rejected with helpful feedback; invalid credentials and duplicate email show an error without false success; a corrected login can be retried; admin signup has appropriate navigation; pending requests disable duplicate submission. Keep the current frontend eight-character password rule and show it clearly.

**Verification:** new browser checks for required fields, whitespace, wrong password/retry, duplicate email and admin signup; existing session/role/browser journeys still pass; lint/types/build.

**Human review:** `/register` -> try blank/space-only fields -> create a member -> log out -> try a wrong password -> correct it. Repeat signup as admin and inspect navigation. Existing-account login should remain at `/registrations`.

**Evidence:** readable [account form](../apps/web/src/components/auth-form.tsx), login/signup pages, and six new [auth browser cases](../tests/e2e/auth.spec.ts). `verify` and the 14-case browser suite passed on 8 November. Return-to-workshop navigation belongs to WR-004; human acceptance is pending.

### WR-003 — Truthful registration confirmation

**Requirements:** R01–R03, R05; truthful success/error feedback. **Scope:** show registration success only when the requested reference exists in the current member's authorized registration list; make the page readable while touching it.

**Acceptance:** a real newly created registration shows its reference; fabricated IDs, another member's ID and admin views do not show a member success notice; cancelling the confirmed registration removes the notice even if the URL query remains. No API change.

**Verification:** browser checks for fabricated/foreign IDs and cancelling a confirmed record, alongside the existing real-create reference check.

**Human review:** create a registration, note its reference, cancel it and refresh. Then open `/registrations?registered=000000000000000000000000`; neither screen should claim a successful registration.

**Evidence:** [registrations page](../apps/web/src/app/registrations/page.tsx) derives confirmation from the fetched member records. Two new [confirmation browser cases](../tests/e2e/registration-confirmation.spec.ts) cover cancellation, fabricated/foreign/repeated query values and admin views; the existing real-create/reference journey also passed. Human acceptance is pending.

## Remaining required work

### WR-004 — Guest discovery and return after sign-in

**Requirements:** W01, W04, U03. **Scope:** review catalog/search/detail and preserve the intended workshop through login and signup. Format the affected components, not the entire repository.

**Acceptance:** guests see all workshop details; search and empty/error/loading states work; login/signup from a detail returns to that workshop; redirect targets are restricted to valid local app paths; nothing registers automatically after login; total capacity is labeled honestly.

**Verify/review:** browse signed out -> search -> details -> log in/create account -> same details -> explicitly register. Test invalid external/protocol-relative return targets and unknown IDs.

### WR-005 — Member registration lifecycle

**Requirements:** R01–R05. **Scope:** finish/review create, own list, move and cancel, including readable affected handlers and feedback.

**Acceptance:** reference/ownership remains stable across a move; changes survive reload; cancellation frees the seat; pending/failed actions preserve useful state; another member's records are inaccessible.

**Verify/review:** fresh member -> register -> reload -> change workshop -> cancel -> empty state; inspect a second account. Use API ownership negatives and browser journeys against real MongoDB.

**Evidence, 18 November:** accepted. The team tested the lifecycle by hand. The browser suite and the API ownership tests also cover it ([verification](verification.md)).

### WR-006 — All five registration conditions

**Requirements:** C01–C05. **Scope:** verify existing backend conditions and frontend guidance for creates and moves; make any failing case a focused fix.

**Acceptance:** valid UTC today works; past creation/registration fails; capacity and duplicate checks hold under concurrent requests; fourth active registration fails; past/inactive history is excluded; moving/cancelling releases the old seat; capacity edits cannot overbook.

**Verify/review:** use full/past/near-limit demo fixtures and HTTP boundary tests. Record a small expected/actual table for all five conditions; never infer available places from capacity alone.

**Evidence, 18 November:** accepted. The team tested all five conditions by hand with the scenario data. The API tests cover the boundaries, including concurrent last-seat and duplicate requests.

### WR-007 — Admin workshop management

**Requirements:** W02–W04, U06, C01. **Scope:** review admin create/edit/delete/list and denied member/guest access.

**Acceptance:** all workshop fields persist; IDs link subsequent operations; invalid dates/capacity show actionable errors; deletion confirms the workshop name and preserves history; direct unauthorized requests fail.

**Verify/review:** admin creates a workshop -> guest sees it -> admin edits -> guest reloads -> admin deletes -> catalog hides it. Check phone form and unauthorized API calls.

**Evidence, 18 November:** accepted after the team tested admin create, edit and delete by hand.

### WR-008 — Admin management of member registrations

**Requirements:** R06, U06. **Scope:** review the all-members list, owner context, moves and cancellations.

**Acceptance:** admin can see, move and delete any member registration; creation remains member-only; record owner is retained; the member sees admin changes; destination rules remain enforced.

**Verify/review:** use two members; create records, then switch to admin and manage one from each. Recheck each member's list and rejected rule cases.

**Evidence, 18 November:** accepted after the team tested admin move and delete of another member's registration by hand.

### WR-009 — Responsive accessible UI and flow design

**Requirements:** UX/UI 3%, UI flow 3%, all required journeys. **Scope:** review phone/desktop, keyboard navigation, clear roles, feedback, and intentional flow diagrams.

**Acceptance:** no horizontal overflow; labels, focus and confirmations are usable; errors/empty/loading states make sense; flow shows decisions and recovery, not just screenshots; compressed code touched by fixes is made readable.

**Verify/review:** keyboard-only account/registration/admin path at desktop and 390px. Record actual reviewed screens and limitations; update `ui-flow.md` to match routes.

### WR-010 — Persistent deployment and Vercel

**Requirements:** Vercel 1% within presentation/demo 4%; required repository/Vercel links. **Scope:** prepare and verify deployment settings, persistent API hosting and MongoDB, then deploy when authorized.

**Acceptance:** Next frontend runs on Vercel with server-only `API_URL`; API/database survive frontend redeploys; HTTPS cookies/login/logout/origin checks work; concurrent registration guarantees are preserved by the chosen API topology; no fixture credentials/secrets are unintentionally exposed. Do not assume the long-running process-local serializer works across serverless instances.

**Verify/review:** deployment checklist/config first, then the authorized deployed member/admin journey in a new browser session. Record real URLs and hosting decisions. Account credentials/provider selection and publishing are external dependencies; preparation can proceed locally.

**Evidence, 17 November (deployed):**
- **Live:** https://sw-dev-prac-ii-term-project.vercel.app, backed by one Render API instance (https://sw-dev-prac-ii-term-project.onrender.com) and MongoDB Atlas, deployed from `main` at `cbe9d86`.
- **Setup:** the [deployment guide](deployment.md) records the setup, including seeding with private passwords.
- **API change:** `RATE_LIMIT_MAX` now also applies in production, because through the Next.js server the per-IP limit would otherwise be shared by the whole site. Recorded in `apps/api/UPSTREAM.md` and covered by `test/rate-limit.test.js`.
- **Checks:**
  - HTTP checks: health, workshops, the 401 guard, the proxy and the cross-origin 403.
  - The team's manual smoke test passed.
  - Details are in the [17 November verification entry](verification.md#17-november-2026--registration-fixes-and-first-deployment-wr-010).
- **Open:** human acceptance; warm up the free API before presenting. The single console error in the smoke test was an expected 409 from a move the rules refused.

### WR-011 — Regression and CI evidence

**Requirements:** work quality 5%; W13/W14 testing concepts. **Scope:** close missing acceptance coverage and run current local/CI checks; keep existing Vitest, Node HTTP tests and Playwright.

**Acceptance:** `verify` and browser tests pass against real disposable MongoDB; useful negatives exist; no unexplained skipped checks; hosted CI result references the delivered revision; manual checklist is distinct from automation; dependency advisories are assessed without unsafe automatic upgrades.

**Verify/review:** read a concise evidence table, one test trace and one representative assertion. Review failing behavior before changing an assertion. Actual remote CI execution depends on pushing the reviewed branch.

### WR-012 — Submission design artifact

**Requirements:** submission PDF pp1–2, UI flow 3%. **Scope:** turn the reviewed flow into an exportable design artifact the group can attach to MCV and show in slides.

**Acceptance:** artifact opens independently, is legible, includes guest/member/admin actions and recovery, and matches final navigation; include a design link if applicable. A Figma file is optional, but a UI-design attachment is required by the submission instructions.

**Verify/review:** open the export at presentation scale, follow a decision branch, and check the final attachment format against MCV. Choose the simplest accepted format with the user; do not create an unrelated design system.

**Evidence, 11 November:** brought forward at the user's request. [Editable Figma / FigJam board](https://www.figma.com/board/kRQSVv6OKELAeyeGuRfK8H) contains three role journeys and a rules/demo section. [Four PNG exports and logical sources](design/ui-flow/README.md) are saved in the repository. Current source behavior was checked and section renders visually reviewed, including cancellation choices, retained inputs, role landing pages and C01-C05. Human acceptance, portal format/upload and final alignment after later navigation changes remain pending; WR-009 still owns the wider UI/accessibility review.

### WR-013 — Seven-minute presentation

**Requirements:** presentation/demo 4%, exact journey in submission PDF p4. **Scope:** prepare concise slides, ordered demo script, realistic data and honest team contribution evidence.

**Acceptance:** intro+UI flow, member signup/login/view/create+invalid case/list/edit/delete/logout, admin login/view/edit/delete member record/create workshop, optional feature, contribution evidence and deployment are shown in the prescribed order; repository/Vercel/design links appear where required; timed rehearsal fits 7 minutes plus 3-minute Q&A.

**Verify/review:** dry run against deployed data with an untouched second member record for admin operations. Assign speakers truthfully; record rehearsal duration and recovery plan. No fabricated contributions or invented URLs.

### WR-014 — Final submission check

**Requirements:** submission PDF pp2–3. **Scope:** prepare final package and human checklist for booking, pushing, deploying and submitting.

**Acceptance:** team GitHub and Vercel URLs in MCV text and slides; presentation slides and UI-design attachment included; final revision pushed/deployed before 18 Nov 23:00 Bangkok; own booking handled within its window; team members know camera/uniform, 30-minute early Zoom arrival and time limits.

**Verify/review:** open each final link/file from the checklist. Human confirms actual booking/upload/submission; planning or local file generation never counts as a submitted project.

**Progress, 18 November:** the presentation slot is booked. Still to do: slides with both URLs, the UI-design attachment and the MCV submission before 23:00.

### WR-015 — Optional saved workshops

**Requirements:** extra functionality up to 2%, Redux application. **Scope:** review the existing shortlist only after required behavior is stable.

**Acceptance:** saved IDs persist on the device, clearing/corrupt storage does not break the app, saved does not imply registered or reserve a seat, and the feature is explained accurately in the demo.

**Verify/review:** save two -> reload -> filter saved -> unsave; compare registration count. Optional: no payments, waitlists, chat or unrelated features in this plan.

**Evidence, 18 November:** the team has read the store, provider and save-button code. The browser suite checks that saved IDs survive a reload. A hand check of the steps above is still open.
