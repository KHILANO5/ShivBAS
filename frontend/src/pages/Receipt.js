import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI } from '../services/api';

const Receipt = () => {
    const { isAdmin } = useAuth();
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await paymentsAPI.getAll();
            setReceipts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading receipts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>
                    <p className="mt-2 text-sm text-gray-600">Manage receipts from customers</p>
                </div>
                <div className="card">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {receipts.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No receipts found</td></tr>
                            ) : (
                                receipts.map((receipt) => (
                                    <tr key={receipt.id}>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(receipt.payment_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">₹{parseFloat(receipt.payment_amount || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm">{receipt.payment_mode?.replace('_', ' ')}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{receipt.reference_number || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Receipt;
