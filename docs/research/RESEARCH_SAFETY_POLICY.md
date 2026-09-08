# O-TRAVELZ V4 — Research Safety Policy & Ethical Boundaries

## Purpose

This document outlines the strict ethical, legal, and operational safety boundaries for research subagents operating in the O-TRAVELZ ecosystem. It protects the integrity of external services, preserves user trust, and ensures full compliance with local and international internet standards.

---

## 1. Permitted Activities (ALLOWED)

Research subagents and Antigravity orchestrators are strictly permitted to perform:

1. **Public Web Browsing**: Accessing publicly indexable web pages and documentation hubs without session cookies.
2. **Official API Documentation**: Reading OpenAPI specifications, Swagger endpoints, Postman collections, and developer portals.
3. **Public API Probing**: Executing low-volume, non-destructive `GET`, `HEAD`, and `OPTIONS` requests against documented public endpoints.
4. **Sample Data Verification**: Fetching minimal sample payloads (e.g., 1–5 records) to verify schema structure, field naming, and encoding.
5. **Public GIS Capabilities**: Querying public `arcgis/rest/services` endpoints, WMS `GetCapabilities`, WFS describe feature types, and downloading published public GeoJSON/KML files.
6. **Government Datasets**: Accessing datasets published on `data.gov.in`, state open-data portals, or municipal release pages.
7. **Public PDF Inspection**: Downloading and extracting text from public government circulars, district gazettes, and ASI heritage notifications.
8. **Licensing & Terms Inspection**: Examining `robots.txt`, Terms of Service (ToS), Creative Commons metadata, and open-source licenses.

---

## 2. Prohibited Activities (FORBIDDEN)

Under NO circumstances may any agent or script engage in:

1. **Credential Guessing / Brute-Forcing**: Attempting passwords, authorization tokens, or session IDs.
2. **Authentication Bypass**: Circumventing paywalls, login walls, OTP verification, or security gateways.
3. **Reverse Engineering Private / Mobile APIs**: Decompiling mobile apps or sniffing private HTTPS traffic to intercept undocumented endpoints.
4. **Scraping Behind Login**: Accessing content requiring personal user accounts, government employee logins, or privileged portal credentials.
5. **Rate-Limit Evasion**: Rotating proxies, spoofing user-agents, or distributed request hammering to bypass rate limiting.
6. **Token or Key Extraction**: Extracting embedded API keys, client secrets, or private tokens from client bundles or public repositories.
7. **Use of Leaked Credentials**: Utilizing keys or credentials sourced from data leaks, breach dumps, or accidental commits.
8. **High-Volume Automated Crawling**: Launching aggressive web crawlers or scrapers that impose undue load on governmental or public transit servers.
9. **Violating Provider Terms**: Disregarding explicit `robots.txt` disallows or service terms barring automated retrieval.
10. **Silent Canonical Promotion**: Writing scraped or unverified data directly into canonical datasets or production databases without an explicit verification wave.

---

## 3. Incident Escalation

If an agent encounters an endpoint that:
- Appears to expose sensitive administrative or personal data (PII)
- Returns HTTP 401/403 requiring credentials
- Triggers a CAPTCHA or Cloudflare challenge

The agent must immediately:
1. Halt further requests to that domain.
2. Mark task status as `BLOCKED`.
3. Record the endpoint and error code in the structured output.
4. Do NOT attempt workarounds.
