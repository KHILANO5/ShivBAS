# ============================================================================
# ShivBAS Backend End-to-End Test Script
# Tests all APIs from Database to API Layer
# ============================================================================

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        ShivBAS Backend End-to-End Testing                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$testsPassed = 0
$testsFailed = 0

# ============================================================================
# TEST 1: Health Check
# ============================================================================
Write-Host "TEST 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    if ($health.success -eq $true) {
        Write-Host "✅ PASSED: Server is running" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "❌ FAILED: Server health check failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: Cannot connect to server - $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
    exit
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 2: User Registration
# ============================================================================
Write-Host "`nTEST 2: User Registration" -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerBody = @{
    login_id = "test_$timestamp"
    email = "test_$timestamp@example.com"
    password = "Test@1234"
    name = "Test User $timestamp"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    if ($registerResponse.success -eq $true) {
        Write-Host "✅ PASSED: User registered successfully" -ForegroundColor Green
        Write-Host "   User ID: $($registerResponse.data.user_id)" -ForegroundColor Gray
        $testsPassed++
        $userId = $registerResponse.data.user_id
    } else {
        Write-Host "❌ FAILED: Registration failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 3: User Login
# ============================================================================
Write-Host "`nTEST 3: User Login" -ForegroundColor Yellow
$loginBody = @{
    login_id = "test_$timestamp"
    password = "Test@1234"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    if ($loginResponse.success -eq $true -and $loginResponse.data.accessToken) {
        Write-Host "PASSED: Login successful" -ForegroundColor Green
        $token = $loginResponse.data.accessToken
        $tokenPreview = $token.Substring(0, [Math]::Min(20, $token.Length))
        Write-Host "   Token received: $tokenPreview..." -ForegroundColor Gray
        $testsPassed++
        $headers = @{
            Authorization = "Bearer $token"
        }
    } else {
        Write-Host "FAILED: Login failed" -ForegroundColor Red
        $testsFailed++
        exit
    }
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
    exit
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 4: Get Current User (Protected Route)
# ============================================================================
Write-Host "`nTEST 4: Get Current User - Auth Middleware" -ForegroundColor Yellow
try {
    $currentUser = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
    if ($currentUser.success -eq $true -and $currentUser.data.user.login_id -eq "test_$timestamp") {
        Write-Host "✅ PASSED: Auth middleware working" -ForegroundColor Green
        Write-Host "   User: $($currentUser.data.user.name)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ FAILED: Current user check failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 5: Get Products (Master Data)
# ============================================================================
Write-Host "`nTEST 5: Get Products (Master Data API)" -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Get -Headers $headers
    if ($products.success -eq $true) {
        Write-Host "✅ PASSED: Products fetched successfully" -ForegroundColor Green
        Write-Host "   Total products: $($products.data.Count)" -ForegroundColor Gray
        $testsPassed++
        if ($products.data.Count -gt 0) {
            $productId = $products.data[0].product_id
        }
    } else {
        Write-Host "❌ FAILED: Products fetch failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 6: Get Contacts (Master Data)
# ============================================================================
Write-Host "`nTEST 6: Get Contacts (Master Data API)" -ForegroundColor Yellow
try {
    $contacts = Invoke-RestMethod -Uri "$baseUrl/api/contacts" -Method Get -Headers $headers
    if ($contacts.success -eq $true) {
        Write-Host "✅ PASSED: Contacts fetched successfully" -ForegroundColor Green
        Write-Host "   Total contacts: $($contacts.data.Count)" -ForegroundColor Gray
        $testsPassed++
        if ($contacts.data.Count -gt 0) {
            $contactId = $contacts.data[0].contact_id
        }
    } else {
        Write-Host "❌ FAILED: Contacts fetch failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 7: Get Analytics Codes
# ============================================================================
Write-Host "`nTEST 7: Get Analytics Codes" -ForegroundColor Yellow
try {
    $analytics = Invoke-RestMethod -Uri "$baseUrl/api/analytics" -Method Get -Headers $headers
    if ($analytics.success -eq $true) {
        Write-Host "✅ PASSED: Analytics codes fetched successfully" -ForegroundColor Green
        Write-Host "   Total analytics codes: $($analytics.data.Count)" -ForegroundColor Gray
        $testsPassed++
        if ($analytics.data.Count -gt 0) {
            $analyticsId = $analytics.data[0].analytics_id
        }
    } else {
        Write-Host "❌ FAILED: Analytics codes fetch failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 8: Get Budgets
# ============================================================================
Write-Host "`nTEST 8: Get Budgets (Budgets API)" -ForegroundColor Yellow
try {
    $budgets = Invoke-RestMethod -Uri "$baseUrl/api/budgets" -Method Get -Headers $headers
    if ($budgets.success -eq $true) {
        Write-Host "✅ PASSED: Budgets fetched successfully" -ForegroundColor Green
        Write-Host "   Total budgets: $($budgets.data.Count)" -ForegroundColor Gray
        $testsPassed++
        if ($budgets.data.Count -gt 0) {
            $budgetId = $budgets.data[0].budget_id
        }
    } else {
        Write-Host "❌ FAILED: Budgets fetch failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 9: Get Transactions
# ============================================================================
Write-Host "`nTEST 9: Get Transactions (Transactions API)" -ForegroundColor Yellow
try {
    $transactions = Invoke-RestMethod -Uri "$baseUrl/api/transactions" -Method Get -Headers $headers
    if ($transactions.success -eq $true) {
        Write-Host "✅ PASSED: Transactions fetched successfully" -ForegroundColor Green
        Write-Host "   Total transactions: $($transactions.data.Count)" -ForegroundColor Gray
        $testsPassed++
        if ($transactions.data.Count -gt 0) {
            $transactionId = $transactions.data[0].transaction_id
        }
    } else {
        Write-Host "❌ FAILED: Transactions fetch failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 10: Get Payments
# ============================================================================
Write-Host "`nTEST 10: Get Payments (Payments API)" -ForegroundColor Yellow
try {
    $payments = Invoke-RestMethod -Uri "$baseUrl/api/payments" -Method Get -Headers $headers
    if ($payments.success -eq $true) {
        Write-Host "✅ PASSED: Payments fetched successfully" -ForegroundColor Green
        Write-Host "   Total payments: $($payments.data.Count)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ FAILED: Payments fetch failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 11: Get Dashboard Summary
# ============================================================================
Write-Host "`nTEST 11: Get Dashboard Summary" -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/summary" -Method Get -Headers $headers
    if ($dashboard.success -eq $true) {
        Write-Host "✅ PASSED: Dashboard summary fetched successfully" -ForegroundColor Green
        Write-Host "   Total Budgets: $($dashboard.data.budgets.total)" -ForegroundColor Gray
        Write-Host "   Total Invoices: $($dashboard.data.invoices.total)" -ForegroundColor Gray
        Write-Host "   Total Bills: $($dashboard.data.bills.total)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ FAILED: Dashboard summary fetch failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 12: Get Budget vs Actual
# ============================================================================
Write-Host "`nTEST 12: Get Budget vs Actual" -ForegroundColor Yellow
try {
    $budgetVsActual = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/budget-vs-actual" -Method Get -Headers $headers
    if ($budgetVsActual.success -eq $true) {
        Write-Host "✅ PASSED: Budget vs Actual fetched successfully" -ForegroundColor Green
        Write-Host "   Analytics tracked: $($budgetVsActual.data.Count)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ FAILED: Budget vs Actual fetch failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 13: Get Budget Alerts
# ============================================================================
Write-Host "`nTEST 13: Get Budget Alerts" -ForegroundColor Yellow
try {
    $alerts = Invoke-RestMethod -Uri "$baseUrl/api/budgets/alerts" -Method Get -Headers $headers
    if ($alerts.success -eq $true) {
        Write-Host "✅ PASSED: Budget alerts fetched successfully" -ForegroundColor Green
        Write-Host "   Active alerts: $($alerts.data.Count)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ FAILED: Budget alerts fetch failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 14: Get Transaction Report
# ============================================================================
Write-Host "`nTEST 14: Get Transaction Report" -ForegroundColor Yellow
try {
    $report = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/transaction-report?group_by=month" -Method Get -Headers $headers
    if ($report.success -eq $true) {
        Write-Host "✅ PASSED: Transaction report fetched successfully" -ForegroundColor Green
        Write-Host "   Periods in report: $($report.data.Count)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ FAILED: Transaction report fetch failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Start-Sleep -Milliseconds 500

# ============================================================================
# TEST 15: Get Payment Status
# ============================================================================
Write-Host "`nTEST 15: Get Payment Status" -ForegroundColor Yellow
try {
    $paymentStatus = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/payment-status" -Method Get -Headers $headers
    if ($paymentStatus.success -eq $true) {
        Write-Host "✅ PASSED: Payment status fetched successfully" -ForegroundColor Green
        Write-Host "   Unpaid transactions: $($paymentStatus.data.Count)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ FAILED: Payment status fetch failed" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

# ============================================================================
# FINAL RESULTS
# ============================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                     TEST RESULTS                               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$totalTests = $testsPassed + $testsFailed
Write-Host "`nTotal Tests: $totalTests" -ForegroundColor White
Write-Host "✅ Passed: $testsPassed" -ForegroundColor Green
Write-Host "❌ Failed: $testsFailed" -ForegroundColor Red

if ($testsFailed -eq 0) {
    Write-Host "`nALL TESTS PASSED! Backend is fully operational!" -ForegroundColor Green
    Write-Host "Database connectivity: Working" -ForegroundColor Green
    Write-Host "Authentication system: Working" -ForegroundColor Green
    Write-Host "All API endpoints: Working" -ForegroundColor Green
    Write-Host "End-to-End flow: Working" -ForegroundColor Green
} else {
    if ($totalTests -gt 0) {
        $successRate = [math]::Round(($testsPassed / $totalTests) * 100, 2)
        Write-Host "`nSome tests failed. Success rate: $successRate%" -ForegroundColor Yellow
    } else {
        Write-Host "`nNo tests completed" -ForegroundColor Red
    }
}

Write-Host "`n" 
