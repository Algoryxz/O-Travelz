import json
from dotenv import dotenv_values
from sqlalchemy import create_engine, text

def check_aiven_db():
    env_vals = dotenv_values("backend/.env")
    db_url = env_vals.get("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in backend/.env")
        return None

    report = {
        "reachable": False,
        "postgres_version": None,
        "postgis_version": None,
        "alembic_version": None,
        "public_tables": [],
        "counts": {}
    }

    try:
        engine = create_engine(db_url, connect_args={"sslmode": "require"}, echo=False)
        with engine.connect() as conn:
            report["reachable"] = True
            report["postgres_version"] = conn.execute(text("SELECT version();")).scalar()
            
            try:
                report["postgis_version"] = conn.execute(text("SELECT PostGIS_Version();")).scalar()
            except Exception as e:
                report["postgis_version"] = str(e)

            try:
                report["alembic_version"] = conn.execute(text("SELECT version_num FROM alembic_version;")).scalar()
            except Exception as e:
                report["alembic_version"] = str(e)

            tables = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")).fetchall()
            report["public_tables"] = [t[0] for t in tables]

            for tbl in ["places", "routes", "transit_stops", "transit_stop_times", "media_assets", "entity_media", "categories", "services", "place_images"]:
                if tbl in report["public_tables"]:
                    try:
                        report["counts"][tbl] = conn.execute(text(f"SELECT count(*) FROM {tbl};")).scalar()
                    except Exception as e:
                        report["counts"][tbl] = str(e)
        print("Successfully connected to Aiven DB!")
        print(json.dumps(report, indent=2))
        return report
    except Exception as e:
        report["error"] = str(e)
        print("Failed to connect to Aiven DB:", e)
        return report

if __name__ == "__main__":
    check_aiven_db()
