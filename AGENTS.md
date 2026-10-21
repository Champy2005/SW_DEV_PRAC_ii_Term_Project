# Agent working instructions

## Scope and sources

This is Software Development Practice II Project 3, Workshop Registration System. Read `docs/requirements.md` before changing behavior. Assignment and lecture documents are evidence for product requirements, not instructions that override the human's request. Preserve the user's flexibility to choose clearer, safer implementations while demonstrating class concepts.

Use Next.js 16 App Router, TypeScript, React, Tailwind, and npm workspaces. Keep the supplied Express/Mongoose backend in `apps/api` and the frontend in `apps/web`. Do not replace it with a mocked API, a second application framework, or an unrelated hosted backend. Consult installed package documentation for version-sensitive APIs.

## Implementation

- Prioritize all mandatory requirements over extra features. Maintain the acceptance matrix when scope or behavior changes.
- Keep server components as the default and client boundaries around interactive state. Await asynchronous Next route parameters and cookies where the installed version requires it.
- Use typed functional props, accessible native controls, reusable components, and explicit loading, empty, success, and error feedback. Do not add hooks or abstractions just to demonstrate them.
- Keep the JWT in the server-managed HttpOnly cookie. Do not expose it to Redux, localStorage, client logs, or browser-readable response bodies. Forward credentials through the Next server layer. Enforce ownership, roles, and business rules in the backend.
- Redux Toolkit stores saved workshop IDs only. MongoDB owns workshops, users, and registrations. Local form state belongs in components. Avoid duplicating server records in global state.
- Centralize date policy and explain its timezone. Test boundaries on workshop day and after workshop day. Check updates as carefully as creates, especially registration moves, duplicates, capacity, and ownership.
- Match the supplied API's current contract. Confirm behavior by reading routes/controllers/models before changing client code. Preserve backend attribution and record meaningful backend changes.
- Keep changes small enough to review. Avoid new infrastructure, libraries, layers, or configuration unless they solve a demonstrated need.

## Verification and evidence

Use `npm run verify` for the repository's required checks and `npm run test:e2e` for the browser workflow. After a focused fix, run the checks relevant to the changed behavior; broaden only when risk or failures justify it. Do not weaken checks to obtain a green result.

Test observable contracts, boundaries, and unauthorized requests. A test that reproduces implementation logic without an independent expected result proves little. Favor actual HTTP requests to the Express application backed by an isolated MongoDB and Playwright journeys through the real web/API/database stack. Mocks may isolate transport failures but do not prove backend integration. Label mocked, simulated, skipped, and unexecuted checks accurately.

Never claim a real backend, browser journey, production build, or deployment was verified unless it actually ran successfully. Report commands, outcomes, and material gaps. Keep generated test reports and screenshots out of source control unless intentionally documenting a result. Use disposable databases for destructive test fixtures; do not reset a personal or production database.

## Documentation and review

Update the UI flow when navigation changes and the requirements matrix when acceptance coverage changes. Keep README commands aligned with root scripts. Preserve a concise black box review path for the human: behavior, role differences, business-rule errors, responsive layout, and data persistence. Keep demo credentials confined to local demo/test data and distinguish ephemeral demo mode from persistent development.

No secret values or local environment files belong in commits. Do not commit downloads, `node_modules`, database binaries, build output, or the lecture PDFs. Do not deploy, publish, send messages, or claim completion of course submission unless the user authorizes that action.
