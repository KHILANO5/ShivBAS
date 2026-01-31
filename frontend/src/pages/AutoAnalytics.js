import React, { useState, useEffect } from 'react';
import { analyticsAPI, productsAPI, contactsAPI } from '../services/api';

const AutoAnalytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [filteredAnalytics, setFilteredAnalytics] = useState([]);
    const [products, setProducts] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter states for "Auto Apply Analytical Model"
    const [filters, setFilters] = useState({
        partnerTag: 'all',
        partnerId: 'all',
        productCategory: 'all',
        productId: 'all'
    });

    // Matched analytics models with priority scoring
    const [matchedModels, setMatchedModels] = useState([]);
    const [bestMatch, setBestMatch] = useState(null);

    const [insights, setInsights] = useState({
        totalProfit: 0,
        totalRevenue: 0,
        avgProfitMargin: 0,
        topProduct: null,
        topPartner: null,
        profitTrend: 'stable'
    });

    useEffect(() => {
        fetchData();
    }, []);

    // Apply Auto Analytical Model matching whenever filters change
    useEffect(() => {
        findMatchingModels();
    }, [filters, analytics, products, contacts]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [analyticsResponse, productsResponse, contactsResponse] = await Promise.all([
                analyticsAPI.getAll(),
                productsAPI.getAll(),
                contactsAPI.getAll()
            ]);
            
            const data = analyticsResponse.data.data || [];
            setAnalytics(data);
            setFilteredAnalytics(data);
            setProducts((productsResponse.data.data || []).filter(p => p.status === 'active'));
            setContacts((contactsResponse.data.data || []).filter(c => c.status === 'active'));
            calculateInsights(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Auto Apply Analytical Model Logic:
     * - The model is applied if any one field matches the transaction line
     * - If multiple fields match, the model becomes more specific and takes priority
     * - Models with fewer matched fields are more generic, while more matches make them stricter
     * 
     * Priority Weights:
     * - Product ID match: 4 points (most specific)
     * - Partner ID match: 3 points (very specific)
     * - Product Category match: 2 points (category level)
     * - Partner Tag match: 1 point (most generic)
     * 
     * Total possible score: 10 points
     */
    const findMatchingModels = () => {
        if (!analytics.length) {
            setMatchedModels([]);
            setBestMatch(null);
            setFilteredAnalytics([]);
            return;
        }

        // If no filters selected, show all analytics
        const hasAnyFilter = filters.partnerTag !== 'all' || 
                            filters.partnerId !== 'all' || 
                            filters.productCategory !== 'all' || 
                            filters.productId !== 'all';

        if (!hasAnyFilter) {
            setMatchedModels([]);
            setBestMatch(null);
            setFilteredAnalytics(analytics);
            calculateInsights(analytics);
            return;
        }

        const scoredModels = analytics.map(model => {
            let score = 0;
            let matchedFields = [];

            // Check Partner Tag match (1 point - most generic)
            if (filters.partnerTag !== 'all' && model.partner_tag === filters.partnerTag) {
                score += 1;
                matchedFields.push('Partner Tag');
            }

            // Check Product Category match (2 points)
            if (filters.productCategory !== 'all' && model.product_category === filters.productCategory) {
                score += 2;
                matchedFields.push('Product Category');
            }

            // Check Partner ID match (3 points - very specific)
            if (filters.partnerId !== 'all' && model.partner_id === parseInt(filters.partnerId)) {
                score += 3;
                matchedFields.push('Partner');
            }

            // Check Product ID match (4 points - most specific)
            if (filters.productId !== 'all' && model.product_id === parseInt(filters.productId)) {
                score += 4;
                matchedFields.push('Product');
            }

            return {
                ...model,
                matchScore: score,
                matchedFields: matchedFields,
                matchCount: matchedFields.length
            };
        });

        // Filter models that have at least one match
        const matched = scoredModels
            .filter(m => m.matchScore > 0)
            .sort((a, b) => {
                // Sort by score descending (higher score = more specific = higher priority)
                if (b.matchScore !== a.matchScore) {
                    return b.matchScore - a.matchScore;
                }
                // If same score, sort by profit descending
                return parseFloat(b.profit || 0) - parseFloat(a.profit || 0);
            });

        setMatchedModels(matched);
        setBestMatch(matched.length > 0 ? matched[0] : null);
        setFilteredAnalytics(matched);
        calculateInsights(matched);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            partnerTag: 'all',
            partnerId: 'all',
            productCategory: 'all',
            productId: 'all'
        });
    };

    // Get unique categories from products
    const getCategories = () => {
        const categories = [...new Set(products.map(item => item.category).filter(Boolean))];
        return categories;
    };

    // Get filtered partners based on partner tag
    const getFilteredPartners = () => {
        if (filters.partnerTag === 'all') return contacts;
        if (filters.partnerTag === 'customer') {
            return contacts.filter(c => c.type === 'customer');
        }
        if (filters.partnerTag === 'supplier') {
            return contacts.filter(c => c.type === 'vendor');
        }
        return contacts;
    };

    // Get filtered products based on category
    const getFilteredProducts = () => {
        if (filters.productCategory === 'all') return products;
        return products.filter(p => p.category === filters.productCategory);
    };

    const calculateInsights = (data) => {
        if (!data || data.length === 0) {
            setInsights({
                totalProfit: 0,
                totalRevenue: 0,
                avgProfitMargin: 0,
                topProduct: null,
                topPartner: null,
                profitTrend: 'stable'
            });
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
        filteredAnalytics.forEach(item => {
            const category = item.product_category || 'Unknown';
            categories[category] = (categories[category] || 0) + 1;
        });
        return Object.entries(categories).map(([name, count]) => ({ name, count }));
    };

    const getPartnerTypeDistribution = () => {
        const types = { supplier: 0, customer: 0 };
        filteredAnalytics.forEach(item => {
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

                {/* Filter Section */}
                <div className="card mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Partner Tag */}
                        <div>
                            <label className="block text-sm font-medium text-rose-600 mb-2">Partner Tag</label>
                            <select
                                name="partnerTag"
                                value={filters.partnerTag}
                                onChange={handleFilterChange}
                                className="input-field"
                            >
                                <option value="all">Many to One (from list)</option>
                                <option value="customer">Customer</option>
                                <option value="supplier">Supplier</option>
                            </select>
                        </div>

                        {/* Partner */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Partner</label>
                            <select
                                name="partnerId"
                                value={filters.partnerId}
                                onChange={handleFilterChange}
                                className="input-field"
                            >
                                <option value="all">Many to One (from list)</option>
                                {getFilteredPartners().map(partner => (
                                    <option key={partner.id} value={partner.id}>
                                        {partner.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Product Category */}
                        <div>
                            <label className="block text-sm font-medium text-rose-600 mb-2">Product Category</label>
                            <select
                                name="productCategory"
                                value={filters.productCategory}
                                onChange={handleFilterChange}
                                className="input-field"
                            >
                                <option value="all">Many to One (from list)</option>
                                {getCategories().map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Product */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                            <select
                                name="productId"
                                value={filters.productId}
                                onChange={handleFilterChange}
                                className="input-field"
                            >
                                <option value="all">Many to One (from list)</option>
                                {getFilteredProducts().map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Auto Apply Analytical Model - Matching Results */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900 underline">Auto Apply Analytical Model</h4>
                            <button
                                onClick={resetFilters}
                                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                            >
                                Reset Filters
                            </button>
                        </div>

                        {/* Matching Logic Explanation */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-blue-700">
                                <strong>Matching Priority:</strong> Product (4pts) → Partner (3pts) → Category (2pts) → Partner Tag (1pt). 
                                More matches = stricter rule, fewer matches = more generic.
                            </p>
                        </div>

                        {/* Best Match Display */}
                        {bestMatch ? (
                            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold">✓</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-green-800">Best Match Found</p>
                                            <p className="text-lg font-bold text-green-900">{bestMatch.event_name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-green-600">{bestMatch.matchScore}</span>
                                            <span className="text-sm text-green-600">/10 pts</span>
                                        </div>
                                        <p className="text-xs text-green-700">{bestMatch.matchCount} field(s) matched</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {bestMatch.matchedFields.map((field, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                                            ✓ {field}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                    <div><span className="text-gray-600">Product:</span> <strong>{bestMatch.product_name || 'N/A'}</strong></div>
                                    <div><span className="text-gray-600">Partner:</span> <strong>{bestMatch.partner_name || 'N/A'}</strong></div>
                                    <div><span className="text-gray-600">Category:</span> <strong>{bestMatch.product_category || 'N/A'}</strong></div>
                                    <div><span className="text-gray-600">Profit:</span> <strong className="text-green-600">₹{parseFloat(bestMatch.profit || 0).toLocaleString()}</strong></div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-center">
                                <p className="text-gray-600">Select filters above to find matching analytics models</p>
                            </div>
                        )}

                        {/* All Matched Models */}
                        {matchedModels.length > 1 && (
                            <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Other Matching Models ({matchedModels.length - 1})</h5>
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {matchedModels.slice(1).map((model, idx) => (
                                        <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                                                    {idx + 2}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{model.event_name}</p>
                                                    <div className="flex gap-1 mt-1">
                                                        {model.matchedFields.map((field, fidx) => (
                                                            <span key={fidx} className="px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                                                                {field}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-gray-600">{model.matchScore}</span>
                                                <span className="text-xs text-gray-500">/10</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
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
                                const percentage = filteredAnalytics.length > 0 ? (category.count / filteredAnalytics.length) * 100 : 0;
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
                            const percentage = filteredAnalytics.length > 0 ? (partner.count / filteredAnalytics.length) * 100 : 0;
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
                {filteredAnalytics.length === 0 && (
                    <div className="card bg-yellow-50 border border-yellow-200 mt-8">
                        <div className="flex items-center">
                            <svg className="h-6 w-6 text-yellow-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-medium text-yellow-900">No Analytics Data Available</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    {analytics.length === 0 
                                        ? 'Add analytics events to see automated insights and recommendations.'
                                        : 'No data matches the selected filters. Try adjusting your filter criteria.'}
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
