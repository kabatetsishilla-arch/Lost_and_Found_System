# Manual test plan and evidence record

Run against a configured local instance. Replace each `Not run` with the actual result, date, environment, and evidence reference before Moodle submission. Use only fictional accounts and items.

**Build/version:** [commit ID]  
**Tester/date/browser:** [complete]  
**Database:** MySQL version [complete]  
**Evidence folder/reference:** [complete]

| ID | Steps | Expected outcome | Actual outcome | Result / evidence |
|---|---|---|---|---|
| T01 Register/login/logout | Register fictional student; sign in; refresh; sign out; request `/api/auth/me` afterward | Account created; login survives page refresh; logout invalidates session and `/me` returns 401 | Not run | Not run |
| T02 Invalid registration | Submit missing name, malformed email, short password; repeat with existing email | Inline browser validation or clear API message; duplicate email returns conflict; no account created from invalid data | Not run | Not run |
| T03 Failed login | Submit unknown email and wrong password | Generic incorrect email/password message; no session created | Not run | Not run |
| T04 Reporting and search | Create lost and found reports; search title; filter by kind/category/location/date/status | Reports persist after API restart; filters return matching public cards | Not run | Not run |
| T05 Private listing boundary | Add identifying detail to found item; inspect public `/api/reports` JSON and public card | Private detail, reporter ID/name, claims, and contact information absent | Not run | Not run |
| T06 Edit ownership | Student A attempts `PUT /api/reports/:id` for Student B's report | Request denied/not found; B's report remains unchanged | Not run | Not run |
| T07 Private claim workflow | Student B claims A's found item using unique fictional proof; view My activity | Claim created; evidence absent publicly; claimant sees status and admin response | Not run | Not run |
| T08 Private claim access | Student C requests B's private claim record; student calls admin endpoint | C sees only own claims; non-admin receives 403 for admin endpoint | Not run | Not run |
| T09 Self-claim | Reporter A claims own found report | API rejects the claim; no claim record created | Not run | Not run |
| T10 Competing claims | Two students claim same found item; admin approves one; admin attempts to approve other | One approval at most; second decision rejected; item remains open until collection confirmed | Not run | Not run |
| T11 Return and post-return claim | Admin confirms collection for approved claim; inspect listing; attempt new claim and another return | Listing shows returned; new claim/duplicate return is rejected | Not run | Not run |
| T12 Mobile layout | Use browser responsive mode at 375 × 812; browse, filter, open form/detail, submit | No horizontal page overflow; controls fit and remain usable | Not run | Not run |
| T13 Keyboard access | Reload; navigate with Tab/Shift+Tab/Enter/Escape through navigation, filters, forms, dialogs | Visible focus; useful order; all actions available without pointer; Escape closes modal | Not run | Not run |
| T14 Backend validation | Send too-short fields, malformed date, invalid photo scheme, excessive values directly to API | 400 validation response with actionable message; no invalid record persisted | Not run | Not run |

## Defect log

| ID | Defect and reproduction | Fix / commit | Retest result |
|---|---|---|---|
| — | Add defects found during actual execution | — | — |

## Evidence checklist

- Redacted screenshots of report creation, search/filter results, private claim status, admin decision, and returned listing.
- Capture a public API response proving that private fields are absent; do not include real passwords or private evidence in public repository evidence.
- Record test environment and commit ID. Store any assessment login credentials privately through Moodle, never in this repository.
