# Authentication API Test Guide

## Server Running at: http://localhost:5000

---

## 1. Register New User

**POST** `http://localhost:5000/api/auth/register`

**Body (JSON):**
```json
{
  "login_id": "test_user",
  "email": "test@example.com",
  "password": "Test@1234",
  "name": "Test User"
}
```

**PowerShell Command:**
```powershell
$body = @{
    login_id = "test_user"
    email = "test@example.com"
    password = "Test@1234"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

---

## 2. Login User

**POST** `http://localhost:5000/api/auth/login`

**Body (JSON):**
```json
{
  "login_id": "test_user",
  "password": "Test@1234"
}
```

**PowerShell Command:**
```powershell
$body = @{
    login_id = "test_user"
    password = "Test@1234"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.accessToken
Write-Host "Access Token: $token"
```

---

## 3. Get Current User (Protected Route)

**GET** `http://localhost:5000/api/auth/me`

**Headers:**
```
Authorization: Bearer {your_token_here}
```

**PowerShell Command:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method Get -Headers $headers
```

---

## 4. Forgot Password

**POST** `http://localhost:5000/api/auth/forgot-password`

**Body (JSON):**
```json
{
  "email": "test@example.com"
}
```

**PowerShell Command:**
```powershell
$body = @{
    email = "test@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/forgot-password" -Method Post -Body $body -ContentType "application/json"
```

---

## 5. Reset Password

**POST** `http://localhost:5000/api/auth/reset-password`

**Body (JSON):**
```json
{
  "token": "your_reset_token_from_forgot_password",
  "new_password": "NewPass@1234"
}
```

**PowerShell Command:**
```powershell
$body = @{
    token = "your_reset_token_here"
    new_password = "NewPass@1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/reset-password" -Method Post -Body $body -ContentType "application/json"
```

---

## 6. Refresh Token

**POST** `http://localhost:5000/api/auth/refresh-token`

**Body (JSON):**
```json
{
  "refreshToken": "your_refresh_token_here"
}
```

**PowerShell Command:**
```powershell
$body = @{
    refreshToken = "your_refresh_token_here"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/refresh-token" -Method Post -Body $body -ContentType "application/json"
```

---

## 7. Logout

**POST** `http://localhost:5000/api/auth/logout`

**Headers:**
```
Authorization: Bearer {your_token_here}
```

**PowerShell Command:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/logout" -Method Post -Headers $headers
```

---

## Quick Test Script (Run All at Once)

```powershell
# 1. Register
Write-Host "`n=== REGISTERING USER ===" -ForegroundColor Cyan
$registerBody = @{
    login_id = "demo_user"
    email = "demo@example.com"
    password = "Demo@1234"
    name = "Demo User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    $registerResponse | ConvertTo-Json
} catch {
    Write-Host "⚠️ User might already exist" -ForegroundColor Yellow
}

# 2. Login
Write-Host "`n=== LOGGING IN ===" -ForegroundColor Cyan
$loginBody = @{
    login_id = "demo_user"
    password = "Demo@1234"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.accessToken
Write-Host "✅ Login successful!" -ForegroundColor Green
Write-Host "Access Token: $token`n"

# 3. Get Current User
Write-Host "`n=== GETTING CURRENT USER ===" -ForegroundColor Cyan
$headers = @{
    Authorization = "Bearer $token"
}

$userResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method Get -Headers $headers
Write-Host "✅ User info retrieved!" -ForegroundColor Green
$userResponse | ConvertTo-Json

Write-Host "`n✨ All authentication tests passed!" -ForegroundColor Green
```
