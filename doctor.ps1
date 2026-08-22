# O-Travelz Diagnostic and Health Check Script
# Checks system prerequisites, Python virtualenv, backend/frontend dependencies,
# Docker container status, PostGIS database connectivity, migration state,
# canonical dataset invariants, and running service endpoints.

[CmdletBinding()]
param()

$RepoRoot = $PSScriptRoot
$AllPass = $true
$Issues = @()

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "=== O-TRAVELZ -- SYSTEM HEALTH AND DIAGNOSTIC DOCTOR ===" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Checking repository at: $RepoRoot" -ForegroundColor Gray
Write-Host ""

function Report-Check {
    param(
        [string]$Category,
        [string]$Name,
        [bool]$Success,
        [string]$Details,
        [string]$Fix = ""
    )
    if ($Success) {
        Write-Host "  [PASS] $Category - $Name" -ForegroundColor Green
        if ($Details) {
            Write-Host "         $Details" -ForegroundColor Gray
        }
    } else {
        Write-Host "  [FAIL] $Category - $Name" -ForegroundColor Red
        if ($Details) {
            Write-Host "         $Details" -ForegroundColor Yellow
        }
        if ($Fix) {
            Write-Host "         Fix: $Fix" -ForegroundColor Cyan
        }
        $script:AllPass = $false
        $script:Issues += "$($Category): $($Name) -> $($Fix)"
    }
}

function Report-Warn {
    param(
        [string]$Category,
        [string]$Name,
        [string]$Details,
        [string]$Fix = ""
    )
    Write-Host "  [WARN] $Category - $Name" -ForegroundColor Yellow
    if ($Details) {
        Write-Host "         $Details" -ForegroundColor Gray
    }
    if ($Fix) {
        Write-Host "         Tip: $Fix" -ForegroundColor Cyan
    }
}

# -------------------------------------------------------------------------
# 1. Environment and Prerequisites
# -------------------------------------------------------------------------
Write-Host "1. Prerequisites and Tools:" -ForegroundColor White

# Git
try {
    $gitVer = & git --version 2>&1
    Report-Check "System" "Git" $true $gitVer
} catch {
    Report-Check "System" "Git" $false "Git CLI not found" "Install Git from https://git-scm.com/"
}

# Python
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) { $pythonCmd = "python" }
elseif (Get-Command py -ErrorAction SilentlyContinue) { $pythonCmd = "py" }

if ($pythonCmd) {
    $pyVer = & $pythonCmd -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')" 2>&1
    $pyMajor = & $pythonCmd -c "import sys; print(sys.version_info.major)"
    $pyMinor = & $pythonCmd -c "import sys; print(sys.version_info.minor)"
    if ([int]$pyMajor -eq 3 -and [int]$pyMinor -ge 10) {
        Report-Check "System" "Python" $true "Python $pyVer ($pythonCmd)"
    } else {
        Report-Check "System" "Python" $false "Python $pyVer found, but requires >= 3.10" "Install Python 3.11/3.12 from https://www.python.org/"
    }
} else {
    Report-Check "System" "Python" $false "Python not found in PATH" "Install Python 3.11/3.12 from https://www.python.org/"
}

# Node and npm
try {
    $nodeVer = & node --version 2>&1
    $npmVer = & npm --version 2>&1
    Report-Check "System" "Node.js and npm" $true "Node $nodeVer | npm $npmVer"
} catch {
    Report-Check "System" "Node.js and npm" $false "Node.js or npm not found in PATH" "Install Node.js 18+ from https://nodejs.org/"
}

# Docker
try {
    $dockerVer = & docker --version 2>&1
    $infoRes = & docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Report-Check "System" "Docker" $true "$dockerVer (Daemon active)"
    } else {
        Report-Check "System" "Docker" $false "$dockerVer found, but Docker daemon is not running" "Start Docker Desktop"
    }
} catch {
    Report-Check "System" "Docker" $false "Docker not installed or not in PATH" "Install Docker Desktop from https://www.docker.com/"
}

# -------------------------------------------------------------------------
# 2. Local Configuration and Virtual Environment
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "2. Local Configuration and Dependencies:" -ForegroundColor White

# .env file
$EnvFile = Join-Path $RepoRoot ".env"
if (Test-Path $EnvFile) {
    Report-Check "Config" ".env File" $true "Present at root"
} else {
    Report-Check "Config" ".env File" $false ".env file is missing" "Run .\setup.ps1 or copy .env.example to .env"
}

# Python Virtualenv
$VenvDir = Join-Path $RepoRoot ".venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
    $VenvPythonUnix = Join-Path $VenvDir "bin\python"
    if (Test-Path $VenvPythonUnix) {
        $VenvPython = $VenvPythonUnix
    }
}

if (Test-Path $VenvPython) {
    Report-Check "Backend" "Python Virtualenv" $true "Located at $VenvPython"

    # Check Python Packages
    $pkgCheckScript = @"
import sys
required = ['fastapi', 'uvicorn', 'sqlalchemy', 'alembic', 'psycopg2', 'geoalchemy2', 'pydantic', 'pytest', 'PIL']
missing = []
for mod in required:
    try:
        __import__(mod)
    except ImportError:
        missing.append(mod)
if missing:
    print('Missing: ' + ', '.join(missing))
    sys.exit(1)
print('All critical packages imported successfully')
sys.exit(0)
"@
    $pkgOutput = & $VenvPython -c $pkgCheckScript 2>&1
    if ($LASTEXITCODE -eq 0) {
        Report-Check "Backend" "Python Packages" $true $pkgOutput
    } else {
        Report-Check "Backend" "Python Packages" $false $pkgOutput "Run: .\.venv\Scripts\pip.exe install -r backend\requirements.txt"
    }
} else {
    Report-Check "Backend" "Python Virtualenv" $false ".venv directory missing" "Run .\setup.ps1 to create the virtual environment"
}

# Frontend node_modules
$FrontendModules = Join-Path $RepoRoot "frontend\node_modules"
if (Test-Path $FrontendModules) {
    Report-Check "Frontend" "Node Modules" $true "Located at frontend\node_modules"
} else {
    Report-Check "Frontend" "Node Modules" $false "frontend\node_modules missing" "Run: npm --prefix frontend install"
}

# -------------------------------------------------------------------------
# 3. Database and Dataset Integrity
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "3. Database and Dataset State:" -ForegroundColor White

if (Test-Path $VenvPython) {
    $dbTestScript = @"
import sys, psycopg2, os
db_url = os.environ.get('DATABASE_URL', 'postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz')
try:
    conn = psycopg2.connect(db_url, connect_timeout=3)
    cur = conn.cursor()
    cur.execute('SELECT PostGIS_Full_Version();')
    postgis_ver = cur.fetchone()[0]

    cur.execute('SELECT COUNT(*) FROM places;')
    places_cnt = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM categories;')
    cats_cnt = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM interests;')
    ints_cnt = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM place_interests;')
    assoc_cnt = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM place_images;')
    imgs_cnt = cur.fetchone()[0]

    conn.close()

    print(f'CONNECTED|{places_cnt}|{cats_cnt}|{ints_cnt}|{assoc_cnt}|{imgs_cnt}|{postgis_ver[:40]}...')
    sys.exit(0)
except Exception as e:
    print(f'ERROR|{e}')
    sys.exit(1)
"@
    $dbResult = & $VenvPython -c $dbTestScript 2>&1
    if ($LASTEXITCODE -eq 0 -and $dbResult -match "^CONNECTED") {
        $parts = $dbResult.Split("|")
        $pCount = [int]$parts[1]
        $cCount = [int]$parts[2]
        $iCount = [int]$parts[3]
        $aCount = [int]$parts[4]
        $imgCount = [int]$parts[5]
        $pgVer = $parts[6]

        Report-Check "Database" "PostgreSQL / PostGIS Connection" $true "Connected on port 5433 ($pgVer)"

        if (($pCount -eq 81 -or $pCount -eq 161) -and ($cCount -eq 13 -or $cCount -eq 16) -and $iCount -eq 12 -and ($aCount -eq 206 -or $aCount -eq 358)) {
            Report-Check "Database" "Canonical Dataset" $true "$pCount places, $cCount categories, $iCount interests, $aCount associations, $imgCount images"
        } else {
            Report-Check "Database" "Canonical Dataset" $false "Found $pCount places (expected 161), $cCount cats (exp 16), $iCount ints (exp 12), $aCount assocs (exp 358)" "Run: .\.venv\Scripts\python.exe scripts\import_places.py"
        }


    } else {
        Report-Check "Database" "PostgreSQL / PostGIS Connection" $false "$dbResult" "Ensure Docker DB container is running on port 5433: docker compose -f infra/docker-compose.yml up -d db"
    }
} else {
    Report-Check "Database" "PostgreSQL / PostGIS Connection" $false "Cannot test without Python virtualenv" "Run .\setup.ps1"
}

# -------------------------------------------------------------------------
# 4. Live Service Endpoints
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "4. Live Stack Service Status (Informational):" -ForegroundColor White

# Backend Port 8000 & Health
try {
    $backendHealth = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
    if ($backendHealth.status -eq "ok") {
        Report-Check "Live Service" "FastAPI Backend (8000)" $true "http://127.0.0.1:8000/health is healthy (status=ok)"
    } else {
        Report-Warn "Live Service" "FastAPI Backend (8000)" "Responded with status '$($backendHealth.status)'"
    }
} catch {
    Report-Warn "Live Service" "FastAPI Backend (8000)" "Not currently running on http://127.0.0.1:8000" "Start via .\start.ps1"
}

# Frontend Port 5173
try {
    $frontendResp = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    if ($frontendResp.StatusCode -eq 200) {
        Report-Check "Live Service" "Vite Frontend (5173)" $true "http://localhost:5173 is reachable (HTTP 200)"
    }
} catch {
    Report-Warn "Live Service" "Vite Frontend (5173)" "Not currently running on http://localhost:5173" "Start via .\start.ps1"
}

# -------------------------------------------------------------------------
# Final Result Summary
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
if ($AllPass) {
    Write-Host ">>> RESULT: READY <<<" -ForegroundColor Green
    Write-Host "All environment prerequisites, dependencies, and database states are healthy." -ForegroundColor Green
    Write-Host "Run .\start.ps1 to launch development services." -ForegroundColor White
} else {
    Write-Host ">>> RESULT: NOT READY <<<" -ForegroundColor Red
    Write-Host "One or more required components failed health checks:" -ForegroundColor Yellow
    foreach ($issue in $Issues) {
        Write-Host "  - $issue" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Run .\setup.ps1 to resolve environment setup automatically." -ForegroundColor Cyan
}
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $AllPass) {
    exit 1
}
