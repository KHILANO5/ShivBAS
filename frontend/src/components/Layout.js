import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <Navbar />

            {/* Main Content */}
            <div className="w-full">
                {children}
            </div>
        </div>
    );
};

export default Layout;
