<#
.SYNOPSIS
    O-Travelz Development Stack Startup Wrapper.
    SOA IDEATHON 2026 -- ROUND 2

.DESCRIPTION
    Launches the verified local development stack by invoking start.ps1.
    Starts Docker PostGIS database, FastAPI backend (http://127.0.0.1:8000),
    and Vite frontend (http://localhost:5173) with multiplexed logs and clean shutdown.

.PARAMETER NoWait
    Do not wait for active log streaming.

.EXAMPLE
    .\scripts\start_dev.ps1
#>

[CmdletBinding()]
param(
    [switch]$NoWait
)

$RepoRoot = (Get-Item $PSScriptRoot).Parent.FullName
$StartScript = Join-Path $RepoRoot "start.ps1"

if (Test-Path $StartScript) {
    if ($NoWait) {
        & powershell -ExecutionPolicy Bypass -File $StartScript -NoWait
    } else {
        & powershell -ExecutionPolicy Bypass -File $StartScript
    }
} else {
    Write-Host "[FAIL] start.ps1 not found at repository root: $StartScript" -ForegroundColor Red
    exit 1
}
