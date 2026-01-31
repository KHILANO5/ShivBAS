# ShivBAS — Shiv Budget Accounting System

## 📋 Project Overview

**ShivBAS** is a web-based mini ERP system designed for Shiv Furniture to track budget accounting and financial monitoring. The system provides:

- **Budget Tracking** — Monitor budgets per event/cost center with real-time actual vs. budgeted metrics
- **Transaction Management** — Create and post sales invoices and purchase bills
- **Event-Based Analytics** — Track partner interactions (suppliers/customers) with profit calculations
- **Admin Dashboard** — Visualize budget metrics, expenses, and profits with charts and alerts
- **Customer Portal** — Self-service access to invoices, payments, and order history
- **Automated Rules** — Auto-assign events to transactions based on product categories or vendors

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React + Tailwind CSS + Vite
- **Backend**: Node.js + Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT + bcrypt
- **Payment**: Test Mode (Gateway Integration Ready)

### Database Tables (15)
1. users, password_tokens, contacts, products
2. analytics (event tracking)
3. budgets, revised_budget, budget_graph
4. customer_invoices, invoice_line_items
5. vendor_bills, bill_line_items
6. payments, auto_analytical_models, audit_logs

---

## 🚀 Quick Start

### 1. Setup Database

```bash
mysql -u root -p
CREATE DATABASE shivbas_db;
USE shivbas_db;
SOURCE backend/database/schema.sql;
SOURCE backend/database/seed.sql;
SHOW TABLES;
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# Open http://localhost:3000
```

---

## 📊 Demo Login

**Login ID**: admin_user  
**Password**: Test@123

---

## 📈 Features

✅ Event-based budget tracking (income/expense)  
✅ Real-time budget vs actual metrics  
✅ Partner tracking (suppliers/customers)  
✅ Profit calculation per event  
✅ Invoice & payment management  
✅ Admin dashboard with charts & alerts  
✅ Customer portal (self-service)  
✅ Auto-assign events via rules  
✅ Revised budget tracking  
✅ Audit logging

---

**For detailed documentation, see `backend/database/schema.sql` and `backend/.env.example`**