import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

const CustomerOrders = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [saleOrders, setSaleOrders] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('sale');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch sale orders
            let saleUrl = `${API_BASE}/customer-portal/sale-orders`;
            if (filterStatus !== 'all') saleUrl += `?status=${filterStatus}`;
            const saleRes = await fetch(saleUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const saleData = await saleRes.json();
            if (saleData.success) setSaleOrders(saleData.data);

            // Fetch purchase orders
            let poUrl = `${API_BASE}/customer-portal/purchase-orders`;
            if (filterStatus !== 'all') poUrl += `?status=${filterStatus}`;
            const poRes = await fetch(poUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const poData = await poRes.json();
            if (poData.success) setPurchaseOrders(poData.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = async (orderId, type) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = type === 'sale' ? 'sale-orders' : 'purchase-orders';
            const response = await fetch(`${API_BASE}/customer-portal/${endpoint}/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSelectedOrder({ ...data.data, type });
                setShowViewModal(true);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        }
    };

    const handleDownloadPDF = async (order) => {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = document.getElementById('order-print-area');
        const opt = {
            margin: 10,
            filename: `${order.type === 'sale' ? 'SaleOrder' : 'PurchaseOrder'}_${order.order_number || order.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const orders = activeTab === 'sale' ? saleOrders : purchaseOrders;

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
                            <Link to="/customer/dashboard" className="text-gray-600 hover:text-primary-600">Dashboard</Link>
                            <Link to="/customer/invoices" className="text-gray-600 hover:text-primary-600">My Invoices</Link>
                            <Link to="/customer/orders" className="text-primary-600 font-medium">My Orders</Link>
                            <div className="flex items-center ml-6">
                                <span className="text-sm text-gray-600 mr-4">Welcome, {user?.name}</span>
                                <button onClick={handleLogout} className="text-red-600 hover:text-red-800 text-sm font-medium">Logout</button>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
                        <p className="text-gray-600 mt-1">View your sale orders and purchase orders</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('sale')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                                    activeTab === 'sale'
                                        ? 'border-primary-600 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Sale Orders ({saleOrders.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('purchase')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                                    activeTab === 'purchase'
                                        ? 'border-primary-600 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Purchase Orders ({purchaseOrders.length})
                            </button>
                        </nav>
                    </div>

                    {/* Filter */}
                    <div className="p-4 flex gap-4">
                        {['all', 'draft', 'confirmed', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg font-medium ${
                                    filterStatus === status
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No {activeTab === 'sale' ? 'sale' : 'purchase'} orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {order.order_number || `${activeTab === 'sale' ? 'SO' : 'PO'}-${String(order.id).padStart(5, '0')}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.order_date || order.created_at).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.reference || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            ₹{parseFloat(order.total_amount || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded ${
                                                order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleViewOrder(order.id, activeTab)}
                                                className="text-primary-600 hover:text-primary-800 font-medium"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* View Order Modal */}
            {showViewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {selectedOrder.type === 'sale' ? 'Sale Order' : 'Purchase Order'} Details
                                </h2>
                                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => handleDownloadPDF(selectedOrder)}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </button>
                            </div>

                            {/* Order Content */}
                            <div id="order-print-area" className="bg-white border border-gray-200 rounded-lg p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">ShivBAS</h1>
                                            <p className="text-sm text-gray-500">Budget & Analytics System</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {selectedOrder.type === 'sale' ? 'SALE ORDER' : 'PURCHASE ORDER'}
                                        </h2>
                                        <p className="text-gray-600">{selectedOrder.order_number || `${selectedOrder.type === 'sale' ? 'SO' : 'PO'}-${String(selectedOrder.id).padStart(5, '0')}`}</p>
                                        <p className="text-sm text-gray-500">{new Date(selectedOrder.order_date || selectedOrder.created_at).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>

                                {/* Customer/Vendor Info */}
                                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">{selectedOrder.type === 'sale' ? 'Customer' : 'Vendor'}:</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.customer_name || selectedOrder.vendor_name}</p>
                                    {selectedOrder.customer_email && <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>}
                                    {selectedOrder.customer_phone && <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>}
                                    {selectedOrder.reference && <p className="text-sm text-gray-600 mt-2">Ref: {selectedOrder.reference}</p>}
                                </div>

                                {/* Line Items */}
                                <table className="w-full mb-8">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-2 text-gray-600">#</th>
                                            <th className="text-left py-2 text-gray-600">Product</th>
                                            <th className="text-center py-2 text-gray-600">Qty</th>
                                            <th className="text-right py-2 text-gray-600">Unit Price</th>
                                            <th className="text-right py-2 text-gray-600">Tax</th>
                                            <th className="text-right py-2 text-gray-600">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedOrder.items || []).map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100">
                                                <td className="py-3">{index + 1}</td>
                                                <td className="py-3">{item.product_name || item.product_name_from_master || 'Product'}</td>
                                                <td className="py-3 text-center">{item.quantity}</td>
                                                <td className="py-3 text-right">₹{parseFloat(item.unit_price).toLocaleString('en-IN')}</td>
                                                <td className="py-3 text-right">₹{parseFloat(item.tax_amount || 0).toLocaleString('en-IN')}</td>
                                                <td className="py-3 text-right font-medium">
                                                    ₹{((item.quantity * parseFloat(item.unit_price)) + parseFloat(item.tax_amount || 0)).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Total */}
                                <div className="flex justify-end">
                                    <div className="w-64">
                                        <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-200">
                                            <span>Total</span>
                                            <span className="text-primary-600">₹{parseFloat(selectedOrder.total_amount || 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-600">Status</span>
                                            <span className={`px-2 py-1 text-xs rounded ${
                                                selectedOrder.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                selectedOrder.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {selectedOrder.notes && (
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500">Notes:</p>
                                        <p className="text-gray-700">{selectedOrder.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerOrders;
