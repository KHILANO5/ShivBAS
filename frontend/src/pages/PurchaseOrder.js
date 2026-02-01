import React, { useState, useEffect, useCallback } from 'react';
import { purchaseOrdersAPI, contactsAPI, productsAPI } from '../services/api';

const PurchaseOrder = () => {
    const [orders, setOrders] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [formData, setFormData] = useState({
        vendor_id: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_date: '',
        status: 'draft',
        notes: ''
    });

    const [lineItems, setLineItems] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [ordersRes, vendorsRes, productsRes] = await Promise.all([
                purchaseOrdersAPI.getAll({ status: statusFilter, search: searchTerm }),
                contactsAPI.getAll(),
                productsAPI.getAll()
            ]);
            setOrders(ordersRes.data.data || []);
            setVendors(vendorsRes.data.data || []);
            setProducts(productsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Line Items Management
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
                
                // Auto-fill product details when product is selected
                if (field === 'product_id') {
                    const product = products.find(p => p.id === parseInt(value));
                    if (product) {
                        updated.product_name = product.name;
                        updated.unit_price = parseFloat(product.unit_price || 0);
                        updated.tax_rate = parseFloat(product.tax_rate || 0);
                    }
                }
                
                // Calculate amount
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

    // Calculate totals
    const calculateSubtotal = () => {
        return lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    };

    const calculateTax = () => {
        return lineItems.reduce((sum, item) => {
            const amount = parseFloat(item.amount) || 0;
            const taxRate = parseFloat(item.tax_rate) || 0;
            return sum + (amount * taxRate / 100);
        }, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const openCreateModal = () => {
        setEditingOrder(null);
        setFormData({
            vendor_id: '',
            order_date: new Date().toISOString().split('T')[0],
            expected_date: '',
            status: 'draft',
            notes: ''
        });
        setLineItems([]);
        setShowModal(true);
    };

    const openEditModal = (order) => {
        setEditingOrder(order);
        setFormData({
            vendor_id: order.vendor_id,
            order_date: order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : '',
            expected_date: order.expected_date ? new Date(order.expected_date).toISOString().split('T')[0] : '',
            status: order.status,
            notes: order.notes || ''
        });
        // TODO: Load line items from order if stored
        setLineItems([]);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                total_amount: calculateTotal(),
                items: lineItems
            };
            
            if (editingOrder) {
                await purchaseOrdersAPI.update(editingOrder.id, payload);
            } else {
                await purchaseOrdersAPI.create(payload);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Error saving purchase order');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this purchase order?')) {
            try {
                await purchaseOrdersAPI.delete(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting order:', error);
                alert('Error deleting purchase order');
            }
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-800',
            sent: 'bg-blue-100 text-blue-800',
            received: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || styles.draft}`}>
                {status}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading purchase orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
                        <p className="mt-2 text-sm text-gray-600">Manage vendor orders and procurement</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Order
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by PO# or Vendor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="received">Received</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No purchase orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="text-primary-600 font-medium">{order.po_number}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {order.vendor_name || 'Unknown Vendor'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.order_date)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.expected_date)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            ₹{parseFloat(order.total_amount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <button
                                                onClick={() => openEditModal(order)}
                                                className="text-primary-600 hover:text-primary-800 font-medium mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(order.id)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingOrder ? 'Edit Purchase Order' : 'New Purchase Order'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Top Row - Vendor and Status */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                                        <select
                                            name="vendor_id"
                                            value={formData.vendor_id}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2"
                                            required
                                        >
                                            <option value="">Select Vendor</option>
                                            {vendors.map(v => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="sent">Sent</option>
                                            <option value="received">Received</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Dates Row */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                                        <input
                                            type="date"
                                            name="order_date"
                                            value={formData.order_date}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
                                        <input
                                            type="date"
                                            name="expected_date"
                                            value={formData.expected_date}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>
                                </div>

                                {/* Line Items Section */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-medium text-gray-900">Items</h3>
                                        <button
                                            type="button"
                                            onClick={addLineItem}
                                            className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Item
                                        </button>
                                    </div>

                                    <div className="border rounded-lg overflow-hidden">
                                        {lineItems.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500 bg-gray-50">
                                                Add items to the order
                                            </div>
                                        ) : (
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">Qty</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32">Unit Price</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">Tax %</th>
                                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-32">Amount</th>
                                                        <th className="px-4 py-2 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {lineItems.map(item => (
                                                        <tr key={item.id}>
                                                            <td className="px-4 py-2">
                                                                <select
                                                                    value={item.product_id}
                                                                    onChange={(e) => updateLineItem(item.id, 'product_id', e.target.value)}
                                                                    className="w-full border rounded px-2 py-1 text-sm"
                                                                >
                                                                    <option value="">Select Product</option>
                                                                    {products.map(p => (
                                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="number"
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                                                                    className="w-full border rounded px-2 py-1 text-sm"
                                                                    min="1"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="number"
                                                                    value={item.unit_price}
                                                                    onChange={(e) => updateLineItem(item.id, 'unit_price', e.target.value)}
                                                                    className="w-full border rounded px-2 py-1 text-sm"
                                                                    step="0.01"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="number"
                                                                    value={item.tax_rate}
                                                                    onChange={(e) => updateLineItem(item.id, 'tax_rate', e.target.value)}
                                                                    className="w-full border rounded px-2 py-1 text-sm"
                                                                    step="0.01"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2 text-right font-medium">
                                                                ₹{parseFloat(item.amount || 0).toLocaleString()}
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeLineItem(item.id)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>

                                    {/* Totals */}
                                    <div className="mt-4 flex justify-end">
                                        <div className="w-64 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="font-medium">₹{calculateSubtotal().toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Tax:</span>
                                                <span className="font-medium">₹{calculateTax().toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                                <span>Total:</span>
                                                <span className="text-primary-600">₹{calculateTotal().toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="Add formatting notes or terms..."
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        {editingOrder ? 'Update Order' : 'Create Order'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseOrder;
