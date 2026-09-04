# Gemini Instructions — O-TRAVELZ

Before making any changes to this codebase, read these documents in order:

1. [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) — canonical project background, architecture, and operating rules
2. [`AGENTS.md`](AGENTS.md) — coding agent operating rules and critical constraints
3. [`docs/v4/PRODUCT.md`](docs/v4/PRODUCT.md) — PRD, jobs-to-be-done, multidimensional truth model, anti-vibe-code rules
4. [`docs/v4/ARCHITECTURE.md`](docs/v4/ARCHITECTURE.md) — platform topology, KMP shared core, Aiven DB runtime
5. [`docs/v4/ROADMAP.md`](docs/v4/ROADMAP.md) — current 5-stage platform rebuild sequence

Then read domain-specific documentation when relevant:

| Task area | Read |
|---|---|
| Service boundaries, backend models | [`SYSTEM_DESIGN.md`](SYSTEM_DESIGN.md) & [`docs/v4/ARCHITECTURE.md`](docs/v4/ARCHITECTURE.md) |
| Entity schemas & OpenAPI contracts | [`docs/v4/DATA_AND_CONTRACTS.md`](docs/v4/DATA_AND_CONTRACTS.md) |
| Visual language & tokens | [`docs/v4/DESIGN.md`](docs/v4/DESIGN.md) |
| Maps, geolocation, transit | [`docs/v4/MAPS_AND_TRANSPORT.md`](docs/v4/MAPS_AND_TRANSPORT.md) & [`TRANSIT_DATA.md`](TRANSIT_DATA.md) |
| Images, video, localization | [`docs/v4/MEDIA_LANGUAGE_VOICE.md`](docs/v4/MEDIA_LANGUAGE_VOICE.md) & [`DATA_QUALITY.md`](DATA_QUALITY.md) |
| Agent skills & tooling | [`docs/v4/SKILLS_AND_TOOLING.md`](docs/v4/SKILLS_AND_TOOLING.md) |
| Release, testing, hardware targets | [`docs/v4/RELEASE_AND_QA.md`](docs/v4/RELEASE_AND_QA.md) |

---

## Critical reminders

- **O-TRAVELZ V4**: Built by Algoryxz. Active order: 1. Docs $\rightarrow$ 2. Web V4 $\rightarrow$ 3. iOS V4 $\rightarrow$ 4. Android V4 $\rightarrow$ 5. QA.
- Always inspect `git HEAD` before editing. Current code and verified data **always** win over stale docs.
- Do NOT fabricate transit data, coordinates, fares, or ratings.
- Do NOT claim "real-time bus tracking" — transit data is schedule-based only.
- Do NOT publish a destination without a verified image (`NO VERIFIED IMAGE = NO PUBLIC DESTINATION`).
- AI interprets intent and explains plans; deterministic services own canonical facts.
- Follow Anti-Vibe-Code constraints: no purple/neon gradients, fake counters, fake reviews, or AI-generated tourist photos.
- After every change: run focused tests, leave repo runnable.
