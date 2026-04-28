import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bills: [],
  selectedBill: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  filters: {
    status: "",
    searchTerm: "",
  },
  ui: {
    isFormOpen: false,
    isEditMode: false,
    isDeleteModalOpen: false,
    selectedBillId: null,
    viewMode: "table", // "table" | "grid" | "chart"
  },
  message: "",
  error: null,
};

const billSlice = createSlice({
  name: "bill",
  initialState,
  reducers: {
    // UI State Management
    setFormOpen: (state, action) => {
      state.ui.isFormOpen = action.payload;
      if (!action.payload) {
        state.ui.isEditMode = false;
        state.selectedBill = null;
      }
    },

    setEditMode: (state, action) => {
      state.ui.isEditMode = action.payload;
    },

    setDeleteModalOpen: (state, action) => {
      state.ui.isDeleteModalOpen = action.payload;
      if (!action.payload) {
        state.ui.selectedBillId = null;
      }
    },

    setSelectedBillId: (state, action) => {
      state.ui.selectedBillId = action.payload;
    },

    setViewMode: (state, action) => {
      state.ui.viewMode = action.payload;
    },

    // Bill Management
    setSelectedBill: (state, action) => {
      state.selectedBill = action.payload;
      if (action.payload) {
        state.ui.isEditMode = true;
        state.ui.isFormOpen = true;
      }
    },

    clearSelectedBill: (state) => {
      state.selectedBill = null;
      state.ui.isEditMode = false;
    },    // Filters Management
    setFilters: (state, action) => {
      // Only reset page if search or status changes, not for page-related updates
      const shouldResetPage = 
        action.payload.searchTerm !== state.filters.searchTerm ||
        action.payload.status !== state.filters.status;
      
      state.filters = { ...state.filters, ...action.payload };
      
      if (shouldResetPage) {
        state.pagination.currentPage = 1;
      }
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
    resetBillState: (state) => {
      return initialState;
    },
  },
});

export const {
  setFormOpen,
  setEditMode,
  setDeleteModalOpen,
  setSelectedBillId,
  setViewMode,
  setSelectedBill,
  clearSelectedBill,
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
  resetBillState,
} = billSlice.actions;

export default billSlice.reducer;
