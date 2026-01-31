# Test all POST endpoints
$baseUrl = "http://localhost:5000/api"

# Login first
$loginBody = @{
    login_id = "admin_user"
    password = "Test@123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.accessToken
$headers = @{ Authorization = "Bearer $token" }

Write-Host "`n=== Testing POST Endpoints ===" -ForegroundColor Cyan

# Test POST /budgets
Write-Host "`n1. POST /budgets..." -ForegroundColor Yellow
try {
    $budgetBody = @{
        event_name = "Test Event"
        analytics_id = 1
        type = "income"
        budgeted_amount = 10000
        start_date = "2026-02-01"
        end_date = "2026-03-31"
        notes = "Test budget"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/budgets" -Method Post -Headers $headers -Body $budgetBody -ContentType "application/json"
    Write-Host "  SUCCESS: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test POST /payments
Write-Host "`n2. POST /payments..." -ForegroundColor Yellow
try {
    $paymentBody = @{
        invoice_id = 1
        amount_paid = 1000
        payment_date = "2026-01-31"
        payment_mode = "upi"
        reference_number = "TEST123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/payments" -Method Post -Headers $headers -Body $paymentBody -ContentType "application/json"
    Write-Host "  SUCCESS: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test POST /analytics
Write-Host "`n3. POST /analytics..." -ForegroundColor Yellow
try {
    $analyticsBody = @{
        event_name = "Test Campaign"
        partner_id = 1
        partner_tag = "customer"
        product_id = 1
        product_category = "Wood"
        no_of_units = 10
        unit_price = 500
        profit = 2000
        profit_margin_percentage = 25
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/analytics" -Method Post -Headers $headers -Body $analyticsBody -ContentType "application/json"
    Write-Host "  SUCCESS: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test POST /products
Write-Host "`n4. POST /products..." -ForegroundColor Yellow
try {
    $productBody = @{
        name = "Test Product"
        category = "Wood"
        unit_price = 750
        tax_rate = 18
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/products" -Method Post -Headers $headers -Body $productBody -ContentType "application/json"
    Write-Host "  SUCCESS: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test POST /contacts
Write-Host "`n5. POST /contacts..." -ForegroundColor Yellow
try {
    $contactBody = @{
        name = "Test Contact"
        type = "customer"
        email = "test@example.com"
        phone = "1234567890"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/contacts" -Method Post -Headers $headers -Body $contactBody -ContentType "application/json"
    Write-Host "  SUCCESS: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Testing GET by ID Endpoints ===" -ForegroundColor Cyan

# Test GET /budgets/:id
Write-Host "`n6. GET /budgets/1..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/budgets/1" -Method Get -Headers $headers
    Write-Host "  SUCCESS: Budget found" -ForegroundColor Green
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test GET /payments/:id
Write-Host "`n7. GET /payments/1..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/payments/1" -Method Get -Headers $headers
    Write-Host "  SUCCESS: Payment found" -ForegroundColor Green
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"
