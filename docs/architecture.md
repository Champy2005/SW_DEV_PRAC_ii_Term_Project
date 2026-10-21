# Architecture and local operation

## Application boundaries

```text
Browser
  -> Next.js web (apps/web, port 3000)
       -> Express API (apps/api, port 5000)
            -> MongoDB
```

The web application provides public workshop browsing, member registrations, and admin management. The supplied Express API remains the authority for authentication, ownership, roles, and workshop/registration rules. MongoDB stores users, workshops, and registrations. Next route handlers form a small backend-for-frontend layer: the browser talks to the web origin, and the Next server forwards API requests.

Use server components for page structure and initial data where appropriate, and client components for forms, filters, confirmation dialogs, and saved-workshop controls. Native `fetch` and typed response helpers keep the API contract visible. After mutations, reload affected records so availability and registration counts reflect server results.

## Authentication decision

W10 teaches NextAuth v4 with a credentials provider. This project deliberately uses a smaller cookie-based server layer because the supplied backend already issues and validates JWTs and there is one authentication provider.

1. A user submits credentials to a Next route handler.
2. The Next server calls the supplied API's login or registration endpoint.
3. A successful response sets the backend JWT in an **HttpOnly**, **SameSite** cookie; production uses **Secure** cookies over HTTPS.
4. The Next server reads that cookie and sends the JWT as a bearer token to the API. The browser receives safe user/session data, not the JWT.
5. Logout clears the browser cookie. API JWT expiry remains a separate concern; deleting a cookie does not revoke an already copied JWT.

Protect mutations against cross-origin requests and never use client role checks as authorization. The API verifies both role and record ownership. Keep the API base URL and JWT secret server-side. Do not put secrets in `NEXT_PUBLIC_` environment variables.

## State ownership

| Data | Owner | Reason |
|---|---|---|
| Users, workshops, registrations, capacity decisions | MongoDB / Express API | Durable shared records and business rules. |
| Authentication token | Server-managed HttpOnly cookie | Avoid browser JavaScript access and duplicate auth state. |
| Saved workshop IDs | Redux Toolkit | Small example of shared client state taught in W11. |
| Form fields, pending state, inline errors | React component state | Local interaction; no global store needed. |
| Search and visible results | Page/component state or URL | Keep discovery easy to understand and test. |

A saved workshop is only a shortlist entry. It neither creates a registration nor reserves a place. Do not copy whole workshop records or authentication into Redux.

Workshop records expose total capacity rather than a public remaining-place count. The UI labels total places honestly; the API decides whether a registration can fit. Dates use the supplied API's UTC calendar-day policy: `YYYY-MM-DD` stored at UTC midnight, today allowed, prior UTC dates rejected. Active registrations refer to workshops that are active and dated today or later in UTC; past and soft-deleted workshops do not count. Workshop deletion preserves registration history, while registration cancellation deletes the record.

The supplied mutation serializer coordinates requests within one Node.js process, with a unique database index for duplicate registrations. Capacity and active-count guarantees across multiple backend instances require additional database-level coordination. The baseline local setup uses one API process.

## Database modes

| Mode | Commands | Persistence |
|---|---|---|
| Demo | `npm run dev:demo` | Starts an isolated MongoDB binary using `mongodb-memory-server`, seeds examples, starts API and web; data is discarded on shutdown. No Docker required. |
| Persistent development | `npm run db:up`, `npm run db:seed`, `npm run dev` | Docker Compose MongoDB with a persistent volume. Restarting the applications retains data. |
| Existing MongoDB / Atlas | Configure API MongoDB URI, then `npm run db:seed`, `npm run dev` | Controlled by the chosen database. Use a dedicated development database. |
| Automated API/browser checks | `npm run verify`, `npm run test:e2e` | Isolated ephemeral test database. Tests must not target a personal database. |

The first ephemeral run downloads a MongoDB executable. A restricted network, antivirus policy, or unsupported binary can prevent startup. In that case, use Docker or an existing MongoDB and investigate the reported error; do not silently substitute a mock.

`npm run setup` copies example environment files only when local files are missing and generates a random local JWT secret. Existing local values are preserved. The API environment file is `apps/api/config/config.env`, based on `apps/api/config/config.env.example`; its settings include `MONGO_URI` and `JWT_SECRET`. The web uses `apps/web/.env.local`, with `API_URL=http://127.0.0.1:5000/api/v1`. Review the corresponding examples before starting a persistent database. The web is bound to `127.0.0.1:3000` for local development; API documentation is at `http://127.0.0.1:5000/api-docs`.

The seed accounts are `admin@workshop.local` and `member@workshop.local`, both with the local-fixture password `WorkshopDemo123!`. Seeding a persistent development database preserves existing records; use a dedicated development database regardless. Ephemeral demo runs start with fresh data.

## Reproducibility and checks

The root package is an npm workspace targeting Node.js 24 LTS, recorded in `.nvmrc`. Use `npm ci` with the committed lockfile. `verify` covers lint, types, focused unit checks, API integration checks, and a production web build; Playwright checks the complete application separately. CI runs both commands, with browser tests exercising a production build against an ephemeral database. Retain failure evidence. Running an integration test with a real ephemeral MongoDB tests the real database engine; it does not verify an Atlas deployment or production configuration.

The copied backend needs attribution to its upstream repository and an explicit record of any modifications. Backend fixes should preserve the public contract unless a documented requirement demands a change. See [requirements](requirements.md), [testing](testing.md), and [roadmap](roadmap.md).
