import { Outlet, Navigate } from "react-router-dom";
import SideNav from "./SideNav";
import { useSelector } from "react-redux";

const Auth = () => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.user);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      <SideNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Auth;
