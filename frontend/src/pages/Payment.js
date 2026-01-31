import React, { useState, useEffect } from 'react';
import { mockAPI } from '../services/mockAPI';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
    const { isAdmin } = useAuth();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // list, razorpay_modal, success
    const [selectedBill, setSelectedBill] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const response = await mockAPI.getPurchaseBills();
            // Filter for unpaid bills
            const unpaid = response.data.data.filter(b => b.payment_status !== 'paid');
            setBills(unpaid);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const initiatePayment = (bill) => {
        setSelectedBill(bill);
        setView('razorpay_modal');
    };

    const confirmPayment = async () => {
        setProcessing(true);
        try {
            // 1. Create Payment Record
            await mockAPI.createPayment({
                bill_id: selectedBill.id,
                amount_paid: selectedBill.total_amount,
                payment_mode: 'gateway',
                transaction_id: `rzp_${Math.random().toString(36).substr(2, 9)}`,
            });

            // 2. Update Bill Status
            await mockAPI.updatePurchaseBill(selectedBill.id, {
                payment_status: 'paid',
                status: 'posted' // Ensure it's posted if paid
            });

            // 3. Show Success
            setView('success');
            fetchBills(); // Refresh list background
        } catch (error) {
            alert('Payment execution failed');
        } finally {
            setProcessing(false);
        }
    };

    // Razorpay Simulation Rendering
    const renderRazorpayModal = () => {
        if (!selectedBill) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden relative font-sans">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setView('list')} className="hover:bg-blue-700 p-1 rounded">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </button>
                            <div className="h-8 w-8 bg-white text-blue-600 rounded flex items-center justify-center font-bold text-lg">S</div>
                            <span className="font-medium text-lg">ShivBAS Enterprise</span>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-100 text-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                            <span>English</span>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex h-[450px]">
                        {/* Sidebar */}
                        <div className="w-1/3 bg-gray-50 border-r border-gray-200 py-2">
                            {[
                                { icon: 'PAY', label: 'UPI / QR', active: true },
                                { icon: 'CARD', label: 'Cards' },
                                { icon: 'NB', label: 'Netbanking' },
                                { icon: 'EMI', label: 'EMI' },
                                { icon: 'PL', label: 'Pay Later' },
                                { icon: 'W', label: 'Wallet' },
                            ].map((opt, idx) => (
                                <div key={idx} className={`px-4 py-3 flex items-center space-x-3 cursor-pointer ${opt.active ? 'bg-white border-l-4 border-blue-600 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${opt.active ? 'bg-blue-100' : 'bg-gray-200'}`}>{opt.icon}</div>
                                    <span className="text-sm font-medium">{opt.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Main Content */}
                        <div className="w-2/3 p-4 bg-white relative">
                            <h3 className="text-gray-800 font-bold mb-4">UPI / QR</h3>

                            <div className="border border-gray-200 rounded p-3 mb-3 hover:border-blue-500 cursor-pointer flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">G</div>
                                    <span className="text-sm font-medium">Google Pay</span>
                                </div>
                                <div className="w-4 h-4 border rounded-full"></div>
                            </div>

                            <div className="border border-gray-200 rounded p-3 mb-3 hover:border-blue-500 cursor-pointer flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">P</div>
                                    <span className="text-sm font-medium">PhonePe</span>
                                </div>
                                <div className="w-4 h-4 border rounded-full"></div>
                            </div>

                            <div className="border border-gray-200 rounded p-3 mb-3 hover:border-blue-500 cursor-pointer flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">P</div>
                                    <span className="text-sm font-medium">Paytm</span>
                                </div>
                                <div className="w-4 h-4 border rounded-full"></div>
                            </div>

                            <div className="border-t mt-4 pt-4 text-center">
                                <div className="text-xs text-gray-400 mb-2">Scan QR to Pay</div>
                                <div className="bg-gray-800 w-24 h-24 mx-auto rounded">
                                    {/* Mock QR */}
                                    <div className="w-full h-full p-2 grid grid-cols-4 gap-1">
                                        {Array(16).fill(0).map((_, i) => (
                                            <div key={i} className={`bg-white ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-20'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-900">₹{selectedBill.total_amount.toLocaleString()}</span>
                            <span className="text-xs text-blue-600 underline cursor-pointer">View Details</span>
                        </div>
                        <button
                            onClick={confirmPayment}
                            disabled={processing}
                            className={`bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700 transition flex items-center ${processing ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing...
                                </>
                            ) : 'Pay Now'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSuccessModal = () => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8">
                    <div className="flex items-center justify-center text-gray-400 text-xs mb-6">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        Secure checkout https://checkout.razorpay.com
                        <button onClick={() => setView('list')} className="ml-auto hover:bg-gray-100 rounded-full p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanks for your payment</h2>
                        <p className="text-gray-500 text-sm">A payment will appear on your statement</p>
                    </div>

                    <div className="bg-gray-50 rounded p-4 mb-6 flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Payment</span>
                        <span className="font-bold text-gray-900">₹{selectedBill?.total_amount.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-center text-xs text-gray-400 space-x-1">
                        <span>Powered by</span>
                        <span className="font-bold text-blue-900 italic">Razorpay</span>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-300 space-x-2">
                        <span className="underline">Terms</span>
                        <span className="underline">Privacy</span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage pending vendor payments</p>
                    </div>
                </div>

                {view === 'list' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {bills.length === 0 ? (
                            <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                                <svg className="w-16 h-16 text-green-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                                <p>No pending bills to pay.</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bills.map(bill => (
                                        <tr key={bill.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {bill.bill_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {bill.vendor_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(bill.due_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                ₹{bill.total_amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => initiatePayment(bill)}
                                                    className="bg-primary-600 text-white px-4 py-1.5 rounded-full hover:bg-primary-700 shadow-sm transition-all hover:shadow-md text-xs uppercase tracking-wide font-bold"
                                                >
                                                    Pay Now
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {view === 'razorpay_modal' && renderRazorpayModal()}
            {view === 'success' && renderSuccessModal()}
        </div>
    );
};

export default Payment;
