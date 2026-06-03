$phpPath = "php"
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    $commonPaths = @(
        "C:\xampp\php\php.exe",
        "D:\xampp\php\php.exe",
        "C:\php\php.exe",
        "C:\tools\php\php.exe"
    )
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $phpPath = $path
            break
        }
    }
    
    if ($phpPath -eq "php") {
        Write-Host "PHP is not available. Please install PHP 8+ or add it to PATH." -ForegroundColor Red
        exit 1
    }
    
    # Add to current session path
    $env:PATH += ";$(Split-Path $phpPath)"
}

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$PSScriptRoot`"; npm run backend"
) -WindowStyle Normal

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$PSScriptRoot`"; npm run dev -- --port 5173"
) -WindowStyle Normal

Write-Host "Frontend: http://127.0.0.1:5173"
Write-Host "Backend API: http://127.0.0.1:8000/api"
