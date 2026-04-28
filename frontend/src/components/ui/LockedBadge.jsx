import { Lock, Info } from "lucide-react";
import { useState } from "react";

/**
 * LockedBadge — shows a lock indicator for records past the edit window.
 * Informative, not punishing — warm amber styling with a helpful tooltip.
 */
export const LockedBadge = ({ reason = "This record is past the edit window" }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex">
      <span
        className="badge-locked inline-flex items-center gap-1 cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Lock size={11} />
        <span>Locked</span>
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 animate-fade-in">
          <div className="flex items-center gap-1.5">
            <Info size={12} className="text-amber-400 shrink-0" />
            <span>{reason}</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
};

/**
 * EditGuard — wraps edit/delete buttons. If the record is locked and the
 * user is an accountant, it disables the actions and shows a tooltip.
 */
export const EditGuard = ({
  children,
  record,
  user,
  lockDays = import.meta.env.VITE_EDIT_LOCK_DAYS || 1,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!record || !user) return children;

  const createdAt = new Date(record.createdAt || record.date);
  const now = new Date();
  const diffHours = (now - createdAt) / (1000 * 60 * 60);
  const isLocked = diffHours > lockDays * 24;
  const isAccountant = user.role === "accountant";

  if (!isLocked || !isAccountant) return children;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="opacity-40 pointer-events-none select-none">{children}</div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50 animate-fade-in">
          <div className="flex items-center gap-1.5">
            <Lock size={12} className="text-amber-400 shrink-0" />
            <span>Record is locked — only admins can modify after {lockDays} day(s)</span>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
};
