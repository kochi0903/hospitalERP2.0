import { useState, useMemo } from "react";
import { useGetDoctorRevenueQuery } from "../services/statsApi";
import { convertDateString } from "../utils/formatter";
import { Calendar, TrendingUp, FileText, IndianRupee, ChevronLeft, ChevronRight } from "lucide-react";
import ExportButton from "../components/ui/ExportButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
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

const DoctorRevenueReport = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(now);
  const [page, setPage] = useState(1);

  const dateToInputValue = (d) =>
    d ? new Date(d).toISOString().slice(0, 10) : "";

  const startDateStr = useMemo(
    () => convertDateString(startDate),
    [startDate]
  );
  const endDateStr = useMemo(() => convertDateString(endDate), [endDate]);

  const {
    data: revenueData,
    isLoading,
    isFetching,
    refetch,
  } = useGetDoctorRevenueQuery(
    {
      startDate: startDateStr,
      endDate: endDateStr,
      page,
      limit: 20,
    },
    { refetchOnMountOrArgChange: true }
  );

  const doctors = revenueData?.data || [];
  const totalRevenue = doctors.reduce((s, d) => s + (d.totalRevenue || 0), 0);
  const totalBills = doctors.reduce((s, d) => s + (d.billsCount || 0), 0);

  // Chart data — top 10 doctors
  const chartData = doctors.slice(0, 10).map((d) => ({
    name: d.doctorName?.length > 15 ? d.doctorName.substring(0, 15) + "…" : d.doctorName,
    Revenue: d.totalRevenue || 0,
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Revenue Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">Performance analysis by physician</p>
        </div>
        <ExportButton
          label="Export"
          endpoints={[
            { url: "/api/patient/export/excel", label: "Download as Excel", format: "excel" },
          ]}
          filters={{ fromDate: startDateStr, toDate: endDateStr, status: "paid" }}
        />
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Period:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateToInputValue(startDate)}
              onChange={(e) => { setStartDate(new Date(e.target.value)); setPage(1); }}
              className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <span className="text-slate-400 text-sm">to</span>
            <input
              type="date"
              value={dateToInputValue(endDate)}
              onChange={(e) => { setEndDate(new Date(e.target.value)); setPage(1); }}
              className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          {isFetching && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-500 border-t-transparent" />
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card teal p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Revenue</p>
          <h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="stat-card indigo p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Bills</p>
          <h3 className="text-2xl font-bold text-slate-900">{totalBills}</h3>
        </div>
        <div className="stat-card green p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Doctors</p>
          <h3 className="text-2xl font-bold text-slate-900">{doctors.length}</h3>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-bold text-slate-900 mb-1">Doctor-wise Comparison</h2>
          <p className="text-xs text-slate-500 mb-5">Top 10 doctors by revenue</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                <Bar dataKey="Revenue" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Doctor cards grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Detailed Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor, index) => (
            <div key={index} className="card p-5 hover:border-slate-300 transition-all animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{doctor.doctorName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{doctor.billsCount} bill{doctor.billsCount !== 1 ? "s" : ""}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                  <TrendingUp size={14} className="text-teal-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Total Revenue</span>
                  <span className="text-lg font-bold text-slate-900">₹{doctor.totalRevenue?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Average / Bill</span>
                  <span className="text-sm font-semibold text-slate-700">₹{doctor.avgRevenue?.toFixed(0)}</span>
                </div>
                {/* Revenue bar */}
                <div className="mt-2">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${totalRevenue ? Math.min((doctor.totalRevenue / totalRevenue) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {revenueData?.pagination && revenueData.pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-slate-600">
            Page {page} of {revenueData.pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(revenueData.pagination.pages, p + 1))}
            disabled={page >= revenueData.pagination.pages}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorRevenueReport;