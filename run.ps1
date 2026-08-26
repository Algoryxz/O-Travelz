<#
.SYNOPSIS
    O-Travelz One-Command Local Development Setup & Runner.

.DESCRIPTION
    Sets up Python virtual environment (.venv), installs backend and frontend
    dependencies, configures .env from .env.example, bootstraps the database,
    and starts both FastAPI and Vite with health checks and live logs.

.PARAMETER SkipBootstrap
    Skip the database migrations and data bootstrap step.

.PARAMETER BackendOnly
    Start only the FastAPI backend service on http://127.0.0.1:8000.

.PARAMETER FrontendOnly
    Start only the Vite frontend dev server on http://localhost:5173.

.PARAMETER Test
    Run the automated backend test suite, frontend vitest suite, and production build, then exit.

.EXAMPLE
    .\run.ps1

.EXAMPLE
    .\run.ps1 -SkipBootstrap

.EXAMPLE
    .\run.ps1 -Test
#>

[CmdletBinding()]
param(
    [switch]$SkipBootstrap,
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$Test
)

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot

# 1. Locate available Python interpreter
$PythonCmd = $null
$VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"

if (Test-Path $VenvPython) {
    $PythonCmd = $VenvPython
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $PythonCmd = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $PythonCmd = "py"
}

if (-not $PythonCmd) {
    Write-Host ""
    Write-Host "[PREFLIGHT FAIL] Python is not installed or not in PATH." -ForegroundColor Red
    Write-Host "                 Please install Python 3.11+ from https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# 2. Build arguments list
$ScriptPath = Join-Path $RepoRoot "scripts\run_dev.py"
$ArgsList = @($ScriptPath)

if ($SkipBootstrap) { $ArgsList += "--skip-bootstrap" }
if ($BackendOnly)    { $ArgsList += "--backend-only" }
if ($FrontendOnly)   { $ArgsList += "--frontend-only" }
if ($Test)           { $ArgsList += "--test" }

# 3. Delegate execution to canonical runner
& $PythonCmd $ArgsList

exit $LASTEXITCODE
