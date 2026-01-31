# Test Change Password Endpoint
Write-Host "Testing Change Password Functionality" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# First, login to get a token
Write-Host "Step 1: Logging in..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"login_id":"admin","password":"Admin@123"}'

if ($loginResponse.success) {
    Write-Host "✓ Login successful" -ForegroundColor Green
    $token = $loginResponse.accessToken
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "✗ Login failed" -ForegroundColor Red
    exit
}

# Test changing password
Write-Host "`nStep 2: Testing password change..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    current_password = "Admin@123"
    new_password = "Admin@1234"
} | ConvertTo-Json

try {
    $changeResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/change-password" `
        -Method Post `
        -Headers $headers `
        -Body $body

    if ($changeResponse.success) {
        Write-Host "✓ Password changed successfully!" -ForegroundColor Green
        Write-Host "Message: $($changeResponse.message)" -ForegroundColor Gray
        
        # Change it back to original
        Write-Host "`nStep 3: Changing password back to original..." -ForegroundColor Yellow
        $bodyBack = @{
            current_password = "Admin@1234"
            new_password = "Admin@123"
        } | ConvertTo-Json
        
        $changeBackResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/change-password" `
            -Method Post `
            -Headers $headers `
            -Body $bodyBack
        
        if ($changeBackResponse.success) {
            Write-Host "✓ Password restored successfully!" -ForegroundColor Green
        }
    } else {
        Write-Host "✗ Password change failed: $($changeResponse.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
