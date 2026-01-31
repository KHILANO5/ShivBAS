import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockAPI } from '../services/mockAPI';

const Analytics = () => {
    const { isAdmin } = useAuth();
    const [analytics, setAnalytics] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filterPartner, setFilterPartner] = useState('all');
    const [filterStatus, setFilterStatus] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');

    // Form state matching database schema
    const [formData, setFormData] = useState({
        event_name: '',
        partner_tag: 'customer',
        partner_id: '',
        product_id: '',
        product_category: '',
        no_of_units: '',
        unit_price: '',
        profit: '',
        profit_margin_percentage: '',
        status: 'active'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const analyticsResponse = await mockAPI.getAnalytics({});
            setAnalytics(analyticsResponse.data.data.events || []);

            // Mock users data
            setUsers([
                { id: 1, name: 'ABC Suppliers Ltd', role: 'portal' },
                { id: 2, name: 'XYZ Customer Corp', role: 'portal' },
                { id: 3, name: 'Global Trading Co', role: 'portal' }
            ]);

            // Mock products data
            setProducts([
                { id: 1, name: 'Product A', category: 'Electronics', sale_price: 500, purchase_price: 350 },
                { id: 2, name: 'Product B', category: 'Furniture', sale_price: 300, purchase_price: 200 },
                { id: 3, name: 'Product C', category: 'Textiles', sale_price: 600, purchase_price: 400 },
                { id: 4, name: 'Product D', category: 'Electronics', sale_price: 450, purchase_price: 300 },
                { id: 5, name: 'Product E', category: 'Furniture', sale_price: 550, purchase_price: 380 }
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // If product is selected, auto-fill category
        if (name === 'product_id') {
            const selectedProduct = products.find(p => p.id === parseInt(value));
            if (selectedProduct) {
                setFormData(prev => ({
                    ...prev,
                    product_id: value,
                    product_category: selectedProduct.category
                }));
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateProfit = () => {
        const product = products.find(p => p.id === parseInt(formData.product_id));
        if (product && formData.no_of_units) {
            const units = parseInt(formData.no_of_units);
            const profit = (product.sale_price - product.purchase_price) * units;
            const profitMargin = ((product.sale_price - product.purchase_price) / product.sale_price) * 100;

            setFormData(prev => ({
                ...prev,
                unit_price: product.sale_price.toString(),
                profit: profit.toFixed(2),
                profit_margin_percentage: profitMargin.toFixed(2)
            }));
        }
    };

    useEffect(() => {
        if (formData.product_id && formData.no_of_units) {
            calculateProfit();
        }
    }, [formData.product_id, formData.no_of_units]);

    const handleCreateEvent = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.event_name || !formData.partner_id || !formData.product_id || !formData.no_of_units) {
            alert('Please fill in all required fields');
            return;
        }

        const partner = users.find(u => u.id === parseInt(formData.partner_id));
        const product = products.find(p => p.id === parseInt(formData.product_id));

        // Create new event matching database schema
        const newEvent = {
            id: analytics.length + 1,
            event_name: formData.event_name,
            partner_tag: formData.partner_tag,
            partner_id: parseInt(formData.partner_id),
            partner_name: partner?.name,
            product_id: parseInt(formData.product_id),
            product_name: product?.name,
            product_category: formData.product_category,
            no_of_units: parseInt(formData.no_of_units),
            unit_price: parseFloat(formData.unit_price),
            profit: parseFloat(formData.profit),
            profit_margin_percentage: parseFloat(formData.profit_margin_percentage),
            status: formData.status,
            created_at: new Date().toISOString()
        };

        setAnalytics([newEvent, ...analytics]);
        setShowCreateModal(false);
        resetForm();
    };

    const handleEditEvent = async (e) => {
        e.preventDefault();

        const partner = users.find(u => u.id === parseInt(formData.partner_id));
        const product = products.find(p => p.id === parseInt(formData.product_id));

        const updatedEvent = {
            ...selectedEvent,
            event_name: formData.event_name,
            partner_tag: formData.partner_tag,
            partner_id: parseInt(formData.partner_id),
            partner_name: partner?.name,
            product_id: parseInt(formData.product_id),
            product_name: product?.name,
            product_category: formData.product_category,
            no_of_units: parseInt(formData.no_of_units),
            unit_price: parseFloat(formData.unit_price),
            profit: parseFloat(formData.profit),
            profit_margin_percentage: parseFloat(formData.profit_margin_percentage),
            status: formData.status,
            updated_at: new Date().toISOString()
        };

        setAnalytics(analytics.map(e => e.id === selectedEvent.id ? updatedEvent : e));
        setShowEditModal(false);
        setSelectedEvent(null);
        resetForm();
    };

    const handleDeleteEvent = (id) => {
        if (window.confirm('Are you sure you want to delete this analytics event?')) {
            setAnalytics(analytics.filter(e => e.id !== id));
        }
    };

    const handleArchiveEvent = (id) => {
        setAnalytics(analytics.map(e =>
            e.id === id ? { ...e, status: 'archived', updated_at: new Date().toISOString() } : e
        ));
    };

    const handleActivateEvent = (id) => {
        setAnalytics(analytics.map(e =>
            e.id === id ? { ...e, status: 'active', updated_at: new Date().toISOString() } : e
        ));
    };

    const openEditModal = (event) => {
        setSelectedEvent(event);
        setFormData({
            event_name: event.event_name,
            partner_tag: event.partner_tag,
            partner_id: event.partner_id.toString(),
            product_id: event.product_id.toString(),
            product_category: event.product_category,
            no_of_units: event.no_of_units.toString(),
            unit_price: event.unit_price.toString(),
            profit: event.profit.toString(),
            profit_margin_percentage: event.profit_margin_percentage.toString(),
            status: event.status
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            event_name: '',
            partner_tag: 'customer',
            partner_id: '',
            product_id: '',
            product_category: '',
            no_of_units: '',
            unit_price: '',
            profit: '',
            profit_margin_percentage: '',
            status: 'active'
        });
    };

    // Filter analytics
    const filteredAnalytics = analytics.filter(event => {
        const matchesPartner = filterPartner === 'all' || event.partner_tag === filterPartner;
        const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
        const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.partner_name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesPartner && matchesStatus && matchesSearch;
    });

    // Calculate statistics
    const stats = {
        total: filteredAnalytics.length,
        totalProfit: filteredAnalytics.reduce((sum, e) => sum + (e.profit || 0), 0),
        avgMargin: filteredAnalytics.length > 0
            ? filteredAnalytics.reduce((sum, e) => sum + (e.profit_margin_percentage || 0), 0) / filteredAnalytics.length
            : 0,
        totalUnits: filteredAnalytics.reduce((sum, e) => sum + (e.no_of_units || 0), 0)
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Analytics Events</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Track and manage all your business analytics events
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Events</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Profit</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">₹{stats.totalProfit.toLocaleString()}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Avg Profit Margin</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">{stats.avgMargin.toFixed(1)}%</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Units</p>
                        <p className="text-2xl font-bold text-purple-600 mt-2">{stats.totalUnits.toLocaleString()}</p>
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
                                    placeholder="Search events or partners..."
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
                                value={filterPartner}
                                onChange={(e) => setFilterPartner(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Partners</option>
                                <option value="customer">Customers</option>
                                <option value="supplier">Suppliers</option>
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>

                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="btn-primary whitespace-nowrap"
                                >
                                    <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Event
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Analytics Grid */}
                {filteredAnalytics.length === 0 ? (
                    <div className="card text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="mt-4 text-gray-600">No analytics events found</p>
                        {isAdmin && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-4 btn-primary"
                            >
                                Create Your First Event
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAnalytics.map((event) => (
                            <div key={event.id} className="card hover:shadow-lg transition-shadow duration-200">
                                {/* Event Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900">{event.event_name}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${event.partner_tag === 'customer'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {event.partner_tag}
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${event.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {event.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Event Details */}
                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Partner:</span>
                                        <span className="font-medium text-gray-900">{event.partner_name || event.partner_tag}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Product:</span>
                                        <span className="font-medium text-gray-900">{event.product_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Category:</span>
                                        <span className="font-medium text-gray-900">{event.product_category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Units:</span>
                                        <span className="font-medium text-gray-900">{event.no_of_units}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Unit Price:</span>
                                        <span className="font-medium text-gray-900">₹{event.unit_price?.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Profit Info */}
                                <div className="border-t border-gray-200 pt-4 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Profit:</span>
                                        <span className="text-lg font-bold text-green-600">₹{event.profit?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Margin:</span>
                                        <span className="text-sm font-semibold text-blue-600">{event.profit_margin_percentage}%</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {isAdmin && (
                                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => openEditModal(event)}
                                            className="flex-1 text-sm text-primary-600 hover:text-primary-900 font-medium"
                                        >
                                            Edit
                                        </button>
                                        {event.status === 'active' ? (
                                            <button
                                                onClick={() => handleArchiveEvent(event.id)}
                                                className="flex-1 text-sm text-gray-600 hover:text-gray-900 font-medium"
                                            >
                                                Archive
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleActivateEvent(event.id)}
                                                className="flex-1 text-sm text-green-600 hover:text-green-900 font-medium"
                                            >
                                                Activate
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="flex-1 text-sm text-red-600 hover:text-red-900 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Event Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Create Analytics Event</h2>
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

                            <form onSubmit={handleCreateEvent} className="space-y-4">
                                {/* Event Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="event_name"
                                        value={formData.event_name}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="e.g., Expo 2026, Summer Sale"
                                        required
                                    />

                                </div>

                                {/* Partner Tag */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Partner Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="partner_tag"
                                                value="customer"
                                                checked={formData.partner_tag === 'customer'}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Customer</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="partner_tag"
                                                value="supplier"
                                                checked={formData.partner_tag === 'supplier'}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Supplier</span>
                                        </label>
                                    </div>

                                </div>

                                {/* Partner */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Partner <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="partner_id"
                                        value={formData.partner_id}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select a partner</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                {/* Product */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="product_id"
                                        value={formData.product_id}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select a product</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} - {product.category} (₹{product.sale_price})
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                {/* Product Category (Auto-filled) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Category
                                    </label>
                                    <input
                                        type="text"
                                        name="product_category"
                                        value={formData.product_category}
                                        className="input-field bg-gray-50"
                                        readOnly
                                    />

                                </div>

                                {/* Number of Units */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of Units <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="no_of_units"
                                        value={formData.no_of_units}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="100"
                                        min="1"
                                        required
                                    />

                                </div>

                                {/* Unit Price (Auto-calculated) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unit Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="unit_price"
                                        value={formData.unit_price}
                                        className="input-field bg-gray-50"
                                        step="0.01"
                                        readOnly
                                    />

                                </div>

                                {/* Profit (Auto-calculated) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profit (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="profit"
                                        value={formData.profit}
                                        className="input-field bg-gray-50"
                                        step="0.01"
                                        readOnly
                                    />

                                </div>

                                {/* Profit Margin (Auto-calculated) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profit Margin (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="profit_margin_percentage"
                                        value={formData.profit_margin_percentage}
                                        className="input-field bg-gray-50"
                                        step="0.01"
                                        readOnly
                                    />

                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="input-field"
                                    >
                                        <option value="active">Active</option>
                                        <option value="archived">Archived</option>
                                    </select>

                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-4">
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
                                        Create Event
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Event Modal */}
            {showEditModal && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Analytics Event</h2>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedEvent(null);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleEditEvent} className="space-y-4">
                                {/* Same form fields as create modal */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="event_name"
                                        value={formData.event_name}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Partner Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="partner_tag"
                                                value="customer"
                                                checked={formData.partner_tag === 'customer'}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Customer</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="partner_tag"
                                                value="supplier"
                                                checked={formData.partner_tag === 'supplier'}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Supplier</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Partner <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="partner_id"
                                        value={formData.partner_id}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select a partner</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="product_id"
                                        value={formData.product_id}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select a product</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} - {product.category} (₹{product.sale_price})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Category
                                    </label>
                                    <input
                                        type="text"
                                        name="product_category"
                                        value={formData.product_category}
                                        className="input-field bg-gray-50"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of Units <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="no_of_units"
                                        value={formData.no_of_units}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unit Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="unit_price"
                                        value={formData.unit_price}
                                        className="input-field bg-gray-50"
                                        step="0.01"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profit (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="profit"
                                        value={formData.profit}
                                        className="input-field bg-gray-50"
                                        step="0.01"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profit Margin (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="profit_margin_percentage"
                                        value={formData.profit_margin_percentage}
                                        className="input-field bg-gray-50"
                                        step="0.01"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="input-field"
                                    >
                                        <option value="active">Active</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedEvent(null);
                                            resetForm();
                                        }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Update Event
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
