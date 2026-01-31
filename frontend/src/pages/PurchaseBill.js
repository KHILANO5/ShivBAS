import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { billsAPI, contactsAPI, analyticsAPI, productsAPI } from '../services/api';

const PurchaseBill = () => {
    const { isAdmin } = useAuth();
    const [bills, setBills] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        vendor_id: '',
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
            const [billsRes, vendorsRes, analyticsRes, productsRes] = await Promise.all([
                billsAPI.getAll(),
                contactsAPI.getAll({ type: 'vendor' }),
                analyticsAPI.getAll(),
                productsAPI.getAll()
            ]);

            setBills(billsRes.data.data || []);
            setVendors(vendorsRes.data.data || []);
            setAnalytics(analyticsRes.data.data || []);
            setProducts(productsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBill = async (e) => {
        e.preventDefault();
        
        try {
            const response = await billsAPI.create(formData);
            if (response.data.success) {
                alert('Bill created successfully!');
                setShowCreateModal(false);
                resetForm();
                await fetchData();
            }
        } catch (error) {
            console.error('Error creating bill:', error);
            alert(error.response?.data?.message || 'Failed to create bill');
        }
    };

    const resetForm = () => {
        setFormData({
            vendor_id: '',
            analytics_id: '',
            status: 'draft',
            payment_status: 'not_paid',
            line_items: [{ product_id: '', quantity: 1, unit_price: '', tax_amount: 0 }]
        });
    };

    const addLineItem = () => {
        setFormData({
            ...formData,
            line_items: [...formData.line_items, { product_id: '', quantity: 1, unit_price: '', tax_amount: 0 }]
        });
    };

    const removeLineItem = (index) => {
        const newLineItems = formData.line_items.filter((_, i) => i !== index);
        setFormData({ ...formData, line_items: newLineItems });
    };

    const updateLineItem = (index, field, value) => {
        const newLineItems = [...formData.line_items];
        newLineItems[index][field] = value;
        setFormData({ ...formData, line_items: newLineItems });
    };

    // Filter bills
    const filteredBills = bills.filter(bill => {
        const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
        const matchesPayment = filterPaymentStatus === 'all' || bill.payment_status === filterPaymentStatus;
        const matchesSearch = searchTerm === '' || 
            bill.transaction_number?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesPayment && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading purchase bills...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Purchase Bills</h1>
                            <p className="mt-2 text-sm text-gray-600">Manage vendor bills and purchases</p>
                        </div>
                        {isAdmin && (
                            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                                <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Bill
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field">
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="posted">Posted</option>
                        </select>
                        <select value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)} className="input-field">
                            <option value="all">All Payment Status</option>
                            <option value="not_paid">Not Paid</option>
                            <option value="partial_paid">Partially Paid</option>
                            <option value="full_paid">Fully Paid</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field"
                        />
                    </div>
                </div>

                {/* Bills Table */}
                <div className="card overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBills.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No bills found. {isAdmin && 'Create your first bill!'}
                                    </td>
                                </tr>
                            ) : (
                                filteredBills.map((bill) => (
                                    <tr key={bill.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{bill.transaction_number}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {vendors.find(v => v.id === bill.partner_id)?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            ₹{parseFloat(bill.total_amount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                bill.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(bill.transaction_date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create Modal - Simplified for now */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-8 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Create Purchase Bill</h3>
                                <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleCreateBill}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Vendor *</label>
                                        <select
                                            value={formData.vendor_id}
                                            onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                                            className="input-field"
                                            required
                                        >
                                            <option value="">Select Vendor</option>
                                            {vendors.map(vendor => (
                                                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="btn-secondary">
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-primary">Create Bill</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseBill;

