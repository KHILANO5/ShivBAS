import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        login_id: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.login_id || !formData.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        const result = await login(formData);
        setLoading(false);

        if (result.success) {
            if (result.user?.role === 'portal') {
                navigate('/portal/dashboard');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Logo and Title */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        ShivBAS
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Budget & Analytics System
                    </p>
                </div>

                {/* Login Form */}
                <div className="card">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="login_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Login ID
                            </label>
                            <input
                                id="login_id"
                                name="login_id"
                                type="text"
                                required
                                className="input-field"
                                placeholder="Enter your login ID"
                                value={formData.login_id}
                                onChange={handleChange}
                                autoComplete="username"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                6-12 characters, alphanumeric and underscore only
                            </p>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="input-field"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <button
                                    type="button"
                                    className="font-medium text-primary-600 hover:text-primary-500"
                                    onClick={() => navigate('/forgot-password')}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </span>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Test Credentials</span>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <p><strong>Admin:</strong> admin_user / Test@123</p>
                            <p><strong>Portal:</strong> john_portal / Test@123</p>
                        </div>

                        {/* Sign Up Link */}
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">New to ShivBAS?</span>
                                </div>
                            </div>

                            <div className="mt-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/signup')}
                                    className="font-medium text-primary-600 hover:text-primary-500"
                                >
                                    Create an account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
