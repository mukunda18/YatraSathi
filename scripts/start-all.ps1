Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
$backendExe = Join-Path $rootDir "backend\\yatra-backend.exe"

if (-not (Test-Path $backendExe)) {
    Write-Error "Backend executable not found at $backendExe. Run npm run build:all first."
    exit 1
}

Write-Host "Starting Go backend executable..."
$backendProcess = Start-Process -FilePath $backendExe -WorkingDirectory $rootDir -PassThru -NoNewWindow

try {
    Write-Host "Starting Next.js production server..."
    npm run start
    exit $LASTEXITCODE
}
finally {
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Write-Host "Stopping Go backend executable..."
        Stop-Process -Id $backendProcess.Id -Force
    }
}
