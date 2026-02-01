import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../services/api';

const Products = () => {
    const { isAdmin } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [productToArchive, setProductToArchive] = useState(null);

    // Form state matching database schema
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        unit_price: '',
        purchase_price: '',
        tax_rate: '18.00',
        status: 'active'
    });

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await productsAPI.getAll();
            const data = response.data.data || [];
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.category || !formData.unit_price) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (parseFloat(formData.unit_price) <= 0) {
            showNotification('Unit price must be greater than 0', 'error');
            return;
        }

        if (formData.purchase_price && parseFloat(formData.purchase_price) > parseFloat(formData.unit_price)) {
            showNotification('Purchase price should not be greater than unit price', 'error');
            return;
        }

        try {
            const response = await productsAPI.create({
                name: formData.name,
                category: formData.category,
                unit_price: parseFloat(formData.unit_price),
                purchase_price: parseFloat(formData.purchase_price) || 0,
                tax_rate: parseFloat(formData.tax_rate),
                status: formData.status
            });

            if (response.data.success) {
                showNotification('Product created successfully!', 'success');
                await fetchData();
                setShowCreateModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error creating product:', error);
            showNotification(error.response?.data?.error || error.response?.data?.message || 'Failed to create product', 'error');
        }
    };

    const handleEditProduct = async (e) => {
        e.preventDefault();

        try {
            const response = await productsAPI.update(selectedProduct.id, {
                name: formData.name,
                category: formData.category,
                unit_price: parseFloat(formData.unit_price),
                purchase_price: parseFloat(formData.purchase_price) || 0,
                tax_rate: parseFloat(formData.tax_rate),
                status: formData.status
            });

            if (response.data.success) {
                showNotification('Product updated successfully!', 'success');
                await fetchData();
                setShowEditModal(false);
                setSelectedProduct(null);
                resetForm();
            }
        } catch (error) {
            console.error('Error updating product:', error);
            showNotification(error.response?.data?.error || error.response?.data?.message || 'Failed to update product', 'error');
        }
    };

    const handleArchiveProduct = (id) => {
        setProductToArchive(id);
        setShowArchiveModal(true);
    };

    const confirmArchiveProduct = async () => {
        if (!productToArchive) return;

        try {
            const response = await productsAPI.update(productToArchive, { status: 'archived' });
            if (response.data.success) {
                showNotification('Product archived successfully!', 'success');
                await fetchData();
            }
        } catch (error) {
            console.error('Error archiving product:', error);
            showNotification(error.response?.data?.error || 'Failed to archive product', 'error');
        } finally {
            setShowArchiveModal(false);
            setProductToArchive(null);
        }
    };

    const handleActivateProduct = async (id) => {
        try {
            const response = await productsAPI.update(id, { status: 'active' });
            if (response.data.success) {
                showNotification('Product activated successfully!', 'success');
                await fetchData();
            }
        } catch (error) {
            console.error('Error activating product:', error);
            showNotification(error.response?.data?.error || 'Failed to activate product', 'error');
        }
    };

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            unit_price: product.unit_price?.toString() || '',
            purchase_price: product.purchase_price?.toString() || '',
            tax_rate: product.tax_rate?.toString() || '18.00',
            status: product.status
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            unit_price: '',
            purchase_price: '',
            tax_rate: '18.00',
            status: 'active'
        });
    };

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category))];

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesStatus && matchesSearch;
    });

    // Calculate statistics from all products, not filtered
    const stats = {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        archived: products.filter(p => p.status === 'archived').length,
        avgProfitMargin: (() => {
            const productsWithPrices = products.filter(p => 
                p.unit_price && p.purchase_price && 
                !isNaN(parseFloat(p.unit_price)) && 
                !isNaN(parseFloat(p.purchase_price)) &&
                parseFloat(p.unit_price) > 0
            );
            if (productsWithPrices.length === 0) return 0;
            const totalMargin = productsWithPrices.reduce((acc, p) => {
                const margin = ((parseFloat(p.unit_price) - parseFloat(p.purchase_price)) / parseFloat(p.unit_price)) * 100;
                return acc + margin;
            }, 0);
            return totalMargin / productsWithPrices.length;
        })()
    };

    const getStatusBadge = (status) => {
        return status === 'active'
            ? { text: 'Active', color: 'bg-green-100 text-green-800' }
            : { text: 'Archived', color: 'bg-gray-100 text-gray-800' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your product inventory and pricing
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Active Products</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">{stats.active}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Archived</p>
                        <p className="text-2xl font-bold text-gray-600 mt-2">{stats.archived}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Avg Profit Margin</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">{stats.avgProfitMargin.toFixed(1)}%</p>
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
                                    placeholder="Search products..."
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
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
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
                                    Add Product
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="card text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="mt-4 text-gray-600">No products found</p>
                        {isAdmin && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-4 btn-primary"
                            >
                                Add Your First Product
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => {
                            const statusBadge = getStatusBadge(product.status);
                            return (
                                <div key={product.id} className="card hover:shadow-lg transition-shadow duration-200">
                                    {/* Product Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                                            {statusBadge.text}
                                        </span>
                                    </div>

                                    {/* Product Details */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Unit Price:</span>
                                            <span className="text-lg font-bold text-primary-600">₹{parseFloat(product.unit_price || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Tax Rate:</span>
                                            <span className="text-sm font-semibold text-gray-900">{product.tax_rate}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Price + Tax:</span>
                                            <span className="text-sm font-semibold text-green-600">
                                                ₹{(parseFloat(product.unit_price || 0) * (1 + parseFloat(product.tax_rate || 0) / 100)).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Profit Margin:</span>
                                            <span className={`text-sm font-semibold ${product.unit_price && product.purchase_price && parseFloat(product.unit_price) > parseFloat(product.purchase_price) ? 'text-green-600' : 'text-gray-600'}`}>
                                                {product.unit_price && parseFloat(product.unit_price) > 0 
                                                    ? `${(((parseFloat(product.unit_price) - parseFloat(product.purchase_price || 0)) / parseFloat(product.unit_price)) * 100).toFixed(1)}%`
                                                    : '0%'
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Product Footer */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500 mb-3">
                                            Updated: {new Date(product.updated_at).toLocaleDateString()}
                                        </p>

                                        {/* Actions */}
                                        {isAdmin && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="flex-1 text-sm text-primary-600 hover:text-primary-900 font-medium"
                                                >
                                                    Edit
                                                </button>
                                                {product.status === 'active' ? (
                                                    <button
                                                        onClick={() => handleArchiveProduct(product.id)}
                                                        className="flex-1 text-sm text-gray-600 hover:text-gray-900 font-medium"
                                                    >
                                                        Archive
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivateProduct(product.id)}
                                                        className="flex-1 text-sm text-green-600 hover:text-green-900 font-medium"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Product Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
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

                            <form onSubmit={handleCreateProduct} className="space-y-4">
                                {/* Product Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="e.g., Premium Wood, Steel Sheets"
                                        required
                                    />

                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="e.g., Raw Materials, Components, Textiles"
                                        required
                                    />

                                </div>

                                {/* Unit Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unit Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="unit_price"
                                        value={formData.unit_price}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="500.00"
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />

                                </div>

                                {/* Purchase Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Purchase Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="purchase_price"
                                        value={formData.purchase_price}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="300.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Tax Rate */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tax Rate (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="tax_rate"
                                        value={formData.tax_rate}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="18.00"
                                        min="0"
                                        max="100"
                                        step="0.01"
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

                                {/* Price Preview */}
                                {formData.unit_price && (
                                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">Price including tax:</span>
                                            <span className="text-lg font-bold text-blue-600">
                                                ₹{(parseFloat(formData.unit_price || 0) * (1 + parseFloat(formData.tax_rate || 0) / 100)).toFixed(2)}
                                            </span>
                                        </div>
                                        {formData.purchase_price && parseFloat(formData.purchase_price) > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">Profit Margin:</span>
                                                <span className={`text-lg font-bold ${parseFloat(formData.unit_price) > parseFloat(formData.purchase_price) ? 'text-green-600' : 'text-red-600'}`}>
                                                    {(((parseFloat(formData.unit_price) - parseFloat(formData.purchase_price)) / parseFloat(formData.unit_price)) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

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
                                        Add Product
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedProduct(null);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleEditProduct} className="space-y-4">
                                {/* Same form fields as create modal */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unit Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="unit_price"
                                        value={formData.unit_price}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Purchase Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="purchase_price"
                                        value={formData.purchase_price}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="300.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tax Rate (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="tax_rate"
                                        value={formData.tax_rate}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                    />
                                </div>

                                {formData.unit_price && (
                                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">Price including tax:</span>
                                            <span className="text-lg font-bold text-blue-600">
                                                ₹{(parseFloat(formData.unit_price || 0) * (1 + parseFloat(formData.tax_rate || 0) / 100)).toFixed(2)}
                                            </span>
                                        </div>
                                        {formData.purchase_price && parseFloat(formData.purchase_price) > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">Profit Margin:</span>
                                                <span className={`text-lg font-bold ${parseFloat(formData.unit_price) > parseFloat(formData.purchase_price) ? 'text-green-600' : 'text-red-600'}`}>
                                                    {(((parseFloat(formData.unit_price) - parseFloat(formData.purchase_price)) / parseFloat(formData.unit_price)) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

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
                                            setSelectedProduct(null);
                                            resetForm();
                                        }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Update Product
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
                                <h3 className="text-lg font-semibold text-gray-900">Archive Product</h3>
                                <p className="text-sm text-gray-600 mt-1">Are you sure you want to archive this product? You can restore it later.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowArchiveModal(false);
                                    setProductToArchive(null);
                                }}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmArchiveProduct}
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

export default Products;
