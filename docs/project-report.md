# UCU Campus Lost and Found — Project Report Draft

**Course:** CSC1202 Web and Mobile Applications Development  
**Programme/year:** [Complete]  
**Student/group and contribution:** [Complete with actual contribution]  
**Date:** [Complete]

> Format this report in Trebuchet MS, 12 pt, 1.5 line spacing, justified alignment. Replace bracketed notes with verified project-specific information before submission.

## Abstract

This project develops a responsive lost-and-found web application for a fictional UCU campus scenario. Students can report lost and found items, search public listings, submit private ownership claims, and follow their own activity. An administrator reviews evidence, records a decision and response, and confirms collection after handover. The application uses React, Node.js/Express, and MySQL. Passwords are hashed; backend authorization protects reports, evidence, and administrative actions. The report describes the needs, design, implementation, test plan, limitations, and reflection. [Add verified test results and deployment information.]

## 1. Introduction and problem

Campus lost-item notices shared through separate messaging groups can fail to reach the owner. Public notices also create a risk: a visible description may disclose every detail a claimant would need to imitate an owner. The fictional case in the assignment motivates a common searchable place with private verification and a recorded handover.

### Objectives

- Provide student registration, login, logout, reports, search, and personal activity.
- Separate public descriptions from private identification evidence.
- Restrict private data and administration on the backend.
- Record a claim decision and mark return only after collection is confirmed.
- Provide a responsive, keyboard-operable interface backed by persistent MySQL data.

## 2. Requirements and design

The user groups are students reporting lost/found items and an administrator reviewing claims. The design brief and wireframes are in `docs/design-brief.md`. The database contains users, sessions, reports, and claims. React communicates with an Express API; the API uses Zod validation and parameterized MySQL queries. The browser receives a SameSite, HttpOnly session cookie; the database stores a digest so logout can revoke the session.

## 3. Implementation

The public board supports keyword, kind, category, location, date, and status filters. A report form stores required item fields and optional HTTPS photo URL. Found reports may include a private identifying detail, returned only to the report owner and administrator. Students may claim open found listings with private evidence; the API prevents self-claims and claims on returned items. Administrators make a decision with a response. Approval authorizes collection but does not return the item; a separate confirmation records collection and changes report status.

The UI uses labelled controls, inline HTML constraints, accessible feedback, responsive layouts, visible keyboard focus, and reduced-motion handling. Server-side Zod validation and authorization remain authoritative.

## 4. Testing and evaluation

Use the reproducible steps in `docs/manual-test-plan.md`. Record actual expected/observed outcomes, pass/fail, date, browser/device, and any issue. Cover the full report-to-return sequence, invalid input, unsuccessful login, ownership boundaries, private-data exposure, two competing claims, return restrictions, small-screen layout, and keyboard navigation. Do not report a test as passed until it has been run against the configured application.

## 5. Limitations

The application stores optional photographs as HTTPS URLs and does not upload/manage image files. It has no email/SMS notifications, UCU identity integration, automatic match suggestions, or audit trail beyond current claim/review/return data. Deployment requires a persistent MySQL service, HTTPS, and secure environment configuration. The submitted build is a student project and has not been independently security-audited.

## 6. Reflection and future work

[Describe your own decisions, contribution, challenges, improvements, and what you learned. Explain one action from React through an API route to a MySQL query. Identify any actual defects and their resolutions. Acknowledge external code/references and AI assistance only as required and permitted by the lecturer's rules.]

## References

Use IEEE numbered citations for sources you actually consult. Suggested primary references to verify and cite in the final report:

[1] React, “Quick Start,” React documentation. [Online]. Available: https://react.dev/learn. [Accessed: add date].  
[2] Express.js, “Express routing,” Express documentation. [Online]. Available: https://expressjs.com/en/guide/routing.html. [Accessed: add date].  
[3] Oracle, “MySQL 8.0 Reference Manual,” MySQL documentation. [Online]. Available: https://dev.mysql.com/doc/refman/8.0/en/. [Accessed: add date].
