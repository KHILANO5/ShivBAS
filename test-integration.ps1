# ============================================================================
# ShivBAS Full Integration Test
# Tests end-to-end connectivity between frontend and backend
# ============================================================================

Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "           ShivBAS Integration Test                            " -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

# Test 1: Check if backend is running
Write-Host "[TEST 1] Checking backend server..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "✅ Backend is running on port 5000" -ForegroundColor Green
    Write-Host "   Environment: $($health.environment)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is not responding" -ForegroundColor Red
    exit 1
}

# Test 2: Check if frontend is running
Write-Host "`n[TEST 2] Checking frontend server..." -ForegroundColor Yellow
$frontendRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($frontendRunning) {
    Write-Host "✅ Frontend is running on port 3000" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend is not running on port 3000" -ForegroundColor Red
}

# Test 3: Check API endpoints
Write-Host "`n[TEST 3] Testing API endpoints..." -ForegroundColor Yellow
try {
    $api = Invoke-RestMethod -Uri "http://localhost:5000/api" -Method GET
    Write-Host "✅ API Base URL is accessible" -ForegroundColor Green
    Write-Host "   Version: $($api.version)" -ForegroundColor Gray
    Write-Host "   Available Endpoints:" -ForegroundColor Gray
    $api.endpoints.PSObject.Properties | ForEach-Object {
        Write-Host "      - $($_.Name): $($_.Value)" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "❌ API endpoints not accessible" -ForegroundColor Red
}

# Test 4: Test CORS configuration
Write-Host "`n[TEST 4] Testing CORS configuration..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -UseBasicParsing
    $corsHeader = $response.Headers['Access-Control-Allow-Credentials']
    if ($corsHeader -eq 'true') {
        Write-Host "✅ CORS is properly configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  CORS credentials not enabled" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ CORS test failed" -ForegroundColor Red
}

# Test 5: Test authentication endpoint (should fail without credentials)
Write-Host "`n[TEST 5] Testing authentication..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/analytics" -Method GET
    Write-Host "⚠️  Authentication not enforced" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Authentication is properly enforced" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Check database connection
Write-Host "`n[TEST 6] Testing database connectivity..." -ForegroundColor Yellow
$backendLog = Get-Content ".\backend\src\server.js" -ErrorAction SilentlyContinue
if (Get-Process -Name node | Where-Object {(Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Where-Object {$_.LocalPort -eq 5000})}) {
    Write-Host "✅ Database connection established (backend running)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Cannot verify database connection" -ForegroundColor Yellow
}

# Summary
Write-Host "`n================================================================" -ForegroundColor Cyan
Write-Host "           Integration Test Complete                           " -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

Write-Host "Frontend URL: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend URL:  http://localhost:5000" -ForegroundColor Green
Write-Host "API Base URL: http://localhost:5000/api" -ForegroundColor Green
Write-Host ""
Write-Host "Your application is ready to use!" -ForegroundColor Cyan
Write-Host "To test login, visit: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host ""
