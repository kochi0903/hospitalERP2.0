import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { lazy } from "react";
import Auth from "../components/layout/Auth.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";
const DoctorRevenueReport = lazy(() => withMinDelay(import("../pages/DoctorRevenueReport.jsx")));
const Home = lazy(() => withMinDelay(import("../pages/Home.jsx")));
const LoginPage = lazy(() => withMinDelay(import("../pages/LoginPage.jsx")));
const DashboardPage = lazy(() =>
  withMinDelay(import("../pages/DashboardPage.jsx"))
);
const BillingPage = lazy(() =>
  withMinDelay(import("../pages/BillingPage.jsx"))
);
const ExpensesPage = lazy(() =>
  withMinDelay(import("../pages/ExpensePage.jsx"))
);
const UsersPage = lazy(() => withMinDelay(import("../pages/UsersPage.jsx")));
const ActivityLogPage = lazy(() => withMinDelay(import("../pages/ActivityLogPage.jsx")));

const withMinDelay = async (importPromise) => {
  return Promise.all([
    importPromise,
    new Promise((resolve) => setTimeout(resolve, 330)),
  ]).then(([module]) => module);
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "",
        element: <Auth />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "doctor-revenue-reports",
            element: <DoctorRevenueReport />,
          },
          {
            path: "expenses",
            element: <ExpensesPage />,
          },
          {
            path: "billing",
            element: <BillingPage />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "activity-log",
            element: <ActivityLogPage />,
          },
        ],
      },
      // {
      //   path: "",
      //   element: <DefaultLayout />,
      //   children: [
      //     {
      //       path: "dashboard",
      //       element: (
      //         <ProtectedRoute>
      //           <DashboardPage />
      //         </ProtectedRoute>
      //       ),
      //     },
      //   ],
      // },
    ],
  },
]);

export default router;
