import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export const billingApi = createApi({
  reducerPath: "billingApi",
  baseQuery: baseQuery,
  tagTypes: ["Bill"],
  endpoints: (builder) => ({
    // Create a new bill
    createBill: builder.mutation({
      query: (billData) => ({
        url: "/api/patient",
        method: "POST",
        body: billData,
      }),
      invalidatesTags: ["Bill"],
    }),

    // Get all bills
    getAllBills: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, status, trash, search } = params;
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(status && { status }),
          ...(trash && { trash: "true" }),
          ...(search && { search }),
        });
        return `/api/patient?${searchParams.toString()}`;
      },
      providesTags: ["Bill"],
    }),

    // Delete Bill
    deleteBill: builder.mutation({
      query: (id) => ({
        url: `/api/patient/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bill"],
    }),

    // Get bill by ID
    getBillById: builder.query({
      query: (id) => `/api/patient/${id}`,
      providesTags: (result, error, id) => [{ type: "Bill", id }],
    }),

    // Update bill
    updateBill: builder.mutation({
      query: ({ id, ...billData }) => ({
        url: `/api/patient/${id}`,
        method: "PUT",
        body: billData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Bill", id },
        "Bill",
      ],
    }),

    // Get bill PDF by ID
    getBillPdf: builder.query({
      query: (id) => `/api/patient/${id}/pdf`,
      providesTags: (result, error, id) => [{ type: "Bill", id }],
    }),
    // Restore Bill
    restoreBill: builder.mutation({
      query: (id) => ({
        url: `/api/patient/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["Bill"],
    }),
  }),
});

export const {
  useCreateBillMutation,
  useGetAllBillsQuery,
  useLazyGetBillPdfQuery,
  useGetBillByIdQuery,
  useUpdateBillMutation,
  useDeleteBillMutation,
  useRestoreBillMutation,
} = billingApi;
