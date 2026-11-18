# Presentation outline — 15 minutes

## Slides and timing

1. **Problem and users (2 min):** Fragmented campus notices; student who lost an item, finder, administrator. State the project's scope and fictional scenario.
2. **Design and privacy (included in 2 min):** Show mobile and desktop wireframes, report-to-return flow, and which fields are public versus private.
3. **Live workflow (6 min):** Register/sign in as a fictional student; post a found report with private detail; sign in as a second student; search/filter and submit private evidence; show own claim status; sign in as admin; explain and approve; confirm collection; show public returned state. Repeat at mobile viewport.
4. **Technical trace (4 min):** Explain React form -> `/api/reports/:id/claims` -> Zod validation and session/role checks -> transaction and parameterized MySQL insert -> claimant-only `/api/claims/mine`. Explain why the public reports query has a separate column projection.
5. **Small change / defence (3 min):** Be ready to add or debug a small validation or UI change. Explain backend permissions, race conditions, password hashing, session revocation, and a limitation/future improvement.

## Before presenting

- Start MySQL, API, and frontend; verify health and database persistence after an API restart.
- Prepare two fictional student accounts and one admin account locally. Keep passwords out of slides, screenshots, Git, and chat.
- Reset or seed demo records so the flow is short and predictable. Keep a local version available if deployment connectivity fails.
- Test browser width around 375 px and keyboard-only navigation.
- Keep report, test record, slides, final commit ID, deployment URL, and Moodle-only account details ready for the actual submission.
