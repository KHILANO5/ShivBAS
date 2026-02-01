import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            
            if (response.data.success) {
                const { user, accessToken } = response.data.data;

                localStorage.setItem('token', accessToken);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);

                return { success: true, user };
            }
            
            return { success: false, error: 'Login failed. Please try again.' };
        } catch (error) {
            console.error('Login error:', error);
            
            // Handle different error scenarios
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                // Specific error messages based on status code
                if (status === 401) {
                    return { 
                        success: false, 
                        error: errorData.error || 'Invalid login credentials. Please check your Login ID and password.' 
                    };
                } else if (status === 400) {
                    return { 
                        success: false, 
                        error: errorData.error || 'Invalid input. Please check your Login ID and password.' 
                    };
                } else if (status === 403) {
                    return { 
                        success: false, 
                        error: 'Your account has been suspended. Please contact the administrator.' 
                    };
                } else if (status === 500) {
                    return { 
                        success: false, 
                        error: 'Server error. Please try again later.' 
                    };
                } else {
                    return { 
                        success: false, 
                        error: errorData.error || 'Login failed. Please try again.' 
                    };
                }
            } else if (error.request) {
                // Network error - no response received
                return { 
                    success: false, 
                    error: 'Unable to connect to the server. Please check your internet connection.' 
                };
            } else {
                // Other errors
                return { 
                    success: false, 
                    error: 'An unexpected error occurred. Please try again.' 
                };
            }
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            
            if (response.data.success) {
                const { user, accessToken } = response.data.data;

                localStorage.setItem('token', accessToken);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);

                return { success: true, user };
            }
            
            return { success: false, error: 'Registration failed' };
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Registration failed';
            return { success: false, error: errorMessage };
        }
    };

    const value = {
        user,
        login,
        logout,
        register,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isCustomer: user?.role === 'portal' || user?.role === 'customer',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
