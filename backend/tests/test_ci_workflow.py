import pathlib
import yaml


def test_github_actions_ci_workflow_structure():
    workflow_path = pathlib.Path(__file__).parent.parent.parent / ".github" / "workflows" / "ci.yml"
    assert workflow_path.exists(), "ci.yml must exist under .github/workflows/"

    content = workflow_path.read_text(encoding="utf-8")
    data = yaml.safe_load(content)

    # 1. Trigger Verification
    triggers = data.get("on") or data.get(True)
    assert "push" in triggers, "CI must trigger on push"
    assert "pull_request" in triggers, "CI must trigger on pull_request"

    # 2. Jobs Verification
    jobs = data.get("jobs", {})
    assert "repo-integrity" in jobs, "Must have repo-integrity job"
    assert "backend-ci" in jobs, "Must have backend-ci job"
    assert "frontend-ci" in jobs, "Must have frontend-ci job"

    # 3. Backend Job Verification
    backend_job = jobs["backend-ci"]
    assert backend_job.get("runs-on") == "ubuntu-latest"
    backend_steps_str = str(backend_job.get("steps", []))
    assert "3.12" in backend_steps_str, "Backend CI must pin Python 3.12"
    assert "pytest" in backend_steps_str, "Backend CI must run pytest"
    assert "compileall" in backend_steps_str, "Backend CI must run compileall"
    assert "alembic" in backend_steps_str, "Backend CI must run alembic migrations"

    # 4. Frontend Job Verification
    frontend_job = jobs["frontend-ci"]
    assert frontend_job.get("runs-on") == "ubuntu-latest"
    frontend_steps_str = str(frontend_job.get("steps", []))
    assert "20" in frontend_steps_str, "Frontend CI must pin Node.js 20"
    assert "npm" in frontend_steps_str, "Frontend CI must use npm"
    assert "test" in frontend_steps_str, "Frontend CI must run tests"
    assert "build" in frontend_steps_str, "Frontend CI must run production build"

    # 5. Security Invariant Verification
    assert "deploy" not in content.lower(), "CI must NOT contain deployment steps"
    assert "publish" not in content.lower(), "CI must NOT contain publishing steps"


def test_ci_database_configuration_and_healthcheck():
    """Verify PostgreSQL CI service container and steps use explicit postgres credentials."""
    workflow_path = pathlib.Path(__file__).parent.parent.parent / ".github" / "workflows" / "ci.yml"
    content = workflow_path.read_text(encoding="utf-8")
    data = yaml.safe_load(content)

    backend_job = data["jobs"]["backend-ci"]
    services = backend_job.get("services", {})
    assert "postgres" in services, "Backend CI must define postgres service"

    postgres_svc = services["postgres"]
    postgres_env = postgres_svc.get("env", {})
    assert postgres_env.get("POSTGRES_USER") == "postgres", "CI Postgres user must be 'postgres'"
    assert postgres_env.get("POSTGRES_PASSWORD") == "postgres", "CI Postgres password must be 'postgres'"
    assert postgres_env.get("POSTGRES_DB") == "travel_odisha", "CI Postgres DB must be 'travel_odisha'"

    # Critical: --health-cmd MUST specify -U postgres -d travel_odisha to prevent container root fallback
    options = postgres_svc.get("options", "")
    assert "-U postgres" in options, "Postgres healthcheck must explicitly pass -U postgres to prevent root authentication"
    assert "-d travel_odisha" in options, "Postgres healthcheck must pass -d travel_odisha"

    # Verify canonical DATABASE_URL
    job_env = backend_job.get("env", {})
    expected_db_url = "postgresql://postgres:postgres@localhost:5432/travel_odisha"
    assert job_env.get("DATABASE_URL") == expected_db_url, "Backend CI must set canonical DATABASE_URL"

    # Verify DB-interacting steps have DATABASE_URL attached
    steps = backend_job.get("steps", [])
    db_step_names = [
        "Validate Alembic Migration History",
        "Apply Database Migrations (Upgrade Head)",
        "Seed Authoritative Database & Verify Invariants",
        "Run Full Pytest Suite",
        "Run Auth & Security Pytest Suite",
    ]
    for step in steps:
        name = step.get("name")
        if name in db_step_names:
            step_env = step.get("env", {})
            assert step_env.get("DATABASE_URL") == expected_db_url, f"Step '{name}' must have explicit DATABASE_URL"


def test_settings_database_url_parsing_and_no_os_user_fallback():
    """Verify Settings retains explicit CI database credentials without OS user fallback."""
    from sqlalchemy.engine import make_url
    from app.core.config import Settings

    ci_db_url = "postgresql://postgres:postgres@localhost:5432/travel_odisha"
    cfg = Settings(database_url=ci_db_url)
    assert cfg.database_url == ci_db_url

    parsed = make_url(cfg.database_url)
    assert parsed.drivername == "postgresql"
    assert parsed.username == "postgres"
    assert parsed.password == "postgres"
    assert parsed.host == "localhost"
    assert parsed.port == 5432
    assert parsed.database == "travel_odisha"

