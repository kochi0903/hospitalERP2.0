import { useState } from "react";
import { Navigate } from "react-router-dom";
import { FilePieChart, Mail, Lock, ArrowRight } from "lucide-react";
import Input from "../components/ui/Input";
import { useDispatch, useSelector } from "react-redux";
import { useLoginUserMutation } from "../services/userApi";
import { resetMessages } from "../store/userSlice";
import toast from "react-hot-toast";

const LoginPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, message } = useSelector(
    (state) => state.user,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginUser] = useLoginUserMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await loginUser({ email, password }).unwrap();
      toast.success("Login successful!");
      dispatch(resetMessages());
    } catch (err) {
      setError(err?.data?.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1a1d23] relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <FilePieChart size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              MediCost
            </span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Nursing Home
            <br />
            Finance Manager
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Streamlined billing, expense tracking, and revenue insights — built
            for healthcare administrators who value clarity.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-6 text-slate-500 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
              Secure Access
            </span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
              Role-based
            </span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
              Audit Trail
            </span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <FilePieChart size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              MediCost
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Welcome back
          </h2>
          <p className="text-slate-500 mb-8">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 p-3.5 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
              {message}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email address
              </label>
              <div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={16} className="text-slate-400" />}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={16} className="text-slate-400" />}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-teal-600/20 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Secure login · Role-based access · Activity logged
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
