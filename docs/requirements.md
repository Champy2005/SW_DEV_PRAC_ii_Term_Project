# Project 3 requirements and acceptance matrix

Source: `6901_Project_Topics-957520-17911698720803.pdf`, page 4, **Project 3: Workshop Registration System**. Page 1 instructs students to use the supplied backend, configure MongoDB, inspect `/api-docs`, and permits backend modifications or additions. This document translates the assignment into observable acceptance criteria; it does not claim those criteria have passed.

The assignment asks for a frontend for [SWDevPrac2-69-1/PJ03-WorkshopRegist](https://github.com/SWDevPrac2-69-1/PJ03-WorkshopRegist). Backend authorization and validation remain necessary even when the interface prevents invalid actions.

The [ticket board](tickets.md) tracks implementation and human review; the [delivery plan](plan.md) sets the sequence. Existing code and historical test results are not automatic acceptance. Additional deadlines, Vercel scoring, required hand-in files and presentation order from the new submission PDF are recorded in [course delivery](course-delivery.md).

| Acceptance group | Primary review tickets |
|---|---|
| U01–U06: accounts, sessions, roles and access | WR-002, WR-005, WR-007–008, WR-011 |
| W01 and public W04: discovery and information | WR-004 |
| W02–W04: admin workshop management and IDs | WR-007 |
| R01–R05: member registration lifecycle and references | WR-003, WR-005 |
| R06: admin management of all registrations | WR-008 |
| C01–C05: workshop/registration conditions | WR-006–007 |
| UX/UI and intentional UI flow design | WR-009, WR-012 |
| Work quality, Vercel, presentation and submission | WR-010–014 |
| Saved shortlist, optional extra credit | WR-015 |

| ID | Required behavior | Acceptance evidence |
|---|---|---|
| U01 | Support `admin` and `member` roles. | Sign in as each role; show appropriate navigation. Direct member calls to admin endpoints fail. |
| U02 | Sign up with name, email, telephone, role, and password. | Submit all fields, see validation feedback for invalid input, and sign in with the created account. Role policy must be documented if hardened for deployment. |
| U03 | Sign in using email and password. | Correct credentials establish a session; wrong credentials show an understandable error without establishing one. |
| U04 | Support logout. | Logout removes the browser session; protected pages/actions require a fresh sign in. |
| U05 | Backend issues a JWT after login. | Authentication integration obtains a backend JWT and uses it for protected API requests. Browser UI need not expose the token. |
| U06 | Protected backend routes enforce access control. | Missing/invalid credentials fail; member access to another member's records fails; admin access succeeds where permitted. |
| W01 | Everyone can view workshop information. | A signed-out visitor can browse and open workshop details. |
| W02 | Signed-in admin can add, view, update, and delete workshops. | Create a workshop, refresh to see it, edit it, and confirm deletion. Member and guest mutations fail. |
| W03 | Every workshop has an ID used for updates, deletion, and registration. | New workshop response has a stable ID; detail navigation and subsequent operations refer to that ID. |
| W04 | Workshop stores activity name, description, instructor, date, location, and capacity. | Admin form accepts all fields; saved values are displayed correctly after reload. |
| R01 | Signed-in member can create a registration for a workshop ID. | Member registers from a workshop detail page; the record remains visible after refresh. |
| R02 | Every registration has a reference ID. | Created registration has a stable ID used by edit and delete operations. |
| R03 | Member can view their own registrations. | Member dashboard lists their records; another member's records are absent and inaccessible by direct ID. |
| R04 | Member can edit their own registration. | Move an owned registration to another eligible workshop; original place is released and destination rules are rechecked. |
| R05 | Member can delete their own registration. | Confirm cancellation; record disappears and the workshop place becomes available again. |
| R06 | Admin can view, edit, and delete any user's registration. | Admin locates a different member's record and completes each action; changes appear to the member after refresh. |
| C01 | Workshop date cannot precede the current date. | Create and update attempts with yesterday's date fail; today's date is allowed under the documented date policy. |
| C02 | Registrations cannot exceed workshop capacity. | Fill a workshop to capacity; another registration is rejected. Capacity-sensitive updates and concurrent requests to the single backend process do not overbook it. |
| C03 | A user can register for a workshop only once. | Repeated submit, reload/retry, and registration moves cannot create a second registration for the same user/workshop. |
| C04 | A user has at most three active workshop registrations. | First three active registrations succeed; a fourth fails. Cancellation or a past workshop affects the count according to the documented active definition. |
| C05 | Registration after the workshop date is prohibited. | Attempt to register for a past workshop through the UI and directly through the API; both reject it. |

## Working interpretations to keep explicit

- The assignment supplies a workshop **date**, not start/end times. The supplied backend accepts `YYYY-MM-DD`, stores midnight UTC, and compares dates against the current UTC calendar day. Today is allowed. The frontend must display the same calendar date. This UTC business-date policy can differ from Bangkok's calendar day during the first seven local hours; it follows the supplied API and should be mentioned during review.
- An **active registration** points to a workshop with `isActive=true` and a workshop date of today or later in UTC. Past or soft-deleted workshops do not count toward the three-workshop limit. Registration deletion permanently removes that registration. The frontend must use this same definition.
- Editing a registration is implemented as changing its workshop. It retains ownership and must satisfy capacity, duplicate, date, and active-limit rules for its destination.
- Capacity must remain consistent after cancellation, registration changes, workshop capacity changes, and simultaneous registration attempts. The supplied API serializes mutations within one Node process; multiple backend instances need database-level coordination before deployment. Disabling a button alone cannot enforce this.
- Public workshop records expose total `capacity`, not an occupancy count. Label it as total places/capacity. Do not fabricate “places remaining”; the registration endpoint supplies authoritative full-workshop rejection.
- The supplied sign-up contract includes `role`. Preserve that coursework behavior for local demonstration; before public deployment, choose and document how administrators are provisioned.

## Grading priorities

User-provided weights: functions **20%**, work quality **5%**, UX/UI **3%**, UI flow documentation **3%**, presentation/demo **4%**, plus additional-functionality extra credit **2%**. The first five sum to the project's **35%** course weight. Establish all U/W/R/C behaviors before spending time on optional features.

The saved-workshop shortlist is an extra feature. Saving a workshop is not registration, does not reserve capacity, and must not count toward the active-registration limit.
