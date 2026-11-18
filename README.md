# UCU Campus Lost and Found

A responsive lost-and-found web application for the fictional UCU campus scenario in CSC1202. Students can post lost or found reports, search the public board, make private claims on found items, and follow their own reports and claims. An administrator reviews private evidence, records a decision and collection instructions, then confirms the return after handover.

## Requirements

- Node.js 20 or later and npm
- MySQL 8.0 or later
- A modern browser

## Run locally

1. Copy `server/.env.example` to `server/.env` and set the database credentials and a long random `SESSION_PEPPER`.
2. Create a MySQL account with permission to create/use the `ucu_lost_found` database (or adjust `server/sql/schema.sql` for a managed database).
3. From the project root, run `npm install`.
4. Run `npm run db:setup` to create the schema and insert optional fictional sample listing data. To insert the sample listing, first register `namusoke@example.test` through the app; no password or credential is included in the repository.
5. To create an administrator, set `ADMIN_EMAIL`, `ADMIN_NAME`, and a unique `ADMIN_PASSWORD` (at least 14 characters) in `server/.env`, then run `npm run admin:create`. Remove the password value from the environment file when finished; never commit `.env`.
6. Run `npm run dev`, then open <http://localhost:5173>.

For a production build, run `npm run build`; serve `client/dist` with a static web server and run the API with `npm start`. Configure `CLIENT_ORIGIN` to the exact frontend origin, set `COOKIE_SECURE=true` behind HTTPS, and provide the MySQL connection variables. A hosting provider must support a persistent MySQL database; ephemeral local files are not used for application records.

## Configuration

See `server/.env.example`. Sessions are random opaque tokens stored as SHA-256 digests in MySQL and sent in an HttpOnly, SameSite=Lax cookie. Set a unique random session pepper in deployment. Passwords use bcrypt with cost 12. Admin role assignment is performed only by the provisioning script; public registration always creates a student account.

## Database and data privacy

- `server/sql/schema.sql` creates users, revocable sessions, reports, and claims with their foreign keys and search indexes.
- `server/sql/seed.sql` inserts one fictional public found-item report only when its fictional reporter account exists.
- `identifying_details` is returned only by the authenticated owner's `/api/reports/mine` endpoint and the admin API.
- Claim evidence and administrator responses are returned only to the claimant (`/api/claims/mine`) and administrator endpoints.
- Public report responses contain no account identity, private contact details, identifying proof, or claim data.
- Images are optional HTTPS image URLs. Do not include faces, contact details, or proof details in public images.

## Main workflows

1. Student registers and signs in.
2. Student posts a lost or found report; a found report can include a separate private identifying detail.
3. Anyone can search and filter public listings by keyword, report kind, category, location, date, and open/returned status.
4. A signed-in student privately claims an open found report with evidence. The reporter cannot claim their own found listing; returned listings reject further claims.
5. Administrator approves or rejects a pending claim with a reason. Approval permits collection but does not mark the item returned.
6. After physical handover is confirmed, administrator records collection; the claim and report then show the returned state.

## API overview

All paths are prefixed with `/api`. Authentication uses the cookie; the API does not return bearer tokens.

| Method and path | Access | Purpose |
|---|---|---|
| `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Public / signed in | Student account and session lifecycle |
| `GET /reports` | Public | Search public reports |
| `POST /reports`, `PUT /reports/:id`, `GET /reports/mine` | Signed in | Create/edit own reports and view private report data |
| `POST /reports/:id/claims`, `GET /claims/mine` | Signed in | Submit and track own claims |
| `GET /admin/reports`, `GET /admin/claims` | Admin | Review reports and private claim evidence |
| `POST /admin/claims/:id/review`, `POST /admin/claims/:id/return` | Admin | Record claim decision and confirmed collection |

## Design and assessment documents

- [`docs/design-brief.md`](docs/design-brief.md): problem, needs, requirements, architecture, database design, textual mobile/desktop wireframes, and two-week plan.
- [`docs/project-report.md`](docs/project-report.md): report draft in the requested section order; transfer it into a Trebuchet MS, 12 pt, 1.5-spaced, justified document and complete student-specific contribution/reflection before submission.
- [`docs/manual-test-plan.md`](docs/manual-test-plan.md): reproducible manual test cases and result recording sheet. Record actual outcomes during local demonstration; no results are pre-claimed.
- [`docs/presentation.md`](docs/presentation.md): 15-minute slide outline and demonstration sequence.

The GitHub repository link and final commit ID should be recorded after publication. The deployment URL, Moodle-only assessment credentials, milestone evidence, and permitted AI/external-code acknowledgements must be completed by the student for their actual submission context.

## Security and limitations

Backend authorization is enforced on every private route. Sessions expire after seven days and logout revokes the current database session. Public image URLs are externally hosted rather than uploaded through the application. Email/SMS alerts, automated matching, account verification, and administrator audit history are outside this assessment build. The fictional scenario and sample report use no real personal information.
