# O-Travelz Frontend Contributing Guidelines

`STATUS: VERIFIED`

## 1. Development Workflow

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Run local dev server
npm run dev

# 3. Run full Vitest test suite
npm test

# 4. Build production bundle (TypeScript typecheck + Rollup)
npm run build
```

---

## 2. Rules for Adding or Modifying UI Components

1. **Use Existing Design Tokens**:
   * All colors, borders, and typography must use tokens defined in `src/index.css` (e.g. `bg-[#111827]`, `border-[#263244]`, `text-[#14B8A6]`).
   * Never introduce arbitrary hex codes or custom ad-hoc gradients.
2. **Typography Discipline**:
   * Use `font-display` / `font-brand-heading` for primary headings.
   * Use `font-editorial-serif` exclusively for editorial storytelling quotes.
   * Use `font-data-mono` for times, distances, coordinates, and telemetry.
3. **Accessibility**:
   * Interactive buttons must have visible focus rings (`focus-visible:outline-2 focus-visible:outline-[#14B8A6]`).
   * Images must have descriptive `alt` text.
   * All clickable elements must have `cursor-pointer`.
4. **Preserve Test IDs and Data Attributes**:
   * Critical user interactions rely on `data-testid` attributes (e.g. `hero-surprise-me-button`, `nav-tab-discover`, `export-itinerary-button`). Never remove existing test identifiers.
5. **No Visual Blobs or Glassmorphism**:
   * Maintain solid surfaces and crisp hairline borders as defined in `docs/design-guardrails.md`.
