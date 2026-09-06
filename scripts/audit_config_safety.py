import os
import re
import json
import datetime

def scan_files(directory, patterns, allowed_patterns=None):
    findings = []
    for root, _, files in os.walk(directory):
        for file in files:
            # Skip binary images or maps
            if file.endswith((".webp", ".png", ".jpg", ".jpeg", ".ico", ".woff", ".woff2", ".ttf")):
                continue
            filepath = os.path.join(root, file)
            relpath = os.path.relpath(filepath).replace("\\", "/")
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    for pat_name, regex in patterns.items():
                        matches = re.finditer(regex, content, re.IGNORECASE)
                        for m in matches:
                            matched_text = m.group(0)
                            if allowed_patterns and any(re.search(a, matched_text, re.IGNORECASE) for a in allowed_patterns):
                                continue
                            line_num = content[:m.start()].count("\n") + 1
                            findings.append({
                                "file": relpath,
                                "pattern": pat_name,
                                "matched": matched_text[:100],
                                "line": line_num
                            })
            except Exception as e:
                pass
    return findings

def audit_config_safety():
    patterns = {
        "tunnel_lhr_life": r"[a-z0-9\-\.]+\.lhr\.life",
        "tunnel_ngrok": r"[a-z0-9\-\.]+\.ngrok[a-z0-9\-\.]*",
        "file_uri_scheme": r"file:///[^\s\"\'\<\>]+",
        "private_key_header": r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----",
        "aws_access_key": r"\bAKIA[0-9A-Z]{16}\b",
        "raw_secret_token": r"\b(api_key|secret_key|password)\s*[:=]\s*[\"\'][a-zA-Z0-9_\-\.]{16,}[\"\']"
    }

    # Scan dist
    dist_findings = scan_files("frontend/dist", patterns)

    # Scan src
    src_findings = scan_files("frontend/src", patterns)

    all_passed = len(dist_findings) == 0

    report = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "wave": "D1.4",
        "phase": "Phase 13 — Security & Config Sanity",
        "scanned_targets": [
            "frontend/dist (compiled public deployment bundle)",
            "frontend/src (client-side application source)"
        ],
        "dist_findings_count": len(dist_findings),
        "dist_findings": dist_findings,
        "src_findings_count": len(src_findings),
        "src_findings": src_findings,
        "verdict": "CONFIG_SAFETY_VERIFIED" if all_passed else "CONFIG_SAFETY_VIOLATIONS"
    }

    with open("reports/d1_4_public_config_safety.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print("Generated reports/d1_4_public_config_safety.json")

if __name__ == "__main__":
    audit_config_safety()
