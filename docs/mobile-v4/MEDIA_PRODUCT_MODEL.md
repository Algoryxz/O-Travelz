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

#### 2.2.1 Presentation Truth (`VIDEO_ASSET_PRESENTATION_TRUTH`)
- **Strict Gating**: Video playback controls and video badging appear **strictly** when a verified playable destination-specific video asset exists.
- **No Impersonation**: Still images and photos may **never** impersonate video (e.g. no fake play buttons or faux-video looping frames).
- **No Cross-Destination Fallback**: Never display a generic or neighboring place video if the active destination lacks a video asset.
- **Attribution Required**: Video credits and provenance must accompany playback. Muted by default with explicit traveler audio toggle.

#### 2.2.2 Performance Budget (`VIDEO_PERFORMANCE_BUDGET: PROVISIONAL_UNTIL_NATIVE_PROFILING`)
- **Starting Budget Targets**: H.264 / H.265 MP4 loops ($< 5\text{ MB}$, maximum 12 seconds) represent **initial target guidelines** (`STARTING_BUDGET`), not immutable canonical truth.
- **Runtime Dependency Factors**: Final production video budgets will be calibrated during native profiling in Waves M23 and M25 based on:
  - Codec efficiency (H.265 / AV1 vs H.264 fallback)
  - Display viewport dimensions and pixel density
  - Target bitrate vs cellular data preservation
  - Video startup latency and decoder initialization time
  - GPU memory overhead and battery impact
  - Network reachability (cellular vs WiFi) and ExoPlayer / AVPlayer caching behavior

### 2.3 Curated 3D Heritage Assets (`CURATED_DESTINATION_SPECIFIC_3D`)
- **Format**: `.glb` (Android) and `.usdz` (iOS).
- **Provenance Classification**: Each 3D asset must declare its verified provenance:
  - `PHOTOGRAMMETRY` (High-density camera scan)
  - `MANUAL_MODEL` (Expert CAD / 3D artist architectural model)
  - `PROCEDURAL_RECONSTRUCTION` (Procedural temple geometry)
  - `OTHER_VERIFIED_SOURCE`
- **Strict Gating**: 3D interactive viewer controls appear **strictly** on destinations with canonical 3D asset metadata (`has_3d=true`).
- **Prohibition**: Destinations lacking 3D models (`has_3d=false`) **never** display 3D buttons or disabled placeholders (`has_3d=false` cannot be upgraded by the mobile client). Zero generic 3D fallback models.
- **User-Facing Labeling**: The UI must display neutral terminology such as **"3D Experience"** or **"Interactive 3D"**. The term **"3D Scan"** is strictly permitted only when the underlying asset provenance is verified as `PHOTOGRAMMETRY`. Backend `has_3d=false` remains authoritative.

---

## 3. Visual Presentation & Fallback Isolation

- **`EXACT_LOCATION_VERIFIED`**: Depicts the exact physical site; eligible for destination hero banners and cards.
- **`RELATED_LOCATION`**: Depicts district cultural context (e.g. a general landscape photo of Mayurbhanj district); eligible for secondary article essays, but **strictly prohibited from being used as a destination's primary hero card**.
- **No Cross-Destination Fallbacks**: Never substitute a photo of Lingaraj Temple onto a Mukteshwar card simply because both are temples in Bhubaneswar. Missing photos fail closed to private staging.
