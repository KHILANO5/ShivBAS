import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Invoices = () => {
    const { isAdmin, user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Form state matching database schema
    const [formData, setFormData] = useState({
        customer_id: '',
        analytics_id: '',
        status: 'draft',
        payment_status: 'not_paid',
        line_items: [
            { product_id: '', quantity: 1, unit_price: '', tax_amount: 0 }
        ]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Mock data - replace with actual API calls
            setInvoices([
                {
                    id: 1,
                    customer_id: 1,
                    customer_name: 'ABC Corporation',
                    analytics_id: 1,
                    analytics_event: 'Expo 2026',
                    created_by_user_id: 1,
                    created_by: 'Admin User',
                    total_amount: 150000,
                    status: 'posted',
                    payment_status: 'paid',
                    created_at: '2026-01-15T10:30:00',
                    posted_at: '2026-01-16T14:20:00',
                    line_items: [
                        { id: 1, product_id: 1, product_name: 'Product A', quantity: 100, unit_price: 500, tax_amount: 50000 }
                    ]
                },
                {
                    id: 2,
                    customer_id: 2,
                    customer_name: 'XYZ Enterprises',
                    analytics_id: 2,
                    analytics_event: 'Summer Sale',
                    created_by_user_id: 1,
                    created_by: 'Admin User',
                    total_amount: 75000,
                    status: 'posted',
                    payment_status: 'partial',
                    created_at: '2026-01-20T09:15:00',
                    posted_at: '2026-01-21T11:00:00',
                    line_items: [
                        { id: 2, product_id: 2, product_name: 'Product B', quantity: 50, unit_price: 300, tax_amount: 15000 }
                    ]
                },
                {
                    id: 3,
                    customer_id: 3,
                    customer_name: 'Global Trading Co',
                    analytics_id: 3,
                    analytics_event: 'Product Launch',
                    created_by_user_id: 1,
                    created_by: 'Admin User',
                    total_amount: 120000,
                    status: 'draft',
                    payment_status: 'not_paid',
                    created_at: '2026-01-25T16:45:00',
                    posted_at: null,
                    line_items: [
                        { id: 3, product_id: 3, product_name: 'Product C', quantity: 80, unit_price: 600, tax_amount: 48000 }
                    ]
                }
            ]);

            setCustomers([
                { id: 1, name: 'ABC Corporation', type: 'customer' },
                { id: 2, name: 'XYZ Enterprises', type: 'customer' },
                { id: 3, name: 'Global Trading Co', type: 'customer' }
            ]);

            setAnalytics([
                { id: 1, event_name: 'Expo 2026', partner_tag: 'customer' },
                { id: 2, event_name: 'Summer Sale', partner_tag: 'customer' },
                { id: 3, event_name: 'Product Launch', partner_tag: 'customer' }
            ]);

            setProducts([
                { id: 1, name: 'Product A', sale_price: 500, tax_rate: 18 },
                { id: 2, name: 'Product B', sale_price: 300, tax_rate: 18 },
                { id: 3, name: 'Product C', sale_price: 600, tax_rate: 18 },
                { id: 4, name: 'Product D', sale_price: 450, tax_rate: 18 },
                { id: 5, name: 'Product E', sale_price: 550, tax_rate: 18 }
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLineItemChange = (index, field, value) => {
        const newLineItems = [...formData.line_items];
        newLineItems[index][field] = value;

        // Auto-calculate unit price and tax when product is selected
        if (field === 'product_id') {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
                newLineItems[index].unit_price = product.sale_price;
                const subtotal = newLineItems[index].quantity * product.sale_price;
                newLineItems[index].tax_amount = (subtotal * product.tax_rate) / 100;
            }
        }

        // Recalculate tax when quantity changes
        if (field === 'quantity') {
            const product = products.find(p => p.id === parseInt(newLineItems[index].product_id));
            if (product) {
                const subtotal = parseInt(value) * newLineItems[index].unit_price;
                newLineItems[index].tax_amount = (subtotal * product.tax_rate) / 100;
            }
        }

        setFormData(prev => ({
            ...prev,
            line_items: newLineItems
        }));
    };

    const addLineItem = () => {
        setFormData(prev => ({
            ...prev,
            line_items: [...prev.line_items, { product_id: '', quantity: 1, unit_price: '', tax_amount: 0 }]
        }));
    };

    const removeLineItem = (index) => {
        if (formData.line_items.length > 1) {
            setFormData(prev => ({
                ...prev,
                line_items: prev.line_items.filter((_, i) => i !== index)
            }));
        }
    };

    const calculateTotal = () => {
        return formData.line_items.reduce((total, item) => {
            const subtotal = (item.quantity || 0) * (item.unit_price || 0);
            return total + subtotal + (item.tax_amount || 0);
        }, 0);
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.customer_id || formData.line_items.some(item => !item.product_id || !item.quantity)) {
            alert('Please fill in all required fields');
            return;
        }

        const customer = customers.find(c => c.id === parseInt(formData.customer_id));
        const analyticsEvent = analytics.find(a => a.id === parseInt(formData.analytics_id));
        const total = calculateTotal();

        const newInvoice = {
            id: invoices.length + 1,
            customer_id: parseInt(formData.customer_id),
            customer_name: customer?.name,
            analytics_id: formData.analytics_id ? parseInt(formData.analytics_id) : null,
            analytics_event: analyticsEvent?.event_name,
            created_by_user_id: user?.id || 1,
            created_by: user?.name || 'Admin User',
            total_amount: total,
            status: formData.status,
            payment_status: formData.payment_status,
            created_at: new Date().toISOString(),
            posted_at: formData.status === 'posted' ? new Date().toISOString() : null,
            line_items: formData.line_items.map((item, index) => {
                const product = products.find(p => p.id === parseInt(item.product_id));
                return {
                    id: index + 1,
                    product_id: parseInt(item.product_id),
                    product_name: product?.name,
                    quantity: parseInt(item.quantity),
                    unit_price: parseFloat(item.unit_price),
                    tax_amount: parseFloat(item.tax_amount)
                };
            })
        };

        setInvoices([newInvoice, ...invoices]);
        setShowCreateModal(false);
        resetForm();
    };

    const handlePostInvoice = (id) => {
        if (window.confirm('Are you sure you want to post this invoice? This will affect your budget.')) {
            setInvoices(invoices.map(inv =>
                inv.id === id ? { ...inv, status: 'posted', posted_at: new Date().toISOString() } : inv
            ));
        }
    };

    const handleCancelInvoice = (id) => {
        if (window.confirm('Are you sure you want to cancel this invoice?')) {
            setInvoices(invoices.map(inv =>
                inv.id === id ? { ...inv, status: 'cancelled' } : inv
            ));
        }
    };

    const handleDeleteInvoice = (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            setInvoices(invoices.filter(inv => inv.id !== id));
        }
    };

    const openViewModal = (invoice) => {
        setSelectedInvoice(invoice);
        setShowViewModal(true);
    };

    const resetForm = () => {
        setFormData({
            customer_id: '',
            analytics_id: '',
            status: 'draft',
            payment_status: 'not_paid',
            line_items: [
                { product_id: '', quantity: 1, unit_price: '', tax_amount: 0 }
            ]
        });
    };

    // Filter invoices
    const filteredInvoices = invoices.filter(invoice => {
        const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
        const matchesPaymentStatus = filterPaymentStatus === 'all' || invoice.payment_status === filterPaymentStatus;
        const matchesSearch = invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.analytics_event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.id.toString().includes(searchTerm);
        return matchesStatus && matchesPaymentStatus && matchesSearch;
    });

    // Calculate statistics
    const stats = {
        total: filteredInvoices.length,
        totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0),
        draft: filteredInvoices.filter(inv => inv.status === 'draft').length,
        posted: filteredInvoices.filter(inv => inv.status === 'posted').length,
        unpaid: filteredInvoices.filter(inv => inv.payment_status === 'not_paid').length
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: { text: 'Draft', color: 'bg-gray-100 text-gray-800' },
            posted: { text: 'Posted', color: 'bg-green-100 text-green-800' },
            cancelled: { text: 'Cancelled', color: 'bg-red-100 text-red-800' }
        };
        return badges[status] || badges.draft;
    };

    const getPaymentStatusBadge = (status) => {
        const badges = {
            not_paid: { text: 'Not Paid', color: 'bg-red-100 text-red-800' },
            partial: { text: 'Partial', color: 'bg-yellow-100 text-yellow-800' },
            paid: { text: 'Paid', color: 'bg-green-100 text-green-800' }
        };
        return badges[status] || badges.not_paid;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading invoices...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Customer Invoices</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Create and manage sales invoices for your customers
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">₹{stats.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Draft</p>
                        <p className="text-2xl font-bold text-gray-600 mt-2">{stats.draft}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Posted</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">{stats.posted}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Unpaid</p>
                        <p className="text-2xl font-bold text-red-600 mt-2">{stats.unpaid}</p>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="card mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search invoices..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-field pl-10"
                                />
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-4">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="posted">Posted</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <select
                                value={filterPaymentStatus}
                                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Payments</option>
                                <option value="not_paid">Not Paid</option>
                                <option value="partial">Partial</option>
                                <option value="paid">Paid</option>
                            </select>

                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="btn-primary whitespace-nowrap"
                                >
                                    <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Invoice
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="card">
                    {filteredInvoices.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-4 text-gray-600">No invoices found</p>
                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-4 btn-primary"
                                >
                                    Create Your First Invoice
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="table-header">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Invoice #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Event
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        {isAdmin && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredInvoices.map((invoice) => {
                                        const statusBadge = getStatusBadge(invoice.status);
                                        const paymentBadge = getPaymentStatusBadge(invoice.payment_status);
                                        return (
                                            <tr key={invoice.id} className="table-row">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => openViewModal(invoice)}
                                                        className="text-sm font-medium text-primary-600 hover:text-primary-900"
                                                    >
                                                        INV-{String(invoice.id).padStart(4, '0')}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{invoice.customer_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{invoice.analytics_event || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">₹{invoice.total_amount.toLocaleString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                                                        {statusBadge.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${paymentBadge.color}`}>
                                                        {paymentBadge.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(invoice.created_at).toLocaleDateString()}
                                                </td>
                                                {isAdmin && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex gap-2">
                                                            {invoice.status === 'draft' && (
                                                                <button
                                                                    onClick={() => handlePostInvoice(invoice.id)}
                                                                    className="text-green-600 hover:text-green-900"
                                                                    title="Post Invoice"
                                                                >
                                                                    Post
                                                                </button>
                                                            )}
                                                            {invoice.status !== 'cancelled' && (
                                                                <button
                                                                    onClick={() => handleCancelInvoice(invoice.id)}
                                                                    className="text-yellow-600 hover:text-yellow-900"
                                                                    title="Cancel Invoice"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteInvoice(invoice.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete Invoice"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Invoice Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Create New Invoice</h2>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleCreateInvoice} className="space-y-6">
                                {/* Customer and Event */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Customer <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="customer_id"
                                            value={formData.customer_id}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            required
                                        >
                                            <option value="">Select a customer</option>
                                            {customers.map(customer => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Link to Analytics Event
                                        </label>
                                        <select
                                            name="analytics_id"
                                            value={formData.analytics_id}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        >
                                            <option value="">None</option>
                                            {analytics.map(event => (
                                                <option key={event.id} value={event.id}>
                                                    {event.event_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Line Items <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addLineItem}
                                            className="text-sm text-primary-600 hover:text-primary-900 font-medium"
                                        >
                                            + Add Item
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.line_items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-lg">
                                                <div className="col-span-4">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                                                    <select
                                                        value={item.product_id}
                                                        onChange={(e) => handleLineItemChange(index, 'product_id', e.target.value)}
                                                        className="input-field"
                                                        required
                                                    >
                                                        <option value="">Select product</option>
                                                        {products.map(product => (
                                                            <option key={product.id} value={product.id}>
                                                                {product.name} (₹{product.sale_price})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                                                        className="input-field"
                                                        min="1"
                                                        required
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price</label>
                                                    <input
                                                        type="number"
                                                        value={item.unit_price}
                                                        className="input-field bg-gray-100"
                                                        readOnly
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tax</label>
                                                    <input
                                                        type="number"
                                                        value={item.tax_amount}
                                                        className="input-field bg-gray-100"
                                                        readOnly
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Subtotal</label>
                                                    <div className="input-field bg-gray-100">
                                                        ₹{((item.quantity * item.unit_price) + item.tax_amount).toLocaleString()}
                                                    </div>
                                                </div>

                                                {formData.line_items.length > 1 && (
                                                    <div className="col-span-12">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLineItem(index)}
                                                            className="text-sm text-red-600 hover:text-red-900"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="bg-primary-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                                        <span className="text-2xl font-bold text-primary-600">₹{calculateTotal().toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Invoice Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="posted">Posted</option>
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Draft invoices don't affect budget. Posted invoices are counted in actuals.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Status
                                        </label>
                                        <select
                                            name="payment_status"
                                            value={formData.payment_status}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        >
                                            <option value="not_paid">Not Paid</option>
                                            <option value="partial">Partial</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Create Invoice
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Invoice Modal */}
            {showViewModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Invoice Details</h2>
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setSelectedInvoice(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Invoice Header */}
                            <div className="mb-6 pb-6 border-b">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-900">INV-{String(selectedInvoice.id).padStart(4, '0')}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Created: {new Date(selectedInvoice.created_at).toLocaleDateString()}
                                        </p>
                                        {selectedInvoice.posted_at && (
                                            <p className="text-sm text-gray-600">
                                                Posted: {new Date(selectedInvoice.posted_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedInvoice.status).color}`}>
                                            {getStatusBadge(selectedInvoice.status).text}
                                        </span>
                                        <div className="mt-2">
                                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusBadge(selectedInvoice.payment_status).color}`}>
                                                {getPaymentStatusBadge(selectedInvoice.payment_status).text}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Bill To:</h4>
                                <p className="text-lg font-medium text-gray-900">{selectedInvoice.customer_name}</p>
                                {selectedInvoice.analytics_event && (
                                    <p className="text-sm text-gray-600">Event: {selectedInvoice.analytics_event}</p>
                                )}
                            </div>

                            {/* Line Items */}
                            <div className="mb-6">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {selectedInvoice.line_items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">₹{item.unit_price.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right">₹{item.tax_amount.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                                    ₹{((item.quantity * item.unit_price) + item.tax_amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total */}
                            <div className="bg-primary-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                                    <span className="text-3xl font-bold text-primary-600">₹{selectedInvoice.total_amount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
                                <p>Created by: {selectedInvoice.created_by}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
