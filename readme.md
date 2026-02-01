# 🎯 ShivBAS - Budget & Analytics System

<div align="center">

**A Full-Stack Financial Management Application**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📋 Overview

**ShivBAS** is a comprehensive budget management, analytics tracking, and financial reporting system designed for businesses to manage their finances efficiently.

### ✨ Key Highlights

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT-based secure login with role-based access (Admin/Customer) |
| 📊 **Analytics** | Real-time dashboards with charts and insights |
| 💰 **Budget Management** | Create, track, and revise budgets |
| 📄 **Invoicing** | Generate customer invoices and purchase bills |
| 💳 **Payments** | Integrated payment gateway with balance tracking |
| 📧 **Email Notifications** | Beautiful HTML emails on login |
| 👥 **Customer Portal** | Dedicated portal for customers |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **MySQL** 8.0 or higher
- **npm** or **yarn**

### Installation

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/KHILANO5/ShivBAS.git
cd ShivBAS
```

#### 2️⃣ Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Create and setup database
CREATE DATABASE shivbas_db;
USE shivbas_db;
SOURCE backend/database/schema.sql;
SOURCE backend/database/seed.sql;
```

#### 3️⃣ Configure Backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials
```

**.env Configuration:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=shivbas_db
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### 4️⃣ Configure Frontend
```bash
cd frontend
npm install
```

#### 5️⃣ Start Application
```bash
# Terminal 1 - Backend
cd backend
npm start
# Server runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm start
# App runs on http://localhost:3000
```

### 🔑 Default Login Credentials

| Role | Login ID | Password |
|------|----------|----------|
| Admin | `admin_user` | `Test@123` |

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| React Router | 7.x | Navigation |
| Axios | 1.x | HTTP Client |
| Tailwind CSS | 3.x | Styling |
| Recharts | 2.x | Charts & Graphs |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.x | Web Framework |
| MySQL2 | 3.x | Database Driver |
| JWT | - | Authentication |
| Nodemailer | 6.x | Email Service |

---

## 📁 Project Structure

```
ShivBAS/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── database/
│   │   ├── schema.sql           # Database schema
│   │   └── seed.sql             # Sample data
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   ├── routes/              # API endpoints
│   │   ├── middleware/          # Auth middleware
│   │   ├── utils/               # Email, JWT helpers
│   │   └── server.js            # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── context/             # React Context
│   │   ├── pages/               # Page components
│   │   │   ├── customer/        # Customer Portal
│   │   │   └── ...
│   │   ├── services/            # API service layer
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── readme.md
```

---

## 📊 Features

### 🏠 Dashboard
- Real-time analytics overview
- Budget vs Actual comparison
- Recent transactions
- Quick action buttons

### 💰 Budget Management
- Create annual/monthly budgets
- Track budget utilization
- Revised budget support
- Budget category management

### 📄 Invoice & Billing
- Customer invoice generation
- Purchase bill management
- Sale orders & Purchase orders
- PDF export functionality

### 💳 Payment Gateway
- Payment processing
- Payment history tracking
- Partial payment support
- Balance calculation

### 👥 Customer Portal
- Customer self-service
- View invoices & orders
- Make payments
- Track payment history

### 📧 Email Notifications
- Beautiful HTML welcome emails
- Login notifications
- Branded email templates

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |

### Master Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/products` | Product management |
| GET/POST | `/api/contacts` | Contact management |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/budgets` | Budget operations |
| GET/POST | `/api/customer-invoices` | Invoice operations |
| GET/POST | `/api/purchase-bills` | Bill operations |
| GET/POST | `/api/payments` | Payment operations |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/razorpay/direct-payment` | Process payment |
| GET | `/api/razorpay/balance/:type/:id` | Get balance |

---

## 👥 Team

| Name | Role | Contributions |
|------|------|---------------|
| **Yash** | Mentor | Technical guidance & oversight |
| **Khilan** | Database Lead | Schema design, 23 tables, relationships |
| **Pruthvi** | Frontend Lead | React UI/UX, 20+ pages |
| **Nishit** | Backend Lead | API development, integrations |

---

## 📈 Project Stats

| Metric | Count |
|--------|-------|
| 📊 Database Tables | 23 |
| 🔌 API Endpoints | 25+ |
| 📱 Frontend Pages | 20+ |
| 🎨 UI Components | 15+ |
| ✅ Integration | 100% |

---

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=shivbas_db

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Email (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 📝 License

This project is developed for educational purposes.

---

## 🙏 Acknowledgments

Special thanks to **Mentor Yash** for guidance and technical support throughout the development process.

---

<div align="center">

**Built with ❤️ by Team ShivBAS**

[![GitHub](https://img.shields.io/badge/GitHub-KHILANO5/ShivBAS-181717?style=flat-square&logo=github)](https://github.com/KHILANO5/ShivBAS)

</div>
