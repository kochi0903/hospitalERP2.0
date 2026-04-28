import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Search, Filter } from "lucide-react";
import Button from "../components/ui/Button";
import ExportButton from "../components/ui/ExportButton";
import BillingForm from "../components/billing/BillingForm";
import BillTable from "../components/billing/BillingTable";
import DeleteConfirmModal from "../components/ui/DeleteConfirmModal";
import Loader from "../components/Loader";
import {
  useGetAllBillsQuery,
  useDeleteBillMutation,
  useRestoreBillMutation,
} from "../services/billingApi";
import {
  setFormOpen,
  setDeleteModalOpen,
  setSelectedBillId,
  setSelectedBill,
  clearSelectedBill,
  setCurrentPage,
  clearMessages,
  setMessage,
  setError,
} from "../store/billingSlice";
import BillingViewModal from "../components/billing/BillingViewModal";
import Axios from "../utils/Axios";

const BillingPage = () => {
  const dispatch = useDispatch();
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [viewBill, setViewBill] = useState(null);
  const [isTrashView, setIsTrashView] = useState(false);
  const [isPdfLoading, setPdfLoading] = useState(false);
  const { user, token } = useSelector((state) => state.user);
  const {
    filters,
    pagination,
    ui: { isFormOpen, viewMode, isDeleteModalOpen, selectedBillId },
    message,
    error,
  } = useSelector((state) => state.bill);

  const queryOptions = useMemo(
    () => ({
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      status: filters.status,
      ...(filters.searchTerm && {
        search: filters.searchTerm,
      }),
      ...(isTrashView && { trash: true }),
    }),
    [
      pagination.currentPage,
      pagination.itemsPerPage,
      filters.status,
      filters.searchTerm,
      isTrashView,
    ]
  );

  const {
    data: billsData,
    isLoading: isLoadingBills,
    error: billsError,
    refetch: refetchBills,
  } = useGetAllBillsQuery(queryOptions);
  const [deleteBill, { isLoading: isDeleting }] = useDeleteBillMutation();
  const [restoreBill] = useRestoreBillMutation();

  useEffect(() => {
    if (billsError && !isLoadingBills) {
      dispatch(setError("Failed to load bills. Please try again."));
    }
  }, [billsError, isLoadingBills, dispatch]);

  useEffect(() => {
    let timer;
    if (message || error) {
      timer = setTimeout(() => dispatch(clearMessages()), 5000);
    }
    return () => timer && clearTimeout(timer);
  }, [message, error, dispatch]);

  // Handlers
  const handleCreateBill = () => {
    dispatch(clearSelectedBill());
    dispatch(setFormOpen(true));
  };

  const handleEditBill = (bill) => dispatch(setSelectedBill(bill));

  const handleViewBill = (bill) => {
    setViewBill(bill);
    setViewModalOpen(true);
  };

  const handleDeleteBill = (billId) => {
    dispatch(setSelectedBillId(billId));
    dispatch(setDeleteModalOpen(true));
  };

  const handleRestoreBill = async (billId) => {
    try {
      await restoreBill(billId).unwrap();
      dispatch(setMessage("Bill restored successfully"));
      refetchBills();
    } catch (err) {
      dispatch(setError(err?.data?.message || "Failed to restore bill"));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteBill(selectedBillId).unwrap();
      dispatch(setMessage("Bill deleted successfully"));
      dispatch(setDeleteModalOpen(false));
      dispatch(setSelectedBillId(null));
      refetchBills();
    } catch (err) {
      dispatch(setError(err?.data?.message || "Failed to delete bill"));
    }
  };

  const handlePageChange = (page) => {
    if (page !== pagination.currentPage) dispatch(setCurrentPage(page));
  };

  const handleDownloadPdf = async (bill) => {
    setPdfLoading(true);
    try {
      const response = await Axios.get(`/api/patient/${bill._id}/pdf`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `PatientBill-${bill.patientName}-${bill._id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("Failed to download PDF");
      }
    } catch (error) {
      console.error(error);
      dispatch(setError("Failed to download PDF"));
    } finally {
      setPdfLoading(false);
    }
  };

  const canCreateBill = user?.role === "admin" || user?.role === "accountant";
  const canModifyBill = user?.role === "admin" || user?.role === "accountant";
  const isAdmin = user?.role === "admin";

  const isInitialLoading = isLoadingBills && pagination.currentPage === 1 && !billsData;
  if (isInitialLoading) {
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Billing</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {billsData?.pagination?.total || 0} total records
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
                { url: "/api/patient/export/excel", label: "Download as Excel", format: "excel" },
              ]}
              filters={queryOptions}
            />
          )}

          {canCreateBill && (
            <Button
              size="sm"
              icon={<Plus size={15} />}
              onClick={handleCreateBill}
            >
              Create Bill
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
      {isPdfLoading && (
        <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg text-sm font-medium">
          <Loader />
          <span>Generating PDF, please wait...</span>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <BillTable
          bills={billsData?.data || []}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: billsData?.pagination?.pages || 1,
            totalItems: billsData?.pagination?.total || 0,
            itemsPerPage: pagination.itemsPerPage,
          }}
          isLoading={isLoadingBills}
          viewMode={viewMode}
          onEdit={canModifyBill ? handleEditBill : null}
          onDelete={canModifyBill ? handleDeleteBill : null}
          onRestore={handleRestoreBill}
          isTrash={isTrashView}
          onView={handleViewBill}
          onDownloadPdf={handleDownloadPdf}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      {isFormOpen && (
        <BillingForm
          onClose={() => dispatch(setFormOpen(false))}
          onSuccess={() => {
            dispatch(setFormOpen(false));
            dispatch(setMessage("Bill saved successfully"));
            refetchBills();
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
            dispatch(setSelectedBillId(null));
          }}
        />
      )}

      <BillingViewModal
        isOpen={isViewModalOpen}
        bill={viewBill}
        onClose={() => {
          setViewModalOpen(false);
          setViewBill(null);
        }}
      />
    </div>
  );
};

export default BillingPage;
