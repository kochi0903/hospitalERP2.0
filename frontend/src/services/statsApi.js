import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const statsApi = createApi({
  reducerPath: "statsApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getStats: builder.query({
      query: ({ month, year }) => `/api/stats?month=${month}&year=${year}`,
    }),
    getDoctorRevenue: builder.query({
      query: ({ period, month, year, half, startDate, endDate, status = 'paid', page = 1, limit = 50 }) => ({
        url: '/api/stats/doctor-revenue',
        params: {
          startDate,
          endDate,
          status,
          page,
          limit,
        },
      }),
    }),
  }),
});

export const { useGetStatsQuery, useGetDoctorRevenueQuery } = statsApi;