# ShivBAS Complete API Documentation

## Server Status: ✅ RUNNING
**Base URL**: `http://localhost:5000/api`

---

## 🔐 Authentication APIs

### 1. Register User
**POST** `/api/auth/register`
```json
{
  "login_id": "demo_user",
  "email": "demo@example.com",
  "password": "Demo@1234",
  "name": "Demo User"
}
```

### 2. Login
**POST** `/api/auth/login`
```json
{
  "login_id": "demo_user",
  "password": "Demo@1234"
}
```

### 3. Get Current User
**GET** `/api/auth/me`
**Headers**: `Authorization: Bearer {token}`

### 4. Logout
**POST** `/api/auth/logout`
**Headers**: `Authorization: Bearer {token}`

### 5. Forgot Password
**POST** `/api/auth/forgot-password`
```json
{
  "email": "demo@example.com"
}
```

### 6. Reset Password
**POST** `/api/auth/reset-password`
```json
{
  "token": "reset_token",
  "new_password": "NewPass@1234"
}
```

### 7. Refresh Token
**POST** `/api/auth/refresh-token`
```json
{
  "refreshToken": "your_refresh_token"
}
```

---

## 📊 Master Data APIs

### Analytics Codes

#### Create Analytics Code (Admin Only)
**POST** `/api/analytics`
**Headers**: `Authorization: Bearer {token}`
```json
{
  "code": "SALES001",
  "description": "Sales Revenue",
  "category": "Revenue"
}
```

#### Get All Analytics Codes
**GET** `/api/analytics?category=Revenue&search=sales`
**Headers**: `Authorization: Bearer {token}`

#### Update Analytics Code (Admin Only)
**PUT** `/api/analytics/:id`
**Headers**: `Authorization: Bearer {token}`
```json
{
  "code": "SALES001",
  "description": "Updated Description",
  "category": "Revenue"
}
```

#### Delete Analytics Code (Admin Only)
**DELETE** `/api/analytics/:id`
**Headers**: `Authorization: Bearer {token}`

### Products

#### Get All Products
**GET** `/api/products?search=laptop`
**Headers**: `Authorization: Bearer {token}`

### Contacts

#### Get All Contacts
**GET** `/api/contacts?type=customer&search=john`
**Headers**: `Authorization: Bearer {token}`

### Partners

#### Get All Partners
**GET** `/api/partners?search=tech`
**Headers**: `Authorization: Bearer {token}`

---

## 💰 Budgets APIs

### Create Budget
**POST** `/api/budgets`
**Headers**: `Authorization: Bearer {token}`
```json
{
  "analytics_code_id": 1,
  "amount": 100000,
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "notes": "Annual sales budget"
}
```

### Get All Budgets
**GET** `/api/budgets?analytics_code_id=1&start_date=2026-01-01`
**Headers**: `Authorization: Bearer {token}`

### Get Budget by ID
**GET** `/api/budgets/:id`
**Headers**: `Authorization: Bearer {token}`

### Update Budget
**PUT** `/api/budgets/:id`
**Headers**: `Authorization: Bearer {token}`
```json
{
  "amount": 120000,
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "notes": "Revised budget"
}
```

### Delete Budget (Admin Only)
**DELETE** `/api/budgets/:id`
**Headers**: `Authorization: Bearer {token}`

### Get Budget Revisions
**GET** `/api/budgets/:id/revisions`
**Headers**: `Authorization: Bearer {token}`

### Get Budget Alerts
**GET** `/api/budgets/alerts?threshold=80`
**Headers**: `Authorization: Bearer {token}`

---

## 📝 Transactions APIs (Invoices & Bills)

### Create Transaction
**POST** `/api/transactions`
**Headers**: `Authorization: Bearer {token}`
```json
{
  "transaction_type": "invoice",
  "contact_id": 1,
  "transaction_date": "2026-01-15",
  "due_date": "2026-02-15",
  "notes": "Invoice for January services",
  "items": [
    {
      "product_id": 1,
      "analytics_code_id": 1,
      "description": "Product/Service description",
      "quantity": 10,
      "unit_price": 1000
    }
  ]
}
```

### Get All Transactions
**GET** `/api/transactions?type=invoice&status=pending&start_date=2026-01-01`
**Headers**: `Authorization: Bearer {token}`

### Get Transaction by ID
**GET** `/api/transactions/:id`
**Headers**: `Authorization: Bearer {token}`

### Update Transaction
**PUT** `/api/transactions/:id`
**Headers**: `Authorization: Bearer {token}`
```json
{
  "contact_id": 1,
  "transaction_date": "2026-01-15",
  "due_date": "2026-02-20",
  "notes": "Updated notes",
  "status": "approved",
  "items": [...]
}
```

### Approve Transaction (Admin Only)
**POST** `/api/transactions/:id/approve`
**Headers**: `Authorization: Bearer {token}`

### Delete Transaction (Admin Only)
**DELETE** `/api/transactions/:id`
**Headers**: `Authorization: Bearer {token}`

---

## 💳 Payments APIs

### Record Payment
**POST** `/api/payments`
**Headers**: `Authorization: Bearer {token}`
```json
{
  "transaction_id": 1,
  "amount": 5000,
  "payment_date": "2026-01-20",
  "payment_method": "bank_transfer",
  "reference_number": "TXN123456",
  "notes": "Partial payment"
}
```

### Get All Payments
**GET** `/api/payments?start_date=2026-01-01&payment_method=bank_transfer`
**Headers**: `Authorization: Bearer {token}`

### Get Transaction Payments
**GET** `/api/payments/transaction/:transaction_id`
**Headers**: `Authorization: Bearer {token}`

---

## 📈 Dashboard APIs

### Get Dashboard Summary
**GET** `/api/dashboard/summary?start_date=2026-01-01&end_date=2026-12-31`
**Headers**: `Authorization: Bearer {token}`

**Response**:
```json
{
  "success": true,
  "data": {
    "budgets": {
      "total": 10,
      "total_amount": 1000000
    },
    "invoices": {
      "total": 25,
      "total_amount": 500000,
      "outstanding": 100000
    },
    "bills": {
      "total": 15,
      "total_amount": 300000,
      "outstanding": 50000
    },
    "payments": {
      "total": 30,
      "total_amount": 650000
    }
  }
}
```

### Get Budget vs Actual
**GET** `/api/dashboard/budget-vs-actual?start_date=2026-01-01`
**Headers**: `Authorization: Bearer {token}`

### Get Transaction Report
**GET** `/api/dashboard/transaction-report?group_by=month&start_date=2026-01-01`
**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `group_by`: `day` | `week` | `month` | `year`

### Get Payment Status
**GET** `/api/dashboard/payment-status?transaction_type=invoice`
**Headers**: `Authorization: Bearer {token}`

---

## 🧪 Quick Test Commands (PowerShell)

### 1. Register & Login
```powershell
# Register
$registerBody = @{
    login_id = "test_user"
    email = "test@example.com"
    password = "Test@1234"
    name = "Test User"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"

# Login
$loginBody = @{
    login_id = "test_user"
    password = "Test@1234"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.accessToken
```

### 2. Test Protected Endpoint
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

# Get current user
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method Get -Headers $headers

# Get products
Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method Get -Headers $headers

# Get dashboard summary
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/summary" -Method Get -Headers $headers
```

---

## 📝 Notes

### Authentication
- All endpoints except `/auth/register`, `/auth/login`, `/auth/forgot-password`, and `/auth/reset-password` require authentication
- Include JWT token in `Authorization: Bearer {token}` header

### Role-Based Access
- **Admin Only**: Create/Update/Delete Analytics, Delete Budgets, Approve/Delete Transactions
- **Portal Users**: Can read most data and create budgets/transactions/payments

### Error Responses
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Admin required)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

---

## ✅ All APIs Implemented!

Total Endpoints: **40+**
- ✅ Authentication: 7 endpoints
- ✅ Master Data: 7 endpoints
- ✅ Budgets: 7 endpoints
- ✅ Transactions: 6 endpoints
- ✅ Payments: 3 endpoints
- ✅ Dashboard: 4 endpoints
