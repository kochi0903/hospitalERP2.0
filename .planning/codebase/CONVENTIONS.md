# Conventions

> Last mapped: 2026-04-25

## Code Style

- **Module system:** ES Modules throughout (`import/export`)
- **Quotes:** Double quotes in backend, mixed in frontend (mostly double)
- **Semicolons:** Yes (consistent)
- **Indentation:** 2 spaces
- **Trailing commas:** Yes (in arrays, objects, function params)
- **Linting:** ESLint configured for frontend only (`eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)
- **No Prettier** — no code formatter configured

## Backend Patterns

### Controller Pattern

Controllers follow a consistent structure:
```javascript
export const actionName = async (req, res) => {
  try {
    // 1. Extract params/body
    // 2. Validate (manual, not express-validator)
    // 3. Database operation
    // 4. Audit log
    // 5. Return JSON response
  } catch (error) {
    console.error("Context:", error.message);
    res.status(500).json({ error: "User-friendly message" });
  }
};
```

### Response Format

Successful responses vary by endpoint:
- **Single item:** `{ bill: {...} }` or `{ expense: {...} }`
- **List:** `{ data: [...], pagination: { page, pages, total, limit } }`
- **Messages:** `{ message: "Success text" }`
- **Inconsistency:** Empty lists return `{ message: "No items found" }` instead of `{ data: [], pagination: {...} }`

### Validation Pattern

- **Manual validation** in controllers (not using `express-validator` despite it being installed)
- Validation errors returned as `{ errors: { field: "message" } }`
- Mongoose schema validation used as secondary layer

### Error Handling

- All controllers use `try/catch` with `500` status on unexpected errors
- Console.error for server-side logging
- User-facing errors use generic messages
- No centralized error handling middleware

### Audit Logging

- `logActivity()` called after successful mutations (create, update, delete, restore)
- `calculateDelta()` used for update operations to track field changes
- IP address captured from `req.ip`
- Audit logging errors are caught silently (fire-and-forget)

## Frontend Patterns

### Component Pattern

- **Functional components** exclusively (no class components)
- **Hooks:** `useState`, `useEffect`, `useMemo`, `useSelector`, `useDispatch`
- **No custom hooks** except `useDebounce` in `utils/customHook.js`

### State Management Pattern

- **Server state:** RTK Query with tag-based cache invalidation
- **UI state:** Redux slices for filters, pagination, modal visibility
- **Local state:** `useState` for component-level concerns (view modals, loading flags)
- **Persistence:** Only `user` slice persisted (token, auth state)

### Page Component Pattern

Pages follow a consistent structure:
1. Dispatch + selector hooks
2. RTK Query hooks
3. useEffect for error handling / message auto-clear
4. Handler functions
5. Permission checks
6. Loading state render
7. Main JSX return

### Styling

- **Tailwind CSS** exclusively — no CSS modules, styled-components, or CSS-in-JS
- **No custom Tailwind theme** — using default config with no extensions
- **Common utility classes:** `card`, `stat-card`, `data-table`, `animate-fade-in` (custom CSS classes in `index.css`)
- **Responsive:** `sm:`, `md:`, `lg:`, `xl:` breakpoint prefixes used throughout

### Routing

- **React Router v7** with `createBrowserRouter`
- **Lazy loading** with `React.lazy()` + custom `withMinDelay(330ms)` wrapper
- **Auth guard:** `Auth` component wraps protected routes, checks `isAuthenticated` from Redux
- **No role-based route guards** on frontend — pages are accessible to any authenticated user

### API Communication Pattern

Two parallel patterns exist:
1. **RTK Query** (`services/*.js`) — primary pattern for most CRUD operations
2. **Axios** (`utils/Axios.js`) — secondary pattern for blob downloads (PDFs)

RTK Query uses:
- Shared `baseQuery` from `services/baseQuery.js` (except `auditApi` which defines its own)
- Tag-based invalidation (`["Bill"]`, `["Expense"]`, `["AuditLog"]`)
- `providesTags` on queries, `invalidatesTags` on mutations

### Form Pattern

- **Controlled components** with `useState` for form state
- **No form library** (no Formik, React Hook Form)
- **Client-side validation** via if-checks before submission
- **Server-side validation** errors displayed from catch blocks

## Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Redux actions | camelCase verbs | `setFormOpen`, `clearSelectedBill` |
| RTK Query hooks | `use[Name]Query/Mutation` | `useGetAllBillsQuery`, `useDeleteBillMutation` |
| API endpoints | RESTful paths | `GET /api/patient`, `DELETE /api/patient/:id` |
| Component props | camelCase | `onEdit`, `isLoading`, `onPageChange` |
| CSS classes | Tailwind utilities | `text-slate-900`, `bg-teal-50` |
| Backend exports | named exports | `export const createBill = ...` |
| Frontend exports | named + default | Components are default, hooks/slices are named |
