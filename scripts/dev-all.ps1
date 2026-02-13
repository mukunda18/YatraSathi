Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $rootDir "backend"

Write-Host "Starting Go backend in dev mode..."
$backendProcess = Start-Process -FilePath "go" -ArgumentList "run", "." -WorkingDirectory $backendDir -PassThru -NoNewWindow

try {
    Write-Host "Starting Next.js dev server..."
    npm run dev
    exit $LASTEXITCODE
}
finally {
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Write-Host "Stopping Go backend dev process..."
        Stop-Process -Id $backendProcess.Id -Force
    }
}
