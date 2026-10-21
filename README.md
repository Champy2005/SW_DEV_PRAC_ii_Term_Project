# Workshop Registration System

Software Development Practice II · Project 3. A Next.js 16 frontend for the supplied Express/MongoDB workshop API, with member registration and an admin workspace.

The setup follows the class's React, TypeScript, App Router, Tailwind, fetch, hooks, and Redux Toolkit methods. See [course alignment](docs/course-alignment.md) for lecture evidence and deliberate deviations.

## Run locally

Install Node.js 24 LTS (also recorded in `.nvmrc`) and npm. Run commands from this repository root:

```powershell
npm ci
npm run setup
npm run dev:demo
```

Open [the app](http://127.0.0.1:3000) and [API documentation](http://127.0.0.1:5000/api-docs). `setup` creates missing local environment files and a random local JWT secret without replacing existing files. `dev:demo` starts an ephemeral MongoDB process, seeds demo data, and runs both applications. The first run downloads a MongoDB binary and requires internet access. Stop with Ctrl+C. Demo database changes disappear when the process ends.

Demo accounts: `admin@workshop.local` or `member@workshop.local`, password `WorkshopDemo123!`. These are local fixture credentials.

For data that survives restarts, start Docker Desktop, then:

```powershell
npm run db:up
npm run db:seed
npm run dev
```

`dev` uses the MongoDB URI configured in `apps/api/config/config.env`; it does not start a database. You can also use an existing local MongoDB or MongoDB Atlas. Keep personal credentials in local environment files.

## Verify changes

```powershell
npm run verify
npx playwright install chromium
npm run test:e2e
```

`verify` runs lint, TypeScript checks, unit tests, API integration tests, and the production web build. Playwright starts its own isolated stack with an ephemeral database. Test output is the evidence of a run; these instructions do not assert that any check has passed.

## Workspace and docs

- `apps/web`: Next.js App Router, TypeScript, Tailwind, Redux Toolkit.
- `apps/api`: supplied Express/Mongoose backend, adapted for local startup and testing while retaining its controllers.
- [Requirements and acceptance matrix](docs/requirements.md): every Project 3 requirement.
- [Architecture and setup decisions](docs/architecture.md): data flow, authentication, database modes.
- [Course alignment](docs/course-alignment.md): lecture filenames and page references.
- [UI flow](docs/ui-flow.md): guest, member, and admin journeys.
- [Testing and demo checklist](docs/testing.md): scripted checks and human black box review.
- [Local verification record](docs/verification.md): executed checks and remaining review gaps.
- [Prioritized roadmap](docs/roadmap.md): mandatory functions before extra credit.
- [Agent instructions](AGENTS.md): implementation and verification expectations.

The source assignment is `6901_Project_Topics-957520-17911698720803.pdf`, page 4. The supplied backend is [PJ03-WorkshopRegist](https://github.com/SWDevPrac2-69-1/PJ03-WorkshopRegist). Lecture PDFs are reference material and are not copied into the repository.
