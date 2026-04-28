---
created: 2026-04-25T16:28:00+05:30
title: Fix inconsistent API response shapes for empty results
area: api
priority: medium
files:
  - backend/controllers/billingController.js:144-146
  - backend/controllers/expenseController.js
---

## Problem

When no bills/expenses are found, the API returns `{ message: "No bills found" }` instead of `{ data: [], pagination: {...} }`. The frontend always reads `billsData?.data` and `billsData?.pagination`, which become `undefined`.

The UI works (shows "0 records") but is fragile. Any code assuming `data` is always an array will break.

## Solution

Return consistent response shape regardless of result count:
```js
// Replace:
if (!bills.length) {
  return res.status(200).json({ message: "No bills found" });
}

// With:
if (!bills.length) {
  return res.status(200).json({ data: [], pagination: { page, pages: 0, total: 0, limit } });
}
```

Apply to both `getAllBills` and `getAllExpenses`.
