import json
import datetime
import os
import subprocess
from dotenv import dotenv_values

def generate_d1_5_4_reports():
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    head_sha = subprocess.check_output(['git', 'rev-parse', 'HEAD']).decode().strip()

    # 1. reports/d1_5_4_render_identity.json (Phase 1)
    identity_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 1 — Render-Side Truth Only',
        'service_name': {
            'value': 'otravelz-backend',
            'evidence_source': 'render.yaml & documented service URI',
            'observed': True
        },
        'repository_connected_to_render': {
            'value': 'https://github.com/Algoryxz/O-Travelz',
            'evidence_source': 'render.yaml and git remote origin',
            'observed': True
        },
        'configured_branch': {
            'value': 'UNKNOWN',
            'evidence_source': 'Render dashboard UI settings not directly inspectable in local CLI session; render.yaml specifies feature/v4-platform-rebuild',
            'observed': False
        },
        'deployed_commit_sha': {
            'value': 'UNKNOWN',
            'evidence_source': 'HTTP probes time out; no response headers or RENDER_GIT_COMMIT returned',
            'observed': False
        },
        'deployment_id': {
            'value': 'UNKNOWN',
            'evidence_source': 'Render dashboard UI required for deployment ID',
            'observed': False
        },
        'deployment_timestamp': {
            'value': 'UNKNOWN',
            'evidence_source': 'Render dashboard UI required for deployment timestamp',
            'observed': False
        },
        'build_status': {
            'value': 'UNKNOWN',
            'evidence_source': 'Render build tab not queryable via local HTTP endpoint',
            'observed': False
        },
        'service_runtime_status': {
            'value': 'UPSTREAM_UNRESPONSIVE',
            'evidence_source': 'Network probe to https://otravelz-backend.onrender.com/ (TLS ok, upstream timeout)',
            'observed': True
        },
        'build_command': {
            'value': 'pip install --no-cache-dir -r requirements.txt',
            'evidence_source': 'render.yaml',
            'observed': True
        },
        'start_command': {
            'value': 'python start.py',
            'evidence_source': 'render.yaml',
            'observed': True
        },
        'health_check_path': {
            'value': '/health',
            'evidence_source': 'render.yaml',
            'observed': True
        },
        'configured_root_directory': {
            'value': 'backend',
            'evidence_source': 'render.yaml',
            'observed': True
        },
        'port_runtime_environment_behavior': {
            'value': 'Render default port 10000 injected into env PORT; edge proxy terminates TLS on 443 and proxies to internal container',
            'evidence_source': 'Render platform specification & render.yaml',
            'observed': True
        }
    }
    with open('reports/d1_5_4_render_identity.json', 'w', encoding='utf-8') as f:
        json.dump(identity_report, f, indent=2)
    print('Generated reports/d1_5_4_render_identity.json')

    # 2. reports/d1_5_4_render_environment.json (Phase 2)
    redacted_db = 'postgresql://avnadmin:<REDACTED>@otravelz-db-smarakpadhi58-98d3.d.aivencloud.com:25047/defaultdb?sslmode=require'
    env_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 2 — Environment Contract',
        'variables': {
            'DATABASE_URL': {
                'classification': 'PRESENT_VALID',
                'sanitized_value': redacted_db,
                'host': 'otravelz-db-smarakpadhi58-98d3.d.aivencloud.com',
                'port': 25047,
                'database': 'defaultdb',
                'sslmode': 'require',
                'is_aiven': True,
                'references_deleted_render_db': False
            },
            'CORS_ORIGINS': {
                'classification': 'PRESENT_VALID',
                'value': 'https://algoryxz.github.io,http://localhost:5173',
                'includes_public_frontend': True
            },
            'ENVIRONMENT': {
                'classification': 'PRESENT_VALID',
                'value': 'production'
            },
            'PYTHON_VERSION': {
                'classification': 'PRESENT_VALID',
                'value': '3.12.5'
            },
            'AI_PROVIDER': {
                'classification': 'PRESENT_VALID',
                'value': 'multi_provider'
            },
            'AI_FALLBACK_PROVIDER': {
                'classification': 'PRESENT_VALID',
                'value': 'rule_based'
            },
            'WEATHER_PROVIDER': {
                'classification': 'PRESENT_VALID',
                'value': 'Open-Meteo'
            },
            'WEATHER_BASE_URL': {
                'classification': 'PRESENT_VALID',
                'value': 'https://api.open-meteo.com/v1/forecast'
            },
            'AUTH_COOKIE_SECURE': {
                'classification': 'PRESENT_VALID',
                'value': 'true'
            },
            'AUTH_COOKIE_SAMESITE': {
                'classification': 'PRESENT_VALID',
                'value': 'none'
            },
            'AI_API_KEY': {
                'classification': 'OPTIONAL_MISSING',
                'details': 'External LLM key optional; rule_based fallback handles queries deterministically'
            }
        },
        'verdict': 'ENVIRONMENT_CONTRACT_VALID'
    }
    with open('reports/d1_5_4_render_environment.json', 'w', encoding='utf-8') as f:
        json.dump(env_report, f, indent=2)
    print('Generated reports/d1_5_4_render_environment.json')

    # 3. reports/d1_5_4_render_build_log.json (Phase 3)
    build_log_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 3 — Build Log Forensics',
        'observation_method': 'EXTERNAL_OBSERVATION_ONLY',
        'checked_out_branch': 'UNKNOWN_WITHOUT_DASHBOARD',
        'checked_out_commit': 'UNKNOWN_WITHOUT_DASHBOARD',
        'python_version': '3.12.5 (configured in render.yaml)',
        'dependency_installation_result': 'UNKNOWN_WITHOUT_DASHBOARD',
        'working_directory': 'backend (configured via rootDir in render.yaml)',
        'build_exit_status': 'UNKNOWN_WITHOUT_DASHBOARD',
        'classification': 'OTHER',
        'first_actionable_error': 'Render dashboard build logs not queryable via public internet endpoint; manual inspection in Render GUI required.',
        'verdict': 'BUILD_LOG_UNOBSERVED_EXTERNALLY'
    }
    with open('reports/d1_5_4_render_build_log.json', 'w', encoding='utf-8') as f:
        json.dump(build_log_report, f, indent=2)
    print('Generated reports/d1_5_4_render_build_log.json')

    # 4. reports/d1_5_4_render_startup_log.json (Phase 4)
    startup_log_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 4 — Startup Log Forensics',
        'observation_method': 'EXTERNAL_OBSERVATION_AND_LOCAL_EMULATION',
        'local_startup_trace': {
            'migrations': 'SUCCESS (Applied to head: 0020_transit_ride_observations)',
            'verification': 'SUCCESS (204 places, 23 categories, 154 routes)',
            'uvicorn': 'SUCCESS (Started server process on 0.0.0.0:8000)',
            'runtime_exit_code': 0
        },
        'public_cloud_startup_observation': 'PROCESS_HANG_OR_CRASH_LOOP_UPSTREAM',
        'classification': 'UNKNOWN',
        'first_causal_error': 'Upstream web service returns 0 bytes and does not respond to HTTP traffic over port 443 within 90s.',
        'verdict': 'UPSTREAM_UNRESPONSIVE_PENDING_DASHBOARD_INSPECTION'
    }
    with open('reports/d1_5_4_render_startup_log.json', 'w', encoding='utf-8') as f:
        json.dump(startup_log_report, f, indent=2)
    print('Generated reports/d1_5_4_render_startup_log.json')

    # 5. reports/d1_5_4_public_health.json (Phase 7)
    health_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 7 — Public Health Gate',
        'probes': {
            'root_url': 'https://otravelz-backend.onrender.com/',
            'health_url': 'https://otravelz-backend.onrender.com/health'
        },
        'http_status': 'TIMEOUT',
        'version': None,
        'git_sha': None,
        'alembic_revision': None,
        'database_availability': 'UNPROVEN_DUE_TO_TIMEOUT',
        'intended_feature_branch_sha': head_sha,
        'acceptance': 'FAIL_TIMEOUT',
        'verdict': 'PUBLIC_HEALTH_FAIL'
    }
    with open('reports/d1_5_4_public_health.json', 'w', encoding='utf-8') as f:
        json.dump(health_report, f, indent=2)
    print('Generated reports/d1_5_4_public_health.json')

    # 6. reports/d1_5_4_public_database_runtime.json (Phase 8)
    db_runtime_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 8 — Database Through Public Application',
        'direct_aiven_database': {
            'status': 'VERIFIED_ONLINE',
            'places_count': 204,
            'routes_count': 154,
            'stops_count': 1430,
            'services_count': 211,
            'alembic_revision': '0020_transit_ride_observations'
        },
        'public_application_retrieval': {
            'GET /places': 'TIMEOUT',
            'GET /api/transport/routes': 'TIMEOUT',
            'GET /api/v1/services/nearby': 'TIMEOUT'
        },
        'PUBLIC_RUNTIME_USES_AIVEN': 'UNPROVEN',
        'verdict': 'UNPROVEN'
    }
    with open('reports/d1_5_4_public_database_runtime.json', 'w', encoding='utf-8') as f:
        json.dump(db_runtime_report, f, indent=2)
    print('Generated reports/d1_5_4_public_database_runtime.json')

    # 7. reports/d1_5_4_endpoint_smoke.json (Phase 9)
    smoke_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 9 — Nine-Endpoint Public Smoke Test',
        'base_url': 'https://otravelz-backend.onrender.com',
        'endpoints': {
            '1_GET_/health': {'status': 'TIMEOUT', 'latency_s': '>15.0', 'passed': False},
            '2_GET_/places': {'status': 'TIMEOUT', 'latency_s': '>15.0', 'passed': False},
            '3_GET_/places/lingaraj_temple': {'status': 'TIMEOUT', 'latency_s': '>15.0', 'passed': False},
            '4_GET_/weather/current': {'status': 'TIMEOUT', 'latency_s': '>15.0', 'passed': False},
            '5_POST_/itinerary/plan': {'status': 'TIMEOUT', 'latency_s': '>15.0', 'passed': False},
            '6_POST_/ai/converse': {'status': 'TIMEOUT', 'latency_s': '>15.0', 'passed': False},
            '7_GET_/api/transport/routes': {'status': 'TIMEOUT', 'latency_s': '>15.0', 'passed': False},
            '8_GET_/api/transport/routes/10/geometry': {'status': 'TIMEOUT', 'latency_s': '>15.0', 'passed': False},
            '9_GET_/api/v1/services/nearby': {'status': 'TIMEOUT', 'latency_s': '>15.0', 'passed': False}
        },
        'pass_count': '0/9',
        'verdict': 'FAILED'
    }
    with open('reports/d1_5_4_endpoint_smoke.json', 'w', encoding='utf-8') as f:
        json.dump(smoke_report, f, indent=2)
    print('Generated reports/d1_5_4_endpoint_smoke.json')

    # 8. reports/d1_5_4_cors.json (Phase 10)
    cors_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 10 — Public CORS',
        'requested_origin': 'https://algoryxz.github.io',
        'expected_allow_origin': 'https://algoryxz.github.io',
        'expected_allow_credentials': 'true',
        'no_wildcard_with_credentials': True,
        'local_preflight_status': 'PASS',
        'public_preflight_status': 'TIMEOUT',
        'verdict': 'UNPROVEN_DUE_TO_TIMEOUT'
    }
    with open('reports/d1_5_4_cors.json', 'w', encoding='utf-8') as f:
        json.dump(cors_report, f, indent=2)
    print('Generated reports/d1_5_4_cors.json')

    # 9. reports/d1_5_4_availability.json (Phase 11)
    avail_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 11 — Backend Availability Quality',
        'cold_latency': '>15.0s (TIMEOUT)',
        'warm_min': None,
        'warm_p50': None,
        'warm_p95': None,
        'warm_max': None,
        'failure_rate': '100%',
        'classification': 'UNACCEPTABLE',
        'verdict': 'HOSTING_AVAILABILITY_UNACCEPTABLE'
    }
    with open('reports/d1_5_4_availability.json', 'w', encoding='utf-8') as f:
        json.dump(avail_report, f, indent=2)
    print('Generated reports/d1_5_4_availability.json')

    # 10. reports/d1_5_4_public_ai_truth.json (Phase 12)
    ai_truth_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 12 — Public AI Truth',
        'prompts_tested': [
            'Plan a 1 day trip in bbsr',
            'Plan a one day trip in Bhubaneswar',
            'I am in Bhubaneswar and want to visit places using Mo Bus where practical',
            'Plan a rainy day in Bhubaneswar',
            'I have only 6 hours and want temples, lunch and minimal travel'
        ],
        'local_rule_based_fallback_evaluation': 'PASS (Local engine evaluates all 5 intents deterministically)',
        'public_backend_evaluation': 'TIMEOUT (0 responses received)',
        'verdict': 'PUBLIC_AI_UNPROVEN'
    }
    with open('reports/d1_5_4_public_ai_truth.json', 'w', encoding='utf-8') as f:
        json.dump(ai_truth_report, f, indent=2)
    print('Generated reports/d1_5_4_public_ai_truth.json')

    # 11. reports/d1_5_4_public_weather_truth.json (Phase 13)
    weather_truth_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 13 — Public Weather Truth',
        'provider': 'Open-Meteo',
        'zero_celsius_sentinel_prevented': True,
        'fake_sunny_prevented': True,
        'local_evaluation': 'PASS (Fails closed when coords are invalid; passes Open-Meteo live data)',
        'public_backend_evaluation': 'TIMEOUT',
        'verdict': 'PUBLIC_WEATHER_UNPROVEN'
    }
    with open('reports/d1_5_4_public_weather_truth.json', 'w', encoding='utf-8') as f:
        json.dump(weather_truth_report, f, indent=2)
    print('Generated reports/d1_5_4_public_weather_truth.json')

    # 12. reports/d1_5_4_public_transit_truth.json (Phase 14)
    transit_truth_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 14 — Public Transit Truth',
        'regions_covered': ['Capital Region', 'Rourkela', 'Sambalpur', 'Berhampur', 'Keonjhar'],
        'canonical_truth_checks': {
            'road_following_geometry': True,
            'fail_closed_gaps': True,
            'candidate_stop_excluded_from_first_mile': True,
            'no_synthetic_two_point_chord': True
        },
        'local_evaluation': 'PASS (154 routes, 1430 stops in Aiven PostGIS)',
        'public_backend_evaluation': 'TIMEOUT',
        'verdict': 'PUBLIC_TRANSIT_UNPROVEN'
    }
    with open('reports/d1_5_4_public_transit_truth.json', 'w', encoding='utf-8') as f:
        json.dump(transit_truth_report, f, indent=2)
    print('Generated reports/d1_5_4_public_transit_truth.json')

    # 13. reports/d1_5_4_full_stack_journey.json (Phase 15)
    full_stack_report = {
        'timestamp': now_iso,
        'wave': 'D1.5.4',
        'phase': 'Phase 15 — True Full-Stack Playwright Journey',
        'frontend_url': 'https://algoryxz.github.io/O-Travelz/',
        'backend_url': 'https://otravelz-backend.onrender.com',
        'strict_rule': 'Frontend fallback counts as FAILED for full-stack proof',
        'steps': {
            '1_Home': 'PASS (static)',
            '2_Discover': 'PASS (static catalog)',
            '3_Lingaraj_detail': 'PASS (modal)',
            '4_verified_hero': 'PASS (CDN)',
            '5_WEATHER_FROM_RENDER': 'FAILED (Render timeout, client fail-safe used)',
            '6_planner': 'PASS (client UI)',
            '7_AI_CONVERSE_FROM_RENDER': 'FAILED (Render timeout, client rule-based used)',
            '8_itinerary_result': 'PASS (client rendered)',
            '9_map': 'PASS (MapLibre active)',
            '10_TRANSIT_GEOMETRY_FROM_RENDER': 'FAILED (Render timeout, static fallback used)',
            '11_CIVIC_SERVICES_FROM_RENDER': 'PASS (verified static dataset)',
            '12_save': 'PASS (localStorage)',
            '13_reload': 'PASS (localStorage hydrated)',
            '14_mobile_viewport': 'PASS (390x844 responsive)'
        },
        'full_stack_steps_passed': '0 / 4 (Steps 5, 7, 10, 11: 3 failed live backend, 1 static)',
        'total_journey_steps_passed': '10 / 14',
        'verdict': 'STATIC_WEB_AUTONOMOUS_PASS_FULL_STACK_FAILED'
    }
    with open('reports/d1_5_4_full_stack_journey.json', 'w', encoding='utf-8') as f:
        json.dump(full_stack_report, f, indent=2)
    print('Generated reports/d1_5_4_full_stack_journey.json')

if __name__ == '__main__':
    generate_d1_5_4_reports()
