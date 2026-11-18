# Frontend review checklist

Current review: frontend foundation + first batch (WR-001–003).

**Start here:** `apps/web/src/lib/types.ts`. You can leave `demo.mjs` pending.

Tick a file when you understand its purpose and main flow. Ask AI when needed; you do not have to follow every import.

**Whole picture:** data shapes → layout/navigation → browsing → accounts → registrations → admin screens → saved workshops → styling → loading/errors.

The Next.js pages in `apps/web` belong to your web application even when they render on the server. For this pass, treat imported fetching/session helpers as “load data” or “get the current user”; their internals can wait.

A tick means understood at this batch. Add files changed later to the revisit list at the bottom.

## 1. Frontend data shapes and rules

- [/] [apps/web/src/lib/types.ts](../apps/web/src/lib/types.ts)
- [/] [apps/web/src/lib/rules.ts](../apps/web/src/lib/rules.ts)

## 2. Page layout and navigation

- [/] [apps/web/src/app/layout.tsx](../apps/web/src/app/layout.tsx)
- [/] [apps/web/src/components/site-header.tsx](../apps/web/src/components/site-header.tsx)
- [/] [apps/web/src/components/logout-button.tsx](../apps/web/src/components/logout-button.tsx)

## 3. Browse workshops

- [/] [apps/web/src/app/page.tsx](../apps/web/src/app/page.tsx)
- [/] [apps/web/src/components/workshop-catalog.tsx](../apps/web/src/components/workshop-catalog.tsx)
- [/] [apps/web/src/app/workshops/[id]/page.tsx](../apps/web/src/app/workshops/[id]/page.tsx)
- [/] [apps/web/src/components/registration-button.tsx](../apps/web/src/components/registration-button.tsx)

## 4. Login and signup

- [/] [apps/web/src/app/login/page.tsx](../apps/web/src/app/login/page.tsx)
- [/] [apps/web/src/app/register/page.tsx](../apps/web/src/app/register/page.tsx)
- [/] [apps/web/src/components/auth-form.tsx](../apps/web/src/components/auth-form.tsx)

## 5. Manage registrations

- [/] [apps/web/src/app/registrations/page.tsx](../apps/web/src/app/registrations/page.tsx)
- [/] [apps/web/src/components/registrations-list.tsx](../apps/web/src/components/registrations-list.tsx)

## 6. Admin screens

- [/] [apps/web/src/app/admin/workshops/page.tsx](../apps/web/src/app/admin/workshops/page.tsx)
- [/] [apps/web/src/components/workshop-manager.tsx](../apps/web/src/components/workshop-manager.tsx)

## 7. Saved workshops

- [/] [apps/web/src/store/index.ts](../apps/web/src/store/index.ts)
- [/] [apps/web/src/components/providers.tsx](../apps/web/src/components/providers.tsx)
- [/] [apps/web/src/components/save-button.tsx](../apps/web/src/components/save-button.tsx)

## 8. Styling and visual components [PENDING/DON'T CARE FOR NOW]

- [ ] [apps/web/src/app/globals.css](../apps/web/src/app/globals.css)
- [ ] [apps/web/src/components/workshop-art.tsx](../apps/web/src/components/workshop-art.tsx)
- [ ] [apps/web/src/components/icons.tsx](../apps/web/src/components/icons.tsx)

## 9. Loading and error screens [PENDING/DON'T CARE FOR NOW]

- [ ] [apps/web/src/app/loading.tsx](../apps/web/src/app/loading.tsx)
- [ ] [apps/web/src/app/not-found.tsx](../apps/web/src/app/not-found.tsx)
- [ ] [apps/web/src/app/error.tsx](../apps/web/src/app/error.tsx)
- [ ] [apps/web/src/app/global-error.tsx](../apps/web/src/app/global-error.tsx)
- [ ] [apps/web/src/components/retry-button.tsx](../apps/web/src/components/retry-button.tsx)

## Later: web API/session connection — pending

These support frontend integration, but they are server/transport plumbing. Come back after the screens make sense.

- [ ] [apps/web/src/lib/api.ts](../apps/web/src/lib/api.ts)
- [ ] [apps/web/src/lib/server.ts](../apps/web/src/lib/server.ts)
- [ ] [apps/web/src/lib/session.ts](../apps/web/src/lib/session.ts)
- [ ] [apps/web/src/app/api/backend/[...path]/route.ts](../apps/web/src/app/api/backend/[...path]/route.ts)

## Outside your current reading scope — pending

None of these blocks finishing the frontend reading checklist above.

- [ ] Backend implementation: `apps/api/**` — Express, MongoDB, models, routes and controllers.
- [ ] Startup/database helpers: `scripts/**` (including `demo.mjs`) and `compose.yaml`.
- [ ] Automated test code: `*.test.*`, `tests/e2e/**` and test configuration.
- [ ] Build/tool configuration, dependencies, CI and agent instructions.
- [ ] Detailed planning, delivery and design-source documents — consult when needed.

This is your code-reading scope. Required app behavior and verification still apply.

## Already reviewed — progress kept

- [x] [package.json](../package.json)
- [x] [scripts/setup.mjs](../scripts/setup.mjs)
- [x] [apps/web/.env.example](../apps/web/.env.example)
- [x] [apps/api/config/config.env.example](../apps/api/config/config.env.example)

## Next batch: changed frontend files to revisit

Batch: \***\*\_\_\*\***

- [ ] File: \***\*\_\_\*\***
