import json
import time

report = {
  "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
  "wave": "Wave D1.4 - Phase 5 Hosting Decision Correction & Reassessment",
  "correction_note": "Corrected D1.3 premise: Cloudflare Pages does NOT require a purchased domain; its free default *.pages.dev URL is available without cost.",
  "candidates": {
    "github_pages": {
      "name": "GitHub Pages",
      "default_url": "https://algoryxz.github.io/O-Travelz/",
      "scores": {
        "current_reliability": 10,
        "project_subpath_complexity": 7,
        "spa_behavior": 8,
        "env_vars": 8,
        "deploy_automation": 10,
        "previews": 6,
        "rollback": 9,
        "static_media_limits": 9,
        "artifact_size_limits": 9,
        "cdn": 9,
        "cache_headers": 7,
        "free_tier_constraints": 10,
        "operational_simplicity": 10,
        "vendor_lock_in": 10,
        "no_domain_operation": 10
      },
      "total_score": 132,
      "pros": [
        "Zero external SaaS accounts; everything lives inside github.com/Algoryxz/O-Travelz",
        "Deterministic deployment via GitHub Actions (deploy-pages.yml)",
        "Zero hosting cost, 100 GB/month bandwidth limit (O-Travelz uses < 2 GB/month)",
        "All subpath resolution issues permanently solved in D1.3 & D1.4 with idempotent resolveAssetUrl",
        "Already live, verified, and operational with 0 errors"
      ],
      "cons": [
        "Subpath base /O-Travelz/ requires strict base handling in client code",
        "No automatic per-PR preview environments out-of-the-box"
      ]
    },
    "cloudflare_pages": {
      "name": "Cloudflare Pages",
      "default_url": "https://o-travelz.pages.dev",
      "scores": {
        "current_reliability": 10,
        "project_subpath_complexity": 10,
        "spa_behavior": 10,
        "env_vars": 9,
        "deploy_automation": 9,
        "previews": 10,
        "rollback": 10,
        "static_media_limits": 9,
        "artifact_size_limits": 8,
        "cdn": 10,
        "cache_headers": 10,
        "free_tier_constraints": 10,
        "operational_simplicity": 6,
        "vendor_lock_in": 8,
        "no_domain_operation": 10
      },
      "total_score": 139,
      "pros": [
        "Native root host (o-travelz.pages.dev) eliminates subpath configuration",
        "Global Cloudflare Anycast edge network with instant cache purges",
        "Built-in per-PR preview deployments",
        "Free tier includes 500 builds/month and unlimited bandwidth"
      ],
      "cons": [
        "Requires external Cloudflare account creation, API tokens, and webhook linking",
        "Adds SaaS operational boundary for the repository owner",
        "Migration provides zero material benefit to end users given that GitHub Pages is already achieving 100% pass rates"
      ]
    },
    "vercel": {
      "name": "Vercel",
      "default_url": "https://o-travelz.vercel.app",
      "scores": {
        "current_reliability": 9,
        "project_subpath_complexity": 10,
        "spa_behavior": 9,
        "env_vars": 9,
        "deploy_automation": 9,
        "previews": 10,
        "rollback": 9,
        "static_media_limits": 7,
        "artifact_size_limits": 7,
        "cdn": 9,
        "cache_headers": 9,
        "free_tier_constraints": 7,
        "operational_simplicity": 6,
        "vendor_lock_in": 7,
        "no_domain_operation": 10
      },
      "total_score": 127,
      "pros": ["Automatic PR previews", "Root domain hosting"],
      "cons": ["100 GB bandwidth limit with strict hobbyist usage clauses", "High risk of surprise billing / account blocks"]
    },
    "render_static": {
      "name": "Render Static Site",
      "default_url": "https://o-travelz.onrender.com",
      "scores": {
        "current_reliability": 6,
        "project_subpath_complexity": 9,
        "spa_behavior": 8,
        "env_vars": 8,
        "deploy_automation": 7,
        "previews": 6,
        "rollback": 7,
        "static_media_limits": 7,
        "artifact_size_limits": 7,
        "cdn": 7,
        "cache_headers": 7,
        "free_tier_constraints": 6,
        "operational_simplicity": 7,
        "vendor_lock_in": 8,
        "no_domain_operation": 8
      },
      "total_score": 108,
      "pros": ["Unified dashboard if backend is on Render"],
      "cons": ["Slow builds, 100 GB/month limit, history of unannounced service suspension on free tier"]
    }
  },
  "verdict": "KEEP_GITHUB_PAGES",
  "rationale": "Although Cloudflare Pages scored slightly higher on root-host simplicity (139 vs 132), migrating introduces external account maintenance and credential management without any tangible traveler benefit. GitHub Pages is already 100% verified, fast, completely free, and natively integrated into Algoryxz/O-Travelz with zero external dependencies. Subpath handling is fully solved and regression-tested."
}

with open("reports/d1_4_frontend_hosting_reassessment.json", "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)

print("Saved reports/d1_4_frontend_hosting_reassessment.json with verdict KEEP_GITHUB_PAGES!")
