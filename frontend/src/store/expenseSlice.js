import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  expenses: [],
  selectedExpense: null,
  filters: {
    category: "",
    searchTerm: "",
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  ui: {
    isFormOpen: false,
    isEditMode: false,
    isDeleteModalOpen: false,
    selectedExpenseId: null,
    viewMode: "table", // "table" | "grid" | "chart"
  },
  message: "",
  error: null,
};

const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {
    // UI State Management
    setFormOpen: (state, action) => {
      state.ui.isFormOpen = action.payload;
      if (!action.payload) {
        state.ui.isEditMode = false;
        state.selectedExpense = null;
      }
    },
    
    setEditMode: (state, action) => {
      state.ui.isEditMode = action.payload;
    },
    
    setDeleteModalOpen: (state, action) => {
      state.ui.isDeleteModalOpen = action.payload;
      if (!action.payload) {
        state.ui.selectedExpenseId = null;
      }
    },
    
    setSelectedExpenseId: (state, action) => {
      state.ui.selectedExpenseId = action.payload;
    },
    
    setViewMode: (state, action) => {
      state.ui.viewMode = action.payload;
    },
    
    // Expense Management
    setSelectedExpense: (state, action) => {
      state.selectedExpense = action.payload;
      if (action.payload) {
        state.ui.isEditMode = true;
        state.ui.isFormOpen = true;
      }
    },
    
    clearSelectedExpense: (state) => {
      state.selectedExpense = null;
      state.ui.isEditMode = false;
    },
    
    // Filters Management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filters change
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
    
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
      state.pagination.currentPage = 1;
    },
    
    // Pagination Management
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1; // Reset to first page
    },
    
    // Statistics Management
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    
    // Message Management
    setMessage: (state, action) => {
      state.message = action.payload;
      state.error = null;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.message = "";
    },
    
    clearMessages: (state) => {
      state.message = "";
      state.error = null;
    },
        
    // Reset State
    resetExpenseState: (state) => {
      return initialState;
    },
  },
});

export const {
  setFormOpen,
  setEditMode,
  setDeleteModalOpen,
  setSelectedExpenseId,
  setViewMode,
  setSelectedExpense,
  clearSelectedExpense,
  setFilters,
  clearFilters,
  setSearchTerm,
  setPagination,
  setCurrentPage,
  setItemsPerPage,
  setStats,
  setMessage,
  setError,
  clearMessages,
  resetExpenseState,
} = expenseSlice.actions;

export default expenseSlice.reducer;