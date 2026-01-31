# ============================================================================
# Admin API End-to-End Test
# Tests all admin functionality with backend API
# ============================================================================

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "           Admin API End-to-End Test                           " -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"
$token = $null
$testResults = @()

# Helper function to add test result
function Add-TestResult {
    param($TestName, $Status, $Message)
    $testResults += [PSCustomObject]@{
        Test = $TestName
        Status = $Status
        Message = $Message
    }
    if ($Status -eq "PASS") {
        Write-Host "[PASS] $TestName" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $TestName - $Message" -ForegroundColor Red
    }
}

# Test 1: Admin Login
Write-Host "`n[TEST 1] Admin Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        login_id = "admin"
        password = "Admin@123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($response.success -and $response.data.accessToken) {
        $token = $response.data.accessToken
        $userRole = $response.data.user.role
        Add-TestResult "Admin Login" "PASS" "Token received, Role: $userRole"
    } else {
        Add-TestResult "Admin Login" "FAIL" "No token received"
        exit 1
    }
} catch {
    Add-TestResult "Admin Login" "FAIL" $_.Exception.Message
    Write-Host "`nNote: Make sure you have an admin user with login_id='admin' and password='Admin@123'" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 2: Create Analytics Event
Write-Host "`n[TEST 2] Create Analytics Event..." -ForegroundColor Yellow
try {
    $analyticsBody = @{
        event_name = "Test Event $(Get-Date -Format 'HHmmss')"
        partner_id = 1
        partner_tag = "TEST"
        product_id = 1
        product_category = "Test Category"
        no_of_units = 10
        unit_price = 100
        profit = 200
        profit_margin_percentage = 20
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/analytics" -Method POST -Headers $headers -Body $analyticsBody
    
    if ($response.success) {
        $analyticsId = $response.data.id
        Add-TestResult "Create Analytics" "PASS" "Event created with ID: $analyticsId"
    } else {
        Add-TestResult "Create Analytics" "FAIL" "Failed to create event"
    }
} catch {
    Add-TestResult "Create Analytics" "FAIL" $_.Exception.Message
}

# Test 3: Get All Analytics
Write-Host "`n[TEST 3] Get All Analytics..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/analytics" -Method GET -Headers $headers
    
    if ($response.success) {
        $count = $response.data.Count
        Add-TestResult "Get Analytics" "PASS" "Retrieved $count analytics events"
    } else {
        Add-TestResult "Get Analytics" "FAIL" "Failed to retrieve analytics"
    }
} catch {
    Add-TestResult "Get Analytics" "FAIL" $_.Exception.Message
}

# Test 4: Create Product
Write-Host "`n[TEST 4] Create Product..." -ForegroundColor Yellow
try {
    $productBody = @{
        name = "Test Product $(Get-Date -Format 'HHmmss')"
        category = "Test Category"
        unit_price = 99.99
        tax_rate = 18
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/products" -Method POST -Headers $headers -Body $productBody
    
    if ($response.success) {
        $productId = $response.data.id
        Add-TestResult "Create Product" "PASS" "Product created with ID: $productId"
    } else {
        Add-TestResult "Create Product" "FAIL" "Failed to create product"
    }
} catch {
    Add-TestResult "Create Product" "FAIL" $_.Exception.Message
}

# Test 5: Get All Products
Write-Host "`n[TEST 5] Get All Products..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/products" -Method GET -Headers $headers
    
    if ($response.success) {
        $count = $response.data.Count
        Add-TestResult "Get Products" "PASS" "Retrieved $count products"
    } else {
        Add-TestResult "Get Products" "FAIL" "Failed to retrieve products"
    }
} catch {
    Add-TestResult "Get Products" "FAIL" $_.Exception.Message
}

# Test 6: Create Contact
Write-Host "`n[TEST 6] Create Contact..." -ForegroundColor Yellow
try {
    $contactBody = @{
        name = "Test Contact $(Get-Date -Format 'HHmmss')"
        type = "customer"
        email = "test@example.com"
        phone = "+1234567890"
        status = "active"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/contacts" -Method POST -Headers $headers -Body $contactBody
    
    if ($response.success) {
        $contactId = $response.data.id
        Add-TestResult "Create Contact" "PASS" "Contact created with ID: $contactId"
    } else {
        Add-TestResult "Create Contact" "FAIL" "Failed to create contact"
    }
} catch {
    Add-TestResult "Create Contact" "FAIL" $_.Exception.Message
}

# Test 7: Get All Contacts
Write-Host "`n[TEST 7] Get All Contacts..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/contacts" -Method GET -Headers $headers
    
    if ($response.success) {
        $count = $response.data.Count
        Add-TestResult "Get Contacts" "PASS" "Retrieved $count contacts"
    } else {
        Add-TestResult "Get Contacts" "FAIL" "Failed to retrieve contacts"
    }
} catch {
    Add-TestResult "Get Contacts" "FAIL" $_.Exception.Message
}

# Test 8: Update Contact
Write-Host "`n[TEST 8] Update Contact..." -ForegroundColor Yellow
try {
    if ($contactId) {
        $updateBody = @{
            phone = "+9876543210"
            status = "active"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/contacts/$contactId" -Method PUT -Headers $headers -Body $updateBody
        
        if ($response.success) {
            Add-TestResult "Update Contact" "PASS" "Contact updated successfully"
        } else {
            Add-TestResult "Update Contact" "FAIL" "Failed to update contact"
        }
    } else {
        Add-TestResult "Update Contact" "SKIP" "No contact ID available"
    }
} catch {
    Add-TestResult "Update Contact" "FAIL" $_.Exception.Message
}

# Test 9: Create Budget
Write-Host "`n[TEST 9] Create Budget..." -ForegroundColor Yellow
try {
    $budgetBody = @{
        event_name = "Test Budget $(Get-Date -Format 'HHmmss')"
        analytics_id = 1
        type = "income"
        budgeted_amount = 50000
        achieved_amount = 0
        start_date = (Get-Date).ToString("yyyy-MM-dd")
        end_date = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
        notes = "Test budget created by admin"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/budgets" -Method POST -Headers $headers -Body $budgetBody
    
    if ($response.success) {
        $budgetId = $response.data.id
        Add-TestResult "Create Budget" "PASS" "Budget created with ID: $budgetId"
    } else {
        Add-TestResult "Create Budget" "FAIL" "Failed to create budget"
    }
} catch {
    Add-TestResult "Create Budget" "FAIL" $_.Exception.Message
}

# Test 10: Get All Budgets
Write-Host "`n[TEST 10] Get All Budgets..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/budgets" -Method GET -Headers $headers
    
    if ($response.success) {
        $count = $response.data.Count
        Add-TestResult "Get Budgets" "PASS" "Retrieved $count budgets"
    } else {
        Add-TestResult "Get Budgets" "FAIL" "Failed to retrieve budgets"
    }
} catch {
    Add-TestResult "Get Budgets" "FAIL" $_.Exception.Message
}

# Test 11: Update Budget
Write-Host "`n[TEST 11] Update Budget..." -ForegroundColor Yellow
try {
    if ($budgetId) {
        $updateBody = @{
            achieved_amount = 10000
            notes = "Updated by admin test"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/budgets/$budgetId" -Method PUT -Headers $headers -Body $updateBody
        
        if ($response.success) {
            Add-TestResult "Update Budget" "PASS" "Budget updated successfully"
        } else {
            Add-TestResult "Update Budget" "FAIL" "Failed to update budget"
        }
    } else {
        Add-TestResult "Update Budget" "SKIP" "No budget ID available"
    }
} catch {
    Add-TestResult "Update Budget" "FAIL" $_.Exception.Message
}

# Test 12: Get Dashboard Summary
Write-Host "`n[TEST 12] Get Dashboard Summary..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/dashboard/summary" -Method GET -Headers $headers
    
    if ($response.success) {
        Add-TestResult "Dashboard Summary" "PASS" "Dashboard data retrieved"
    } else {
        Add-TestResult "Dashboard Summary" "FAIL" "Failed to retrieve dashboard"
    }
} catch {
    Add-TestResult "Dashboard Summary" "FAIL" $_.Exception.Message
}

# Test 13: Create Transaction
Write-Host "`n[TEST 13] Create Transaction..." -ForegroundColor Yellow
try {
    $transactionBody = @{
        transaction_number = "TEST-$(Get-Date -Format 'yyyyMMddHHmmss')"
        transaction_type = "invoice"
        contact_id = if ($contactId) { $contactId } else { 1 }
        analytics_id = 1
        transaction_date = (Get-Date).ToString("yyyy-MM-dd")
        due_date = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
        total_amount = 10000
        tax_amount = 1800
        status = "pending"
        notes = "Test transaction"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/transactions" -Method POST -Headers $headers -Body $transactionBody
    
    if ($response.success) {
        $transactionId = $response.data.id
        Add-TestResult "Create Transaction" "PASS" "Transaction created with ID: $transactionId"
    } else {
        Add-TestResult "Create Transaction" "FAIL" "Failed to create transaction"
    }
} catch {
    Add-TestResult "Create Transaction" "FAIL" $_.Exception.Message
}

# Test 14: Get All Transactions
Write-Host "`n[TEST 14] Get All Transactions..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/transactions" -Method GET -Headers $headers
    
    if ($response.success) {
        $count = $response.data.Count
        Add-TestResult "Get Transactions" "PASS" "Retrieved $count transactions"
    } else {
        Add-TestResult "Get Transactions" "FAIL" "Failed to retrieve transactions"
    }
} catch {
    Add-TestResult "Get Transactions" "FAIL" $_.Exception.Message
}

# Summary
Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "           Test Summary                                         " -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$skipCount = ($testResults | Where-Object { $_.Status -eq "SKIP" }).Count
$totalCount = $testResults.Count

Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Skipped: $skipCount" -ForegroundColor Yellow

$successRate = [math]::Round(($passCount / $totalCount) * 100, 2)
Write-Host "`nSuccess Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } else { "Yellow" })

Write-Host "`n================================================================`n" -ForegroundColor Cyan

if ($failCount -eq 0) {
    Write-Host "All admin API endpoints are working correctly!" -ForegroundColor Green
    Write-Host "Admin end-to-end functionality is fully connected." -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Please review the errors above." -ForegroundColor Yellow
}
