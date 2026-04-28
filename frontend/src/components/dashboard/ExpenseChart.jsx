import React from "react";
import Card from "../ui/Card";

const ExpenseChart = ({ stats }) => {
  // Process the stats data
  const processedData = stats.map((stat) => ({
    month: new Date(stat.year, stat.month - 1).toLocaleString("default", {
      month: "short",
    }),
    expense: stat.expense,
    income: stat.income,
  }));

  // Extract data for the chart
  const months = processedData.map((data) => data.month);
  const expenses = processedData.map((data) => data.expense);
  const income = processedData.map((data) => data.income);

  const maxValue = Math.max(...expenses, ...income);

  // Round up maxValue to nearest thousand
  const roundedMaxValue = Math.ceil(maxValue / 1000) * 1000;

  return (
    <Card
      title="Monthly Financial Overview"
      subtitle="Last 6 months of expenses vs income"
    >
      <div className="h-64">
        <div className="flex justify-between items-end h-52 border-b border-l border-gray-200 relative pl-8">
          {/* Y-axis labels - Updated with rotation */}
          <div className="absolute -left-2 top-0 h-full flex flex-col justify-between text-xs text-gray-600 font-medium">
            <span className="transform -rotate-90 origin-left translate-y-3 -translate-x-2">
              ₹{roundedMaxValue.toLocaleString()}
            </span>
            <span className="transform -rotate-90 origin-left translate-y-3 -translate-x-2">
              ₹{Math.round(roundedMaxValue * 0.75).toLocaleString()}
            </span>
            <span className="transform -rotate-90 origin-left translate-y-3 -translate-x-2">
              ₹{Math.round(roundedMaxValue * 0.5).toLocaleString()}
            </span>
            <span className="transform -rotate-90 origin-left translate-y-3 -translate-x-2">
              ₹{Math.round(roundedMaxValue * 0.25).toLocaleString()}
            </span>
            <span className="transform -rotate-90 origin-left translate-y-3 -translate-x-2">
              ₹0
            </span>
          </div>

          {months.map((month, index) => (
            <div key={month} className="flex flex-col items-center w-full">
              <div className="flex w-full h-48 items-end justify-center space-x-1">
                {/* Expense bar */}
                <div
                  className="w-6 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${(expenses[index] / maxValue) * 100}%` }}
                  title={`Expenses: ₹${expenses[index].toLocaleString()}`}
                ></div>

                {/* Income bar */}
                <div
                  className="w-6 bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                  style={{ height: `${(income[index] / maxValue) * 100}%` }}
                  title={`Income: ₹${income[index].toLocaleString()}`}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">{month}</div>
            </div>
          ))}
        </div>

        {/* Legend - Moved outside the chart container */}
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
            <span className="text-sm text-gray-600">Expenses</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
            <span className="text-sm text-gray-600">Income</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseChart;
