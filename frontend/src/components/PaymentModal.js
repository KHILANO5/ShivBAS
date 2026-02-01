import React, { useState } from 'react';

const PaymentModal = ({ invoice, onClose, onSuccess }) => {
    const [step, setStep] = useState('payment'); // 'payment' | 'success'
    const [processing, setProcessing] = useState(false);

    const handlePay = async () => {
        setProcessing(true);
        // Simulate payment provider delay
        setTimeout(() => {
            setProcessing(false);
            setStep('success');
            onSuccess(invoice);
        }, 1500);
    };

    if (step === 'success') {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-sm animate-fade-in-up">
                    <div className="p-6 text-center">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900 w-full text-center">Secure checkout</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 absolute right-4 top-4">
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mb-6">https://checkout.razorpay.com</p>

                        <div className="mx-auto flex items-center justify-center h-16 w-16 mb-4">
                            <img src="https://media.tenor.com/0AVbKGY_MxMAAAAC/check-mark-verified.gif" alt="Success" className="h-full w-full object-contain" />
                            {/* Fallback SVG if img doesn't load nicely */}
                            {/*  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div> */}
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-2">Thanks for your payment</h2>
                        <p className="text-sm text-gray-500 mb-6">A payment will appear on your statement</p>

                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
                            <span className="text-gray-500">Payment</span>
                            <span className="font-bold text-gray-900">₹{invoice?.total_amount}</span>
                        </div>

                        <div className="mt-6 text-center text-xs text-gray-400">
                            Powered by <strong>Razorpay</strong><br />
                            Terms Privacy
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col h-[600px] overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-white bg-opacity-20 rounded flex items-center justify-center text-lg font-bold">
                            S
                        </div>
                        <div>
                            <h3 className="font-bold">Shiv Furniture</h3>
                            {/* <p className="text-xs text-blue-100">Test Mode</p> */}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        {/* Language selector icon mockup */}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                    <p className="text-sm text-gray-600 font-medium mb-2">Cards, UPI & More</p>

                    <div className="space-y-3">
                        {/* Option 1: UPI */}
                        <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex items-center cursor-pointer hover:border-blue-500 transition-colors">
                            <div className="h-8 w-8 mr-4 text-blue-600">
                                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">UPI / QR</h4>
                                <p className="text-xs text-gray-500">Google Pay, PhonePe & more</p>
                            </div>
                        </div>

                        {/* Option 2: Cards */}
                        <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex items-center cursor-pointer hover:border-blue-500 transition-colors">
                            <div className="h-8 w-8 mr-4 text-gray-600">
                                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Cards</h4>
                                <p className="text-xs text-gray-500">Visa, Mastercard, RuPay & more</p>
                            </div>
                        </div>

                        {/* Option 3: Net Banking */}
                        <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex items-center cursor-pointer hover:border-blue-500 transition-colors">
                            <div className="h-8 w-8 mr-4 text-gray-600">
                                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Net banking</h4>
                                <p className="text-xs text-gray-500">All Indian banks</p>
                            </div>
                        </div>

                        {/* Option 4: Pay Later */}
                        <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex items-center cursor-pointer hover:border-blue-500 transition-colors">
                            <div className="h-8 w-8 mr-4 text-gray-600">
                                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Pay Later</h4>
                                <p className="text-xs text-gray-500">LazyPay, ICICI and FlexiPay</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white p-4 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold text-gray-900">₹{invoice?.total_amount}</span>
                        <span className="text-xs text-gray-500 cursor-pointer">View Details</span>
                    </div>
                    <button
                        onClick={handlePay}
                        disabled={processing}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded shadow hover:bg-blue-700 transition duration-200 disabled:opacity-70 flex justify-center items-center"
                    >
                        {processing ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Pay Now'}
                    </button>
                    <div className="mt-2 text-center">
                        <span className="text-[10px] text-gray-400">Secured by Razorpay</span>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default PaymentModal;
