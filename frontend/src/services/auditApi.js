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

export const { useGetAuditLogsQuery, useGetEntityLogsQuery } = auditApi;
