# Integrations

> Last mapped: 2026-04-25

## Database — MongoDB

- **ODM:** Mongoose v8.15.0
- **Connection:** `backend/utils/db.js` → `mongoose.connect(process.env.MONGO_URI)`
- **Connection string:** Stored in `MONGO_URI` environment variable
- **No connection pooling config** — uses Mongoose defaults
- **No retry logic** — single connect attempt, logs error but doesn't exit on failure

### Collections (via Mongoose Models)

| Model | File | Key Fields |
|-------|------|------------|
| `User` | `backend/models/User.js` | name, email, passwordHash, role, active |
| `PatientBill` | `backend/models/PatientBilling.js` | patientName, patientId, doctorName, services[], totalAmount, status, isDeleted |
| `Expense` | `backend/models/Expense.js` | amount, category, incurredBy (User ref), date, remarks, paymentMode, isDeleted |
| `Income` | `backend/models/Income.js` | source (enum), amount, referenceId (PatientBill ref), isDeleted |
| `AuditLog` | `backend/models/AuditLog.js` | action, entityType, entityId (refPath), performedBy (User ref), details, changes |

### Relationships

- `PatientBill.createdBy` → `User._id`
- `Expense.incurredBy` → `User._id`
- `Income.referenceId` → `PatientBill._id` (when source is "Patient Billing")
- `AuditLog.performedBy` → `User._id`
- `AuditLog.entityId` → dynamic ref via `entityType` field (refPath)

## Authentication — JWT

- **Library:** `jsonwebtoken` v9.0.2
- **Token generation:** `backend/controllers/userController.js` → `jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" })`
- **Token validation:** `backend/middleware/authMiddleware.js` → `jwt.verify(token, JWT_SECRET)`
- **Token transport:** Bearer token in `Authorization` header
- **Token storage (frontend):** Redux store, persisted to localStorage via `redux-persist`
- **No refresh token mechanism** — single 7-day token

## External Services

### Cloudinary (installed, not actively integrated)
- Package `cloudinary` v2.6.1 is in `package.json` but no configuration or usage found in controllers/routes
- Likely planned for future image/file upload features

### Redis (installed, not actively integrated)
- Package `redis` v5.1.0 is in `package.json` but no connection setup or usage found
- Likely planned for caching or session management

## API Communication

### Backend → Frontend
- **CORS origins:** `https://santi-clinic-nursing.vercel.app`, `http://localhost:5173`
- **Credentials:** Enabled (`credentials: true`)
- **Rate limiting:** 200 requests per 5-minute window per IP

### Frontend → Backend
- **Primary:** RTK Query (`@reduxjs/toolkit/query/react`) — used for billing, expenses, user, stats, audit APIs
- **Secondary:** Axios instance (`frontend/src/utils/Axios.js`) — used for PDF downloads and direct API calls
- **Base URL:** `VITE_API_BASE_URL` environment variable

## PDF Generation

- **Library:** `html-pdf-node` v1.0.8
- **Usage:** `backend/controllers/billingController.js` (bill PDFs), `backend/controllers/expenseController.js` (expense reports)
- **Output:** Streamed directly to HTTP response as `application/pdf`

## Excel Export

- **Library:** `exceljs` v4.4.0
- **Utility:** `backend/utils/excelGenerator.js` → `exportToExcel(res, data, columns, sheetName, fileName)`
- **Usage:** Bill and expense export endpoints
- **Output:** Streamed directly to HTTP response as `.xlsx`

## Webhooks / Events
- None configured
- No message queues or event-driven patterns

## Email / Notifications
- None configured
