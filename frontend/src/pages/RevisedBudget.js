import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { revisedBudgetsAPI, budgetsAPI } from '../services/api';

const RevisedBudget = () => {
    const { isAdmin } = useAuth();
    const [revisedBudgets, setRevisedBudgets] = useState([]);
    const [originalBudgets, setOriginalBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRevision, setSelectedRevision] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        budget_id: '',
        event_name: '',
        type: 'expense',
        revised_budgeted_amount: '',
        start_date: '',
        end_date: '',
        revision_reason: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [revisedRes, budgetsRes] = await Promise.all([
                revisedBudgetsAPI.getAll(),
                budgetsAPI.getAll()
            ]);

            setRevisedBudgets(revisedRes.data.data || []);
            setOriginalBudgets(budgetsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-fill details if budget_id changes
        if (name === 'budget_id') {
            const budget = originalBudgets.find(b => b.id === parseInt(value));
            if (budget) {
                setFormData(prev => ({
                    ...prev,
                    budget_id: value,
                    event_name: budget.event_name,
                    type: budget.type,
                    start_date: budget.start_date,
                    end_date: budget.end_date,
                    // Keep existing amounts or reset? Let's prepopulate to edit
                    revised_budgeted_amount: budget.budgeted_amount
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.budget_id || !formData.revision_reason) {
            alert('Please select a budget and provide a reason for revision.');
            return;
        }

        const payload = {
            ...formData,
            budget_id: parseInt(formData.budget_id),
            revised_budgeted_amount: parseFloat(formData.revised_budgeted_amount)
        };

        try {
            if (selectedRevision) {
                await revisedBudgetsAPI.update(selectedRevision.id, payload);
            } else {
                await revisedBudgetsAPI.create(payload);
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Error saving Revision:', error);
            alert('Failed to save Revised Budget');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this Revision?')) {
            try {
                await revisedBudgetsAPI.delete(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting Revision:', error);
            }
        }
    };

    const openEditModal = (revision) => {
        setSelectedRevision(revision);
        setFormData({
            budget_id: revision.budget_id,
            event_name: revision.event_name,
            type: revision.type,
            revised_budgeted_amount: revision.revised_budgeted_amount,
            start_date: revision.start_date,
            end_date: revision.end_date,
            revision_reason: revision.revision_reason
        });
        setShowEditModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedRevision(null);
        setFormData({
            budget_id: '',
            event_name: '',
            type: 'expense',
            revised_budgeted_amount: '',
            start_date: '',
            end_date: '',
            revision_reason: ''
        });
    };

    const filteredRevisions = revisedBudgets.filter(rb =>
        rb.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Revised Budgets</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage and track budget revisions</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Revision
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by Event Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                        <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* List */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revised Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRevisions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No revised budgets found
                                    </td>
                                </tr>
                            ) : (
                                filteredRevisions.map((rb) => (
                                    <tr key={rb.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {rb.event_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                            {rb.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ₹{rb.original_budget_amount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600">
                                            ₹{rb.revised_budgeted_amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={rb.revision_reason}>
                                            {rb.revision_reason}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(rb)}
                                                className="text-primary-600 hover:text-primary-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rb.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {showEditModal ? 'Edit Budget Revision' : 'New Budget Revision'}
                                </h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Original Budget</label>
                                    <select
                                        name="budget_id"
                                        value={formData.budget_id}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-lg px-3 py-2"
                                        disabled={showEditModal} // Prevent changing base budget on edit
                                        required
                                    >
                                        <option value="">Select Budget</option>
                                        {originalBudgets.map(b => (
                                            <option key={b.id} value={b.id}>{b.event_name} ({b.type}) - ₹{b.budgeted_amount.toLocaleString()}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
                                        <input
                                            type="text"
                                            value={formData.event_name}
                                            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                        <input
                                            type="text"
                                            value={formData.type}
                                            className="w-full border rounded-lg px-3 py-2 bg-gray-100 capitalize"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Revised Budget Amount</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="revised_budgeted_amount"
                                            value={formData.revised_budgeted_amount}
                                            onChange={handleInputChange}
                                            className="w-full pl-7 border rounded-lg px-3 py-2"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Revision Reason</label>
                                    <textarea
                                        name="revision_reason"
                                        value={formData.revision_reason}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full border rounded-lg px-3 py-2"
                                        placeholder="Why is this budget being revised?"
                                        required
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-4 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        {showEditModal ? 'Update Revision' : 'Create Revision'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevisedBudget;
