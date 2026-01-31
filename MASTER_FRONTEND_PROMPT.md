# ShivBAS - Master Frontend Development Prompt
## Admin Dashboard & Login Module - Complete Specification

**Version**: 1.0  
**Date**: January 31, 2026  
**Project**: ShivBAS - 24-Hour Hackathon Edition  
**Target Stack**: React 18+, Tailwind CSS, Axios  
**API Base URL**: `http://localhost:5000/api`

---

## 📑 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack & Dependencies](#technology-stack--dependencies)
3. [Database Field Mapping](#database-field-mapping)
4. [Authentication Module](#authentication-module)
5. [Admin Dashboard Module](#admin-dashboard-module)
6. [Component Architecture](#component-architecture)
7. [API Integration Patterns](#api-integration-patterns)
8. [Form Specifications](#form-specifications)
9. [Validation Rules](#validation-rules)
10. [Error Handling](#error-handling)
11. [Data Storage & State Management](#data-storage--state-management)

---

## Project Overview

### What is ShivBAS?
ShivBAS is a comprehensive Budget Analysis System designed for managing events, budgets, invoices, and payments. The frontend provides:
- **Login Module**: Secure authentication for admin and portal users
- **Admin Dashboard**: Complete view of budget status, financial metrics, and system analytics
- **Master Data Management**: Create and manage products, contacts, analytics events
- **Transaction Handling**: Invoice and bill creation, payment recording
- **Budget Tracking**: Visual representation of budget status with alerts

### User Roles
```
1. Admin (role='admin')
   - Full access to all modules
   - Can create/edit budgets, invoices, bills
   - Can manage users and products
   - Can view detailed analytics

2. Portal User (role='portal')
   - Limited to self-service features
   - Can view own invoices
   - Can view own budget information
   - Cannot create new entities
```

---

## Technology Stack & Dependencies

### Core Frontend Stack
```
Framework:        React 18+ (Latest stable version)
Styling:          Tailwind CSS 3.x
HTTP Client:      Axios 1.x
Routing:          React Router v6.x
Build Tool:       Vite 5.x or Create React App 5.x
Node.js:          v18.x or higher
Package Manager:  npm 9.x or yarn 3.x
```

### Installation & Setup

#### Step 1: Create React Project
```bash
# Using Vite (Recommended - Fastest)
npm create vite@latest shivbas-frontend -- --template react
cd shivbas-frontend
npm install

# OR using Create React App
npx create-react-app shivbas-frontend
cd shivbas-frontend
```

#### Step 2: Install Required Dependencies
```bash
# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# API & HTTP
npm install axios

# Routing
npm install react-router-dom

# Chart & Graph Library (Choose One)
npm install recharts        # Recommended - React-native, lightweight
# OR
npm install chart.js react-chartjs-2
# OR
npm install plotly.js react-plotly.js
```

#### Step 3: Configure Tailwind CSS
**File**: `tailwind.config.js`
```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',    // Blue
        success: '#10b981',    // Green
        warning: '#f59e0b',    // Amber
        danger: '#ef4444',     // Red
        info: '#0ea5e9',       // Sky Blue
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
};
```

**File**: `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utility classes */
@layer components {
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
  
  .btn-primary {
    @apply px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition;
  }
  
  .btn-secondary {
    @apply px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition;
  }
  
  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500;
  }
  
  .label-text {
    @apply block text-sm font-semibold text-gray-700 mb-2;
  }
}
```

#### Step 4: Project Structure
```
shivbas-frontend/
├── src/
│   ├── components/
│   │   ├── LoginPage.jsx
│   │   ├── SummaryCard.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorAlert.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── charts/
│   │       ├── BudgetStatusChart.jsx
│   │       ├── RevenueChart.jsx
│   │       └── ProfitTrendChart.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── UnauthorizedPage.jsx
│   │   └── admin/
│   │       ├── DashboardPage.jsx
│   │       ├── BudgetsPage.jsx
│   │       ├── InvoicesPage.jsx
│   │       ├── CreateInvoicePage.jsx
│   │       └── CreateBudgetPage.jsx
│   ├── services/
│   │   └── api.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   └── useFetch.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── public/
│   └── index.html
├── .env
├── .env.example
├── package.json
├── vite.config.js (or no need if using CRA)
└── tailwind.config.js
```

#### Step 5: Run Development Server
```bash
npm run dev          # For Vite
# OR
npm start            # For Create React App
```

Server will be available at: `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA)

---

### Recommended Chart Libraries

#### 1. **Recharts** (Recommended for ShivBAS)
**Why**: React-native, lightweight, great for business dashboards

```bash
npm install recharts
```

**Pros**:
- Responsive by default
- Easy to customize
- Built for React
- Great documentation
- Perfect for budget/financial data

**Example - Budget Status Pie Chart**:
```javascript
// src/components/charts/BudgetStatusChart.jsx
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export default function BudgetStatusChart({ onTrack, warning, critical }) {
  const data = [
    { name: 'On Track', value: onTrack, fill: '#10b981' },
    { name: 'Warning', value: warning, fill: '#f59e0b' },
    { name: 'Critical', value: critical, fill: '#ef4444' },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

**Example - Revenue Line Chart**:
```javascript
// src/components/charts/RevenueChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
          contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#2563eb" 
          strokeWidth={2}
          dot={{ fill: '#2563eb', r: 5 }}
          activeDot={{ r: 7 }}
        />
        <Line 
          type="monotone" 
          dataKey="profit" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**Example - Budget Progress Bar Chart**:
```javascript
// src/components/charts/BudgetProgressChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function BudgetProgressChart({ budgets }) {
  const getColor = (percentage) => {
    if (percentage < 50) return '#10b981';  // Green
    if (percentage < 80) return '#f59e0b';  // Yellow
    return '#ef4444';                       // Red
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={budgets} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="event_name" />
        <YAxis />
        <Tooltip 
          formatter={(value) => `${value}%`}
          contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
        />
        <Legend />
        <Bar dataKey="percentage_achieved" name="Budget Used %" radius={[8, 8, 0, 0]}>
          {budgets.map((budget, index) => (
            <Cell key={`cell-${index}`} fill={getColor(budget.percentage_achieved)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

#### 2. **Chart.js + react-chartjs-2** (Alternative)
**When to use**: If you need more advanced charting features

```bash
npm install chart.js react-chartjs-2
```

**Example**:
```javascript
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BudgetChart({ data }) {
  const chartData = {
    labels: data.map(d => d.event_name),
    datasets: [{
      label: 'Budget Status',
      data: data.map(d => d.percentage_achieved),
      backgroundColor: [
        'rgba(16, 185, 129, 0.6)',   // Green
        'rgba(245, 158, 11, 0.6)',   // Yellow
        'rgba(239, 68, 68, 0.6)',    // Red
      ],
      borderColor: [
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
      ],
      borderWidth: 1,
    }],
  };

  return <Pie data={chartData} />;
}
```

#### 3. **Plotly.js + react-plotly.js** (Advanced)
**When to use**: Complex financial charts and 3D visualizations

```bash
npm install plotly.js react-plotly.js
```

---

### Package.json Dependencies Summary

```json
{
  "name": "shivbas-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15"
  }
}
```

---

### Environment Configuration Example

**File**: `.env.example`
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_JWT_STORAGE_KEY=shivbas_jwt_token
REACT_APP_REFRESH_TOKEN_KEY=shivbas_refresh_token
REACT_APP_USER_STORAGE_KEY=shivbas_user
REACT_APP_DEBUG=false
REACT_APP_CHART_LIBRARY=recharts
```

**File**: `.env` (Development)
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_JWT_STORAGE_KEY=shivbas_jwt_token
REACT_APP_REFRESH_TOKEN_KEY=shivbas_refresh_token
REACT_APP_USER_STORAGE_KEY=shivbas_user
REACT_APP_DEBUG=true
REACT_APP_CHART_LIBRARY=recharts
```

---

## Database Field Mapping

### 1. Users Table Fields → Frontend Variables
```
Database Field          →  Frontend Variable      →  Data Type   →  Display
─────────────────────────────────────────────────────────────────────────
users.id               →  user.id                →  number      →  (hidden, internal)
users.login_id         →  user.login_id          →  string      →  Username
users.email            →  user.email             →  string      →  Email Address
users.password         →  (not stored FE)        →  encrypted    →  (not stored)
users.name             →  user.name              →  string      →  Full Name
users.role             →  user.role              →  enum        →  Role Badge (admin/portal)
users.signup_type      →  user.signup_type       →  enum        →  (admin internal)
users.status           →  user.status            →  enum        →  Status (active/archived)
users.created_at       →  user.created_at        →  timestamp    →  Account Created
users.updated_at       →  user.updated_at        →  timestamp    →  Last Updated
```

### 2. Contacts Table Fields → Frontend Variables
```
Database Field          →  Frontend Variable      →  Data Type   →  Usage
─────────────────────────────────────────────────────────────────────────
contacts.id            →  contact.id             →  number      →  (internal FK)
contacts.name          →  contact.name           →  string      →  Contact Name
contacts.type          →  contact.type           →  enum        →  Customer / Vendor (selector)
contacts.email         →  contact.email          →  string      →  Email
contacts.phone         →  contact.phone          →  string      →  Phone Number
contacts.linked_user_id →  contact.linkedUserId  →  number      →  (internal, if portal user)
contacts.status        →  contact.status         →  enum        →  Active / Archived
contacts.created_at    →  contact.created_at     →  timestamp    →  Date Created
contacts.updated_at    →  contact.updated_at     →  timestamp    →  Last Modified
```

### 3. Products Table Fields → Frontend Variables
```
Database Field          →  Frontend Variable      →  Data Type   →  Usage
─────────────────────────────────────────────────────────────────────────
products.id            →  product.id             →  number      →  (internal FK)
products.name          →  product.name           →  string      →  Product Name (dropdown)
products.category      →  product.category       →  string      →  Category selector
products.unit_price    →  product.unitPrice      →  decimal     →  Display in forms
products.tax_rate      →  product.taxRate        →  decimal     →  Tax % calculation
products.status        →  product.status         →  enum        →  Filter in dropdowns
products.created_at    →  product.created_at     →  timestamp    →  (internal)
products.updated_at    →  product.updated_at     →  timestamp    →  (internal)
```

### 4. Analytics Table Fields → Frontend Variables
```
Database Field              →  Frontend Variable      →  Data Type   →  Usage
──────────────────────────────────────────────────────────────────────────
analytics.id               →  analytics.id          →  number      →  (FK reference)
analytics.event_name       →  analytics.eventName   →  string      →  Display in filters
analytics.partner_tag      →  analytics.partnerTag  →  enum        →  supplier/customer
analytics.partner_id       →  analytics.partnerId   →  number      →  (FK to users)
analytics.product_id       →  analytics.productId   →  number      →  (FK to products)
analytics.product_category →  analytics.category    →  string      →  Category label
analytics.no_of_units      →  analytics.units      →  number      →  Quantity
analytics.unit_price       →  analytics.unitPrice   →  decimal     →  Price per unit
analytics.profit           →  analytics.profit      →  decimal     →  Total profit
analytics.profit_margin_percentage → analytics.profitMargin → decimal → Percentage
analytics.status           →  analytics.status      →  enum        →  Active/Archived
analytics.created_at       →  analytics.createdAt   →  timestamp    →  Date
```

### 5. Budgets Table Fields → Frontend Variables
```
Database Field              →  Frontend Variable      →  Data Type   →  Usage
──────────────────────────────────────────────────────────────────────────
budgets.id                 →  budget.id             →  number      →  (PK reference)
budgets.event_name         →  budget.eventName      →  string      →  Title display
budgets.analytics_id       →  budget.analyticsId    →  number      →  (FK)
budgets.type               →  budget.type           →  enum        →  income/expense (chip)
budgets.budgeted_amount    →  budget.budgetedAmount →  decimal     →  Target value
budgets.achieved_amount    →  budget.achievedAmount →  decimal     →  Current progress
budgets.percentage_achieved →  budget.percentageAchieved → decimal  →  Progress bar %
budgets.amount_to_achieve  →  budget.amountToAchieve → decimal    →  Remaining
budgets.start_date         →  budget.startDate      →  date        →  Period start
budgets.end_date           →  budget.endDate        →  date        →  Period end
budgets.notes              →  budget.notes          →  text        →  Description
budgets.created_at         →  budget.createdAt      →  timestamp    →  (internal)
budgets.updated_at         →  budget.updatedAt      →  timestamp    →  (internal)
```

### 6. Customer Invoices Table Fields → Frontend Variables
```
Database Field              →  Frontend Variable      →  Data Type   →  Usage
──────────────────────────────────────────────────────────────────────────
customer_invoices.id       →  invoice.id            →  number      →  Invoice #
customer_invoices.customer_id →  invoice.customerId →  number      →  Customer selector
customer_invoices.analytics_id →  invoice.analyticsId →  number   →  Event/Partner link
customer_invoices.created_by_user_id →  invoice.createdBy →  number → (internal audit)
customer_invoices.total_amount →  invoice.totalAmount →  decimal   →  Display total
customer_invoices.status   →  invoice.status        →  enum        →  draft/posted/cancelled
customer_invoices.payment_status →  invoice.paymentStatus → enum   →  not_paid/partial/paid
customer_invoices.created_at →  invoice.createdAt   →  timestamp    →  Created date
customer_invoices.posted_at →  invoice.postedAt     →  timestamp    →  Posted date
customer_invoices.updated_at →  invoice.updatedAt   →  timestamp    →  Modified date
```

### 7. Invoice Line Items Table Fields → Frontend Variables
```
Database Field              →  Frontend Variable      →  Data Type   →  Usage
──────────────────────────────────────────────────────────────────────────
invoice_line_items.id     →  lineItem.id            →  number      →  (internal)
invoice_line_items.invoice_id →  lineItem.invoiceId →  number     →  (FK)
invoice_line_items.product_id →  lineItem.productId →  number     →  Product selector
invoice_line_items.quantity →  lineItem.quantity     →  number      →  Input field
invoice_line_items.unit_price →  lineItem.unitPrice →  decimal     →  Auto-populate from product
invoice_line_items.tax_amount →  lineItem.taxAmount →  decimal     →  Auto-calculated
invoice_line_items.created_at →  lineItem.createdAt →  timestamp    →  (internal)
```

### 8. Payments Table Fields → Frontend Variables
```
Database Field              →  Frontend Variable      →  Data Type   →  Usage
──────────────────────────────────────────────────────────────────────────
payments.id                →  payment.id             →  number      →  (internal)
payments.invoice_id        →  payment.invoiceId      →  number      →  (FK)
payments.bill_id           →  payment.billId         →  number      →  (FK)
payments.amount_paid       →  payment.amountPaid     →  decimal     →  Input field
payments.payment_mode      →  payment.paymentMode    →  enum        →  Dropdown (upi/cash/bank/gateway)
payments.transaction_id    →  payment.transactionId  →  string      →  Reference input
payments.status            →  payment.status         →  enum        →  pending/completed/failed
payments.payment_date      →  payment.paymentDate    →  date        →  Date picker
payments.created_at        →  payment.createdAt      →  timestamp    →  (internal)
```

### 9. Budget Graph Table Fields → Frontend Variables
```
Database Field              →  Frontend Variable      →  Data Type   →  Usage
──────────────────────────────────────────────────────────────────────────
budget_graph.id            →  budgetGraph.id         →  number      →  (internal)
budget_graph.budget_id     →  budgetGraph.budgetId   →  number      →  (FK)
budget_graph.event_name    →  budgetGraph.eventName  →  string      →  Chart label
budget_graph.total_expense →  budgetGraph.totalExpense → decimal    →  Chart data
budget_graph.predicted_expense →  budgetGraph.predictedExpense → decimal → Projection
budget_graph.total_profit  →  budgetGraph.totalProfit →  decimal    →  Chart data
budget_graph.predicted_profit →  budgetGraph.predictedProfit → decimal → Projection
budget_graph.expense_variance →  budgetGraph.expenseVariance → decimal → Variance indicator
budget_graph.profit_variance →  budgetGraph.profitVariance → decimal → Variance indicator
budget_graph.reporting_date →  budgetGraph.reportingDate → date     → Report date
budget_graph.created_at    →  budgetGraph.createdAt  →  timestamp    →  (internal)
```

### 10. Alerts Table Fields → Frontend Variables
```
Database Field              →  Frontend Variable      →  Data Type   →  Usage
──────────────────────────────────────────────────────────────────────────
alerts.id                  →  alert.id               →  number      →  (internal)
alerts.budget_id           →  alert.budgetId         →  number      →  (FK)
alerts.alert_type          →  alert.type             →  enum        →  info/warning/critical (color coding)
alerts.message             →  alert.message          →  string      →  Alert text
alerts.is_read             →  alert.isRead           →  boolean     →  Mark as read action
alerts.created_at          →  alert.createdAt        →  timestamp    →  Alert timestamp
```

---

## Authentication Module

### Login Page Component Structure

#### File: `src/pages/LoginPage.jsx`

**Purpose**: Handle user authentication and login flow

**Key Features**:
- Accept login_id and password
- Validate credentials
- Store JWT tokens
- Store user information
- Role-based navigation
- Error handling with proper messages

**Form Fields** (from database users table):
```javascript
const loginFormData = {
  login_id: '',      // users.login_id - 6-12 chars, alphanumeric + underscore
  password: '',      // users.password - encrypted, min 8 chars
}
```

**Complete Component Code**:
```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ErrorAlert from '../components/ErrorAlert';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login_id: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.login_id.trim()) {
      setError('Login ID is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.login_id.length < 6 || formData.login_id.length > 12) {
      setError('Login ID must be between 6-12 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        login_id: formData.login_id,
        password: formData.password,
      });

      if (response.data.success) {
        const { user, token, refreshToken } = response.data.data;

        // Store tokens
        localStorage.setItem(
          process.env.REACT_APP_JWT_STORAGE_KEY || 'shivbas_jwt_token',
          token
        );
        localStorage.setItem(
          process.env.REACT_APP_REFRESH_TOKEN_KEY || 'shivbas_refresh_token',
          refreshToken
        );

        // Store user information (from users table)
        localStorage.setItem(
          process.env.REACT_APP_USER_STORAGE_KEY || 'shivbas_user',
          JSON.stringify({
            id: user.id,
            login_id: user.login_id,
            email: user.email,
            name: user.name,
            role: user.role, // 'admin' or 'portal'
            created_at: user.created_at,
          })
        );

        // Navigate based on role
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (user.role === 'portal') {
          navigate('/portal/dashboard', { replace: true });
        } else {
          setError('Unknown user role');
        }
      }
    } catch (err) {
      const errorMessage = 
        err.response?.data?.error || 
        err.message || 
        'Login failed. Please try again.';
      
      setError(errorMessage);
      setFormData(prev => ({ ...prev, password: '' })); // Clear password
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-lg p-4 mb-4">
            <h1 className="text-3xl font-bold text-blue-600">ShivBAS</h1>
          </div>
          <p className="text-white text-lg">Budget Analysis System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white shadow-2xl rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login</h2>
          <p className="text-gray-600 text-sm mb-6">
            Sign in to your account to continue
          </p>

          {/* Error Alert */}
          <ErrorAlert error={error} onClose={() => setError('')} />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Login ID Field */}
            <div>
              <label htmlFor="login_id" className="block text-sm font-semibold text-gray-700 mb-2">
                Login ID
              </label>
              <input
                id="login_id"
                type="text"
                name="login_id"
                value={formData.login_id}
                onChange={handleInputChange}
                placeholder="username"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                autoComplete="username"
              />
              <p className="text-xs text-gray-500 mt-1">
                6-12 characters, letters, numbers, and underscore only
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <p className="text-gray-600 text-sm">
              Forgot your password?{' '}
              <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-semibold">
                Reset here
              </a>
            </p>
          </div>
        </div>

        {/* Demo Credentials Info (Remove in production) */}
        <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 text-white text-xs">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p>Admin: admin_user / Test@123</p>
          <p>Portal: john_portal / Test@123</p>
        </div>
      </div>
    </div>
  );
}
```

### Protected Route Component

#### File: `src/components/ProtectedRoute.jsx`

**Purpose**: Protect routes that require authentication and specific roles

**Code**:
```javascript
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({
  element,
  requiredRole = null,
  requiredAuth = true,
}) {
  const token = localStorage.getItem(
    process.env.REACT_APP_JWT_STORAGE_KEY || 'shivbas_jwt_token'
  );
  const userStr = localStorage.getItem(
    process.env.REACT_APP_USER_STORAGE_KEY || 'shivbas_user'
  );
  
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Failed to parse user data:', e);
  }

  // Check authentication
  if (requiredAuth && !token) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
}
```

### API Service Configuration

#### File: `src/services/api.js`

**Purpose**: Configure Axios with JWT token management

**Code**:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      process.env.REACT_APP_JWT_STORAGE_KEY || 'shivbas_jwt_token'
    );
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(
          process.env.REACT_APP_REFRESH_TOKEN_KEY || 'shivbas_refresh_token'
        );

        if (refreshToken) {
          const response = await api.post('/auth/refresh-token', { refreshToken });
          
          if (response.data.success) {
            localStorage.setItem(
              process.env.REACT_APP_JWT_STORAGE_KEY || 'shivbas_jwt_token',
              response.data.data.token
            );
            localStorage.setItem(
              process.env.REACT_APP_REFRESH_TOKEN_KEY || 'shivbas_refresh_token',
              response.data.data.refreshToken
            );

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${response.data.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // If refresh failed, clear storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## Admin Dashboard Module

### Dashboard Overview Page

#### File: `src/pages/admin/DashboardPage.jsx`

**Purpose**: Display comprehensive admin dashboard with KPIs, budget status, and financial metrics

**Key Data Points from Database**:
- Total budgets count
- Total revenue (sum of achieved amounts for income budgets)
- Total profit (from analytics table)
- Profit margin percentage
- Budget status breakdown (on-track, warning, critical)
- Recent transactions
- Budget alerts

**Component Structure**:
```javascript
import { useEffect, useState } from 'react';
import api from '../../services/api';
import SummaryCard from '../../components/SummaryCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import BudgetStatusChart from '../../components/charts/BudgetStatusChart';
import RevenueChart from '../../components/charts/RevenueChart';
import AlertsList from '../../components/AlertsList';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch summary data
        const summaryRes = await api.get('/dashboard/summary');
        setSummary(summaryRes.data.data);

        // Fetch alerts
        const alertsRes = await api.get('/alerts?skip=0&limit=10');
        setAlerts(alertsRes.data.data.alerts || []);

        // Prepare chart data from budget_graph or analytics
        const budgetsRes = await api.get('/budgets?limit=100');
        const budgets = budgetsRes.data.data.budgets || [];
        
        // Format for revenue chart
        const formattedChartData = budgets.map((budget, index) => ({
          name: `${budget.event_name.substring(0, 8)}...`,
          revenue: budget.achieved_amount || 0,
          profit: Math.max(0, (budget.achieved_amount || 0) * 0.3), // Simplified profit calculation
        }));
        
        setChartData(formattedChartData);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const financialMetrics = summary?.financial_metrics || {};
  const budgetStatus = summary?.budget_status || {};
  const summaryData = summary?.summary || {};

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's your business overview.
        </p>
      </div>

      {/* Key Metrics Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          icon="📊"
          title="Total Budgets"
          value={summaryData.total_budgets || 0}
          subtitle="Active budget items"
          className="bg-white"
        />
        <SummaryCard
          icon="💰"
          title="Total Revenue"
          value={`₹${(financialMetrics.total_revenue || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="From all income budgets"
          className="bg-blue-50 border-l-4 border-blue-500"
        />
        <SummaryCard
          icon="📈"
          title="Total Profit"
          value={`₹${(financialMetrics.total_profit || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Net profit margin"
          className="bg-green-50 border-l-4 border-green-500"
        />
        <SummaryCard
          icon="📉"
          title="Profit Margin"
          value={`${(financialMetrics.profit_margin_percentage || 0).toFixed(2)}%`}
          subtitle="Overall margin"
          className="bg-yellow-50 border-l-4 border-yellow-500"
        />
      </div>

      {/* Budget Status Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          icon="✅"
          title="On Track"
          value={budgetStatus.on_track || 0}
          subtitle="Budgets < 50% used"
          className="bg-green-50"
        />
        <SummaryCard
          icon="⚠️"
          title="Warning"
          value={budgetStatus.warning || 0}
          subtitle="Budgets 50-80% used"
          className="bg-yellow-50"
        />
        <SummaryCard
          icon="🔴"
          title="Critical"
          value={budgetStatus.critical || 0}
          subtitle="Budgets > 80% used"
          className="bg-red-50"
        />
      </div>

      {/* Charts and Alerts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Budget Status Chart - Pie Chart */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Status Distribution</h2>
          <BudgetStatusChart
            onTrack={budgetStatus.on_track || 0}
            warning={budgetStatus.warning || 0}
            critical={budgetStatus.critical || 0}
          />
        </div>

        {/* Revenue & Profit Chart - Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue & Profit Trend</h2>
          <RevenueChart data={chartData} />
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Alerts</h2>
          <AlertsList
            alerts={alerts.slice(0, 5)}
            onMarkAsRead={(alertId) => {
              // Handle mark as read
            }}
          />
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/admin/invoices/create"
              className="flex items-center p-3 hover:bg-blue-50 rounded transition"
            >
              <span className="text-2xl mr-3">📄</span>
              <div>
                <p className="font-semibold text-gray-900">Create Invoice</p>
                <p className="text-sm text-gray-600">New customer invoice</p>
              </div>
            </a>
            <a
              href="/admin/budgets/create"
              className="flex items-center p-3 hover:bg-blue-50 rounded transition"
            >
              <span className="text-2xl mr-3">📊</span>
              <div>
                <p className="font-semibold text-gray-900">New Budget</p>
                <p className="text-sm text-gray-600">Create budget item</p>
              </div>
            </a>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-semibold">Database:</span> Connected
            </p>
            <p>
              <span className="font-semibold">API:</span> Operational
            </p>
            <p>
              <span className="font-semibold">Last Sync:</span> Just now
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Budgets List Page

#### File: `src/pages/admin/BudgetsPage.jsx`

**Purpose**: Display all budgets with filtering, sorting, and status indicators

**Database Fields Displayed**:
- budgets.id
- budgets.event_name
- budgets.type (income/expense)
- budgets.budgeted_amount
- budgets.achieved_amount
- budgets.percentage_achieved
- budgets.start_date, end_date
- budgets.status

**Component Structure**:
```javascript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

export default function BudgetsPage() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [error, setError] = useState('');

  const limit = 10;

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        let url = `/budgets?skip=${skip}&limit=${limit}`;
        if (typeFilter) {
          url += `&type=${typeFilter}`;
        }
        
        const response = await api.get(url);
        setBudgets(response.data.data.budgets || []);
        setTotal(response.data.data.total || 0);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch budgets');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [skip, typeFilter]);

  const getStatusColor = (percentage) => {
    if (percentage < 50) return 'bg-green-50 border-l-4 border-green-500';
    if (percentage < 80) return 'bg-yellow-50 border-l-4 border-yellow-500';
    return 'bg-red-50 border-l-4 border-red-500';
  };

  const getStatusLabel = (percentage) => {
    if (percentage < 50) return 'On Track';
    if (percentage < 80) return 'Warning';
    return 'Critical';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <button
          onClick={() => navigate('/admin/budgets/create')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + New Budget
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Filter by Type
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => { setTypeFilter(''); setSkip(0); }}
            className={`px-4 py-2 rounded transition ${
              typeFilter === '' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setTypeFilter('income'); setSkip(0); }}
            className={`px-4 py-2 rounded transition ${
              typeFilter === 'income' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => { setTypeFilter('expense'); setSkip(0); }}
            className={`px-4 py-2 rounded transition ${
              typeFilter === 'expense' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Budgets Grid */}
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No budgets found</p>
          </div>
        ) : (
          budgets.map((budget) => (
            <div
              key={budget.id}
              onClick={() => navigate(`/admin/budgets/${budget.id}`)}
              className={`p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition ${getStatusColor(
                budget.percentage_achieved
              )}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Event</p>
                  <p className="text-xl font-bold text-gray-900">{budget.event_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <StatusBadge status={budget.type} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Budgeted Amount</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{(budget.budgeted_amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-xl font-bold text-gray-900">
                    {getStatusLabel(budget.percentage_achieved)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Progress</p>
                  <p className="text-sm font-semibold text-gray-700">
                    ₹{(budget.achieved_amount || 0).toLocaleString('en-IN')} / ₹{(budget.budgeted_amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      budget.percentage_achieved < 50 ? 'bg-green-500' :
                      budget.percentage_achieved < 80 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(budget.percentage_achieved, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {budget.percentage_achieved?.toFixed(1) || 0}% of target ({budget.amount_to_achieve > 0 ? `₹${budget.amount_to_achieve.toLocaleString('en-IN')} remaining` : 'Complete'})
                </p>
              </div>

              {/* Date Range */}
              <div className="text-sm text-gray-500">
                {new Date(budget.start_date).toLocaleDateString('en-IN')} - {new Date(budget.end_date).toLocaleDateString('en-IN')}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="mt-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {Math.min(skip + 1, total)}-{Math.min(skip + limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setSkip(Math.max(0, skip - limit))}
              disabled={skip === 0}
              className="px-4 py-2 border rounded disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Previous
            </button>
            <button
              onClick={() => setSkip(skip + limit)}
              disabled={skip + limit >= total}
              className="px-4 py-2 border rounded disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Create Invoice Page

#### File: `src/pages/admin/CreateInvoicePage.jsx`

**Purpose**: Create new customer invoice with line items

**Database Fields**:
- customer_invoices: customer_id, analytics_id, total_amount, status
- invoice_line_items: product_id, quantity, unit_price, tax_amount
- Products: name, category, unit_price, tax_rate

**Component Structure**:
```javascript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customer_id: '',
    analytics_id: '',
    line_items: [
      {
        product_id: '',
        quantity: 1,
        unit_price: 0,
        tax_amount: 0,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, productsRes, analyticsRes] = await Promise.all([
          api.get('/contacts?type=customer&limit=100'),
          api.get('/products?limit=100'),
          api.get('/analytics?limit=100'),
        ]);

        setCustomers(customersRes.data.data.contacts || []);
        setProducts(productsRes.data.data.products || []);
        setAnalytics(analyticsRes.data.data.events || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.line_items];
    
    if (field === 'product_id') {
      const selectedProduct = products.find(p => p.id === parseInt(value));
      if (selectedProduct) {
        newLineItems[index].product_id = value;
        newLineItems[index].unit_price = selectedProduct.unit_price;
        newLineItems[index].tax_amount = 
          newLineItems[index].quantity * selectedProduct.unit_price * (selectedProduct.tax_rate / 100);
      }
    } else if (field === 'quantity') {
      const selectedProduct = products.find(p => p.id === parseInt(newLineItems[index].product_id));
      newLineItems[index].quantity = parseInt(value) || 1;
      if (selectedProduct) {
        newLineItems[index].tax_amount = 
          newLineItems[index].quantity * selectedProduct.unit_price * (selectedProduct.tax_rate / 100);
      }
    } else {
      newLineItems[index][field] = value;
    }

    setFormData({ ...formData, line_items: newLineItems });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      line_items: [
        ...formData.line_items,
        {
          product_id: '',
          quantity: 1,
          unit_price: 0,
          tax_amount: 0,
        },
      ],
    });
  };

  const removeLineItem = (index) => {
    setFormData({
      ...formData,
      line_items: formData.line_items.filter((_, i) => i !== index),
    });
  };

  const calculateTotal = () => {
    return formData.line_items.reduce((total, item) => {
      const itemTotal = (item.quantity * item.unit_price) + item.tax_amount;
      return total + itemTotal;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validate
      if (!formData.customer_id) {
        setError('Please select a customer');
        setSubmitting(false);
        return;
      }

      if (formData.line_items.length === 0 || !formData.line_items[0].product_id) {
        setError('Please add at least one line item');
        setSubmitting(false);
        return;
      }

      const response = await api.post('/invoices', {
        customer_id: parseInt(formData.customer_id),
        analytics_id: formData.analytics_id ? parseInt(formData.analytics_id) : null,
        line_items: formData.line_items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          tax_amount: parseFloat(item.tax_amount),
        })),
      });

      if (response.data.success) {
        navigate(`/admin/invoices/${response.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalAmount = calculateTotal();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Invoice</h1>

      <ErrorAlert error={error} onClose={() => setError('')} />

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
        {/* Customer Section */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select a customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email || 'No email'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Analytics Event (Optional)
              </label>
              <select
                value={formData.analytics_id}
                onChange={(e) => setFormData({ ...formData, analytics_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Auto-assign from rules</option>
                {analytics.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.event_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Line Items Section */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
          
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Product</th>
                  <th className="px-4 py-2 text-center font-semibold">Quantity</th>
                  <th className="px-4 py-2 text-right font-semibold">Unit Price</th>
                  <th className="px-4 py-2 text-right font-semibold">Tax</th>
                  <th className="px-4 py-2 text-right font-semibold">Total</th>
                  <th className="px-4 py-2 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.line_items.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <select
                        value={item.product_id}
                        onChange={(e) => handleLineItemChange(index, 'product_id', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        required
                      >
                        <option value="">Select product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.category})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-center"
                        min="1"
                        required
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      ₹{(item.unit_price || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ₹{(item.tax_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      ₹{((item.quantity * item.unit_price) + item.tax_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={addLineItem}
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
          >
            + Add Line Item
          </button>
        </div>

        {/* Total Section */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex justify-end mb-4">
            <div className="w-full md:w-1/3">
              <div className="flex justify-between mb-2 text-gray-700">
                <span>Subtotal:</span>
                <span>
                  ₹{formData.line_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-4 text-gray-700">
                <span>Tax:</span>
                <span>
                  ₹{formData.line_items.reduce((sum, item) => sum + item.tax_amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 pt-2">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/invoices')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## Chart Components (Using Recharts)

### 1. Budget Status Pie Chart

#### File: `src/components/charts/BudgetStatusChart.jsx`

**Purpose**: Display budget distribution by status (On Track, Warning, Critical)

**Database Fields Used**:
- budgets.percentage_achieved (calculated status)

```javascript
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export default function BudgetStatusChart({ onTrack, warning, critical }) {
  const data = [
    { name: 'On Track', value: onTrack, fill: '#10b981' },
    { name: 'Warning', value: warning, fill: '#f59e0b' },
    { name: 'Critical', value: critical, fill: '#ef4444' },
  ];

  const total = onTrack + warning + critical;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded">
        <p className="text-gray-500 text-center">No budget data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => `${value} budgets`}
          contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => `${value}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### 2. Revenue & Profit Line Chart

#### File: `src/components/charts/RevenueChart.jsx`

**Purpose**: Display revenue and profit trends over time

**Database Fields Used**:
- budgets.achieved_amount
- analytics.profit

```javascript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded">
        <p className="text-gray-500">No data available for chart</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart 
        data={data} 
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          formatter={(value) => `₹${value.toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          contentStyle={{ 
            backgroundColor: '#f9fafb', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          labelFormatter={(label) => `Event: ${label}`}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#2563eb" 
          strokeWidth={2}
          dot={{ fill: '#2563eb', r: 5, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 7 }}
          name="Revenue"
        />
        <Line 
          type="monotone" 
          dataKey="profit" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 7 }}
          name="Profit"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### 3. Budget Progress Bar Chart

#### File: `src/components/charts/BudgetProgressChart.jsx`

**Purpose**: Display budget achievement percentage for each event

**Database Fields Used**:
- budgets.event_name
- budgets.percentage_achieved
- budgets.budgeted_amount
- budgets.achieved_amount

```javascript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function BudgetProgressChart({ budgets }) {
  const getColor = (percentage) => {
    if (percentage < 50) return '#10b981';   // Green - On Track
    if (percentage < 80) return '#f59e0b';   // Yellow - Warning
    return '#ef4444';                        // Red - Critical
  };

  if (!budgets || budgets.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded">
        <p className="text-gray-500">No budget data available</p>
      </div>
    );
  }

  const chartData = budgets.map(budget => ({
    event_name: budget.event_name.substring(0, 12),
    percentage: budget.percentage_achieved || 0,
    full_name: budget.event_name,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart 
        data={chartData} 
        margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="event_name" 
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis 
          domain={[0, 100]}
          label={{ value: 'Budget Used (%)', angle: -90, position: 'insideLeft' }}
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => `${value.toFixed(1)}%`}
          contentStyle={{ 
            backgroundColor: '#f9fafb', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
          labelFormatter={(label) => `Budget: ${label}`}
        />
        <Legend />
        <Bar 
          dataKey="percentage" 
          name="Budget Used (%)" 
          radius={[8, 8, 0, 0]}
        >
          {chartData.map((budget, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getColor(budget.percentage)} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### 4. Invoice Status Donut Chart

#### File: `src/components/charts/InvoiceStatusChart.jsx`

**Purpose**: Display invoice status breakdown (Draft, Posted, Cancelled)

**Database Fields Used**:
- customer_invoices.status

```javascript
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

export default function InvoiceStatusChart({ draft, posted, cancelled }) {
  const data = [
    { name: 'Draft', value: draft, fill: '#f59e0b' },
    { name: 'Posted', value: posted, fill: '#10b981' },
    { name: 'Cancelled', value: cancelled, fill: '#ef4444' },
  ];

  const total = draft + posted + cancelled;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded">
        <p className="text-gray-500">No invoice data</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => `${value} invoices`}
          contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### 5. Monthly Revenue & Expense Comparison

#### File: `src/components/charts/MonthlyComparisonChart.jsx`

**Purpose**: Display monthly revenue vs expense comparison

**Database Fields Used**:
- budgets.type (income/expense)
- budgets.achieved_amount
- budgets.start_date

```javascript
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonthlyComparisonChart({ monthlyData }) {
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded">
        <p className="text-gray-500">No monthly data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart 
        data={monthlyData}
        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
          contentStyle={{ 
            backgroundColor: '#f9fafb', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar 
          dataKey="revenue" 
          fill="#2563eb" 
          name="Revenue"
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="expense" 
          fill="#ef4444" 
          name="Expense"
          radius={[8, 8, 0, 0]}
        />
        <Line 
          type="monotone" 
          dataKey="profit" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Net Profit"
          yAxisId="right"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
```

---



### Reusable Components

#### 1. SummaryCard Component
**File**: `src/components/SummaryCard.jsx`

```javascript
export default function SummaryCard({
  icon = '📊',
  title,
  value,
  subtitle,
  className = '',
}) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-semibold">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-2">{subtitle}</p>}
        </div>
        <span className="text-3xl ml-4">{icon}</span>
      </div>
    </div>
  );
}
```

#### 2. StatusBadge Component
**File**: `src/components/StatusBadge.jsx`

```javascript
export default function StatusBadge({ status, type = 'default' }) {
  const statusStyles = {
    draft: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    posted: 'bg-green-100 text-green-800 border border-green-300',
    cancelled: 'bg-red-100 text-red-800 border border-red-300',
    active: 'bg-blue-100 text-blue-800 border border-blue-300',
    archived: 'bg-gray-100 text-gray-800 border border-gray-300',
    income: 'bg-green-100 text-green-800 border border-green-300',
    expense: 'bg-red-100 text-red-800 border border-red-300',
    admin: 'bg-purple-100 text-purple-800 border border-purple-300',
    portal: 'bg-blue-100 text-blue-800 border border-blue-300',
    'not_paid': 'bg-red-100 text-red-800',
    'partial': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-green-100 text-green-800',
  };

  const style = statusStyles[status] || statusStyles.default;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${style}`}>
      {status?.replace('_', ' ').toUpperCase()}
    </span>
  );
}
```

#### 3. LoadingSpinner Component
**File**: `src/components/LoadingSpinner.jsx`

```javascript
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center p-8 min-h-96">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">{message}</p>
      </div>
    </div>
  );
}
```

#### 4. ErrorAlert Component
**File**: `src/components/ErrorAlert.jsx`

```javascript
export default function ErrorAlert({ error, onClose }) {
  if (!error) return null;

  return (
    <div className="p-4 mb-4 bg-red-100 border-l-4 border-red-500 rounded flex justify-between items-center">
      <div>
        <p className="font-semibold text-red-800">Error</p>
        <p className="text-red-700 text-sm mt-1">{error}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800 font-bold text-xl ml-4"
        >
          ×
        </button>
      )}
    </div>
  );
}
```

---

## API Integration Patterns

### Pattern 1: Fetch & Display Data
```javascript
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/endpoint?skip=0&limit=10');
        setData(response.data.data.items || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Pattern 2: Form Submission
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError('');

  try {
    const response = await api.post('/endpoint', {
      field1: formData.field1,
      field2: formData.field2,
    });

    if (response.data.success) {
      // Handle success
      navigate('/success-page');
    }
  } catch (err) {
    setError(err.response?.data?.error || 'Operation failed');
  } finally {
    setSubmitting(false);
  }
};
```

### Pattern 3: Pagination
```javascript
const [skip, setSkip] = useState(0);
const limit = 10;

useEffect(() => {
  api.get(`/endpoint?skip=${skip}&limit=${limit}`)
    .then(res => {
      setData(res.data.data.items);
      setTotal(res.data.data.total);
    })
    .catch(err => setError(err.message));
}, [skip]);
```

---

## Form Specifications

### Login Form
- Fields: login_id, password
- Validation: Non-empty, login_id 6-12 chars
- Submission: POST /auth/login

### Invoice Form
- Customer Selection (contacts.type='customer')
- Line Items (dynamic)
  - Product selector (products.id)
  - Quantity input
  - Unit Price (auto-populated from products.unit_price)
  - Tax Amount (auto-calculated from quantity × unit_price × product.tax_rate)
- Analytics Event (optional, auto-assigned via rules)
- Submission: POST /invoices

---

## Validation Rules

### Frontend Validation Before API Call
```javascript
const validateForm = () => {
  const errors = [];

  // Login ID
  if (!formData.login_id.trim()) {
    errors.push('Login ID is required');
  } else if (formData.login_id.length < 6 || formData.login_id.length > 12) {
    errors.push('Login ID must be 6-12 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(formData.login_id)) {
    errors.push('Login ID can only contain letters, numbers, and underscores');
  }

  // Password
  if (!formData.password) {
    errors.push('Password is required');
  } else if (formData.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else if (!/[A-Z]/.test(formData.password)) {
    errors.push('Password must contain uppercase letter');
  } else if (!/[a-z]/.test(formData.password)) {
    errors.push('Password must contain lowercase letter');
  } else if (!/[0-9]/.test(formData.password)) {
    errors.push('Password must contain a number');
  } else if (!/[!@#$%^&*]/.test(formData.password)) {
    errors.push('Password must contain special character (!@#$%^&*)');
  }

  return errors;
};
```

---

## Error Handling

### API Error Response Pattern
```javascript
{
  "success": false,
  "error": "Descriptive error message"
}
```

### Frontend Error Handler
```javascript
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    localStorage.clear();
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Forbidden - user doesn't have permission
    return 'You do not have permission to perform this action';
  } else if (error.response?.status === 404) {
    // Not found
    return 'The requested resource was not found';
  } else if (error.response?.status === 400) {
    // Bad request - validation error
    return error.response.data.error || 'Invalid input';
  } else if (error.response?.status === 500) {
    // Server error
    return 'Server error. Please try again later';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};
```

---

## Data Storage & State Management

### localStorage Keys
```javascript
const STORAGE_KEYS = {
  JWT_TOKEN: process.env.REACT_APP_JWT_STORAGE_KEY || 'shivbas_jwt_token',
  REFRESH_TOKEN: process.env.REACT_APP_REFRESH_TOKEN_KEY || 'shivbas_refresh_token',
  USER: process.env.REACT_APP_USER_STORAGE_KEY || 'shivbas_user',
};
```

### User Object Structure (Stored in localStorage)
```javascript
{
  id: 1,
  login_id: 'admin_user',
  email: 'admin@shiv.com',
  name: 'Admin User',
  role: 'admin', // 'admin' or 'portal'
  created_at: '2026-01-31T10:30:00Z',
}
```

### useAuth Hook
```javascript
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(
      process.env.REACT_APP_USER_STORAGE_KEY || 'shivbas_user'
    );
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return { user, loading, logout, isAdmin: user?.role === 'admin' };
}
```

---

## Environment Variables (.env)

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Storage Keys
REACT_APP_JWT_STORAGE_KEY=shivbas_jwt_token
REACT_APP_REFRESH_TOKEN_KEY=shivbas_refresh_token
REACT_APP_USER_STORAGE_KEY=shivbas_user

# App Settings
REACT_APP_PAGE_TITLE=ShivBAS - Budget Analysis System
REACT_APP_DEBUG=false
```

---

## Summary: Field Mapping Reference

Use this when implementing forms and displays:

| Component | Database Table | Key Fields |
|-----------|---|---|
| Login Page | users | login_id, password (validated) |
| Dashboard | Multiple | aggregated metrics |
| Budgets List | budgets | event_name, type, budgeted_amount, achieved_amount, percentage_achieved |
| Create Invoice | customer_invoices, invoice_line_items | customer_id, analytics_id, total_amount |
| Invoice Line Items | invoice_line_items, products | product_id, quantity, unit_price, tax_amount |
| Create Contact | contacts | name, type (customer/vendor), email, phone |
| Create Product | products | name, category, unit_price, tax_rate |
| Record Payment | payments | invoice_id, amount_paid, payment_mode, transaction_id, payment_date |

---

**Document Version**: 1.0  
**Last Updated**: January 31, 2026  
**Status**: Ready for Frontend Development  
**Next Steps**: Begin implementing Login Module and Admin Dashboard with provided specifications
