# UI flow design

This diagram is the intended Project 3 review flow. Keep it synchronized with implemented navigation. Source requirements: `6901_Project_Topics-957520-17911698720803.pdf`, page 4; presentation/UI flow requirement: `00_ClassOrientation-957520-17859437725987.pdf`, page 11.

```mermaid
flowchart TD
    Catalog[Public workshop catalog] --> Detail[Workshop details and total capacity]
    Catalog --> Search[Search and filter]
    Search --> Detail
    Catalog --> Saved[Saved workshop shortlist]
    Saved --> Detail
    Detail --> Session{Signed in?}
    Session -->|No| Login[Sign in]
    Login --> Signup[Create account]
    Signup --> Login
    Login --> Role{Account role}
    Session -->|Member| Register[Confirm workshop registration]
    Role -->|Member| Catalog
    Register --> Result{Server accepts?}
    Result -->|Yes| Mine[My registrations]
    Result -->|No| RuleError[Explain error and refresh workshop state]
    RuleError --> Detail
    Mine --> Move[Change registered workshop]
    Move --> Register
    Mine --> Cancel[Confirm cancellation]
    Cancel --> Mine
    Role -->|Admin| Admin[Admin workspace]
    Session -->|Admin| Admin
    Admin --> Workshops[Manage workshops]
    Workshops --> WorkshopForm[Create or edit workshop]
    WorkshopForm --> Workshops
    Workshops --> DeleteWorkshop[Confirm workshop deletion]
    DeleteWorkshop --> Workshops
    Admin --> Registrations[All users' registrations]
    Registrations --> AdminMove[Change a user's workshop]
    AdminMove --> Registrations
    Registrations --> AdminCancel[Confirm registration deletion]
    AdminCancel --> Registrations
    Mine --> Logout[Logout]
    Admin --> Logout
    Logout --> Catalog
```

## Screen responsibilities

| Screen | Main action | Required feedback |
|---|---|---|
| Catalog | Find and open a workshop | Result count, no matches, loading, connection failure, date and total capacity. |
| Workshop details | Register or save | Instructor, description, date, location, total capacity; past/already-registered states, clear full-workshop rejection, sign-in prompt. |
| Sign up / sign in | Establish an account/session | Field labels, required-field validation, pending submit, credential errors, successful navigation. |
| My registrations | Review, change, cancel | Current registrations, active count, empty state, refreshed registration state, cancellation confirmation. |
| Admin workshops | Add, edit, delete | Complete workshop fields, validation errors, ID-linked changes, destructive-action confirmation. |
| Admin registrations | Manage a user's registration | Clear workshop and owner context, changes/cancellation feedback, rule errors. |
| Saved shortlist | Compare intended choices | Distinguish saved from registered; empty state; no reservation implied. |

## Interaction review

- Every interactive control has a visible name; keyboard users can reach actions and see focus.
- Navigation makes the current role and section clear. Guest/member/admin controls match permissions.
- Errors preserve useful form input and explain how to recover. A failed request never displays a false success.
- Disable duplicate submission while pending. Refresh registration state after successful changes; capacity is a total, not a remaining-place count.
- Cancellation and workshop deletion require a clear confirmation with the affected record identified.
- Layout works on a narrow phone screen and a desktop; cards, forms, tables, and dialogs stay usable.
- Distinguish workshop date, total capacity, registration state, and the three-active-workshop limit. Do not rely on color alone.

For the presentation, show the diagram and follow one guest-to-member journey plus one admin journey. Confirm actual screen names and routes before using this document as final submission evidence.
