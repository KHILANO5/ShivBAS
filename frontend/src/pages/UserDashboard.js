import React, { useState, useEffect } from 'react';
import { mockAPI } from '../services/mockAPI';
import PaymentModal from '../components/PaymentModal';

const UserDashboard = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await mockAPI.getInvoices();
            setInvoices(res.data.data.invoices || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (invoice) => {
        try {
            // Call Mock API to record payment
            await mockAPI.payInvoice({
                invoice_id: invoice.id,
                amount: invoice.total_amount,
                mode: 'online'
            });
            // Refresh list
            await fetchInvoices();

            // Close modal after short delay
            setTimeout(() => {
                setSelectedInvoice(null);
            }, 2000);
        } catch (error) {
            alert('Payment recording failed: ' + error.message);
            setSelectedInvoice(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            Loading Portal...
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 font-sans p-8 flex justify-center">
            <div className="w-full max-w-5xl">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-light tracking-wide text-white mb-1">Customer Invoice Portal View</h1>
                    <p className="text-sm text-gray-500">Contact can only view own Invoice</p>
                </div>

                {/* Table Container */}
                <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800 shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-700 bg-gray-900 text-blue-400 text-sm uppercase tracking-wider">
                                <th className="p-4 font-medium">Invoice</th>
                                <th className="p-4 font-medium">Invoice Date</th>
                                <th className="p-4 font-medium">Due Date</th>
                                <th className="p-4 font-medium">Amount Due</th>
                                <th className="p-4 font-medium">Amount Due</th>
                                <th className="p-4 font-medium text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {invoices.map((inv) => {
                                // Calculate Due Date (simulated +30 days)
                                const invoiceDate = new Date(inv.created_at);
                                const dueDate = new Date(invoiceDate);
                                dueDate.setDate(dueDate.getDate() + 30);

                                const isPaid = inv.payment_status === 'paid';

                                return (
                                    <tr key={inv.id} className="hover:bg-gray-750 transition-colors">
                                        <td className="p-4 text-pink-500 font-medium">
                                            INV-{inv.id}
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {invoiceDate.toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {dueDate.toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            {isPaid ? '0.00 Rs' : `${inv.total_amount} Rs`}
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            {isPaid ? '0.00 Rs' : `${inv.total_amount} Rs`}
                                        </td>
                                        <td className="p-4 text-center">
                                            {isPaid ? (
                                                <span className="text-green-500 font-medium">Paid</span>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedInvoice(inv)}
                                                    className="text-pink-500 hover:text-pink-400 font-medium underline decoration-pink-500/30 underline-offset-4"
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {/* Empty rows to mimic the screenshot look if few invoices */}
                            {Array.from({ length: Math.max(0, 8 - invoices.length) }).map((_, i) => (
                                <tr key={`empty-${i}`} className="h-14">
                                    <td colSpan="6"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            {selectedInvoice && (
                <PaymentModal
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default UserDashboard;
