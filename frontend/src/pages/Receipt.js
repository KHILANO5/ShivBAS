import React, { useState, useEffect } from 'react';
import { mockAPI } from '../services/mockAPI';
import { useAuth } from '../context/AuthContext';

const Receipt = () => {
    const { isAdmin } = useAuth();
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [contacts, setContacts] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        type: 'receive',
        partner_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        payment_mode: 'bank',
        note: '',
        status: 'draft'
    });
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [receiptsRes, contactsRes] = await Promise.all([
                mockAPI.getReceipts(),
                mockAPI.getContacts()
            ]);
            setReceipts(receiptsRes.data.data);
            setContacts(contactsRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (receipt = null) => {
        if (receipt) {
            setSelectedReceipt(receipt);
            setFormData({
                type: receipt.type,
                partner_id: receipt.partner_id,
                amount: receipt.amount,
                date: receipt.date,
                payment_mode: receipt.payment_mode,
                note: receipt.note,
                status: receipt.status
            });
        } else {
            setSelectedReceipt(null);
            setFormData({
                type: 'receive',
                partner_id: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                payment_mode: 'bank',
                note: '',
                status: 'draft'
            });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedReceipt(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const payload = { ...formData, partner_id: parseInt(formData.partner_id), amount: parseFloat(formData.amount) };
            if (selectedReceipt) {
                await mockAPI.updateReceipt(selectedReceipt.id, payload);
            } else {
                await mockAPI.createReceipt(payload);
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save receipt');
        }
    };

    const handleAction = async (action) => {
        if (action === 'confirm') {
            setFormData(prev => ({ ...prev, status: 'confirm' }));
            // In a real app, this might trigger handleSubmit immediately
        } else if (action === 'cancel') {
            setFormData(prev => ({ ...prev, status: 'cancelled' }));
        }
    };

    // Stepper Helper
    const getStatusStepClass = (stepRequest, currentStatus) => {
        const statuses = ['draft', 'confirm', 'cancelled'];
        const currentIndex = statuses.indexOf(currentStatus);
        const requestIndex = statuses.indexOf(stepRequest);

        if (currentStatus === stepRequest) return 'bg-primary-600 text-white border-primary-600';
        if (currentIndex > requestIndex && currentStatus !== 'cancelled') return 'bg-green-500 text-white border-green-500';
        if (currentStatus === 'cancelled' && stepRequest === 'cancelled') return 'bg-red-600 text-white border-red-600';
        return 'bg-gray-100 text-gray-500 border-gray-200';
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    const Modal = () => (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200 font-sans">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <div className="flex space-x-3 items-center">
                        <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-primary-200">
                            {selectedReceipt ? 'Edit' : 'New'}
                        </span>
                        <span className="text-gray-500 text-sm font-mono">
                            {selectedReceipt ? selectedReceipt.receipt_number : 'Pay/XX/XXXX'}
                        </span>
                    </div>
                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Actions & Stepper */}
                <div className="px-6 py-4 bg-white border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex space-x-2">
                        <button type="button" onClick={() => handleAction('confirm')} className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-primary-700 shadow-sm transition-colors">Confirm</button>
                        <button type="button" className="bg-white text-gray-700 px-4 py-2 rounded-md font-medium text-sm border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors">Print</button>
                        <button type="button" className="bg-white text-gray-700 px-4 py-2 rounded-md font-medium text-sm border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors">Send</button>
                        <button type="button" onClick={() => handleAction('cancel')} className="bg-white text-red-600 px-4 py-2 rounded-md font-medium text-sm border border-gray-300 hover:bg-red-50 shadow-sm transition-colors">Cancel</button>
                    </div>
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

                {/* Form Body */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Row 1 */}
                        <div className="flex items-center">
                            <label className="w-32 text-gray-600 font-medium text-sm">Payment Type</label>
                            <div className="flex space-x-6">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="radio" className="form-radio text-primary-600 focus:ring-primary-500 h-4 w-4" name="type" value="send" checked={formData.type === 'send'} onChange={handleInputChange} />
                                    <span className="ml-2 text-gray-700 text-sm">Send</span>
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="radio" className="form-radio text-primary-600 focus:ring-primary-500 h-4 w-4" name="type" value="receive" checked={formData.type === 'receive'} onChange={handleInputChange} />
                                    <span className="ml-2 text-gray-700 text-sm">Receive</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex items-center md:justify-end">
                            <label className="w-32 md:w-auto text-gray-600 font-medium text-sm mr-4">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border w-48" />
                        </div>

                        {/* Row 2 */}
                        <div className="flex items-center">
                            <label className="w-32 text-gray-600 font-medium text-sm">Partner</label>
                            <div className="flex-1">
                                <select name="partner_id" value={formData.partner_id} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border">
                                    <option value="">Select Partner</option>
                                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">( auto fill from Invoice/Bill )</p>
                            </div>
                        </div>
                        <div className="flex items-center md:justify-end">
                            <label className="w-32 md:w-auto text-gray-600 font-medium text-sm mr-4">Payment Via</label>
                            <select name="payment_mode" value={formData.payment_mode} onChange={handleInputChange} className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border w-48">
                                <option value="bank">Bank</option>
                                <option value="cash">Cash</option>
                                <option value="upi">UPI</option>
                            </select>
                        </div>

                        {/* Row 3 */}
                        <div className="flex items-center">
                            <label className="w-32 text-gray-600 font-medium text-sm">Amount</label>
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
                                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 pl-7 px-3 border font-bold text-gray-900" placeholder="0.00" />
                                <p className="text-xs text-gray-400 mt-1">( auto fill amount due )</p>
                            </div>
                        </div>
                        <div className="flex items-center md:justify-end">
                            <label className="w-32 md:w-auto text-gray-600 font-medium text-sm mr-4">Note</label>
                            <input type="text" name="note" value={formData.note} onChange={handleInputChange} className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border w-48" placeholder="Alpha numeric" />
                        </div>
                    </div>

                    <div className="mt-12 flex justify-end">
                        <button onClick={handleSubmit} className="bg-green-600 text-white px-8 py-2 rounded hover:bg-green-700 font-bold shadow-md hover:shadow-lg transition-all">
                            Save Transaction
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
                        <h1 className="text-3xl font-bold text-gray-900">Receipts & Vouchers</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage incoming and outgoing payments</p>
                    </div>
                    {isAdmin && (
                        <button onClick={() => handleOpenModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center shadow-sm">
                            <span className="mr-2 text-xl">+</span> New Receipt
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {receipts.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.receipt_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(r.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.partner_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.type === 'receive' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                            {r.type === 'receive' ? 'Incoming' : 'Outgoing'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{r.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${r.status === 'confirm' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(r)} className="text-primary-600 hover:text-primary-900">Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && <Modal />}
        </div>
    );
};

export default Receipt;
