# Structure

> Last mapped: 2026-04-25

## Directory Layout

```
hospital-erp/
├── backend/
│   ├── index.js                    # Express app entry point, middleware setup, route mounting
│   ├── package.json                # Backend dependencies
│   ├── seedUsers.js                # Database seeder for admin/accountant accounts
│   ├── .env                        # Environment variables (gitignored)
│   ├── controllers/
│   │   ├── auditController.js      # Audit log retrieval with filters
│   │   ├── billingController.js    # Patient billing CRUD, PDF, Excel, revenue reports
│   │   ├── expenseController.js    # Expense CRUD, PDF, Excel
│   │   ├── incomeController.js     # Income retrieval and summary aggregation
│   │   ├── statsController.js      # Financial stats and doctor revenue aggregation
│   │   └── userController.js       # Auth (register/login), profile, password management
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT authenticate + role-based allowRoles
│   │   └── checkEditLock.js        # Prevent edits on old records (non-admin)
│   ├── models/
│   │   ├── AuditLog.js             # Audit trail schema
│   │   ├── Expense.js              # Expense schema with soft delete
│   │   ├── Income.js               # Income schema with soft delete
│   │   ├── PatientBilling.js       # Patient bill schema with services sub-schema
│   │   └── User.js                 # User schema with role enum
│   ├── routes/
│   │   ├── auditRoutes.js          # /api/audit — admin only
│   │   ├── billingRoutes.js        # /api/patient — billing operations
│   │   ├── expenseRoutes.js        # /api/expense — expense operations
│   │   ├── incomeRoutes.js         # /api/income — income queries
│   │   ├── statsRoutes.js          # /api/stats — dashboard statistics
│   │   └── userRoutes.js           # /api/user — auth and user management
│   └── utils/
│       ├── auditLogger.js          # logActivity() and calculateDelta()
│       ├── db.js                   # MongoDB connection
│       └── excelGenerator.js       # exportToExcel() utility
│
├── frontend/
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   └── src/
│       ├── main.jsx                # React root — Provider, PersistGate, Suspense, Router
│       ├── App.jsx                 # Root layout — Outlet + Toaster
│       ├── index.css               # Global styles
│       ├── route/
│       │   └── index.jsx           # Route definitions with lazy loading
│       ├── services/               # RTK Query API definitions
│       │   ├── baseQuery.js        # Shared fetchBaseQuery with auth headers
│       │   ├── billingApi.js       # Billing CRUD endpoints
│       │   ├── expenseApi.js       # Expense CRUD endpoints
│       │   ├── userApi.js          # Login, profile, password endpoints
│       │   ├── statsApi.js         # Dashboard stats and doctor revenue
│       │   └── auditApi.js         # Audit log endpoints
│       ├── store/                  # Redux store and slices
│       │   ├── store.js            # configureStore with persist + RTK Query middleware
│       │   ├── billingSlice.js     # Bill UI state (filters, pagination, modals)
│       │   ├── expenseSlice.js     # Expense UI state (filters, pagination, modals)
│       │   └── userSlice.js        # Auth state (token, user, isAuthenticated)
│       ├── pages/                  # Page-level components
│       │   ├── LoginPage.jsx       # Login form with redirect
│       │   ├── DashboardPage.jsx   # KPI cards + bar chart
│       │   ├── BillingPage.jsx     # Bill list, CRUD, PDF, export
│       │   ├── ExpensePage.jsx     # Expense list, CRUD, export
│       │   ├── DoctorRevenueReport.jsx  # Doctor-wise revenue with chart
│       │   ├── ActivityLogPage.jsx # Audit log viewer (admin)
│       │   ├── SettingsPage.jsx    # Profile + password settings
│       │   ├── UsersPage.jsx       # User management (stub/placeholder)
│       │   └── Home.jsx            # Landing/home page
│       ├── components/
│       │   ├── Loader.jsx          # Spinner component
│       │   ├── ShinyEffect.jsx     # Visual effect component
│       │   ├── admin/              # Admin-specific components (LogDetailsModal)
│       │   ├── billing/            # BillingForm, BillingTable, BillingViewModal
│       │   ├── dashboard/          # Dashboard sub-components
│       │   ├── expenses/           # ExpenseForm, ExpenseTable, ExpenseViewModal
│       │   ├── home/               # Home page components
│       │   ├── layout/             # Auth guard, SideNav, Navbar, Footer, AuthHeader
│       │   ├── ui/                 # Reusable: Button, Card, Input, DeleteConfirmModal, ExportButton, etc.
│       │   └── users/              # UserForm, UserTable, PasswordInput
│       └── utils/
│           ├── Axios.js            # Axios instance with interceptor (broken — see CONCERNS.md)
│           ├── AxiosToast.js       # Toast helper for Axios responses
│           ├── customHook.js       # useDebounce hook
│           └── formatter.js        # Date and currency formatting utilities
```

## Key Locations

| Purpose | Path |
|---------|------|
| Backend entry | `backend/index.js` |
| Frontend entry | `frontend/src/main.jsx` |
| Route definitions | `frontend/src/route/index.jsx` |
| Auth guard | `frontend/src/components/layout/Auth.jsx` |
| Redux store | `frontend/src/store/store.js` |
| API base query | `frontend/src/services/baseQuery.js` |
| DB connection | `backend/utils/db.js` |
| DB seeder | `backend/seedUsers.js` |

## Naming Conventions

- **Backend files:** camelCase (`billingController.js`, `authMiddleware.js`)
- **Backend models:** PascalCase (`PatientBilling.js`, `AuditLog.js`)
- **Frontend pages:** PascalCase (`BillingPage.jsx`, `DashboardPage.jsx`)
- **Frontend components:** PascalCase (`BillingForm.jsx`, `DeleteConfirmModal.jsx`)
- **Frontend services/store:** camelCase (`billingApi.js`, `billingSlice.js`)
- **Frontend utils:** camelCase (`formatter.js`, `customHook.js`)
- **Routes:** lowercase with hyphens in URLs (`/api/patient`, `/api/user/change-password`)
