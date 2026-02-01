import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Razorpay API
const razorpayAPI = {
    getKey: () => api.get('/razorpay/key'),
    createOrder: (data) => api.post('/razorpay/create-order', data),
    verifyPayment: (data) => api.post('/razorpay/verify-payment', data),
    getPayments: () => api.get('/razorpay/payments'),
    getBalance: (type, id) => api.get(`/razorpay/balance/${type}/${id}`),
    directPayment: (data) => api.post('/razorpay/direct-payment', data),
};

// Load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-script')) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const PaymentGateway = () => {
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [balanceInfo, setBalanceInfo] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(false);
    
    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch pending invoices/bills
            const [billsRes, invoicesRes, paymentsRes] = await Promise.all([
                api.get('/purchase-bills'),
                api.get('/customer-invoices').catch(() => ({ data: { data: [] } })),
                razorpayAPI.getPayments().catch(() => ({ data: { data: [] } }))
            ]);
            
            const allBills = billsRes.data.data || [];
            const allInvoices = invoicesRes.data.data || [];
            
            // Combine bills and invoices, filter unpaid ones
            const pendingBills = allBills.filter(b => b.payment_status !== 'paid').map(b => ({ ...b, type: 'bill' }));
            const pendingInvoices = allInvoices.filter(i => i.payment_status !== 'paid').map(i => ({ ...i, type: 'invoice' }));
            
            setInvoices([...pendingInvoices, ...pendingBills]);
            setPayments(paymentsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Open payment modal and fetch balance
    const openPaymentModal = async (invoice) => {
        setSelectedInvoice(invoice);
        setShowPaymentModal(true);
        setLoadingBalance(true);
        setBalanceInfo(null);
        
        try {
            const invoiceType = invoice.type === 'bill' ? 'purchase_bill' : 'customer_invoice';
            const response = await razorpayAPI.getBalance(invoiceType, invoice.id);
            
            if (response.data.success) {
                setBalanceInfo(response.data.data);
                setPaymentAmount(response.data.data.balance.toFixed(2));
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
            // Fallback to total amount
            setPaymentAmount(parseFloat(invoice.total_amount).toFixed(2));
        } finally {
            setLoadingBalance(false);
        }
    };

    // Direct payment (simulated - for demo)
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
            setProcessingPayment(selectedInvoice.id);
            
            const invoiceType = selectedInvoice.type === 'bill' ? 'purchase_bill' : 'customer_invoice';
            const docNumber = selectedInvoice.bill_number || `INV-${selectedInvoice.id}`;

            // Make direct payment
            const response = await razorpayAPI.directPayment({
                amount: amount,
                invoice_id: selectedInvoice.id,
                invoice_type: invoiceType,
                payment_mode: 'gateway'
            });

            if (response.data.success) {
                const balance = response.data.balance;
                
                // Show success modal
                setSuccessData({
                    amount: amount,
                    docNumber: docNumber,
                    totalPaid: balance?.total_paid || amount,
                    remainingBalance: balance?.balance || 0,
                    paymentStatus: balance?.payment_status || 'paid'
                });
                
                setShowPaymentModal(false);
                setShowSuccessModal(true);
                fetchData();
            } else {
                alert(response.data.message || 'Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert(error.response?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setProcessingPayment(null);
        }
    };

    const handlePayNow = async () => {
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

        // Use direct payment for demo
        await handleDirectPayment();
    };

    const getStatusBadge = (status) => {
        const styles = {
            not_paid: 'bg-red-100 text-red-800',
            partial: 'bg-yellow-100 text-yellow-800',
            partial_paid: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            created: 'bg-blue-100 text-blue-800',
            failed: 'bg-red-100 text-red-800',
            success: 'bg-green-100 text-green-800'
        };
        const labels = {
            not_paid: 'Not Paid',
            partial: 'Partial',
            partial_paid: 'Partial',
            paid: 'Paid',
            created: 'Pending',
            failed: 'Failed',
            success: 'Success'
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{labels[status] || status}</span>;
    };

    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
    const formatCurrency = (amount) => `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const filteredInvoices = invoices.filter(inv => 
        inv.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPayments = payments.filter(pay =>
        pay.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pay.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading payment data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Payment Gateway</h1>
                    <p className="mt-2 text-sm text-gray-600">Process payments using Razorpay - UPI, Cards, Net Banking & more</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-red-100 text-red-600">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0))}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending Bills</p>
                                <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Completed Payments</p>
                                <p className="text-2xl font-bold text-gray-900">{payments.filter(p => p.status === 'paid').length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Collected</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0))}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'pending' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Pending Payments ({invoices.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'history' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Payment History ({payments.length})
                            </button>
                        </nav>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b">
                        <div className="relative max-w-md">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by bill number or customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    {activeTab === 'pending' ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                No pending payments found
                                            </td>
                                        </tr>
                                    ) : filteredInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className="text-primary-600 font-medium">{invoice.bill_number || `INV-${invoice.id}`}</span>
                                                <span className="ml-2 text-xs text-gray-500">({invoice.type})</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{invoice.customer_name || invoice.vendor_name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(invoice.bill_date || invoice.created_at)}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(invoice.total_amount)}</td>
                                            <td className="px-6 py-4">{getStatusBadge(invoice.payment_status)}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openPaymentModal(invoice)}
                                                    disabled={processingPayment === invoice.id}
                                                    className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all ${
                                                        processingPayment === invoice.id
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
                                                    }`}
                                                >
                                                    {processingPayment === invoice.id ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                            </svg>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            Pay Now
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                No payment history found
                                            </td>
                                        </tr>
                                    ) : filteredPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className="text-primary-600 font-mono text-sm">{payment.order_id}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{payment.customer_name || 'N/A'}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(payment.amount)}</td>
                                            <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono text-gray-500">{payment.payment_id || '-'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(payment.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Payment Methods Info */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Accepted Payment Methods</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-green-600 font-bold text-sm">UPI</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">UPI / QR</p>
                                <p className="text-xs text-gray-500">GPay, PhonePe, Paytm</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Cards</p>
                                <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Net Banking</p>
                                <p className="text-xs text-gray-500">All Indian Banks</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Wallets</p>
                                <p className="text-xs text-gray-500">PhonePe, Paytm & more</p>
                            </div>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Powered by Razorpay - Secure & PCI DSS Compliant
                    </p>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Make Payment</h3>
                                <button 
                                    onClick={() => setShowPaymentModal(false)}
                                    className="text-white hover:text-gray-200"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Invoice Details */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-500">Document</span>
                                    <span className="font-semibold text-primary-600">{selectedInvoice.bill_number || `INV-${selectedInvoice.id}`}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-500">Customer/Vendor</span>
                                    <span className="font-medium">{selectedInvoice.customer_name || selectedInvoice.vendor_name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Total Amount</span>
                                    <span className="font-bold text-lg">{formatCurrency(selectedInvoice.total_amount)}</span>
                                </div>
                            </div>

                            {/* Balance Info */}
                            {loadingBalance ? (
                                <div className="flex items-center justify-center py-4">
                                    <svg className="animate-spin h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    <span className="ml-2 text-gray-500">Calculating balance...</span>
                                </div>
                            ) : balanceInfo && (
                                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                    <h4 className="font-semibold text-blue-800 mb-3">Payment Summary</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-blue-700">Invoice Total:</span>
                                            <span className="font-medium">{formatCurrency(balanceInfo.total_amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-blue-700">Already Paid:</span>
                                            <span className="font-medium text-green-600">- {formatCurrency(balanceInfo.total_paid)}</span>
                                        </div>
                                        <div className="border-t border-blue-200 pt-2 mt-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-semibold text-blue-800">Remaining Balance:</span>
                                                <span className="font-bold text-lg text-blue-800">{formatCurrency(balanceInfo.balance)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Payment History */}
                                    {balanceInfo.payment_history && balanceInfo.payment_history.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-blue-200">
                                            <h5 className="text-sm font-medium text-blue-800 mb-2">Payment History:</h5>
                                            <div className="space-y-1 max-h-24 overflow-y-auto">
                                                {balanceInfo.payment_history.map((p, idx) => (
                                                    <div key={idx} className="flex justify-between text-xs">
                                                        <span className="text-blue-600">{formatDate(p.payment_date)}</span>
                                                        <span className="font-medium">{formatCurrency(p.amount_paid)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Payment Amount Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter amount"
                                    step="0.01"
                                    min="1"
                                    max={balanceInfo?.balance || selectedInvoice.total_amount}
                                />
                                {balanceInfo && parseFloat(paymentAmount) > balanceInfo.balance && (
                                    <p className="mt-1 text-sm text-red-500">
                                        Amount exceeds remaining balance of {formatCurrency(balanceInfo.balance)}
                                    </p>
                                )}
                                
                                {/* Quick Amount Buttons */}
                                {balanceInfo && (
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentAmount(balanceInfo.balance.toFixed(2))}
                                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                                        >
                                            Full Balance ({formatCurrency(balanceInfo.balance)})
                                        </button>
                                        {balanceInfo.balance > 1000 && (
                                            <button
                                                type="button"
                                                onClick={() => setPaymentAmount((balanceInfo.balance / 2).toFixed(2))}
                                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                                            >
                                                Half ({formatCurrency(balanceInfo.balance / 2)})
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={handlePayNow}
                                disabled={processingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0 || (balanceInfo && parseFloat(paymentAmount) > balanceInfo.balance)}
                                className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center ${
                                    processingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0 || (balanceInfo && parseFloat(paymentAmount) > balanceInfo.balance)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {processingPayment ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Pay {formatCurrency(paymentAmount || 0)}
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-4">
                                Secured Payment • Amount will be deducted from balance
                            </p>
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
                            <p className="text-green-100 mt-2">A payment will appear on your statement</p>
                        </div>

                        {/* Payment Details */}
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-lg p-4 border-b-4 border-dashed border-gray-200">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Payment</span>
                                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(successData.amount)}</span>
                                </div>
                            </div>

                            {/* Balance Summary */}
                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Document</span>
                                    <span className="font-medium text-primary-600">{successData.docNumber}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Total Paid</span>
                                    <span className="font-medium text-green-600">{formatCurrency(successData.totalPaid)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Remaining Balance</span>
                                    <span className={`font-bold text-lg ${successData.remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                        {formatCurrency(successData.remainingBalance)}
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

export default PaymentGateway;
