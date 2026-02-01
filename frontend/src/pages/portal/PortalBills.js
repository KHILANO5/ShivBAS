import React, { useState, useEffect } from 'react';
import { billsAPI, paymentsAPI } from '../../services/api';

const PortalBills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentProcessing, setPaymentProcessing] = useState(null);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const res = await billsAPI.getAll();
            setBills(res.data.data.bills || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (bill) => {
        // Simulating PDF generation with a text file for now
        const billContent = `
            VENDOR BILL
            ------------------
            Bill ID: BILL-${bill.id}
            Date: ${new Date(bill.created_at).toLocaleDateString()}
            Status: ${bill.status}
            Payment: ${bill.payment_status}
            ------------------
            Description: Vendor Bill for services/goods
            Amount: ₹${bill.total_amount}
        `;

        const blob = new Blob([billContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BILL-${bill.id}.txt`;
        a.click();
    };

    const handlePay = async (bill) => {
        if (!window.confirm(`Pay ₹${bill.total_amount} for Bill #${bill.id} ? `)) return;

        setPaymentProcessing(bill.id);
        try {
            await paymentsAPI.create({
                bill_id: bill.id,
                amount: bill.total_amount,
                mode: 'bank'
            });
            alert('Bill Payment Successful!');
            fetchBills();
        } catch (error) {
            alert('Payment failed: ' + error.message);
        } finally {
            setPaymentProcessing(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading bills...</div>;

    return (
        <div className="card mt-8">
            <h2 className="text-2xl font-bold mb-6">My Bills (Payable)</h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Bill ID</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-500">
                                    No bills found.
                                </td>
                            </tr>
                        ) : (
                            bills.map((bill) => (
                                <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-primary-600 font-medium">BILL-{bill.id}</td>
                                    <td className="py-3 px-4 text-gray-600">
                                        {new Date(bill.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 font-semibold">
                                        ₹{bill.total_amount?.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px - 2 py - 1 rounded text - xs capitalize ${bill.status === 'posted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                                            } `}>
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px - 2 py - 1 rounded text - xs capitalize ${bill.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                bill.payment_status === 'partial' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                            } `}>
                                            {bill.payment_status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleDownload(bill)}
                                            className="text-gray-600 hover:text-primary-600 text-sm font-medium"
                                        >
                                            Download
                                        </button>

                                        {bill.payment_status !== 'paid' && (
                                            <button
                                                onClick={() => handlePay(bill)}
                                                disabled={paymentProcessing === bill.id}
                                                className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 disabled:opacity-50"
                                            >
                                                {paymentProcessing === bill.id ? 'Processing...' : 'Pay Now'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PortalBills;
