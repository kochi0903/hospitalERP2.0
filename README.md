# Hospital ERP System (v1.2)

A comprehensive Nursing Home Finance & Patient Management system built with the MERN stack. Version 1.2 introduces critical data integrity features, audit trails, and advanced financial reporting.

## 🚀 Recent Updates (v1.2)
- **Data Safety & Constraints**: Implemented a 24-hour edit-lock window for financial records. Records older than 24 hours can only be viewed, ensuring data stability.
- **Soft Delete System**: Bills and Expenses are now "soft-deleted." Admins can view and restore deleted records from a dedicated Trash view.
- **Activity Audit Trail**: Comprehensive logging of all CRUD actions, logins, and exports. Includes a visual "Before vs. After" diff viewer for updates.
- **Financial Reporting**: Enhanced doctor-wise revenue aggregation with date-range filtering.
- **Data Portability**: Professional Excel export functionality for billing and expense records using `exceljs`.

## 🛠 Tech Stack
- **Frontend**: React, Redux Toolkit (RTK Query), Tailwind CSS, Lucide React.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Security**: JWT Authentication, Role-based Access Control (Admin, Accountant).
- **Reports**: `exceljs` for Excel exports, `html-pdf-node` for PDF generation.

## 📋 Features
- **Patient Billing**: Manage patient admissions, services, and final bills. Generate professional PDF invoices.
- **Expense Tracking**: Track hospital operational costs with category-based filtering.
- **Admin Dashboard**: Real-time financial statistics and growth metrics.
- **User Management**: Secure authentication and role-based navigation.
- **Activity Log**: (Admin Only) Track system-wide changes with detailed history and IP tracking.

## ⚙️ Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or Local)
- Cloudinary Account (for image assets, if used)

### Setup
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd hospital-erp
   ```

2. **Backend Configuration**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Configuration**:
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

## 🔐 Roles & Permissions
| Feature | Admin | Accountant |
| :--- | :---: | :---: |
| Create Bills/Expenses | ✅ | ✅ |
| Update/Delete (within 24h) | ✅ | ✅ |
| Update/Delete (after 24h) | ✅ | ❌ |
| Restore from Trash | ✅ | ❌ |
| View Activity Log | ✅ | ❌ |
| Export Excel Reports | ✅ | ❌ |

## 📄 License
This project is licensed under the ISC License.

---
*Developed for efficient nursing home management.*
