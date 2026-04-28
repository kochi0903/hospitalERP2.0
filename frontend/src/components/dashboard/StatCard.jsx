import { ArrowUp, ArrowDown } from "lucide-react";

const StatCard = ({ title, value, icon, change, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-blue-50 text-blue-800">{icon}</div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold text-gray-900 mt-1">{value}</h3>
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center">
          <span
            className={`inline-flex items-center text-sm font-medium ${
              change.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {change.isPositive ? (
              <ArrowUp className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-1" />
            )}
            {Math.abs(change.value)}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
