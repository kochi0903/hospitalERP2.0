---
created: 2026-04-25T16:28:00+05:30
title: Add pagination to getAllIncome endpoint
area: api
priority: low
files:
  - backend/controllers/incomeController.js:5
---

## Problem

`getAllIncome` returns all income records without pagination via `Income.find().sort({ createdAt: -1 })`. The soft-delete middleware applies, but as data grows, this will load potentially thousands of records into memory and send them all in one response.

Also, `exportBillsExcel` logs audit activity after the response is already sent — fragile ordering that could crash if the audit logger tries to touch `res`.

## Solution

Add pagination mirroring the pattern used in `getAllBills`:
```js
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;
const total = await Income.countDocuments();
const income = await Income.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
```
