# O-Travelz Production Runbook & Operations Manual

`STATUS: VERIFIED`

## 1. Quick Operations Reference

| Operation | Command / Procedure |
| :--- | :--- |
| **Health Check (Liveness)** | `curl -f https://api.otravelz.in/health` $\to$ `{"status": "ok"}` |
| **Check Database Status** | `python -m alembic -c backend/alembic.ini current` |
| **Run Migrations** | `python -m alembic -c backend/alembic.ini upgrade head` |
| **Rollback Migration** | `python -m alembic -c backend/alembic.ini downgrade -1` |
| **Re-sync Places Catalog** | `python scripts/import_places.py && python scripts/sync_db_place_images.py` |

---

## 2. PostgreSQL Backup & Recovery Procedures

### A. Creating an Automated Nightly Dump
```bash
pg_dump -h <db-host> -U otravelz -d otravelz -F c -b -v -f "/var/backups/otravelz_$(date +%Y%m%d_%H%M%S).dump"
```

### B. Restoring from a Backup Archive
```bash
pg_restore -h <db-host> -U otravelz -d otravelz -v --clean --no-owner "/var/backups/otravelz_target.dump"
```

---

## 3. Incident Triage & Common Failure Scenarios

### Scenario A: Backend Startup Fails with `FATAL: Insecure or default AUTH_SESSION_SECRET`
* **Cause**: `ENVIRONMENT=production` was set without providing a secure 32+ character signing key.
* **Resolution**: Generate a secure secret (`openssl rand -hex 32`) and assign it to `AUTH_SESSION_SECRET` in `.env`.

### Scenario B: AI Provider Timeout or 429 Rate Limit
* **Behavior**: System automatically trips circuit breaker and falls back to deterministic rule-based planning.
* **Resolution**: Check API quota in Google AI Studio or switch `AI_PROVIDER=gemini` to `AI_PROVIDER=nvidia` / `mock`.

### Scenario C: Frontend Map Fails to Render Tiles
* **Behavior**: Leaflet renders grid placeholders.
* **Resolution**: Verify outbound HTTPS access from client browsers to CartoDB / OpenStreetMap tile domains.
