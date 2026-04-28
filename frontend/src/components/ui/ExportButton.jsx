import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { FileDown, ChevronDown } from "lucide-react";
import Axios from "../../utils/Axios";

const ExportButton = ({ endpoints = [], filters = {}, label = "Export" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { token } = useSelector((state) => state.user);

  const handleExport = async (endpoint, format) => {
    setIsExporting(true);
    setIsOpen(false);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
      const response = await Axios.get(url, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const blob = response.data;
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        const ext = format === "pdf" ? "pdf" : "xlsx";
        a.download = `export-${new Date().toISOString().split("T")[0]}.${ext}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 cursor-pointer"
      >
        {isExporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent" />
        ) : (
          <FileDown size={15} />
        )}
        <span>{label}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 animate-fade-in">
            {endpoints.map((ep, i) => (
              <button
                key={i}
                onClick={() => handleExport(ep.url, ep.format)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <FileDown size={14} className="text-slate-400" />
                {ep.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
