# Design brief — UCU Campus Lost and Found

## Problem and user needs

Lost-item notices are fragmented across informal conversations and social groups. A finder and owner may never see one another's messages; a public photo can also reveal enough for someone else to make a false claim. The system gives the campus one searchable board, a private claim channel, and an accountable handover record.

| User | Need | Design response |
|---|---|---|
| Student who lost an item | Search by remembered item, date, category, and place; follow a claim | Public filters, own-report and own-claim pages, private evidence form |
| Student who found an item | Publish a useful notice without giving away proof | Found report includes a separate private identifying detail |
| Administrator | Compare private evidence, explain decisions, and confirm physical collection | Protected desk, decision reason, separate collection confirmation |

## Requirements and acceptance criteria

1. Register, sign in, and sign out; store bcrypt password hashes and revoke the current session on logout.
2. Students create and edit their own reports. Required fields: kind, title, category, description, item date, and campus location. Found reports have optional private identifying detail; no public contact field exists.
3. Search/filter public reports; public JSON excludes reporter identity and all private detail. Report status is open or returned.
4. Authenticated claimant submits private evidence on a found/open report. Reject a reporter claiming their own found report, repeated pending claim by the same student, and any claim after return.
5. Only admin can read all private evidence, approve/reject with a response, and confirm collection. Approval is not return. A report can have at most one approved claim.
6. Layout supports mobile and desktop, forms have labels, validation messages explain corrections, and controls work with keyboard focus.

## Wireframes (low fidelity)

### Desktop browse view

```text
+------------------------------------------------------------------+
| UCU Lost & Found       Browse items   My activity   [Sign in]     |
+------------------------------------------------------------------+
| Lost something?                         (illustration / sample)  |
| Find it here. Search the board.                                   |
| [Post a report]  Search the board                                 |
|                                                                   |
| The campus board                               12 reports shown   |
| [Keyword.......................................................]  |
| [Kind] [Category] [Location] [Date] [Status] [Clear]             |
| [report card]        [report card]        [report card]            |
+------------------------------------------------------------------+
```

### Mobile browse view

```text
+------------------------------+
| UCU Lost & Found   [menu]    |
| Lost something?              |
| Find it here.                |
| [Post a report]              |
| Search the board             |
| [Keyword...................] |
| [Kind]       [Category]      |
| [Location]   [Date]          |
| [report card]                |
| [report card]                |
+------------------------------+
```

### Claim and handover

```text
Public found-item detail -> private evidence form -> claimant activity status
                                                -> admin review + reason
                                                -> collection confirmed by admin
                                                -> public report marked returned
```

## Architecture

React/Vite single-page interface calls a Node.js/Express API. The API validates JSON with Zod, hashes passwords with bcrypt, uses opaque random HttpOnly cookies for sessions, checks role and ownership on the backend, and uses parameterized SQL against MySQL. MySQL stores persistent accounts, session revocations, reports, claims, decisions, and collection timestamps. Public and private SQL projections are separate.

## Database design

```text
users 1---* auth_sessions
users 1---* reports (reporter_id)
reports 1---* claims
users 1---* claims (claimant_id)
users 1---* claims (reviewed_by, nullable)
```

`reports` stores public listing fields, private `identifying_details`, `status`, and `returned_at`. `claims` stores private `evidence`, status, admin response, reviewer, review time, and collection time. Foreign keys preserve referential integrity; indexes support session expiry, listing filters, pending claims, and a user's claim history. Application transactions lock the relevant report/claim during claim, review, and return operations.

## Two-week plan

| Days | Work and evidence |
|---|---|
| 1–2 | Needs, requirements, wireframes, schema, plan, checkpoint brief |
| 3–4 | MySQL setup, registration/login/logout, backend permission checks |
| 5–6 | Report form, public board, search and filters |
| 7–8 | Private claims, admin decisions, confirmed return, integration |
| 9–10 | Workflow, invalid input, authorization, competing-claim manual tests |
| 11 | Mobile and keyboard review; correct defects and record limitations |
| 12–13 | Presentation rehearsal, trace UI/API/DB action, oral defence preparation |
| 14 | Final report, test evidence, slides, repository/deployment details, submission |
