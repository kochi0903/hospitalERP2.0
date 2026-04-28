---
created: 2026-04-25T16:28:00+05:30
title: Fix confirmDelete undefined — runtime crash on Billing and Expense pages
area: ui
priority: critical
files:
  - frontend/src/pages/BillingPage.jsx:272
  - frontend/src/pages/ExpensePage.jsx:223
---

## Problem

Both `BillingPage.jsx` and `ExpensePage.jsx` pass `confirmDelete` to the `DeleteConfirmModal`'s `onConfirm` prop, but this function is never defined anywhere in either component. Clicking "Confirm" on the delete modal throws a `ReferenceError` and crashes the page.

Delete functionality is **completely broken** on both pages.

## Solution

Define a `confirmDelete` async handler in each page:

**BillingPage.jsx:**
```js
const confirmDelete = async () => {
  try {
    await deleteBill(selectedBillId).unwrap();
    dispatch(setMessage("Bill deleted successfully"));
    dispatch(setDeleteModalOpen(false));
    refetchBills();
  } catch (err) {
    dispatch(setError(err?.data?.message || "Failed to delete bill"));
  }
};
```

**ExpensePage.jsx:**
```js
const confirmDelete = async () => {
  try {
    await deleteExpense(selectedExpenseId).unwrap();
    dispatch(setMessage("Expense deleted successfully"));
    dispatch(setDeleteModalOpen(false));
    refetchExpenses();
  } catch (err) {
    dispatch(setError(err?.data?.message || "Failed to delete expense"));
  }
};
```
