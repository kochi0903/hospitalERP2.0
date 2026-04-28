import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus } from "lucide-react";
import Button from "../components/ui/Button";
import ExportButton from "../components/ui/ExportButton";
import Axios from "../utils/Axios";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseTable from "../components/expenses/ExpenseTable";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import Loader from "../components/Loader";
import {
  useGetAllExpensesQuery,
  useDeleteExpenseMutation,
  useRestoreExpenseMutation,
} from "../services/expenseApi";
import {
  setFormOpen,
  setDeleteModalOpen,
  setSelectedExpenseId,
  setSelectedExpense,
  clearSelectedExpense,
  setCurrentPage,
  clearMessages,
  setMessage,
  setError,
} from "../store/expenseSlice";
import ExpenseViewModal from "../components/expenses/ExpenseViewModal";

const ExpensePage = () => {
  const dispatch = useDispatch();
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);
  const [viewExpense, setViewExpense] = useState(null);
  const { user, token } = useSelector((state) => state.user);
  const {
    filters,
    pagination,
    ui: { isFormOpen, viewMode, isDeleteModalOpen, selectedExpenseId },
    message,
    error,
  } = useSelector((state) => state.expense);

  const queryOptions = {
    page: pagination.currentPage,
    limit: pagination.itemsPerPage,
    ...filters,
    ...(isTrashView && { trash: true }),
  };

  // API Queries
  const {
    data: expensesData,
    isLoading: isLoadingExpenses,
    error: expensesError,
    refetch: refetchExpenses,
  } = useGetAllExpensesQuery(queryOptions);

  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();
  const [restoreExpense] = useRestoreExpenseMutation();

  useEffect(() => {
    if (expensesError) {
      dispatch(setError("Failed to load expenses. Please try again."));
    }
  }, [expensesError, dispatch]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => dispatch(clearMessages()), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error, dispatch]);

  // Handlers
  const handleCreateExpense = () => {
    dispatch(clearSelectedExpense());
    dispatch(setFormOpen(true));
  };

  const handleEditExpense = (expense) => dispatch(setSelectedExpense(expense));

  const handleViewExpense = (expense) => {
    setViewExpense(expense);
    setViewModalOpen(true);
  };

  const handleDeleteExpense = (expenseId) => {
    dispatch(setSelectedExpenseId(expenseId));
    dispatch(setDeleteModalOpen(true));
  };

  const handleRestoreExpense = async (expenseId) => {
    try {
      await restoreExpense(expenseId).unwrap();
      dispatch(setMessage("Expense restored successfully"));
      refetchExpenses();
    } catch (err) {
      dispatch(setError(err?.data?.message || "Failed to restore expense"));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteExpense(selectedExpenseId).unwrap();
      dispatch(setMessage("Expense deleted successfully"));
      dispatch(setDeleteModalOpen(false));
      dispatch(setSelectedExpenseId(null));
      refetchExpenses();
    } catch (err) {
      dispatch(setError(err?.data?.message || "Failed to delete expense"));
    }
  };

  const handlePageChange = (page) => dispatch(setCurrentPage(page));

  // Permission checks
  const canCreateExpense = user?.role === "admin" || user?.role === "accountant";
  const canModifyExpense = user?.role === "admin" || user?.role === "accountant";
  const isAdmin = user?.role === "admin";

  if (isLoadingExpenses && pagination.currentPage === 1) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expense Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {expensesData?.pagination?.total || 0} total records
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Active/Trash toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex">
            <button
              onClick={() => setIsTrashView(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                !isTrashView
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setIsTrashView(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                isTrashView
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Trash
            </button>
          </div>

          {isAdmin && (
            <ExportButton
              label="Export"
              endpoints={[
                { url: "/api/expense/export/excel", label: "Download as Excel", format: "excel" },
              ]}
              filters={queryOptions}
            />
          )}

          {canCreateExpense && (
            <Button
              size="sm"
              icon={<Plus size={15} />}
              onClick={handleCreateExpense}
            >
              Add Expense
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <ExpenseTable
          expenses={expensesData?.data || []}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: expensesData?.pagination?.pages || 1,
            totalItems: expensesData?.pagination?.total || 0,
            itemsPerPage: pagination.itemsPerPage,
          }}
          isLoading={isLoadingExpenses}
          viewMode={viewMode}
          onEdit={canModifyExpense ? handleEditExpense : null}
          onDelete={canModifyExpense ? handleDeleteExpense : null}
          onRestore={handleRestoreExpense}
          isTrash={isTrashView}
          onView={handleViewExpense}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      {isFormOpen && (
        <ExpenseForm
          onClose={() => dispatch(setFormOpen(false))}
          onSuccess={() => {
            dispatch(setFormOpen(false));
            dispatch(setMessage("Expense saved successfully"));
            refetchExpenses();
          }}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmModal
          isOpen={!!isDeleteModalOpen}
          isLoading={!!isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => {
            dispatch(setDeleteModalOpen(false));
            dispatch(setSelectedExpenseId(null));
          }}
        />
      )}

      <ExpenseViewModal
        isOpen={isViewModalOpen}
        expense={viewExpense}
        onClose={() => {
          setViewModalOpen(false);
          setViewExpense(null);
        }}
      />
    </div>
  );
};

export default ExpensePage;
