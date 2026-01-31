import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Authentication APIs
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Analytics APIs
export const analyticsAPI = {
    getAll: (params) => api.get('/analytics', { params }),
    getById: (id) => api.get(`/analytics/${id}`),
    create: (data) => api.post('/analytics', data),
    update: (id, data) => api.put(`/analytics/${id}`, data),
    delete: (id) => api.delete(`/analytics/${id}`),
};

// Products APIs
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
};

// Contacts APIs
export const contactsAPI = {
    getAll: (params) => api.get('/contacts', { params }),
    getById: (id) => api.get(`/contacts/${id}`),
    create: (data) => api.post('/contacts', data),
};

// Partners APIs
export const partnersAPI = {
    getAll: (params) => api.get('/partners', { params }),
};

// Budgets APIs
export const budgetsAPI = {
    getAll: (params) => api.get('/budgets', { params }),
    getById: (id) => api.get(`/budgets/${id}`),
    create: (data) => api.post('/budgets', data),
    update: (id, data) => api.put(`/budgets/${id}`, data),
    delete: (id) => api.delete(`/budgets/${id}`),
    getRevisions: (id) => api.get(`/budgets/${id}/revisions`),
    getAlerts: () => api.get('/budgets/alerts'),
};

// Transactions APIs
export const transactionsAPI = {
    getAll: (params) => api.get('/transactions', { params }),
    getById: (id) => api.get(`/transactions/${id}`),
    create: (data) => api.post('/transactions', data),
    update: (id, data) => api.put(`/transactions/${id}`, data),
    delete: (id) => api.delete(`/transactions/${id}`),
    approve: (id) => api.post(`/transactions/${id}/approve`),
};

// Invoices APIs
export const invoicesAPI = {
    getAll: (params) => api.get('/transactions', { params: { ...params, type: 'invoice' } }),
    getById: (id) => api.get(`/transactions/${id}`),
    create: (data) => api.post('/transactions', { ...data, transaction_type: 'invoice' }),
};

// Bills APIs
export const billsAPI = {
    getAll: (params) => api.get('/transactions', { params: { ...params, type: 'bill' } }),
    getById: (id) => api.get(`/transactions/${id}`),
    create: (data) => api.post('/transactions', { ...data, transaction_type: 'bill' }),
};

// Payments APIs
export const paymentsAPI = {
    getAll: (params) => api.get('/payments', { params }),
    getById: (id) => api.get(`/payments/${id}`),
    create: (data) => api.post('/payments', data),
    getTransactionPayments: (transactionId) => api.get(`/payments/transaction/${transactionId}`),
};

// Dashboard APIs
export const dashboardAPI = {
    getSummary: () => api.get('/dashboard/summary'),
    getBudgetVsActual: (params) => api.get('/dashboard/budget-vs-actual', { params }),
};

export default api;
