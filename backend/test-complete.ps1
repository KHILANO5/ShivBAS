# ============================================================================
# Complete End-to-End Test Script for ShivBAS Backend
# Tests all API endpoints from database to API layer
# ============================================================================

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         ShivBAS Backend - Complete E2E Test Suite         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$testsPassed = 0
$testsFailed = 0
$timestamp = Get-Date -Format "HHmmss"

# ============================================================================
# Test 1: Health Check
# ============================================================================
Write-Host "Test 1: Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    if ($response.success -eq $true) {
        Write-Host "  PASS: Server is healthy" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL: Unexpected response" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# Test 2: User Registration
# ============================================================================
Write-Host "`nTest 2: User Registration..." -ForegroundColor Yellow
try {
    $registerData = @{
        login_id = "test$timestamp"
        email = "test$timestamp@test.com"
        password = "Test@1234"
        name = "Test User $timestamp"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post `
        -Body $registerData -ContentType "application/json"
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: User registered (ID: $($response.data.user_id))" -ForegroundColor Green
        $testsPassed++
        $userId = $response.data.user_id
    } else {
        Write-Host "  FAIL: Registration failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# Test 3: User Login
# ============================================================================
Write-Host "`nTest 3: User Login..." -ForegroundColor Yellow
try {
    $loginData = @{
        login_id = "test$timestamp"
        password = "Test@1234"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post `
        -Body $loginData -ContentType "application/json"
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Login successful" -ForegroundColor Green
        $testsPassed++
        $token = $response.data.accessToken
        $headers = @{ Authorization = "Bearer $token" }
    } else {
        Write-Host "  FAIL: Login failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# Test 4: Get Current User
# ============================================================================
Write-Host "`nTest 4: Get Current User..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
    
    if ($response.success -eq $true -and $response.data.login_id -eq "test$timestamp") {
        Write-Host "  PASS: Retrieved user ($($response.data.name))" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL: User data incorrect" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# Test 5: Get Products
# ============================================================================
Write-Host "`nTest 5: Get Products..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get -Headers $headers
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Retrieved $($response.data.Count) products" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL: Failed to get products" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# Test 6: Get Contacts
# ============================================================================
Write-Host "`nTest 6: Get Contacts..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/contacts" -Method Get -Headers $headers
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Retrieved $($response.data.Count) contacts" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL: Failed to get contacts" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# Test 7: Get Partners
# ============================================================================
Write-Host "`nTest 7: Get Partners..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/partners" -Method Get -Headers $headers
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Retrieved $($response.data.Count) partners" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL: Failed to get partners" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# Test 8: Get Budgets
# ============================================================================
Write-Host "`nTest 8: Get Budgets..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/budgets" -Method Get -Headers $headers
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Retrieved $($response.data.Count) budgets" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL: Failed to get budgets" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# Test 9: Get Transactions
# ============================================================================
Write-Host "`nTest 9: Get Transactions..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/transactions" -Method Get -Headers $headers
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Retrieved $($response.data.Count) transactions" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL: Failed to get transactions" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# Test 10: Get Payments History
# ============================================================================
Write-Host "`nTest 10: Get Payments..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/payments" -Method Get -Headers $headers
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Retrieved $($response.data.Count) payments" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL: Failed to get payments" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# Test 11: Dashboard Summary
# ============================================================================
Write-Host "`nTest 11: Dashboard Summary..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/summary" -Method Get -Headers $headers
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Dashboard data retrieved" -ForegroundColor Green
        Write-Host "    - Budgets: $($response.data.budgets.total)" -ForegroundColor Gray
        Write-Host "    - Invoices: $($response.data.invoices.total)" -ForegroundColor Gray
        Write-Host "    - Bills: $($response.data.bills.total)" -ForegroundColor Gray
        Write-Host "    - Payments: $($response.data.payments.total)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "  FAIL: Failed to get dashboard summary" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# Test 12: Budget vs Actual Report
# ============================================================================
Write-Host "`nTest 12: Budget vs Actual Report..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/budget-vs-actual" -Method Get -Headers $headers
    
    if ($response.success -eq $true) {
        Write-Host "  PASS: Budget vs Actual data retrieved" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "  FAIL: Failed to get budget vs actual" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "  FAIL: $_.Exception.Message" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# Test Results Summary
# ============================================================================
$totalTests = $testsPassed + $testsFailed
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    Test Results Summary                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "  Total Tests: $totalTests" -ForegroundColor White
Write-Host "  Passed:      $testsPassed" -ForegroundColor Green
Write-Host "  Failed:      $testsFailed" -ForegroundColor $(if ($testsFailed -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "SOME TESTS FAILED!" -ForegroundColor Red
}

Write-Host ""
