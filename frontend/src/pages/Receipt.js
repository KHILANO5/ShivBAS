import React from 'react';

const Receipt = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Receipt</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage receipts from customers
                    </p>
                </div>

                <div className="card text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Receipt Management</h3>
                    <p className="mt-2 text-sm text-gray-600">
                        This page is under development. Receipt functionality will be available soon.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Receipt;
