import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalInvoices: 0,
        pendingAmount: 0,
        paidAmount: 0,
        totalOrders: 0,
        recentInvoices: [],
        recentOrders: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/customer-portal/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setDashboardData(data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h1 className="text-xl font-bold text-gray-900">ShivBAS</h1>
                                <p className="text-xs text-gray-500">Customer Portal</p>
                            </div>
                        </div>
                        <nav className="flex items-center space-x-6">
                            <Link to="/customer/dashboard" className="text-primary-600 font-medium">Dashboard</Link>
                            <Link to="/customer/invoices" className="text-gray-600 hover:text-primary-600">My Invoices</Link>
                            <Link to="/customer/orders" className="text-gray-600 hover:text-primary-600">My Orders</Link>
                            <div className="flex items-center ml-6">
                                <span className="text-sm text-gray-600 mr-4">Welcome, {user?.name}</span>
                                <button onClick={handleLogout} className="text-red-600 hover:text-red-800 text-sm font-medium">
                                    Logout
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
                    <p className="text-gray-600 mt-1">Here's an overview of your account</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalInvoices}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                                <p className="text-2xl font-bold text-yellow-600">₹{dashboardData.pendingAmount.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Amount Paid</p>
                                <p className="text-2xl font-bold text-green-600">₹{dashboardData.paidAmount.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalOrders}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Invoices */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
                                <Link to="/customer/invoices" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                                    View All →
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {dashboardData.recentInvoices.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No invoices yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {dashboardData.recentInvoices.map(invoice => (
                                        <div key={invoice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">INV-{String(invoice.id).padStart(5, '0')}</p>
                                                <p className="text-sm text-gray-500">{new Date(invoice.created_at).toLocaleDateString('en-IN')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">₹{parseFloat(invoice.total_amount).toLocaleString('en-IN')}</p>
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    invoice.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    invoice.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {invoice.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                                <Link to="/customer/orders" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                                    View All →
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {dashboardData.recentOrders.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No orders yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {dashboardData.recentOrders.map(order => (
                                        <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{order.order_number}</p>
                                                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/customer/invoices" className="inline-flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View All Invoices
                        </Link>
                        <Link to="/customer/orders" className="inline-flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            View All Orders
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomerDashboard;
