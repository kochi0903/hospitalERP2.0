---
created: 2026-04-25T16:28:00+05:30
title: Fix auth middleware null user crash
area: api
priority: critical
files:
  - backend/middleware/authMiddleware.js:9-11
---

## Problem

If `User.findById(decoded.id)` returns `null` (e.g., user deleted after token was issued), `req.user` is set to `null`. Every downstream controller accesses `req.user.id` without a null-check, causing an unhandled `TypeError` that crashes the server for that request.

The token has a 7-day expiry, so any user deleted within that window can trigger this.

## Solution

Add a null-check after the `findById` call in `authenticate` middleware:

```js
req.user = await User.findById(decoded.id).select("-passwordHash");
if (!req.user) {
  return res.status(401).json({ error: "User not found" });
}
next();
```
