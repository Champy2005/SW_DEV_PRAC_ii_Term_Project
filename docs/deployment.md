# Deployment (WR-010)

**Status, 17 November 2026: deployed.**
- **Frontend:** Vercel, at **https://sw-dev-prac-ii-term-project.vercel.app**.
- **API:** one Render web service.
- **Database:** MongoDB Atlas.
- **Record:** URLs and results are in [the table below](#record-after-deploying) and the [verification history](verification.md). The accounts and secrets stay with the team.

## Topology

```
Browser ──HTTPS──▶ Vercel: Next.js (apps/web)
                     │  holds the HttpOnly session cookie, calls the API server-side
                     ▼
                   One always-on Node service: Express API (apps/api)
                     │
                     ▼
                   MongoDB Atlas
```

**Why this split:**
- **The API runs as exactly one long-running process.** The API's mutation serializer (`apps/api/middleware/serialize.js`) only coordinates requests inside one process, and the capacity and duplicate guarantees depend on it. Do **not** run the API as Vercel functions, and don't scale it beyond one instance. The W14 lecture's backend-on-Vercel example doesn't fit this API.
- **The browser never talks to the API directly.** It calls the Next.js proxy (`/api/backend/...`), which adds the JWT from the HttpOnly cookie. `API_URL` is a server-only Vercel variable.

## What the team needs

| Service | Used for | Notes |
|---|---|---|
| GitHub | Source for both deployments | The team repository URL also goes in the slides and on MCV. |
| MongoDB Atlas | Persistent database | The free cluster is enough. |
| Node host (e.g. Render web service) | The API | Must run one instance of a long-running Node process. Free instances may sleep when idle; see [warm-up](#5-warm-up-before-the-demo). |
| Vercel | The Next.js frontend | The Vercel URL is required in the slides and on MCV. |

Use the same provider steps on any equivalent host; the Render names are only an example.

## 1. MongoDB Atlas

1. **Create the database.** Make a free cluster and a database user with a generated password.
2. **Allow the API host to connect.** Under Network Access, add `0.0.0.0/0`, because hosts like Render don't have a fixed outbound IP. This is acceptable for a course demo only with a strong, generated password.
3. **Copy the connection string and add a database name:**
   `mongodb+srv://<user>:<password>@<cluster-host>/workshop-registration?retryWrites=true&w=majority`
   Keep it out of git and the slides.

## 2. Seed the hosted database from your machine

The seed script refuses to run with `NODE_ENV=production`, so run it locally; your local API config already sets `development`. Shell variables take priority over `config.env`.

> **Never use the committed demo password (`WorkshopDemo123!`) on the public site.** Choose new passwords and keep them in the team's private notes.

In PowerShell, from the repository root:

```powershell
$env:MONGO_URI = "<atlas connection string>"
$env:DEMO_ADMIN_PASSWORD = "<new admin password>"
$env:DEMO_MEMBER_PASSWORD = "<new member password>"
npm run db:seed:scenarios
Remove-Item Env:MONGO_URI, Env:DEMO_ADMIN_PASSWORD, Env:DEMO_MEMBER_PASSWORD
```

**What the seed creates:**
- The demo accounts `admin@workshop.local` and `member@workshop.local`, and 6 workshops dated 7–28 days after the seed day.
- With `:scenarios`:
  - a second member, `member2@workshop.local`, who holds the only seat in
  - a full one-seat workshop,
  - a workshop dated 3 days before the seed day (the past-date rule),
  - two active registrations for the demo member (the 3-active limit).
- Use `npm run db:seed` instead for workshops and accounts only.

**Re-running the seed:**
- It's non-destructive: it never changes existing records, including passwords.
- If you seeded with the wrong passwords, delete those users in Atlas, then seed again.

**Before the presentation, keep a separate member registration ready for demo steps 10–12** ([course delivery](course-delivery.md)).

## 3. API service

**Render web service settings (or the equivalent on another host):**

| Setting | Value |
|---|---|
| Repository root | Repository root (not `apps/api`), because the lockfile lives there |
| Build command | `npm ci --workspace apps/api --omit=dev` |
| Start command | `npm start --workspace apps/api` |
| Instances | **1**; no autoscaling |
| Health check path | `/health` |

**Environment variables:**

| Variable | Value | Why |
|---|---|---|
| `NODE_ENV` | `production` | Hides stack traces |
| `HOST` | `0.0.0.0` | The API binds to `127.0.0.1` by default, which a host can't reach |
| `PORT` | Usually provided by the host | Read automatically |
| `MONGO_URI` | Atlas connection string from step 1 | |
| `JWT_SECRET` | Random, at least 32 characters | Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `JWT_EXPIRE` / `JWT_COOKIE_EXPIRE` | `1d` / `1` | Same as local |
| `FRONTEND_URL` | `https://<your-vercel-domain>` | Used by the API's CORS headers. The browser never calls the API directly, so this is informational. |
| `RATE_LIMIT_MAX` | `2000` | Every request arrives through Vercel, so the default 100 per 10 minutes is shared by the whole site and a demo can hit it |
| Node version | 24 (on Render: `NODE_VERSION=24`) | Matches `.nvmrc` |

**Check:** `https://<api-host>/health` returns `"success": true`, and `https://<api-host>/api/v1/workshops` lists the seeded workshops.

## 4. Vercel frontend

1. **Import the repository**, then set:
   - **Root Directory:** `apps/web`
   - **Framework:** Next.js
   - **Node.js version:** 24.x
   - **Include files outside the root directory:** keep it enabled, because the install uses the workspace lockfile at the repository root.
2. **Add one environment variable** (Production and Preview): `API_URL=https://<api-host>/api/v1`.
   - Never prefix it with `NEXT_PUBLIC_`.
   - Don't set `COOKIE_SECURE`: production already makes the session cookie `Secure`.
3. **Deploy.**
   - If the install step fails to find workspace packages, set the Install Command to `cd ../.. && npm ci`.
   - Then set the API's `FRONTEND_URL` to the production domain Vercel gives you.

## 5. Warm-up before the demo

The free Render instance sleeps after about 15 idle minutes. On 18 November a cold start took **over 100 seconds**. The Next.js server waits only 10 seconds for the API, then shows "The workshop service is unavailable. Please try again shortly." Login fails the same way. So about 5 minutes before presenting:

1. Open `https://<api-host>/health` and wait for the JSON.
2. Open the Vercel site and log in once.

## 6. Deployed smoke test

Run it in a fresh private browser window, then record the date, URLs and results in [verification](verification.md).

- [ ] Guest: the catalog, search and a workshop detail page load.
- [ ] Member: sign up, log out, log in, register for a workshop, and see the reference ID on the registrations page.
- [ ] Rules:
  - the full one-seat workshop shows the capacity error,
  - a duplicate registration is refused,
  - with 3 active registrations, a 4th is refused,
  - the past workshop shows "Registration has closed".
- [ ] Member: move a registration (the reference ID stays the same), cancel one, and reload: the changes persisted.
- [ ] Admin:
  - log in,
  - move and delete another member's registration,
  - create, edit and delete a workshop.
- [ ] Log out. `/registrations` then sends you to login.
- [ ] DevTools:
  - the `workshop_session` cookie is `HttpOnly` and `Secure`,
  - no token appears in responses or in `localStorage`.
- [ ] Phone width: no sideways scrolling, and the buttons are reachable.

## Known limits to mention if asked

- **Anyone can sign up as an admin:** the supplied API lets the signup form choose the role.
- **Logout deletes only the cookie:** the JWT itself stays valid until it expires (1 day).
- **The rate limit is shared by all visitors**, because requests arrive through Vercel. `RATE_LIMIT_MAX` sizes it.
- **The API's Swagger page lists `localhost`** as its server URL.
- **The one-process design** limits the API to one instance. That's fine for a course demo but not for real scale.

## Record after deploying

| Item | Value |
|---|---|
| Vercel production URL | https://sw-dev-prac-ii-term-project.vercel.app |
| API URL | https://sw-dev-prac-ii-term-project.onrender.com (Render free web service, 1 instance) |
| Atlas cluster / database | `Cluster0` / `workshop-registration`, seeded with `db:seed:scenarios` using private passwords |
| Deployed commit | `cbe9d86` (merge of PR #1 into `main`) |
| Smoke test date and result | 17 November 2026: the team ran the section 6 checklist in a private window and everything passed |

**Notes from the first deployment:**
- **Vercel suggests a "Services" setup.** It offers to import the repository as a multi-service project with a `vercel.json`. Don't: choose **Import single project** for `apps/web` only, and leave its "Deploy" suggestion for `apps/api` alone.
- **Atlas DNS on some machines.** On a machine whose DNS server is a local proxy (`127.0.0.1`), Atlas `mongodb+srv` lookups are refused. The seed script now connects through `config/db.js`, which uses public resolvers, as the API already did.
- **Browser storage.** `localStorage` holds only `crafttable:saved-workshops` (saved workshop IDs). The session token stays in the HttpOnly cookie.
