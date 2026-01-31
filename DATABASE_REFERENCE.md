# ShivBAS Database Quick Reference

## 📊 Database Setup (One-Time)

```bash
# 1. Create database
mysql -u root -p
CREATE DATABASE shivbas_db;

# 2. Import schema
USE shivbas_db;
SOURCE backend/database/schema.sql;

# 3. Import seed data
SOURCE backend/database/seed.sql;

# 4. Verify
SHOW TABLES;  # Should show 15 tables
SELECT COUNT(*) FROM users;  # Should show 4 users
```

---

## 🔑 Key Tables for Development

### Authentication
```sql
-- Login
SELECT * FROM users WHERE login_id = 'admin_user' OR email = 'admin@shiv.com';

-- User roles
SELECT id, name, role, status FROM users;
```

### Budget Tracking (CORE)
```sql
-- All budgets with calculated metrics
SELECT id, event_name, type, budgeted_amount, achieved_amount, 
       percentage_achieved, amount_to_achieve 
FROM budgets;

-- Check if budget exceeded
SELECT b.*, rb.budget_exceed 
FROM budgets b 
LEFT JOIN revised_budget rb ON b.id = rb.budget_id;
```

### Events (Analytics)
```sql
-- All events with partner info
SELECT a.*, u.name as partner_name, p.name as product_name 
FROM analytics a 
JOIN users u ON a.partner_id = u.id 
JOIN products p ON a.product_id = p.id;

-- Profit by event
SELECT event_name, partner_tag, SUM(profit) as total_profit 
FROM analytics 
GROUP BY event_name, partner_tag;
```

### Transactions
```sql
-- Posted invoices (counted toward budget)
SELECT * FROM customer_invoices WHERE status = 'posted';

-- Payment status tracking
SELECT i.id, i.total_amount, SUM(p.amount_paid) as paid, 
       i.payment_status 
FROM customer_invoices i 
LEFT JOIN payments p ON i.id = p.invoice_id 
GROUP BY i.id;
```

### Alerts
```sql
-- Active alerts
SELECT * FROM alerts WHERE is_read = FALSE;

-- Alert types
SELECT alert_type, COUNT(*) FROM alerts GROUP BY alert_type;
```

---

## 🚀 Important Queries for Backend

### Get Budget Metrics
```sql
SELECT 
  b.id,
  b.event_name,
  b.type,
  b.budgeted_amount,
  b.achieved_amount,
  b.percentage_achieved,
  b.amount_to_achieve,
  CASE 
    WHEN b.percentage_achieved < 50 THEN 'Safe'
    WHEN b.percentage_achieved < 80 THEN 'Warning'
    ELSE 'Critical'
  END as status
FROM budgets b;
```

### Calculate Invoice Payment Status
```sql
UPDATE customer_invoices SET payment_status = 
  CASE 
    WHEN (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE invoice_id = customer_invoices.id) = 0 THEN 'not_paid'
    WHEN (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE invoice_id = customer_invoices.id) = customer_invoices.total_amount THEN 'paid'
    ELSE 'partial'
  END
WHERE status = 'posted';
```

### Get Customer's Invoices
```sql
SELECT i.*, c.name as customer_name 
FROM customer_invoices i 
JOIN contacts c ON i.customer_id = c.id 
WHERE c.linked_user_id = ?;  -- Current portal user ID
```

### Auto-Assign Analytics
```sql
SELECT analytics_id 
FROM auto_analytical_models 
WHERE is_active = TRUE 
  AND condition_type = 'product_category'
  AND condition_value = ?;  -- Product category
```

---

## 💾 Sample Data Credentials

| Type | Login | Password | Role |
|------|-------|----------|------|
| Admin | admin_user | Test@123 | admin |
| Portal | john_portal | Test@123 | portal |
| Portal | jane_portal | Test@123 | portal |
| Portal | supplier_abc | Test@123 | portal |

---

## 📋 Table Relationships

```
users
├── password_tokens (FK: user_id)
├── contacts (FK: linked_user_id)
├── audit_logs (FK: user_id)
├── analytics (FK: partner_id)
├── customer_invoices (FK: created_by_user_id)
└── vendor_bills (FK: created_by_user_id)

analytics
├── budgets (FK: analytics_id)
├── customer_invoices (FK: analytics_id)
└── vendor_bills (FK: analytics_id)

budgets
├── revised_budget (FK: budget_id)
├── budget_graph (FK: budget_id)
└── alerts (FK: budget_id)

customer_invoices
├── invoice_line_items (FK: invoice_id)
└── payments (FK: invoice_id)

vendor_bills
├── bill_line_items (FK: bill_id)
└── payments (FK: bill_id)
```

---

## ⚙️ Backend .env Variables

```
# Must Set
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=shivbas_db
JWT_SECRET=your_secret_key

# Optional (Defaults Provided)
NODE_ENV=development
SERVER_PORT=5000
CORS_ORIGIN=http://localhost:3000
```

---

## 🔍 Debugging Tips

### Check Database Connection
```javascript
// In backend/config/database.js - runs automatically
testConnection();
```

### Verify Schema
```sql
-- Check tables
SHOW TABLES;

-- Check columns
DESC users;
DESC budgets;

-- Check indexes
SHOW INDEX FROM users;

-- Check constraints
SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'budgets';
```

### Test Seed Data
```sql
-- Count records
SELECT COUNT(*) FROM budgets;

-- Check analytics events
SELECT DISTINCT event_name FROM analytics;

-- Verify calculations
SELECT *, percentage_achieved, amount_to_achieve FROM budgets;
```

---

## 📈 Common Operations

### Create Invoice Linked to Event
```sql
INSERT INTO customer_invoices 
(customer_id, analytics_id, created_by_user_id, total_amount, status) 
VALUES (?, ?, 1, 2000.00, 'draft');
```

### Add Line Item
```sql
INSERT INTO invoice_line_items 
(invoice_id, product_id, quantity, unit_price, tax_amount) 
VALUES (?, ?, 2, 500.00, 180.00);
```

### Post Invoice (Update Budget)
```sql
UPDATE customer_invoices SET status = 'posted', posted_at = NOW() 
WHERE id = ?;

-- This automatically updates budget.achieved_amount via trigger or backend logic
```

### Record Payment
```sql
INSERT INTO payments 
(invoice_id, amount_paid, payment_mode, transaction_id, payment_date) 
VALUES (?, 1000.00, 'bank', 'TXN123', NOW());
```

### Create Budget Alert
```sql
INSERT INTO alerts 
(budget_id, alert_type, message, is_read) 
VALUES (?, 'warning', 'Budget 75% utilized', FALSE);
```

---

## 🎯 Frontend Query Examples

### Get Admin Dashboard Data
```javascript
// Fetch budgets with metrics
GET /api/budgets

// Response
[
  {
    id: 1,
    event_name: "Expo 2026",
    type: "income",
    budgeted_amount: 50000,
    achieved_amount: 35000,
    percentage_achieved: 70,
    amount_to_achieve: 15000
  }
]
```

### Get Customer Invoices
```javascript
// Fetch own invoices (portal user)
GET /api/customer/invoices

// Response
[
  {
    id: 1,
    customer_id: 1,
    total_amount: 2000,
    status: "posted",
    payment_status: "partial",
    created_at: "2026-01-15",
    line_items: [...]
  }
]
```

---

## ⏱️ Performance Tips

1. **Use Indexes** — Always query by indexed columns (FK, status, dates)
2. **Limit Results** — Add LIMIT to large queries
3. **GENERATED Columns** — No need to recalculate percentage_achieved
4. **Connection Pool** — Already configured with 10 connections
5. **Cache Budgets** — Budget data changes infrequently

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't connect to MySQL | Check DB_HOST, DB_USER, DB_PASSWORD in .env |
| Tables not found | Run schema.sql: `SOURCE backend/database/schema.sql;` |
| Seed data not loaded | Run seed.sql: `SOURCE backend/database/seed.sql;` |
| Foreign key error | Check related record exists in parent table |
| Null in percentage_achieved | Budget table might have null values — check |

---

**Last Updated**: January 31, 2026  
**For detailed docs**: See `readme.md` and `SPRINT_0_SUMMARY.md`
