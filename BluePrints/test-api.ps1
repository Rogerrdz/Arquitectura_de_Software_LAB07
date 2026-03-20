# PowerShell script para probar la API Blueprints
# Ejecutar: .\test-api.ps1

$BASE_URL = "http://localhost:8081/api/v1/blueprints"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Testing Blueprints API" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. GET all blueprints" -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri $BASE_URL -Method Get
$response | ConvertTo-Json -Depth 10
Write-Host ""

Write-Host "2. GET blueprints by author (john)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/john" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "3. GET specific blueprint (john/house)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/john/house" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "4. POST new blueprint (john/kitchen)" -ForegroundColor Yellow
$newBlueprint = @{
    author = "john"
    name = "kitchen"
    points = @(
        @{x = 1; y = 1},
        @{x = 2; y = 2}
    )
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $BASE_URL -Method Post -Body $newBlueprint -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Blueprint created successfully!" -ForegroundColor Green
} catch {
    Write-Host "Expected if already exists: $_" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "5. Verify the new blueprint was created" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/john/kitchen" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "6. PUT add point to blueprint (john/kitchen)" -ForegroundColor Yellow
$newPoint = @{x = 3; y = 3} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/john/kitchen/points" -Method Put -Body $newPoint -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
    Write-Host "Point added successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "7. Verify point was added" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/john/kitchen" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "8. Test error: GET non-existent blueprint" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/nonexistent/blueprint" -Method Get
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Expected 404 error: $_" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "9. Test error: POST duplicate blueprint" -ForegroundColor Yellow
$duplicateBlueprint = @{
    author = "john"
    name = "house"
    points = @(@{x = 1; y = 1})
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $BASE_URL -Method Post -Body $duplicateBlueprint -ContentType "application/json"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Expected 409 conflict error: $_" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Tests completed!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
