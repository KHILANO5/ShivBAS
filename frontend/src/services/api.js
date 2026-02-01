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
            // Don't redirect if it's a login or register endpoint (user is trying to authenticate)
            const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                                   error.config?.url?.includes('/auth/register');
            
            if (!isAuthEndpoint) {
                // Token expired or invalid on protected routes
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
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
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.post('/auth/change-password', data),
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
    update: (id, data) => api.put(`/products/${id}`, data),
};

// Contacts APIs
export const contactsAPI = {
    getAll: (params) => api.get('/contacts', { params }),
    getById: (id) => api.get(`/contacts/${id}`),
    create: (data) => api.post('/contacts', data),
    update: (id, data) => api.put(`/contacts/${id}`, data),
    delete: (id) => api.delete(`/contacts/${id}`),
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

// Revised Budgets APIs
export const revisedBudgetsAPI = {
    getAll: (params) => api.get('/revised-budgets', { params }),
    getById: (id) => api.get(`/revised-budgets/${id}`),
    create: (data) => api.post('/revised-budgets', data),
    update: (id, data) => api.put(`/revised-budgets/${id}`, data),
    delete: (id) => api.delete(`/revised-budgets/${id}`),
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

// Purchase Orders APIs
export const purchaseOrdersAPI = {
    getAll: (params) => api.get('/purchase-orders', { params }),
    getById: (id) => api.get(`/purchase-orders/${id}`),
    create: (data) => api.post('/purchase-orders', data),
    update: (id, data) => api.put(`/purchase-orders/${id}`, data),
    delete: (id) => api.delete(`/purchase-orders/${id}`),
};

// Sale Orders APIs
export const saleOrdersAPI = {
    getAll: (params) => api.get('/sale-orders', { params }),
    getById: (id) => api.get(`/sale-orders/${id}`),
    create: (data) => api.post('/sale-orders', data),
    update: (id, data) => api.put(`/sale-orders/${id}`, data),
    delete: (id) => api.delete(`/sale-orders/${id}`),
};

export default api;
