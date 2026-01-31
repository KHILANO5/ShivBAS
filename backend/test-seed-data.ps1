# ============================================================================
# ShivBAS Backend - Seed Data Testing Script
# Tests all APIs using the demo dataset from seed.sql
# ============================================================================

$baseUrl = "http://localhost:5000"
$passedTests = 0
$failedTests = 0

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "ShivBAS Backend - Seed Data Testing" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# ============================================================================
# Test 1: Login with Admin User from seed.sql
# ============================================================================
Write-Host "Test 1: Login with Admin User (admin_user)..." -ForegroundColor Yellow
try {
    $loginData = @{
        login_id = "admin_user"
        password = "Test@123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post `
        -Body $loginData -ContentType "application/json"
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Admin login successful" -ForegroundColor Green
        Write-Host "    User: $($response.data.user.name)" -ForegroundColor Gray
        Write-Host "    Role: $($response.data.user.role)" -ForegroundColor Gray
        $adminToken = $response.data.accessToken
        $adminHeaders = @{ Authorization = "Bearer $adminToken" }
        $passedTests++
    } else {
        Write-Host "  FAIL: Login failed" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 2: Login with Portal User (john_portal)
# ============================================================================
Write-Host "`nTest 2: Login with Portal User (john_portal)..." -ForegroundColor Yellow
try {
    $loginData = @{
        login_id = "john_portal"
        password = "Test@123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post `
        -Body $loginData -ContentType "application/json"
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Portal user login successful" -ForegroundColor Green
        Write-Host "    User: $($response.data.user.name)" -ForegroundColor Gray
        Write-Host "    Email: $($response.data.user.email)" -ForegroundColor Gray
        $portalToken = $response.data.accessToken
        $portalHeaders = @{ Authorization = "Bearer $portalToken" }
        $passedTests++
    } else {
        Write-Host "  FAIL: Login failed" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 3: Get All Products (Expected: 5 products from seed.sql)
# ============================================================================
Write-Host "`nTest 3: Get All Products..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get -Headers $adminHeaders
    
    if ($response.success -eq $true) {
        $count = $response.data.Count
        Write-Host "  PASS: Retrieved $count products" -ForegroundColor Green
        if ($count -eq 5) {
            Write-Host "    Expected 5 products - VERIFIED!" -ForegroundColor Green
        }
        # Show first 3 products
        $response.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "    - $($_.name) ($($_.category)) - Rs.$($_.unit_price)" -ForegroundColor Gray
        }
        $passedTests++
    } else {
        Write-Host "  FAIL: Failed to get products" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 4: Get All Contacts (Expected: 4 contacts - 2 customers, 2 vendors)
# ============================================================================
Write-Host "`nTest 4: Get All Contacts..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/contacts" -Method Get -Headers $adminHeaders
    
    if ($response.success -eq $true) {
        $count = $response.data.Count
        Write-Host "  PASS: Retrieved $count contacts" -ForegroundColor Green
        
        # Count by type
        $customers = ($response.data | Where-Object { $_.type -eq 'customer' }).Count
        $vendors = ($response.data | Where-Object { $_.type -eq 'vendor' }).Count
        
        Write-Host "    Customers: $customers" -ForegroundColor Gray
        Write-Host "    Vendors: $vendors" -ForegroundColor Gray
        
        if ($customers -eq 2 -and $vendors -eq 2) {
            Write-Host "    Expected 2 customers and 2 vendors - VERIFIED!" -ForegroundColor Green
        }
        $passedTests++
    } else {
        Write-Host "  FAIL: Failed to get contacts" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 5: Filter Contacts by Type - Customers Only
# ============================================================================
Write-Host "`nTest 5: Filter Contacts - Customers Only..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/contacts?type=customer" -Method Get -Headers $adminHeaders
    
    if ($response.success -eq $true) {
        $count = $response.data.Count
        Write-Host "  PASS: Retrieved $count customers" -ForegroundColor Green
        $response.data | ForEach-Object {
            Write-Host "    - $($_.name) ($($_.email))" -ForegroundColor Gray
        }
        $passedTests++
    } else {
        Write-Host "  FAIL: Failed to filter customers" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 6: Filter Contacts by Type - Vendors Only
# ============================================================================
Write-Host "`nTest 6: Filter Contacts - Vendors Only..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/contacts?type=vendor" -Method Get -Headers $adminHeaders
    
    if ($response.success -eq $true) {
        $count = $response.data.Count
        Write-Host "  PASS: Retrieved $count vendors" -ForegroundColor Green
        $response.data | ForEach-Object {
            Write-Host "    - $($_.name) ($($_.email))" -ForegroundColor Gray
        }
        $passedTests++
    } else {
        Write-Host "  FAIL: Failed to filter vendors" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 7: Get All Budgets (Expected: 5 budgets - 3 income, 2 expense)
# ============================================================================
Write-Host "`nTest 7: Get All Budgets..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/budgets" -Method Get -Headers $adminHeaders
    
    if ($response.success -eq $true) {
        $count = $response.data.Count
        Write-Host "  PASS: Retrieved $count budgets" -ForegroundColor Green
        
        # Count by type
        $income = ($response.data | Where-Object { $_.type -eq 'income' }).Count
        $expense = ($response.data | Where-Object { $_.type -eq 'expense' }).Count
        
        Write-Host "    Income Budgets: $income" -ForegroundColor Gray
        Write-Host "    Expense Budgets: $expense" -ForegroundColor Gray
        
        # Show first budget details
        $firstBudget = $response.data | Select-Object -First 1
        Write-Host "    Sample: $($firstBudget.event_name) - Rs.$($firstBudget.budgeted_amount)" -ForegroundColor Gray
        
        $passedTests++
    } else {
        Write-Host "  FAIL: Failed to get budgets" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 8: Get Transactions (Expected: 3 invoices + 2 bills = 5 total)
# ============================================================================
Write-Host "`nTest 8: Get All Transactions..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/transactions" -Method Get -Headers $adminHeaders
    
    if ($response.success -eq $true) {
        $count = $response.data.Count
        Write-Host "  PASS: Retrieved $count transactions" -ForegroundColor Green
        
        # Count by type
        $invoices = ($response.data | Where-Object { $_.transaction_type -eq 'invoice' }).Count
        $bills = ($response.data | Where-Object { $_.transaction_type -eq 'bill' }).Count
        
        Write-Host "    Invoices: $invoices" -ForegroundColor Gray
        Write-Host "    Bills: $bills" -ForegroundColor Gray
        
        # Calculate totals
        $totalAmount = ($response.data | Measure-Object -Property total_amount -Sum).Sum
        Write-Host "    Total Amount: Rs.$totalAmount" -ForegroundColor Gray
        
        $passedTests++
    } else {
        Write-Host "  FAIL: Failed to get transactions" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 9: Get All Payments (Expected: 3 payments)
# ============================================================================
Write-Host "`nTest 9: Get All Payments..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/payments" -Method Get -Headers $adminHeaders
    
    if ($response.success -eq $true) {
        $count = $response.data.Count
        Write-Host "  PASS: Retrieved $count payments" -ForegroundColor Green
        
        # Calculate total payments
        $totalPaid = ($response.data | Measure-Object -Property amount_paid -Sum).Sum
        Write-Host "    Total Paid: Rs.$totalPaid" -ForegroundColor Gray
        
        # Show payment modes
        $modes = $response.data | Group-Object -Property payment_mode
        $modes | ForEach-Object {
            Write-Host "    $($_.Name): $($_.Count) payment(s)" -ForegroundColor Gray
        }
        
        $passedTests++
    } else {
        Write-Host "  FAIL: Failed to get payments" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 10: Get Dashboard Summary
# ============================================================================
Write-Host "`nTest 10: Get Dashboard Summary..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/summary" -Method Get -Headers $adminHeaders
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Dashboard summary retrieved" -ForegroundColor Green
        Write-Host "    Budgets: $($response.data.budgets.total)" -ForegroundColor Gray
        Write-Host "    Invoices: $($response.data.invoices.total)" -ForegroundColor Gray
        Write-Host "    Bills: $($response.data.bills.total)" -ForegroundColor Gray
        Write-Host "    Payments: $($response.data.payments.total)" -ForegroundColor Gray
        Write-Host "    Total Budget Amount: Rs.$($response.data.budgets.total_amount)" -ForegroundColor Gray
        Write-Host "    Total Payments: Rs.$($response.data.payments.total_amount)" -ForegroundColor Gray
        $passedTests++
    } else {
        Write-Host "  FAIL: Failed to get dashboard summary" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 11: Get Budget vs Actual Report
# ============================================================================
Write-Host "`nTest 11: Get Budget vs Actual Report..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/budget-vs-actual" -Method Get -Headers $adminHeaders
    
    if ($response.success -eq $true) {
        $count = $response.data.Count
        Write-Host "  PASS: Retrieved $count budget comparison records" -ForegroundColor Green
        
        # Show first record
        if ($count -gt 0) {
            $first = $response.data | Select-Object -First 1
            Write-Host "    Sample: $($first.event_name)" -ForegroundColor Gray
            Write-Host "      Budgeted: Rs.$($first.budgeted_amount)" -ForegroundColor Gray
            Write-Host "      Achieved: Rs.$($first.achieved_amount)" -ForegroundColor Gray
            Write-Host "      Achievement: $($first.percentage_achieved)%" -ForegroundColor Gray
        }
        $passedTests++
    } else {
        Write-Host "  FAIL: Failed to get budget vs actual" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 12: Search Products by Name
# ============================================================================
Write-Host "`nTest 12: Search Products (keyword: 'Wood')..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products?search=Wood" -Method Get -Headers $adminHeaders
    
    if ($response.success -eq $true) {
        $count = $response.data.Count
        Write-Host "  PASS: Found $count product(s)" -ForegroundColor Green
        $response.data | ForEach-Object {
            Write-Host "    - $($_.name) - Rs.$($_.unit_price)" -ForegroundColor Gray
        }
        $passedTests++
    } else {
        Write-Host "  FAIL: Search failed" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 13: Get Current User (Verify JWT Token)
# ============================================================================
Write-Host "`nTest 13: Get Current User (JWT Verification)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $adminHeaders
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Current user retrieved" -ForegroundColor Green
        Write-Host "    Login ID: $($response.data.user.login_id)" -ForegroundColor Gray
        Write-Host "    Name: $($response.data.user.name)" -ForegroundColor Gray
        Write-Host "    Role: $($response.data.user.role)" -ForegroundColor Gray
        $passedTests++
    } else {
        Write-Host "  FAIL: Failed to get current user" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test 14: Verify Seed Data Integrity
# ============================================================================
Write-Host "`nTest 14: Verify Seed Data Integrity..." -ForegroundColor Yellow
try {
    # Get counts from all endpoints
    $products = (Invoke-RestMethod -Uri "$baseUrl/api/products" -Headers $adminHeaders).data.Count
    $contacts = (Invoke-RestMethod -Uri "$baseUrl/api/contacts" -Headers $adminHeaders).data.Count
    $budgets = (Invoke-RestMethod -Uri "$baseUrl/api/budgets" -Headers $adminHeaders).data.Count
    $transactions = (Invoke-RestMethod -Uri "$baseUrl/api/transactions" -Headers $adminHeaders).data.Count
    $payments = (Invoke-RestMethod -Uri "$baseUrl/api/payments" -Headers $adminHeaders).data.Count
    
    $allMatch = $true
    
    Write-Host "  Verifying expected counts from seed.sql:" -ForegroundColor Gray
    
    if ($products -eq 5) {
        Write-Host "    Products: $products / 5 VERIFIED" -ForegroundColor Green
    } else {
        Write-Host "    Products: $products / 5 MISMATCH" -ForegroundColor Red
        $allMatch = $false
    }
    
    if ($contacts -eq 4) {
        Write-Host "    Contacts: $contacts / 4 VERIFIED" -ForegroundColor Green
    } else {
        Write-Host "    Contacts: $contacts / 4 MISMATCH" -ForegroundColor Red
        $allMatch = $false
    }
    
    if ($budgets -eq 5) {
        Write-Host "    Budgets: $budgets / 5 VERIFIED" -ForegroundColor Green
    } else {
        Write-Host "    Budgets: $budgets / 5 MISMATCH" -ForegroundColor Red
        $allMatch = $false
    }
    
    if ($transactions -eq 5) {
        Write-Host "    Transactions: $transactions / 5 VERIFIED" -ForegroundColor Green
    } else {
        Write-Host "    Transactions: $transactions / 5 MISMATCH" -ForegroundColor Red
        $allMatch = $false
    }
    
    if ($payments -eq 3) {
        Write-Host "    Payments: $payments / 3 VERIFIED" -ForegroundColor Green
    } else {
        Write-Host "    Payments: $payments / 3 MISMATCH" -ForegroundColor Red
        $allMatch = $false
    }
    
    if ($allMatch) {
        Write-Host "  PASS: All seed data counts verified!" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "  FAIL: Some counts don't match seed data" -ForegroundColor Red
        $failedTests++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failedTests++
}

# ============================================================================
# Test Results Summary
# ============================================================================
$totalTests = $passedTests + $failedTests
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor $(if ($failedTests -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failedTests -eq 0) {
    Write-Host "ALL SEED DATA TESTS PASSED!" -ForegroundColor Green
    Write-Host "Your backend is working perfectly with the demo dataset!" -ForegroundColor Green
} else {
    Write-Host "SOME TESTS FAILED!" -ForegroundColor Red
    Write-Host "Please check the failed tests above." -ForegroundColor Red
}

Write-Host "`n============================================`n" -ForegroundColor Cyan
