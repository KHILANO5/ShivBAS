import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, productsAPI, contactsAPI } from '../services/api';

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
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [eventToArchive, setEventToArchive] = useState(null);

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

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [analyticsResponse, productsResponse, contactsResponse] = await Promise.all([
                analyticsAPI.getAll(),
                productsAPI.getAll(),
                contactsAPI.getAll()
            ]);

            setAnalytics(analyticsResponse.data.data || []);
            // Filter only active products
            setProducts((productsResponse.data.data || []).filter(p => p.status === 'active'));
            // Store all active contacts
            setUsers((contactsResponse.data.data || []).filter(c => c.status === 'active'));
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filter partners based on selected partner_tag
    // partner_tag: 'customer' matches type: 'customer'
    // partner_tag: 'supplier' matches type: 'vendor'
    const filteredPartners = users.filter(user => {
        if (formData.partner_tag === 'customer') {
            return user.type === 'customer';
        } else if (formData.partner_tag === 'supplier') {
            return user.type === 'vendor';
        }
        return true;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // If partner_tag changes, reset partner_id
        if (name === 'partner_tag') {
            setFormData(prev => ({
                ...prev,
                partner_tag: value,
                partner_id: '' // Reset partner selection
            }));
            return;
        }

        // If product is selected, auto-fill category and unit_price
        if (name === 'product_id') {
            const selectedProduct = products.find(p => p.id === parseInt(value));
            if (selectedProduct) {
                setFormData(prev => ({
                    ...prev,
                    product_id: value,
                    product_category: selectedProduct.category || '',
                    unit_price: (selectedProduct.unit_price || 0).toString()
                }));
                return;
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Auto-calculate profit when product or units change
    useEffect(() => {
        if (formData.product_id && formData.no_of_units) {
            const product = products.find(p => p.id === parseInt(formData.product_id));
            if (product) {
                const units = parseInt(formData.no_of_units) || 0;
                const unitPrice = parseFloat(product.unit_price) || 0;
                const purchasePrice = parseFloat(product.purchase_price) || 0;
                
                // Calculate profit: (sale_price - purchase_price) * units
                const profit = (unitPrice - purchasePrice) * units;
                // Calculate profit margin: ((sale_price - purchase_price) / sale_price) * 100
                const profitMargin = unitPrice > 0 ? ((unitPrice - purchasePrice) / unitPrice) * 100 : 0;
                
                setFormData(prev => ({
                    ...prev,
                    unit_price: unitPrice.toString(),
                    product_category: product.category || '',
                    profit: profit.toFixed(2),
                    profit_margin_percentage: profitMargin.toFixed(2)
                }));
            }
        } else {
            // Reset profit fields if product or units not selected
            setFormData(prev => ({
                ...prev,
                profit: '',
                profit_margin_percentage: ''
            }));
        }
    }, [formData.product_id, formData.no_of_units, products]);

    const handleCreateEvent = async (e) => {
        e.preventDefault();

        // Validation - profit fields are auto-calculated, so only validate required input fields
        if (!formData.event_name || !formData.partner_id || !formData.product_id || !formData.no_of_units) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Ensure profit is calculated
        if (!formData.profit || !formData.profit_margin_percentage) {
            showNotification('Please select a product to calculate profit', 'error');
            return;
        }

        try {
            const response = await analyticsAPI.create({
                event_name: formData.event_name,
                partner_tag: formData.partner_tag,
                partner_id: parseInt(formData.partner_id),
                product_id: parseInt(formData.product_id),
                product_category: formData.product_category,
                no_of_units: parseInt(formData.no_of_units),
                unit_price: parseFloat(formData.unit_price),
                profit: parseFloat(formData.profit),
                profit_margin_percentage: parseFloat(formData.profit_margin_percentage),
                status: formData.status
            });

            if (response.data.success) {
                showNotification('Analytics event created successfully!', 'success');
                await fetchData(); // Refresh the list
                setShowCreateModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error creating analytics event:', error);
            showNotification(error.response?.data?.message || 'Failed to create analytics event', 'error');
        }
    };

    const handleEditEvent = async (e) => {
        e.preventDefault();

        try {
            const response = await analyticsAPI.update(selectedEvent.id, {
                event_name: formData.event_name,
                partner_tag: formData.partner_tag,
                partner_id: parseInt(formData.partner_id),
                product_id: parseInt(formData.product_id),
                product_category: formData.product_category,
                no_of_units: parseInt(formData.no_of_units),
                unit_price: parseFloat(formData.unit_price),
                profit: parseFloat(formData.profit),
                profit_margin_percentage: parseFloat(formData.profit_margin_percentage),
                status: formData.status
            });

            if (response.data.success) {
                showNotification('Analytics event updated successfully!', 'success');
                await fetchData(); // Refresh the list
                setShowEditModal(false);
                setSelectedEvent(null);
                resetForm();
            }
        } catch (error) {
            console.error('Error updating analytics event:', error);
            showNotification(error.response?.data?.message || 'Failed to update analytics event', 'error');
        }
    };

    const handleArchiveEvent = (id) => {
        setEventToArchive(id);
        setShowArchiveModal(true);
    };

    const confirmArchiveEvent = async () => {
        if (!eventToArchive) return;

        try {
            const response = await analyticsAPI.update(eventToArchive, { status: 'archived' });
            if (response.data.success) {
                showNotification('Analytics event archived successfully!', 'success');
                await fetchData(); // Refresh the list
            }
        } catch (error) {
            console.error('Error archiving analytics event:', error);
            showNotification(error.response?.data?.message || 'Failed to archive analytics event', 'error');
        } finally {
            setShowArchiveModal(false);
            setEventToArchive(null);
        }
    };

    const handleActivateEvent = async (id) => {
        try {
            const response = await analyticsAPI.update(id, { status: 'active' });
            if (response.data.success) {
                showNotification('Analytics event activated successfully!', 'success');
                await fetchData(); // Refresh the list
            }
        } catch (error) {
            console.error('Error activating analytics event:', error);
            showNotification(error.response?.data?.message || 'Failed to activate analytics event', 'error');
        }
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
        totalProfit: filteredAnalytics.reduce((sum, e) => sum + (parseFloat(e.profit) || 0), 0),
        avgMargin: filteredAnalytics.length > 0
            ? filteredAnalytics.reduce((sum, e) => sum + (parseFloat(e.profit_margin_percentage) || 0), 0) / filteredAnalytics.length
            : 0,
        totalUnits: filteredAnalytics.reduce((sum, e) => sum + (parseInt(e.no_of_units) || 0), 0)
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
                        <p className="text-2xl font-bold text-green-600 mt-2">₹{stats.totalProfit.toFixed(2)}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Avg Profit Margin</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">{isNaN(stats.avgMargin) ? '0.0' : stats.avgMargin.toFixed(1)}%</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Units</p>
                        <p className="text-2xl font-bold text-purple-600 mt-2">{stats.totalUnits}</p>
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
                                        <option value="">Select a {formData.partner_tag === 'supplier' ? 'vendor' : 'customer'}</option>
                                        {filteredPartners.map(partner => (
                                            <option key={partner.id} value={partner.id}>
                                                {partner.name} {partner.email ? `(${partner.email})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {filteredPartners.length === 0 && (
                                        <p className="text-xs text-yellow-600 mt-1">
                                            No {formData.partner_tag === 'supplier' ? 'vendors' : 'customers'} found. Please add one in Contacts first.
                                        </p>
                                    )}
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
                                                {product.name} - {product.category} (₹{product.unit_price || 0})
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
                                        placeholder="Auto-calculated from product"
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
                                        placeholder="Auto-calculated from product"
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
                                        <option value="">Select a {formData.partner_tag === 'supplier' ? 'vendor' : 'customer'}</option>
                                        {filteredPartners.map(partner => (
                                            <option key={partner.id} value={partner.id}>
                                                {partner.name} {partner.email ? `(${partner.email})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {filteredPartners.length === 0 && (
                                        <p className="text-xs text-yellow-600 mt-1">
                                            No {formData.partner_tag === 'supplier' ? 'vendors' : 'customers'} found. Please add one in Contacts first.
                                        </p>
                                    )}
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
                                                {product.name} - {product.category} (₹{product.unit_price || 0})
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
                                        placeholder="Auto-calculated from product"
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
                                        placeholder="Auto-calculated from product"
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

            {/* Archive Confirmation Modal */}
            {showArchiveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Archive Analytics Event</h3>
                                <p className="text-sm text-gray-600 mt-1">Are you sure you want to archive this analytics event? You can restore it later.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowArchiveModal(false);
                                    setEventToArchive(null);
                                }}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmArchiveEvent}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                                Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification.show && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className={`rounded-lg shadow-lg p-4 max-w-md ${
                        notification.type === 'success' ? 'bg-green-50 border border-green-200' :
                        notification.type === 'error' ? 'bg-red-50 border border-red-200' :
                        'bg-blue-50 border border-blue-200'
                    }`}>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                {notification.type === 'success' ? (
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : notification.type === 'error' ? (
                                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                    notification.type === 'success' ? 'text-green-800' :
                                    notification.type === 'error' ? 'text-red-800' :
                                    'text-blue-800'
                                }`}>
                                    {notification.message}
                                </p>
                            </div>
                            <button
                                onClick={() => setNotification({ show: false, message: '', type: '' })}
                                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
