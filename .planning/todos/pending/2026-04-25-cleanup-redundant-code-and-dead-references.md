---
created: 2026-04-25T16:28:00+05:30
title: Clean up redundant code, dead references, and comment mismatches
area: general
priority: low
files:
  - backend/index.js:22-31
  - backend/models/Expense.js:88
  - backend/models/User.js:45-47,63
  - frontend/src/pages/SettingsPage.jsx:164
  - frontend/src/services/baseQuery.js:11
  - frontend/src/utils/AxiosToast.js:7
---

## Problem

Multiple small issues across the codebase:

1. **Redundant body parsers** (`index.js:30-31`): Both `bodyParser.json()` and `express.json()` registered — same parser runs twice.
2. **Rate limiter comment mismatch** (`index.js:22-26`): Comments say "15 minutes / 100 requests" but values are 5 minutes / 200 requests.
3. **Phantom `department` field**: `Expense` model has index on nonexistent `department` field; `User` model virtual references `this.department` which doesn't exist in schema; `User` model has index on `department`.
4. **Dead `department_head` role check** (`SettingsPage.jsx:164`): Checks for a role not in the enum — unreachable code.
5. **Hardcoded Content-Type** (`baseQuery.js:11`): Always sets `application/json`, will break future file uploads.
6. **AxiosToast crash** (`AxiosToast.js:7`): Doesn't guard against `data.response.data` being undefined on network errors.

## Solution

- Remove `bodyParser.json()` (keep `express.json()`)
- Fix rate limiter comments to match actual values
- Remove phantom `department` indexes and virtual references, or add `department` field to schemas
- Remove dead `department_head` block from SettingsPage
- Remove hardcoded Content-Type from baseQuery (let browser set it)
- Add optional chaining in AxiosToast: `data?.response?.data?.message || "An error occurred"`
