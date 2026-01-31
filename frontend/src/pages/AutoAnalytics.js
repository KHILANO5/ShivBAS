import React, { useState, useEffect } from 'react';
import mockAPI from '../services/mockAPI';

const AutoAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState({
        totalProfit: 0,
        totalRevenue: 0,
        avgProfitMargin: 0,
        topProduct: null,
        topPartner: null,
        profitTrend: 'stable'
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await mockAPI.getAnalytics();
            const data = response.data.data.events || [];
            setAnalytics(data);
            calculateInsights(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateInsights = (data) => {
        if (!data || data.length === 0) {
            return;
        }

        // Calculate total profit and revenue
        const totalProfit = data.reduce((sum, item) => sum + (parseFloat(item.profit) || 0), 0);
        const totalRevenue = data.reduce((sum, item) => sum + (parseFloat(item.unit_price) * parseInt(item.no_of_units)), 0);

        // Calculate average profit margin
        const avgProfitMargin = data.reduce((sum, item) => sum + (parseFloat(item.profit_margin_percentage) || 0), 0) / data.length;

        // Find top product
        const productProfits = {};
        data.forEach(item => {
            const productName = item.product_name || 'Unknown';
            productProfits[productName] = (productProfits[productName] || 0) + (parseFloat(item.profit) || 0);
        });
        const topProduct = Object.keys(productProfits).reduce((a, b) =>
            productProfits[a] > productProfits[b] ? a : b, Object.keys(productProfits)[0]
        );

        // Find top partner
        const partnerProfits = {};
        data.forEach(item => {
            const partnerName = item.partner_name || 'Unknown';
            partnerProfits[partnerName] = (partnerProfits[partnerName] || 0) + (parseFloat(item.profit) || 0);
        });
        const topPartner = Object.keys(partnerProfits).reduce((a, b) =>
            partnerProfits[a] > partnerProfits[b] ? a : b, Object.keys(partnerProfits)[0]
        );

        // Determine profit trend (simplified)
        const profitTrend = avgProfitMargin > 20 ? 'growing' : avgProfitMargin > 10 ? 'stable' : 'declining';

        setInsights({
            totalProfit,
            totalRevenue,
            avgProfitMargin,
            topProduct,
            topPartner,
            profitTrend
        });
    };

    const getProductCategoryDistribution = () => {
        const categories = {};
        analytics.forEach(item => {
            const category = item.product_category || 'Unknown';
            categories[category] = (categories[category] || 0) + 1;
        });
        return Object.entries(categories).map(([name, count]) => ({ name, count }));
    };

    const getPartnerTypeDistribution = () => {
        const types = { supplier: 0, customer: 0 };
        analytics.forEach(item => {
            if (item.partner_tag) {
                types[item.partner_tag]++;
            }
        });
        return [
            { name: 'Suppliers', count: types.supplier },
            { name: 'Customers', count: types.customer }
        ];
    };

    const getTrendIndicator = (trend) => {
        switch (trend) {
            case 'growing':
                return { icon: '📈', color: 'text-green-600', text: 'Growing' };
            case 'declining':
                return { icon: '📉', color: 'text-red-600', text: 'Declining' };
            default:
                return { icon: '➡️', color: 'text-blue-600', text: 'Stable' };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading analytics...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const categoryDistribution = getProductCategoryDistribution();
    const partnerDistribution = getPartnerTypeDistribution();
    const trendIndicator = getTrendIndicator(insights.profitTrend);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Auto Analytic Model</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Automated insights and predictions based on your analytics data
                    </p>
                </div>

                {/* Key Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Profit */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    ₹{insights.totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Revenue */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    ₹{insights.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Avg Profit Margin */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Profit Margin</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {insights.avgProfitMargin.toFixed(2)}%
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Profit Trend */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Profit Trend</p>
                                <p className={`mt-2 text-2xl font-bold ${trendIndicator.color}`}>
                                    {trendIndicator.icon} {trendIndicator.text}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Insights Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Performers */}
                    <div className="card">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Top Performers</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Top Product</p>
                                    <p className="text-lg font-bold text-gray-900">{insights.topProduct || 'N/A'}</p>
                                </div>
                                <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">🥇</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Top Partner</p>
                                    <p className="text-lg font-bold text-gray-900">{insights.topPartner || 'N/A'}</p>
                                </div>
                                <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">🤝</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Category Distribution */}
                    <div className="card">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Product Categories</h3>
                        <div className="space-y-3">
                            {categoryDistribution.map((category, index) => {
                                const percentage = (category.count / analytics.length) * 100;
                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">{category.name}</span>
                                            <span className="text-sm text-gray-600">{category.count} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Partner Distribution */}
                <div className="card mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">👥 Partner Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {partnerDistribution.map((partner, index) => {
                            const percentage = analytics.length > 0 ? (partner.count / analytics.length) * 100 : 0;
                            return (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${partner.name === 'Suppliers' ? 'bg-orange-100' : 'bg-green-100'
                                            }`}>
                                            <span className="text-2xl">{partner.name === 'Suppliers' ? '📦' : '🛒'}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{partner.name}</p>
                                            <p className="text-2xl font-bold text-gray-900">{partner.count}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary-600">{percentage.toFixed(1)}%</p>
                                        <p className="text-xs text-gray-500">of total</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recommendations */}
                <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
                    <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">💡 AI Recommendations</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start">
                                    <span className="text-primary-600 mr-2">•</span>
                                    <span>Focus on <strong>{insights.topProduct}</strong> - it's your most profitable product</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary-600 mr-2">•</span>
                                    <span>Strengthen partnership with <strong>{insights.topPartner}</strong> for better margins</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary-600 mr-2">•</span>
                                    <span>Your average profit margin is <strong>{insights.avgProfitMargin.toFixed(2)}%</strong> - {insights.avgProfitMargin > 15 ? 'excellent performance!' : 'consider optimizing costs'}</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary-600 mr-2">•</span>
                                    <span>Profit trend is <strong>{trendIndicator.text.toLowerCase()}</strong> - {insights.profitTrend === 'growing' ? 'keep up the good work!' : 'review pricing strategy'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Info Note */}
                {analytics.length === 0 && (
                    <div className="card bg-yellow-50 border border-yellow-200 mt-8">
                        <div className="flex items-center">
                            <svg className="h-6 w-6 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-medium text-yellow-900">No Analytics Data Available</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Add analytics events to see automated insights and recommendations.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutoAnalytics;
