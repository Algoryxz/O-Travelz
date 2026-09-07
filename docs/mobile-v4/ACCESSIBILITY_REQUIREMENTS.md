# O-TRAVELZ Mobile V4 — Accessibility (a11y) Requirements

> **Authoritative Accessibility Specification**  
> Compliance Standard: **WCAG 2.2 AA Baseline across Android (TalkBack) & iOS (VoiceOver)**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Core Accessibility Requirements

1. **Dynamic Type & Font Scaling**:
   - iOS: Full support from Extra Small to Accessibility XXXL using relative SwiftUI font modifiers (`.font(.title2)`, etc.). Never clip text in fixed-height boxes.
   - Android: Full support for Android system font scale settings ($100\%$ to $200\%$) using `sp` units and Compose auto-wrapping layouts.
2. **Minimum Touch Targets**:
   - Every interactive button, chip, tab, and icon must maintain an accessible touch bounding box of at least **$44\times 44\text{ pt}$** (iOS) and **$48\times 48\text{ dp}$** (Android).
3. **Color Independence for Truth Signals**:
   - Color is **never** the sole indicator of verification or truth status. Every colored truth badge pairs a color tint with an explicit, screen-reader-audible text formula (e.g. green tint *must* accompany text *"Verified Official"*; amber tint *must* accompany text *"Candidate Stop"*).
4. **Textual Map Alternatives**:
   - Every map screen provides an accessible **"View as List"** toggle button. Low-vision or screen-reader travelers can browse all destinations and transit stops in an accessible, linearly navigable list without needing spatial drag gestures.
5. **Screen Reader Semantics**:
   - VoiceOver (iOS) and TalkBack (Android) receive custom accessibility labels:
     - Bus Stop: *"Airport Terminal Stop, CRUT Mo Bus, Serving Routes 10 and 24, Scheduled departure 08:30 AM"* instead of raw unlabelled numbers.
     - Truth Badge: *"Verification status: Officially verified by Archaeological Survey of India"*.
6. **Reduce Motion Support**:
   - If the traveler enables "Reduce Motion" in system settings:
     - Spring transitions and carousel autoplay are replaced with instant high-contrast fades.
     - Parallax header motion on Place Detail is disabled.
7. **Contrast Ratios**:
   - Minimum **4.5:1** contrast for standard editorial body text against backgrounds.
   - Minimum **3.0:1** contrast for large titles, icons, and interactive borders.
