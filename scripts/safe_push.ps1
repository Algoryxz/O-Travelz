<#
.SYNOPSIS
    O-Travelz Safe Git Helper.
    SOA IDEATHON 2026 -- ROUND 2

.DESCRIPTION
    Safely commits and pushes work to GitHub:
    - Scans staged files for sensitive secrets or private files (.env, keys, tokens).
    - Checks git diff for whitespace or merge marker issues.
    - Runs Round 2 research validation and project context checks.
    - Commits staged changes if a message is supplied.
    - Safely fetches remote origin and detects remote divergence.
    - Rebases only when working tree is completely clean.
    - Aborts cleanly on merge conflicts (never auto-resolves).
    - NEVER executes force push (--force / -f).

.PARAMETER Message
    Commit message to use for staged changes.

.PARAMETER Files
    Optional explicit list of files to stage before committing.

.PARAMETER Branch
    Branch name to push (defaults to current active branch).

.EXAMPLE
    .\scripts\safe_push.ps1 -Message "research(eastern): add 5 verified candidates in Angul"

.EXAMPLE
    .\scripts\safe_push.ps1 -Files @("data\research\round2\eastern\candidates.json") -Message "research(eastern): update coordinates"
#>

[CmdletBinding()]
param(
    [string]$Message = "",
    [string[]]$Files = @(),
    [string]$Branch = ""
)

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
    Write-Host "=== O-TRAVELZ -- SAFE GIT PUSH HELPER                          ===" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ""

    # 1. Determine active branch
    if (-not $Branch) {
        $Branch = (& git rev-parse --abbrev-ref HEAD 2>&1).Trim()
        if ($LASTEXITCODE -ne 0 -or -not $Branch) {
            Write-Fail "Could not determine current Git branch."
        }
    }
    Write-Info "Active Branch: $Branch"

    # 2. Stage files if explicitly provided
    if ($Files.Count -gt 0) {
        Write-Info "Staging specified files: $($Files -join ', ')"
        foreach ($f in $Files) {
            & git add $f
            if ($LASTEXITCODE -ne 0) {
                Write-Fail "Failed to stage file: $f"
            }
        }
    }

    # 3. Check staged files
    $stagedFiles = (& git diff --cached --name-only 2>&1)
    $hasStaged = [bool]($stagedFiles -and $stagedFiles.Count -gt 0)

    # 4. Secret & Sensitive File Scan
    if ($hasStaged) {
        Write-Info "Inspecting staged files for sensitive patterns..."
        $forbiddenPatterns = @(
            "^\.env$",
            "^\.env\..+$",
            "\.pem$",
            "\.key$",
            "\.pfx$",
            "id_rsa",
            "id_ed25519",
            "\.otravelz-local\.json$",
            "\.otravelz-bootstrap-state\.json$"
        )

        foreach ($file in $stagedFiles) {
            if ($file -eq ".env.example" -or $file -eq "frontend/.env.example") {
                continue
            }
            foreach ($pattern in $forbiddenPatterns) {
                if ($file -match $pattern) {
                    Write-Fail "Security violation: Staged file '$file' matches forbidden pattern '$pattern'. Unstage it with 'git restore --staged $file' before pushing."
                }
            }
        }
        Write-Success "No sensitive files detected in staging area."
    }

    # 5. Git Diff Check (whitespace / merge markers)
    Write-Info "Running git diff check..."
    & git diff --check --cached 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "git diff --check detected formatting or conflict marker issues in staged files."
    }
    Write-Success "Git diff check passed."

    # 6. Run Project & Research Validation
    $venvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"
    if (Test-Path $venvPython) {
        Write-Info "Running project context check..."
        $contextRes = & $venvPython "scripts\check_project_context.py" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "$contextRes" -ForegroundColor Yellow
            Write-Fail "scripts\check_project_context.py failed. Fix context inconsistencies before pushing."
        }
        Write-Success "Project context check passed."

        Write-Info "Running Round 2 research validation..."
        $researchRes = & $venvPython "scripts\validate_round2_research.py" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "$researchRes" -ForegroundColor Yellow
            Write-Fail "scripts\validate_round2_research.py failed. Fix data errors before pushing."
        }
        Write-Success "Research validation passed."
    } else {
        Write-Warn "Python virtualenv not found at .venv. Skipping local python validation checks."
    }

    # 7. Commit staged changes if Message provided
    if ($hasStaged -and $Message) {
        Write-Info "Committing changes with message: '$Message'..."
        & git commit -m $Message
        if ($LASTEXITCODE -ne 0) {
            Write-Fail "git commit failed."
        }
        Write-Success "Commit created successfully."
    } elseif ($hasStaged -and -not $Message) {
        Write-Warn "There are staged changes, but no -Message parameter was provided. Proceeding to push existing unpushed commits."
    }

    # 8. Check if there are unpushed commits or dirty unstaged work
    $uncommittedWork = (& git status --porcelain 2>&1)

    # 9. Fetch remote origin
    Write-Info "Fetching latest changes from origin..."
    & git fetch origin --prune
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "git fetch origin failed. Check your internet connection or GitHub credentials."
    }

    # 10. Check if remote branch is ahead
    $remoteRef = "origin/$Branch"
    $remoteExists = (& git rev-parse --verify $remoteRef 2>$null)

    if ($remoteExists) {
        $behindCount = [int]((& git rev-list --count HEAD..$remoteRef 2>&1).Trim())
        if ($behindCount -gt 0) {
            Write-Info "Remote branch $remoteRef is ahead by $behindCount commit(s)."

            if ($uncommittedWork) {
                Write-Fail "You have unstaged/uncommitted local changes. Please commit or stash them before rebasing on $remoteRef."
            }

            Write-Info "Attempting safe rebase on $remoteRef..."
            & git rebase $remoteRef
            if ($LASTEXITCODE -ne 0) {
                Write-Warn "Rebase encountered conflicts. Aborting rebase to keep your repository safe."
                & git rebase --abort 2>&1 | Out-Null
                Write-Fail "Merge conflict detected during rebase. Please resolve conflicts manually, verify tests, and push."
            }
            Write-Success "Rebased cleanly on $remoteRef."
        }
    }

    # 11. Push normally (NEVER force push)
    Write-Info "Pushing to origin $Branch (standard push, NO force)..."
    & git push origin $Branch
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "git push failed. Check if remote has new commits that need pulling."
    }

    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ">>> SAFE PUSH SUCCESSFUL <<<" -ForegroundColor Green
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host "Pushed to: origin/$Branch" -ForegroundColor White
    Write-Host ""
} finally {
    Pop-Location
}
