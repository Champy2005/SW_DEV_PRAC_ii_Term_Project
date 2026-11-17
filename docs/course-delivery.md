# Course delivery checklist

Updated: 8 November 2026. Use the [plan](plan.md) and [ticket board](tickets.md) for progress. Checkboxes here are tasks to confirm, not claims that submission or deployment is complete.

The submission PDF supplies assessment requirements. It does not authorize an agent to publish the application, access accounts, reserve a presentation slot, or upload work. Those actions remain human-owned or require a separate user request.

## Dates and presentation attendance

All dates below are **2026, Asia/Bangkok**. The source uses Buddhist year 2569.

| Event | Time | Source |
|---|---|---|
| Presentation booking opens | Friday **13 November, 16:00** | Submission p3 |
| Last time to edit the group's own booking | Tuesday **17 November, 23:00** | Submission p3 |
| Final GitHub push, Vercel deployment, and MCV submission | Wednesday **18 November, 23:00** | Submission p2 |

- [ ] A group representative books through the course's Project Presentation Booking Google Sheet and edits only the group's own entry. Editing another group's booking incurs a five-point penalty.
- [ ] An out-of-hours presentation on Wednesday night is used only where necessary and already arranged with the instructor.
- [ ] All members know the booked slot, wear student uniform, and keep cameras on.
- [ ] Join Zoom at least **30 minutes early**; the group may be called after the preceding group if intervening slots are empty.
- [ ] Rehearse **7 minutes of presentation/demo plus 3 minutes of Q&A**. The source states a one-point penalty per minute late and a half-point penalty per minute over time; presentations are recorded.

## Submission package

| Location | Required content | Source |
|---|---|---|
| Team GitHub repository | Final program pushed to the group's Project Team repository | Submission p2 |
| MCV assignment `PROJECT SUBMISSION`, text answer | Team GitHub repository URL **and** Vercel URL | Submission p2 |
| Presentation slide attachment | Team GitHub repository URL and Vercel URL in the slides; include the UI design link if one exists | Submission p2 |
| UI design attachment | Exported UI design file; Figma is an example, not a required tool | Submission pp1–2 |

- [ ] Final links open and point to the delivered revision/application.
- [ ] Slides and the UI design export open independently and are legible at presentation scale.
- [ ] UI flow shows intentional actions, decisions, and recovery paths. It is not merely an arrangement of completed-screen screenshots.
- [ ] Show team responsibilities honestly at the end; GitHub Contributions is preferred evidence.
- [ ] Confirm the actual booking, uploads, deployment, and MCV submission separately. A prepared local file is not a submitted artifact.

Vercel deployment contributes **1% within the 4% presentation/demo score**, not an additional percentage point. The other project weights remain functions 20%, work quality 5%, UX/UI 3%, UI flow documentation 3%, and additional-functionality extra credit up to 2% (submission p1).

## Required demo order

Follow the presentation journey in submission p4. The table translates its generic booking/item terminology into Project 3 workshops and registrations. Demonstrate the deployed application if it has been deployed.

| Step | Show | Function points |
|---|---|---:|
| 0 | Introduce Project 3 and the UI flow slide/design | — |
| 1 | Create a user and demonstrate registration validation | 2 |
| 2 | Log in as that member | 1 |
| 3 | View workshop information | 1 |
| 4 | Create a workshop registration and attempt a condition-breaking registration | 2 + 1 |
| 5 | View the member's own registration | 2 |
| 6 | Edit the member's registration | 2 |
| 7 | Delete the member's registration | 2 |
| 8 | Log out | 1 |
| 9 | Log in as admin | — |
| 10 | View another member's existing registration | 2 |
| 11 | Edit that member's registration | 2 |
| 12 | Delete that member's registration | 1 |
| 13 | Create a workshop as admin | 1 |
| 14 | Demonstrate additional functionality, if any | Extra credit |
| 15 | Explain the team division of work/show GitHub Contributions | — |
| 16 | Show the Vercel deployment and URL in the slides | Within demo score |

Prepare example workshops before presenting. Keep a separate member registration available for steps 10–12: step 7 deletes the first member's record. Current signup establishes a session automatically, so explicitly log out after signup before showing the required login step. Rehearse with the chosen fixtures and preserve the ordering; [testing](testing.md#presentation-and-demo--4) gives a suggested time budget.

The presentation's abbreviated function checks do not remove the other mandatory Project 3 requirements, including workshop update/delete and all five registration conditions. Track those in [requirements](requirements.md) and [tickets](tickets.md).

## Sources and implementation choices

- `Project-Submission-Presentation-Instructions_6aecab16d9430.pdf`, pp1–4: assessment, submission package, dates, attendance, and ordered demo.
- `W13_Testing-957520-17617264035331.pdf`, pp2–7, 14–20, 21–39: test levels, assertions, behavior-based component testing, and Jest/React Testing Library workshops.
- `W14_TestingDeploy-957520-17938047974877.pdf`, pp2–34, 37–67: Cypress workshops and deployment examples.

The testing workshops illustrate methods; the supplied project instructions do not mandate those exact test libraries. Keep the existing tools and map their purpose in [course alignment](course-alignment.md). Deployment preparation is WR-010; the backend's current single-process concurrency assumption must inform the hosting choice rather than copying the lecture's serverless example unchanged.
