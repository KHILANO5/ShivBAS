import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockAPI } from '../services/mockAPI';

const PurchaseOrder = () => {
    const { isAdmin } = useAuth();
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Form State
    const [formData, setFormData] = useState({
        vendor_id: '',
        created_date: new Date().toISOString().split('T')[0],
        expected_date: '',
        status: 'draft',
        notes: '',
        items: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [posRes, contactsRes, productsRes] = await Promise.all([
                mockAPI.getPurchaseOrders(),
                mockAPI.getContacts(),
                mockAPI.getProducts()
            ]);

            setPurchaseOrders(posRes.data.data);
            setVendors(contactsRes.data.data.filter(c => c.type === 'vendor'));
            setProducts(productsRes.data.data);
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

    // Line Item Management
    const addLineItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                { product_id: '', quantity: 1, unit_price: 0, tax_rate: 0, total: 0 }
            ]
        }));
    };

    const removeLineItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateLineItem = (index, field, value) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            const item = { ...newItems[index], [field]: value };

            // Auto-fill product details
            if (field === 'product_id') {
                const product = products.find(p => p.id === parseInt(value));
                if (product) {
                    item.unit_price = product.unit_price;
                    item.tax_rate = product.tax_rate;
                }
            }

            newItems[index] = item;
            return { ...prev, items: newItems };
        });
    };

    // Calculations
    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => {
            return sum + (parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0));
        }, 0);

        const totalTax = formData.items.reduce((sum, item) => {
            const itemTotal = parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0);
            return sum + (itemTotal * (parseFloat(item.tax_rate || 0) / 100));
        }, 0);

        return {
            subtotal,
            totalTax,
            grandTotal: subtotal + totalTax
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.vendor_id || formData.items.length === 0) {
            alert('Please select a vendor and add at least one item');
            return;
        }

        const totals = calculateTotals();
        const payload = {
            ...formData,
            vendor_id: parseInt(formData.vendor_id),
            total_amount: totals.grandTotal
        };

        try {
            if (selectedPO) {
                await mockAPI.updatePurchaseOrder(selectedPO.id, payload);
            } else {
                await mockAPI.createPurchaseOrder(payload);
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Error saving PO:', error);
            alert('Failed to save Purchase Order');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this Purchase Order?')) {
            try {
                await mockAPI.deletePurchaseOrder(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting PO:', error);
            }
        }
    };

    const openEditModal = (po) => {
        setSelectedPO(po);
        setFormData({
            vendor_id: po.vendor_id,
            created_date: po.created_date,
            expected_date: po.expected_date,
            status: po.status,
            notes: po.notes,
            items: po.items || []
        });
        setShowEditModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedPO(null);
        setFormData({
            vendor_id: '',
            created_date: new Date().toISOString().split('T')[0],
            expected_date: '',
            status: 'draft',
            notes: '',
            items: []
        });
    };

    const filteredPOs = purchaseOrders.filter(po => {
        const matchesSearch = po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'received': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    const totals = calculateTotals();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage vendor orders and procurement</p>
                    </div>
                    {(isAdmin || true) && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Order
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search by PO# or Vendor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                        <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border rounded-lg px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="received">Received</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPOs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No purchase orders found
                                    </td>
                                </tr>
                            ) : (
                                filteredPOs.map((po) => (
                                    <tr key={po.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                                            {po.po_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {po.vendor_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(po.created_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {po.expected_date ? new Date(po.expected_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            ₹{po.total_amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(po.status)}`}>
                                                {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(po)}
                                                className="text-primary-600 hover:text-primary-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(po.id)}
                                                className="text-red-600 hover:text-red-900"
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
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {showEditModal ? 'Edit Purchase Order' : 'New Purchase Order'}
                                </h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Order Date</label>
                                        <input
                                            type="date"
                                            name="created_date"
                                            value={formData.created_date}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Expected Date</label>
                                        <input
                                            type="date"
                                            name="expected_date"
                                            value={formData.expected_date}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Items</h3>
                                        <button
                                            type="button"
                                            onClick={addLineItem}
                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            + Add Item
                                        </button>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-4 items-end">
                                                <div className="col-span-4">
                                                    <label className="block text-xs text-gray-500 mb-1">Product</label>
                                                    <select
                                                        value={item.product_id}
                                                        onChange={(e) => updateLineItem(index, 'product_id', e.target.value)}
                                                        className="w-full border rounded px-2 py-1 text-sm"
                                                        required
                                                    >
                                                        <option value="">Select Product</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs text-gray-500 mb-1">Qty</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                                                        className="w-full border rounded px-2 py-1 text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs text-gray-500 mb-1">Price</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateLineItem(index, 'unit_price', e.target.value)}
                                                        className="w-full border rounded px-2 py-1 text-sm"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs text-gray-500 mb-1">Tax %</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.01"
                                                        value={item.tax_rate}
                                                        onChange={(e) => updateLineItem(index, 'tax_rate', e.target.value)}
                                                        className="w-full border rounded px-2 py-1 text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-xs text-gray-500 mb-1">Total</label>
                                                    <span className="block text-sm font-bold text-gray-900 py-1">
                                                        ₹{((parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)) * (1 + (parseFloat(item.tax_rate || 0) / 100))).toFixed(0)}
                                                    </span>
                                                </div>
                                                <div className="col-span-1 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLineItem(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.items.length === 0 && (
                                            <p className="text-sm text-gray-500 text-center py-4">Add items to the order</p>
                                        )}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="flex justify-end border-t pt-4">
                                    <div className="w-64 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tax:</span>
                                            <span className="font-medium">₹{totals.totalTax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total:</span>
                                            <span className="text-primary-600">₹{totals.grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="Add formatting notes or terms..."
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-4 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        {showEditModal ? 'Update Order' : 'Create Order'}
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

export default PurchaseOrder;
