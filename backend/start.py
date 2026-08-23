"""Production entrypoint running Alembic migrations before starting Uvicorn."""
import os
import sys
import subprocess


def run_migrations() -> None:
    print("[STARTUP] Running database migrations (alembic upgrade head)...", flush=True)
    res = subprocess.run(
        [sys.executable, "-m", "alembic", "-c", "alembic.ini", "upgrade", "head"],
        check=False,
    )
    if res.returncode != 0:
        print(
            f"[STARTUP ERROR] Database migration failed with exit code {res.returncode}. Aborting startup.",
            file=sys.stderr,
            flush=True,
        )
        sys.exit(res.returncode)
    print("[STARTUP] Database migrations successfully applied to head.", flush=True)


def start_server() -> None:
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    print(f"[STARTUP] Starting Uvicorn server on {host}:{port}...", flush=True)
    import uvicorn
    uvicorn.run("app.main:app", host=host, port=port)


if __name__ == "__main__":
    run_migrations()
    start_server()
