import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user, isAdmin } = useAuth();
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Application Settings
    const [appSettings, setAppSettings] = useState({
        theme: 'light',
        language: 'en',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        currency: 'INR'
    });

    // Notification Settings
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        budgetAlerts: true,
        invoiceReminders: true,
        systemUpdates: false,
        marketingEmails: false
    });

    // Privacy Settings
    const [privacy, setPrivacy] = useState({
        profileVisibility: 'private',
        showEmail: false,
        showActivity: true
    });

    const handleAppSettingChange = (e) => {
        const { name, value } = e.target;
        setAppSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotifications(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handlePrivacyChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPrivacy(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveSettings = async (settingType) => {
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            // Mock API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage({ type: 'success', text: `${settingType} settings saved successfully!` });

            // Scroll to top to show message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetSettings = () => {
        if (window.confirm('Are you sure you want to reset all settings to default?')) {
            setAppSettings({
                theme: 'light',
                language: 'en',
                timezone: 'Asia/Kolkata',
                dateFormat: 'DD/MM/YYYY',
                currency: 'INR'
            });
            setNotifications({
                emailNotifications: true,
                budgetAlerts: true,
                invoiceReminders: true,
                systemUpdates: false,
                marketingEmails: false
            });
            setPrivacy({
                profileVisibility: 'private',
                showEmail: false,
                showActivity: true
            });
            setMessage({ type: 'success', text: 'Settings reset to default values' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your application preferences and configurations
                    </p>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                        <div className="flex items-center">
                            {message.type === 'success' ? (
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                            {message.text}
                        </div>
                    </div>
                )}

                {/* Application Settings */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Application Settings</h2>
                            <p className="text-sm text-gray-600 mt-1">Customize your application experience</p>
                        </div>
                        <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Theme */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Theme
                                </label>
                                <select
                                    name="theme"
                                    value={appSettings.theme}
                                    onChange={handleAppSettingChange}
                                    className="input-field"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="auto">Auto (System)</option>
                                </select>
                            </div>

                            {/* Language */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Language
                                </label>
                                <select
                                    name="language"
                                    value={appSettings.language}
                                    onChange={handleAppSettingChange}
                                    className="input-field"
                                >
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="mr">Marathi</option>
                                </select>
                            </div>

                            {/* Timezone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Timezone
                                </label>
                                <select
                                    name="timezone"
                                    value={appSettings.timezone}
                                    onChange={handleAppSettingChange}
                                    className="input-field"
                                >
                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                    <option value="America/New_York">America/New York (EST)</option>
                                    <option value="Europe/London">Europe/London (GMT)</option>
                                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                </select>
                            </div>

                            {/* Date Format */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date Format
                                </label>
                                <select
                                    name="dateFormat"
                                    value={appSettings.dateFormat}
                                    onChange={handleAppSettingChange}
                                    className="input-field"
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>

                            {/* Currency */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Currency
                                </label>
                                <select
                                    name="currency"
                                    value={appSettings.currency}
                                    onChange={handleAppSettingChange}
                                    className="input-field"
                                >
                                    <option value="INR">₹ INR (Indian Rupee)</option>
                                    <option value="USD">$ USD (US Dollar)</option>
                                    <option value="EUR">€ EUR (Euro)</option>
                                    <option value="GBP">£ GBP (British Pound)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button
                                onClick={() => handleSaveSettings('Application')}
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Application Settings'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                            <p className="text-sm text-gray-600 mt-1">Manage how you receive notifications</p>
                        </div>
                        <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>

                    <div className="space-y-4">
                        {/* Email Notifications */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Email Notifications</p>
                                <p className="text-sm text-gray-600">Receive notifications via email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="emailNotifications"
                                    checked={notifications.emailNotifications}
                                    onChange={handleNotificationChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        {/* Budget Alerts */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Budget Alerts</p>
                                <p className="text-sm text-gray-600">Get notified when budgets exceed limits</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="budgetAlerts"
                                    checked={notifications.budgetAlerts}
                                    onChange={handleNotificationChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        {/* Invoice Reminders */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Invoice Reminders</p>
                                <p className="text-sm text-gray-600">Reminders for pending invoices</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="invoiceReminders"
                                    checked={notifications.invoiceReminders}
                                    onChange={handleNotificationChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        {/* System Updates */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">System Updates</p>
                                <p className="text-sm text-gray-600">Notifications about system updates</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="systemUpdates"
                                    checked={notifications.systemUpdates}
                                    onChange={handleNotificationChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        {/* Marketing Emails */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Marketing Emails</p>
                                <p className="text-sm text-gray-600">Promotional and marketing content</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="marketingEmails"
                                    checked={notifications.marketingEmails}
                                    onChange={handleNotificationChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button
                                onClick={() => handleSaveSettings('Notification')}
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Notification Settings'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Privacy & Security</h2>
                            <p className="text-sm text-gray-600 mt-1">Control your privacy preferences</p>
                        </div>
                        <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <div className="space-y-4">
                        {/* Profile Visibility */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profile Visibility
                            </label>
                            <select
                                name="profileVisibility"
                                value={privacy.profileVisibility}
                                onChange={handlePrivacyChange}
                                className="input-field"
                            >
                                <option value="public">Public - Visible to everyone</option>
                                <option value="private">Private - Only visible to you</option>
                                <option value="team">Team - Visible to team members</option>
                            </select>
                        </div>

                        {/* Show Email */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Show Email Address</p>
                                <p className="text-sm text-gray-600">Display your email on your profile</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="showEmail"
                                    checked={privacy.showEmail}
                                    onChange={handlePrivacyChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        {/* Show Activity */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">Show Activity Status</p>
                                <p className="text-sm text-gray-600">Let others see when you're active</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="showActivity"
                                    checked={privacy.showActivity}
                                    onChange={handlePrivacyChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button
                                onClick={() => handleSaveSettings('Privacy')}
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Privacy Settings'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone (Admin Only) */}
                {isAdmin && (
                    <div className="card border-2 border-red-200 bg-red-50">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
                                <p className="text-sm text-red-700 mt-1">Irreversible and destructive actions</p>
                            </div>
                            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                                <div>
                                    <p className="font-medium text-gray-900">Reset All Settings</p>
                                    <p className="text-sm text-gray-600">Restore all settings to default values</p>
                                </div>
                                <button
                                    onClick={handleResetSettings}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Reset Settings
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                                <div>
                                    <p className="font-medium text-gray-900">Clear All Data</p>
                                    <p className="text-sm text-gray-600">Delete all your data permanently</p>
                                </div>
                                <button
                                    onClick={() => alert('This feature will be available soon')}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Clear Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Card */}
                <div className="card bg-blue-50 border border-blue-200 mt-6">
                    <div className="flex items-start">
                        <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-medium text-blue-900">Settings Information</p>
                            <p className="text-sm text-blue-700 mt-1">
                                Your settings are automatically saved to your account. Changes will take effect immediately after saving.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
