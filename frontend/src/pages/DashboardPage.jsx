import { useGetStatsQuery } from "../services/statsApi";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Receipt,
  FileText,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const KPICard = ({ title, value, icon, accent = "teal", subtitle }) => {
  const accentColors = {
    teal: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" },
    slate: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100" },
  };
  const c = accentColors[accent];

  return (
    <div className={`stat-card ${accent} p-5 animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center shrink-0`}>
          <span className={c.text}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-semibold text-slate-800">₹{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const DashboardPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useGetStatsQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  const currentMonthData = data?.currentMonth || {
    expenses: 0,
    paid: 0,
    due: 0,
    paidBillsCount: 0,
    dueBillsCount: 0,
  };

  const dashboard = data
    ? {
        totalExpenses: currentMonthData.expenses || 0,
        totalIncome: currentMonthData.paid || 0,
        monthlyStats: data.monthlyStats || [],
        profit: currentMonthData.paid - currentMonthData.expenses,
        unpaidAmount: currentMonthData.due || 0,
        paidBillsCount: currentMonthData.paidBillsCount || 0,
        dueBillsCount: currentMonthData.dueBillsCount || 0,
      }
    : {
        totalExpenses: 0,
        totalIncome: 0,
        monthlyStats: [],
        profit: 0,
        unpaidAmount: 0,
        paidBillsCount: 0,
        dueBillsCount: 0,
      };

  const chartData = (dashboard.monthlyStats || []).map((stat) => ({
    month: new Date(stat.year, stat.month - 1).toLocaleString("default", {
      month: "short",
    }),
    Income: stat.income || 0,
    Expenses: stat.expense || 0,
  }));

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Financial overview for your nursing home</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5">
          <Calendar size={14} className="text-slate-400 ml-2" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="text-sm font-medium text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer pr-1"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-sm font-medium text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer pr-1"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="Monthly Income"
          value={`₹${dashboard.totalIncome.toLocaleString()}`}
          icon={<TrendingUp size={18} />}
          accent="green"
          subtitle={`${dashboard.paidBillsCount} paid bills`}
        />
        <KPICard
          title="Monthly Expenses"
          value={`₹${dashboard.totalExpenses.toLocaleString()}`}
          icon={<Receipt size={18} />}
          accent="red"
        />
        <KPICard
          title={dashboard.profit >= 0 ? "Net Profit" : "Net Loss"}
          value={`₹${Math.abs(dashboard.profit).toLocaleString()}`}
          icon={dashboard.profit >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          accent={dashboard.profit >= 0 ? "teal" : "red"}
        />
        <KPICard
          title="Unpaid Amount"
          value={`₹${dashboard.unpaidAmount.toLocaleString()}`}
          icon={<AlertCircle size={18} />}
          accent="amber"
          subtitle={`${dashboard.dueBillsCount} pending bills`}
        />
        <KPICard
          title="Paid Bills"
          value={dashboard.paidBillsCount}
          icon={<FileText size={18} />}
          accent="indigo"
          subtitle="This month"
        />
        <KPICard
          title="Due Bills"
          value={dashboard.dueBillsCount}
          icon={<FileText size={18} />}
          accent="slate"
          subtitle="Pending collection"
        />
      </div>

      {/* Chart */}
      <div className="card p-6">
        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900">Monthly Financial Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">Income vs Expenses — last 6 months</p>
        </div>
        <div className="h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: 16, fontSize: 13 }}
                />
                <Bar dataKey="Income" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              No data available for this period
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
