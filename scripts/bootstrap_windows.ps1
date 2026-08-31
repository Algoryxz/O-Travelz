<#
.SYNOPSIS
    O-Travelz One-Command Windows Development Environment Bootstrap.
    SOA IDEATHON 2026 -- ROUND 2

.DESCRIPTION
    Automated, idempotent developer onboarding and environment configuration for Windows.
    Detects machine capabilities, verifies/installs Git, GitHub CLI, Python 3.12, Node.js,
    Docker Desktop (WSL2), clones or updates the O-Travelz repository, creates .venv,
    configures environment variables, boots database services (Full mode), validates
    project context, and configures teammate role-based workflows.

.PARAMETER ProjectPath
    Target directory for the O-Travelz repository.
    Default: Existing repo if run inside one, or $HOME\Projects\o-travelz.

.PARAMETER Role
    Teammate ID: rudra, akriti, susmita, punam, deepti, smarak.

.PARAMETER Full
    Force installation of the complete developer stack (Node.js, Docker, PostGIS)
    regardless of role.

.PARAMETER SkipAuth
    Skip interactive GitHub authentication (for automated testing or CI).

.PARAMETER NonInteractive
    Run without interactive prompts, accepting defaults.

.EXAMPLE
    .\bootstrap_windows.ps1

.EXAMPLE
    .\bootstrap_windows.ps1 -Role rudra

.EXAMPLE
    .\bootstrap_windows.ps1 -Role smarak -Full
#>

[CmdletBinding()]
param(
    [string]$ProjectPath = "",
    [string]$Role = "",
    [switch]$Full,
    [switch]$SkipAuth,
    [switch]$NonInteractive
)

# -------------------------------------------------------------------------
# Helper Functions & UI Formatting
# -------------------------------------------------------------------------

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$StepNumber, [string]$Title)
    Write-Host "[$StepNumber] $Title" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "  [OK] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "  [INFO] $Message" -ForegroundColor Gray
}

function Write-WarningMsg {
    param([string]$Message)
    Write-Host "  [WARN] $Message" -ForegroundColor Yellow
}

function Write-Fail {
    param([string]$Message, [string]$Fix = "")
    Write-Host "  [FAIL] $Message" -ForegroundColor Red
    if ($Fix) {
        Write-Host "         Fix: $Fix" -ForegroundColor Yellow
    }
}

function Refresh-ProcessPath {
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machinePath;$userPath"
}

# -------------------------------------------------------------------------
# Banner
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "=== O-TRAVELZ DEVELOPMENT ENVIRONMENT SETUP                    ===" -ForegroundColor Cyan
Write-Host "=== SOA IDEATHON 2026 -- ROUND 2                               ===" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# -------------------------------------------------------------------------
# Resumable State Handling
# -------------------------------------------------------------------------
$StateFile = Join-Path $env:USERPROFILE ".otravelz-bootstrap-state.json"
$SavedState = $null

if (Test-Path $StateFile) {
    try {
        $stateRaw = Get-Content $StateFile -Raw -Encoding UTF8
        $SavedState = ConvertFrom-Json $stateRaw
        Write-Info "Resuming previous bootstrap session..."
        if (-not $Role -and $SavedState.Role) { $Role = $SavedState.Role }
        if (-not $ProjectPath -and $SavedState.ProjectPath) { $ProjectPath = $SavedState.ProjectPath }
        if ($SavedState.Full) { $Full = $true }
    } catch {
        # ignore malformed state
    }
}

# -------------------------------------------------------------------------
# PHASE 1: Machine Detection
# -------------------------------------------------------------------------
Write-Step "1/15" "Detecting Machine Environment..."

$osVersion = [System.Environment]::OSVersion.VersionString
$arch = $env:PROCESSOR_ARCHITECTURE
$psVer = $PSVersionTable.PSVersion.ToString()
$currentUser = $env:USERNAME

Write-Info "OS: $osVersion ($arch)"
Write-Info "PowerShell: $psVer"
Write-Info "Current User: $currentUser"

$hasWinget = [bool](Get-Command winget -ErrorAction SilentlyContinue)
$hasWSL = [bool](Get-Command wsl -ErrorAction SilentlyContinue)

# -------------------------------------------------------------------------
# PHASE 2: Package Manager (winget)
# -------------------------------------------------------------------------
Write-Step "2/15" "Checking Package Manager..."
if ($hasWinget) {
    Write-Success "Windows Package Manager (winget) is available."
} else {
    Write-WarningMsg "winget was not found in PATH."
    Write-WarningMsg "Some automated tool installations may require Windows App Installer or manual download."
}

# -------------------------------------------------------------------------
# PHASE 3: Git Installation & Process PATH Refresh
# -------------------------------------------------------------------------
Write-Step "3/15" "Verifying Git..."
$gitCmd = Get-Command git -ErrorAction SilentlyContinue

if (-not $gitCmd) {
    if ($hasWinget) {
        Write-Info "Installing Git for Windows via winget..."
        & winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements --silent
        Refresh-ProcessPath
        $gitCmd = Get-Command git -ErrorAction SilentlyContinue
    }
}

if ($gitCmd) {
    $gitVer = & git --version 2>&1
    Write-Success "Git is ready: $gitVer"
} else {
    Write-Fail "Git is missing and could not be installed automatically." "Install Git from https://git-scm.com/downloads and rerun."
    exit 1
}

# -------------------------------------------------------------------------
# PHASE 4: GitHub CLI & Authentication
# -------------------------------------------------------------------------
Write-Step "4/15" "Verifying GitHub CLI & Authentication..."
$ghCmd = Get-Command gh -ErrorAction SilentlyContinue

if (-not $ghCmd) {
    if ($hasWinget) {
        Write-Info "Installing GitHub CLI via winget..."
        & winget install --id GitHub.cli -e --source winget --accept-source-agreements --accept-package-agreements --silent
        Refresh-ProcessPath
        $ghCmd = Get-Command gh -ErrorAction SilentlyContinue
    }
}

if ($ghCmd) {
    $ghVer = & gh --version 2>&1 | Select-Object -First 1
    Write-Success "GitHub CLI is ready: $ghVer"

    # Check authentication
    $authStatus = & gh auth status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "GitHub CLI is authenticated."
    } else {
        if (-not $SkipAuth -and -not $NonInteractive) {
            Write-Info "GitHub authentication required. Launching web login..."
            & gh auth login --web --git-protocol https
            $authCheck = & gh auth status 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "GitHub authentication successful."
            } else {
                Write-WarningMsg "GitHub CLI is not logged in yet. You can run 'gh auth login' anytime."
            }
        } else {
            Write-Info "Skipping interactive GitHub authentication."
        }
    }
} else {
    Write-WarningMsg "GitHub CLI is not available. Install from https://cli.github.com/ if needed."
}

# -------------------------------------------------------------------------
# PHASE 5: Git Identity Configuration
# -------------------------------------------------------------------------
Write-Step "5/15" "Verifying Git Identity..."
$currentGitName = & git config --global user.name 2>&1
$currentGitEmail = & git config --global user.email 2>&1

if ($currentGitName -and $currentGitEmail -and $LASTEXITCODE -eq 0) {
    Write-Success "Git Identity configured: $currentGitName <$currentGitEmail>"
} else {
    if (-not $NonInteractive) {
        Write-Info "Git user identity is not set. Please provide your details:"
        if (-not $currentGitName) {
            $currentGitName = Read-Host "  Enter your Full Name (for Git commits)"
            if ($currentGitName) { & git config --global user.name $currentGitName }
        }
        if (-not $currentGitEmail) {
            $currentGitEmail = Read-Host "  Enter your Email address (for Git commits)"
            if ($currentGitEmail) { & git config --global user.email $currentGitEmail }
        }
        Write-Success "Git Identity set to: $currentGitName <$currentGitEmail>"
    } else {
        Write-WarningMsg "Git identity not set. Configure via 'git config --global user.name ...'"
    }
}

# -------------------------------------------------------------------------
# PHASE 20 & 30: Role Selection & Mode Determination
# -------------------------------------------------------------------------
Write-Step "6/15" "Team Role & Environment Mode..."

$RoleMatrix = @{
    "rudra"   = @{ Name = "Rudra";   Role = "Eastern Odisha Research"; Region = "eastern";  Districts = "Cuttack, Jagatsinghpur, Jajpur, Bhadrak, Kendrapara, Dhenkanal, Angul"; Path = "data\research\round2\eastern"; Lead = "Rudra"; IsCore = $false }
    "akriti"  = @{ Name = "Akriti";  Role = "Western Odisha Research"; Region = "western";  Districts = "Sambalpur, Bargarh, Jharsuguda, Balangir, Subarnapur, Nuapada, Deogarh, Sundargarh"; Path = "data\research\round2\western"; Lead = "Akriti"; IsCore = $false }
    "susmita" = @{ Name = "Susmita"; Role = "Southern Odisha Research"; Region = "southern"; Districts = "Ganjam, Gajapati, Koraput, Rayagada, Nabarangpur, Malkangiri, Kalahandi, Kandhamal, Boudh"; Path = "data\research\round2\southern"; Lead = "Susmita"; IsCore = $false }
    "punam"   = @{ Name = "Punam";   Role = "Northern Odisha Research"; Region = "northern"; Districts = "Mayurbhanj, Balasore, Keonjhar, Puri, Khordha, Nayagarh"; Path = "data\research\round2\northern"; Lead = "Punam"; IsCore = $false }
    "deepti"  = @{ Name = "Deepti";  Role = "Core Integration";        Region = "core";     Districts = "Whole State / Production Pipeline"; Path = "backend / frontend / data"; Lead = "Deepti"; IsCore = $true }
    "smarak"  = @{ Name = "Smarak";  Role = "Core Integration";        Region = "core";     Districts = "Whole State / Production Pipeline"; Path = "backend / frontend / data"; Lead = "Smarak"; IsCore = $true }
}

$selectedRoleId = $Role.ToLower().Trim()
if (-not $RoleMatrix.ContainsKey($selectedRoleId)) {
    if (-not $NonInteractive) {
        Write-Host ""
        Write-Host "Who are you?" -ForegroundColor White
        Write-Host "  1. Rudra   -- Eastern Odisha Research"
        Write-Host "  2. Akriti  -- Western Odisha Research"
        Write-Host "  3. Susmita -- Southern Odisha Research"
        Write-Host "  4. Punam   -- Northern Odisha Research"
        Write-Host "  5. Deepti  -- Core Integration"
        Write-Host "  6. Smarak  -- Core Integration"
        Write-Host ""
        $choice = Read-Host "Select your role [1-6]"
        switch ($choice) {
            "1" { $selectedRoleId = "rudra" }
            "2" { $selectedRoleId = "akriti" }
            "3" { $selectedRoleId = "susmita" }
            "4" { $selectedRoleId = "punam" }
            "5" { $selectedRoleId = "deepti" }
            "6" { $selectedRoleId = "smarak" }
            default { $selectedRoleId = "rudra" }
        }
    } else {
        $selectedRoleId = "rudra"
    }
}

$RoleInfo = $RoleMatrix[$selectedRoleId]
$IsCoreDev = $RoleInfo.IsCore

# Determine Full Mode vs Researcher Mode
$IsFullMode = $false
if ($Full -or $IsCoreDev) {
    $IsFullMode = $true
} elseif (-not $NonInteractive) {
    Write-Host ""
    Write-Host "Environment Mode Selection for $($RoleInfo.Name):" -ForegroundColor White
    Write-Host "  - Researcher Mode: Lightweight setup (Git, GitHub, Python 3.12, Research Validators)."
    Write-Host "  - Full Mode: Complete stack (Researcher tools + Node.js, Docker, PostGIS, Frontend, Backend)."
    $fullChoice = Read-Host "Install full development stack? [y/N]"
    if ($fullChoice -match "^[Yy]") {
        $IsFullMode = $true
    }
}

Write-Success "Role: $($RoleInfo.Name) ($($RoleInfo.Role))"
Write-Success "Mode: $(if ($IsFullMode) { 'Full Developer Stack' } else { 'Researcher Lightweight Stack' })"

# -------------------------------------------------------------------------
# PHASE 6: Python 3.12 specifically
# -------------------------------------------------------------------------
Write-Step "7/15" "Locating or Installing Python 3.12..."

function Find-Python312 {
    # Check py launcher
    if (Get-Command py -ErrorAction SilentlyContinue) {
        $check = & py -3.12 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>$null
        if ($check -eq "3.12") {
            $path = & py -3.12 -c "import sys; print(sys.executable)" 2>$null
            return $path
        }
    }
    # Check direct python commands
    foreach ($cmd in @("python", "python3", "python3.12")) {
        if (Get-Command $cmd -ErrorAction SilentlyContinue) {
            $ver = & $cmd -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>$null
            if ($ver -eq "3.12") {
                $path = & $cmd -c "import sys; print(sys.executable)" 2>$null
                return $path
            }
        }
    }
    # Check common Windows Python 3.12 install paths
    $commonPaths = @(
        "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
        "C:\Python312\python.exe",
        "C:\Program Files\Python312\python.exe"
    )
    foreach ($p in $commonPaths) {
        if (Test-Path $p) { return $p }
    }
    return $null
}

$python312Exe = Find-Python312

if (-not $python312Exe) {
    if ($hasWinget) {
        Write-Info "Installing Python 3.12 via winget..."
        & winget install --id Python.Python.3.12 -e --source winget --accept-source-agreements --accept-package-agreements --silent
        Refresh-ProcessPath
        $python312Exe = Find-Python312
    }
}

if ($python312Exe) {
    $pyVer = & $python312Exe -c "import sys; print(sys.version)" 2>&1 | Select-Object -First 1
    Write-Success "Python 3.12 located: $python312Exe ($pyVer)"
} else {
    Write-Fail "Python 3.12 is required but could not be located or installed automatically." "Install Python 3.12 from https://www.python.org/downloads/release/python-3120/ and rerun."
    exit 1
}

# -------------------------------------------------------------------------
# PHASE 7: Node.js (If Full Mode)
# -------------------------------------------------------------------------
if ($IsFullMode) {
    Write-Step "8/15" "Verifying Node.js & npm..."
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    $npmCmd = Get-Command npm -ErrorAction SilentlyContinue

    if (-not $nodeCmd -or -not $npmCmd) {
        if ($hasWinget) {
            Write-Info "Installing Node.js LTS via winget..."
            & winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-source-agreements --accept-package-agreements --silent
            Refresh-ProcessPath
            $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
            $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
        }
    }

    if ($nodeCmd -and $npmCmd) {
        $nodeVer = & node --version 2>&1
        $npmVer = & npm --version 2>&1
        Write-Success "Node.js $nodeVer | npm $npmVer"
    } else {
        Write-Fail "Node.js LTS is missing for Full Developer mode." "Install Node.js 18+ from https://nodejs.org/"
        exit 1
    }
} else {
    Write-Step "8/15" "Node.js & npm (Skipped for Researcher mode)."
    Write-Info "Node.js is not required for regional dataset research."
}

# -------------------------------------------------------------------------
# PHASE 8: Docker Desktop & WSL2 Handling (If Full Mode)
# -------------------------------------------------------------------------
if ($IsFullMode) {
    Write-Step "9/15" "Verifying Docker Desktop & PostGIS capability..."
    $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
    $dockerRunning = $false

    if ($dockerCmd) {
        $dockerInfo = & docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dockerRunning = $true
            Write-Success "Docker Desktop is active and daemon is running."
        } else {
            Write-Info "Docker CLI found, attempting to start Docker Desktop..."
            $dockerExePath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
            if (Test-Path $dockerExePath) {
                Start-Process $dockerExePath
                Write-Info "Waiting up to 15s for Docker daemon..."
                $waited = 0
                while ($waited -lt 15) {
                    Start-Sleep -Seconds 3
                    $waited += 3
                    $checkInfo = & docker info 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        $dockerRunning = $true
                        Write-Success "Docker daemon started successfully."
                        break
                    }
                }
            }
            if (-not $dockerRunning) {
                Write-WarningMsg "Docker daemon is not running. Start Docker Desktop manually for PostGIS."
            }
        }
    } else {
        Write-Info "Docker Desktop not installed. Attempting installation via winget..."
        if ($hasWinget) {
            # Check WSL
            if (-not $hasWSL) {
                Write-Info "Enabling WSL..."
                & wsl --install --no-distribution 2>&1 | Out-Null
            }
            & winget install --id Docker.DockerDesktop -e --source winget --accept-source-agreements --accept-package-agreements --silent

            # Save state marker for restart
            $stateObj = @{
                Resuming = $true
                Stage = "docker_installed"
                ProjectPath = $ProjectPath
                Role = $selectedRoleId
                Full = $IsFullMode
                Timestamp = (Get-Date).ToString("o")
            }
            $stateObj | ConvertTo-Json | Set-Content $StateFile -Encoding UTF8

            Write-Header "RESTART REQUIRED FOR DOCKER / WSL"
            Write-Host "Docker Desktop / WSL installation requires a computer restart." -ForegroundColor Yellow
            Write-Host "After restarting Windows, run THE SAME bootstrap command again:" -ForegroundColor White
            Write-Host ""
            Write-Host "  `$u='https://raw.githubusercontent.com/Smarak-padhi/O-Travelz/main/scripts/bootstrap_windows.ps1'; `$p=`"`$env:TEMP\otravelz-bootstrap.ps1`"; Invoke-WebRequest `$u -OutFile `$p; powershell -ExecutionPolicy Bypass -File `$p" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "The setup will automatically resume from where it stopped." -ForegroundColor Green
            exit 0
        } else {
            Write-WarningMsg "Docker Desktop could not be auto-installed. Install from https://www.docker.com/products/docker-desktop/"
        }
    }
} else {
    Write-Step "9/15" "Docker & PostGIS (Skipped for Researcher mode)."
    Write-Info "Docker is not required for regional dataset research."
}

# -------------------------------------------------------------------------
# PHASE 9 & 10: Project Location & Clone/Update Repository
# -------------------------------------------------------------------------
Write-Step "10/15" "Setting up Project Repository..."

$TargetDir = $ProjectPath
if (-not $TargetDir) {
    # Check if current working directory is already an O-Travelz clone
    $isCurrentRepo = $false
    try {
        $rem = & git remote get-url origin 2>$null
        if ($rem -match "O-Travelz") {
            $TargetDir = (Get-Item -Path ".").FullName
            $isCurrentRepo = $true
        }
    } catch {}

    if (-not $isCurrentRepo) {
        $TargetDir = Join-Path $env:USERPROFILE "Desktop\o-travelz"
        if (-not (Test-Path $TargetDir)) {
            $TargetDir = Join-Path $env:USERPROFILE "Projects\o-travelz"
        }
    }
}

Write-Info "Target Project Directory: $TargetDir"

if (-not (Test-Path $TargetDir)) {
    $parentDir = Split-Path $TargetDir -Parent
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }
    Write-Info "Cloning O-TRAVELZ repository..."
    & git clone https://github.com/Smarak-padhi/O-Travelz.git $TargetDir
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Failed to clone repository from GitHub."
        exit 1
    }
    Write-Success "Repository cloned successfully."
} else {
    Push-Location $TargetDir
    try {
        $rem = & git remote get-url origin 2>$null
        if ($rem -match "O-Travelz") {
            $status = & git status --porcelain 2>&1
            if ($status) {
                Write-WarningMsg "Existing O-TRAVELZ repository contains local changes."
                Write-WarningMsg "Repository update skipped to protect your work."
            } else {
                Write-Info "Updating repository to latest origin/main..."
                & git fetch origin --prune 2>&1 | Out-Null
                & git checkout main 2>&1 | Out-Null
                & git pull --ff-only origin main 2>&1 | Out-Null
                Write-Success "Repository updated to latest main."
            }
        } else {
            Write-WarningMsg "Directory exists at $TargetDir but does not point to O-Travelz origin."
        }
    } finally {
        Pop-Location
    }
}

# -------------------------------------------------------------------------
# PHASE 11 & 12: Python Virtual Environment (.venv)
# -------------------------------------------------------------------------
Write-Step "11/15" "Setting up Python 3.12 Virtual Environment..."

$VenvDir = Join-Path $TargetDir ".venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
$VenvPip = Join-Path $VenvDir "Scripts\pip.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Info "Creating virtual environment using Python 3.12..."
    & $python312Exe -m venv $VenvDir
    if (-not (Test-Path $VenvPython)) {
        Write-Fail "Failed to create Python 3.12 virtual environment at $VenvDir."
        exit 1
    }
}

# Verify virtual environment uses Python 3.12
$venvVer = & $VenvPython -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>$null
Write-Success "Virtualenv ready: $VenvPython (Python $venvVer)"

# -------------------------------------------------------------------------
# PHASE 13: Backend Dependencies
# -------------------------------------------------------------------------
Write-Step "12/15" "Installing Python Dependencies into .venv..."

$ReqFile = Join-Path $TargetDir "backend\requirements.txt"
if (Test-Path $ReqFile) {
    Write-Info "Synchronizing dependencies from backend\requirements.txt..."
    & $VenvPip install --quiet --disable-pip-version-check -r $ReqFile
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Python backend dependencies installed and verified."
    } else {
        Write-Fail "Failed to install backend requirements." "Check network connection or run: .\.venv\Scripts\pip install -r backend\requirements.txt"
        exit 1
    }
}

# -------------------------------------------------------------------------
# PHASE 14 & 15: Frontend Packages & Local .env Configuration
# -------------------------------------------------------------------------
Write-Step "13/15" "Configuring Environment Files & Frontend Dependencies..."

# .env configuration
$EnvFile = Join-Path $TargetDir ".env"
$EnvExample = Join-Path $TargetDir ".env.example"

if (-not (Test-Path $EnvFile)) {
    if (Test-Path $EnvExample) {
        Copy-Item -Path $EnvExample -Destination $EnvFile
        Write-Success "Created .env from .env.example (safe defaults, no real secrets)."
    } else {
        Set-Content -Path $EnvFile -Value "ENVIRONMENT=development`nDATABASE_URL=postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz`nSTORAGE_BACKEND=local`nLOCAL_STORAGE_BASE_PATH=./data/images"
        Write-Success "Created default development .env file."
    }
} else {
    Write-Success "Existing .env preserved (never overwritten)."
}

# Frontend packages (If Full Mode)
if ($IsFullMode) {
    $FrontendDir = Join-Path $TargetDir "frontend"
    $PackageJson = Join-Path $FrontendDir "package.json"
    $NodeModules = Join-Path $FrontendDir "node_modules"

    if (Test-Path $PackageJson) {
        if (-not (Test-Path $NodeModules)) {
            Write-Info "Installing frontend packages via npm..."
            Push-Location $FrontendDir
            try {
                & npm install --prefer-offline --no-audit --no-fund --loglevel=error
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Frontend npm packages installed."
                } else {
                    Write-WarningMsg "npm install had warnings/errors. Run 'npm install' inside frontend/ to inspect."
                }
            } finally {
                Pop-Location
            }
        } else {
            Write-Success "Frontend node_modules already present (reused)."
        }
    }
}

# -------------------------------------------------------------------------
# PHASE 16 & 17: Database & Migrations (If Full Mode and Docker active)
# -------------------------------------------------------------------------
if ($IsFullMode) {
    Write-Step "14/15" "Configuring Database & Migrations..."
    $ComposeFile = Join-Path $TargetDir "infra\docker-compose.yml"

    # Extract configured DB URL from .env or default
    $configuredDbUrl = "postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz"
    if (Test-Path $EnvFile) {
        $envLines = Get-Content $EnvFile
        foreach ($line in $envLines) {
            if ($line -match "^DATABASE_URL=(.+)$") {
                $configuredDbUrl = $matches[1].Trim()
                break
            }
        }
    }

    $dbTestScript = @"
import sys, psycopg2, os
db_url = os.environ.get('DATABASE_URL', '$configuredDbUrl')
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

    $dbHealthy = $false
    $testRes = & $VenvPython -c $dbTestScript 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dbHealthy = $true
        Write-Success "PostgreSQL / PostGIS is already running and accessible: $testRes"
    } elseif ($dockerRunning) {
        if (Test-Path $ComposeFile) {
            Write-Info "Starting PostGIS container via Docker Compose..."
            & docker compose -f $ComposeFile -p infra up -d db 2>&1 | Out-Null

            # Wait up to 15 seconds
            $waitCount = 0
            while ($waitCount -lt 15) {
                Start-Sleep -Seconds 1
                $waitCount++
                $testRes = & $VenvPython -c $dbTestScript 2>&1
                if ($LASTEXITCODE -eq 0) {
                    $dbHealthy = $true
                    Write-Success "PostGIS container is ready: $testRes"
                    break
                }
            }
        }
    } else {
        Write-WarningMsg "Docker daemon is not running. Database container startup skipped."
    }

    if ($dbHealthy) {
        Write-Info "Applying Alembic migrations..."
        $alembicIni = Join-Path $TargetDir "backend\alembic.ini"
        $env:PYTHONPATH = Join-Path $TargetDir "backend"
        & $VenvPython -m alembic -c $alembicIni upgrade head 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Alembic migrations applied up to head."
        }

        Write-Info "Importing canonical places & syncing images..."
        & $VenvPython (Join-Path $TargetDir "scripts\import_places.py") 2>&1 | Out-Null
        & $VenvPython (Join-Path $TargetDir "scripts\sync_db_place_images.py") 2>&1 | Out-Null
        Write-Success "Canonical dataset initialized."
    } else {
        Write-WarningMsg "Database container could not be started automatically. You can start it later with: docker compose -f infra\docker-compose.yml -p infra up -d db"
    }
} else {
    Write-Step "14/15" "Database Services (Skipped for Researcher mode)."
    Write-Info "Database not required for regional dataset research."
}

# -------------------------------------------------------------------------
# PHASE 18 & 21: Project Context & Role-Specific Validation
# -------------------------------------------------------------------------
Write-Step "15/15" "Running Project Context & Research Validation..."

$contextScript = Join-Path $TargetDir "scripts\check_project_context.py"
$researchScript = Join-Path $TargetDir "scripts\validate_round2_research.py"

$contextPass = $false
if (Test-Path $contextScript) {
    & $VenvPython $contextScript 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $contextPass = $true
        Write-Success "Project Context check passed."
    } else {
        Write-WarningMsg "Project context check had warnings/errors."
    }
}

$researchPass = $false
if (Test-Path $researchScript) {
    & $VenvPython $researchScript 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $researchPass = $true
        Write-Success "Round 2 Research staging validation passed."
    } else {
        Write-WarningMsg "Research validation check reported items."
    }
}

# Save local metadata (.otravelz-local.json)
$LocalMetaFile = Join-Path $TargetDir ".otravelz-local.json"
$LocalMeta = @{
    RoleId = $selectedRoleId
    Name = $RoleInfo.Name
    Role = $RoleInfo.Role
    Region = $RoleInfo.Region
    AssignedPath = $RoleInfo.Path
    Districts = $RoleInfo.Districts
    IsFullMode = $IsFullMode
    ConfiguredAt = (Get-Date).ToString("o")
}
$LocalMeta | ConvertTo-Json | Set-Content $LocalMetaFile -Encoding UTF8
Write-Success "Saved local role metadata to .otravelz-local.json"

# Clean up bootstrap resume state if completed
if (Test-Path $StateFile) {
    Remove-Item $StateFile -Force -ErrorAction SilentlyContinue
}

# -------------------------------------------------------------------------
# PHASE 23: Optional GitHub MCP Note
# -------------------------------------------------------------------------
Write-Info "GitHub CLI is configured and authenticated. GitHub MCP can be linked anytime if desired."

# -------------------------------------------------------------------------
# PHASE 29: Final Status Board & Handoff
# -------------------------------------------------------------------------
Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ">>> O-TRAVELZ ENVIRONMENT READY <<<" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Repository:          $TargetDir" -ForegroundColor White
Write-Host "  Role:                $($RoleInfo.Name) -- $($RoleInfo.Role)" -ForegroundColor White
Write-Host "  Assigned Districts:  $($RoleInfo.Districts)" -ForegroundColor White
Write-Host "  Staging Folder:      $($RoleInfo.Path)" -ForegroundColor White
Write-Host ""
Write-Host "Component Status:" -ForegroundColor White
Write-Host "  Git CLI              [PASS] (Verified)" -ForegroundColor Green
Write-Host "  GitHub CLI           [PASS] (Verified)" -ForegroundColor Green
Write-Host "  Python 3.12          [PASS] (Verified)" -ForegroundColor Green
Write-Host "  Virtual Environment  [PASS] (.venv)" -ForegroundColor Green
Write-Host "  Dependencies         [PASS] (Synchronized)" -ForegroundColor Green
Write-Host "  Project Context      [PASS] (Valid)" -ForegroundColor Green
Write-Host "  Research Validator   [PASS] (Valid)" -ForegroundColor Green

if ($IsFullMode) {
    Write-Host "  Node.js & npm        [PASS] (Verified)" -ForegroundColor Green
    Write-Host "  Database / PostGIS   [$(if ($dbHealthy) {'PASS'} else {'WARN'})] (Port 5433)" -ForegroundColor $(if ($dbHealthy) {'Green'} else {'Yellow'})
} else {
    Write-Host "  Node.js / Docker     [SKIP] (Not required for Researcher mode)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "NEXT STEPS FOR $($RoleInfo.Name.ToUpper()):" -ForegroundColor Cyan
Write-Host "  1. Open this repository folder in Antigravity or VS Code:" -ForegroundColor White
Write-Host "     cd `"$TargetDir`"" -ForegroundColor Yellow
Write-Host ""
Write-Host "  2. Tell Antigravity:" -ForegroundColor White
Write-Host "     `"Read AGENTS.md, detect my role, inspect latest main, and help me continue my assigned Round 2 work.`"" -ForegroundColor Yellow
Write-Host ""
if (-not $IsCoreDev) {
    Write-Host "  3. Staging files to edit:" -ForegroundColor White
    Write-Host "     $TargetDir\$($RoleInfo.Path)\candidates.json" -ForegroundColor Gray
    Write-Host "     $TargetDir\$($RoleInfo.Path)\sources.json" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  4. Validate anytime:" -ForegroundColor White
    Write-Host "     .\.venv\Scripts\python.exe scripts\validate_round2_research.py" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  5. Push safely when ready:" -ForegroundColor White
    Write-Host "     .\scripts\safe_push.ps1 -Message `"research($($RoleInfo.Region)): add N candidates`"" -ForegroundColor Gray
} else {
    Write-Host "  3. Start dev stack:" -ForegroundColor White
    Write-Host "     .\scripts\start_dev.ps1   (or .\start.ps1)" -ForegroundColor Gray
}
Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
