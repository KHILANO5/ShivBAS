// Mock API service that simulates backend responses
// This allows login to work without a real backend

const MOCK_USERS = [
    {
        id: 1,
        login_id: 'admin_user',
        password: 'Test@123',
        email: 'admin@shivbas.com',
        name: 'Admin User',
        role: 'admin'
    },
    {
        id: 2,
        login_id: 'john_portal',
        password: 'Test@123',
        email: 'john@shivbas.com',
        name: 'John Portal',
        role: 'portal'
    },
    {
        id: 3,
        login_id: 'jane_portal',
        password: 'Test@123',
        email: 'jane@shivbas.com',
        name: 'Jane Portal',
        role: 'portal'
    }
];

const MOCK_BUDGETS = [
    {
        id: 1,
        event_name: 'Expo 2026',
        analytics_id: 1,
        type: 'income',
        budgeted_amount: 100000,
        achieved_amount: 75000,
        percentage_achieved: 75,
        amount_to_achieve: 25000,
        start_date: '2026-02-01',
        end_date: '2026-02-28'
    },
    {
        id: 2,
        event_name: 'Summer Sale',
        analytics_id: 2,
        type: 'income',
        budgeted_amount: 50000,
        achieved_amount: 45000,
        percentage_achieved: 90,
        amount_to_achieve: 5000,
        start_date: '2026-03-01',
        end_date: '2026-03-31'
    },
    {
        id: 3,
        event_name: 'Marketing Campaign',
        analytics_id: 3,
        type: 'expense',
        budgeted_amount: 30000,
        achieved_amount: 28000,
        percentage_achieved: 93.33,
        amount_to_achieve: 2000,
        start_date: '2026-01-15',
        end_date: '2026-02-15'
    },
    {
        id: 4,
        event_name: 'Product Launch',
        analytics_id: 4,
        type: 'income',
        budgeted_amount: 80000,
        achieved_amount: 85000,
        percentage_achieved: 106.25,
        amount_to_achieve: -5000,
        start_date: '2026-02-10',
        end_date: '2026-03-10'
    },
    {
        id: 5,
        event_name: 'Office Renovation',
        analytics_id: 5,
        type: 'expense',
        budgeted_amount: 40000,
        achieved_amount: 15000,
        percentage_achieved: 37.5,
        amount_to_achieve: 25000,
        start_date: '2026-01-01',
        end_date: '2026-04-01'
    }
];

const MOCK_ANALYTICS = [
    {
        id: 1,
        event_name: 'Expo 2026',
        partner_tag: 'supplier',
        partner_id: 1,
        product_id: 1,
        no_of_units: 100,
        unit_price: 500,
        profit: 25000,
        profit_margin_percentage: 33.33
    },
    {
        id: 2,
        event_name: 'Summer Sale',
        partner_tag: 'customer',
        partner_id: 2,
        product_id: 2,
        no_of_units: 200,
        unit_price: 300,
        profit: 35000,
        profit_margin_percentage: 28.5
    },
    {
        id: 3,
        event_name: 'Product Launch',
        partner_tag: 'customer',
        partner_id: 3,
        product_id: 3,
        no_of_units: 150,
        unit_price: 600,
        profit: 42000,
        profit_margin_percentage: 35.2
    },
    {
        id: 4,
        event_name: 'Trade Show',
        partner_tag: 'supplier',
        partner_id: 1,
        product_id: 4,
        no_of_units: 80,
        unit_price: 450,
        profit: 18000,
        profit_margin_percentage: 25.0
    },
    {
        id: 5,
        event_name: 'Corporate Event',
        partner_tag: 'customer',
        partner_id: 2,
        product_id: 5,
        no_of_units: 120,
        unit_price: 550,
        profit: 30000,
        profit_margin_percentage: 30.5
    },
    {
        id: 6,
        event_name: 'Workshop Series',
        partner_tag: 'supplier',
        partner_id: 3,
        product_id: 1,
        no_of_units: 60,
        unit_price: 400,
        profit: 15000,
        profit_margin_percentage: 22.8
    }
];

const MOCK_PRODUCTS = [
    {
        id: 1,
        name: 'Premium Wood',
        category: 'Raw Materials',
        unit_price: 500.00,
        tax_rate: 18.00,
        status: 'active'
    },
    {
        id: 2,
        name: 'Steel Sheets',
        category: 'Raw Materials',
        unit_price: 750.00,
        tax_rate: 18.00,
        status: 'active'
    },
    {
        id: 3,
        name: 'Cotton Fabric',
        category: 'Textiles',
        unit_price: 300.00,
        tax_rate: 5.00,
        status: 'active'
    },
    {
        id: 4,
        name: 'Plastic Components',
        category: 'Components',
        unit_price: 450.00,
        tax_rate: 18.00,
        status: 'active'
    },
    {
        id: 5,
        name: 'Glass Panels',
        category: 'Raw Materials',
        unit_price: 600.00,
        tax_rate: 18.00,
        status: 'active'
    }
];

const MOCK_CONTACTS = [
    {
        id: 1,
        name: 'ABC Corporation',
        type: 'customer',
        email: 'contact@abccorp.com',
        phone: '+91-9876543210',
        status: 'active'
    },
    {
        id: 2,
        name: 'XYZ Enterprises',
        type: 'customer',
        email: 'info@xyzent.com',
        phone: '+91-9876543211',
        status: 'active'
    },
    {
        id: 3,
        name: 'Global Trading Co',
        type: 'customer',
        email: 'sales@globaltrading.com',
        phone: '+91-9876543212',
        status: 'active'
    },
    {
        id: 4,
        name: 'Premium Suppliers Ltd',
        type: 'vendor',
        email: 'orders@premiumsuppliers.com',
        phone: '+91-9876543213',
        status: 'active'
    },
    {
        id: 5,
        name: 'Quality Materials Inc',
        type: 'vendor',
        email: 'contact@qualitymaterials.com',
        phone: '+91-9876543214',
        status: 'active'
    }
];

const MOCK_PURCHASE_ORDERS = [
    {
        id: 1,
        po_number: 'PO-2026-001',
        vendor_id: 4,
        created_date: '2026-01-20',
        expected_date: '2026-02-01',
        status: 'sent',
        total_amount: 15000.00,
        notes: 'Urgent delivery required',
        items: [
            { product_id: 1, quantity: 20, unit_price: 500.00, tax_rate: 18.00 },
            { product_id: 2, quantity: 5, unit_price: 750.00, tax_rate: 18.00 }
        ]
    },
    {
        id: 2,
        po_number: 'PO-2026-002',
        vendor_id: 5,
        created_date: '2026-01-25',
        expected_date: '2026-02-05',
        status: 'draft',
        total_amount: 5000.00,
        notes: 'Regular stock replenishment',
        items: [
            { product_id: 5, quantity: 10, unit_price: 600.00, tax_rate: 18.00 }
        ]
    }
];

const MOCK_PURCHASE_BILLS = [
    {
        id: 1,
        bill_number: 'BILL-2026-001',
        vendor_id: 4,
        bill_date: '2026-01-22',
        due_date: '2026-02-22',
        status: 'posted',
        payment_status: 'not_paid',
        total_amount: 15000.00,
        notes: 'Invoice #INV-9988 from vendor',
        items: [
            { product_id: 1, quantity: 20, unit_price: 500.00, tax_rate: 18.00 },
            { product_id: 2, quantity: 5, unit_price: 750.00, tax_rate: 18.00 }
        ]
    }
];

const MOCK_DASHBOARD_SUMMARY = {
    total_budgets: 5,
    active_events: 6,
    total_income: 250000,
    total_expenses: 180000
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockAPI = {
    // Authentication
    login: async (credentials) => {
        await delay(500); // Simulate network delay

        const user = MOCK_USERS.find(
            u => u.login_id === credentials.login_id && u.password === credentials.password
        );

        if (!user) {
            throw {
                response: {
                    data: {
                        error: 'Invalid login_id or password'
                    }
                }
            };
        }

        const { password, ...userWithoutPassword } = user;

        return {
            data: {
                success: true,
                message: 'Login successful',
                data: {
                    user: userWithoutPassword,
                    token: 'mock-jwt-token-' + user.id,
                    refreshToken: 'mock-refresh-token-' + user.id
                }
            }
        };
    },

    logout: async () => {
        await delay(200);
        return {
            data: {
                success: true,
                message: 'Logged out successfully'
            }
        };
    },

    getCurrentUser: async () => {
        await delay(200);
        const user = MOCK_USERS[0]; // Return admin user
        const { password, ...userWithoutPassword } = user;
        return {
            data: {
                success: true,
                data: userWithoutPassword
            }
        };
    },

    // Dashboard
    getDashboardSummary: async () => {
        await delay(300);
        return {
            data: {
                success: true,
                data: MOCK_DASHBOARD_SUMMARY
            }
        };
    },

    // Budgets
    getBudgets: async (params) => {
        await delay(300);
        return {
            data: {
                success: true,
                data: {
                    total: MOCK_BUDGETS.length,
                    budgets: MOCK_BUDGETS
                }
            }
        };
    },

    // Analytics
    getAnalytics: async (params) => {
        await delay(300);
        return {
            data: {
                success: true,
                data: {
                    total: MOCK_ANALYTICS.length,
                    events: MOCK_ANALYTICS
                }
            }
        };
    },

    // Products
    getProducts: async () => {
        await delay(300);
        return {
            data: {
                success: true,
                data: MOCK_PRODUCTS
            }
        };
    },

    // Contacts
    getContacts: async () => {
        await delay(300);
        return {
            data: {
                success: true,
                data: MOCK_CONTACTS
            }
        };
    },

    // Purchase Orders
    getPurchaseOrders: async () => {
        await delay(300);
        // Enrich POs with vendor names and other details if needed
        const enrichedPOs = MOCK_PURCHASE_ORDERS.map(po => {
            const vendor = MOCK_CONTACTS.find(c => c.id === po.vendor_id);
            return {
                ...po,
                vendor_name: vendor ? vendor.name : 'Unknown Vendor'
            };
        });
        return {
            data: {
                success: true,
                data: enrichedPOs
            }
        };
    },

    createPurchaseOrder: async (data) => {
        await delay(500);
        const newPO = {
            id: MOCK_PURCHASE_ORDERS.length + 1,
            po_number: `PO-2026-${String(MOCK_PURCHASE_ORDERS.length + 1).padStart(3, '0')}`,
            ...data,
            created_at: new Date().toISOString()
        };
        MOCK_PURCHASE_ORDERS.unshift(newPO);
        return {
            data: {
                success: true,
                message: 'Purchase Order created successfully',
                data: newPO
            }
        };
    },

    updatePurchaseOrder: async (id, data) => {
        await delay(500);
        const index = MOCK_PURCHASE_ORDERS.findIndex(po => po.id === id);
        if (index !== -1) {
            MOCK_PURCHASE_ORDERS[index] = { ...MOCK_PURCHASE_ORDERS[index], ...data };
            return {
                data: {
                    success: true,
                    message: 'Purchase Order updated successfully',
                    data: MOCK_PURCHASE_ORDERS[index]
                }
            };
        }
        throw { response: { data: { error: 'Purchase Order not found' } } };
    },

    deletePurchaseOrder: async (id) => {
        await delay(500);
        const index = MOCK_PURCHASE_ORDERS.findIndex(po => po.id === id);
        if (index !== -1) {
            MOCK_PURCHASE_ORDERS.splice(index, 1);
            return {
                data: {
                    success: true,
                    message: 'Purchase Order deleted successfully'
                }
            };
        }
        throw { response: { data: { error: 'Purchase Order not found' } } };
    },

    // Purchase Bills
    getPurchaseBills: async () => {
        await delay(300);
        const enrichedBills = MOCK_PURCHASE_BILLS.map(bill => {
            const vendor = MOCK_CONTACTS.find(c => c.id === bill.vendor_id);
            return {
                ...bill,
                vendor_name: vendor ? vendor.name : 'Unknown Vendor'
            };
        });
        return {
            data: {
                success: true,
                data: enrichedBills
            }
        };
    },

    createPurchaseBill: async (data) => {
        await delay(500);
        const newBill = {
            id: MOCK_PURCHASE_BILLS.length + 1,
            bill_number: `BILL-2026-${String(MOCK_PURCHASE_BILLS.length + 1).padStart(3, '0')}`,
            payment_status: 'not_paid',
            ...data,
            created_at: new Date().toISOString()
        };
        MOCK_PURCHASE_BILLS.unshift(newBill);
        return {
            data: {
                success: true,
                message: 'Purchase Bill created successfully',
                data: newBill
            }
        };
    },

    updatePurchaseBill: async (id, data) => {
        await delay(500);
        const index = MOCK_PURCHASE_BILLS.findIndex(bill => bill.id === id);
        if (index !== -1) {
            MOCK_PURCHASE_BILLS[index] = { ...MOCK_PURCHASE_BILLS[index], ...data };
            return {
                data: {
                    success: true,
                    message: 'Purchase Bill updated successfully',
                    data: MOCK_PURCHASE_BILLS[index]
                }
            };
        }
        throw { response: { data: { error: 'Purchase Bill not found' } } };
    },

    deletePurchaseBill: async (id) => {
        await delay(500);
        const index = MOCK_PURCHASE_BILLS.findIndex(bill => bill.id === id);
        if (index !== -1) {
            MOCK_PURCHASE_BILLS.splice(index, 1);
            return {
                data: {
                    success: true,
                    message: 'Purchase Bill deleted successfully'
                }
            };
        }
        throw { response: { data: { error: 'Purchase Bill not found' } } };
    },

    // Revised Budgets
    getRevisedBudgets: async () => {
        await delay(300);
        const enriched = MOCK_REVISED_BUDGETS.map(rb => {
            const originalBudget = MOCK_BUDGETS.find(b => b.id === rb.budget_id);
            return {
                ...rb,
                original_budget_amount: originalBudget ? originalBudget.budgeted_amount : 0
            };
        });
        return {
            data: {
                success: true,
                data: enriched
            }
        };
    },

    createRevisedBudget: async (data) => {
        await delay(500);
        const newRB = {
            id: MOCK_REVISED_BUDGETS.length + 1,
            ...data,
            revised_achieved_amount: 0, // Initial
            budget_exceed: 'no',
            created_at: new Date().toISOString()
        };
        MOCK_REVISED_BUDGETS.unshift(newRB);
        return {
            data: {
                success: true,
                message: 'Revised Budget created successfully',
                data: newRB
            }
        };
    },

    updateRevisedBudget: async (id, data) => {
        await delay(500);
        const index = MOCK_REVISED_BUDGETS.findIndex(rb => rb.id === id);
        if (index !== -1) {
            MOCK_REVISED_BUDGETS[index] = { ...MOCK_REVISED_BUDGETS[index], ...data };
            return {
                data: {
                    success: true,
                    message: 'Revised Budget updated successfully',
                    data: MOCK_REVISED_BUDGETS[index]
                }
            };
        }
        throw { response: { data: { error: 'Revised Budget not found' } } };
    },

    deleteRevisedBudget: async (id) => {
        await delay(500);
        const index = MOCK_REVISED_BUDGETS.findIndex(rb => rb.id === id);
        if (index !== -1) {
            MOCK_REVISED_BUDGETS.splice(index, 1);
            return {
                data: {
                    success: true,
                    message: 'Revised Budget deleted successfully'
                }
            };
        }
        throw { response: { data: { error: 'Revised Budget not found' } } };
    },

    // Payments
    createPayment: async (data) => {
        await delay(1000); // Simulate gateway delay
        const newPayment = {
            id: MOCK_PAYMENTS.length + 1,
            payment_date: new Date().toISOString().split('T')[0],
            status: 'completed',
            created_at: new Date().toISOString(),
            ...data
        };
        MOCK_PAYMENTS.push(newPayment);
        return {
            data: {
                success: true,
                message: 'Payment recorded successfully',
                data: newPayment
            }
        };
    },

    // Sale Orders
    getSaleOrders: async () => {
        await delay(300);
        const enrichedSOs = MOCK_SALE_ORDERS.map(so => {
            const customer = MOCK_CONTACTS.find(c => c.id === so.customer_id);
            return {
                ...so,
                customer_name: customer ? customer.name : 'Unknown Customer'
            };
        });
        return {
            data: {
                success: true,
                data: enrichedSOs
            }
        };
    },

    createSaleOrder: async (data) => {
        await delay(500);
        const newSO = {
            id: MOCK_SALE_ORDERS.length + 1,
            so_number: `SO${String(MOCK_SALE_ORDERS.length + 1).padStart(5, '0')}`,
            ...data,
            created_at: new Date().toISOString()
        };
        MOCK_SALE_ORDERS.unshift(newSO);
        return {
            data: {
                success: true,
                message: 'Sale Order created successfully',
                data: newSO
            }
        };
    },

    updateSaleOrder: async (id, data) => {
        await delay(500);
        const index = MOCK_SALE_ORDERS.findIndex(so => so.id === id);
        if (index !== -1) {
            MOCK_SALE_ORDERS[index] = { ...MOCK_SALE_ORDERS[index], ...data };
            return {
                data: {
                    success: true,
                    message: 'Sale Order updated successfully',
                    data: MOCK_SALE_ORDERS[index]
                }
            };
        }
        throw { response: { data: { error: 'Sale Order not found' } } };
    },

    deleteSaleOrder: async (id) => {
        await delay(500);
        const index = MOCK_SALE_ORDERS.findIndex(so => so.id === id);
        if (index !== -1) {
            MOCK_SALE_ORDERS.splice(index, 1);
            return {
                data: {
                    success: true,
                    message: 'Sale Order deleted successfully'
                }
            };
        }
        throw { response: { data: { error: 'Sale Order not found' } } };
    },

    // Receipts / Vouchers
    getReceipts: async () => {
        await delay(300);
        const enriched = MOCK_RECEIPTS.map(r => {
            const partner = MOCK_CONTACTS.find(c => c.id === r.partner_id);
            return {
                ...r,
                partner_name: partner ? partner.name : 'Unknown Partner'
            };
        });
        return {
            data: {
                success: true,
                data: enriched
            }
        };
    },

    createReceipt: async (data) => {
        await delay(500);
        const newReceipt = {
            id: MOCK_RECEIPTS.length + 1,
            receipt_number: `Pay/${new Date().getFullYear().toString().substr(-2)}/${String(MOCK_RECEIPTS.length + 1).padStart(4, '0')}`,
            ...data,
            created_at: new Date().toISOString()
        };
        MOCK_RECEIPTS.unshift(newReceipt);
        return {
            data: {
                success: true,
                message: 'Receipt created successfully',
                data: newReceipt
            }
        };
    },

    updateReceipt: async (id, data) => {
        await delay(500);
        const index = MOCK_RECEIPTS.findIndex(r => r.id === id);
        if (index !== -1) {
            MOCK_RECEIPTS[index] = { ...MOCK_RECEIPTS[index], ...data };
            return {
                data: {
                    success: true,
                    message: 'Receipt updated successfully',
                    data: MOCK_RECEIPTS[index]
                }
            };
        }
        throw { response: { data: { error: 'Receipt not found' } } };
    },

    deleteReceipt: async (id) => {
        await delay(500);
        const index = MOCK_RECEIPTS.findIndex(r => r.id === id);
        if (index !== -1) {
            MOCK_RECEIPTS.splice(index, 1);
            return {
                data: {
                    success: true,
                    message: 'Receipt deleted successfully'
                }
            };
        }
        throw { response: { data: { error: 'Receipt not found' } } };
    },

    // Analytic Rules
    getAnalyticRules: async () => {
        await delay(300);
        return {
            data: {
                success: true,
                data: MOCK_ANALYTIC_RULES
            }
        };
    },

    createAnalyticRule: async (data) => {
        await delay(500);
        const newRule = {
            id: MOCK_ANALYTIC_RULES.length + 1,
            ...data
        };
        MOCK_ANALYTIC_RULES.push(newRule);
        return {
            data: {
                success: true,
                message: 'Rule created successfully',
                data: newRule
            }
        };
    },

    deleteAnalyticRule: async (id) => {
        await delay(500);
        const index = MOCK_ANALYTIC_RULES.findIndex(r => r.id === id);
        if (index !== -1) {
            MOCK_ANALYTIC_RULES.splice(index, 1);
            return {
                data: {
                    success: true,
                    message: 'Rule deleted successfully'
                }
            };
        }
        throw { response: { data: { error: 'Rule not found' } } };
    }
};

const MOCK_RECEIPTS = [
    {
        id: 1,
        receipt_number: 'Pay/25/0001',
        type: 'receive',
        partner_id: 1,
        amount: 16350,
        date: '2026-01-31',
        payment_mode: 'bank',
        note: 'Advance for order',
        status: 'draft'
    }
];

const MOCK_SALE_ORDERS = [
    {
        id: 1,
        so_number: 'SO00001',
        customer_id: 1,
        so_date: '2026-02-01',
        reference: 'EMAIL-REQ-99',
        status: 'draft',
        total_amount: 21600.00,
        items: [
            { product_id: 1, quantity: 6, unit_price: 3100.00, tax_rate: 18.00 },
            { product_id: 2, quantity: 3, unit_price: 1000.00, tax_rate: 18.00 }
        ]
    }
];

const MOCK_PAYMENTS = [];

const MOCK_REVISED_BUDGETS = [
    {
        id: 1,
        budget_id: 1,
        event_name: 'Summer Sale 2026',
        type: 'expense',
        revised_budgeted_amount: 55000,
        start_date: '2026-06-01',
        end_date: '2026-06-30',
        revision_reason: 'Increased marketing costs due to new channel expansion.'
    }
];

const MOCK_ANALYTIC_RULES = [
    {
        id: 1,
        partner_id: 2,
        product_category: 'Furniture',
        product_id: null,
        target_distribution: 'Profit Center: Furniture Sales (VIP)',
        priority_score: 2
    },
    {
        id: 2,
        partner_id: null,
        product_category: 'Electronics',
        product_id: null,
        target_distribution: 'Profit Center: General Electronics',
        priority_score: 1
    }
];
