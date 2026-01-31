import React, { useState, useEffect } from 'react';
import { budgetsAPI, revisedBudgetsAPI } from '../services/api';

const BudgetGraph = () => {
    const [budgets, setBudgets] = useState([]);
    const [revisedBudgets, setRevisedBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [budgetsRes, revisedRes] = await Promise.all([
                budgetsAPI.getAll(),
                revisedBudgetsAPI.getAll()
            ]);
            setBudgets(budgetsRes.data.data || []);
            setRevisedBudgets(revisedRes.data.data || []);
        } catch (error) {
            console.error('Error fetching graph data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredBudgets = budgets.filter(b => selectedType === 'all' || b.type === selectedType);

    // Calculations
    const totalBudgeted = filteredBudgets.reduce((sum, b) => sum + parseFloat(b.budgeted_amount), 0);
    const totalAchieved = filteredBudgets.reduce((sum, b) => sum + parseFloat(b.achieved_amount), 0);
    const overallPercentage = totalBudgeted > 0 ? (totalAchieved / totalBudgeted) * 100 : 0;

    // Chart Dimensions
    const CHART_HEIGHT = 300;
    const CHART_WIDTH = 800;
    const BAR_WIDTH = 40;
    const GAP = 30;

    // Prepare Bar Chart Data
    // We need to scale the bars. Find max value.
    const maxValue = Math.max(
        ...filteredBudgets.map(b => Math.max(parseFloat(b.budgeted_amount), parseFloat(b.achieved_amount))),
        1000 // Minimum chart scale
    );
    const scale = (CHART_HEIGHT - 60) / maxValue; // Leave space for labels

    // Donut Chart Data (Type Distribution)
    const incomeTotal = budgets.filter(b => b.type === 'income').reduce((s, b) => s + parseFloat(b.budgeted_amount), 0);
    const expenseTotal = budgets.filter(b => b.type === 'expense').reduce((s, b) => s + parseFloat(b.budgeted_amount), 0);
    const totalVolume = incomeTotal + expenseTotal;
    const incomePercent = totalVolume ? (incomeTotal / totalVolume) * 100 : 0;
    const expensePercent = totalVolume ? (expenseTotal / totalVolume) * 100 : 0;

    // SVG Donut Logic
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const incomeOffset = circumference - ((incomePercent / 100) * circumference);

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
                        <h1 className="text-3xl font-bold text-gray-900">Budget Analytics</h1>
                        <p className="mt-1 text-sm text-gray-600">Visualizing financial performance and variances</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-1 border">
                        <button
                            onClick={() => setSelectedType('all')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${selectedType === 'all' ? 'bg-gray-900 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setSelectedType('income')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${selectedType === 'income' ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:text-green-600'}`}
                        >
                            Income
                        </button>
                        <button
                            onClick={() => setSelectedType('expense')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${selectedType === 'expense' ? 'bg-red-600 text-white shadow' : 'text-gray-600 hover:text-red-600'}`}
                        >
                            Expense
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <p className="text-sm font-medium text-gray-500">Total Budgeted</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalBudgeted.toLocaleString()}</p>
                    </div>
                    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${totalAchieved > totalBudgeted ? 'border-red-500' : 'border-green-500'}`}>
                        <p className="text-sm font-medium text-gray-500">Total Actual</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalAchieved.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <p className="text-sm font-medium text-gray-500">Achievement Rate</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{overallPercentage.toFixed(1)}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Bar Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Budget vs Actual by Event</h3>
                        <div className="overflow-x-auto">
                            <svg width={Math.max(CHART_WIDTH, filteredBudgets.length * (BAR_WIDTH * 2 + GAP) + 100)} height={CHART_HEIGHT} className="mx-auto">
                                {/* Axis Lines */}
                                <line x1="50" y1="0" x2="50" y2={CHART_HEIGHT - 30} stroke="#e5e7eb" strokeWidth="2" />
                                <line x1="50" y1={CHART_HEIGHT - 30} x2="100%" y2={CHART_HEIGHT - 30} stroke="#e5e7eb" strokeWidth="2" />

                                {/* Bars */}
                                {filteredBudgets.map((item, index) => {
                                    const budgetHeight = parseFloat(item.budgeted_amount) * scale;
                                    const actualHeight = parseFloat(item.achieved_amount) * scale;
                                    const x = 70 + index * (BAR_WIDTH * 2 + GAP);

                                    const isPositive = item.type === 'income'
                                        ? parseFloat(item.achieved_amount) >= parseFloat(item.budgeted_amount)
                                        : parseFloat(item.achieved_amount) <= parseFloat(item.budgeted_amount);

                                    return (
                                        <g key={item.id} className="group">
                                            {/* Budget Bar (Blue) */}
                                            <rect
                                                x={x}
                                                y={CHART_HEIGHT - 30 - budgetHeight}
                                                width={BAR_WIDTH}
                                                height={budgetHeight}
                                                fill="#3b82f6"
                                                rx="4"
                                                className="transition-all duration-300 hover:opacity-80"
                                            />
                                            {/* Actual Bar (Green/Red) */}
                                            <rect
                                                x={x + BAR_WIDTH + 2}
                                                y={CHART_HEIGHT - 30 - actualHeight}
                                                width={BAR_WIDTH}
                                                height={actualHeight}
                                                fill={isPositive ? '#10b981' : '#ef4444'}
                                                rx="4"
                                                className="transition-all duration-300 hover:opacity-80"
                                            />

                                            {/* Tooltip Labels (On Hover/Always visible for simplicity here) */}
                                            <text x={x + BAR_WIDTH} y={CHART_HEIGHT - 10} textAnchor="middle" fontSize="12" fill="#6b7280" className="truncate w-20">
                                                {item.event_name.split(' ')[0]} {/* Show first word of event */}
                                            </text>

                                            {/* Value Labels */}
                                            <text x={x + BAR_WIDTH} y={CHART_HEIGHT - 35 - Math.max(budgetHeight, actualHeight)} textAnchor="middle" fontSize="10" fill="#374151" opacity="0" className="group-hover:opacity-100 transition-opacity">
                                                ₹{item.budgeted_amount} / ₹{item.achieved_amount}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Legend */}
                                <g transform={`translate(${CHART_WIDTH - 200}, 20)`}>
                                    <rect x="0" y="0" width="12" height="12" fill="#3b82f6" rx="2" />
                                    <text x="20" y="10" fontSize="12" fill="#6b7280">Budget</text>

                                    <rect x="0" y="20" width="12" height="12" fill="#10b981" rx="2" />
                                    <text x="20" y="30" fontSize="12" fill="#6b7280">Actual (Within)</text>

                                    <rect x="0" y="40" width="12" height="12" fill="#ef4444" rx="2" />
                                    <text x="20" y="50" fontSize="12" fill="#6b7280">Actual (Exceeded)</text>
                                </g>
                            </svg>
                        </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Budget Allocation</h3>
                        <div className="flex flex-col items-center">
                            <div className="relative h-64 w-64">
                                <svg width="100%" height="100%" viewBox="0 0 160 160">
                                    <circle cx="80" cy="80" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="20" />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r={radius}
                                        fill="none"
                                        stroke="#10b981" // Income Green
                                        strokeWidth="20"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={incomeOffset}
                                        strokeLinecap="round"
                                        transform="rotate(-90 80 80)"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r={radius}
                                        fill="none"
                                        stroke="#ef4444" // Expense Red
                                        strokeWidth="20"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference - ((expensePercent / 100) * circumference)}
                                        strokeLinecap="round"
                                        transform={`rotate(${-90 + (incomePercent * 3.6)} 80 80)`}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                    <text x="80" y="75" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">Total</text>
                                    <text x="80" y="95" textAnchor="middle" fontSize="12" fill="#6b7280">₹{totalVolume.toLocaleString()}</text>
                                </svg>
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-1">Income</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="font-bold text-gray-900">{incomePercent.toFixed(1)}%</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">₹{incomeTotal.toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 mb-1">Expense</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="font-bold text-gray-900">{expensePercent.toFixed(1)}%</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">₹{expenseTotal.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revisions Summary Table (Integration of API contract) */}
                <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-bold text-gray-900">Recent Budget Updates</h3>
                    </div>
                    <div className="p-6">
                        {revisedBudgets.length === 0 ? (
                            <p className="text-gray-500 text-center">No active revisions found.</p>
                        ) : (
                            <table className="min-w-full">
                                <thead>
                                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <th className="pb-3">Event</th>
                                        <th className="pb-3">Type</th>
                                        <th className="pb-3 text-right">Original</th>
                                        <th className="pb-3 text-right">Revised</th>
                                        <th className="pb-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {revisedBudgets.map(revision => {
                                        const original = revision.original_budget_amount || 0;
                                        const change = parseFloat(revision.revised_budgeted_amount) - parseFloat(original);
                                        return (
                                            <tr key={revision.id} className="text-sm">
                                                <td className="py-3 font-medium text-gray-900">{revision.event_name}</td>
                                                <td className="py-3 capitalize text-gray-500">{revision.type}</td>
                                                <td className="py-3 text-right text-gray-600">₹{parseFloat(original).toLocaleString()}</td>
                                                <td className="py-3 text-right font-bold text-gray-900">
                                                    ₹{parseFloat(revision.revised_budgeted_amount).toLocaleString()}
                                                    <span className={`block text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {change >= 0 ? '+' : ''}{change.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetGraph;
