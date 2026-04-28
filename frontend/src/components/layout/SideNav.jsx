import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  FilePieChart,
  LogOut,
  Menu,
  X,
  Banknote,
  Settings,
  ShieldCheck,
  Users,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logout } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";

const NavItem = ({ to, icon, label, active, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-teal-500/12 text-teal-400"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      }`}
    >
      <span
        className={`${active ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}
      >
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {active && <ChevronRight size={14} className="text-teal-500/60" />}
    </Link>
  );
};

const NavSection = ({ title, children }) => (
  <div className="mb-2">
    <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
      {title}
    </p>
    <div className="space-y-0.5">{children}</div>
  </div>
);

const SideNav = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;
  const toggleNav = () => setExpanded(!expanded);
  const closeNav = () => setExpanded(false);

  const logoutHandler = () => {
    dispatch(logout());
    setExpanded(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleNav}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white shadow-lg"
        aria-label="Toggle navigation"
      >
        {expanded ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {expanded && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={toggleNav}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 h-screen
          bg-[#1a1d23] border-r border-white/5
          transition-all duration-300 z-40 lg:z-auto
          ${expanded ? "left-0" : "-left-64 lg:left-0"}
          w-64 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <FilePieChart size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                MediCost
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                Finance Manager
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-4">
          <NavSection title="Overview">
            <NavItem
              to="/dashboard"
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
              active={isActive("/dashboard")}
              onClick={closeNav}
            />
          </NavSection>

          <NavSection title="Finance">
            <NavItem
              to="/billing"
              icon={<Banknote size={18} />}
              label="Patient Billing"
              active={isActive("/billing")}
              onClick={closeNav}
            />
            <NavItem
              to="/expenses"
              icon={<Receipt size={18} />}
              label="Expenses"
              active={isActive("/expenses")}
              onClick={closeNav}
            />
            <NavItem
              to="/doctor-revenue-reports"
              icon={<TrendingUp size={18} />}
              label="Revenue Report"
              active={isActive("/doctor-revenue-reports")}
              onClick={closeNav}
            />
          </NavSection>

          {isAdmin && (
            <NavSection title="Administration">
              {/* <NavItem
                to="/users"
                icon={<Users size={18} />}
                label="User Management"
                active={isActive("/users")}
                onClick={closeNav}
              /> */}
              <NavItem
                to="/activity-log"
                icon={<ShieldCheck size={18} />}
                label="Activity Log"
                active={isActive("/activity-log")}
                onClick={closeNav}
              />
            </NavSection>
          )}

          <NavSection title="System">
            <NavItem
              to="/settings"
              icon={<Settings size={18} />}
              label="Settings"
              active={isActive("/settings")}
              onClick={closeNav}
            />
          </NavSection>
        </nav>

        {/* User info + Logout */}
        <div className="border-t border-white/5 p-4">
          {user && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-sm font-bold text-teal-400 shrink-0">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {user.name}
                </p>
                <span
                  className={`inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isAdmin
                      ? "bg-teal-500/15 text-teal-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={logoutHandler}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-red-400 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideNav;
