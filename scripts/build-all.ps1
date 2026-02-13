Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Building Go backend executable..."
& (Join-Path $PSScriptRoot "build-backend.ps1")

Write-Host "Building Next.js app..."
npm run build
exit $LASTEXITCODE
