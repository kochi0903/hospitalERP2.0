import Card from "../ui/Card";
import { Calendar, DollarSign } from "lucide-react";

const RecentExpenses = ({ expenses }) => {
  return (
    <Card
      title="Recent Expenses"
      headerAction={
        <a
          href="/expenses"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All
        </a>
      }
    >
      <div className="divide-y">
        {expenses.map((expense) => (
          <div key={expense.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 rounded-md text-blue-700">
                  ₹
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {expense.category}
                  </h4>
                  <p className="text-xs text-gray-500">{expense.department}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  ₹{expense.amount.toLocaleString()}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar size={12} className="mr-1" />
                  {new Date(expense.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            {expense.remarks && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                {expense.remarks}
              </p>
            )}
          </div>
        ))}

        {expenses.length === 0 && (
          <div className="py-6 text-center text-gray-500">
            No recent expenses
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentExpenses;
