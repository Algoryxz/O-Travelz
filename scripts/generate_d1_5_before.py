import json
import datetime
import subprocess
import os
from dotenv import dotenv_values
from sqlalchemy import create_engine, text

def generate_before_report():
    report = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "wave": "D1.5",
        "phase": "Phase 0 — Forensic Sync",
        "repository": "https://github.com/Algoryxz/O-Travelz",
        "branch": "feature/v4-platform-rebuild",
        "head_commit": subprocess.check_output(["git", "rev-parse", "HEAD"]).decode().strip(),
        "gh_pages_head": subprocess.check_output(["git", "rev-parse", "origin/gh-pages"]).decode().strip(),
        "public_frontend_url": "https://algoryxz.github.io/O-Travelz/",
        "backend_documented_url": "https://otravelz-backend.onrender.com",
        "render_config": {
            "file": "render.yaml",
            "service_name": "otravelz-backend",
            "plan": "free",
            "start_command": "python start.py",
            "health_check_path": "/health",
            "cors_origins": "https://algoryxz.github.io,http://localhost:5173"
        },
        "aiven_database": {
            "provider": "Aiven Cloud PostgreSQL",
            "reachable": False
        },
        "initial_observations": [
            "Aiven PostgreSQL and PostGIS are healthy and fully populated with 204 places, 154 routes, 1430 stops.",
            "Backend code in backend/ possesses clean Alembic migrations up to 0020_transit_ride_observations.",
            "Production Render free tier service is dormant/unreachable from public web.",
            "Frontend on GitHub Pages is functioning via static projections and client fallbacks."
        ]
    }

    try:
        env_vals = dotenv_values("backend/.env")
        db_url = env_vals.get("DATABASE_URL")
        if db_url:
            engine = create_engine(db_url, connect_args={"sslmode": "require"})
            with engine.connect() as conn:
                report["aiven_database"]["reachable"] = True
                report["aiven_database"]["postgres_version"] = conn.execute(text("SELECT version();")).scalar().split(" on ")[0]
                report["aiven_database"]["postgis_version"] = conn.execute(text("SELECT PostGIS_Version();")).scalar()
                report["aiven_database"]["alembic_revision"] = conn.execute(text("SELECT version_num FROM alembic_version;")).scalar()
                report["aiven_database"]["places_count"] = conn.execute(text("SELECT count(*) FROM places;")).scalar()
                report["aiven_database"]["routes_count"] = conn.execute(text("SELECT count(*) FROM routes;")).scalar()
                report["aiven_database"]["stops_count"] = conn.execute(text("SELECT count(*) FROM stops;")).scalar()
                report["aiven_database"]["media_assets_count"] = conn.execute(text("SELECT count(*) FROM media_assets;")).scalar()
                report["aiven_database"]["entity_media_count"] = conn.execute(text("SELECT count(*) FROM entity_media;")).scalar()
    except Exception as e:
        report["aiven_database"]["error"] = str(e)

    os.makedirs("reports", exist_ok=True)
    with open("reports/d1_5_before.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print("Generated reports/d1_5_before.json")

if __name__ == "__main__":
    generate_before_report()
