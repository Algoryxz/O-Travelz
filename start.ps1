# O-Travelz Development Stack Startup Script
# Validates environment, ensures Docker PostGIS is ready, starts FastAPI and Vite,
# avoids duplicate processes, and handles graceful shutdown on Ctrl+C.

[CmdletBinding()]
param(
    [switch]$NoWait
)

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "=== O-TRAVELZ -- LOCAL DEVELOPMENT STACK START ===" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Repository root: $RepoRoot" -ForegroundColor Gray
Write-Host ""

# -------------------------------------------------------------------------
# Step 1: Pre-flight Verification
# -------------------------------------------------------------------------
$VenvDir = Join-Path $RepoRoot ".venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
    $VenvPythonUnix = Join-Path $VenvDir "bin\python"
    if (Test-Path $VenvPythonUnix) {
        $VenvPython = $VenvPythonUnix
    } else {
        Write-Host "[FAIL] Python virtualenv (.venv) not found." -ForegroundColor Red
        Write-Host "       Please run .\setup.ps1 first." -ForegroundColor Yellow
        exit 1
    }
}

$FrontendModules = Join-Path $RepoRoot "frontend\node_modules"
if (-not (Test-Path $FrontendModules)) {
    Write-Host "[FAIL] frontend\node_modules not found." -ForegroundColor Red
    Write-Host "       Please run .\setup.ps1 first." -ForegroundColor Yellow
    exit 1
}

$EnvFile = Join-Path $RepoRoot ".env"
if (-not (Test-Path $EnvFile)) {
    $EnvExample = Join-Path $RepoRoot ".env.example"
    if (Test-Path $EnvExample) {
        Copy-Item -Path $EnvExample -Destination $EnvFile
        Write-Host "[INFO] Created .env from .env.example" -ForegroundColor Green
    }
}

# -------------------------------------------------------------------------
# Step 2: Database Container (PostgreSQL / PostGIS on 5433)
# -------------------------------------------------------------------------
Write-Host "[1/3] Checking PostgreSQL / PostGIS container..." -ForegroundColor Yellow
$ComposeFile = Join-Path $RepoRoot "infra\docker-compose.yml"

$testDbScript = @"
import sys, psycopg2, os
db_url = os.environ.get('DATABASE_URL', 'postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz')
try:
    conn = psycopg2.connect(db_url, connect_timeout=2)
    conn.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
"@

$dbHealthy = $false
$env:DATABASE_URL = "postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz"
$res = & $VenvPython -c $testDbScript 2>&1
if ($LASTEXITCODE -eq 0) {
    $dbHealthy = $true
    Write-Host "  [OK] PostgreSQL / PostGIS is already running on port 5433." -ForegroundColor Green
} else {
    Write-Host "  Starting PostGIS container via Docker Compose..." -ForegroundColor Gray
    & docker compose -f $ComposeFile -p infra up -d db
    if ($LASTEXITCODE -ne 0) {
        & docker start infra-db-1 2>&1 | Out-Null
    }

    Write-Host "  Waiting for database readiness..." -ForegroundColor Gray
    $attempt = 0
    while ($attempt -lt 25) {
        $attempt++
        Start-Sleep -Seconds 1
        $res = & $VenvPython -c $testDbScript 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dbHealthy = $true
            Write-Host "  [OK] PostgreSQL / PostGIS is ready on port 5433." -ForegroundColor Green
            break
        }
    }
}

if (-not $dbHealthy) {
    Write-Host "  [FAIL] Database failed to become ready on port 5433." -ForegroundColor Red
    Write-Host "         Please check Docker Desktop status and 'docker logs infra-db-1'." -ForegroundColor Yellow
    exit 1
}

# -------------------------------------------------------------------------
# Step 3: FastAPI Backend (Port 8000)
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "[2/3] Checking FastAPI Backend (http://127.0.0.1:8000)..." -ForegroundColor Yellow

$backendStartedByUs = $false
$backendProc = $null

$isBackendRunning = $false
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
    if ($health.status -eq "ok") {
        $isBackendRunning = $true
    }
} catch {}

if ($isBackendRunning) {
    Write-Host "  [OK] FastAPI Backend is already running on http://127.0.0.1:8000 (reusing)." -ForegroundColor Green
} else {
    Write-Host "  Starting FastAPI backend server..." -ForegroundColor Gray

    $backendEnv = @{
        "PYTHONPATH" = (Join-Path $RepoRoot "backend")
        "DATABASE_URL" = "postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz"
    }

    $backendProc = Start-Process -FilePath $VenvPython `
        -ArgumentList "-m", "uvicorn", "app.main:app", "--app-dir", "backend", "--host", "127.0.0.1", "--port", "8000" `
        -WorkingDirectory $RepoRoot `
        -Environment $backendEnv `
        -PassThru

    $backendStartedByUs = $true

    # Wait for /health
    $backendReady = $false
    $attempt = 0
    while ($attempt -lt 20) {
        $attempt++
        Start-Sleep -Milliseconds 800
        try {
            $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
            if ($health.status -eq "ok") {
                $backendReady = $true
                Write-Host "  [OK] FastAPI Backend is healthy: http://127.0.0.1:8000/health" -ForegroundColor Green
                break
            }
        } catch {}
    }

    if (-not $backendReady) {
        Write-Host "  [FAIL] FastAPI Backend failed to respond on http://127.0.0.1:8000/health." -ForegroundColor Red
        if ($backendProc -and -not $backendProc.HasExited) {
            Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
        }
        exit 1
    }
}

# -------------------------------------------------------------------------
# Step 4: Vite Frontend (Port 5173)
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "[3/3] Checking Vite Frontend (http://localhost:5173)..." -ForegroundColor Yellow

$frontendStartedByUs = $false
$frontendProc = $null

$isFrontendRunning = $false
try {
    $resp = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    if ($resp.StatusCode -eq 200) {
        $isFrontendRunning = $true
    }
} catch {}

if ($isFrontendRunning) {
    Write-Host "  [OK] Vite Frontend is already running on http://localhost:5173 (reusing)." -ForegroundColor Green
} else {
    Write-Host "  Starting Vite frontend dev server..." -ForegroundColor Gray

    $frontendDir = Join-Path $RepoRoot "frontend"

    # Use cmd.exe /c npm run dev to properly execute on Windows
    $frontendProc = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c", "npm", "run", "dev" `
        -WorkingDirectory $frontendDir `
        -PassThru

    $frontendStartedByUs = $true

    # Wait for frontend port
    $frontendReady = $false
    $attempt = 0
    while ($attempt -lt 20) {
        $attempt++
        Start-Sleep -Milliseconds 800
        try {
            $resp = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($resp.StatusCode -eq 200) {
                $frontendReady = $true
                Write-Host "  [OK] Vite Frontend is reachable: http://localhost:5173" -ForegroundColor Green
                break
            }
        } catch {}
    }

    if (-not $frontendReady) {
        Write-Host "  [FAIL] Vite Frontend did not respond on http://localhost:5173." -ForegroundColor Red
        if ($frontendProc -and -not $frontendProc.HasExited) {
            Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue
        }
        if ($backendStartedByUs -and $backendProc -and -not $backendProc.HasExited) {
            Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
        }
        exit 1
    }
}

# -------------------------------------------------------------------------
# Step 5: Save Process Tracker File
# -------------------------------------------------------------------------
$pidInfo = @{
    "backend_pid" = if ($backendStartedByUs -and $backendProc) { $backendProc.Id } else { $null }
    "frontend_pid" = if ($frontendStartedByUs -and $frontendProc) { $frontendProc.Id } else { $null }
    "started_at" = (Get-Date).ToString("o")
}
$pidFile = Join-Path $RepoRoot ".stack_pids.json"
$pidInfo | ConvertTo-Json | Set-Content -Path $pidFile

# -------------------------------------------------------------------------
# Step 6: Presentation Banner & Keep-Alive Loop
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host ">>> O-TRAVELZ LOCAL STACK IS READY <<<" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:  http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "  API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Green
Write-Host ""

if ($NoWait) {
    Write-Host "Running in background mode. Use .\stop.ps1 to stop services." -ForegroundColor Yellow
    exit 0
}

Write-Host "Press Ctrl+C to stop all services started by this script..." -ForegroundColor Gray
Write-Host ""

try {
    while ($true) {
        # Check if backend or frontend died unexpectedly
        if ($backendStartedByUs -and $backendProc -and $backendProc.HasExited) {
            Write-Host "[WARN] Backend process terminated unexpectedly." -ForegroundColor Yellow
            break
        }
        if ($frontendStartedByUs -and $frontendProc -and $frontendProc.HasExited) {
            Write-Host "[WARN] Frontend process terminated unexpectedly." -ForegroundColor Yellow
            break
        }
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host ""
    Write-Host "Stopping services started by start.ps1..." -ForegroundColor Yellow

    if ($frontendStartedByUs -and $frontendProc -and -not $frontendProc.HasExited) {
        Write-Host "  Stopping Vite Frontend (PID $($frontendProc.Id))..." -ForegroundColor Gray
        # On Windows, killing cmd.exe process tree
        & taskkill /PID $frontendProc.Id /T /F 2>&1 | Out-Null
    }

    if ($backendStartedByUs -and $backendProc -and -not $backendProc.HasExited) {
        Write-Host "  Stopping FastAPI Backend (PID $($backendProc.Id))..." -ForegroundColor Gray
        & taskkill /PID $backendProc.Id /T /F 2>&1 | Out-Null
    }

    if (Test-Path $pidFile) {
        Remove-Item -Path $pidFile -Force -ErrorAction SilentlyContinue
    }

    Write-Host "[OK] Stopped stack processes." -ForegroundColor Green
}
