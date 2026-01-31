import React from 'react';

const PurchaseOrder = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Purchase Order</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage purchase orders from vendors
                    </p>
                </div>

                <div className="card text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Purchase Order Management</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        This page is under development. Purchase order functionality will be available soon.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrder;
