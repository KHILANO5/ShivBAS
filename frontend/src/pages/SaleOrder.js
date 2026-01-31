import React, { useState, useEffect } from 'react';
import { mockAPI } from '../services/mockAPI';
import { useAuth } from '../context/AuthContext';

const SaleOrder = () => {
    const { isAdmin } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Master Data
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        customer_id: '',
        so_date: new Date().toISOString().split('T')[0], // Default today
        reference: '',
        status: 'draft',
        items: []
    });

    useEffect(() => {
        fetchData();
        fetchMasterData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await mockAPI.getSaleOrders();
            setOrders(response.data.data);
        } catch (error) {
            console.error('Error fetching sale orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterData = async () => {
        try {
            const [contactsRes, productsRes] = await Promise.all([
                mockAPI.getContacts(),
                mockAPI.getProducts()
            ]);
            setCustomers(contactsRes.data.data.filter(c => c.type === 'customer'));
            setProducts(productsRes.data.data);
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    // Form Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Line Item Logic
    const addLineItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { product_id: '', quantity: 1, unit_price: 0, total: 0 }]
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
            newItems[index] = { ...newItems[index], [field]: value };

            // Auto-fill price if product selected
            if (field === 'product_id') {
                const product = products.find(p => p.id === parseInt(value));
                if (product) {
                    newItems[index].unit_price = product.unit_price;
                }
            }

            // Recalculate line total
            if (field === 'quantity' || field === 'unit_price' || field === 'product_id') {
                const qty = parseFloat(newItems[index].quantity) || 0;
                const price = parseFloat(newItems[index].unit_price) || 0;
                newItems[index].total = qty * price;
            }

            return { ...prev, items: newItems };
        });
    };

    const calculateGrandTotal = () => {
        return formData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.customer_id || formData.items.length === 0) {
            alert('Please select a customer and add at least one item.');
            return;
        }

        const grandTotal = calculateGrandTotal();
        const payload = {
            ...formData,
            customer_id: parseInt(formData.customer_id),
            total_amount: grandTotal
        };

        try {
            if (selectedOrder) {
                await mockAPI.updateSaleOrder(selectedOrder.id, payload);
            } else {
                await mockAPI.createSaleOrder(payload);
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Failed to save Sale Order');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this Sale Order?')) {
            try {
                await mockAPI.deleteSaleOrder(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting order:', error);
            }
        }
    };

    const openCreateModal = () => {
        setFormData({
            customer_id: '',
            so_date: new Date().toISOString().split('T')[0],
            reference: '',
            status: 'draft',
            items: [{ product_id: '', quantity: 1, unit_price: 0, total: 0 }]
        });
        setShowCreateModal(true);
    };

    const openEditModal = (order) => {
        setSelectedOrder(order);
        setFormData({
            customer_id: order.customer_id,
            so_date: order.so_date,
            reference: order.reference,
            status: order.status,
            items: order.items.map(item => ({
                ...item,
                total: item.quantity * item.unit_price
            }))
        });
        setShowEditModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedOrder(null);
    };

    const handleAction = async (action) => {
        if (action === 'print') alert('Printing functionality pending...');
        if (action === 'send') alert('Email sending functionality pending...');
        if (action === 'cancel') {
            setFormData(prev => ({ ...prev, status: 'cancelled' }));
        }
        if (action === 'confirm') {
            setFormData(prev => ({ ...prev, status: 'confirm' }));
        }
    };

    const filteredOrders = orders.filter(so =>
        so.so_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        so.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStepClass = (stepRequest, currentStatus) => {
        const statuses = ['draft', 'confirm', 'cancelled'];
        const currentIndex = statuses.indexOf(currentStatus);
        const requestIndex = statuses.indexOf(stepRequest);

        if (currentStatus === stepRequest) return 'bg-blue-600 text-white border-blue-600';
        if (currentIndex > requestIndex && currentStatus !== 'cancelled') return 'bg-green-500 text-white border-green-500'; // Completed step
        if (currentStatus === 'cancelled' && stepRequest === 'cancelled') return 'bg-red-600 text-white border-red-600';
        return 'bg-gray-100 text-gray-500 border-gray-300';
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Sale Orders...</div>;

    const Modal = () => (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-200 font-sans">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div className="flex space-x-4 items-center">
                        <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-primary-200">
                            {selectedOrder ? 'Edit Order' : 'New Order'}
                        </span>
                        <span className="text-gray-500 text-sm italic">
                            {selectedOrder ? selectedOrder.so_number : 'Draft'}
                        </span>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-200 text-sm transition-colors">Close</button>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Top Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="flex items-center">
                                <label className="w-32 text-gray-600 font-medium">SO Number</label>
                                <div className="flex-1 bg-gray-100 px-3 py-2 rounded border border-gray-200 text-gray-500 font-mono text-sm">
                                    {selectedOrder ? selectedOrder.so_number : 'Auto Generated'}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-gray-600 font-medium">Customer</label>
                                <select
                                    name="customer_id"
                                    value={formData.customer_id}
                                    onChange={handleInputChange}
                                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border"
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center">
                                <label className="w-32 text-gray-600 font-medium">Reference</label>
                                <input
                                    type="text"
                                    name="reference"
                                    value={formData.reference}
                                    onChange={handleInputChange}
                                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border"
                                    placeholder="e.g. PO-1234"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center md:justify-end">
                                <label className="w-32 md:w-auto text-gray-600 font-medium mr-4">Order Date</label>
                                <input
                                    type="date"
                                    name="so_date"
                                    value={formData.so_date}
                                    onChange={handleInputChange}
                                    className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border w-48"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="flex flex-col md:flex-row justify-between items-center border-t border-b border-gray-100 py-6 gap-4">
                        <div className="flex space-x-2">
                            <button type="button" onClick={() => handleAction('confirm')} className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-primary-700 shadow-sm transition-all">Confirm Order</button>
                            <button type="button" onClick={() => handleAction('print')} className="bg-white text-gray-700 px-4 py-2 rounded-md font-medium text-sm border border-gray-300 hover:bg-gray-50 shadow-sm transition-all">Print</button>
                            <button type="button" onClick={() => handleAction('send')} className="bg-white text-gray-700 px-4 py-2 rounded-md font-medium text-sm border border-gray-300 hover:bg-gray-50 shadow-sm transition-all">Email</button>
                            <button type="button" onClick={() => handleAction('cancel')} className="bg-white text-red-600 px-4 py-2 rounded-md font-medium text-sm border border-gray-300 hover:bg-red-50 shadow-sm transition-all hover:border-red-300">Cancel</button>
                        </div>
                        {/* Stepper */}
                        <div className="flex items-center pr-2">
                            {['draft', 'confirm', 'cancelled'].map((step, idx) => (
                                <React.Fragment key={step}>
                                    <div className={`px-5 py-1.5 skew-x-[-20deg] border shadow-sm mx-[-5px] z-${10 - idx} transition-colors duration-300 ${getStatusStepClass(step, formData.status)}`}>
                                        <span className="skew-x-[20deg] block text-xs font-bold capitalize tracking-wide">{step}</span>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-16 text-center">#</th>
                                    <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Product</th>
                                    <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-24 text-center">Qty</th>
                                    <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-32 text-right">Unit Price</th>
                                    <th className="p-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-32 text-right">Total</th>
                                    <th className="p-3 border-b border-gray-200 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {formData.items.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 text-center text-gray-400 text-sm">{index + 1}</td>
                                        <td className="p-3">
                                            <select
                                                value={item.product_id}
                                                onChange={(e) => updateLineItem(index, 'product_id', e.target.value)}
                                                className="w-full border-0 border-b border-transparent focus:border-primary-500 focus:ring-0 bg-transparent text-gray-900 text-sm py-1"
                                            >
                                                <option value="">Select Product...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                                                className="w-full text-center border-gray-200 rounded text-sm focus:ring-primary-500 focus:border-primary-500 py-1"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                value={item.unit_price}
                                                onChange={(e) => updateLineItem(index, 'unit_price', e.target.value)}
                                                className="w-full text-right border-gray-200 rounded text-sm focus:ring-primary-500 focus:border-primary-500 py-1"
                                            />
                                        </td>
                                        <td className="p-3 text-right text-gray-900 font-semibold text-sm">
                                            ₹{item.total.toLocaleString()}
                                        </td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => removeLineItem(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {/* Add Row Button */}
                                <tr>
                                    <td colSpan="6" className="p-3 text-center border-t border-gray-100 bg-gray-50 bg-opacity-50">
                                        <button onClick={addLineItem} className="text-primary-600 hover:text-primary-800 text-xs font-bold uppercase tracking-widest flex items-center justify-center w-full">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Add Line Item
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 border-t border-gray-200">
                                    <td colSpan="4" className="p-4 text-right text-gray-500 font-medium text-sm">Grand Total</td>
                                    <td className="p-4 text-right text-gray-900 font-bold text-lg">₹{calculateGrandTotal().toLocaleString()}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Submit Footer */}
                    <div className="flex justify-end pt-4 space-x-4">
                        <button onClick={closeModal} className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                        <button
                            onClick={handleSubmit}
                            className="bg-green-600 text-white px-8 py-2 rounded hover:bg-green-700 font-bold shadow-md hover:shadow-lg transition-all"
                        >
                            Save Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Sale Orders</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage customer sales orders</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={openCreateModal}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
                        >
                            <span className="mr-2">+</span> New Order
                        </button>
                    )}
                </div>

                {/* List View */}
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
                            {filteredOrders.map((so) => (
                                <tr key={so.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">{so.so_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{so.customer_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(so.so_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{so.total_amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${so.status === 'confirm' ? 'bg-green-100 text-green-800' :
                                            so.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {so.status.charAt(0).toUpperCase() + so.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(so)} className="text-primary-600 hover:text-primary-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(so.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {(showCreateModal || showEditModal) && <Modal />}
        </div>
    );
};

export default SaleOrder;
