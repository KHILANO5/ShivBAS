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
    }
};
