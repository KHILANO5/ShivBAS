# 🎯 ShivBAS - Budget & Analytics System

**Full-Stack Financial Management Application**

A comprehensive budget management, analytics tracking, and financial reporting system built with React.js, Node.js/Express, and MySQL.

## 📋 Project Overview

ShivBAS is a production-ready financial management application featuring:
- 🔐 Secure JWT authentication with role-based access
- 📊 Real-time data synchronization
- 💼 16-table normalized database design
- 🎨 Responsive React UI with Tailwind CSS
- 🔗 20+ RESTful API endpoints
- ✅ 100% backend integration (zero mock data)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

**1. Clone & Setup Database**
```bash
git clone <repository-url>
cd ShivBAS

# Create database
mysql -u root -p
CREATE DATABASE shivbas_db;
USE shivbas_db;
SOURCE backend/database/schema.sql;
SOURCE backend/database/seed.sql;
```

**2. Configure Backend**
```bash
cd backend
npm install
# Create .env file with database credentials
npm start
# Server runs on http://localhost:5000
```

**3. Configure Frontend**
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

**4. Login**
- URL: http://localhost:3000/login
- Username: `admin_user`
- Password: `Test@123`

---

## 🛠️ Technology Stack

**Frontend:**
- React 19.2.4 + React Router 7.13.0
- Axios 1.13.4 for API calls
- Tailwind CSS for styling
- Context API for state management

**Backend:**
- Node.js + Express.js
- MySQL 8.0 with 16 tables
- JWT Authentication
- bcryptjs password hashing

---

## ✨ Key Features

✅ User Authentication & Authorization  
✅ Product Management (Full CRUD)  
✅ Contact Management (Customers & Vendors)  
✅ Budget Planning & Tracking  
✅ Invoice Generation & Management  
✅ Purchase Bills & Orders  
✅ Payment Recording & Tracking  
✅ Analytics Dashboard with Real-time Data  
✅ Event-based Analytics Tracking  
✅ Advanced Filtering & Search  
✅ Responsive Design (Mobile/Tablet/Desktop)

---

## 📚 Documentation

For complete project details, see:
- **[PROJECT_COMPLETION_REPORT.md](PROJECT_COMPLETION_REPORT.md)** - Comprehensive project documentation, architecture, and team contributions
- **[API_CONTRACTS.md](API_CONTRACTS.md)** - Complete API endpoint specifications
- **[DATABASE_REFERENCE.md](DATABASE_REFERENCE.md)** - Database schema and relationships

---

## 📦 Project Structure

```
ShivBAS/
├── backend/
│   ├── config/              # Database configuration
│   ├── database/            # Schema & seed files
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & validation
│   │   └── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Page components (18+)
│   │   ├── services/        # API service layer
│   │   └── App.js
│   └── package.json
└── PROJECT_COMPLETION_REPORT.md
```

---

## 👥 Team

- **Yash** - Mentor & Technical Oversight
- **Khilan** - Database Architecture (16 tables, relationships, seeds)
- **Pruthvi** - Frontend Development (React UI/UX, 18+ pages)
- **[Your Name]** - Backend & API Integration (20+ endpoints, 100% connectivity)

---

## 📊 Project Status

**Status:** ✅ Production Ready  
**Last Updated:** January 31, 2026  
**Version:** 1.0.0

### Achievement Metrics:
- 16 database tables with proper relationships
- 20+ RESTful API endpoints
- 14 fully functional frontend pages
- 100% backend integration (zero mock data)
- Complete authentication & authorization
- Production-ready error handling

---

## 🙏 Acknowledgments

Special thanks to Mentor Yash for guidance and technical support throughout the development process.

---

**For detailed documentation, architecture diagrams, and complete feature breakdown, see [PROJECT_COMPLETION_REPORT.md](PROJECT_COMPLETION_REPORT.md)**