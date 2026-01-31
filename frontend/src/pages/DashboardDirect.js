import React, { useState } from 'react';

const DashboardDirect = () => {
    // Mock data for demonstration
    const user = {
        name: 'Admin User',
        role: 'admin',
        email: 'admin@shivbas.com'
    };

    const summary = {
        total_budgets: 5,
        active_events: 6,
        total_income: 250000,
        total_expenses: 180000
    };

    const budgets = [
        {
            id: 1,
            event_name: 'Expo 2026',
            type: 'income',
            budgeted_amount: 100000,
            achieved_amount: 75000,
            percentage_achieved: 75,
            amount_to_achieve: 25000
        },
        {
            id: 2,
            event_name: 'Summer Sale',
            type: 'income',
            budgeted_amount: 50000,
            achieved_amount: 45000,
            percentage_achieved: 90,
            amount_to_achieve: 5000
        },
        {
            id: 3,
            event_name: 'Marketing Campaign',
            type: 'expense',
            budgeted_amount: 30000,
            achieved_amount: 28000,
            percentage_achieved: 93.33,
            amount_to_achieve: 2000
        },
        {
            id: 4,
            event_name: 'Product Launch',
            type: 'income',
            budgeted_amount: 80000,
            achieved_amount: 85000,
            percentage_achieved: 106.25,
            amount_to_achieve: -5000
        },
        {
            id: 5,
            event_name: 'Office Renovation',
            type: 'expense',
            budgeted_amount: 40000,
            achieved_amount: 15000,
            percentage_achieved: 37.5,
            amount_to_achieve: 25000
        }
    ];

    const analytics = [
        {
            id: 1,
            event_name: 'Expo 2026',
            partner_tag: 'supplier',
            no_of_units: 100,
            profit: 25000,
            profit_margin_percentage: 33.33
        },
        {
            id: 2,
            event_name: 'Summer Sale',
            partner_tag: 'customer',
            no_of_units: 200,
            profit: 35000,
            profit_margin_percentage: 28.5
        },
        {
            id: 3,
            event_name: 'Product Launch',
            partner_tag: 'customer',
            no_of_units: 150,
            profit: 42000,
            profit_margin_percentage: 35.2
        },
        {
            id: 4,
            event_name: 'Trade Show',
            partner_tag: 'supplier',
            no_of_units: 80,
            profit: 18000,
            profit_margin_percentage: 25.0
        },
        {
            id: 5,
            event_name: 'Corporate Event',
            partner_tag: 'customer',
            no_of_units: 120,
            profit: 30000,
            profit_margin_percentage: 30.5
        },
        {
            id: 6,
            event_name: 'Workshop Series',
            partner_tag: 'supplier',
            no_of_units: 60,
            profit: 15000,
            profit_margin_percentage: 22.8
        }
    ];

    const getStatusBadge = (percentage) => {
        if (percentage >= 100) return { text: 'Critical', color: 'bg-red-100 text-red-800' };
        if (percentage >= 80) return { text: 'Warning', color: 'bg-yellow-100 text-yellow-800' };
        if (percentage >= 50) return { text: 'On Track', color: 'bg-blue-100 text-blue-800' };
        return { text: 'Safe', color: 'bg-green-100 text-green-800' };
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Welcome back, {user.name} <span className="text-primary-600">(Admin)</span>
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="btn-secondary text-sm">
                                <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                Notifications
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Budgets</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {summary.total_budgets}
                                </p>
                            </div>
                            <div className="bg-primary-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Events</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {summary.active_events}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Income</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    ₹{summary.total_income.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    ₹{summary.total_expenses.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg">
                                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Budgets Table */}
                <div className="card mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Budget Overview</h2>
                        <button className="btn-primary text-sm">
                            <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Budget
                        </button>
                    </div>

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
                                {budgets.map((budget) => {
                                    const status = getStatusBadge(budget.percentage_achieved);
                                    return (
                                        <tr key={budget.id} className="table-row">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{budget.event_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${budget.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {budget.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ₹{budget.budgeted_amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ₹{budget.achieved_amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className={`h-2 rounded-full ${budget.percentage_achieved >= 100 ? 'bg-red-600' :
                                                                    budget.percentage_achieved >= 80 ? 'bg-yellow-500' :
                                                                        'bg-green-500'
                                                                }`}
                                                            style={{ width: `${Math.min(budget.percentage_achieved, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-600 min-w-[3rem]">
                                                        {budget.percentage_achieved.toFixed(1)}%
                                                    </span>
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
                </div>

                {/* Analytics Events */}
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
                        <button className="btn-primary text-sm">
                            <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Event
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analytics.map((event) => (
                            <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                                <h3 className="font-semibold text-gray-900 mb-2">{event.event_name}</h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p>Partner: <span className="font-medium">{event.partner_tag}</span></p>
                                    <p>Units: <span className="font-medium">{event.no_of_units}</span></p>
                                    <p>Profit: <span className="font-medium text-green-600">₹{event.profit.toLocaleString()}</span></p>
                                    <p>Margin: <span className="font-medium">{event.profit_margin_percentage}%</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardDirect;
