import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from './baseQuery';

export const expenseApi = createApi({
  reducerPath: "expenseApi",
  baseQuery: baseQuery,
  tagTypes: ["Expense"],
  endpoints: (builder) => ({
    // Create a new expense
    createExpense: builder.mutation({
      query: (expenseData) => ({
        url: "/api/expense",
        method: "POST",
        body: expenseData,
      }),
      invalidatesTags: ["Expense"],
    }),

    // Get all expenses
    getAllExpenses: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, category, trash } = params;
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(category && { category }),
          ...(trash && { trash: "true" }),
        });
        return `/api/expense?${searchParams.toString()}`;
      },
      providesTags: ["Expense"],
    }),

    // Get expense by ID
    getExpenseById: builder.query({
      query: (id) => `/api/expense/${id}`,
      providesTags: (result, error, id) => [{ type: "Expense", id }],
    }),

    // Update expense
    updateExpense: builder.mutation({
      query: ({ id, ...expenseData }) => ({
        url: `/api/expense/${id}`,
        method: "PUT",
        body: expenseData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Expense", id },
        "Expense",
      ],
    }),

    // Delete expense
    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/api/expense/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expense"],
    }),
    // Restore Expense
    restoreExpense: builder.mutation({
      query: (id) => ({
        url: `/api/expense/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["Expense"],
    }),
  }),
});

export const {
  useCreateExpenseMutation,
  useGetAllExpensesQuery,
  useGetExpenseByIdQuery,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useRestoreExpenseMutation,
} = expenseApi;
