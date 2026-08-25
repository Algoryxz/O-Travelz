# O-Travelz Development Stack Stop Script
# Stops the local FastAPI backend, Vite frontend dev server, and Docker PostGIS container.

[CmdletBinding()]
param(
    [switch]$KeepDatabase
)

$ErrorActionPreference = "SilentlyContinue"
$RepoRoot = $PSScriptRoot

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "=== O-TRAVELZ -- STOPPING LOCAL DEVELOPMENT STACK ===" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# -------------------------------------------------------------------------
# 1. Stop Processes from PID File if available
# -------------------------------------------------------------------------
$pidFile = Join-Path $RepoRoot ".stack_pids.json"
if (Test-Path $pidFile) {
    try {
        $raw = Get-Content $pidFile -Raw
        $pids = $raw | ConvertFrom-Json

        if ($pids.frontend_pid) {
            Write-Host "  Stopping Vite Frontend (PID $($pids.frontend_pid))..." -ForegroundColor Gray
            & taskkill /PID $pids.frontend_pid /T /F 2>&1 | Out-Null
        }
        if ($pids.backend_pid) {
            Write-Host "  Stopping FastAPI Backend (PID $($pids.backend_pid))..." -ForegroundColor Gray
            & taskkill /PID $pids.backend_pid /T /F 2>&1 | Out-Null
        }
        Remove-Item -Path $pidFile -Force -ErrorAction SilentlyContinue
    } catch {}
}

# -------------------------------------------------------------------------
# 2. Check for leftover processes on port 8000 and 5173
# -------------------------------------------------------------------------
Write-Host "  Checking active ports..." -ForegroundColor Gray

# Port 8000 (FastAPI)
try {
    $conns8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
    foreach ($conn in $conns8000) {
        $p = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($p -and ($p.ProcessName -match "python" -or $p.ProcessName -match "uvicorn")) {
            Write-Host "  Stopping backend process on port 8000 (PID $($p.Id))..." -ForegroundColor Gray
            Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        }
    }
} catch {}

# Port 5173 (Vite Frontend)
try {
    $conns5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
    foreach ($conn in $conns5173) {
        $p = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        if ($p -and ($p.ProcessName -match "node" -or $p.ProcessName -match "cmd")) {
            Write-Host "  Stopping frontend process on port 5173 (PID $($p.Id))..." -ForegroundColor Gray
            & taskkill /PID $p.Id /T /F 2>&1 | Out-Null
        }
    }
} catch {}

# -------------------------------------------------------------------------
# 3. Stop Docker Database Container
# -------------------------------------------------------------------------
if (-not $KeepDatabase) {
    Write-Host "  Stopping Docker PostGIS container..." -ForegroundColor Gray
    $ComposeFile = Join-Path $RepoRoot "infra\docker-compose.yml"
    if (Test-Path $ComposeFile) {
        & docker compose -f $ComposeFile -p infra stop db 2>&1 | Out-Null
        Write-Host "  [OK] Docker PostGIS container stopped." -ForegroundColor Green
    }
} else {
    Write-Host "  [INFO] Keeping Docker database running (-KeepDatabase flag)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host ">>> O-TRAVELZ LOCAL STACK STOPPED SUCCESSFULLY <<<" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host ""
