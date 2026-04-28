const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer";

  const variants = {
    primary:
      "bg-teal-600 text-white hover:bg-teal-700 focus-visible:ring-teal-500 shadow-sm shadow-teal-600/20",
    secondary:
      "bg-slate-800 text-white hover:bg-slate-700 focus-visible:ring-slate-600",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400",
  };

  const sizes = {
    xs: "h-7 px-2.5 text-xs gap-1.5",
    sm: "h-9 px-3 text-sm gap-2",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-11 px-6 text-base gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {icon && !isLoading && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
