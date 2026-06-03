# start-full-project.ps1
Write-Host "--- Launching Lost & Found Full Stack Platform ---" -ForegroundColor Cyan

# 1. Clean up port 8000
Write-Host "[1/4] Cleaning up port 8000..."
Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -ErrorAction SilentlyContinue

# 2. Start Proxy Server
Write-Host "[2/4] Starting Proxy Server on port 8000..."
Start-Process node -ArgumentList "dev-server.js" -NoNewWindow

# 3. Start MERN Backend
Write-Host "[3/4] Starting Node.js Backend on port 5000..."
# We run migration automatically inside backend/src/config/db.js
Set-Location .\backend
Start-Process npm -ArgumentList "start" -NoNewWindow
Set-Location ..

# 4. Start React Frontend
Write-Host "[4/4] Starting React Frontend on port 3000..."
Set-Location .\frontend
npm run dev
