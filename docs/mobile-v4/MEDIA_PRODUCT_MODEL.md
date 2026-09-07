# O-TRAVELZ Mobile V4 — Media Product Model & Visual Integrity

> **Authoritative Media Specification**  
> Philosophy: **Authentic Visual Truth; Zero Synthetic Hallucination**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Core Media Philosophy & Anti-Vibe-Code Rules

O-TRAVELZ treats photography, video, and 3D assets as **forensic evidence of Odisha's cultural reality**. We reject the synthetic aesthetics of generic travel portals:
1. **Zero AI-Generated Imagery**: Midjourney, Stable Diffusion, DALL-E, and Sora outputs are **strictly banned** from all public-facing screens. Every photograph depicts the actual physical monument, artisan, or landscape in Odisha.
2. **Quality Gate Rule**: `NO VERIFIED IMAGE = NO PUBLIC DESTINATION`. Places lacking audited photography remain in staging and are never published to the public Discover catalog.
3. **Distinct Source Count**: The photo counter badge (e.g. `[8 Photos]`) must count **distinct physical source photographs**, never multi-resolution WebP variants (`hero.webp`, `card.webp`, `thumbnail.webp`).

---

## 2. Multi-Format Asset Standards

### 2.1 Photography Pipeline (Multi-Tier WebP)
- **Delivery Format**: Modern WebP with fallback JPEG.
- **Variant Hierarchy**:
  - `hero.webp`: 16:9 / 21:9 wide crop for detail headers ($1200\times 675\text{ px}$).
  - `card.webp`: 4:3 editorial card crop for feeds ($800\times 600\text{ px}$).
  - `thumbnail.webp`: 1:1 square crop for list rows ($200\times 200\text{ px}$).
- **Attribution & Provenance**: Every photo displays source photographer or cultural archive attribution (e.g. *"Photo: ASI Odisha Circle / Algoryxz Field Team"*).

### 2.2 Short-Form Video Loops
- **Format**: H.264 / H.265 MP4 loops ($< 5\text{ MB}$, maximum 12 seconds).
- **Rule**: Genuine on-site documentary recordings only (e.g. a master artisan carving stone in Raghurajpur, waves at Chandrabhaga). Muted by default with manual audio toggle.

### 2.3 Heritage 3D Monument Scans
- **Format**: `.glb` (Android) and `.usdz` (iOS).
- **Strict Gating**: 3D interactive viewer controls appear **strictly** on destinations with official canonical 3D photogrammetry scans (e.g. Konark Sun Temple, Mukteshwar Temple).
- **Prohibition**: Destinations lacking 3D models **never** display 3D buttons or disabled placeholders.

---

## 3. Visual Presentation & Fallback Isolation

- **`EXACT_LOCATION_VERIFIED`**: Depicts the exact physical site; eligible for destination hero banners and cards.
- **`RELATED_LOCATION`**: Depicts district cultural context (e.g. a general landscape photo of Mayurbhanj district); eligible for secondary article essays, but **strictly prohibited from being used as a destination's primary hero card**.
- **No Cross-Destination Fallbacks**: Never substitute a photo of Lingaraj Temple onto a Mukteshwar card simply because both are temples in Bhubaneswar. Missing photos fail closed to private staging.
