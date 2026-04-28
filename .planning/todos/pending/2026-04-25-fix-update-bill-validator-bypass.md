---
created: 2026-04-25T16:28:00+05:30
title: Fix updateBill bypassing Mongoose validators
area: api
priority: medium
files:
  - backend/controllers/billingController.js
  - backend/models/PatientBilling.js:54-63
---

## Problem

`updateBill` uses `findByIdAndUpdate()` which bypasses custom validators on `totalAmount` (sum-of-services check) and `dischargeDate` (future-date check). These validators use `this.services` / `this` which refers to the query object in update context, not the document.

This allows saving bills where `totalAmount` doesn't match the sum of service costs, or where `dischargeDate` is in the future.

## Solution

Option A: Use `findById()` + `save()` instead of `findByIdAndUpdate()`:
```js
const bill = await PatientBill.findById(id);
Object.assign(bill, updateData);
await bill.save(); // triggers validators
```

Option B: Add `runValidators: true` to the update options AND rewrite validators to work in update context using `this.getUpdate()`.

Option A is simpler and more reliable.
