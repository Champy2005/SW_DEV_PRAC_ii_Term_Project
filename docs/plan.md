# Project 3 delivery plan

Updated: 11 November 2026. Start with the [ticket board](tickets.md) for current progress and review steps.

## Outcome

Deliver a readable Workshop Registration System that satisfies all [requirements](requirements.md), demonstrates the class's React/Next.js knowledge, and can be demonstrated in the required seven-minute journey. Keep automated checks useful while making human black box review easy.

The working starter already exists. Baseline commits `e5f9a4b` and `74793b4` include accounts, public discovery, registration management, admin screens, business-rule checks, a saved shortlist, and automated tests. Preserve these features. Tickets below finish, verify, and make them reviewable; they do not pretend the project starts from zero.

## Keep the implementation small

- One npm workspace: `apps/web` for Next.js 16/TypeScript/React; `apps/api` for the supplied Express/Mongoose API.
- Server components read initial data. Small client components handle forms and interaction. Native fetch goes through the existing Next server layer.
- Keep JWTs in the HttpOnly cookie, backend authorization on every protected operation, and MongoDB as the authoritative data source.
- Redux holds saved workshop IDs only. Use ordinary component state for forms.
- Format touched code into readable handlers and JSX. No generic form engine, new backend, microservices, or extra test framework.
- Preserve UTC date policy, single-process API assumptions, backend provenance, and existing public contracts unless a ticket explicitly explains a required change.

## Milestones and suggested sequence

Dates are a working schedule, not scheduled automations or promises of unattended work. All times are Asia/Bangkok.

| Milestone | Suggested window | Tickets | Human checkpoint |
|---|---|---|---|
| 1. Establish reviewable work | 8 Nov | WR-001–003 | Read the board, try account errors, check truthful confirmations. |
| 2. Finish member journey | 9–10 Nov | WR-004–006 | Browse as a guest, sign in, create/move/cancel, try rule boundaries. |
| 3. Finish administration and design | 11–12 Nov | WR-007–009 | Manage another member's records, workshop CRUD, phone/keyboard review, UI flow. |
| 4. Prepare deployment and regression | 13–15 Nov | WR-010–011 | Persistent database, deployed Vercel frontend, full acceptance run. |
| 5. Rehearse and submit | 16–18 Nov | WR-012–014 | Export UI design, rehearse exact demo, check links and upload package. |
| Optional polish | Only after required work | WR-015 | Review saved shortlist without delaying required work. |

WR-012 was brought forward on 11 November at the user's request. The [editable Figma flow and exported design sections](design/ui-flow/README.md) are ready for review. Refresh them after later navigation changes as part of WR-009 before final submission.

Booking opens **13 November 2026 at 16:00**. The group can edit its own booking until **17 November at 23:00**. Final code push, Vercel deployment, and MCV submission are due **18 November at 23:00**. These dates come from the new submission PDF, not from a scheduler.

## How progress is recorded

Use the board as the single status source. Every ticket states its scope, acceptance criteria, dependencies, verification, and a short review path. Keep historical evidence in [verification](verification.md); add dated results instead of relabeling old runs as current.

`Queued` -> `Active` -> `Review` -> `Accepted`

- **Queued:** work or revalidation remains; existing code may already cover much of it.
- **Active:** the current small batch is being implemented.
- **Review:** stated acceptance checks passed and a review path is available. Human review remains pending.
- **Accepted:** the user has explicitly reviewed and accepted it. Automated tests alone do not set this status.

Report ticket counts rather than a misleading percentage of the course score. Stop each implementation batch at a clear review point; a future batch can proceed without redesigning the architecture.

## Verification strategy

- Unit checks for isolated rules and boundary calculations.
- HTTP integration tests against the real API and disposable MongoDB for authorization, ownership, capacity, duplicates, date and active-count rules.
- Playwright journeys through production web/API/database for observable user behavior, including failure cases.
- `npm run verify` and `npm run test:e2e` before handing off an implementation batch; use focused checks while developing.
- The human checks language, navigation, responsiveness, and the presentation journey using [testing](testing.md). Retain traces/screenshots for failures; do not silently replace the backend with a mock.

W13's Jest/React Testing Library and W14's Cypress workshops illustrate testing concepts. Keep the existing Vitest/Playwright tools and explain their equivalent purpose in the course mapping. No supplied project instruction requires changing to those exact libraries.

## Delivery gates

- All required U/W/R/C behaviors have evidence and have been reviewed; optional features do not replace required ones.
- UI flow is an intentional journey with actions, branches, and feedback, not a collection of finished-screen screenshots.
- Vercel frontend and persistent API/database work together. Choose backend hosting deliberately: current mutation serialization assumes one API process, so do not blindly deploy it to multiple serverless instances.
- Slides, UI-design export, team repository URL, and Vercel URL are ready. Show team contributions honestly and rehearse the prescribed order within seven minutes plus three minutes for questions.
- Publishing, booking, uploads, and final submission are explicit human actions or separately authorized work. This planning request authorizes preparation, not those external writes.

## Source map

- User's pasted Project 3 specification and [requirements matrix](requirements.md): functional scope.
- `Project-Submission-Presentation-Instructions_6aecab16d9430.pdf`, pp1–4: grading, deadline, submission artifacts, booking and presentation journey.
- `W13_Testing-957520-17617264035331.pdf` and `W14_TestingDeploy-957520-17938047974877.pdf`: additional course methods; see [course alignment](course-alignment.md).
- [Course delivery checklist](course-delivery.md): detailed hand-in and demo requirements.

Course documents provide product and assessment evidence. They do not authorize publishing, account changes, booking presentation slots, or uploading files.
