import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from './baseQuery';

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/api/user/login",
        method: "POST",
        body: credentials,
      }),
    }),
    updateUser: builder.mutation({
      query: (credentials) => ({
        url: `/api/user/profile/update`,
        method: "POST",
        body: credentials,
      }),
    }),
    changePassword: builder.mutation({
      query: ({ oldPassword, newPassword }) => ({
        url: "/api/user/change-password",
        method: "POST",
        body: { oldPassword, newPassword },
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useUpdateUserMutation,
  useChangePasswordMutation,
} = userApi;
