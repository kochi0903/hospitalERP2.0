# Concerns

> Last mapped: 2026-04-25

## Critical Bugs

### 1. `confirmDelete` undefined — BillingPage & ExpensePage crash on delete

Both `frontend/src/pages/BillingPage.jsx` (line 272) and `frontend/src/pages/ExpensePage.jsx` (line 223) reference `confirmDelete` in the `DeleteConfirmModal` `onConfirm` prop, but this function is never defined. Clicking confirm throws a `ReferenceError` and crashes the page.

**Impact:** Delete functionality is completely broken on both pages.

### 2. Auth middleware doesn't guard against deleted/null users

`backend/middleware/authMiddleware.js` (line 10): If `User.findById(decoded.id)` returns `null` (user deleted after token issued), `req.user` is set to `null`. All downstream controllers access `req.user.id` without null-checking, causing `TypeError` crashes.

**Impact:** Server crashes if a deleted user's token is still valid (7-day window).

### 3. Axios interceptor reads wrong token location

`frontend/src/utils/Axios.js` (line 16): The interceptor reads `localStorage.getItem("accessToken")`, but the token is stored in Redux (persisted under `user.token` key by redux-persist). The token is never written to `localStorage` under `"accessToken"`, so the interceptor never attaches a token.

**Impact:** Any Axios call without manually passing a token header is unauthenticated. Currently only PDF download manually passes the token.

## Security Vulnerabilities

### 4. Registration endpoint is completely unprotected

`backend/routes/userRoutes.js` (line 13): `POST /api/user/register` has no authentication or authorization middleware. Anyone can create accounts with any role, including `admin`.

**Impact:** Full privilege escalation — any anonymous user can create an admin account.

### 5. Profile update allows role escalation

`backend/controllers/userController.js` (lines 126-129): `updateProfile` blocks password changes but allows `role` changes. Any authenticated accountant can change their role to `admin`.

**Impact:** Privilege escalation for any authenticated user.

### 6. JWT secret in environment variable without validation

`backend/index.js` does not validate that `JWT_SECRET` is set before starting the server. If missing, `jwt.sign()` and `jwt.verify()` may behave unpredictably.

## Logic Errors

### 7. Search filter sends AND instead of OR condition

`frontend/src/pages/BillingPage.jsx` (lines 49-52): When searching, both `patientName` and `patientId` are sent as separate query params with the same search term. The backend applies these as AND filters, so a record must match both fields simultaneously — which almost never happens.

**Impact:** Bill search returns no results in most cases.

### 8. Mongoose validators bypassed by `findByIdAndUpdate`

`backend/controllers/billingController.js`: `updateBill` uses `findByIdAndUpdate()`, which bypasses custom validators on `totalAmount` (sum-of-services check) and `dischargeDate` (future-date check) defined in `backend/models/PatientBilling.js`. These validators use `this` which refers to the query object in update context, not the document.

**Impact:** Updated bills can have inconsistent totalAmount or future discharge dates.

### 9. Inconsistent API response shapes for empty results

`backend/controllers/billingController.js` (line 144) and `backend/controllers/expenseController.js`: Empty result sets return `{ message: "No bills found" }` instead of `{ data: [], pagination: {...} }`. The frontend always reads `billsData?.data` and `billsData?.pagination`, getting `undefined`.

**Impact:** UI works (shows "0 records") but is fragile — any code assuming `data` is always an array will break.

### 10. Audit API uses wrong `baseUrl`

`frontend/src/services/auditApi.js` (line 6): Creates its own `fetchBaseQuery` with `baseUrl: "/api/audit"` instead of using the shared `baseQuery` that includes `VITE_API_BASE_URL`. In production (separate frontend/backend hosts), all audit API calls fail.

**Impact:** Activity log page broken in production deployment.

## Technical Debt

### 11. Installed but unused dependencies

- `cloudinary` v2.6.1 — no configuration or usage found
- `redis` v5.1.0 — no connection or usage found
- `datauri` v4.1.0 — no usage found
- `express-validator` v7.2.1 — installed but manual validation used instead
- `react-icons` v5.2.1 — redundant with `lucide-react`
- `react-scroll` v1.9.0 — no apparent usage in current pages
- `react-multi-carousel` v2.8.6 — no apparent usage in main pages
- `react-type-animation` v3.2.0 — only in home page

### 12. Duplicate body parsers

`backend/index.js` (lines 30-31): Both `bodyParser.json()` and `express.json()` are registered. They do the same thing — request body is parsed twice.

### 13. Rate limiter comments don't match values

`backend/index.js` (lines 22-26): Comments say "15 minutes" and "100 requests" but actual values are 5 minutes and 200 requests.

### 14. Dead code — `department_head` role check

`frontend/src/pages/SettingsPage.jsx` (line 164): Checks for `user?.role === "department_head"` but the User model enum only allows `["admin", "accountant", "doctor"]`. This code path is unreachable.

### 15. Phantom model fields and indexes

- `backend/models/Expense.js` (line 88): Index on `department` field that doesn't exist in schema
- `backend/models/User.js` (line 45): Virtual references `this.department` but schema has no `department` field
- `backend/models/User.js` (line 63): Index on `department` field that doesn't exist

### 16. `UsersPage` is a non-functional stub

`frontend/src/pages/UsersPage.jsx`: Uses local state with mock data (`setUsers([])`), `window.confirm` for deletes, `alert` for password reset. Not connected to any API.

### 17. No centralized error handling

Backend has no error handling middleware. Each controller has its own try/catch. Mongoose validation errors, CastErrors (invalid ObjectId), and other common errors are not handled consistently.

### 18. Hardcoded `Content-Type: application/json` in base query

`frontend/src/services/baseQuery.js` (line 11): Always sets `Content-Type: application/json`. This will break any future file upload endpoints through RTK Query.

## Performance Concerns

### 19. No pagination on income endpoint

`backend/controllers/incomeController.js` (line 5): `Income.find()` returns all records without pagination. Will degrade as data grows.

### 20. `exportToExcel` loads all records into memory

`backend/utils/excelGenerator.js` and the export controllers load entire datasets into memory before streaming. For large datasets, this could cause memory pressure.

### 21. No database connection retry logic

`backend/utils/db.js`: Single `mongoose.connect()` call with no retry logic. If the initial connection fails, the server runs without a database connection, and all requests will fail silently.

## Fragile Areas

### 22. Soft delete pre-find hooks can be bypassed

The pre-find hooks on `PatientBill`, `Expense`, and `Income` only apply to `find` and `findOne`. Direct use of `findById`, `aggregate`, or `countDocuments` may return deleted records if not filtered manually.

### 23. `exportBillsExcel` logs audit after response is sent

`backend/controllers/billingController.js`: `exportToExcel` calls `res.end()` internally. The `logActivity()` call after it is fire-and-forget but the ordering is fragile — any error in logging that tries to touch `res` would crash.

### 24. No CSRF protection

Despite using cookies (`cookie-parser` installed, `credentials: true` in CORS), there's no CSRF token validation. The JWT-in-header approach mitigates this somewhat, but the cookie infrastructure suggests CSRF was considered and not implemented.
