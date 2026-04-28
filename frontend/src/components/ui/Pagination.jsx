import { ChevronLeft, ChevronRight } from "lucide-react";

export const Pagination = ({ onPageChange, pagination }) => {
  if (!pagination || !pagination.totalItems) return null;

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-slate-700">
          {Math.min(
            pagination.currentPage * pagination.itemsPerPage,
            pagination.totalItems
          )}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-700">{pagination.totalItems}</span> results
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-medium text-slate-600 px-2">
          {pagination.currentPage} / {pagination.totalPages}
        </span>
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
