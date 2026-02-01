import React, { useState, useEffect } from 'react';
import { dashboardAPI, productsAPI, budgetsAPI } from '../services/api';

const ApiTest = () => {
    const [results, setResults] = useState({
        dashboard: null,
        products: null,
        budgets: null,
    });
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        testApis();
    }, []);

    const testApis = async () => {
        setLoading(true);
        const newResults = {};
        const newErrors = {};

        // Test Dashboard API
        try {
            const response = await dashboardAPI.getSummary();
            newResults.dashboard = response.data;
        } catch (error) {
            newErrors.dashboard = error.response?.data?.error || error.message;
        }

        // Test Products API
        try {
            const response = await productsAPI.getAll();
            newResults.products = response.data;
        } catch (error) {
            newErrors.products = error.response?.data?.error || error.message;
        }

        // Test Budgets API
        try {
            const response = await budgetsAPI.getAll();
            newResults.budgets = response.data;
        } catch (error) {
            newErrors.budgets = error.response?.data?.error || error.message;
        }

        setResults(newResults);
        setErrors(newErrors);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Testing API connections...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">API Connection Test</h1>

                {/* Dashboard API */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        {errors.dashboard ? (
                            <span className="text-red-600">❌ Dashboard API</span>
                        ) : (
                            <span className="text-green-600">✅ Dashboard API</span>
                        )}
                    </h2>
                    {errors.dashboard ? (
                        <div className="bg-red-50 text-red-700 p-4 rounded">
                            <p className="font-medium">Error:</p>
                            <p>{errors.dashboard}</p>
                        </div>
                    ) : (
                        <div className="bg-green-50 p-4 rounded">
                            <p className="font-medium text-green-900 mb-2">Response:</p>
                            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
                                {JSON.stringify(results.dashboard, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Products API */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        {errors.products ? (
                            <span className="text-red-600">❌ Products API</span>
                        ) : (
                            <span className="text-green-600">✅ Products API</span>
                        )}
                    </h2>
                    {errors.products ? (
                        <div className="bg-red-50 text-red-700 p-4 rounded">
                            <p className="font-medium">Error:</p>
                            <p>{errors.products}</p>
                        </div>
                    ) : (
                        <div className="bg-green-50 p-4 rounded">
                            <p className="font-medium text-green-900 mb-2">
                                Found {results.products?.data?.length || 0} products
                            </p>
                            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto max-h-64">
                                {JSON.stringify(results.products, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Budgets API */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        {errors.budgets ? (
                            <span className="text-red-600">❌ Budgets API</span>
                        ) : (
                            <span className="text-green-600">✅ Budgets API</span>
                        )}
                    </h2>
                    {errors.budgets ? (
                        <div className="bg-red-50 text-red-700 p-4 rounded">
                            <p className="font-medium">Error:</p>
                            <p>{errors.budgets}</p>
                        </div>
                    ) : (
                        <div className="bg-green-50 p-4 rounded">
                            <p className="font-medium text-green-900 mb-2">
                                Found {results.budgets?.data?.length || 0} budgets
                            </p>
                            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto max-h-64">
                                {JSON.stringify(results.budgets, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Connection Summary</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className={`p-4 rounded ${errors.dashboard ? 'bg-red-50' : 'bg-green-50'}`}>
                            <p className="text-3xl font-bold mb-2">
                                {errors.dashboard ? '❌' : '✅'}
                            </p>
                            <p className="text-sm font-medium">Dashboard</p>
                        </div>
                        <div className={`p-4 rounded ${errors.products ? 'bg-red-50' : 'bg-green-50'}`}>
                            <p className="text-3xl font-bold mb-2">
                                {errors.products ? '❌' : '✅'}
                            </p>
                            <p className="text-sm font-medium">Products</p>
                        </div>
                        <div className={`p-4 rounded ${errors.budgets ? 'bg-red-50' : 'bg-green-50'}`}>
                            <p className="text-3xl font-bold mb-2">
                                {errors.budgets ? '❌' : '✅'}
                            </p>
                            <p className="text-sm font-medium">Budgets</p>
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <button 
                            onClick={testApis}
                            className="btn-primary"
                        >
                            Retry Tests
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiTest;
