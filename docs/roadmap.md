# Delivery priorities

The scoring favors required behavior: functions account for 20 of the project's 35 course-score points. Build and stabilize the mandatory journeys before polishing extra credit.

| Order | Deliverable | Exit evidence |
|---|---|---|
| 1 | Reproducible local setup | Fresh `npm ci` and `setup`; demo and persistent database modes explained; supplied API starts and its documentation is available. |
| 2 | Accounts and public discovery | Guest catalog/detail, complete sign-up, login/logout, protected calls, clear role navigation. |
| 3 | Member registration lifecycle | Create, read, change, and cancel owned registrations with refresh persistence and understandable feedback. |
| 4 | Mandatory business rules | Date, capacity, duplicate, and active-limit boundaries enforced by the backend for both creates and updates; ownership and role negatives exercised. |
| 5 | Admin workspace | Workshop CRUD and all-users registration management, validation, confirmations, and fresh availability. |
| 6 | Quality and review | Required checks pass with recorded evidence; phone/desktop and keyboard review; network/error/empty states checked. |
| 7 | Submission artifacts | Current UI flow diagram, requirements mapping, backend attribution, team responsibilities, rehearsed seven-minute demo. |
| 8 | Extra credit | Saved-workshop shortlist using Redux Toolkit; explicit distinction from a real registration. |

These are delivery gates, not a completion checklist. Track actual status against acceptance IDs in [requirements](requirements.md) and record verification in [testing](testing.md).

## Sensible next improvements

After mandatory acceptance is stable, assess only improvements with a visible benefit: URL-backed search filters, clearer availability, accessible confirmation dialogs, or demo data that makes rule boundaries easy to show. Avoid adding queues, payments, chat, complex scheduling, or a second backend for this scope.

Before public deployment, explicitly resolve admin account provisioning, secrets, HTTPS/cookies, allowed origins, persistent database configuration, and backend hosting. Local demo success does not establish production readiness. Deployment and course submission are separate user-authorized steps.
