import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { budgetsAPI, analyticsAPI } from '../services/api';

const Budgets = () => {
    const { isAdmin } = useAuth();
    const [budgets, setBudgets] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Form state matching database schema
    const [formData, setFormData] = useState({
        event_name: '',
        analytics_id: '',
        type: 'income',
        budgeted_amount: '',
        achieved_amount: '0',
        start_date: '',
        end_date: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch from real backend
            const budgetsResponse = await budgetsAPI.getAll({});
            setBudgets(budgetsResponse.data.data || []);

            const analyticsResponse = await analyticsAPI.getAll({});
            setAnalytics(analyticsResponse.data.data || []);
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
    };

    const handleCreateBudget = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.event_name || !formData.analytics_id || !formData.budgeted_amount || !formData.start_date || !formData.end_date) {
            alert('Please fill in all required fields');
            return;
        }

        if (new Date(formData.start_date) >= new Date(formData.end_date)) {
            alert('End date must be after start date');
            return;
        }

        // Create new budget matching database schema
        const newBudget = {
            id: budgets.length + 1,
            event_name: formData.event_name,
            analytics_id: parseInt(formData.analytics_id),
            type: formData.type,
            budgeted_amount: parseFloat(formData.budgeted_amount),
            achieved_amount: parseFloat(formData.achieved_amount),
            percentage_achieved: (parseFloat(formData.achieved_amount) / parseFloat(formData.budgeted_amount)) * 100,
            amount_to_achieve: parseFloat(formData.budgeted_amount) - parseFloat(formData.achieved_amount),
            start_date: formData.start_date,
            end_date: formData.end_date,
            notes: formData.notes,
            created_at: new Date().toISOString()
        };

        setBudgets([...budgets, newBudget]);
        setShowCreateModal(false);
        resetForm();
    };

    const handleEditBudget = async (e) => {
        e.preventDefault();

        const updatedBudget = {
            ...selectedBudget,
            event_name: formData.event_name,
            analytics_id: parseInt(formData.analytics_id),
            type: formData.type,
            budgeted_amount: parseFloat(formData.budgeted_amount),
            achieved_amount: parseFloat(formData.achieved_amount),
            percentage_achieved: (parseFloat(formData.achieved_amount) / parseFloat(formData.budgeted_amount)) * 100,
            amount_to_achieve: parseFloat(formData.budgeted_amount) - parseFloat(formData.achieved_amount),
            start_date: formData.start_date,
            end_date: formData.end_date,
            notes: formData.notes,
            updated_at: new Date().toISOString()
        };

        setBudgets(budgets.map(b => b.id === selectedBudget.id ? updatedBudget : b));
        setShowEditModal(false);
        setSelectedBudget(null);
        resetForm();
    };

    const handleDeleteBudget = (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            setBudgets(budgets.filter(b => b.id !== id));
        }
    };

    const openEditModal = (budget) => {
        setSelectedBudget(budget);
        setFormData({
            event_name: budget.event_name,
            analytics_id: (budget.analytics_id || '').toString(),
            type: budget.type,
            budgeted_amount: parseFloat(budget.budgeted_amount || 0).toString(),
            achieved_amount: parseFloat(budget.achieved_amount || 0).toString(),
            start_date: budget.start_date,
            end_date: budget.end_date,
            notes: budget.notes || ''
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            event_name: '',
            analytics_id: '',
            type: 'income',
            budgeted_amount: '',
            achieved_amount: '0',
            start_date: '',
            end_date: '',
            notes: ''
        });
    };

    const getStatusBadge = (percentage) => {
        if (percentage >= 100) return { text: 'Critical', color: 'bg-red-100 text-red-800' };
        if (percentage >= 80) return { text: 'Warning', color: 'bg-yellow-100 text-yellow-800' };
        if (percentage >= 50) return { text: 'On Track', color: 'bg-blue-100 text-blue-800' };
        return { text: 'Safe', color: 'bg-green-100 text-green-800' };
    };

    // Filter budgets
    const filteredBudgets = budgets.filter(budget => {
        const matchesType = filterType === 'all' || budget.type === filterType;
        const matchesSearch = budget.event_name.toLowerCase().includes(searchTerm.toLowerCase());
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
                    <p className="mt-4 text-gray-600">Loading budgets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage and track all your budgets in one place
                    </p>
                </div>

                {/* Filters and Actions */}
                <div className="card mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search budgets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-field pl-10"
                                />
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="flex items-center gap-4">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>

                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="btn-primary whitespace-nowrap"
                                >
                                    <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Budget
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Budgets Table */}
                <div className="card">
                    {filteredBudgets.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-4 text-gray-600">No budgets found</p>
                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-4 btn-primary"
                                >
                                    Create Your First Budget
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="table-header">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Event Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Period
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Budgeted
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Achieved
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBudgets.map((budget) => {
                                        const status = getStatusBadge(budget.percentage_achieved);
                                        return (
                                            <tr key={budget.id} className="table-row">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{budget.event_name}</div>
                                                    {budget.notes && (
                                                        <div className="text-xs text-gray-500 mt-1">{budget.notes}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${budget.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {budget.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div>{new Date(budget.start_date).toLocaleDateString()}</div>
                                                    <div className="text-xs text-gray-400">to {new Date(budget.end_date).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    ₹{parseFloat(budget.budgeted_amount || 0).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{parseFloat(budget.achieved_amount || 0).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                                                            <div
                                                                className={`h-2 rounded-full ${parseFloat(budget.percentage_achieved || 0) >= 100 ? 'bg-red-600' :
                                                                        parseFloat(budget.percentage_achieved || 0) >= 80 ? 'bg-yellow-500' :
                                                                            'bg-green-500'
                                                                    }`}
                                                                style={{ width: `${Math.min(parseFloat(budget.percentage_achieved || 0), 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-600 min-w-[3.5rem]">
                                                            {parseFloat(budget.percentage_achieved || 0).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Remaining: ₹{parseFloat(budget.amount_to_achieve || 0).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                                                        {status.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Budgets</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{budgets.length}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Income Budgets</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                            ₹{budgets.filter(b => b.type === 'income').reduce((sum, b) => sum + parseFloat(b.budgeted_amount || 0), 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Expense Budgets</p>
                        <p className="text-2xl font-bold text-red-600 mt-2">
                            ₹{budgets.filter(b => b.type === 'expense').reduce((sum, b) => sum + parseFloat(b.budgeted_amount || 0), 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Critical Budgets</p>
                        <p className="text-2xl font-bold text-red-600 mt-2">
                            {budgets.filter(b => parseFloat(b.percentage_achieved || 0) >= 100).length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Create Budget Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Create New Budget</h2>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleCreateBudget} className="space-y-4">
                                {/* Event Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="event_name"
                                        value={formData.event_name}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="e.g., Expo 2026"
                                        required
                                    />
                                </div>

                                {/* Analytics Event */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Link to Analytics Event <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="analytics_id"
                                        value={formData.analytics_id}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select an event</option>
                                        {analytics.map(event => (
                                            <option key={event.id} value={event.id}>
                                                {event.event_name} ({event.partner_tag})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Links this budget to an analytics event for tracking
                                    </p>
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="income"
                                                checked={formData.type === 'income'}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Income</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="expense"
                                                checked={formData.type === 'expense'}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Expense</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Budgeted Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budgeted Amount (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="budgeted_amount"
                                        value={formData.budgeted_amount}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="100000"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        DECIMAL(15,2) - Target amount for this budget
                                    </p>
                                </div>

                                {/* Achieved Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Achieved Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="achieved_amount"
                                        value={formData.achieved_amount}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        DECIMAL(15,2) - Current achieved amount (defaults to 0)
                                    </p>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        rows="3"
                                        placeholder="Additional notes or comments..."
                                    ></textarea>
                                    <p className="mt-1 text-xs text-gray-500">
                                        TEXT - Optional notes about this budget
                                    </p>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Create Budget
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Budget Modal */}
            {showEditModal && selectedBudget && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Budget</h2>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedBudget(null);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleEditBudget} className="space-y-4">
                                {/* Same form fields as create modal */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="event_name"
                                        value={formData.event_name}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Link to Analytics Event <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="analytics_id"
                                        value={formData.analytics_id}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select an event</option>
                                        {analytics.map(event => (
                                            <option key={event.id} value={event.id}>
                                                {event.event_name} ({event.partner_tag})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="income"
                                                checked={formData.type === 'income'}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Income</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="expense"
                                                checked={formData.type === 'expense'}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Expense</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budgeted Amount (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="budgeted_amount"
                                        value={formData.budgeted_amount}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Achieved Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="achieved_amount"
                                        value={formData.achieved_amount}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedBudget(null);
                                            resetForm();
                                        }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Update Budget
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

export default Budgets;
