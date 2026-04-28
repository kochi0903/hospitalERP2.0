const Card = ({
  children,
  className = "",
  title,
  subtitle,
  footer,
  headerAction,
}) => {
  return (
    <div className={`card overflow-hidden ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            {title && (
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
