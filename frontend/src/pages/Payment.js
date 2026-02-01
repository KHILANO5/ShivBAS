import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI, transactionsAPI, contactsAPI } from '../services/api';

const Payment = () => {
    const { isAdmin } = useAuth();
    const [payments, setPayments] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        transaction_id: '',
        payment_amount: '',
        payment_mode: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentsRes, transactionsRes, contactsRes] = await Promise.all([
                paymentsAPI.getAll(),
                transactionsAPI.getAll(),
                contactsAPI.getAll()
            ]);

            setPayments(paymentsRes.data.data || []);
            setTransactions(transactionsRes.data.data || []);
            setContacts(contactsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();
        
        try {
            const response = await paymentsAPI.create(formData);
            if (response.data.success) {
                alert('Payment recorded successfully!');
                setShowCreateModal(false);
                resetForm();
                await fetchData();
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            alert(error.response?.data?.message || 'Failed to record payment');
        }
    };

    const resetForm = () => {
        setFormData({
            transaction_id: '',
            payment_amount: '',
            payment_mode: 'cash',
            payment_date: new Date().toISOString().split('T')[0],
            reference_number: '',
            notes: ''
        });
    };

    const filteredPayments = payments.filter(payment => {
        const matchesType = filterType === 'all' || payment.payment_mode === filterType;
        const matchesSearch = searchTerm === '' || 
            payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading payments...</p>
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
                            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
                            <p className="mt-2 text-sm text-gray-600">Manage payments to vendors and from customers</p>
                        </div>
                        {isAdmin && (
                            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                                <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Record Payment
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field">
                            <option value="all">All Payment Methods</option>
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="check">Check</option>
                            <option value="upi">UPI</option>
                            <option value="card">Card</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Search by reference number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field"
                        />
                    </div>
                </div>

                {/* Payments Table */}
                <div className="card overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No payments found. {isAdmin && 'Record your first payment!'}
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(payment.payment_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {transactions.find(t => t.id === payment.transaction_id)?.transaction_number || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            ₹{parseFloat(payment.payment_amount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {payment.payment_mode?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {payment.reference_number || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create Payment Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-8 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Record Payment</h3>
                                <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleCreatePayment}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction *</label>
                                        <select
                                            value={formData.transaction_id}
                                            onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                                            className="input-field"
                                            required
                                        >
                                            <option value="">Select Transaction</option>
                                            {transactions.map(txn => (
                                                <option key={txn.id} value={txn.id}>
                                                    {txn.transaction_number} - ₹{parseFloat(txn.total_amount).toLocaleString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                                            <input
                                                type="number"
                                                value={formData.payment_amount}
                                                onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
                                                className="input-field"
                                                required
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
                                            <select
                                                value={formData.payment_mode}
                                                onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                                                className="input-field"
                                                required
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="check">Check</option>
                                                <option value="upi">UPI</option>
                                                <option value="card">Card</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                                            <input
                                                type="date"
                                                value={formData.payment_date}
                                                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                                className="input-field"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                                            <input
                                                type="text"
                                                value={formData.reference_number}
                                                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                                className="input-field"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="input-field"
                                            rows="3"
                                            placeholder="Optional notes"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="btn-secondary">
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-primary">Record Payment</button>
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

export default Payment;
