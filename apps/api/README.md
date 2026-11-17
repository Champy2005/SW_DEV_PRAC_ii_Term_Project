# Workshop Registration API

The supplied Project 3 Express/Mongoose backend is included here so frontend development, browser checks, and local demonstrations use the real course API. See [UPSTREAM.md](UPSTREAM.md) for the exact source revision and local adaptations. The original API documentation remains in [UPSTREAM-README.md](UPSTREAM-README.md) and [2026-PJ03.md](2026-PJ03.md).

## Local setup

Run these commands from the repository root after installing workspace dependencies:

```powershell
Copy-Item apps/api/config/config.env.example apps/api/config/config.env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste the generated value into `JWT_SECRET` in `apps/api/config/config.env`. Set `MONGO_URI` to a local MongoDB database or your own MongoDB Atlas connection string. Shell and CI environment variables take precedence over the file. `API_ENV_FILE` can select another configuration file; the default file resolves relative to this package regardless of your working directory.

```powershell
npm run seed --workspace @workshop/api
npm run dev --workspace @workshop/api
```

The API listens on `http://127.0.0.1:5000` by default. Open `/api-docs` for Swagger and `/health` for application status. Startup checks configuration, waits for MongoDB and model indexes, then opens the HTTP listener. Production startup uses `npm run start --workspace @workshop/api`.

## Development data

`npm run seed --workspace @workshop/api` upserts two development accounts and six workshops dated 7–28 days after the first seed date. The default local password is `WorkshopDemo123!` for both accounts:

| Role | Email |
| --- | --- |
| Admin | `admin@workshop.local` |
| Member | `member@workshop.local` |

Set `DEMO_ADMIN_PASSWORD` / `DEMO_MEMBER_PASSWORD` before the first seed to choose different passwords. The seed preserves existing accounts, passwords, workshop edits, registrations, and unrelated records. Repeating it inserts missing fixtures without resetting existing dates or reviving deleted workshops. The script is disabled when `NODE_ENV=production`.

## Automated checks

```powershell
npm test --workspace @workshop/api
```

The Node test runner and Supertest exercise HTTP routes against an isolated real MongoDB process provided by `mongodb-memory-server`. Its first run downloads a MongoDB binary; subsequent runs reuse the local cache. The test process replaces `MONGO_URI` with its temporary database and never uses your configured application database.

Checks cover authentication, role and ownership rules, discovery, calendar dates, capacity, concurrent duplicate/last-seat requests, the three-active-workshop limit, registration moves and cancellation, soft deletion/history, and repeatable development seeding.

`RATE_LIMIT_MAX` sets the limit per 10 minutes; without it, the supplied default of 100 applies in every environment. Scripted development and tests raise it. A hosted API should raise it too, because every visitor's request reaches it through the Next.js server, so the per-IP limit is effectively shared by the whole site. See [deployment](../../docs/deployment.md). An invalid value stops startup.

## API behavior to preserve

- Requests use `/api/v1/auth`, `/api/v1/workshops`, and `/api/v1/registrations`; protected routes require `Authorization: Bearer <token>`.
- Members create registrations; admins can view/edit/delete registrations belonging to any member.
- Registration edits move an existing registration to a different eligible workshop, preserving its ID and owner.
- Workshop deletion is soft; cancellation permanently removes a registration and frees its seat.
- Calendar rules use UTC dates, matching the supplied backend. Registration is allowed on the workshop date.
- Logout clears the cookie; clients discard their bearer token. Tokens already issued remain valid until expiration, matching upstream.
- The supplied mutation serializer coordinates one backend process. A horizontally scaled deployment needs database-level coordination for capacity and active-registration counts.

## Import contracts

- `require('./app').app`: Express app; importing it does not connect MongoDB or open a listener.
- `await require('./server').startServer({ port, host })`: connects MongoDB, initializes indexes, returns the Node HTTP server. The caller owns shutdown (`server.close` and `mongoose.disconnect`).
- `await require('./scripts/seed').seedDemoData({ now, adminPassword, memberPassword })`: uses an existing database connection; returns `{ users: { admin, member }, workshops }`.
