# Course alignment and source evidence

The user requested the class's methods with flexibility for better implementation. Lecture documents describe teaching examples; they do not require reproducing every workshop technique or library. Page references below are the numbered PDF pages.

| Lecture file | Pages | Applied knowledge |
|---|---|---|
| `00_ClassOrientation-957520-17859437725987.pdf` | 6, 9, 11–12 | React with Next.js; frontend over a supplied backend; UI flow, demo, additional functionality, and division of work. The later submission PDF supplies the concrete hand-in and presentation journey. |
| `Class01_WebDevFundamentals-957520-17544003322827.pdf` | 33–38, 44–56 | HTML forms and controls, CSS selectors, spacing, and the box model. Use semantic controls and clear layouts. |
| `Class02_JavaScriptTypeScript-957520-17544065847025 (1).pdf` | 32–35, 60–65, 69–72 | Functions, arrow functions, TypeScript static typing, unions, typed parameters and return values. |
| `Class03_ReactFramework-957520-17865352054608.pdf` | 13–24, 28–30 | Next.js 16, npm, TypeScript, ESLint, `src/app`, filesystem routing, pages/layouts, static assets, and `next/image`. |
| `Class04_Pages_Props_Style-957520-17869840474340.pdf` | 3–9, 15–20, 21–35, 36–45 | Typed functional props, composition, nested layouts, `next/link`, CSS Modules, Tailwind with PostCSS. |
| `Class05_Form_Interaction_Event-957520-17877366596774.pdf` | 2–6, 9–19, 32–43 | React handlers and callbacks, server/client boundaries, form controls, and library-based controls where useful. |
| `W06_ReactState-957520-17883323524647.pdf` | 9–10, 18–29 | `useState`, reducers/actions, lifted state, callback props, mapped lists, and controlled inputs. |
| `W07_Router_Navigation-957520-17888570978209.pdf` | 4–12, 27–31 | App Router route groups and dynamic segments; asynchronous `params`; `next/link` and `useRouter` from `next/navigation`. |
| `6801_W08_Hooks-957520-17578251093552.pdf` | 2–4, 13–17, 28–34, 36 | Rules of Hooks, `useRef`, effect dependencies and cleanup, custom `use…` hooks, and other built-in hooks. |
| `W09_DataFetching-957520-17908413706988.pdf` | 2–9, 15, 37–44, 47–55 | Native `fetch`, async/await, server and client fetching, response handling, and loading/Suspense patterns. |
| `W10_DataPosting-957520-17913744221453.pdf` | 2–9 | Credentials, JWT-backed authentication, route handlers, and sessions. The lecture uses NextAuth v4; this project's cookie server layer is a deliberate adaptation. |
| `W11_Redux-957520-17919964134724.pdf` | 14–16, 23–26, 31–35 | Redux Toolkit `configureStore`/`createSlice`, Provider, typed selectors and dispatch. Apply to the saved-workshop shortlist. |
| `W12_AdvancedReact-957520-17922300140272.pdf` | 2–12, 14–19 | Persistence and server actions/revalidation are extension material. Use only when needed; the baseline may refresh fetched records through route handlers. |
| `W13_Testing-957520-17617264035331.pdf` | 2–7, 14–20, 21–39 | Unit/integration/E2E/acceptance levels, Arrange/Act/Assert, assertions, DOM queries, user interactions, and Jest/React Testing Library workshops. Existing Vitest helpers, real HTTP/MongoDB integration checks, and Playwright journeys apply these concepts with different tools. |
| `W14_TestingDeploy-957520-17938047974877.pdf` | 2–19, 20–34, 37–67 | Cypress browser scenarios, hooks, network fixtures/interception, SSR interception limits, and backend/frontend deployment examples. Existing Playwright checks test the real application; deployment remains a separate delivery gate. |
| `Project-Submission-Presentation-Instructions_6aecab16d9430.pdf` | 1–4 | Required grading, UI design attachment, GitHub/Vercel links, dates, attendance, and ordered seven-minute demo. See the [course delivery checklist](course-delivery.md). |

## Deliberate choices

- **Keep the framework:** Next.js 16 App Router with TypeScript, ESLint, React, Tailwind, and npm. The syllabus's “React Router” topic is implemented by Next routing in W07; `react-router-dom` is unnecessary.
- **Use available compatible versions:** Class03 names `create-next-app@16.3.0` and Node 20.9+. Use the actually available supported Next 16 release and a supported Node LTS runtime, with versions recorded in the lockfile. Do not assume the slide's exact release exists in the package registry.
- **Small cookie authentication layer:** keep the backend-issued JWT server-side in an HttpOnly SameSite cookie instead of introducing NextAuth v4 for one credentials provider. This preserves authentication, protected requests, server/client boundaries, and backend access control. See [architecture](architecture.md).
- **Focused global state:** use Redux only for saved IDs; it demonstrates shared state without duplicating the backend database or authentication.
- **Plain controls where sufficient:** Material UI, MUI DatePicker, Day.js, and Emotion appear in Class05 pp37–40. They are taught tools, not explicit Project 3 requirements. Native controls can provide a smaller, accessible implementation.
- **Effects for external synchronization:** use handlers for user-triggered mutations, state for local interaction, and effects only when synchronizing external systems. Add cleanup when subscribing to listeners.
- **Behavior-focused verification:** W13's Jest/React Testing Library and W14's Cypress are teaching workshops, not a requirement to replace the current test stack. Keep Vitest for isolated helpers, Node/Supertest with disposable MongoDB for real HTTP integration, and Playwright for user journeys. Use readable setup/action/assertion steps and assert observable results. Human review supplies the acceptance layer described in W13 p3; a passing script does not imply human acceptance.
- **Real SSR integration:** W14 p23 warns that browser interception cannot stub server-side component fetches. The real web/API/database test stack avoids claiming that a browser-only mock verifies server fetching. Label isolated mocks explicitly when used for a transport failure.
- **Deployment settings follow this architecture:** W14 pp39, 58–59, 66 teach configurable service URLs. This app keeps `API_URL` on the Next server and JWT/database secrets out of browser bundles. W14 pp63–65 needs MongoDB in the example frontend for direct database server actions; our frontend uses the Express API and does not need a second database connection. The example's backend-on-Vercel steps do not resolve this API's process-local mutation serialization; WR-010 records the hosting decision and deployed verification.

W07 p8 contains an inconsistent type annotation for promised route props. Its p11 sample correctly places the Promise on `params`: `{ params: Promise<{ id: string }> }`. Follow the installed framework contract and the correct pattern. Some rendering/cache explanations are version-sensitive; use explicit cache behavior for personalized and availability data.

Earlier source PDFs remain in the user's Downloads directory; the three new PDFs were supplied in the workspace. The documentation records names/pages without adding lecture materials to source control. This mapping is evidence for implementation and presentation, not a statement that every listed concept is mandatory or already complete.
