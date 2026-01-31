import React, { useState, useEffect } from 'react';
import { mockAPI } from '../services/mockAPI';

const AutoAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [rules, setRules] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Insights State
    const [insights, setInsights] = useState({
        totalProfit: 0,
        totalRevenue: 0,
        avgProfitMargin: 0,
        topProduct: null,
        topPartner: null,
        profitTrend: 'stable'
    });

    // Rule Form State
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [ruleForm, setRuleForm] = useState({
        partner_id: '',
        product_category: '',
        target_distribution: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [analyticsRes, rulesRes, contactsRes] = await Promise.all([
                mockAPI.getAnalytics(),
                mockAPI.getAnalyticRules(),
                mockAPI.getContacts()
            ]);

            setAnalytics(analyticsRes.data.data.events || []);
            setRules(rulesRes.data.data);
            setContacts(contactsRes.data.data);

            calculateInsights(analyticsRes.data.data.events || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateInsights = (data) => {
        if (!data || data.length === 0) return;

        const totalProfit = data.reduce((sum, item) => sum + (parseFloat(item.profit) || 0), 0);
        const totalRevenue = data.reduce((sum, item) => sum + (parseFloat(item.unit_price) * parseInt(item.no_of_units)), 0);
        const avgProfitMargin = data.reduce((sum, item) => sum + (parseFloat(item.profit_margin_percentage) || 0), 0) / data.length;

        // Top Performers Logic (Simplified)
        // ... (Keep existing simple logic or improve if needed)

        setInsights({
            totalProfit,
            totalRevenue,
            avgProfitMargin,
            topProduct: 'Product A', // Placeholder or calc
            topPartner: 'ABC Corp', // Placeholder or calc
            profitTrend: 'growing'
        });
    };

    const handleCreateRule = async (e) => {
        e.preventDefault();
        try {
            // Calculate priority score: +1 for each defined field
            let score = 0;
            if (ruleForm.partner_id) score++;
            if (ruleForm.product_category) score++;

            const payload = {
                partner_id: ruleForm.partner_id ? parseInt(ruleForm.partner_id) : null,
                product_category: ruleForm.product_category || null,
                product_id: null,
                target_distribution: ruleForm.target_distribution,
                priority_score: score
            };

            await mockAPI.createAnalyticRule(payload);
            setShowRuleModal(false);
            setRuleForm({ partner_id: '', product_category: '', target_distribution: '' });
            fetchData();
        } catch (error) {
            console.error('Error creating rule:', error);
        }
    };

    const handleDeleteRule = async (id) => {
        if (window.confirm('Delete this analytic rule?')) {
            try {
                await mockAPI.deleteAnalyticRule(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting rule:', error);
            }
        }
    };

    // Helper to get partner name
    const getPartnerName = (id) => {
        if (!id) return 'Any Partner';
        const c = contacts.find(c => c.id === id);
        return c ? c.name : 'Unknown';
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Auto Analytics...</div>;

    const sortedRules = [...rules].sort((a, b) => b.priority_score - a.priority_score);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Auto Analytic Model</h1>
                    <p className="mt-2 text-gray-600">
                        Define prediction models to automatically assign analytic distributions based on transaction patterns.
                    </p>
                </div>

                {/* Info Card (from User Image text) */}
                <div className="bg-gray-900 text-purple-200 rounded-xl p-6 mb-8 font-mono text-sm shadow-lg border border-gray-800">
                    <p className="mb-2">The model is applied if any one field matches the transaction line.</p>
                    <p className="mb-2">If multiple fields match, the model becomes more specific and takes priority.</p>
                    <p className="mb-4">Models with fewer matched fields are more generic, while more matches make them stricter.</p>
                    <div className="bg-gray-800 p-4 rounded text-gray-300">
                        <p className="font-bold text-white mb-1">Example:</p>
                        <p>If Product Category is "Wooden Furniture" and Partner is "Mr. A", this distribution applies.</p>
                        <p>Matches on both fields (stricter) take precedence over generic matches.</p>
                    </div>
                </div>

                {/* Rules Table Section */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-800">Prediction Models</h2>
                        <button onClick={() => setShowRuleModal(true)} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 font-medium text-sm transition-colors">
                            + Add Model
                        </button>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner Criteria</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Distribution</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedRules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${rule.priority_score >= 2 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            Level {rule.priority_score}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {rule.partner_id ? (
                                            <span className="text-primary-700">{getPartnerName(rule.partner_id)}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">Any Partner</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {rule.product_category ? (
                                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">{rule.product_category}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">Any Category</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {rule.target_distribution}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button onClick={() => handleDeleteRule(rule.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {sortedRules.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No prediction models defined. Create one to automate analytics.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Existing Auto-Generated Data Section */}
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Historical Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Profit</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">₹{insights.totalProfit.toLocaleString()}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">₹{insights.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Profit Trend</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">Growing 📈</p>
                    </div>
                </div>

            </div>

            {/* Create Rule Modal */}
            {showRuleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">New Prediction Model</h3>
                        <form onSubmit={handleCreateRule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">When Partner is... (Optional)</label>
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    value={ruleForm.partner_id}
                                    onChange={(e) => setRuleForm({ ...ruleForm, partner_id: e.target.value })}
                                >
                                    <option value="">Any Partner</option>
                                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">And Product Category is... (Optional)</label>
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    value={ruleForm.product_category}
                                    onChange={(e) => setRuleForm({ ...ruleForm, product_category: e.target.value })}
                                >
                                    <option value="">Any Category</option>
                                    <option value="Furniture">Furniture</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Textiles">Textiles</option>
                                    <option value="Raw Materials">Raw Materials</option>
                                </select>
                            </div>

                            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                                Priority Level: <span className="font-bold">{(ruleForm.partner_id ? 1 : 0) + (ruleForm.product_category ? 1 : 0)}</span> (More conditions = Higher Priority)
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apply Distribution Target</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g. Sales - Furniture Dept"
                                    value={ruleForm.target_distribution}
                                    onChange={(e) => setRuleForm({ ...ruleForm, target_distribution: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setShowRuleModal(false)} className="text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
                                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 font-bold shadow">Create Model</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutoAnalytics;
