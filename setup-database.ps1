#!/usr/bin/env powershell
# Database Initialization Script for Lost & Found Project
# Usage: .\setup-database.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Lost & Found - Database Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is installed
$mysqlPaths = @(
    "D:\xampp\mysql\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe"
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlExe = $path
        Write-Host "[OK] Found MySQL at: $path" -ForegroundColor Green
        break
    }
}

if (-not $mysqlExe) {
    Write-Host "[ERROR] MySQL not found! Please install MySQL Server or XAMPP." -ForegroundColor Red
    Write-Host "  Download from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Yellow
    Read-Host "Press any key to exit"
    exit 1
}

Write-Host ""
Write-Host "Checking MySQL connection..." -ForegroundColor Yellow

# Test MySQL connection
$testConn = & $mysqlExe -u root -e "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Cannot connect to MySQL!" -ForegroundColor Red
    Write-Host "  Make sure MySQL is running (Services → MySQL80 → Start)" -ForegroundColor Yellow
    Write-Host "  Error: $testConn" -ForegroundColor Red
    Read-Host "Press any key to exit"
    exit 1
}

Write-Host "[OK] MySQL is running and accessible" -ForegroundColor Green
Write-Host ""

# Check if schema file exists
$schemaFile = "database\schema.sql"
if (-not (Test-Path $schemaFile)) {
    Write-Host "[ERROR] Schema file not found: $schemaFile" -ForegroundColor Red
    Read-Host "Press any key to exit"
    exit 1
}

Write-Host "[OK] Found schema file" -ForegroundColor Green
Write-Host ""

# Drop existing database if user confirms
Write-Host "Checking for existing database..." -ForegroundColor Yellow
$dbExists = & $mysqlExe -u root -e "USE lost_found;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[!] Database 'lost_found' already exists" -ForegroundColor Yellow
    $response = Read-Host "Drop and recreate? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        & $mysqlExe -u root -e "DROP DATABASE IF EXISTS lost_found;" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to drop database" -ForegroundColor Red
            Read-Host "Press any key to exit"
            exit 1
        }
        Write-Host "[OK] Database dropped" -ForegroundColor Green
    } else {
        Write-Host "[OK] Keeping existing database" -ForegroundColor Green
        Write-Host ""
        Write-Host "Setup complete!" -ForegroundColor Green
        Read-Host "Press any key to exit"
        exit 0
    }
}

# Create database and import schema
Write-Host ""
Write-Host "Creating database and importing schema..." -ForegroundColor Yellow

$schemaContent = Get-Content $schemaFile -Raw
& $mysqlExe -u root -e $schemaContent 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to import schema" -ForegroundColor Red
    Read-Host "Press any key to exit"
    exit 1
}

Write-Host "[OK] Database created successfully" -ForegroundColor Green
Write-Host ""

# Verify tables
Write-Host "Verifying tables..." -ForegroundColor Yellow
$tables = & $mysqlExe -u root -e "USE lost_found; SHOW TABLES;" 2>&1 | Select-Object -Skip 1

$expectedTables = @("users", "categories", "items", "conversations", "messages", "favorites", "claims", "reports", "notifications")
$createdTables = @($tables | Where-Object {$_} | ForEach-Object { $_.Trim() })

Write-Host "[OK] Tables created:" -ForegroundColor Green
foreach ($table in $createdTables) {
    Write-Host "  - $table" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "[OK] Database setup complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm install" -ForegroundColor Yellow
Write-Host "2. Open two terminals:" -ForegroundColor Yellow
Write-Host "   Terminal 1: npm run backend   (Backend on port 8000)" -ForegroundColor Yellow
Write-Host "   Terminal 2: npm run dev       (Frontend on port 5173)" -ForegroundColor Yellow
Write-Host "3. Open: http://127.0.0.1:5173" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press any key to exit"
