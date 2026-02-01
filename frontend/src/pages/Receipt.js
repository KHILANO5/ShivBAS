import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI, contactsAPI, invoicesAPI, saleOrdersAPI } from '../services/api';

const Receipt = () => {
    const { isAdmin } = useAuth();
    const [receipts, setReceipts] = useState([]);
    const [partners, setPartners] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [saleOrders, setSaleOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const printRef = useRef();

    const [formData, setFormData] = useState({
        payment_type: 'receive',
        partner_id: '',
        partner_name: '',
        invoice_id: '',
        sale_order_id: '',
        amount: 0,
        payment_date: new Date().toISOString().split('T')[0],
        payment_mode: 'bank',
        note: '',
        status: 'draft'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentsRes, contactsRes, invoicesRes, saleOrdersRes] = await Promise.all([
                paymentsAPI.getAll(),
                contactsAPI.getAll(),
                invoicesAPI.getAll(),
                saleOrdersAPI.getAll()
            ]);

            const paymentsData = paymentsRes.data.data || [];
            const contactsData = contactsRes.data.data || contactsRes.data || [];
            const invoicesData = invoicesRes.data.data || invoicesRes.data || [];
            const ordersData = saleOrdersRes.data.data || saleOrdersRes.data || [];

            // Enrich payments with partner info
            const enrichedReceipts = enrichPaymentsWithPartners(paymentsData, invoicesData, ordersData, contactsData);
            
            setReceipts(enrichedReceipts);
            setPartners(contactsData);
            setInvoices(invoicesData);
            setSaleOrders(ordersData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const enrichPaymentsWithPartners = (payments, invoices, orders, contacts) => {
        return payments.map((payment, index) => {
            let partnerName = 'Unknown';
            let type = 'incoming';
            let linkedDoc = null;

            if (payment.invoice_id) {
                const invoice = invoices.find(inv => inv.id === payment.invoice_id);
                if (invoice) {
                    partnerName = invoice.customer_name || 'Customer';
                    linkedDoc = `INV-${String(payment.invoice_id).padStart(5, '0')}`;
                }
                type = 'incoming';
            } else if (payment.bill_id) {
                type = 'outgoing';
                partnerName = 'Vendor';
                linkedDoc = `BILL-${String(payment.bill_id).padStart(5, '0')}`;
            }

            return {
                ...payment,
                receipt_number: `Pay/${new Date(payment.payment_date).getFullYear().toString().slice(-2)}/${String(index + 1).padStart(4, '0')}`,
                partner_name: partnerName,
                type: type,
                linked_document: linkedDoc
            };
        });
    };

    const generateReceiptNumber = () => {
        const year = new Date().getFullYear().toString().slice(-2);
        const count = receipts.length + 1;
        return `Pay/${year}/${String(count).padStart(4, '0')}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'invoice_id' && value) {
            const invoice = invoices.find(inv => inv.id === parseInt(value));
            if (invoice) {
                const amountDue = parseFloat(invoice.total_amount) - (parseFloat(invoice.amount_paid) || 0);
                setFormData(prev => ({
                    ...prev,
                    partner_id: invoice.customer_id,
                    partner_name: invoice.customer_name,
                    amount: amountDue > 0 ? amountDue : parseFloat(invoice.total_amount)
                }));
            }
        }

        if (name === 'sale_order_id' && value) {
            const order = saleOrders.find(so => so.id === parseInt(value));
            if (order) {
                setFormData(prev => ({
                    ...prev,
                    partner_id: order.customer_id,
                    partner_name: order.customer_name,
                    amount: parseFloat(order.total_amount) || 0
                }));
            }
        }

        if (name === 'partner_id' && value) {
            const partner = partners.find(p => p.id === parseInt(value));
            if (partner) {
                setFormData(prev => ({ ...prev, partner_name: partner.name }));
            }
        }
    };

    const handleCreateReceipt = async (e) => {
        e.preventDefault();
        try {
            const paymentData = {
                invoice_id: formData.invoice_id || null,
                bill_id: formData.payment_type === 'send' ? formData.invoice_id : null,
                amount_paid: parseFloat(formData.amount),
                payment_date: formData.payment_date,
                payment_mode: formData.payment_mode,
                notes: formData.note
            };

            if (formData.payment_type === 'receive' && formData.invoice_id) {
                await paymentsAPI.create(paymentData);
            } else {
                await paymentsAPI.create({ ...paymentData, invoice_id: formData.invoice_id || 1 });
            }

            alert('Receipt created successfully!');
            setShowCreateModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error creating receipt:', error);
            alert('Failed to create receipt: ' + (error.response?.data?.error || error.message));
        }
    };

    const resetForm = () => {
        setFormData({
            payment_type: 'receive',
            partner_id: '',
            partner_name: '',
            invoice_id: '',
            sale_order_id: '',
            amount: 0,
            payment_date: new Date().toISOString().split('T')[0],
            payment_mode: 'bank',
            note: '',
            status: 'draft'
        });
    };

    const handleViewReceipt = (receipt) => {
        setSelectedReceipt(receipt);
        setShowViewModal(true);
    };

    const handlePrintReceipt = () => {
        const printContent = document.getElementById('receipt-print-area');
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('receipt-print-area');
        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
            margin: 10,
            filename: `Receipt_${selectedReceipt?.receipt_number?.replace(/\//g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const filteredReceipts = receipts.filter(receipt => {
        if (filterType === 'all') return true;
        return receipt.type === filterType;
    });

    const stats = {
        totalIncoming: receipts.filter(r => r.type === 'incoming').reduce((sum, r) => sum + parseFloat(r.amount_paid || 0), 0),
        totalOutgoing: receipts.filter(r => r.type === 'outgoing').reduce((sum, r) => sum + parseFloat(r.amount_paid || 0), 0),
        totalReceipts: receipts.length
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
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Receipts & Vouchers</h1>
                        <p className="mt-2 text-sm text-gray-600">Manage incoming and outgoing payments</p>
                    </div>
                    {isAdmin && (
                        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Receipt
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Incoming</p>
                                <p className="text-2xl font-bold text-green-600">₹{stats.totalIncoming.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-red-100 text-red-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Outgoing</p>
                                <p className="text-2xl font-bold text-red-600">₹{stats.totalOutgoing.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Receipts</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalReceipts}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6 p-4">
                    <div className="flex gap-4">
                        <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-lg font-medium ${filterType === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
                        <button onClick={() => setFilterType('incoming')} className={`px-4 py-2 rounded-lg font-medium ${filterType === 'incoming' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Incoming</button>
                        <button onClick={() => setFilterType('outgoing')} className={`px-4 py-2 rounded-lg font-medium ${filterType === 'outgoing' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Outgoing</button>
                    </div>
                </div>

                {/* Receipts Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReceipts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        No receipts found
                                    </td>
                                </tr>
                            ) : (
                                filteredReceipts.map((receipt) => (
                                    <tr key={receipt.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{receipt.receipt_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(receipt.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' })}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{receipt.partner_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${receipt.type === 'incoming' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                                {receipt.type === 'incoming' ? 'Incoming' : 'Outgoing'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{parseFloat(receipt.amount_paid || 0).toLocaleString('en-IN')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded ${receipt.status === 'completed' ? 'bg-green-100 text-green-700' : receipt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {receipt.status || 'draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button onClick={() => handleViewReceipt(receipt)} className="text-primary-600 hover:text-primary-900 font-medium">Details</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Receipt Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded">NEW</span>
                                    <span className="text-gray-600">{generateReceiptNumber()}</span>
                                </div>
                                <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">Confirm</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Print</button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Send</button>
                                <button className="px-4 py-2 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-50">Cancel</button>
                                <div className="ml-auto flex gap-1">
                                    <button className={`px-4 py-2 rounded-lg font-medium ${formData.status === 'draft' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`} onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}>Draft</button>
                                    <button className={`px-4 py-2 rounded-lg font-medium ${formData.status === 'confirmed' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`} onClick={() => setFormData(prev => ({ ...prev, status: 'confirmed' }))}>Confirm</button>
                                    <button className={`px-4 py-2 rounded-lg font-medium ${formData.status === 'cancelled' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`} onClick={() => setFormData(prev => ({ ...prev, status: 'cancelled' }))}>Cancelled</button>
                                </div>
                            </div>

                            <form onSubmit={handleCreateReceipt} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center">
                                                <input type="radio" name="payment_type" value="send" checked={formData.payment_type === 'send'} onChange={handleInputChange} className="mr-2" />
                                                Send
                                            </label>
                                            <label className="flex items-center">
                                                <input type="radio" name="payment_type" value="receive" checked={formData.payment_type === 'receive'} onChange={handleInputChange} className="mr-2" />
                                                Receive
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                        <input type="date" name="payment_date" value={formData.payment_date} onChange={handleInputChange} className="input-field" required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Partner</label>
                                        <select name="partner_id" value={formData.partner_id} onChange={handleInputChange} className="input-field">
                                            <option value="">Select Partner</option>
                                            {partners.filter(p => formData.payment_type === 'receive' ? p.type === 'customer' : p.type === 'vendor').map(partner => (
                                                <option key={partner.id} value={partner.id}>{partner.name}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">( auto fill from Invoice/Bill )</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Via</label>
                                        <select name="payment_mode" value={formData.payment_mode} onChange={handleInputChange} className="input-field" required>
                                            <option value="bank">Bank</option>
                                            <option value="cash">Cash</option>
                                            <option value="upi">UPI</option>
                                            <option value="gateway">Payment Gateway</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Link to Invoice</label>
                                        <select name="invoice_id" value={formData.invoice_id} onChange={handleInputChange} className="input-field">
                                            <option value="">Select Invoice (optional)</option>
                                            {invoices.filter(inv => inv.payment_status !== 'paid').map(invoice => (
                                                <option key={invoice.id} value={invoice.id}>INV-{String(invoice.id).padStart(5, '0')} - {invoice.customer_name} (₹{parseFloat(invoice.total_amount).toLocaleString()})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Link to Sale Order</label>
                                        <select name="sale_order_id" value={formData.sale_order_id} onChange={handleInputChange} className="input-field">
                                            <option value="">Select Sale Order (optional)</option>
                                            {saleOrders.map(order => (
                                                <option key={order.id} value={order.id}>{order.order_number} - {order.customer_name} (₹{parseFloat(order.total_amount).toLocaleString()})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                            <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="input-field pl-8" step="0.01" min="0" required />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">( auto fill amount due )</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                                        <input type="text" name="note" value={formData.note} onChange={handleInputChange} className="input-field" placeholder="Alpha numeric" />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button type="submit" className="px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600">Save Transaction</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Receipt Modal with Print */}
            {showViewModal && selectedReceipt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Receipt Details</h2>
                                <button onClick={() => { setShowViewModal(false); setSelectedReceipt(null); }} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <button onClick={handlePrintReceipt} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print
                                </button>
                                <button onClick={handleDownloadPDF} className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </button>
                            </div>

                            {/* Printable Receipt */}
                            <div id="receipt-print-area" ref={printRef} className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="text-center border-b border-gray-200 pb-4 mb-4">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-900">ShivBAS</h1>
                                    </div>
                                    <p className="text-sm text-gray-600">Budget & Analytics System</p>
                                    <h2 className="text-lg font-semibold text-gray-800 mt-3">PAYMENT RECEIPT</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-xs text-gray-500">Receipt No.</p>
                                        <p className="font-semibold text-gray-900">{selectedReceipt.receipt_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Date</p>
                                        <p className="font-semibold text-gray-900">{new Date(selectedReceipt.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <p className="text-xs text-gray-500 mb-1">Received From</p>
                                    <p className="font-semibold text-gray-900 text-lg">{selectedReceipt.partner_name}</p>
                                </div>

                                <div className="border-2 border-dashed border-primary-300 rounded-lg p-6 text-center mb-6 bg-primary-50">
                                    <p className="text-sm text-gray-600 mb-1">Amount Received</p>
                                    <p className="text-4xl font-bold text-primary-600">₹{parseFloat(selectedReceipt.amount_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    <p className="text-sm text-gray-600 mt-2">({numberToWords(parseFloat(selectedReceipt.amount_paid || 0))} Rupees Only)</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Payment Mode</span>
                                        <span className="font-medium text-gray-900 capitalize">{selectedReceipt.payment_mode}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-600">Transaction Type</span>
                                        <span className={`font-medium ${selectedReceipt.type === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedReceipt.type === 'incoming' ? 'Incoming Payment' : 'Outgoing Payment'}
                                        </span>
                                    </div>
                                    {selectedReceipt.transaction_id && (
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Transaction ID</span>
                                            <span className="font-medium text-gray-900">{selectedReceipt.transaction_id}</span>
                                        </div>
                                    )}
                                    {selectedReceipt.linked_document && (
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Linked Document</span>
                                            <span className="font-medium text-primary-600">{selectedReceipt.linked_document}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Status</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${selectedReceipt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {selectedReceipt.status || 'Completed'}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4 mt-6">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="text-center">
                                            <div className="h-16 border-b border-gray-300 mb-2"></div>
                                            <p className="text-xs text-gray-500">Receiver's Signature</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="h-16 border-b border-gray-300 mb-2"></div>
                                            <p className="text-xs text-gray-500">Authorized Signature</p>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs text-gray-400 mt-4">This is a computer generated receipt. Generated on {new Date().toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to convert number to words (Indian numbering)
const numberToWords = (num) => {
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const numToWords = (n) => {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
        if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
        if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
        return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
    };
    return numToWords(Math.floor(num));
};

export default Receipt;
