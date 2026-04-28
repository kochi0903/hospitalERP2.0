---
created: 2026-04-25T16:28:00+05:30
title: Fix Axios interceptor reading token from wrong location
area: ui
priority: high
files:
  - frontend/src/utils/Axios.js:14-25
  - frontend/src/pages/BillingPage.jsx:124
---

## Problem

The Axios interceptor reads `localStorage.getItem("accessToken")`, but the token lives in Redux state (persisted by redux-persist under the `user` key, not as `"accessToken"` in localStorage). The interceptor never attaches a token, making it dead code.

Currently `BillingPage.jsx` manually passes the token from Redux for PDF downloads, working around the broken interceptor.

## Solution

Either:
1. **Fix the interceptor** to read from the redux-persist storage key, or
2. **Remove the interceptor** and always pass the token explicitly from Redux when using Axios (current workaround pattern).

Option 1 is cleaner — import the store and read `store.getState().user.token`:
```js
import { store } from "../store/store";

Axios.interceptors.request.use(async (config) => {
  const token = store.getState().user.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
