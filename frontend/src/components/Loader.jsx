const Loader = ({ size = "md", color = "teal", fullScreen = true }) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const colorClasses = {
    teal: "border-teal-500",
    slate: "border-slate-500",
    red: "border-red-500",
    white: "border-white",
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
    />
  );

  if (!fullScreen) return spinner;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        {spinner}
        <span className="text-sm text-slate-400 font-medium">Loading…</span>
      </div>
    </div>
  );
};

export default Loader;
