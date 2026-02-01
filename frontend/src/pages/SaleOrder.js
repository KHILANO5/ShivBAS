import React, { useState, useEffect, useCallback, useRef } from 'react';
import { contactsAPI, productsAPI } from '../services/api';
import api from '../services/api';
import html2pdf from 'html2pdf.js';

// Sale Orders API
const saleOrdersAPI = {
    getAll: (params) => api.get('/sale-orders', { params }),
    getById: (id) => api.get(`/sale-orders/${id}`),
    create: (data) => api.post('/sale-orders', data),
    update: (id, data) => api.put(`/sale-orders/${id}`, data),
    updateStatus: (id, status) => api.patch(`/sale-orders/${id}/status`, { status }),
    delete: (id) => api.delete(`/sale-orders/${id}`),
};

const SaleOrder = () => {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printOrder, setPrintOrder] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const printRef = useRef();

    const [formData, setFormData] = useState({
        customer_id: '',
        order_date: new Date().toISOString().split('T')[0],
        reference: '',
        status: 'draft',
        notes: ''
    });

    const [lineItems, setLineItems] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const ordersRes = await saleOrdersAPI.getAll({ status: statusFilter, search: searchTerm });
            setOrders(ordersRes.data.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
        
        try {
            const contactsRes = await contactsAPI.getAll();
            const contactsList = contactsRes.data.data || contactsRes.data || [];
            setCustomers(contactsList);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
        
        try {
            const productsRes = await productsAPI.getAll();
            setProducts(productsRes.data.data || productsRes.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
        
        setLoading(false);
    }, [statusFilter, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addLineItem = () => {
        setLineItems(prev => [...prev, {
            id: Date.now(),
            product_id: '',
            product_name: '',
            quantity: 1,
            unit_price: 0,
            tax_rate: 0,
            amount: 0
        }]);
    };

    const updateLineItem = (id, field, value) => {
        setLineItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                
                if (field === 'product_id') {
                    const product = products.find(p => p.id === parseInt(value));
                    if (product) {
                        updated.product_name = product.name;
                        updated.unit_price = parseFloat(product.unit_price || 0);
                        updated.tax_rate = parseFloat(product.tax_rate || 0);
                    }
                }
                
                const qty = parseFloat(updated.quantity) || 0;
                const price = parseFloat(updated.unit_price) || 0;
                updated.amount = qty * price;
                
                return updated;
            }
            return item;
        }));
    };

    const removeLineItem = (id) => {
        setLineItems(prev => prev.filter(item => item.id !== id));
    };

    const calculateSubtotal = () => lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const calculateTax = () => lineItems.reduce((sum, item) => sum + ((parseFloat(item.amount) || 0) * (parseFloat(item.tax_rate) || 0) / 100), 0);
    const calculateTotal = () => calculateSubtotal() + calculateTax();

    const openCreateModal = () => {
        setEditingOrder(null);
        setFormData({
            customer_id: '',
            order_date: new Date().toISOString().split('T')[0],
            reference: '',
            status: 'draft',
            notes: ''
        });
        setLineItems([{ id: Date.now(), product_id: '', product_name: '', quantity: 1, unit_price: 0, tax_rate: 0, amount: 0 }]);
        setShowModal(true);
    };

    const openEditModal = async (order) => {
        try {
            const response = await saleOrdersAPI.getById(order.id);
            const fullOrder = response.data.data;
            
            setEditingOrder(fullOrder);
            setFormData({
                customer_id: fullOrder.customer_id || '',
                order_date: fullOrder.order_date ? new Date(fullOrder.order_date).toISOString().split('T')[0] : '',
                reference: fullOrder.reference || '',
                status: fullOrder.status,
                notes: fullOrder.notes || ''
            });
            
            if (fullOrder.items && fullOrder.items.length > 0) {
                setLineItems(fullOrder.items.map(item => ({
                    id: item.id || Date.now(),
                    product_id: item.product_id || '',
                    product_name: item.product_name || '',
                    quantity: item.quantity || 1,
                    unit_price: parseFloat(item.unit_price) || 0,
                    tax_rate: parseFloat(item.tax_rate) || 0,
                    amount: parseFloat(item.amount) || 0
                })));
            } else {
                setLineItems([]);
            }
            
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
            alert('Error loading order details');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.customer_id) {
            alert('Please select a customer');
            return;
        }
        
        if (lineItems.length === 0 || !lineItems.some(item => item.product_id)) {
            alert('Please add at least one product');
            return;
        }
        
        try {
            const payload = { 
                ...formData, 
                total_amount: calculateTotal(), 
                items: lineItems.filter(item => item.product_id) 
            };
            
            if (editingOrder) {
                await saleOrdersAPI.update(editingOrder.id, payload);
            } else {
                await saleOrdersAPI.create(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Error saving sale order');
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await saleOrdersAPI.updateStatus(orderId, newStatus);
            fetchData();
            setShowModal(false);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                await saleOrdersAPI.delete(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting order:', error);
            }
        }
    };

    const openPrintModal = async (order) => {
        try {
            const response = await saleOrdersAPI.getById(order.id);
            setPrintOrder(response.data.data);
            setShowPrintModal(true);
        } catch (error) {
            console.error('Error fetching order for print:', error);
        }
    };

    const handlePrint = () => {
        const element = printRef.current;
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `SaleOrder_${printOrder?.order_number || 'document'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
    };

    const handlePrintPreview = () => {
        const printContent = printRef.current;
        const windowPrint = window.open('', '', 'width=800,height=600');
        
        windowPrint.document.write(`
            <html>
            <head>
                <title>Sale Order - ${printOrder?.order_number}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                    .header h1 { color: #0ea5e9; margin: 0; font-size: 28px; }
                    .header h2 { margin: 10px 0 0 0; color: #333; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                    .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; }
                    .info-box h3 { margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase; }
                    .info-box p { margin: 5px 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #0ea5e9; color: white; padding: 12px; text-align: left; }
                    td { padding: 10px; border-bottom: 1px solid #ddd; }
                    .totals { margin-top: 20px; text-align: right; }
                    .totals p { margin: 5px 0; }
                    .totals .grand-total { font-size: 20px; font-weight: bold; color: #0ea5e9; }
                    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
                    .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; }
                    .status-draft { background: #e5e7eb; color: #374151; }
                    .status-confirmed { background: #d1fae5; color: #065f46; }
                    .status-cancelled { background: #fee2e2; color: #991b1b; }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>ShivBAS - Budget Analytics System | Generated on ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `);
        
        windowPrint.document.close();
        windowPrint.focus();
        windowPrint.print();
        windowPrint.close();
    };

    const getStatusBadge = (status) => {
        const styles = { 
            draft: 'bg-gray-100 text-gray-800', 
            confirmed: 'bg-green-100 text-green-800', 
            cancelled: 'bg-red-100 text-red-800' 
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || styles.draft}`}>{status}</span>;
    };

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN') : '-';
    const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading sale orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Sale Orders</h1>
                        <p className="mt-2 text-sm text-gray-600">Manage customer sales orders</p>
                    </div>
                    <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Order
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SO Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p>No sale orders found</p>
                                        <button onClick={openCreateModal} className="mt-4 text-primary-600 hover:text-primary-800 font-medium">
                                            Create your first order
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="text-primary-600 font-medium cursor-pointer hover:underline" onClick={() => openPrintModal(order)}>
                                                {order.order_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{order.customer_name || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.order_date)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(order.total_amount)}</td>
                                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                            <button onClick={() => openPrintModal(order)} className="text-gray-600 hover:text-gray-900" title="Print">
                                                <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => openEditModal(order)} className="text-primary-600 hover:text-primary-900">Edit</button>
                                            <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                            <div className="flex items-center gap-3">
                                <span className="bg-primary-600 text-white px-3 py-1 rounded text-sm font-medium">
                                    {editingOrder ? 'EDIT ORDER' : 'NEW ORDER'}
                                </span>
                                <span className="text-gray-500">{formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}</span>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SO Number</label>
                                    <input
                                        type="text"
                                        value={editingOrder?.order_number || 'Auto Generated'}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                                    <input
                                        type="date"
                                        name="order_date"
                                        value={formData.order_date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                                    <select
                                        name="customer_id"
                                        value={formData.customer_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        required
                                    >
                                        <option value="">Select Customer</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>{customer.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                                    <input
                                        type="text"
                                        name="reference"
                                        value={formData.reference}
                                        onChange={handleInputChange}
                                        placeholder="e.g. PO-1234"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex gap-2">
                                    {editingOrder && editingOrder.status === 'draft' && (
                                        <button
                                            type="button"
                                            onClick={() => handleStatusChange(editingOrder.id, 'confirmed')}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                                        >
                                            Confirm Order
                                        </button>
                                    )}
                                    {editingOrder && (
                                        <button type="button" onClick={() => openPrintModal(editingOrder)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                                            Print
                                        </button>
                                    )}
                                    <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                                        Email
                                    </button>
                                    {editingOrder && editingOrder.status !== 'cancelled' && (
                                        <button
                                            type="button"
                                            onClick={() => handleStatusChange(editingOrder.id, 'cancelled')}
                                            className="text-red-600 px-4 py-2 rounded-lg hover:bg-red-50"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                                
                                {/* Status Toggle */}
                                <div className="flex rounded-lg overflow-hidden border border-gray-300">
                                    {['draft', 'confirmed', 'cancelled'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                                            className={`px-4 py-2 text-sm font-medium ${formData.status === s 
                                                ? s === 'draft' ? 'bg-primary-600 text-white' 
                                                : s === 'confirmed' ? 'bg-green-600 text-white' 
                                                : 'bg-red-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">Qty</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Unit Price</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Total</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {lineItems.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={item.product_id}
                                                        onChange={(e) => updateLineItem(item.id, 'product_id', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    >
                                                        <option value="">Select Product...</option>
                                                        {products.map((product) => (
                                                            <option key={product.id} value={product.id}>
                                                                {product.name} (₹{parseFloat(product.unit_price).toLocaleString()})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:ring-2 focus:ring-primary-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-900">
                                                    {formatCurrency(item.unit_price)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                    {formatCurrency(item.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLineItem(item.id)}
                                                        className="text-gray-400 hover:text-red-600"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {/* Add Line Item Button */}
                                <div className="px-4 py-3 bg-gray-50 border-t">
                                    <button
                                        type="button"
                                        onClick={addLineItem}
                                        className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        ADD LINE ITEM
                                    </button>
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end mb-6">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax:</span>
                                        <span className="font-medium">{formatCurrency(calculateTax())}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Grand Total:</span>
                                        <span className="text-primary-600">{formatCurrency(calculateTotal())}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="2"
                                    placeholder="Additional notes..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                >
                                    Save Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Print Modal */}
            {showPrintModal && printOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        {/* Print Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                            <h3 className="text-lg font-semibold">Print Preview - {printOrder.order_number}</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </button>
                                <button
                                    onClick={handlePrintPreview}
                                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print
                                </button>
                                <button onClick={() => setShowPrintModal(false)} className="text-gray-400 hover:text-gray-600 px-4 py-2">
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Print Content */}
                        <div ref={printRef} className="p-8 bg-white">
                            {/* Company Header */}
                            <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '16px', marginBottom: '24px' }}>
                                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0ea5e9', margin: 0 }}>ShivBAS</h1>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', marginTop: '8px' }}>SALE ORDER</h2>
                            </div>

                            {/* Order Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                                    <h3 style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Order Details</h3>
                                    <p style={{ fontSize: '18px', fontWeight: '600' }}>{printOrder.order_number}</p>
                                    <p style={{ color: '#4b5563' }}>Date: {formatDate(printOrder.order_date)}</p>
                                    {printOrder.reference && <p style={{ color: '#4b5563' }}>Ref: {printOrder.reference}</p>}
                                    <p style={{ marginTop: '8px' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            borderRadius: '9999px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            backgroundColor: printOrder.status === 'confirmed' ? '#d1fae5' : printOrder.status === 'cancelled' ? '#fee2e2' : '#e5e7eb',
                                            color: printOrder.status === 'confirmed' ? '#065f46' : printOrder.status === 'cancelled' ? '#991b1b' : '#374151'
                                        }}>
                                            {printOrder.status?.toUpperCase()}
                                        </span>
                                    </p>
                                </div>
                                <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                                    <h3 style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Customer</h3>
                                    <p style={{ fontSize: '18px', fontWeight: '600' }}>{printOrder.customer_name || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#0ea5e9' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Sr.</th>
                                        <th style={{ padding: '12px', textAlign: 'left', color: 'white', fontWeight: '600' }}>Product</th>
                                        <th style={{ padding: '12px', textAlign: 'center', color: 'white', fontWeight: '600' }}>Qty</th>
                                        <th style={{ padding: '12px', textAlign: 'right', color: 'white', fontWeight: '600' }}>Unit Price</th>
                                        <th style={{ padding: '12px', textAlign: 'right', color: 'white', fontWeight: '600' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {printOrder.items?.map((item, index) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '12px' }}>{index + 1}</td>
                                            <td style={{ padding: '12px' }}>{item.product_name}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(item.amount)}</td>
                                        </tr>
                                    )) || (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>No items</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div style={{ width: '250px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #333' }}>
                                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Grand Total:</span>
                                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0ea5e9' }}>{formatCurrency(printOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {printOrder.notes && (
                                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>Notes:</h3>
                                    <p style={{ color: '#374151' }}>{printOrder.notes}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div style={{ marginTop: '40px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                                <p>Thank you for your business!</p>
                                <p style={{ marginTop: '4px' }}>ShivBAS - Budget Analytics System | Generated on {new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SaleOrder;
