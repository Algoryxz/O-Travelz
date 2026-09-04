# O-TRAVELZ V4 — Agent Skills & Design Tooling Registry

> **Authoritative Agent Tooling & Skills Specification**  
> Registry Standard: **Separates Approval, Installed Status, Pinned Version/Commit, Security Review, and Platform Compatibility**  
> Document Version: `4.0.0` | Last Updated: `2026-09-04`

---

## 1. Skill Governance Framework

To maintain architectural integrity and prevent unauthorized external code execution, all agent skills are evaluated through five mandatory dimensions:

1. **Approval Status**: `APPROVED` | `APPROVED_TASK_SPECIFIC` | `REFERENCE_ONLY` | `REVIEW_REQUIRED` | `REDUNDANT` | `REJECTED`.
2. **Installed Status**: `INSTALLED_LOCAL` (Active in `.agents/skills/`) | `EXTERNAL_REFERENCE` | `NOT_INSTALLED`.
3. **Pinned Version / Commit**: Git commit SHA or version string for audit reproducibility.
4. **Security Review**: `PASSED_LOCAL` (Static code and instructions audited) | `NEEDS_AUDIT` | `RESTRICTED_SANDBOX`.
5. **Platform Compatibility**: `CROSS_PLATFORM` | `WEB_ONLY` | `IOS_ONLY` | `ANDROID_ONLY`.

---

## 2. Complete Skills Matrix

| Skill Name | Approval Status | Installed Status | Pinned Version / Commit | Security Review | Platform Scope | Primary Role & Constraints |
|---|---|---|---|---|---|---|
| **ui-ux-pro-max** | `APPROVED` | `INSTALLED_LOCAL` | `.agents/skills/ui-ux-pro-max` | `PASSED_LOCAL` | `CROSS_PLATFORM` | Primary UI/UX intelligence across Web, Mobile, and Design Systems. Enforces accessibility and layout logic. |
| **frontend-design** | `APPROVED` | `INSTALLED_LOCAL` | `.agents/skills/frontend-design` | `PASSED_LOCAL` | `CROSS_PLATFORM` | Guidance for intentional, anti-template editorial layouts, distinctive typography, and cultural framing. |
| **design-system** | `APPROVED` | `INSTALLED_LOCAL` | `.agents/skills/design-system` | `PASSED_LOCAL` | `CROSS_PLATFORM` | Semantic 3-tier token architecture (primitive $\rightarrow$ semantic $\rightarrow$ component) and component specs. |
| **brand** | `APPROVED` | `INSTALLED_LOCAL` | `.agents/skills/brand` | `PASSED_LOCAL` | `CROSS_PLATFORM` | Visual identity, brand voice, editorial consistency, and asset management. |
| **ui-styling** | `APPROVED` | `INSTALLED_LOCAL` | `.agents/skills/ui-styling` | `PASSED_LOCAL` | `WEB_ONLY` | Tailwind CSS utility-first styling. **Strictly prohibited from mobile native code.** |
| **banner-design** | `APPROVED_TASK_SPECIFIC` | `INSTALLED_LOCAL` | `.agents/skills/banner-design` | `PASSED_LOCAL` | `CROSS_PLATFORM` | Designing editorial hero cards, OpenGraph banners, social cards, and print materials. |
| **design** | `APPROVED_TASK_SPECIFIC` | `INSTALLED_LOCAL` | `.agents/skills/design` | `PASSED_LOCAL` | `CROSS_PLATFORM` | Custom SVG iconography, vector assets, and brand identity deliverables. |
| **slides** | `REFERENCE_ONLY` | `INSTALLED_LOCAL` | `.agents/skills/slides` | `PASSED_LOCAL` | `CROSS_PLATFORM` | Strategic presentation generation; not invoked during software application builds. |
| **dpearson2699/swift-ios-skills** | `APPROVED_TASK_SPECIFIC` | `EXTERNAL_REFERENCE` | `dpearson2699/swift-ios-skills` | `PASSED_LOCAL` | `IOS_ONLY` | SwiftUI patterns. **Mandatory Constraint: Must verify minimum iOS 17 API availability; reject iOS 18-only APIs.** |
| **emilkowalski/skills** | `APPROVED_TASK_SPECIFIC` | `EXTERNAL_REFERENCE` | `emilkowalski/skills` | `PASSED_LOCAL` | `CROSS_PLATFORM` | Selective interaction review, micro-interactions, and motion restraint critique. |
| **android/skills** | `REFERENCE_ONLY (Deferred)` | `EXTERNAL_REFERENCE` | `android/skills` | `NEEDS_AUDIT` | `ANDROID_ONLY` | Android architectural baseline when Android implementation wave begins. |
| **Balsa UI** | `REFERENCE_ONLY` | `EXTERNAL_REFERENCE` | GitHub Reference | `NEEDS_AUDIT` | `CROSS_PLATFORM` | Inspiration for semantic design-system tokens and headless component boundaries. |
| **Tegaki** | `FUTURE / TASK_SPECIFIC` | `EXTERNAL_REFERENCE` | GitHub Reference | `NEEDS_AUDIT` | `WEB_ONLY` | Reserved for future interactive hand-drawn cultural storytelling. |
| **ibelick/ui-skills** | `REVIEW_REQUIRED` | `EXTERNAL_REFERENCE` | GitHub Reference | `NEEDS_AUDIT` | `WEB_ONLY` | Audit against local skills to avoid redundant guidance before loading. |
| **Canvas UI** | `REJECTED` | `NOT_INSTALLED` | N/A | `REJECTED` | N/A | Gimmicky canvas animations and cursor effects **strictly banned** from core product UI. |
| **OpenMotion** | `REJECTED` | `NOT_INSTALLED` | N/A | `REJECTED` | N/A | Non-standard motion library; use standard CSS transforms and native SwiftUI animations. |

---

## 3. Stitch MCP Integration Protocol

Stitch MCP is approved for **concept exploration and visual alternative generation**:
1. Major screen redesigns (Web Home, Explore, Place Detail) should explore 2–3 serious architectural alternatives.
2. Direct copying of generic travel layouts is prohibited; all alternatives must adhere to the *Modern Odisha Cultural Atlas* design direction.
3. Once a visual concept is approved, implementation proceeds via native platform code (React/Tailwind on Web, SwiftUI on iOS, Compose on Android).
