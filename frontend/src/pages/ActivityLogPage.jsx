import React, { useState } from "react";
import { useGetAuditLogsQuery } from "../services/auditApi";
import { Filter, Eye, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import LogDetailsModal from "../components/admin/LogDetailsModal";
import Loader from "../components/Loader";

const ActivityLogPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    startDate: "",
    endDate: "",
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useGetAuditLogsQuery({
    page,
    limit,
    ...filters,
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  if (isLoading)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader />
      </div>
    );

  const logs = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const actionColors = {
    CREATE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    UPDATE: "bg-sky-50 text-sky-700 border border-sky-200",
    DELETE: "bg-red-50 text-red-700 border border-red-200",
    RESTORE: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    LOGIN: "bg-amber-50 text-amber-700 border border-amber-200",
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activity Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination.total} audit entries · Tracking all critical actions
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all cursor-pointer"
          title="Refresh Logs"
        >
          <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter size={10} /> Action
          </label>
          <select
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
            className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="RESTORE">Restore</option>
            <option value="LOGIN">Login</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entity Type</label>
          <select
            name="entityType"
            value={filters.entityType}
            onChange={handleFilterChange}
            className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm"
          >
            <option value="">All Entities</option>
            <option value="PatientBill">Billing</option>
            <option value="Expense">Expense</option>
            <option value="User">User</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Description</th>
                <th>Timestamp</th>
                <th className="text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                          {log.performedBy?.name?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{log.performedBy?.name || "System"}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{log.performedBy?.role || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        actionColors[log.action] || "bg-slate-100 text-slate-700"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm text-slate-800">{log.entityType}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{log.entityId?.slice(-6) || "—"}</p>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-slate-600 truncate max-w-xs">{log.details}</p>
                    </td>
                    <td>
                      <span className="text-sm text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleViewDetails(log)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No activity logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing <span className="font-semibold">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-semibold">{Math.min(page * limit, pagination.total)}</span> of{" "}
              <span className="font-semibold">{pagination.total}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-medium text-slate-600 px-2">
                {page} / {pagination.pages}
              </span>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <LogDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        log={selectedLog}
      />
    </div>
  );
};

export default ActivityLogPage;
