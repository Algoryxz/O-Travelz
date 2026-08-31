<#
.SYNOPSIS
    O-Travelz Project Update Helper.
    SOA IDEATHON 2026 -- ROUND 2

.DESCRIPTION
    Safely synchronizes local repository with origin/main:
    - Verifies working tree is clean to protect uncommitted work.
    - Fetches latest commits with prune.
    - Checks out main branch and pulls fast-forward only.
    - Runs lightweight project context check.

.EXAMPLE
    .\scripts\update_project.ps1
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoRoot = (Get-Item $PSScriptRoot).Parent.FullName

function Write-Info { param([string]$msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success { param([string]$msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn { param([string]$msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Fail { param([string]$msg) Write-Host "[FAIL] $msg" -ForegroundColor Red; exit 1 }

Push-Location $RepoRoot
try {
    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host "=== O-TRAVELZ -- REPOSITORY UPDATE HELPER                      ===" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ""

    # 1. Check working tree cleanliness
    $dirty = (& git status --porcelain 2>&1)
    if ($dirty) {
        Write-Warn "Working tree contains uncommitted changes or untracked files:"
        $dirty | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        Write-Fail "Repository update aborted to protect your local work. Stash or commit your changes first."
    }

    # 2. Fetch origin
    Write-Info "Fetching latest changes from origin..."
    & git fetch origin --prune
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "git fetch origin failed."
    }

    # 3. Checkout main
    Write-Info "Switching to main branch..."
    & git checkout main
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "git checkout main failed."
    }

    # 4. Pull ff-only
    Write-Info "Pulling latest changes (fast-forward only)..."
    & git pull --ff-only origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "git pull --ff-only failed. If your branch has diverged, rebase cleanly."
    }
    Write-Success "Repository is up to date with origin/main."

    # 5. Run context check
    $venvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"
    if (Test-Path $venvPython) {
        Write-Info "Verifying project context..."
        & $venvPython "scripts\check_project_context.py" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Project context check passed."
        }
    }

    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ">>> REPOSITORY UPDATE COMPLETE <<<" -ForegroundColor Green
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ""
} finally {
    Pop-Location
}
