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
