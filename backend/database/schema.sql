-- ============================================================================
-- ShivBAS Database Schema (UPDATED)
-- 24-Hour Hackathon Edition with Analytics, Events, and Profit Tracking
-- Created: 2026-01-31
-- ============================================================================

DROP DATABASE IF EXISTS shivbas_db;
CREATE DATABASE shivbas_db;
USE shivbas_db;

-- ============================================================================
-- AUTHENTICATION & USERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  login_id VARCHAR(12) UNIQUE NOT NULL COMMENT '6-12 chars, alphanumeric + underscore',
  email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Valid email format, no duplicates',
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed, 60 char fixed length',
  name VARCHAR(255) NOT NULL COMMENT 'Full name of user',
  role ENUM('admin', 'portal') DEFAULT 'portal' COMMENT 'admin=full access, portal=limited self-service',
  signup_type ENUM('admin_created', 'self_signup') DEFAULT 'self_signup' COMMENT 'Tracks registration source',
  status ENUM('active', 'archived') DEFAULT 'active' COMMENT 'soft-delete flag',
  reset_token VARCHAR(255) DEFAULT NULL COMMENT 'Password reset token',
  reset_token_expiry TIMESTAMP NULL DEFAULT NULL COMMENT 'Reset token expiration time',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_login_id (login_id),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'FK to users table',
  token VARCHAR(255) UNIQUE NOT NULL COMMENT 'UUID or random string, base64 encoded',
  expires_at TIMESTAMP NOT NULL COMMENT 'Token validity: 30 minutes from creation',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- MASTER DATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL COMMENT 'Business/Person name',
  type ENUM('customer', 'vendor') NOT NULL COMMENT 'Determine invoice vs bill relationship',
  email VARCHAR(255) COMMENT 'Optional but recommended',
  phone VARCHAR(20) COMMENT 'Phone number',
  street VARCHAR(255) COMMENT 'Street address',
  city VARCHAR(100) COMMENT 'City',
  state VARCHAR(100) COMMENT 'State/Province',
  country VARCHAR(100) COMMENT 'Country',
  pincode VARCHAR(20) COMMENT 'Postal/ZIP code',
  tags VARCHAR(500) COMMENT 'Comma-separated tags (e.g., B2B, MSME, Retailer, Local)',
  image_url VARCHAR(500) COMMENT 'Contact image/logo URL',
  linked_user_id INT UNIQUE COMMENT 'FK to users table - only if type=customer and self-registered',
  status ENUM('active', 'archived') DEFAULT 'active' COMMENT 'soft-delete',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (linked_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_linked_user_id (linked_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL COMMENT 'Product name (e.g., Wood, Metal, Fabric)',
  category VARCHAR(100) NOT NULL COMMENT 'Product category - used in auto-assignment rules',
  unit_price DECIMAL(10, 2) NOT NULL COMMENT 'Price per unit',
  tax_rate DECIMAL(5, 2) DEFAULT 0 COMMENT 'Tax percentage (e.g., 18.00 for 18%)',
  status ENUM('active', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ANALYTICS (REPLACES COST_CENTERS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_name VARCHAR(255) NOT NULL COMMENT 'Event name (e.g., Expo 2026, Summer Sale)',
  partner_tag ENUM('supplier', 'customer') NOT NULL COMMENT 'Type of partner',
  partner_id INT NOT NULL COMMENT 'FK to users - partner name',
  product_id INT NOT NULL COMMENT 'FK to products table',
  product_category VARCHAR(100) NOT NULL COMMENT 'Product category from products table',
  no_of_units INT NOT NULL COMMENT 'Number of units sold/purchased',
  unit_price DECIMAL(10, 2) NOT NULL COMMENT 'Price per unit',
  profit DECIMAL(15, 2) COMMENT 'Profit calculation: (sale_price - purchase_price) * no_of_units',
  profit_margin_percentage DECIMAL(5, 2) COMMENT 'Profit margin %',
  status ENUM('active', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_event_name (event_name),
  INDEX idx_partner_tag (partner_tag),
  INDEX idx_partner_id (partner_id),
  INDEX idx_product_id (product_id),
  INDEX idx_product_category (product_category),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- BUDGETS (UPDATED)
-- ============================================================================

CREATE TABLE IF NOT EXISTS budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_name VARCHAR(255) NOT NULL COMMENT 'Event name',
  analytics_id INT NOT NULL COMMENT 'FK to analytics table',
  type ENUM('income', 'expense') NOT NULL COMMENT 'Budget type: income or expense',
  budgeted_amount DECIMAL(15, 2) NOT NULL COMMENT 'Budgeted amount',
  achieved_amount DECIMAL(15, 2) DEFAULT 0 COMMENT 'Achieved amount',
  percentage_achieved DECIMAL(5, 2) GENERATED ALWAYS AS 
    (CASE WHEN budgeted_amount > 0 THEN (achieved_amount / budgeted_amount) * 100 ELSE 0 END) STORED COMMENT 'Percentage achieved',
  amount_to_achieve DECIMAL(15, 2) GENERATED ALWAYS AS 
    (budgeted_amount - achieved_amount) STORED COMMENT 'Amount remaining to achieve',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (analytics_id) REFERENCES analytics(id),
  INDEX idx_event_name (event_name),
  INDEX idx_analytics_id (analytics_id),
  INDEX idx_type (type),
  INDEX idx_date_range (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- REVISED BUDGET (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS revised_budget (
  id INT PRIMARY KEY AUTO_INCREMENT,
  budget_id INT NOT NULL COMMENT 'FK to budgets table',
  event_name VARCHAR(255) NOT NULL COMMENT 'Event name',
  type ENUM('income', 'expense') NOT NULL COMMENT 'Budget type',
  revised_budgeted_amount DECIMAL(15, 2) NOT NULL COMMENT 'Revised budget amount',
  revised_achieved_amount DECIMAL(15, 2) DEFAULT 0 COMMENT 'Achieved after revision',
  revised_percentage_achieved DECIMAL(5, 2) GENERATED ALWAYS AS 
    (CASE WHEN revised_budgeted_amount > 0 THEN (revised_achieved_amount / revised_budgeted_amount) * 100 ELSE 0 END) STORED COMMENT 'Revised percentage achieved',
  revised_amount_to_achieve DECIMAL(15, 2) GENERATED ALWAYS AS 
    (revised_budgeted_amount - revised_achieved_amount) STORED COMMENT 'Revised amount remaining',
  budget_exceed ENUM('yes', 'no') DEFAULT 'no' COMMENT 'Has budget been exceeded?',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  revision_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  INDEX idx_budget_id (budget_id),
  INDEX idx_event_name (event_name),
  INDEX idx_type (type),
  INDEX idx_budget_exceed (budget_exceed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- BUDGET GRAPH (NEW)
-- ============================================================================

CREATE TABLE IF NOT EXISTS budget_graph (
  id INT PRIMARY KEY AUTO_INCREMENT,
  budget_id INT NOT NULL COMMENT 'FK to budgets table',
  event_name VARCHAR(255) NOT NULL COMMENT 'Event name',
  total_expense DECIMAL(15, 2) NOT NULL COMMENT 'Total actual expenses',
  predicted_expense DECIMAL(15, 2) NOT NULL COMMENT 'Predicted expenses by end of period',
  total_profit DECIMAL(15, 2) NOT NULL COMMENT 'Total actual profit',
  predicted_profit DECIMAL(15, 2) NOT NULL COMMENT 'Predicted profit by end of period',
  expense_variance DECIMAL(15, 2) GENERATED ALWAYS AS 
    (predicted_expense - total_expense) STORED COMMENT 'Expense variance',
  profit_variance DECIMAL(15, 2) GENERATED ALWAYS AS 
    (predicted_profit - total_profit) STORED COMMENT 'Profit variance',
  reporting_date DATE NOT NULL COMMENT 'Date of report',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  INDEX idx_budget_id (budget_id),
  INDEX idx_event_name (event_name),
  INDEX idx_reporting_date (reporting_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRANSACTIONS (SALES INVOICES)
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL COMMENT 'FK to contacts table (type=customer)',
  analytics_id INT COMMENT 'FK to analytics - which event/partner',
  created_by_user_id INT NOT NULL COMMENT 'FK to users - admin who created',
  total_amount DECIMAL(15, 2) NOT NULL COMMENT 'Sum of line items + tax',
  status ENUM('draft', 'posted', 'cancelled') DEFAULT 'draft' COMMENT 'draft=not affecting budget, posted=counted in actual',
  payment_status ENUM('not_paid', 'partial', 'paid') DEFAULT 'not_paid' COMMENT 'Updated after payment recording',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  posted_at TIMESTAMP NULL COMMENT 'When invoice was posted to ledger',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES contacts(id),
  FOREIGN KEY (analytics_id) REFERENCES analytics(id),
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_analytics_id (analytics_id),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_posted_at (posted_at),
  INDEX idx_created_by_user_id (created_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL COMMENT 'FK to customer_invoices table',
  product_id INT NOT NULL COMMENT 'FK to products table',
  quantity INT NOT NULL COMMENT 'Number of units',
  unit_price DECIMAL(10, 2) NOT NULL COMMENT 'Price per unit at time of invoice',
  tax_amount DECIMAL(10, 2) DEFAULT 0 COMMENT 'Calculated from product tax_rate * (quantity * unit_price)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES customer_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_invoice_id (invoice_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRANSACTIONS (PURCHASE BILLS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_bills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendor_id INT NOT NULL COMMENT 'FK to contacts table (type=vendor)',
  analytics_id INT COMMENT 'FK to analytics - which event/partner',
  created_by_user_id INT NOT NULL COMMENT 'FK to users - admin who created',
  total_amount DECIMAL(15, 2) NOT NULL COMMENT 'Sum of line items + tax',
  status ENUM('draft', 'posted', 'cancelled') DEFAULT 'draft' COMMENT 'draft=not affecting budget, posted=counted in actual',
  payment_status ENUM('not_paid', 'partial', 'paid') DEFAULT 'not_paid' COMMENT 'Updated after payment recording',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  posted_at TIMESTAMP NULL COMMENT 'When bill was posted to ledger',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES contacts(id),
  FOREIGN KEY (analytics_id) REFERENCES analytics(id),
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  INDEX idx_vendor_id (vendor_id),
  INDEX idx_analytics_id (analytics_id),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_posted_at (posted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bill_line_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  bill_id INT NOT NULL COMMENT 'FK to vendor_bills table',
  product_id INT NOT NULL COMMENT 'FK to products table',
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bill_id) REFERENCES vendor_bills(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_bill_id (bill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT COMMENT 'FK to customer_invoices (if payment against invoice)',
  bill_id INT COMMENT 'FK to vendor_bills (if payment against bill)',
  amount_paid DECIMAL(15, 2) NOT NULL COMMENT 'Amount of this payment',
  payment_mode ENUM('upi', 'cash', 'bank', 'gateway') NOT NULL COMMENT 'How payment was made',
  transaction_id VARCHAR(255) COMMENT 'Reference ID from payment gateway or bank',
  status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
  payment_date DATE NOT NULL COMMENT 'When payment was made',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES customer_invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (bill_id) REFERENCES vendor_bills(id) ON DELETE CASCADE,
  INDEX idx_invoice_id (invoice_id),
  INDEX idx_bill_id (bill_id),
  INDEX idx_payment_date (payment_date),
  INDEX idx_payment_mode (payment_mode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- AUTOMATION & MONITORING
-- ============================================================================

CREATE TABLE IF NOT EXISTS auto_analytical_models (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rule_name VARCHAR(255) NOT NULL COMMENT 'Rule name',
  condition_type ENUM('product_category', 'vendor', 'amount_range', 'keyword') NOT NULL COMMENT 'What field to match on',
  condition_value VARCHAR(255) NOT NULL COMMENT 'Value to match',
  analytics_id INT NOT NULL COMMENT 'FK to analytics - assign this analytics record when rule matches',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Enable/disable rule without deleting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (analytics_id) REFERENCES analytics(id),
  INDEX idx_is_active (is_active),
  INDEX idx_condition_type (condition_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  budget_id INT NOT NULL COMMENT 'FK to budgets table',
  alert_type ENUM('info', 'warning', 'critical') NOT NULL COMMENT 'info=50% used, warning=80% used, critical=100%+ used',
  message TEXT NOT NULL COMMENT 'Human-readable alert message',
  is_read BOOLEAN DEFAULT FALSE COMMENT 'User has acknowledged alert',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  INDEX idx_budget_id (budget_id),
  INDEX idx_is_read (is_read),
  INDEX idx_alert_type (alert_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'FK to users - who performed action',
  action VARCHAR(100) NOT NULL COMMENT 'Action performed (LOGIN, CREATE_INVOICE, POST_INVOICE, RECORD_PAYMENT, etc.)',
  record_type VARCHAR(100) COMMENT 'Type of record affected (invoice, bill, budget, etc.)',
  record_id INT COMMENT 'ID of affected record',
  details JSON COMMENT 'JSON object with specific details (old_value, new_value, etc.)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_record_type (record_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
