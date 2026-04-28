# Testing

> Last mapped: 2026-04-25

## Current State

**No testing infrastructure exists.** Neither backend nor frontend has any test files, test configuration, or test dependencies.

### Backend

- `package.json` test script: `"test": "echo \"Error: no test specified\" && exit 1"`
- No test framework installed (no Jest, Mocha, Vitest, Supertest, etc.)
- No test directories or files
- No CI/CD pipeline configured

### Frontend

- No test framework installed (no Vitest, Jest, React Testing Library, Cypress, Playwright, etc.)
- No test directories or files
- ESLint is configured but only for code style, not test patterns

## Validation Coverage

Despite no automated tests, some validation exists at multiple layers:

### Mongoose Schema Validation
- **PatientBill:** Required fields, min lengths, totalAmount must match sum of services, dischargeDate not in future
- **Expense:** Required fields, positive amount, date within 180 days, payment mode enum
- **Income:** Required fields, positive amount, referenceId required when source is "Patient Billing"
- **User:** Required fields, email format regex, role enum, name min length

### Controller-Level Validation
- `billingController.js` → `validateBillData()` — checks required fields, types, service structure
- `expenseController.js` → manual checks for amount, remarks, category
- `userController.js` → password length, email format, field-specific checks

### Middleware Validation
- `authMiddleware.js` → JWT token presence and validity
- `checkEditLock.js` → Record age check against `EDIT_LOCK_DAYS`

### Frontend Validation
- `SettingsPage.jsx` → Password length (≥6), confirmation match
- `LoginPage.jsx` → HTML5 `required` attribute on email/password inputs
- No other client-side validation before API calls

## Recommendations for Test Setup

### Priority 1: Backend API Tests
- Install `vitest` + `supertest` for HTTP endpoint testing
- Critical paths: auth flow, billing CRUD, expense CRUD, soft delete/restore
- Edge cases: edit lock enforcement, role-based access, invalid ObjectIds

### Priority 2: Frontend Component Tests
- Install `vitest` + `@testing-library/react` + `msw` for API mocking
- Critical: Auth guard behavior, form validation, delete confirmation flow

### Priority 3: Integration Tests
- Database seeding + full API flow tests
- Aggregation pipeline correctness (stats, doctor revenue)

### Priority 4: E2E Tests
- Install Playwright or Cypress
- Login → Dashboard → Create Bill → Export flow
