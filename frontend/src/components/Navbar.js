import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleDropdown = (menu) => {
        setOpenDropdown(openDropdown === menu ? null : menu);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setOpenDropdown(null);
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setOpenDropdown(null);
        if (openDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openDropdown]);

    const menuItems = {
        account: {
            title: 'Account',
            items: [
                { label: 'Contact', path: '/contacts' },
                { label: 'Product', path: '/products' },
                { label: 'Analytics', path: '/analytics' },
                { label: 'Auto Analytic Model', path: '/auto-analytics' }
            ]
        },
        budget: {
            title: 'Budgets',
            items: [
                { label: 'Budget List', path: '/budgets' },
                { label: 'Revised Budget', path: '/revised-budgets' },
                { label: 'Budget Graph', path: '/budget-graph' }
            ]
        },
        purchase: {
            title: 'Purchase',
            items: [
                { label: 'Purchase Order', path: '/purchase-order' },
                { label: 'Purchase Bill', path: '/purchase-bill' },
                { label: 'Pay Now (Razorpay)', path: '/payment-gateway' }
            ]
        },
        sale: {
            title: 'Sale',
            items: [
                { label: 'Sale Order', path: '/sale-order' },
                { label: 'Sale Invoice', path: '/invoices' },
                { label: 'Receipt', path: '/receipt' }
            ]
        }
    };

    return (
        <nav className="bg-gray-900 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                        >
                            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold">ShivBAS</span>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className="flex items-center space-x-1">
                        {Object.entries(menuItems).map(([key, menu]) => (
                            <div key={key} className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDropdown(key);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${openDropdown === key
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <span className="flex items-center">
                                        {menu.title}
                                        <svg
                                            className={`ml-2 h-4 w-4 transition-transform ${openDropdown === key ? 'rotate-180' : ''
                                                }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {openDropdown === key && (
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                        {menu.items.map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleNavigation(item.path)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right Side - User Profile */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                        >
                            Dashboard
                        </button>

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown('user');
                                }}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                                    {isAdmin ? 'A' : 'U'}
                                </div>
                                <svg
                                    className={`h-4 w-4 transition-transform ${openDropdown === 'user' ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* User Dropdown Menu */}
                            {openDropdown === 'user' && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                    <button
                                        onClick={() => handleNavigation('/profile')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </button>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <button
                                        onClick={() => {
                                            setOpenDropdown(null);
                                            navigate('/login');
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
