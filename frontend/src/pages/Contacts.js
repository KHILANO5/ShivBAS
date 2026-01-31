import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Contacts = () => {
    const { isAdmin } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('active');
    const [searchTerm, setSearchTerm] = useState('');

    // Form state matching database schema
    const [formData, setFormData] = useState({
        name: '',
        type: 'customer',
        email: '',
        phone: '',
        linked_user_id: '',
        status: 'active'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Mock data - replace with actual API calls
            setContacts([
                {
                    id: 1,
                    name: 'ABC Corporation',
                    type: 'customer',
                    email: 'contact@abccorp.com',
                    phone: '+91-9876543210',
                    linked_user_id: null,
                    status: 'active',
                    created_at: '2026-01-05T10:00:00',
                    updated_at: '2026-01-05T10:00:00'
                },
                {
                    id: 2,
                    name: 'XYZ Enterprises',
                    type: 'customer',
                    email: 'info@xyzent.com',
                    phone: '+91-9876543211',
                    linked_user_id: null,
                    status: 'active',
                    created_at: '2026-01-08T11:30:00',
                    updated_at: '2026-01-08T11:30:00'
                },
                {
                    id: 3,
                    name: 'Global Trading Co',
                    type: 'customer',
                    email: 'sales@globaltrading.com',
                    phone: '+91-9876543212',
                    linked_user_id: null,
                    status: 'active',
                    created_at: '2026-01-10T14:20:00',
                    updated_at: '2026-01-10T14:20:00'
                },
                {
                    id: 4,
                    name: 'Premium Suppliers Ltd',
                    type: 'vendor',
                    email: 'orders@premiumsuppliers.com',
                    phone: '+91-9876543213',
                    linked_user_id: null,
                    status: 'active',
                    created_at: '2026-01-12T09:45:00',
                    updated_at: '2026-01-12T09:45:00'
                },
                {
                    id: 5,
                    name: 'Quality Materials Inc',
                    type: 'vendor',
                    email: 'contact@qualitymaterials.com',
                    phone: '+91-9876543214',
                    linked_user_id: null,
                    status: 'active',
                    created_at: '2026-01-15T16:10:00',
                    updated_at: '2026-01-15T16:10:00'
                },
                {
                    id: 6,
                    name: 'Old Customer',
                    type: 'customer',
                    email: 'old@customer.com',
                    phone: '+91-9876543215',
                    linked_user_id: null,
                    status: 'archived',
                    created_at: '2025-12-01T10:00:00',
                    updated_at: '2026-01-05T12:00:00'
                }
            ]);

            // Mock users for linking
            setUsers([
                { id: 1, name: 'Admin User', email: 'admin@shivbas.com' },
                { id: 2, name: 'John Portal', email: 'john@example.com' }
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateEmail = (email) => {
        if (!email) return true; // Email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        if (!phone) return true; // Phone is optional
        const phoneRegex = /^[+]?[\d\s-()]+$/;
        return phoneRegex.test(phone);
    };

    const handleCreateContact = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.type) {
            alert('Please fill in all required fields');
            return;
        }

        if (formData.email && !validateEmail(formData.email)) {
            alert('Please enter a valid email address');
            return;
        }

        if (formData.phone && !validatePhone(formData.phone)) {
            alert('Please enter a valid phone number');
            return;
        }

        // Check if linked_user_id is only for customers
        if (formData.linked_user_id && formData.type !== 'customer') {
            alert('User linking is only available for customers');
            return;
        }

        const newContact = {
            id: contacts.length + 1,
            name: formData.name,
            type: formData.type,
            email: formData.email || null,
            phone: formData.phone || null,
            linked_user_id: formData.linked_user_id ? parseInt(formData.linked_user_id) : null,
            status: formData.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        setContacts([newContact, ...contacts]);
        setShowCreateModal(false);
        resetForm();
    };

    const handleEditContact = async (e) => {
        e.preventDefault();

        // Same validation as create
        if (!formData.name || !formData.type) {
            alert('Please fill in all required fields');
            return;
        }

        if (formData.email && !validateEmail(formData.email)) {
            alert('Please enter a valid email address');
            return;
        }

        if (formData.phone && !validatePhone(formData.phone)) {
            alert('Please enter a valid phone number');
            return;
        }

        if (formData.linked_user_id && formData.type !== 'customer') {
            alert('User linking is only available for customers');
            return;
        }

        const updatedContact = {
            ...selectedContact,
            name: formData.name,
            type: formData.type,
            email: formData.email || null,
            phone: formData.phone || null,
            linked_user_id: formData.linked_user_id ? parseInt(formData.linked_user_id) : null,
            status: formData.status,
            updated_at: new Date().toISOString()
        };

        setContacts(contacts.map(c => c.id === selectedContact.id ? updatedContact : c));
        setShowEditModal(false);
        setSelectedContact(null);
        resetForm();
    };

    const handleDeleteContact = (id) => {
        if (window.confirm('Are you sure you want to delete this contact? This may affect existing invoices/bills.')) {
            setContacts(contacts.filter(c => c.id !== id));
        }
    };

    const handleArchiveContact = (id) => {
        if (window.confirm('Are you sure you want to archive this contact?')) {
            setContacts(contacts.map(c =>
                c.id === id ? { ...c, status: 'archived', updated_at: new Date().toISOString() } : c
            ));
        }
    };

    const handleActivateContact = (id) => {
        setContacts(contacts.map(c =>
            c.id === id ? { ...c, status: 'active', updated_at: new Date().toISOString() } : c
        ));
    };

    const openEditModal = (contact) => {
        setSelectedContact(contact);
        setFormData({
            name: contact.name,
            type: contact.type,
            email: contact.email || '',
            phone: contact.phone || '',
            linked_user_id: contact.linked_user_id || '',
            status: contact.status
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'customer',
            email: '',
            phone: '',
            linked_user_id: '',
            status: 'active'
        });
    };

    // Filter contacts
    const filteredContacts = contacts.filter(contact => {
        const matchesType = filterType === 'all' || contact.type === filterType;
        const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.phone?.includes(searchTerm);
        return matchesType && matchesStatus && matchesSearch;
    });

    // Calculate statistics
    const stats = {
        total: filteredContacts.length,
        customers: filteredContacts.filter(c => c.type === 'customer').length,
        vendors: filteredContacts.filter(c => c.type === 'vendor').length,
        active: filteredContacts.filter(c => c.status === 'active').length,
        archived: filteredContacts.filter(c => c.status === 'archived').length
    };

    const getTypeBadge = (type) => {
        return type === 'customer'
            ? { text: 'Customer', color: 'bg-blue-100 text-blue-800', icon: '👤' }
            : { text: 'Vendor', color: 'bg-purple-100 text-purple-800', icon: '🏢' };
    };

    const getStatusBadge = (status) => {
        return status === 'active'
            ? { text: 'Active', color: 'bg-green-100 text-green-800' }
            : { text: 'Archived', color: 'bg-gray-100 text-gray-800' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Loading contacts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your customers and vendors
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Customers</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">{stats.customers}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Vendors</p>
                        <p className="text-2xl font-bold text-purple-600 mt-2">{stats.vendors}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Active</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">{stats.active}</p>
                    </div>
                    <div className="card">
                        <p className="text-sm font-medium text-gray-600">Archived</p>
                        <p className="text-2xl font-bold text-gray-600 mt-2">{stats.archived}</p>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="card mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-field pl-10"
                                />
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-4">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Types</option>
                                <option value="customer">Customers</option>
                                <option value="vendor">Vendors</option>
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>

                            {isAdmin && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="btn-primary whitespace-nowrap"
                                >
                                    <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Contact
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contacts Table */}
                {filteredContacts.length === 0 ? (
                    <div className="card text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="mt-4 text-gray-600">No contacts found</p>
                        {isAdmin && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-4 btn-primary"
                            >
                                Add Your First Contact
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="card">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="table-header">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        {isAdmin && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredContacts.map((contact) => {
                                        const typeBadge = getTypeBadge(contact.type);
                                        const statusBadge = getStatusBadge(contact.status);
                                        return (
                                            <tr key={contact.id} className="table-row">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="text-2xl mr-3">{typeBadge.icon}</div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                                            {contact.linked_user_id && (
                                                                <div className="text-xs text-blue-600">🔗 Linked to user</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeBadge.color}`}>
                                                        {typeBadge.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{contact.email || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{contact.phone || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                                                        {statusBadge.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(contact.created_at).toLocaleDateString()}
                                                </td>
                                                {isAdmin && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => openEditModal(contact)}
                                                                className="text-primary-600 hover:text-primary-900"
                                                                title="Edit Contact"
                                                            >
                                                                Edit
                                                            </button>
                                                            {contact.status === 'active' ? (
                                                                <button
                                                                    onClick={() => handleArchiveContact(contact.id)}
                                                                    className="text-gray-600 hover:text-gray-900"
                                                                    title="Archive Contact"
                                                                >
                                                                    Archive
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleActivateContact(contact.id)}
                                                                    className="text-green-600 hover:text-green-900"
                                                                    title="Activate Contact"
                                                                >
                                                                    Activate
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteContact(contact.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete Contact"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Contact Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Add New Contact</h2>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleCreateContact} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="Business/Person name"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">VARCHAR(255) - Business or person name</p>
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="customer"
                                                checked={formData.type === 'customer'}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">👤 Customer (for invoices)</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="vendor"
                                                checked={formData.type === 'vendor'}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">🏢 Vendor (for bills)</span>
                                        </label>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">ENUM('customer', 'vendor') - Determines invoice vs bill relationship</p>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="contact@example.com"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">VARCHAR(255) - Optional but recommended</p>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="+91-9876543210"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">VARCHAR(20) - Phone number</p>
                                </div>

                                {/* Linked User (only for customers) */}
                                {formData.type === 'customer' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Link to User Account
                                        </label>
                                        <select
                                            name="linked_user_id"
                                            value={formData.linked_user_id}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        >
                                            <option value="">None</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">INT (FK) - Only if type=customer and self-registered</p>
                                    </div>
                                )}

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="input-field"
                                    >
                                        <option value="active">Active</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">ENUM('active', 'archived') - Soft delete</p>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Add Contact
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Contact Modal */}
            {showEditModal && selectedContact && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Edit Contact</h2>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedContact(null);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleEditContact} className="space-y-4">
                                {/* Same form fields as create modal */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="customer"
                                                checked={formData.type === 'customer'}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">👤 Customer</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="vendor"
                                                checked={formData.type === 'vendor'}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">🏢 Vendor</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="input-field"
                                    />
                                </div>

                                {formData.type === 'customer' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Link to User Account
                                        </label>
                                        <select
                                            name="linked_user_id"
                                            value={formData.linked_user_id}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        >
                                            <option value="">None</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="input-field"
                                    >
                                        <option value="active">Active</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedContact(null);
                                            resetForm();
                                        }}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Update Contact
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contacts;
