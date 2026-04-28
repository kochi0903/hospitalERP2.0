import React from "react";
import { Bell, Search } from "lucide-react";
import { useSelector } from "react-redux";

const AuthHeader = () => {
  const { user } = useSelector((state) => state.user);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 sm:truncate">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          {/* <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="form-input block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            />
          </div> */}


          {/* Profile dropdown - simplified version */}
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-medium text-gray-700">
                  {user?.name?.charAt(0) || "U"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;
