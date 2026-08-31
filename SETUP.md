# O-TRAVELZ Development Environment Setup

> **SOA IDEATHON 2026 — ROUND 2**
> Official Repository: [https://github.com/Smarak-padhi/O-Travelz.git](https://github.com/Smarak-padhi/O-Travelz.git)

---

## New teammate? Run this one command.

Open **PowerShell** on your Windows laptop and paste this single command:

```powershell
$u='https://raw.githubusercontent.com/Smarak-padhi/O-Travelz/main/scripts/bootstrap_windows.ps1'; $p="$env:TEMP\otravelz-bootstrap.ps1"; Invoke-WebRequest $u -OutFile $p; powershell -ExecutionPolicy Bypass -File $p
```

---

## What Happens Automatically

1. **Machine & Tool Detection**: Verifies or installs Git for Windows, GitHub CLI, and **Python 3.12** (via official winget packages).
2. **GitHub Web Authentication**: Launches browser login (`gh auth login --web`) if you are not already logged in.
3. **Role Selection**: Asks for your teammate profile and configures your assigned region:
   - **Rudra** — Eastern Odisha Research (`data/research/round2/eastern/`)
   - **Akriti** — Western Odisha Research (`data/research/round2/western/`)
   - **Susmita** — Southern Odisha Research (`data/research/round2/southern/`)
   - **Punam** — Northern Odisha Research (`data/research/round2/northern/`)
   - **Deepti / Smarak** — Core Integration (`backend / frontend / data`)
4. **Environment Mode**:
   - **Researcher Mode** (Default for researchers): Fast, lightweight setup. Installs Git, GitHub CLI, Python 3.12, virtual environment, and regional validators without forcing Docker or Node.js.
   - **Full Developer Mode** (Core team or `-Full`): Installs complete stack including Node.js LTS, Docker Desktop (WSL2), PostGIS database, Alembic migrations, and frontend build dependencies.
5. **Project Setup**: Clones or updates the repository, creates `.venv`, installs dependencies, configures `.env`, and runs initial validation.
6. **Resumable Installation**: If Docker Desktop / WSL requires a system restart, the installer saves state and prompts you to restart Windows and run the identical command to resume seamlessly.

---

## Next Steps After Setup

1. Open the repository folder in **Antigravity** (or VS Code).
2. Tell Antigravity:
   > *"Read AGENTS.md, detect my role, inspect latest main, and help me continue my assigned Round 2 work."*
3. Start working in your assigned domain.

---

## Daily Helper Commands

| Action | Command |
|---|---|
| Safe Git Push | `powershell -ExecutionPolicy Bypass -File .\scripts\safe_push.ps1 -Message "your commit message"` |
| Update from Main | `powershell -ExecutionPolicy Bypass -File .\scripts\update_project.ps1` |
| Validate Regional Data | `.\.venv\Scripts\python.exe scripts\validate_round2_research.py` |
| Check Project Context | `.\.venv\Scripts\python.exe scripts\check_project_context.py` |
| Run Health Diagnostics | `powershell -ExecutionPolicy Bypass -File .\doctor.ps1` |
| Start Dev Server (Core) | `powershell -ExecutionPolicy Bypass -File .\scripts\start_dev.ps1` |
