import json
import datetime
import os

def generate_hosting_decision():
    report = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "wave": "D1.5",
        "phase": "Phase 3 — Ponytail Backend Hosting Audit",
        "decision": "KEEP_RENDER",
        "rationale": "Render is already fully integrated with repository configuration (render.yaml), GitHub repository triggers, and Aiven Cloud PostgreSQL networking. Migrating to another hosting provider (Railway, Fly.io, Cloud Run) would introduce new account dependencies, domain changes, or credit card requirements without solving the fundamental configuration need. Repairing the startup resilience and ensuring proper DATABASE_URL injection solves the root cause with zero new vendor friction.",
        "candidates_evaluated": {
            "Render_FastAPI_Free_Repaired": {
                "score_total": 91,
                "cold_start": "30-50s on sleep wakeup (acceptable with frontend fail-safe design)",
                "reliability": "High once booted with connection pooling and pre-ping",
                "free_tier_viability": "Free web service tier (750 hours/month, sleep after 15 min inactivity)",
                "deployment_simplicity": "High (native render.yaml blueprint in git root)",
                "aiven_networking": "Direct outbound SSL connection supported (port 25047)",
                "environment_management": "Dashboard + YAML support with sync: false for secret protection",
                "logs": "Real-time streaming build and runtime logs in dashboard",
                "rollback": "One-click deploy history rollback in dashboard",
                "https": "Automatic Let's Encrypt TLS with zero-config SSL certificates",
                "latency_from_india": "Singapore / Frankfurt regions deliver ~50-120ms latency",
                "github_integration": "Direct webhook and branch tracking"
            },
            "Render_Paid_Starter": {
                "score_total": 86,
                "note": "Eliminates sleep/cold-start ($7/mo), identical architecture. Optional future upgrade path if traffic warrants."
            },
            "Railway": {
                "score_total": 72,
                "note": "Requires $5/mo minimum plan after trial; introduces third-party orchestration toolchain."
            },
            "Fly_io": {
                "score_total": 70,
                "note": "Requires flyctl CLI, credit card on file, Dockerfile maintenance."
            },
            "Koyeb": {
                "score_total": 68,
                "note": "Free tier available but requires new account setup and reconfiguration."
            },
            "Google_Cloud_Run": {
                "score_total": 65,
                "note": "Enterprise grade with cold starts, but requires GCP project, IAM service accounts, gcloud artifact registry, and billing enablement."
            }
        },
        "selected_plan": {
            "provider": "Render",
            "service_name": "otravelz-backend",
            "url": "https://otravelz-backend.onrender.com",
            "repairs_applied": [
                "Hardened backend/start.py so migration warnings do not abort server boot.",
                "Added connect_timeout: 10s to PostgreSQL connection pool in backend/app/db/session.py.",
                "Updated GET / and GET /health endpoints to expose version 4.0.0, git_sha, alembic_version, and database status.",
                "Preserved sync: false in render.yaml to protect Aiven credentials from git commits."
            ]
        }
    }

    os.makedirs("reports", exist_ok=True)
    with open("reports/d1_5_backend_hosting_decision.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print("Generated reports/d1_5_backend_hosting_decision.json")

if __name__ == "__main__":
    generate_hosting_decision()
