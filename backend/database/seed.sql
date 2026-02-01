-- ============================================================================
-- USERS (Authentication)
-- ============================================================================

INSERT INTO users (login_id, email, password, name, role, signup_type, status) VALUES
('admin_user', 'admin@shiv.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Admin User', 'admin', 'admin_created', 'active'),
('john_portal', 'john@customer.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'John Doe', 'portal', 'self_signup', 'active'),
('jane_portal', 'jane@customer.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'Jane Smith', 'portal', 'self_signup', 'active'),
('supplier_abc', 'supplier@abc.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'ABC Supplies', 'portal', 'self_signup', 'active');

-- Note: Replace bcrypt hashes with actual hashed passwords. For demo: password = "Test@123"

-- ============================================================================
-- CONTACTS (Customers & Vendors)
-- ============================================================================

INSERT INTO contacts (name, type, email, phone, linked_user_id, status) VALUES
('John Doe', 'customer', 'john@customer.com', '9876543210', 2, 'active'),
('Jane Smith', 'customer', 'jane@customer.com', '9876543211', 3, 'active'),
('ABC Furniture Supplies', 'vendor', 'vendor@abc.com', '9999999999', 4, 'active'),
('XYZ Materials Co.', 'vendor', 'xyz@materials.com', '8888888888', NULL, 'active');

-- ============================================================================
-- PRODUCTS
-- ============================================================================

INSERT INTO products (name, category, unit_price, tax_rate, status) VALUES
('Premium Wood', 'Wood', 500.00, 18.00, 'active'),
('Steel Frame', 'Metal', 300.00, 18.00, 'active'),
('Cotton Fabric', 'Fabric', 200.00, 5.00, 'active'),
('Leather Upholstery', 'Fabric', 800.00, 5.00, 'active'),
('Aluminum Legs', 'Metal', 150.00, 18.00, 'active');

-- ============================================================================
-- ANALYTICS (Events with Partners & Products)
-- ============================================================================

INSERT INTO analytics (event_name, partner_tag, partner_id, product_id, product_category, no_of_units, unit_price, profit, profit_margin_percentage) VALUES
('Expo 2026', 'supplier', 4, 1, 'Wood', 10, 500.00, 2000.00, 25.00),
('Expo 2026', 'customer', 2, 2, 'Metal', 5, 300.00, 1500.00, 30.00),
('Expo 2026', 'customer', 3, 3, 'Fabric', 20, 200.00, 1000.00, 20.00),
('Summer Sale', 'supplier', 4, 4, 'Fabric', 15, 800.00, 3000.00, 25.00),
('Summer Sale', 'customer', 2, 5, 'Metal', 8, 150.00, 800.00, 18.00),
('Q1 Campaign', 'supplier', 4, 1, 'Wood', 5, 500.00, 1000.00, 25.00);

-- ============================================================================
-- BUDGETS
-- ============================================================================

INSERT INTO budgets (event_name, analytics_id, type, budgeted_amount, achieved_amount, start_date, end_date, notes) VALUES
('Expo 2026', 1, 'income', 50000.00, 35000.00, '2026-01-01', '2026-03-31', 'Q1 Income Target'),
('Expo 2026', 1, 'expense', 20000.00, 15000.00, '2026-01-01', '2026-03-31', 'Q1 Expense Budget'),
('Summer Sale', 4, 'income', 30000.00, 25000.00, '2026-06-01', '2026-08-31', 'Summer Campaign Income'),
('Summer Sale', 4, 'expense', 15000.00, 12000.00, '2026-06-01', '2026-08-31', 'Summer Campaign Expense'),
('Q1 Campaign', 6, 'income', 15000.00, 12000.00, '2026-01-15', '2026-03-15', 'Q1 Campaign Income');

-- ============================================================================
-- REVISED BUDGET
-- ============================================================================

INSERT INTO revised_budget (budget_id, event_name, type, revised_budgeted_amount, revised_achieved_amount, budget_exceed, start_date, end_date, revision_reason) VALUES
(1, 'Expo 2026', 'income', 60000.00, 35000.00, 'no', '2026-01-01', '2026-03-31', 'Increased target due to market demand'),
(2, 'Expo 2026', 'expense', 25000.00, 15000.00, 'no', '2026-01-01', '2026-03-31', 'Budget increased for additional marketing');

-- ============================================================================
-- BUDGET GRAPH (Expense & Profit Predictions)
-- ============================================================================

INSERT INTO budget_graph (budget_id, event_name, total_expense, predicted_expense, total_profit, predicted_profit, reporting_date) VALUES
(1, 'Expo 2026', 15000.00, 18000.00, 35000.00, 42000.00, '2026-02-15'),
(2, 'Expo 2026', 15000.00, 20000.00, 25000.00, 30000.00, '2026-02-15'),
(3, 'Summer Sale', 12000.00, 14000.00, 25000.00, 28000.00, '2026-07-15'),
(4, 'Summer Sale', 12000.00, 15000.00, 20000.00, 25000.00, '2026-07-15');

-- ============================================================================
-- CUSTOMER INVOICES
-- ============================================================================

INSERT INTO customer_invoices (invoice_no, invoice_reference, customer_id, analytics_id, created_by_user_id, invoice_date, due_date, total_amount, status, payment_status, posted_at) VALUES
('INV-20260115-001', 'PO-CUST-001', 1, 2, 1, '2026-01-15', '2026-02-15', 2000.00, 'posted', 'not_paid', '2026-01-15 10:30:00'),
('INV-20260120-002', 'PO-CUST-002', 2, 3, 1, '2026-01-20', '2026-02-20', 5000.00, 'posted', 'partial', '2026-01-20 14:15:00'),
('INV-20260125-003', NULL, 1, 2, 1, '2026-01-25', '2026-02-25', 1500.00, 'draft', 'not_paid', NULL);

-- ============================================================================
-- INVOICE LINE ITEMS
-- ============================================================================

INSERT INTO invoice_line_items (invoice_id, product_id, quantity, unit_price, tax_amount) VALUES
(1, 2, 2, 300.00, 108.00),  -- Steel Frame: 2 units * 300 = 600, tax = 600 * 0.18 = 108
(2, 3, 5, 200.00, 180.00),  -- Cotton Fabric: 5 units * 200 = 1000, tax = 1000 * 0.05 = 50
(3, 1, 1, 500.00, 90.00);   -- Premium Wood: 1 unit * 500 = 500, tax = 500 * 0.18 = 90

-- ============================================================================
-- PURCHASE ORDERS
-- ============================================================================

INSERT INTO purchase_orders (po_number, vendor_id, order_date, expected_date, total_amount, status, notes) VALUES
('PO-2026-001', 3, '2026-01-20', '2026-02-01', 15000.00, 'sent', 'Quarterly wood supplies order'),
('PO-2026-002', 4, '2026-01-25', '2026-02-05', 5000.00, 'draft', 'Metal components for upcoming project'),
('PO-2026-003', 3, '2026-01-28', '2026-02-10', 8000.00, 'sent', 'Fabric materials order'),
('PO-2026-004', 4, '2026-01-30', '2026-02-15', 12000.00, 'received', 'Aluminum supplies - delivered early');

-- ============================================================================
-- VENDOR BILLS
-- ============================================================================

INSERT INTO vendor_bills (bill_no, bill_reference, vendor_id, analytics_id, created_by_user_id, bill_date, due_date, total_amount, status, payment_status, posted_at) VALUES
('BILL-20260110-001', 'ABC-INV-2026-001', 3, 1, 1, '2026-01-10', '2026-02-10', 3000.00, 'posted', 'not_paid', '2026-01-10 09:00:00'),
('BILL-20260118-002', 'XYZ-INV-2026-012', 4, 5, 1, '2026-01-18', '2026-02-18', 1200.00, 'posted', 'paid', '2026-01-18 11:30:00'),
('BILL-20260122-003', 'ABC-INV-2026-005', 3, 1, 1, '2026-01-22', '2026-02-22', 2500.00, 'posted', 'not_paid', '2026-01-22 15:45:00');

-- ============================================================================
-- BILL LINE ITEMS
-- ============================================================================

INSERT INTO bill_line_items (bill_id, product_id, quantity, unit_price, tax_amount) VALUES
(1, 1, 2, 500.00, 180.00),  -- Premium Wood: 2 units * 500 = 1000, tax = 180
(2, 5, 4, 150.00, 108.00),  -- Aluminum Legs: 4 units * 150 = 600, tax = 108
(3, 1, 3, 500.00, 270.00);  -- Premium Wood: 3 units * 500 = 1500, tax = 270

-- ============================================================================
-- PAYMENTS
-- ============================================================================

INSERT INTO payments (invoice_id, bill_id, amount_paid, payment_mode, transaction_id, status, payment_date) VALUES
(1, NULL, 1000.00, 'bank', 'TXN123456', 'completed', '2026-01-16'),
(2, NULL, 2500.00, 'upi', 'UPI789012', 'completed', '2026-01-22'),
(NULL, 2, 1200.00, 'bank', 'BILL456789', 'completed', '2026-01-19'),
(2, NULL, 2500.00, 'gateway', 'RAZORPAY_TXN_456', 'completed', '2026-01-23');

-- ============================================================================
-- PURCHASE BILLS (Simplified Structure)
-- ============================================================================

INSERT INTO purchase_bills (bill_number, vendor_id, bill_date, due_date, total_amount, status, payment_status, notes) VALUES
('PBILL-00001', 3, '2026-01-15', '2026-02-15', 15000.00, 'posted', 'not_paid', 'Monthly supplies bill'),
('PBILL-00002', 4, '2026-01-26', '2026-02-26', 8500.00, 'posted', 'paid', 'Equipment maintenance'),
('PBILL-00003', 3, '2026-01-28', '2026-02-13', 3200.00, 'draft', 'not_paid', 'Pending approval'),
('PBILL-00004', 4, '2026-01-30', '2026-03-01', 6700.00, 'posted', 'partial_paid', 'Partially paid - balance remaining');

-- ============================================================================
-- AUTO ANALYTICAL MODELS (Rules)
-- ============================================================================

INSERT INTO auto_analytical_models (rule_name, condition_type, condition_value, analytics_id, is_active) VALUES
('Wood to Expo 2026', 'product_category', 'Wood', 1, TRUE),
('Metal to Expo 2026', 'product_category', 'Metal', 2, TRUE),
('Fabric to Expo 2026', 'product_category', 'Fabric', 3, TRUE),
('ABC Supplier to Expo', 'vendor', 'ABC Furniture Supplies', 1, TRUE);

-- ============================================================================
-- ALERTS
-- ============================================================================

INSERT INTO alerts (budget_id, alert_type, message, is_read) VALUES
(1, 'info', 'Expo 2026 Income budget 50% utilized ($25,000 of $50,000)', FALSE),
(2, 'warning', 'Expo 2026 Expense budget 75% utilized ($15,000 of $20,000)', FALSE),
(3, 'info', 'Summer Sale Income budget 83% utilized ($25,000 of $30,000)', TRUE);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

INSERT INTO audit_logs (user_id, action, record_type, record_id, details) VALUES
(1, 'LOGIN', NULL, NULL, JSON_OBJECT('ip', '192.168.1.1', 'browser', 'Chrome')),
(1, 'CREATE_INVOICE', 'customer_invoices', 1, JSON_OBJECT('customer_id', 1, 'amount', 2000)),
(1, 'POST_INVOICE', 'customer_invoices', 1, JSON_OBJECT('status', 'draft→posted')),
(1, 'RECORD_PAYMENT', 'payments', 1, JSON_OBJECT('invoice_id', 1, 'amount', 1000));

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
