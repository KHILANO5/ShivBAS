import React from 'react';

const SaleOrder = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Sale Order</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage sales orders from customers
                    </p>
                </div>

                <div className="card text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Sale Order Management</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        This page is under development. Sale order functionality will be available soon.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SaleOrder;
