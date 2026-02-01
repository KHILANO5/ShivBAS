import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

const CustomerInvoices = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [paymentLoading, setPaymentLoading] = useState(false);
    
    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [balanceInfo, setBalanceInfo] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(false);
    
    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const fetchInvoices = async () => {
        try {
            const token = localStorage.getItem('token');
            let url = `${API_BASE}/customer-portal/invoices`;
            if (filterStatus !== 'all') {
                url += `?payment_status=${filterStatus}`;
            }
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setInvoices(data.data);
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus]);

    const handleViewInvoice = async (invoiceId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/customer-portal/invoices/${invoiceId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSelectedInvoice(data.data);
                setShowViewModal(true);
            }
        } catch (error) {
            console.error('Error fetching invoice:', error);
        }
    };

    // Open payment modal and fetch balance
    const openPaymentModal = async (invoice) => {
        setSelectedInvoice(invoice);
        setShowPaymentModal(true);
        setLoadingBalance(true);
        setBalanceInfo(null);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/razorpay/balance/customer_invoice/${invoice.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                setBalanceInfo(data.data);
                setPaymentAmount(data.data.balance.toFixed(2));
            } else {
                // Fallback to total amount
                setPaymentAmount(parseFloat(invoice.total_amount).toFixed(2));
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
            setPaymentAmount(parseFloat(invoice.total_amount).toFixed(2));
        } finally {
            setLoadingBalance(false);
        }
    };

    // Direct payment handler
    const handleDirectPayment = async () => {
        if (!selectedInvoice || !paymentAmount) return;
        
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        // Check if amount exceeds balance
        if (balanceInfo && amount > balanceInfo.balance) {
            alert(`Payment amount (₹${amount}) exceeds remaining balance (₹${balanceInfo.balance.toFixed(2)})`);
            return;
        }

        try {
            setPaymentLoading(true);
            const token = localStorage.getItem('token');
            const docNumber = `INV-${String(selectedInvoice.id).padStart(5, '0')}`;

            // Make direct payment
            const response = await fetch(`${API_BASE}/razorpay/direct-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: amount,
                    invoice_id: selectedInvoice.id,
                    invoice_type: 'customer_invoice',
                    payment_mode: 'gateway'
                })
            });
            const data = await response.json();

            if (data.success) {
                const balance = data.balance;
                
                // Show success modal
                setSuccessData({
                    amount: amount,
                    docNumber: docNumber,
                    totalPaid: balance?.total_paid || amount,
                    remainingBalance: balance?.balance || 0,
                    paymentStatus: balance?.payment_status || 'paid'
                });
                
                setShowPaymentModal(false);
                setShowViewModal(false);
                setShowSuccessModal(true);
                fetchInvoices();
            } else {
                alert(data.message || 'Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handlePayInvoice = async (invoice) => {
        openPaymentModal(invoice);
    };

    const handleDownloadPDF = async (invoice) => {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = document.getElementById('invoice-print-area');
        const opt = {
            margin: 10,
            filename: `Invoice_INV-${String(invoice.id).padStart(5, '0')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h1 className="text-xl font-bold text-gray-900">ShivBAS</h1>
                                <p className="text-xs text-gray-500">Customer Portal</p>
                            </div>
                        </div>
                        <nav className="flex items-center space-x-6">
                            <Link to="/customer/dashboard" className="text-gray-600 hover:text-primary-600">Dashboard</Link>
                            <Link to="/customer/invoices" className="text-primary-600 font-medium">My Invoices</Link>
                            <Link to="/customer/orders" className="text-gray-600 hover:text-primary-600">My Orders</Link>
                            <div className="flex items-center ml-6">
                                <span className="text-sm text-gray-600 mr-4">Welcome, {user?.name}</span>
                                <button onClick={handleLogout} className="text-red-600 hover:text-red-800 text-sm font-medium">Logout</button>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Invoices</h2>
                        <p className="text-gray-600 mt-1">View and pay your invoices</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6 p-4">
                    <div className="flex gap-4">
                        {['all', 'not_paid', 'partial', 'paid'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg font-medium ${
                                    filterStatus === status
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {status === 'all' ? 'All' : status === 'not_paid' ? 'Unpaid' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No invoices found</td>
                                </tr>
                            ) : (
                                invoices.map(invoice => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            INV-{String(invoice.id).padStart(5, '0')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(invoice.created_at).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            ₹{parseFloat(invoice.total_amount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded ${
                                                invoice.status === 'posted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded ${
                                                invoice.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                invoice.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {invoice.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewInvoice(invoice.id)}
                                                    className="text-primary-600 hover:text-primary-800 font-medium"
                                                >
                                                    View
                                                </button>
                                                {invoice.payment_status !== 'paid' && (
                                                    <button
                                                        onClick={() => handlePayInvoice(invoice)}
                                                        disabled={paymentLoading}
                                                        className="text-green-600 hover:text-green-800 font-medium"
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* View Invoice Modal */}
            {showViewModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
                                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => handleDownloadPDF(selectedInvoice)}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </button>
                                {selectedInvoice.payment_status !== 'paid' && (
                                    <button
                                        onClick={() => handlePayInvoice(selectedInvoice)}
                                        disabled={paymentLoading}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        Pay Now
                                    </button>
                                )}
                            </div>

                            {/* Invoice Content */}
                            <div id="invoice-print-area" className="bg-white border border-gray-200 rounded-lg p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">ShivBAS</h1>
                                            <p className="text-sm text-gray-500">Budget & Analytics System</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                                        <p className="text-gray-600">INV-{String(selectedInvoice.id).padStart(5, '0')}</p>
                                        <p className="text-sm text-gray-500">{new Date(selectedInvoice.created_at).toLocaleDateString('en-IN')}</p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Bill To:</p>
                                    <p className="font-semibold text-gray-900">{selectedInvoice.customer_name}</p>
                                    {selectedInvoice.customer_email && <p className="text-sm text-gray-600">{selectedInvoice.customer_email}</p>}
                                    {selectedInvoice.customer_phone && <p className="text-sm text-gray-600">{selectedInvoice.customer_phone}</p>}
                                </div>

                                {/* Line Items */}
                                <table className="w-full mb-8">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-2 text-gray-600">#</th>
                                            <th className="text-left py-2 text-gray-600">Item</th>
                                            <th className="text-center py-2 text-gray-600">Qty</th>
                                            <th className="text-right py-2 text-gray-600">Rate</th>
                                            <th className="text-right py-2 text-gray-600">Tax</th>
                                            <th className="text-right py-2 text-gray-600">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(selectedInvoice.items || []).map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100">
                                                <td className="py-3">{index + 1}</td>
                                                <td className="py-3">{item.product_name || 'Product'}</td>
                                                <td className="py-3 text-center">{item.quantity}</td>
                                                <td className="py-3 text-right">₹{parseFloat(item.unit_price).toLocaleString('en-IN')}</td>
                                                <td className="py-3 text-right">₹{parseFloat(item.tax_amount || 0).toLocaleString('en-IN')}</td>
                                                <td className="py-3 text-right font-medium">
                                                    ₹{((item.quantity * parseFloat(item.unit_price)) + parseFloat(item.tax_amount || 0)).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Total */}
                                <div className="flex justify-end">
                                    <div className="w-64">
                                        <div className="flex justify-between py-2 border-b border-gray-200">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-medium">₹{parseFloat(selectedInvoice.total_amount).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between py-3 text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-primary-600">₹{parseFloat(selectedInvoice.total_amount).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-600">Payment Status</span>
                                            <span className={`px-2 py-1 text-xs rounded ${
                                                selectedInvoice.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                selectedInvoice.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {selectedInvoice.payment_status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Make Payment</h3>
                                <button 
                                    onClick={() => setShowPaymentModal(false)}
                                    className="text-white/80 hover:text-white"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Invoice Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Invoice</span>
                                    <span className="font-bold text-primary-600">
                                        INV-{String(selectedInvoice.id).padStart(5, '0')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="font-semibold">₹{parseFloat(selectedInvoice.total_amount).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {/* Balance Info */}
                            {loadingBalance ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                    <p className="text-gray-500 mt-2">Loading balance...</p>
                                </div>
                            ) : balanceInfo && (
                                <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-blue-700">Total Paid</span>
                                        <span className="font-semibold text-green-600">₹{balanceInfo.total_paid.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700 font-medium">Balance Due</span>
                                        <span className="font-bold text-xl text-orange-600">₹{balanceInfo.balance.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            )}

                            {/* Payment Amount Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">₹</span>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-semibold"
                                        placeholder="Enter amount"
                                    />
                                </div>
                                {balanceInfo && parseFloat(paymentAmount) > balanceInfo.balance && (
                                    <p className="text-red-500 text-sm mt-1">Amount exceeds balance due</p>
                                )}
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={handleDirectPayment}
                                disabled={paymentLoading || !paymentAmount || parseFloat(paymentAmount) <= 0}
                                className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {paymentLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        Pay ₹{parseFloat(paymentAmount || 0).toLocaleString('en-IN')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && successData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Success Header */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white">Thanks for your payment</h3>
                            <p className="text-green-100 mt-2">Your payment has been processed successfully</p>
                        </div>

                        {/* Payment Details */}
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-lg p-4 border-b-4 border-dashed border-gray-200">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Payment</span>
                                    <span className="text-2xl font-bold text-gray-900">₹{parseFloat(successData.amount).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {/* Balance Summary */}
                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Invoice</span>
                                    <span className="font-medium text-primary-600">{successData.docNumber}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Total Paid</span>
                                    <span className="font-medium text-green-600">₹{parseFloat(successData.totalPaid).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Remaining Balance</span>
                                    <span className={`font-bold text-lg ${successData.remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                        ₹{parseFloat(successData.remainingBalance).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm pt-2 border-t">
                                    <span className="text-gray-500">Payment Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        successData.paymentStatus === 'paid' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {successData.paymentStatus === 'paid' ? 'FULLY PAID' : 'PARTIAL'}
                                    </span>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    setSuccessData(null);
                                }}
                                className="w-full mt-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerInvoices;
