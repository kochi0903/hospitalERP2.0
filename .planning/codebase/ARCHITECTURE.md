# Architecture

> Last mapped: 2026-04-25

## Pattern

**Monorepo with separate backend/frontend directories.** No shared code or monorepo tooling (no Turborepo, Lerna, etc.).

- **Backend:** Express.js REST API — classic MVC without the View layer (Model-Controller-Route)
- **Frontend:** React SPA with Redux state management — component-based architecture

## Backend Layers

```
Request → Middleware → Route → Controller → Model → MongoDB
                                    ↓
                              Utility (audit, excel, pdf)
```

### Layer Details

| Layer | Location | Responsibility |
|-------|----------|---------------|
| **Entry Point** | `backend/index.js` | Express app setup, middleware registration, route mounting, DB connection |
| **Routes** | `backend/routes/*.js` | URL-to-controller mapping, middleware chaining (auth, roles, edit lock) |
| **Middleware** | `backend/middleware/*.js` | Cross-cutting concerns: authentication, authorization, edit lock |
| **Controllers** | `backend/controllers/*.js` | Business logic, validation, response formatting |
| **Models** | `backend/models/*.js` | Mongoose schemas, validation rules, indexes, virtuals, soft-delete hooks |
| **Utilities** | `backend/utils/*.js` | Shared functions: DB connection, audit logging, Excel generation |

### Middleware Pipeline (per request)

1. `cookie-parser` — parse cookies
2. `cors` — CORS headers
3. `bodyParser.json()` + `express.json()` — body parsing (both registered, redundant)
4. `express.urlencoded` — URL-encoded body parsing
5. `rateLimit` — 200 req / 5 min per IP
6. Route-level: `authenticate` → `allowRoles(...)` → optional `checkEditLock(Model)`

### Authentication & Authorization Flow

1. `authenticate` middleware: Extracts JWT from `Authorization: Bearer <token>`, verifies with `JWT_SECRET`, attaches `req.user`
2. `allowRoles(...roles)` middleware: Checks `req.user.role` against allowed roles list
3. `checkEditLock(Model)` middleware: Prevents non-admin edits on records older than `EDIT_LOCK_DAYS`

### Soft Deletion Pattern

Applied to: `PatientBill`, `Expense`, `Income`

- Models have `isDeleted: Boolean` and `deletedAt: Date` fields
- Pre-find hooks automatically filter `{ isDeleted: { $ne: true } }` on `find` and `findOne`
- Controllers set `isDeleted: true` + `deletedAt` on delete, unset on restore
- Trash view: Controllers query with explicit `{ isDeleted: true }` override

### Audit Logging Pattern

- `backend/utils/auditLogger.js` → `logActivity(action, entityType, entityId, performedBy, details, changes, ipAddress)`
- Called in controllers after successful create/update/delete/restore operations
- `calculateDelta(oldData, newData, trackedFields)` computes field-level changes for update logs
- Stored in `AuditLog` model with dynamic `entityId` ref via `refPath`

## Frontend Layers

```
RouterProvider → App → Auth (guard) → Page → Components
                                        ↓
                               Redux Store ← RTK Query → Backend API
```

### Layer Details

| Layer | Location | Responsibility |
|-------|----------|---------------|
| **Entry** | `frontend/src/main.jsx` | React root, Redux Provider, PersistGate, Suspense, Router |
| **App Shell** | `frontend/src/App.jsx` | Outlet + Toaster |
| **Router** | `frontend/src/route/index.jsx` | Route definitions with lazy loading + 330ms min delay |
| **Auth Guard** | `frontend/src/components/layout/Auth.jsx` | Redirect to `/login` if not authenticated |
| **Layout** | `frontend/src/components/layout/` | SideNav, Navbar, Footer, AuthHeader |
| **Pages** | `frontend/src/pages/` | Page-level components with business logic |
| **Components** | `frontend/src/components/` | Reusable UI and domain-specific components |
| **Services** | `frontend/src/services/` | RTK Query API definitions |
| **Store** | `frontend/src/store/` | Redux slices for UI state, filters, pagination |
| **Utils** | `frontend/src/utils/` | Axios instance, formatters, debounce hook, toast helper |

### State Management

- **RTK Query APIs:** `billingApi`, `expenseApi`, `userApi`, `statsApi`, `auditApi` — server state
- **Redux Slices:** `billingSlice`, `expenseSlice`, `userSlice` — client UI state (filters, pagination, modals)
- **Persistence:** `redux-persist` with `localStorage`, whitelisted to `user` slice only (token + auth state)

### Data Flow (example: Billing Page)

1. `BillingPage` reads filter/pagination state from `billingSlice` via `useSelector`
2. Constructs `queryOptions` and passes to `useGetAllBillsQuery` (RTK Query)
3. RTK Query fetches from backend, caches result, provides loading/error states
4. Page renders `BillTable` with data, passes action handlers
5. Mutations (`useDeleteBillMutation`, etc.) invalidate `["Bill"]` tag → triggers refetch

## API Routes

### Base: `/api`

| Prefix | Routes File | Auth | Roles |
|--------|------------|------|-------|
| `/api/patient` | `billingRoutes.js` | Yes | admin, accountant |
| `/api/expense` | `expenseRoutes.js` | Yes | admin, accountant |
| `/api/user` | `userRoutes.js` | Mixed | Mixed |
| `/api/income` | `incomeRoutes.js` | Yes | admin, accountant |
| `/api/stats` | `statsRoutes.js` | Yes | admin, accountant |
| `/api/audit` | `auditRoutes.js` | Yes | admin only |

## Key Design Decisions

1. **No TypeScript** — pure JavaScript with JSDoc-free codebase
2. **No testing framework** — no unit/integration/e2e tests configured
3. **JWT in header, not cookie** — despite cookie-parser being installed
4. **Dual HTTP clients** — RTK Query for most API calls, Axios for PDF downloads
5. **Soft delete everywhere** — no hard deletes, trash view available
6. **Server-side pagination** — page/limit/filters sent as query params
7. **Lazy loading with artificial delay** — 330ms minimum load time for route transitions
