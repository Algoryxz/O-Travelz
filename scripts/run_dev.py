#!/usr/bin/env python3
"""
O-Travelz One-Command Local Development Runner.
Cross-platform (Windows, macOS, Linux), dependency-free (standard library only).

Automates:
1. System preflight checks (Python >= 3.10, Node.js >= 18, npm, port availability).
2. Python virtual environment (.venv) creation and dependency synchronization.
3. Frontend dependencies installation/verification.
4. Environment configuration (.env creation from .env.example if missing).
5. Database migrations and idempotent canonical dataset bootstrap.
6. Concurrent startup of FastAPI backend and Vite frontend with multiplexed logging.
7. Active readiness verification on http://127.0.0.1:8000/health and http://localhost:5173.
8. Clean graceful shutdown on Ctrl+C (stopping process trees with no orphan processes).
"""
from __future__ import annotations

import argparse
import hashlib
import os
import platform
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

# Unbuffer output for real-time live streaming
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(line_buffering=True)
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(line_buffering=True)
except Exception:
    pass

# Paths
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = WORKSPACE_ROOT / "backend"
FRONTEND_DIR = WORKSPACE_ROOT / "frontend"
SCRIPTS_DIR = WORKSPACE_ROOT / "scripts"
VENV_DIR = WORKSPACE_ROOT / ".venv"


IS_WINDOWS = platform.system() == "Windows"
VENV_PYTHON = VENV_DIR / ("Scripts/python.exe" if IS_WINDOWS else "bin/python")
VENV_PIP = VENV_DIR / ("Scripts/pip.exe" if IS_WINDOWS else "bin/pip")

# ANSI Color formatting (if terminal supports it)
USE_COLOR = sys.stdout.isatty() or os.environ.get("FORCE_COLOR") == "1"


def style(text: str, color: str = "", bold: bool = False) -> str:
    if not USE_COLOR:
        return text
    colors = {
        "cyan": "\033[96m",
        "green": "\033[92m",
        "yellow": "\033[93m",
        "red": "\033[91m",
        "magenta": "\033[95m",
        "blue": "\033[94m",
        "gray": "\033[90m",
        "reset": "\033[0m",
    }
    prefix = ""
    if bold:
        prefix += "\033[1m"
    if color in colors:
        prefix += colors[color]
    return f"{prefix}{text}\033[0m"


def print_banner(title: str, color: str = "cyan") -> None:
    sep = "=" * 66
    print(style(f"\n{sep}", color, bold=True))
    print(style(f"=== {title} ===", color, bold=True))
    print(style(f"{sep}\n", color, bold=True))


# ============================================================================
# 1. PREFLIGHT CHECKS
# ============================================================================

def check_python_version() -> None:
    major, minor = sys.version_info.major, sys.version_info.minor
    if major < 3 or (major == 3 and minor < 10):
        print(style(f"[PREFLIGHT FAIL] Python {major}.{minor} is not supported. O-Travelz requires Python >= 3.10.", "red", bold=True))
        print(style("                 Please install Python 3.11 or 3.12 from https://www.python.org/downloads/", "yellow"))
        sys.exit(1)
    print(style(f"[PREFLIGHT OK] Python {major}.{minor}.{sys.version_info.micro} detected.", "green"))


def check_node_and_npm() -> None:
    node_cmd = shutil.which("node")
    npm_cmd = shutil.which("npm")
    if not node_cmd or not npm_cmd:
        print(style("[PREFLIGHT FAIL] Node.js or npm is not installed or not in PATH.", "red", bold=True))
        print(style("                 Please install Node.js 18+ from https://nodejs.org/", "yellow"))
        sys.exit(1)

    try:
        node_ver = subprocess.check_output([node_cmd, "--version"], text=True).strip()
        npm_ver = subprocess.check_output([npm_cmd, "--version"], text=True).strip()
        print(style(f"[PREFLIGHT OK] Node.js {node_ver} | npm {npm_ver} detected.", "green"))
    except Exception as e:
        print(style(f"[PREFLIGHT WARN] Could not query node/npm version: {e}", "yellow"))


def is_port_open(host: str, port: int, timeout: float = 0.5) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(timeout)
        try:
            s.connect((host, port))
            return True
        except (socket.timeout, ConnectionRefusedError, OSError):
            return False


def check_port_conflicts(backend_only: bool, frontend_only: bool) -> tuple[bool, bool]:
    """
    Check ports 8000 and 5173.
    Returns (backend_already_running, frontend_already_running).
    """
    backend_running = False
    frontend_running = False

    if not frontend_only and is_port_open("127.0.0.1", 8000):
        # Probe /health to check if it's our own backend
        try:
            req = urllib.request.Request("http://127.0.0.1:8000/health")
            with urllib.request.urlopen(req, timeout=1.0) as resp:
                if resp.status == 200 and b'"status":"ok"' in resp.read():
                    backend_running = True
                    print(style("[PREFLIGHT OK] O-Travelz Backend is already running on http://127.0.0.1:8000 (reusing).", "green"))
        except Exception:
            pass

        if not backend_running:
            print(style("[PREFLIGHT CONFLICT] Port 8000 is occupied by another process.", "red", bold=True))
            print(style("                     Please free port 8000 before running the stack, or run with -FrontendOnly.", "yellow"))
            sys.exit(1)

    if not backend_only and is_port_open("127.0.0.1", 5173):
        # Probe http://localhost:5173
        try:
            req = urllib.request.Request("http://localhost:5173")
            with urllib.request.urlopen(req, timeout=1.0) as resp:
                if resp.status == 200:
                    frontend_running = True
                    print(style("[PREFLIGHT OK] Vite Frontend dev server is already running on http://localhost:5173 (reusing).", "green"))
        except Exception:
            pass

        if not frontend_running:
            print(style("[PREFLIGHT CONFLICT] Port 5173 is occupied by another process.", "red", bold=True))
            print(style("                     Please free port 5173 before running the stack, or run with -BackendOnly.", "yellow"))
            sys.exit(1)

    return backend_running, frontend_running


# ============================================================================
# 2. PYTHON ENVIRONMENT SETUP (.venv)
# ============================================================================

def get_file_hash(path: Path) -> str:
    if not path.exists():
        return ""
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def setup_python_environment() -> Path:
    if not VENV_DIR.exists() or not VENV_PYTHON.exists():
        print(style("\n[SETUP 1/4] Creating Python virtual environment in .venv...", "yellow"))
        subprocess.check_call([sys.executable, "-m", "venv", str(VENV_DIR)])
        print(style(f"            Virtual environment created: {VENV_PYTHON}", "green"))
    else:
        print(style(f"[PREFLIGHT OK] Python virtualenv ready: {VENV_PYTHON}", "green"))

    # Check dependencies
    reqs_file = BACKEND_DIR / "requirements.txt"
    if not reqs_file.exists():
        print(style(f"[SETUP FAIL] {reqs_file} not found.", "red", bold=True))
        sys.exit(1)

    hash_file = VENV_DIR / ".requirements.sha256"
    current_hash = get_file_hash(reqs_file)
    stored_hash = hash_file.read_text().strip() if hash_file.exists() else ""

    # Verify if imports work
    check_code = "import fastapi, uvicorn, sqlalchemy, pydantic, alembic; print('IMPORTS_OK')"
    proc = subprocess.run([str(VENV_PYTHON), "-c", check_code], capture_output=True, text=True)
    imports_valid = proc.returncode == 0 and "IMPORTS_OK" in proc.stdout

    if current_hash != stored_hash or not imports_valid:
        print(style("\n[SETUP 2/4] Installing/updating backend Python dependencies...", "yellow"))
        cmd = [str(VENV_PYTHON), "-m", "pip", "install", "-q", "-r", str(reqs_file)]
        res = subprocess.run(cmd)
        if res.returncode != 0:
            print(style("[SETUP FAIL] Failed to install backend dependencies via pip.", "red", bold=True))
            sys.exit(1)
        hash_file.write_text(current_hash)
        print(style("            Backend Python dependencies installed and verified.", "green"))
    else:
        print(style("[PREFLIGHT OK] Backend Python dependencies are up to date.", "green"))

    return VENV_PYTHON


# ============================================================================
# 3. FRONTEND ENVIRONMENT SETUP (node_modules)
# ============================================================================

def setup_frontend_environment() -> None:
    pkg_json = FRONTEND_DIR / "package.json"
    if not pkg_json.exists():
        print(style(f"[SETUP FAIL] {pkg_json} not found.", "red", bold=True))
        sys.exit(1)

    node_modules = FRONTEND_DIR / "node_modules"
    lock_file = FRONTEND_DIR / "package-lock.json"
    hash_file = FRONTEND_DIR / "node_modules/.package_hash"

    current_hash = get_file_hash(pkg_json) + get_file_hash(lock_file)
    stored_hash = hash_file.read_text().strip() if hash_file.exists() else ""

    if not node_modules.exists() or current_hash != stored_hash:
        print(style("\n[SETUP 3/4] Installing frontend npm dependencies...", "yellow"))
        npm_cmd = "npm.cmd" if IS_WINDOWS else "npm"
        
        # Use npm install
        res = subprocess.run([npm_cmd, "install", "--no-audit", "--no-fund", "--loglevel=error"], cwd=str(FRONTEND_DIR))
        if res.returncode != 0:
            print(style("[SETUP FAIL] npm install failed.", "red", bold=True))
            sys.exit(1)

        try:
            hash_file.write_text(current_hash)
        except Exception:
            pass
        print(style("            Frontend dependencies installed and verified.", "green"))
    else:
        print(style("[PREFLIGHT OK] Frontend npm dependencies are up to date.", "green"))


# ============================================================================
# 4. ENVIRONMENT CONFIGURATION (.env)
# ============================================================================

def setup_environment_config() -> None:
    env_file = WORKSPACE_ROOT / ".env"
    env_example = WORKSPACE_ROOT / ".env.example"

    if not env_file.exists():
        if env_example.exists():
            shutil.copy(env_example, env_file)
            print(style("[CONFIG OK] Created .env from .env.example", "green"))
        else:
            env_file.write_text(
                "ENVIRONMENT=development\n"
                "DATABASE_URL=postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz\n"
                "STORAGE_BACKEND=local\n"
                "LOCAL_STORAGE_BASE_PATH=./data/images\n"
            )
            print(style("[CONFIG OK] Created default .env", "green"))
    else:
        print(style("[CONFIG OK] Existing .env preserved (never overwritten).", "green"))

    # Inspect AI provider status safely without printing secrets
    ai_status = "mock (Deterministic Rule-Based Whole-Odisha Ground Truth)"
    if env_file.exists():
        content = env_file.read_text()
        has_gemini = "AI_GEMINI_API_KEY=" in content and not content.split("AI_GEMINI_API_KEY=")[1].split("\n")[0].strip() in ("", '""', "''")
        has_azure = "AZURE_OPENAI_API_KEY=" in content and not content.split("AZURE_OPENAI_API_KEY=")[1].split("\n")[0].strip() in ("", '""', "''")
        has_groq = "AI_GROQ_API_KEY=" in content and not content.split("AI_GROQ_API_KEY=")[1].split("\n")[0].strip() in ("", '""', "''")
        if has_gemini:
            ai_status = "Google Gemini Free-Tier (active)"
        elif has_azure:
            ai_status = "Azure OpenAI (active)"
        elif has_groq:
            ai_status = "Groq High-Speed Inference (active)"

    print(style(f"[CONFIG] AI Travel Copilot Mode: {ai_status}", "cyan"))


# ============================================================================
# 5. DATABASE SERVICE & BOOTSTRAP
# ============================================================================

def ensure_database_service() -> bool:
    """
    Checks if database connectivity is available.
    If PostgreSQL on port 5433/5432 is expected and not running, attempts to start it via Docker Compose.
    """
    env_file = WORKSPACE_ROOT / ".env"
    db_url = "postgresql://otravelz:otravelz@127.0.0.1:5433/otravelz"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("DATABASE_URL="):
                db_url = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

    # If using local postgres on 5433/5432 and port is not open
    if "5433" in db_url or "5432" in db_url:
        port = 5433 if "5433" in db_url else 5432
        if not is_port_open("127.0.0.1", port, timeout=0.8):
            docker_cmd = shutil.which("docker")
            compose_file = WORKSPACE_ROOT / "infra/docker-compose.yml"
            if docker_cmd and compose_file.exists():
                print(style(f"\n[DATABASE] PostgreSQL/PostGIS is not running on port {port}. Starting container via Docker...", "yellow"))
                subprocess.run([docker_cmd, "compose", "-f", str(compose_file), "-p", "infra", "up", "-d", "db"], capture_output=True)
                # Wait for port to open
                start_time = time.time()
                while time.time() - start_time < 20:
                    if is_port_open("127.0.0.1", port, timeout=0.8):
                        print(style(f"           PostgreSQL/PostGIS is now ready on port {port}.", "green"))
                        time.sleep(1.0)
                        return True
                    time.sleep(1.0)
                print(style(f"           [WARN] Docker DB container started but port {port} not open yet.", "yellow"))
            else:
                print(style(f"[DATABASE NOTICE] PostgreSQL is not running on port {port}. (If using Docker, run 'docker compose -f infra/docker-compose.yml -p infra up -d db')", "yellow"))
    return True


def bootstrap_database(python_exe: Path) -> None:
    ensure_database_service()
    print(style("\n[SETUP 4/4] Bootstrapping database and verifying dataset invariants...", "yellow"))
    bootstrap_script = SCRIPTS_DIR / "bootstrap_database.py"
    if not bootstrap_script.exists():
        print(style(f"[WARN] {bootstrap_script} not found, skipping bootstrap.", "yellow"))
        return

    env = os.environ.copy()
    env["PYTHONPATH"] = str(BACKEND_DIR)

    res = subprocess.run([str(python_exe), str(bootstrap_script)], cwd=str(WORKSPACE_ROOT), env=env)
    if res.returncode != 0:
        print(style("[BOOTSTRAP NOTE] Database bootstrap completed with notices.", "yellow"))
    else:
        print(style("                 Database bootstrap completed successfully.", "green"))



# ============================================================================
# 6. RUN TEST SUITE MODE (-Test / --test)
# ============================================================================

def run_test_suite(python_exe: Path) -> int:
    print_banner("RUNNING O-TRAVELZ AUTOMATED TEST SUITES", "cyan")

    env = os.environ.copy()
    env["PYTHONPATH"] = str(BACKEND_DIR)

    # 1. Backend AI and core tests
    print(style("\n[1/3] Running backend unit & regression tests...", "yellow"))
    pytest_res = subprocess.run(
        [
            str(python_exe),
            "-m",
            "pytest",
            "backend/tests/test_ai_global_copilot_context.py",
            "backend/tests/test_ai_grounded_conversation.py",
            "backend/tests/test_ai_provider_adapter.py",
            "backend/tests/test_ai_tool_adapter.py",
            "backend/tests/test_ai_resilience.py",
            "backend/tests/test_ai_grounding_verifier.py",
            "backend/tests/test_ai_latency_budget.py",
            "backend/tests/test_multilingual_taxonomy.py",
            "backend/tests/test_search_normalizer_multilingual.py",
            "backend/tests/test_search_service.py",
            "-q",
        ],
        cwd=str(WORKSPACE_ROOT),
        env=env,
    )

    # 2. Frontend Vitest tests
    print(style("\n[2/3] Running frontend Vitest test suite...", "yellow"))
    npm_cmd = "npm.cmd" if IS_WINDOWS else "npm"
    vitest_res = subprocess.run([npm_cmd, "test", "--", "--run"], cwd=str(FRONTEND_DIR))

    # 3. Production Build
    print(style("\n[3/3] Running frontend production build (tsc && vite build)...", "yellow"))
    build_res = subprocess.run([npm_cmd, "run", "build"], cwd=str(FRONTEND_DIR))

    success = pytest_res.returncode == 0 and vitest_res.returncode == 0 and build_res.returncode == 0
    if success:
        print_banner("ALL AUTOMATED TESTS AND PRODUCTION BUILD PASSED", "green")
        return 0
    else:
        print_banner("SOME TESTS OR BUILD STEP FAILED", "red")
        return 1


# ============================================================================
# 7. SERVICE LAUNCHER & MULTIPLEXED PROCESS MANAGEMENT
# ============================================================================

running_processes: list[subprocess.Popen] = []


def kill_process_tree(proc: subprocess.Popen) -> None:
    if proc.poll() is not None:
        return
    if IS_WINDOWS:
        try:
            subprocess.run(["taskkill", "/PID", str(proc.pid), "/T", "/F"], capture_output=True)
        except Exception:
            pass
    else:
        try:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        except Exception:
            try:
                proc.terminate()
            except Exception:
                pass


def stream_logs(process: subprocess.Popen, prefix: str, color: str) -> None:
    try:
        for line in iter(process.stdout.readline, b""):
            if not line:
                break
            decoded = line.decode("utf-8", errors="replace").rstrip()
            print(f"{style(prefix, color, bold=True)} {decoded}", flush=True)
    except Exception:
        pass



def wait_for_health(url: str, timeout: float = 20.0, expect_text: str = "") -> bool:
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=1.0) as resp:
                if resp.status == 200:
                    if not expect_text or expect_text in resp.read().decode("utf-8", errors="ignore"):
                        return True
        except Exception:
            pass
        time.sleep(0.5)
    return False


def run_stack(
    python_exe: Path,
    backend_only: bool,
    frontend_only: bool,
) -> int:
    global running_processes
    backend_proc: subprocess.Popen | None = None
    frontend_proc: subprocess.Popen | None = None

    env = os.environ.copy()
    env["PYTHONPATH"] = str(BACKEND_DIR)

    npm_cmd = "npm.cmd" if IS_WINDOWS else "npm"

    # Start Backend if not already alive
    backend_is_live = is_port_open("127.0.0.1", 8000) and wait_for_health("http://127.0.0.1:8000/health", timeout=1.0)
    if not frontend_only and not backend_is_live:
        backend_cmd = [
            str(python_exe),
            "-m",
            "uvicorn",
            "app.main:app",
            "--app-dir",
            str(BACKEND_DIR),
            "--host",
            "127.0.0.1",
            "--port",
            "8000",
        ]
        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=str(WORKSPACE_ROOT),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            preexec_fn=None if IS_WINDOWS else os.setsid,
        )
        running_processes.append(backend_proc)
        threading.Thread(target=stream_logs, args=(backend_proc, "[BACKEND]", "cyan"), daemon=True).start()

    # Start Frontend if not already alive
    frontend_is_live = is_port_open("127.0.0.1", 5173) and wait_for_health("http://localhost:5173", timeout=1.0)
    if not backend_only and not frontend_is_live:
        frontend_cmd = [npm_cmd, "run", "dev"]
        frontend_proc = subprocess.Popen(
            frontend_cmd,
            cwd=str(FRONTEND_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            preexec_fn=None if IS_WINDOWS else os.setsid,
        )
        running_processes.append(frontend_proc)
        threading.Thread(target=stream_logs, args=(frontend_proc, "[FRONTEND]", "magenta"), daemon=True).start()

    # Verify Health
    print(style("\nWaiting for service readiness...", "yellow"), flush=True)
    backend_ok = frontend_only or wait_for_health("http://127.0.0.1:8000/health", timeout=25.0, expect_text="status")
    frontend_ok = backend_only or wait_for_health("http://localhost:5173", timeout=25.0)


    if not backend_only and not frontend_ok:
        print(style("[WARN] Frontend did not respond on http://localhost:5173 within timeout, but process is running.", "yellow"))

    if not frontend_only and not backend_ok:
        print(style("[FAIL] Backend failed to reach healthy status on http://127.0.0.1:8000/health.", "red", bold=True))
        for p in running_processes:
            kill_process_tree(p)
        return 1

    # Print Success Banner
    print_banner("O-TRAVELZ LOCAL STACK IS READY", "green")
    if not backend_only:
        print(f"  {style('Frontend Application:', 'green', bold=True)} {style('http://localhost:5173', 'cyan', bold=True)}")
    if not frontend_only:
        print(f"  {style('Backend / REST API:  ', 'green', bold=True)} {style('http://127.0.0.1:8000', 'cyan', bold=True)}")
        print(f"  {style('Interactive API Docs:', 'green', bold=True)} {style('http://127.0.0.1:8000/docs', 'cyan', bold=True)}")
    print(style("=" * 66, "green", bold=True))
    print(style("\nPress Ctrl+C to stop all development services.\n", "gray"))

    # Keep alive loop
    try:
        while True:
            for p in running_processes:
                if p.poll() is not None:
                    print(style(f"\n[STACK NOTICE] A process exited with code {p.returncode}.", "yellow"))
                    return p.returncode or 0
            time.sleep(1.0)
    except KeyboardInterrupt:
        print(style("\n\nShutting down O-Travelz services gracefully...", "yellow"))
    finally:
        for p in running_processes:
            kill_process_tree(p)
        print(style("[OK] All development processes stopped cleanly.", "green"))

    return 0


# ============================================================================
# MAIN ENTRYPOINT
# ============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(description="O-Travelz One-Command Local Development Setup & Runner")
    parser.add_argument("--skip-bootstrap", action="store_true", help="Skip database migrations and dataset bootstrap")
    parser.add_argument("--backend-only", action="store_true", help="Start only the FastAPI backend server")
    parser.add_argument("--frontend-only", action="store_true", help="Start only the Vite frontend dev server")
    parser.add_argument("--test", action="store_true", help="Run automated test suite and exit")

    args = parser.parse_args()

    print_banner("O-TRAVELZ ONE-COMMAND LOCAL DEVELOPMENT SETUP", "cyan")

    # 1. Preflight
    check_python_version()
    check_node_and_npm()
    backend_running, frontend_running = check_port_conflicts(args.backend_only, args.frontend_only)

    # 2. Python .venv
    python_exe = setup_python_environment()

    # 3. Frontend node_modules
    if not args.backend_only:
        setup_frontend_environment()

    # 4. Config .env
    setup_environment_config()

    # 5. Handle --test mode
    if args.test:
        return run_test_suite(python_exe)

    # 6. Database bootstrap
    if not args.skip_bootstrap and not args.frontend_only and not backend_running:
        bootstrap_database(python_exe)

    # 7. Start services
    return run_stack(
        python_exe,
        backend_only=args.backend_only,
        frontend_only=args.frontend_only,
    )


if __name__ == "__main__":
    sys.exit(main())

