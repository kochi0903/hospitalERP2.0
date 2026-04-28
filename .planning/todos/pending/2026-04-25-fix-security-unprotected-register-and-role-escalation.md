---
created: 2026-04-25T16:28:00+05:30
title: Fix security — unprotected registration and role escalation
area: auth
priority: critical
files:
  - backend/routes/userRoutes.js:13
  - backend/controllers/userController.js:126-129
---

## Problem

**Two related security vulnerabilities:**

1. **Open registration:** `POST /api/user/register` has no authentication or authorization. Anyone on the internet can create accounts with any role, including `admin`.

2. **Role escalation via profile update:** `updateProfile` blocks password changes but allows `role` changes via `if (updateFields.role) user.role = updateFields.role`. Any accountant can escalate themselves to `admin`.

## Solution

**Registration:** Add `authenticate` + `allowRoles("admin")` middleware:
```js
router.post("/register", authenticate, allowRoles("admin"), register);
```

**Profile update:** Remove `role` and `department` from the allowed update fields:
```js
// Remove these lines:
// if (updateFields.role) user.role = updateFields.role;
// if (updateFields.department !== undefined) user.department = updateFields.department;
```

If role changes are needed, create a separate admin-only endpoint.
