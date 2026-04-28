---
created: 2026-04-25T16:28:00+05:30
title: Fix audit API wrong baseUrl — broken in production
area: ui
priority: critical
files:
  - frontend/src/services/auditApi.js:5-13
  - frontend/src/services/baseQuery.js
---

## Problem

`auditApi.js` creates its own `fetchBaseQuery` with `baseUrl: "/api/audit"` instead of using the shared `baseQuery` from `baseQuery.js` which includes `VITE_API_BASE_URL`. In production (frontend deployed to Vercel, backend elsewhere), all audit API calls go to the frontend's origin and fail with 404s.

The Activity Log page is completely broken in production.

## Solution

Refactor `auditApi.js` to use the shared `baseQuery`:

```js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const auditApi = createApi({
  reducerPath: "auditApi",
  baseQuery: baseQuery,
  tagTypes: ["AuditLog"],
  endpoints: (builder) => ({
    getAuditLogs: builder.query({
      query: (params) => ({
        url: "/api/audit",
        params,
      }),
      providesTags: ["AuditLog"],
    }),
    getEntityLogs: builder.query({
      query: ({ entityType, entityId }) => `/api/audit/entity/${entityType}/${entityId}`,
      providesTags: ["AuditLog"],
    }),
  }),
});
```
