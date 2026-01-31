# Frontend Integration Guide
## React + Tailwind Implementation Reference

**Target**: Build React components that integrate with ShivBAS API contracts  
**Environment**: React 18+, Tailwind CSS, Axios for HTTP requests  
**Base URL**: `http://localhost:5000/api`

---

## 📋 Setup & Configuration

### 1. Environment Variables (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_JWT_STORAGE_KEY=shivbas_jwt_token
REACT_APP_REFRESH_TOKEN_KEY=shivbas_refresh_token
REACT_APP_USER_STORAGE_KEY=shivbas_user
```

### 2. Axios Instance Setup
```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000,
});

// Add JWT to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(process.env.REACT_APP_JWT_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔐 Authentication Flow

### Login Page Component
```javascript
// src/pages/LoginPage.jsx
import { useState } from 'react';
import api from '../services/api';

export default function LoginPage() {
  const [formData, setFormData] = useState({ login_id: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      
      // Store tokens and user
      localStorage.setItem(
        process.env.REACT_APP_JWT_STORAGE_KEY,
        response.data.data.token
      );
      localStorage.setItem(
        process.env.REACT_APP_REFRESH_TOKEN_KEY,
        response.data.data.refreshToken
      );
      localStorage.setItem(
        process.env.REACT_APP_USER_STORAGE_KEY,
        JSON.stringify(response.data.data.user)
      );

      // Navigate to dashboard
      window.location.href = response.data.data.user.role === 'admin' 
        ? '/admin/dashboard' 
        : '/portal/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6">ShivBAS Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Login ID"
            value={formData.login_id}
            onChange={(e) => setFormData({ ...formData, login_id: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full mb-6 p-2 border rounded"
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Protected Route Wrapper
```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ element, requiredRole = null }) {
  const token = localStorage.getItem(process.env.REACT_APP_JWT_STORAGE_KEY);
  const user = JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_STORAGE_KEY) || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return element;
}
```

---

## 📊 Dashboard Components

### Summary Card Component
```javascript
// src/components/SummaryCard.jsx
export default function SummaryCard({ title, value, subtitle, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-2">{subtitle}</p>}
    </div>
  );
}
```

### Dashboard Overview
```javascript
// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import SummaryCard from '../components/SummaryCard';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setSummary(response.data.data);
      } catch (error) {
        console.error('Failed to fetch summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard 
          title="Total Budgets" 
          value={summary?.summary.total_budgets || 0}
        />
        <SummaryCard 
          title="Total Revenue" 
          value={`₹${(summary?.financial_metrics.total_revenue || 0).toLocaleString()}`}
        />
        <SummaryCard 
          title="Total Profit" 
          value={`₹${(summary?.financial_metrics.total_profit || 0).toLocaleString()}`}
          className="bg-green-50"
        />
        <SummaryCard 
          title="Profit Margin" 
          value={`${summary?.financial_metrics.profit_margin_percentage || 0}%`}
        />
      </div>

      {/* Budget Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="On Track" 
          value={summary?.budget_status.on_track || 0}
          className="border-l-4 border-green-500"
        />
        <SummaryCard 
          title="Warning" 
          value={summary?.budget_status.warning || 0}
          className="border-l-4 border-yellow-500"
        />
        <SummaryCard 
          title="Critical" 
          value={summary?.budget_status.critical || 0}
          className="border-l-4 border-red-500"
        />
      </div>
    </div>
  );
}
```

---

## 📝 Forms & Data Entry

### Invoice Creation Form
```javascript
// src/pages/CreateInvoicePage.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function CreateInvoicePage() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    line_items: [{ product_id: '', quantity: 1, unit_price: 0 }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch customers and products
    const fetchData = async () => {
      try {
        const [customersRes, productsRes] = await Promise.all([
          api.get('/contacts?type=customer'),
          api.get('/products'),
        ]);
        setCustomers(customersRes.data.data.contacts);
        setProducts(productsRes.data.data.products);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  const handleAddLineItem = () => {
    setFormData({
      ...formData,
      line_items: [...formData.line_items, { product_id: '', quantity: 1, unit_price: 0 }],
    });
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.line_items];
    newLineItems[index][field] = value;
    setFormData({ ...formData, line_items: newLineItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/invoices', formData);
      alert('Invoice created successfully!');
      // Redirect to invoice details
      window.location.href = `/invoices/${response.data.data.id}`;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Invoice</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        {/* Customer Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Customer</label>
          <select
            value={formData.customer_id}
            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Line Items */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-4">Line Items</label>
          {formData.line_items.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 mb-4">
              <select
                value={item.product_id}
                onChange={(e) => handleLineItemChange(index, 'product_id', e.target.value)}
                className="p-2 border rounded"
                required
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                className="p-2 border rounded"
                placeholder="Quantity"
                min="1"
                required
              />
              <input
                type="number"
                value={item.unit_price}
                onChange={(e) => handleLineItemChange(index, 'unit_price', e.target.value)}
                className="p-2 border rounded"
                placeholder="Unit Price"
                min="0"
                required
              />
              <input
                type="text"
                value={`₹${(item.quantity * item.unit_price).toLocaleString()}`}
                className="p-2 border rounded bg-gray-100"
                disabled
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddLineItem}
            className="text-blue-600 hover:text-blue-800 font-bold"
          >
            + Add Line Item
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Invoice'}
        </button>
      </form>
    </div>
  );
}
```

---

## 📋 List Views with Pagination

### Invoices List Component
```javascript
// src/pages/InvoicesListPage.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get(`/invoices?skip=${skip}&limit=${limit}`);
        setInvoices(response.data.data.invoices);
        setTotal(response.data.data.total);
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [skip]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <a
          href="/invoices/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Invoice
        </a>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-4 text-left">Invoice ID</th>
            <th className="p-4 text-left">Customer</th>
            <th className="p-4 text-left">Amount</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Payment Status</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b hover:bg-gray-50">
              <td className="p-4">#{inv.id}</td>
              <td className="p-4">{inv.customer_name}</td>
              <td className="p-4">₹{inv.total_amount.toLocaleString()}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded text-sm font-bold ${
                  inv.status === 'posted' ? 'bg-green-100 text-green-800' :
                  inv.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {inv.status}
                </span>
              </td>
              <td className="p-4">{inv.payment_status}</td>
              <td className="p-4">
                <a href={`/invoices/${inv.id}`} className="text-blue-600 hover:underline">
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <p className="text-gray-600">
          Showing {skip + 1}-{Math.min(skip + limit, total)} of {total}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0}
            className="px-4 py-2 border rounded disabled:text-gray-400"
          >
            Previous
          </button>
          <button
            onClick={() => setSkip(skip + limit)}
            disabled={skip + limit >= total}
            className="px-4 py-2 border rounded disabled:text-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Reusable Components

### Status Badge
```javascript
// src/components/StatusBadge.jsx
export default function StatusBadge({ status, type = 'status' }) {
  const statusStyles = {
    draft: 'bg-yellow-100 text-yellow-800',
    posted: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    partial: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    not_paid: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`px-3 py-1 rounded text-sm font-bold ${statusStyles[status] || 'bg-gray-100'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}
```

### Loading Spinner
```javascript
// src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div>
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
```

### Error Alert
```javascript
// src/components/ErrorAlert.jsx
export default function ErrorAlert({ error, onClose }) {
  if (!error) return null;

  return (
    <div className="p-4 mb-4 bg-red-100 border border-red-400 rounded flex justify-between items-center">
      <span className="text-red-800">{error}</span>
      {onClose && (
        <button onClick={onClose} className="text-red-600 hover:text-red-800">
          ✕
        </button>
      )}
    </div>
  );
}
```

---

## 🔄 Custom Hooks

### useApi Hook
```javascript
// src/hooks/useApi.js
import { useEffect, useState } from 'react';
import api from '../services/api';

export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(url, options);
        setData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}
```

### useAuth Hook
```javascript
// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(process.env.REACT_APP_USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  return { user, loading };
}
```

---

## 📱 Responsive Layout

### Main Layout Component
```javascript
// src/layouts/MainLayout.jsx
import { useState } from 'react';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">ShivBAS</h1>
        </div>
        <nav className="mt-6">
          <a href="/dashboard" className="block px-6 py-3 hover:bg-gray-800">Dashboard</a>
          <a href="/budgets" className="block px-6 py-3 hover:bg-gray-800">Budgets</a>
          <a href="/invoices" className="block px-6 py-3 hover:bg-gray-800">Invoices</a>
          <a href="/bills" className="block px-6 py-3 hover:bg-gray-800">Bills</a>
          <a href="/payments" className="block px-6 py-3 hover:bg-gray-800">Payments</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              ☰
            </button>
            <div className="text-gray-600">
              <a href="/logout" className="hover:text-gray-900">Logout</a>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 Common Integration Patterns

### Pattern 1: Fetch & Display Data
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.get('/endpoint')
    .then(res => setData(res.data.data))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);

if (loading) return <LoadingSpinner />;
return <div>{/* render data */}</div>;
```

### Pattern 2: Form Submit
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await api.post('/endpoint', formData);
    alert('Success!');
  } catch (err) {
    setError(err.response?.data?.error);
  }
};
```

### Pattern 3: Pagination
```javascript
const [skip, setSkip] = useState(0);
const limit = 10;

useEffect(() => {
  api.get(`/endpoint?skip=${skip}&limit=${limit}`)
    .then(/* ... */);
}, [skip]);
```

---

**Last Updated**: 2026-01-31  
**Ready for**: React Frontend Development
