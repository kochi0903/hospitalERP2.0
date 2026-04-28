import React from "react";
import { X } from "lucide-react";
import Button from "../ui/Button";

const LogDetailsModal = ({ isOpen, onClose, log }) => {
  if (!isOpen || !log) return null;

  const renderChanges = (changes) => {
    if (!changes || !changes.before || !changes.after) return <p className="text-gray-500 italic">No detailed changes recorded.</p>;

    const fields = Object.keys(changes.after);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Before</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">After</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fields.map((field) => (
              <tr key={field} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm font-medium text-gray-900">{field}</td>
                <td className="px-4 py-2 text-sm text-red-600 line-through">
                  {typeof changes.before[field] === "object" 
                    ? JSON.stringify(changes.before[field]) 
                    : String(changes.before[field])}
                </td>
                <td className="px-4 py-2 text-sm text-green-600 font-medium">
                  {typeof changes.after[field] === "object" 
                    ? JSON.stringify(changes.after[field]) 
                    : String(changes.after[field])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Activity Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Action</p>
              <p className="text-sm font-medium">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                  log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                  log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {log.action}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Timestamp</p>
              <p className="text-sm">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Entity</p>
              <p className="text-sm font-medium">{log.entityType} ({log.entityId})</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">IP Address</p>
              <p className="text-sm">{log.ipAddress}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Details</p>
            <p className="text-sm text-gray-700 italic">"{log.details || 'No description provided.'}"</p>
          </div>

          {/* Diffs */}
          {log.action === 'UPDATE' && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Field Changes</p>
              {renderChanges(log.changes)}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <Button onClick={onClose} variant="secondary">Close</Button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailsModal;
