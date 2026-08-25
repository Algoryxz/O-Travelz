# O-Travelz Team-Wide Local Development Setup Script
# Performs one-time environment verification, creates Python virtualenv,
# installs backend/frontend dependencies, copies .env if missing, starts
# PostgreSQL/PostGIS in Docker, applies migrations, imports canonical data,
# and validates dataset integrity.

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "=== O-TRAVELZ -- REPRODUCIBLE ENVIRONMENT SETUP ===" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Repository root: $RepoRoot" -ForegroundColor Gray
Write-Host ""

# -------------------------------------------------------------------------
# Step 1: Verify System Prerequisites
# -------------------------------------------------------------------------
Write-Host "[1/7] Verifying system prerequisites..." -ForegroundColor Yellow

# 1.1 Git
try {
    $gitVersion = & git --version 2>&1
    Write-Host "  [OK] Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Git is not installed or not in PATH." -ForegroundColor Red
    Write-Host "         Please install Git from https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

# 1.2 Python 3.10+
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
}

if (-not $pythonCmd) {
    Write-Host "  [FAIL] Python is not installed or not in PATH." -ForegroundColor Red
    Write-Host "         Please install Python 3.11+ from https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

$pyVerRaw = & $pythonCmd -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')" 2>&1
$pyMajor = & $pythonCmd -c "import sys; print(sys.version_info.major)"
$pyMinor = & $pythonCmd -c "import sys; print(sys.version_info.minor)"

if ([int]$pyMajor -lt 3 -or ([int]$pyMajor -eq 3 -and [int]$pyMinor -lt 10)) {
    Write-Host "  [FAIL] Python version is $pyVerRaw (requires >= 3.10)." -ForegroundColor Red
    Write-Host "         Please install Python 3.11 or 3.12 from https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}
Write-Host "  [OK] Python: $pyVerRaw ($pythonCmd)" -ForegroundColor Green

# 1.3 Node.js and npm
try {
    $nodeVersion = & node --version 2>&1
    $npmVersion = & npm --version 2>&1
    Write-Host "  [OK] Node.js: $nodeVersion | npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Node.js or npm is not installed or not in PATH." -ForegroundColor Red
    Write-Host "         Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 1.4 Docker and Docker Daemon
try {
    $dockerVersion = & docker --version 2>&1
    Write-Host "  [OK] Docker: $dockerVersion" -ForegroundColor Green

    # Check if daemon is active
    $dockerInfo = & docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [WARN] Docker CLI is available, but Docker daemon is not running." -ForegroundColor Yellow
        Write-Host "         Please start Docker Desktop and rerun .\setup.ps1" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "  [FAIL] Docker is not installed or not in PATH." -ForegroundColor Red
    Write-Host "         Please install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# -------------------------------------------------------------------------
# Step 2: Create Python Virtual Environment (.venv)
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "[2/7] Setting up Python virtual environment..." -ForegroundColor Yellow
$VenvDir = Join-Path $RepoRoot ".venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
$VenvPip = Join-Path $VenvDir "Scripts\pip.exe"

if (-not (Test-Path $VenvPython)) {
    $VenvPythonUnix = Join-Path $VenvDir "bin\python"
    if (Test-Path $VenvPythonUnix) {
        $VenvPython = $VenvPythonUnix
        $VenvPip = Join-Path $VenvDir "bin\pip"
    } else {
        Write-Host "  Creating virtual environment at .venv..." -ForegroundColor Gray
        & $pythonCmd -m venv $VenvDir
        if (-not (Test-Path $VenvPython)) {
            $VenvPython = Join-Path $VenvDir "Scripts\python.exe"
            $VenvPip = Join-Path $VenvDir "Scripts\pip.exe"
        }
    }
}
Write-Host "  [OK] Virtualenv ready: $VenvPython" -ForegroundColor Green

# -------------------------------------------------------------------------
# Step 3: Install Backend Dependencies
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "[3/7] Installing backend Python dependencies..." -ForegroundColor Yellow
$BackendReqs = Join-Path $RepoRoot "backend\requirements.txt"
if (Test-Path $BackendReqs) {
    & $VenvPip install -q -r $BackendReqs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [FAIL] Failed to install backend dependencies." -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] Backend dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  [FAIL] backend\requirements.txt not found!" -ForegroundColor Red
    exit 1
}

# -------------------------------------------------------------------------
# Step 4: Install Frontend Dependencies
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "[4/7] Installing frontend npm dependencies..." -ForegroundColor Yellow
$FrontendDir = Join-Path $RepoRoot "frontend"
if (Test-Path (Join-Path $FrontendDir "package.json")) {
    Push-Location $FrontendDir
    try {
        & npm install --no-audit --no-fund --loglevel=error
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [FAIL] npm install failed." -ForegroundColor Red
            exit 1
        }
        Write-Host "  [OK] Frontend dependencies installed." -ForegroundColor Green
    } finally {
        Pop-Location
    }
} else {
    Write-Host "  [FAIL] frontend\package.json not found!" -ForegroundColor Red
    exit 1
}

# -------------------------------------------------------------------------
# Step 5: Environment File Configuration (.env)
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "[5/7] Checking environment configuration (.env)..." -ForegroundColor Yellow
$EnvFile = Join-Path $RepoRoot ".env"
$EnvExample = Join-Path $RepoRoot ".env.example"

if (-not (Test-Path $EnvFile)) {
    if (Test-Path $EnvExample) {
        Copy-Item -Path $EnvExample -Destination $EnvFile
        Write-Host "  [OK] Created .env from .env.example" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] .env.example not found. Creating minimal .env..." -ForegroundColor Yellow
        Set-Content -Path $EnvFile -Value "DATABASE_URL=postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz`nENVIRONMENT=development`nSTORAGE_BACKEND=local`nLOCAL_STORAGE_BASE_PATH=./data/images"
        Write-Host "  [OK] Created default .env" -ForegroundColor Green
    }
} else {
    Write-Host "  [OK] Existing .env file preserved (never overwritten)." -ForegroundColor Green
}

# -------------------------------------------------------------------------
# Step 6: Start Docker Database and Wait for Readiness
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "[6/7] Starting PostgreSQL/PostGIS container via Docker..." -ForegroundColor Yellow
$ComposeFile = Join-Path $RepoRoot "infra\docker-compose.yml"

$testDbScript = @"
import sys, psycopg2, os
db_url = os.environ.get('DATABASE_URL', 'postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz')
try:
    conn = psycopg2.connect(db_url, connect_timeout=2)
    cur = conn.cursor()
    cur.execute('SELECT PostGIS_Version();')
    ver = cur.fetchone()[0]
    conn.close()
    print(f'PostGIS: {ver}')
    sys.exit(0)
except Exception as e:
    sys.exit(1)
"@

$dbReady = $false
$env:DATABASE_URL = "postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz"

# Check if database is already running and healthy
$checkResult = & $VenvPython -c $testDbScript 2>&1
if ($LASTEXITCODE -eq 0) {
    $dbReady = $true
    Write-Host "  [OK] PostgreSQL/PostGIS is already running and healthy: $checkResult" -ForegroundColor Green
} else {
    Write-Host "  Starting PostGIS container via Docker Compose..." -ForegroundColor Gray
    # Try starting existing container or creating with -p infra
    & docker compose -f $ComposeFile -p infra up -d db
    if ($LASTEXITCODE -ne 0) {
        # Fallback to docker start if container exists
        & docker start infra-db-1 2>&1 | Out-Null
    }
}

if (-not $dbReady) {
    Write-Host "  Waiting for PostgreSQL/PostGIS to become ready on port 5433..." -ForegroundColor Gray
    $maxAttempts = 30
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        $attempt++
        Start-Sleep -Seconds 1
        $checkResult = & $VenvPython -c $testDbScript 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dbReady = $true
            Write-Host "  [OK] Database is healthy: $checkResult" -ForegroundColor Green
            break
        }
    }
}

if (-not $dbReady) {
    Write-Host "  [FAIL] Database did not become ready within 30 seconds." -ForegroundColor Red
    Write-Host "         Check 'docker logs infra-db-1' for details." -ForegroundColor Yellow
    exit 1
}

# -------------------------------------------------------------------------
# Step 7: Run Migrations, Import Data, and Verify
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "[7/7] Applying database migrations and importing canonical data..." -ForegroundColor Yellow

$env:PYTHONPATH = Join-Path $RepoRoot "backend"
$alembicIni = Join-Path $RepoRoot "backend\alembic.ini"

# 7.1 Alembic upgrade head
Write-Host "  Running Alembic migrations..." -ForegroundColor Gray
& $VenvPython -m alembic -c $alembicIni upgrade head
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [FAIL] Alembic migration failed." -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Migrations applied up to head." -ForegroundColor Green

# 7.2 Import places and sync images
Write-Host "  Importing canonical places..." -ForegroundColor Gray
& $VenvPython (Join-Path $RepoRoot "scripts\import_places.py")
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [FAIL] scripts\import_places.py failed." -ForegroundColor Red
    exit 1
}

Write-Host "  Synchronizing database place images..." -ForegroundColor Gray
& $VenvPython (Join-Path $RepoRoot "scripts\sync_db_place_images.py")
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [FAIL] scripts\sync_db_place_images.py failed." -ForegroundColor Red
    exit 1
}

# 7.3 Data validation check
$validationScript = @"
import sys, psycopg2, os
db_url = os.environ.get('DATABASE_URL', 'postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz')
conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM places;')
places_cnt = cur.fetchone()[0]
cur.execute('SELECT COUNT(*) FROM categories;')
cats_cnt = cur.fetchone()[0]
cur.execute('SELECT COUNT(*) FROM interests;')
ints_cnt = cur.fetchone()[0]
cur.execute('SELECT COUNT(*) FROM place_interests;')
assoc_cnt = cur.fetchone()[0]
conn.close()

print(f'Places: {places_cnt} | Categories: {cats_cnt} | Interests: {ints_cnt} | Associations: {assoc_cnt}')
if places_cnt == 81 and cats_cnt == 13 and ints_cnt == 12 and assoc_cnt == 206:
    sys.exit(0)
else:
    sys.exit(1)
"@

$valOutput = & $VenvPython -c $validationScript 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Canonical dataset verified: $valOutput" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Dataset counts: $valOutput" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "=== SETUP COMPLETE! YOU ARE READY TO DEVELOP ===" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Start the stack:     .\start.ps1" -ForegroundColor Yellow
Write-Host "  2. Check system health: .\doctor.ps1" -ForegroundColor Yellow
Write-Host "  3. Stop the stack:      .\stop.ps1" -ForegroundColor Yellow
Write-Host ""
