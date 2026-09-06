import json
import datetime
import os
from dotenv import dotenv_values
from sqlalchemy import create_engine, text

def generate_database_proof():
    report = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "wave": "D1.5",
        "phase": "Phase 5 — Database Production Proof",
        "database_provider": "Aiven Managed Cloud PostgreSQL",
        "host": "otravelz-db-smarakpadhi58-98d3.d.aivencloud.com",
        "port": 25047,
        "database_name": "defaultdb",
        "ssl_mode": "require",
        "proof_results": {}
    }

    env_vals = dotenv_values("backend/.env")
    db_url = env_vals.get("DATABASE_URL")
    if not db_url:
        report["error"] = "DATABASE_URL not found in backend/.env"
        return

    try:
        engine = create_engine(db_url, connect_args={"sslmode": "require"})
        with engine.connect() as conn:
            pg_ver = conn.execute(text("SELECT version();")).scalar()
            report["proof_results"]["postgresql_reachable"] = True
            report["proof_results"]["postgresql_version"] = pg_ver
            
            postgis_ver = conn.execute(text("SELECT PostGIS_Version();")).scalar()
            report["proof_results"]["postgis_available"] = True
            report["proof_results"]["postgis_version"] = postgis_ver

            alembic_rev = conn.execute(text("SELECT version_num FROM alembic_version;")).scalar()
            report["proof_results"]["alembic_revision"] = alembic_rev

            counts = {}
            for tbl in ["places", "routes", "stops", "media_assets", "entity_media", "place_images", "categories"]:
                counts[tbl] = conn.execute(text(f"SELECT count(*) FROM {tbl};")).scalar()
            report["proof_results"]["counts"] = counts

            report["verdict"] = "DATABASE_PRODUCTION_VERIFIED"
    except Exception as e:
        report["proof_results"]["postgresql_reachable"] = False
        report["proof_results"]["error"] = str(e)
        report["verdict"] = "DATABASE_UNREACHABLE"

    os.makedirs("reports", exist_ok=True)
    with open("reports/d1_5_backend_database_proof.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print("Generated reports/d1_5_backend_database_proof.json")

if __name__ == "__main__":
    generate_database_proof()
