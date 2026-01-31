# ShivBAS API Contracts
## 24-Hour Hackathon Edition

**Purpose**: Define all API endpoints, request/response schemas, and error handling for parallel frontend/backend development

**Base URL**: `http://localhost:5000/api`  
**Content-Type**: `application/json`  
**Auth Header**: `Authorization: Bearer {jwt_token}`

---

## 📋 Table of Contents
1. [Authentication API](#authentication-api)
2. [Master Data API](#master-data-api)
3. [Budgets API](#budgets-api)
4. [Transactions API](#transactions-api)
5. [Payments API](#payments-api)
6. [Dashboard API](#dashboard-api)
7. [Error Handling](#error-handling)

---

## Authentication API

### 1. User Registration
**POST** `/auth/register`

**Request Body**:
```json
{
  "login_id": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "name": "John Doe"
}
```

**Validation**:
- `login_id`: 6-12 chars, alphanumeric + underscore, unique
- `email`: Valid email format, unique
- `password`: Min 8 chars, uppercase, lowercase, digit, special char
- `name`: Required, 1-255 chars

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "login_id": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "portal",
    "created_at": "2026-01-31T10:30:00Z"
  }
}
```

**Error Responses**:
- 400: `{ "success": false, "error": "login_id already exists" }`
- 400: `{ "success": false, "error": "Password must contain uppercase, lowercase, digit, and special char" }`
- 409: `{ "success": false, "error": "Email already registered" }`

---

### 2. User Login
**POST** `/auth/login`

**Request Body**:
```json
{
  "login_id": "john_doe",
  "password": "SecurePass@123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "login_id": "john_doe",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- 401: `{ "success": false, "error": "Invalid login_id or password" }`
- 404: `{ "success": false, "error": "User not found" }`

---

### 3. Forgot Password
**POST** `/auth/forgot-password`

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

**Error Responses**:
- 404: `{ "success": false, "error": "User with this email not found" }`

---

### 4. Reset Password
**POST** `/auth/reset-password`

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePass@456"
}
```

**Validation**:
- Token must be valid and not expired (30 min validity)
- Password same validation as registration

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Responses**:
- 400: `{ "success": false, "error": "Invalid or expired token" }`
- 400: `{ "success": false, "error": "Password does not meet complexity requirements" }`

---

### 5. Refresh Token
**POST** `/auth/refresh-token`

**Request Body**:
```json
{
  "refreshToken": "refresh_token_value"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

**Error Responses**:
- 401: `{ "success": false, "error": "Invalid or expired refresh token" }`

---

### 6. Logout
**POST** `/auth/logout`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 7. Get Current User
**GET** `/auth/me`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "login_id": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "admin",
    "created_at": "2026-01-31T10:30:00Z"
  }
}
```

---

## Master Data API

### 1. Create Analytics Event
**POST** `/analytics`

**Headers**: `Authorization: Bearer {jwt_token}` (admin only)

**Request Body**:
```json
{
  "event_name": "Expo 2026",
  "partner_tag": "supplier",
  "partner_id": 1,
  "product_id": 5,
  "no_of_units": 100,
  "unit_price": 500,
  "profit": 25000,
  "profit_margin_percentage": 33.33
}
```

**Validation**:
- `event_name`: Required, unique per partner combination
- `partner_id`: Must exist in contacts table
- `product_id`: Must exist in products table
- `unit_price`, `profit`: Must be positive
- `no_of_units`: Integer > 0

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Analytics event created",
  "data": {
    "id": 1,
    "event_name": "Expo 2026",
    "partner_tag": "supplier",
    "partner_id": 1,
    "product_id": 5,
    "no_of_units": 100,
    "unit_price": 500,
    "profit": 25000,
    "profit_margin_percentage": 33.33,
    "created_at": "2026-01-31T10:30:00Z"
  }
}
```

**Error Responses**:
- 400: `{ "success": false, "error": "event_name already exists for this partner" }`
- 404: `{ "success": false, "error": "Partner not found" }`
- 403: `{ "success": false, "error": "Only admins can create events" }`

---

### 2. Get All Analytics Events
**GET** `/analytics?skip=0&limit=10&event_name=Expo`

**Headers**: `Authorization: Bearer {jwt_token}`

**Query Parameters**:
- `skip` (optional): Default 0
- `limit` (optional): Default 10, max 100
- `event_name` (optional): Filter by event name

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 6,
    "skip": 0,
    "limit": 10,
    "events": [
      {
        "id": 1,
        "event_name": "Expo 2026",
        "partner_tag": "supplier",
        "partner_id": 1,
        "product_id": 5,
        "no_of_units": 100,
        "unit_price": 500,
        "profit": 25000,
        "profit_margin_percentage": 33.33,
        "created_at": "2026-01-31T10:30:00Z"
      }
    ]
  }
}
```

---

### 3. Get Analytics Event by ID
**GET** `/analytics/:id`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "event_name": "Expo 2026",
    "partner_tag": "supplier",
    "partner_id": 1,
    "product_id": 5,
    "no_of_units": 100,
    "unit_price": 500,
    "profit": 25000,
    "profit_margin_percentage": 33.33,
    "created_at": "2026-01-31T10:30:00Z"
  }
}
```

**Error Responses**:
- 404: `{ "success": false, "error": "Analytics event not found" }`

---

### 4. Create Product
**POST** `/products`

**Headers**: `Authorization: Bearer {jwt_token}` (admin only)

**Request Body**:
```json
{
  "name": "Premium Wood Sheet",
  "category": "Wood",
  "unit_price": 500,
  "tax_rate": 18,
  "status": "active"
}
```

**Validation**:
- `name`: Required, unique
- `category`: One of [Wood, Metal, Fabric, Electronics, Other]
- `unit_price`: Positive number
- `tax_rate`: 0-100
- `status`: active or archived

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Product created",
  "data": {
    "id": 1,
    "name": "Premium Wood Sheet",
    "category": "Wood",
    "unit_price": 500,
    "tax_rate": 18,
    "status": "active",
    "created_at": "2026-01-31T10:30:00Z"
  }
}
```

---

### 5. Get All Products
**GET** `/products?skip=0&limit=10&category=Wood&status=active`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 5,
    "products": [
      {
        "id": 1,
        "name": "Premium Wood Sheet",
        "category": "Wood",
        "unit_price": 500,
        "tax_rate": 18,
        "status": "active",
        "created_at": "2026-01-31T10:30:00Z"
      }
    ]
  }
}
```

---

### 6. Create Contact (Customer/Vendor)
**POST** `/contacts`

**Headers**: `Authorization: Bearer {jwt_token}` (admin only)

**Request Body**:
```json
{
  "name": "Supplier ABC Ltd",
  "type": "vendor",
  "email": "supplier@abc.com",
  "phone": "+91-9876543210"
}
```

**Validation**:
- `name`: Required
- `type`: customer or vendor
- `email`: Valid format
- `phone`: Valid phone format

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Contact created",
  "data": {
    "id": 1,
    "name": "Supplier ABC Ltd",
    "type": "vendor",
    "email": "supplier@abc.com",
    "phone": "+91-9876543210",
    "linked_user_id": null,
    "created_at": "2026-01-31T10:30:00Z"
  }
}
```

---

### 7. Get All Contacts
**GET** `/contacts?skip=0&limit=10&type=vendor`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 4,
    "contacts": [
      {
        "id": 1,
        "name": "Supplier ABC Ltd",
        "type": "vendor",
        "email": "supplier@abc.com",
        "phone": "+91-9876543210",
        "linked_user_id": null,
        "created_at": "2026-01-31T10:30:00Z"
      }
    ]
  }
}
```

---

## Budgets API

### 1. Create Budget
**POST** `/budgets`

**Headers**: `Authorization: Bearer {jwt_token}` (admin only)

**Request Body**:
```json
{
  "event_name": "Expo 2026",
  "analytics_id": 1,
  "type": "income",
  "budgeted_amount": 100000,
  "start_date": "2026-02-01",
  "end_date": "2026-02-28"
}
```

**Validation**:
- `analytics_id`: Must exist in analytics table
- `type`: income or expense
- `budgeted_amount`: Positive number
- `start_date < end_date`: Dates must be valid range
- `achieved_amount` defaults to 0

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Budget created",
  "data": {
    "id": 1,
    "event_name": "Expo 2026",
    "analytics_id": 1,
    "type": "income",
    "budgeted_amount": 100000,
    "achieved_amount": 0,
    "percentage_achieved": 0,
    "amount_to_achieve": 100000,
    "start_date": "2026-02-01",
    "end_date": "2026-02-28",
    "created_at": "2026-01-31T10:30:00Z"
  }
}
```

---

### 2. Get All Budgets
**GET** `/budgets?skip=0&limit=10&type=income&analytics_id=1`

**Headers**: `Authorization: Bearer {jwt_token}`

**Query Parameters**:
- `skip`, `limit`: Pagination
- `type` (optional): Filter by income/expense
- `analytics_id` (optional): Filter by event

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 5,
    "budgets": [
      {
        "id": 1,
        "event_name": "Expo 2026",
        "analytics_id": 1,
        "type": "income",
        "budgeted_amount": 100000,
        "achieved_amount": 75000,
        "percentage_achieved": 75,
        "amount_to_achieve": 25000,
        "start_date": "2026-02-01",
        "end_date": "2026-02-28",
        "created_at": "2026-01-31T10:30:00Z"
      }
    ]
  }
}
```

---

### 3. Get Budget by ID
**GET** `/budgets/:id`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "event_name": "Expo 2026",
    "analytics_id": 1,
    "type": "income",
    "budgeted_amount": 100000,
    "achieved_amount": 75000,
    "percentage_achieved": 75,
    "amount_to_achieve": 25000,
    "start_date": "2026-02-01",
    "end_date": "2026-02-28",
    "created_at": "2026-01-31T10:30:00Z",
    "revised_budgets": [
      {
        "id": 1,
        "revised_budgeted_amount": 120000,
        "revised_achieved_amount": 75000,
        "revised_percentage_achieved": 62.5,
        "revised_amount_to_achieve": 45000,
        "budget_exceed": "yes",
        "revision_reason": "Market demand increased"
      }
    ],
    "budget_graph": {
      "id": 1,
      "total_expense": 30000,
      "predicted_expense": 35000,
      "total_profit": 45000,
      "predicted_profit": 40000,
      "expense_variance": 5000,
      "profit_variance": -5000
    }
  }
}
```

---

### 4. Update Budget
**PUT** `/budgets/:id`

**Headers**: `Authorization: Bearer {jwt_token}` (admin only)

**Request Body**:
```json
{
  "budgeted_amount": 120000,
  "achieved_amount": 75000
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Budget updated",
  "data": {
    "id": 1,
    "budgeted_amount": 120000,
    "achieved_amount": 75000,
    "percentage_achieved": 62.5,
    "amount_to_achieve": 45000
  }
}
```

---

### 5. Create Budget Revision
**POST** `/budgets/:id/revise`

**Headers**: `Authorization: Bearer {jwt_token}` (admin only)

**Request Body**:
```json
{
  "revised_budgeted_amount": 120000,
  "revised_achieved_amount": 75000,
  "revision_reason": "Market demand increased"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Budget revised",
  "data": {
    "id": 1,
    "budget_id": 1,
    "revised_budgeted_amount": 120000,
    "revised_achieved_amount": 75000,
    "revised_percentage_achieved": 62.5,
    "revised_amount_to_achieve": 45000,
    "budget_exceed": "yes",
    "revision_reason": "Market demand increased",
    "created_at": "2026-01-31T11:00:00Z"
  }
}
```

---

### 6. Get Budget Alerts
**GET** `/budgets/:id/alerts`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": 1,
        "budget_id": 1,
        "alert_type": "warning",
        "threshold_percentage": 80,
        "current_percentage": 75,
        "message": "Budget is at 75% of target",
        "triggered_at": "2026-01-31T11:05:00Z"
      },
      {
        "id": 2,
        "budget_id": 1,
        "alert_type": "critical",
        "threshold_percentage": 100,
        "current_percentage": 105,
        "message": "Budget exceeded by 5%",
        "triggered_at": "2026-01-31T11:10:00Z"
      }
    ]
  }
}
```

---

## Transactions API

### 1. Create Customer Invoice
**POST** `/invoices`

**Headers**: `Authorization: Bearer {jwt_token}` (admin only)

**Request Body**:
```json
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

**Auto-Assignment**: 
- System applies auto_analytical_models rules to determine analytics_id
- If not provided, uses first matching rule

**Validation**:
- `customer_id`: Must exist in contacts (type=customer)
- `line_items`: Array with at least 1 item
- `product_id`: Must exist in products
- `quantity`: Positive integer
- `tax_amount`: Calculated as quantity * unit_price * (tax_rate/100)

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Invoice created as draft",
  "data": {
    "id": 1,
    "customer_id": 2,
    "analytics_id": 1,
    "created_by_user_id": 1,
    "total_amount": 6000,
    "status": "draft",
    "payment_status": "not_paid",
    "line_items": [
      {
        "id": 1,
        "invoice_id": 1,
        "product_id": 1,
        "quantity": 10,
        "unit_price": 500,
        "tax_amount": 900
      }
    ],
    "created_at": "2026-01-31T10:30:00Z"
  }
}
```

---

### 2. Post Customer Invoice
**POST** `/invoices/:id/post`

**Headers**: `Authorization: Bearer {jwt_token}` (admin only)

**Purpose**: Convert invoice from draft → posted status and update budget achieved_amount

**Request Body**: Empty or `{}`

**Logic**:
1. Check invoice status is "draft"
2. Move to "posted" status
3. Update corresponding budget.achieved_amount += total_amount
4. Trigger budget alerts if thresholds crossed
5. Create audit log

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Invoice posted and budget updated",
  "data": {
    "id": 1,
    "status": "posted",
    "total_amount": 6000,
    "budget_updated": {
      "budget_id": 1,
      "achieved_amount": 75000,
      "percentage_achieved": 75,
      "amount_to_achieve": 25000
    },
    "alerts_triggered": [
      {
        "alert_type": "warning",
        "threshold_percentage": 80,
        "message": "Budget approaching limit"
      }
    ]
  }
}
```

---

### 3. Get All Customer Invoices
**GET** `/invoices?skip=0&limit=10&customer_id=2&status=posted`

**Headers**: `Authorization: Bearer {jwt_token}`

**Query Parameters**:
- `skip`, `limit`: Pagination
- `customer_id` (optional): Filter by customer
- `status` (optional): draft, posted, cancelled
- `analytics_id` (optional): Filter by event
- `date_from`, `date_to` (optional): ISO dates for range filtering

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 3,
    "invoices": [
      {
        "id": 1,
        "customer_id": 2,
        "customer_name": "Customer XYZ",
        "analytics_id": 1,
        "event_name": "Expo 2026",
        "total_amount": 6000,
        "status": "posted",
        "payment_status": "partial",
        "created_by_user_id": 1,
        "created_at": "2026-01-31T10:30:00Z"
      }
    ]
  }
}
```

---

### 4. Cancel Customer Invoice
**POST** `/invoices/:id/cancel`

**Headers**: `Authorization: Bearer {jwt_token}` (admin only)

**Request Body**:
```json
{
  "reason": "Customer requested cancellation"
}
```

**Logic**:
1. Check invoice status is not already "cancelled"
2. If status is "posted", subtract total_amount from budget.achieved_amount
3. Update status to "cancelled"
4. Recalculate budget percentages

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Invoice cancelled and budget reversed",
  "data": {
    "id": 1,
    "status": "cancelled",
    "reason": "Customer requested cancellation",
    "budget_reversed": {
      "budget_id": 1,
      "achieved_amount": 69000,
      "percentage_achieved": 69,
      "amount_to_achieve": 31000
    }
  }
}
```

---

### 5. Create Vendor Bill
**POST** `/bills`

**Headers**: `Authorization: Bearer {jwt_token}` (admin only)

**Request Body**: Same structure as invoices but with `vendor_id` instead of `customer_id`

```json
{
  "vendor_id": 1,
  "analytics_id": 1,
  "line_items": [
    {
      "product_id": 1,
      "quantity": 50,
      "unit_price": 200,
      "tax_amount": 1800
    }
  ]
}
```

**Response** (201 Created): Similar to invoice response

---

### 6. Post Vendor Bill
**POST** `/bills/:id/post`

**Response** (200 OK): Similar to invoice post response

---

### 7. Get All Vendor Bills
**GET** `/bills?skip=0&limit=10&vendor_id=1&status=posted`

**Response** (200 OK): Similar to invoices list response

---

## Payments API

### 1. Record Payment
**POST** `/payments`

**Headers**: `Authorization: Bearer {jwt_token}` (admin only)

**Request Body**:
```json
{
  "invoice_id": 1,
  "amount_paid": 3000,
  "payment_mode": "bank_transfer",
  "transaction_id": "TXN123456",
  "payment_date": "2026-01-31"
}
```

**Validation**:
- Either `invoice_id` OR `bill_id` required (not both)
- `amount_paid`: Positive, <= remaining balance
- `payment_mode`: bank_transfer, cash, cheque, credit_card
- `transaction_id`: Unique (if provided)

**Logic**:
1. Add payment record
2. Update invoice.payment_status:
   - If paid_amount < total: "partial"
   - If paid_amount == total: "paid"
3. Trigger alerts if payment overdue

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Payment recorded",
  "data": {
    "id": 1,
    "invoice_id": 1,
    "amount_paid": 3000,
    "payment_mode": "bank_transfer",
    "transaction_id": "TXN123456",
    "status": "completed",
    "payment_date": "2026-01-31",
    "invoice_updated": {
      "invoice_id": 1,
      "total_amount": 6000,
      "paid_amount": 3000,
      "remaining_balance": 3000,
      "payment_status": "partial"
    }
  }
}
```

---

### 2. Get All Payments
**GET** `/payments?skip=0&limit=10&invoice_id=1&status=completed`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 3,
    "payments": [
      {
        "id": 1,
        "invoice_id": 1,
        "bill_id": null,
        "amount_paid": 3000,
        "payment_mode": "bank_transfer",
        "transaction_id": "TXN123456",
        "status": "completed",
        "payment_date": "2026-01-31",
        "created_at": "2026-01-31T10:30:00Z"
      }
    ]
  }
}
```

---

### 3. Get Payment by ID
**GET** `/payments/:id`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "invoice_id": 1,
    "bill_id": null,
    "amount_paid": 3000,
    "payment_mode": "bank_transfer",
    "transaction_id": "TXN123456",
    "status": "completed",
    "payment_date": "2026-01-31",
    "invoice": {
      "id": 1,
      "customer_id": 2,
      "total_amount": 6000,
      "paid_amount": 3000,
      "remaining_balance": 3000,
      "payment_status": "partial"
    }
  }
}
```

---

## Dashboard API

### 1. Dashboard Summary
**GET** `/dashboard/summary`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_budgets": 5,
      "total_invoices": 3,
      "total_bills": 2,
      "total_payments": 5
    },
    "financial_metrics": {
      "total_revenue": 150000,
      "total_expenses": 75000,
      "total_profit": 75000,
      "profit_margin_percentage": 50
    },
    "budget_status": {
      "on_track": 3,
      "warning": 1,
      "critical": 1
    },
    "payment_metrics": {
      "paid": 3000,
      "pending": 3000,
      "overdue": 0
    }
  }
}
```

---

### 2. Budget Overview
**GET** `/dashboard/budgets-overview`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "id": 1,
        "event_name": "Expo 2026",
        "type": "income",
        "budgeted_amount": 100000,
        "achieved_amount": 75000,
        "percentage_achieved": 75,
        "status": "on_track",
        "alerts": ["warning_80"]
      }
    ]
  }
}
```

---

### 3. Event Analytics
**GET** `/dashboard/analytics/:analytics_id`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "event": {
      "id": 1,
      "event_name": "Expo 2026",
      "partner_tag": "supplier",
      "profit": 25000,
      "profit_margin_percentage": 33.33
    },
    "related_budgets": [
      {
        "id": 1,
        "type": "income",
        "achieved_amount": 75000,
        "percentage_achieved": 75
      }
    ],
    "related_transactions": {
      "invoices": 2,
      "bills": 1,
      "total_amount": 35000
    }
  }
}
```

---

### 4. Payment Report
**GET** `/dashboard/payment-report?date_from=2026-01-01&date_to=2026-02-01`

**Headers**: `Authorization: Bearer {jwt_token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2026-01-01",
      "to": "2026-02-01"
    },
    "payment_summary": {
      "total_invoiced": 60000,
      "total_collected": 30000,
      "collection_rate_percentage": 50,
      "outstanding": 30000
    },
    "payment_breakdown": [
      {
        "mode": "bank_transfer",
        "count": 3,
        "amount": 25000
      },
      {
        "mode": "cash",
        "count": 2,
        "amount": 5000
      }
    ]
  }
}
```

---

## Error Handling

### Error Response Format
All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "details": {
    "field": "Field that caused error",
    "message": "Detailed error message"
  }
}
```

### Standard HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation failed, missing required fields |
| 401 | Unauthorized | JWT token missing or invalid |
| 403 | Forbidden | User lacks permission (not admin) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (login_id, email, etc.) |
| 422 | Unprocessable Entity | Logical validation error (e.g., amount > budget) |
| 500 | Internal Server Error | Server error |

### Common Error Scenarios

**Missing Authorization Header**:
```json
{
  "success": false,
  "error": "Missing authorization header",
  "statusCode": 401
}
```

**Invalid JWT Token**:
```json
{
  "success": false,
  "error": "Invalid or expired JWT token",
  "statusCode": 401
}
```

**Permission Denied**:
```json
{
  "success": false,
  "error": "Only admins can perform this action",
  "statusCode": 403
}
```

**Validation Error**:
```json
{
  "success": false,
  "error": "Validation failed",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**Resource Not Found**:
```json
{
  "success": false,
  "error": "Budget not found",
  "statusCode": 404
}
```

---

## Authentication & Authorization

### JWT Token Structure
```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: {
  "id": 1,
  "login_id": "admin_user",
  "role": "admin",
  "iat": 1675088400,
  "exp": 1675092000
}
```

### Role-Based Access Control

| Endpoint | Admin | Portal |
|----------|-------|--------|
| POST /auth/register | ✅ | ✅ |
| POST /auth/login | ✅ | ✅ |
| GET /auth/me | ✅ | ✅ |
| POST /analytics | ✅ | ❌ |
| GET /analytics | ✅ | ✅ |
| POST /products | ✅ | ❌ |
| GET /products | ✅ | ✅ |
| POST /contacts | ✅ | ❌ |
| GET /contacts | ✅ | ✅ |
| POST /budgets | ✅ | ❌ |
| GET /budgets | ✅ | ✅ |
| POST /invoices | ✅ | ❌ |
| GET /invoices | ✅ | ✅ |
| POST /invoices/:id/post | ✅ | ❌ |
| POST /payments | ✅ | ❌ |
| GET /payments | ✅ | ✅ |
| GET /dashboard/* | ✅ | ✅ |

---

## Testing & Integration

### Demo Credentials
```
Admin User:
- login_id: admin_user
- password: Test@123
- email: admin@shivbas.com
- role: admin

Portal User:
- login_id: john_portal
- password: Test@123
- email: john@shivbas.com
- role: portal
```

### Testing Workflow

1. **Login** → Get JWT token
2. **Create Analytics Event** → Use event ID for budgets
3. **Create Budget** → Link to analytics event
4. **Create Invoice** → Auto-assign to event via rules
5. **Post Invoice** → Updates budget achieved_amount
6. **Record Payment** → Updates payment status
7. **View Dashboard** → See aggregated metrics

---

## Development Notes

### For Backend Developers

1. All endpoints require `Content-Type: application/json`
2. Use parameterized queries to prevent SQL injection
3. Validate all inputs before database queries
4. Implement role-based middleware before each handler
5. Log all failed attempts for audit trail
6. Use transactions for multi-step operations (post invoice, record payment)
7. Set appropriate HTTP status codes
8. Return consistent response format

### For Frontend Developers

1. Store JWT token in httpOnly cookie (most secure) or localStorage
2. Include JWT token in Authorization header for all requests
3. Implement automatic token refresh before expiry
4. Show appropriate error messages based on status codes
5. Handle 401 by redirecting to login
6. Handle 403 by showing permission denied message
7. Validate form inputs before API calls
8. Use loading states during API calls
9. Implement pagination for list endpoints (use skip/limit)
10. Cache dashboard summary to reduce API calls

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-31 | Initial API contract for 24-hour hackathon |

---

**Last Updated**: 2026-01-31  
**Prepared For**: ShivBAS Hackathon Team  
**Status**: ✅ Ready for Implementation
