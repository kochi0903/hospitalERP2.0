import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              block w-full rounded-lg border border-slate-300 text-sm
              focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500
              placeholder:text-slate-400 transition-all duration-200
              ${icon ? "pl-20" : "px-3"} py-2
              ${
                error
                  ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : ""
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
