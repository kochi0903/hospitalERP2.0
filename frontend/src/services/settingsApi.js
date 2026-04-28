import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: baseQuery,
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => "/api/settings",
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation({
      query: ({ key, value }) => ({
        url: "/api/settings",
        method: "PUT",
        body: { key, value },
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
