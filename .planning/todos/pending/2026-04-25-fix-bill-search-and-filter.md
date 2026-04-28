---
created: 2026-04-25T16:28:00+05:30
title: Fix bill search sending AND instead of OR filter
area: ui
priority: high
files:
  - frontend/src/pages/BillingPage.jsx:49-52
  - backend/controllers/billingController.js
---

## Problem

When searching bills, the frontend sends both `patientName` and `patientId` as separate query params with the same value. The backend applies these as AND conditions in the MongoDB filter, so a record must match both fields simultaneously — which almost never happens. Bill search effectively returns no results.

## Solution

Send a single `search` query param from the frontend:
```js
...(filters.searchTerm && { search: filters.searchTerm }),
```

Handle it in the backend controller with `$or` and regex:
```js
if (req.query.search) {
  const regex = new RegExp(req.query.search, "i");
  filter.$or = [{ patientName: regex }, { patientId: regex }];
}
```
