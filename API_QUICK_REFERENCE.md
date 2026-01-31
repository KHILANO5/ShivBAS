# API Quick Reference
## Fast lookup for endpoints, statuses, and testing

---

## 🗂️ Endpoint Summary

### Authentication (Public)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/register` | Create new user |
| POST | `/auth/login` | Get JWT token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/refresh-token` | Get new JWT token |
| GET | `/auth/me` | Get current user (auth required) |
| POST | `/auth/logout` | Logout (auth required) |

### Master Data (Auth Required)
| Method | Path | Purpose | Admin Only |
|--------|------|---------|-----------|
| POST | `/analytics` | Create event | ✅ |
| GET | `/analytics` | List events | ❌ |
| GET | `/analytics/:id` | Get event | ❌ |
| POST | `/products` | Create product | ✅ |
| GET | `/products` | List products | ❌ |
| POST | `/contacts` | Create contact | ✅ |
| GET | `/contacts` | List contacts | ❌ |

### Budgets (Auth Required)
| Method | Path | Purpose | Admin Only |
|--------|------|---------|-----------|
| POST | `/budgets` | Create budget | ✅ |
| GET | `/budgets` | List budgets | ❌ |
| GET | `/budgets/:id` | Get budget details | ❌ |
| PUT | `/budgets/:id` | Update budget | ✅ |
| POST | `/budgets/:id/revise` | Revise budget | ✅ |
| GET | `/budgets/:id/alerts` | Get alerts | ❌ |

### Transactions (Auth Required)
| Method | Path | Purpose | Admin Only |
|--------|------|---------|-----------|
| POST | `/invoices` | Create invoice | ✅ |
| GET | `/invoices` | List invoices | ❌ |
| GET | `/invoices/:id` | Get invoice | ❌ |
| POST | `/invoices/:id/post` | Post invoice | ✅ |
| POST | `/invoices/:id/cancel` | Cancel invoice | ✅ |
| POST | `/bills` | Create bill | ✅ |
| GET | `/bills` | List bills | ❌ |
| POST | `/bills/:id/post` | Post bill | ✅ |

### Payments (Auth Required)
| Method | Path | Purpose | Admin Only |
|--------|------|---------|-----------|
| POST | `/payments` | Record payment | ✅ |
| GET | `/payments` | List payments | ❌ |
| GET | `/payments/:id` | Get payment | ❌ |

### Dashboard (Auth Required)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/dashboard/summary` | Overview metrics |
| GET | `/dashboard/budgets-overview` | Budget status |
| GET | `/dashboard/analytics/:id` | Event details |
| GET | `/dashboard/payment-report` | Payment analytics |

---

## 🧪 Test Credentials

```
Admin User:
- login_id: admin_user
- password: Test@123
- email: admin@shivbas.com

Portal User 1:
- login_id: john_portal
- password: Test@123
- email: john@shivbas.com

Portal User 2:
- login_id: jane_portal
- password: Test@123
- email: jane@shivbas.com

Supplier:
- login_id: supplier_abc
- password: Test@123
- email: supplier@abc.com
```

---

## 📊 Sample Request/Response

### Login (Success)
**Request**:
```bash
POST /auth/login
Content-Type: application/json

{
  "login_id": "admin_user",
  "password": "Test@123"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "login_id": "admin_user",
      "email": "admin@shivbas.com",
      "name": "Admin User",
      "role": "admin"
    },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Create Invoice
**Request**:
```bash
POST /invoices
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "customer_id": 2,
  "analytics_id": 1,
  "line_items": [
    {
      "product_id": 1,
      "quantity": 10,
      "unit_price": 500,
      "tax_amount": 900
    }
  ]
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Invoice created as draft",
  "data": {
    "id": 1,
    "customer_id": 2,
    "analytics_id": 1,
    "total_amount": 6000,
    "status": "draft",
    "payment_status": "not_paid"
  }
}
```

### Error Response (Validation)
**Response** (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 🔐 Authentication Flow

1. **User clicks "Login"** → Frontend sends login_id + password
2. **Backend validates** → Checks database, bcrypt verification
3. **Backend returns** → JWT token + refresh token
4. **Frontend stores** → JWT in localStorage/cookie
5. **Frontend sends** → JWT in Authorization header for all requests
6. **Backend verifies** → JWT middleware validates token
7. **On expiry** → Frontend calls `/auth/refresh-token` to get new token
8. **If 401 error** → Frontend redirects to login

### JWT Token Structure
```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: {
  "id": 1,
  "login_id": "admin_user",
  "email": "admin@shivbas.com",
  "role": "admin",
  "iat": 1675088400,
  "exp": 1675092000
}
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

---

## 🔄 Invoice Workflow

```
1. Create Invoice (draft)
   └─ POST /invoices
   └─ Status: draft, Payment: not_paid

2. Add Line Items
   └─ Already done in create

3. Post Invoice
   └─ POST /invoices/:id/post
   └─ Status: draft → posted
   └─ Updates: budget.achieved_amount += total_amount
   └─ Triggers: Budget alerts if thresholds crossed

4. Record Payment (partial)
   └─ POST /payments
   └─ Payment Status: not_paid → partial
   └─ Amount paid: 3000 / 6000

5. Record Payment (full)
   └─ POST /payments
   └─ Payment Status: partial → paid
   └─ Amount paid: 6000 / 6000

6. Cancel Invoice (if needed)
   └─ POST /invoices/:id/cancel
   └─ Status: posted → cancelled
   └─ Updates: budget.achieved_amount -= total_amount (reversal)
```

---

## 📈 Budget Metrics Calculation

**Calculated automatically (MySQL GENERATED columns)**:

```
budget.percentage_achieved = (achieved_amount / budgeted_amount) * 100

budget.amount_to_achieve = budgeted_amount - achieved_amount
```

**Example**:
- Budgeted: ₹100,000
- Achieved: ₹75,000
- Percentage: 75%
- Remaining: ₹25,000

**Alert Triggers**:
- 50%: Info (optional)
- 80%: Warning (yellow)
- 100%+: Critical (red)

---

## 🎯 Status Codes Quick Reference

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error, missing fields |
| 401 | Unauthorized | JWT missing or expired |
| 403 | Forbidden | User lacks permission (not admin) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (email, login_id) |
| 422 | Unprocessable | Logic error (invoice already posted) |
| 500 | Server Error | Backend crash or database issue |

---

## 🧑‍💻 Developer Workflows

### Backend Developer Checklist
- [ ] `npm install` dependencies
- [ ] Create `.env` from `.env.example`
- [ ] Set `DB_HOST=localhost`, `DB_USER=root`, etc.
- [ ] Import `backend/database/schema.sql` into MySQL
- [ ] Import `backend/database/seed.sql` for test data
- [ ] Run `npm run dev` to start server
- [ ] Test login: `curl POST localhost:5000/api/auth/login`
- [ ] Implement each controller in order: auth → analytics → budgets → invoices

### Frontend Developer Checklist
- [ ] `npm install` dependencies
- [ ] Create `.env` with `REACT_APP_API_BASE_URL=http://localhost:5000/api`
- [ ] Setup axios instance with JWT interceptors
- [ ] Create Login page (POST /auth/login)
- [ ] Create ProtectedRoute wrapper (checks JWT)
- [ ] Create Dashboard page (GET /dashboard/summary)
- [ ] Build master data pages (analytics, products, contacts)
- [ ] Build invoice creation form

### Integration Checklist
- [ ] Both teams have running servers (backend: 5000, frontend: 3000)
- [ ] Frontend can login successfully
- [ ] JWT token is stored and sent with requests
- [ ] Frontend shows dashboard with real data
- [ ] Invoice creation → Posted → Payment recorded workflow
- [ ] Budget percentages auto-update
- [ ] Alerts trigger at 80% and 100%

---

## 🐛 Common Issues & Solutions

### "Invalid authorization header"
**Cause**: JWT not sent in Authorization header  
**Fix**: Frontend must send `Authorization: Bearer {token}` with every request

### "Validation failed" with password
**Cause**: Password doesn't meet complexity rules  
**Solution**: Password must be 8+ chars with uppercase, lowercase, digit, special char  
**Example**: `SecurePass@123` ✅

### "Duplicate entry" for email
**Cause**: Email already exists in database  
**Solution**: Use unique email or delete user: `DELETE FROM users WHERE email='...'`

### "Invoice not found"
**Cause**: Invoice ID doesn't exist  
**Check**: 
- Is invoice ID correct? 
- Was invoice created successfully?
- Query: `SELECT * FROM customer_invoices WHERE id = ?`

### Budget not updating after posting invoice
**Cause**: analytics_id doesn't match  
**Check**:
- Is budget analytics_id set correctly?
- Does analytics event exist?
- Query: `SELECT * FROM budgets WHERE id = ?`

### "403 - Only admins can perform this action"
**Cause**: Portal user trying admin action  
**Solution**: Create admin user or use admin account for creation

---

## 🚀 Performance Tips

### Frontend
- Use pagination (limit=10) for large lists
- Cache dashboard summary (refresh every 5 min)
- Debounce form validation
- Use React.memo for expensive components

### Backend
- Indexes on: user.login_id, budget.analytics_id, invoice.customer_id, payment.invoice_id
- Batch payment records together
- Cache product list (changes rarely)
- Use database transactions for multi-step operations

### Database
- Regular backups: `mysqldump -u root -p shivbas_db > backup.sql`
- Monitor slow queries: `SET GLOBAL log_queries_not_using_indexes = ON;`
- Optimize tables: `ANALYZE TABLE table_name;`

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| [API_CONTRACTS.md](API_CONTRACTS.md) | Detailed endpoint specifications |
| [FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md) | React implementation patterns |
| [BACKEND_IMPLEMENTATION_GUIDE.md](BACKEND_IMPLEMENTATION_GUIDE.md) | Express.js setup & code examples |
| [DATABASE_REFERENCE.md](DATABASE_REFERENCE.md) | SQL queries & schema details |
| [backend/database/schema.sql](backend/database/schema.sql) | 15 tables schema |
| [backend/database/seed.sql](backend/database/seed.sql) | Test data (52 records) |
| [backend/config/database.js](backend/config/database.js) | MySQL connection pool |
| [backend/.env.example](backend/.env.example) | Configuration template |

---

## 🎓 Learning Path (For New Developers)

**Day 1 (Setup)**:
1. Read [API_CONTRACTS.md](API_CONTRACTS.md) - understand endpoints
2. Setup MySQL database with schema + seed data
3. Backend team: Start `backend/app.js` + auth routes
4. Frontend team: Setup React + login form

**Day 2 (Authentication)**:
1. Backend: Complete auth controller (register, login, JWT)
2. Frontend: Complete login page + token storage
3. Test: Login → get token → access protected endpoints

**Day 3 (Master Data)**:
1. Backend: Implement analytics, products, contacts CRUD
2. Frontend: Create list pages + creation forms
3. Test: Create events, see them in list

**Day 4 (Budgets & Transactions)**:
1. Backend: Implement budgets + invoices endpoints
2. Frontend: Create invoice form with line items
3. Test: Create invoice → Post → Update budget

**Day 5 (Payments & Reports)**:
1. Backend: Implement payments + dashboard
2. Frontend: Create payment form + dashboard
3. Test: Full workflow end-to-end

---

## 📞 Support & Debugging

**View logs**:
```bash
# Backend
tail -f nohup.out

# Frontend
Open browser console (F12)
```

**Test endpoints directly**:
```bash
# Install REST client extension in VS Code or use Postman
# Then import API_CONTRACTS.md collection
```

**Debug database issues**:
```bash
# Login to MySQL
mysql -u root -p shivbas_db

# Check tables
SHOW TABLES;

# Check specific table
DESCRIBE users;
SELECT * FROM users;

# Check if constraints violated
SHOW ENGINE INNODB STATUS;
```

---

**Last Updated**: 2026-01-31  
**Status**: ✅ Ready for Development  
**Questions?** Refer to API_CONTRACTS.md or implementation guides
