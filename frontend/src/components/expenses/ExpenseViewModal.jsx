import { X, Calendar, Tag, FileText } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

const ExpenseViewModal = ({ isOpen, expense, onClose }) => {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Details</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FaRupeeSign className="w-5 h-5 text-green-600" />
            <span className="font-bold text-lg">{expense.amount ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4" />
            <span>{expense.date ? new Date(expense.date).toLocaleDateString() : "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Tag className="w-4 h-4" />
            <span>{expense.category || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FileText className="w-4 h-4" />
            <span>{expense.remarks || "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="font-medium">Payment Mode:</span>
            <span>{expense.paymentMode || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseViewModal;