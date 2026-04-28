# Stack

> Last mapped: 2026-04-25

## Languages & Runtime

| Layer | Language | Runtime |
|-------|----------|---------|
| Backend | JavaScript (ES Modules) | Node.js |
| Frontend | JavaScript/JSX | Browser (Vite dev server) |

- **Module System:** ES Modules (`"type": "module"`) in both backend and frontend

## Backend Framework & Dependencies

**Framework:** Express.js v5.1.0

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.1.0 | HTTP server framework |
| `mongoose` | ^8.15.0 | MongoDB ODM |
| `jsonwebtoken` | ^9.0.2 | JWT authentication |
| `bcryptjs` | ^3.0.2 | Password hashing |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `cookie-parser` | ^1.4.7 | Cookie parsing middleware |
| `body-parser` | ^2.2.0 | Request body parsing (redundant with express.json) |
| `express-rate-limit` | ^7.5.0 | API rate limiting |
| `express-validator` | ^7.2.1 | Input validation (installed but unused in controllers) |
| `exceljs` | ^4.4.0 | Excel file generation |
| `html-pdf-node` | ^1.0.8 | PDF generation from HTML |
| `dotenv` | ^16.5.0 | Environment variable loading |
| `cloudinary` | ^2.6.1 | Cloud image storage (installed, not actively used) |
| `datauri` | ^4.1.0 | Data URI conversion (installed, not actively used) |
| `redis` | ^5.1.0 | Redis client (installed, not actively used) |
| `nodemon` | ^3.1.10 | Dev auto-restart |

**Dev dependencies:** TypeScript type definitions for bcryptjs, cookie-parser, express, jsonwebtoken (types only, not a TS project).

## Frontend Framework & Dependencies

**Build Tool:** Vite v5.2.0
**UI Framework:** React v18.2.0

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | UI framework |
| `react-dom` | ^18.2.0 | DOM rendering |
| `react-router-dom` | ^7.6.0 | Client-side routing |
| `@reduxjs/toolkit` | ^2.5.0 | State management + RTK Query for API |
| `react-redux` | ^9.2.0 | React-Redux bindings |
| `redux-persist` | ^6.0.0 | Persist Redux state to localStorage |
| `axios` | ^1.7.9 | HTTP client (used alongside RTK Query) |
| `tailwindcss` | ^3.4.4 | Utility-first CSS |
| `lucide-react` | ^0.511.0 | Icon library |
| `recharts` | ^3.8.1 | Chart components |
| `react-hot-toast` | ^2.5.2 | Toast notifications |
| `framer-motion` | ^11.2.10 | Animations |
| `react-icons` | ^5.2.1 | Icon library (redundant with lucide-react) |
| `react-multi-carousel` | ^2.8.6 | Carousel component |
| `react-scroll` | ^1.9.0 | Smooth scroll |
| `react-type-animation` | ^3.2.0 | Typing animation |
| `lodash.debounce` | ^4.0.8 | Debounce utility |

## Configuration

- **Backend entry:** `backend/index.js`
- **Frontend entry:** `frontend/src/main.jsx`
- **Vite config:** `frontend/vite.config.js` — minimal, only React plugin
- **Tailwind config:** `frontend/tailwind.config.js` — default config, no custom theme extensions
- **Environment variables:** `backend/.env` (gitignored) — `MONGO_URI`, `JWT_SECRET`, `EDIT_LOCK_DAYS`, `PORT`
- **Frontend env:** `VITE_API_BASE_URL` — backend API base URL

## Scripts

**Backend (`backend/package.json`):**
- `dev` → `nodemon index.js`
- `start` → `node index.js`
- `test` → not configured

**Frontend (`frontend/package.json`):**
- `dev` → `vite`
- `build` → `vite build`
- `preview` → `vite preview`
- `lint` → eslint with react plugins
