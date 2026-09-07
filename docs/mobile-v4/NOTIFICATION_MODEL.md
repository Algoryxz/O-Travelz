# O-TRAVELZ Mobile V4 — Notification Product Model & Anti-Spam Policy

> **Authoritative Notification Specification**  
> Core Policy: **Zero Marketing Spam; High-Value Operational Utility Only**  
> Document Version: `4.0.0` | Last Updated: `2026-09-07`

---

## 1. Zero-Spam Engagement Policy

O-TRAVELZ treats user attention with deep editorial restraint:
1. **Zero Re-Engagement Spam**: Generic push notifications such as *"Explore the wonders of Odisha this weekend!"* or *"You haven't visited in 5 days"* are **strictly banned**.
2. **Local-Only Scheduling**: Notifications are scheduled **locally on-device** via `UNUserNotificationCenter` (iOS) and `AlarmManager` / `WorkManager` (Android). No remote marketing push campaigns are executed.
3. **Explicit Opt-In per Alert**: Travelers opt into alerts for specific events (e.g. setting an explicit alarm for a bus departure).

---

## 2. Notification Candidate Classification

| Notification Candidate | Classification | Trigger Condition | Content / Action |
|---|---|---|---|
| **Scheduled Bus Departure Alert** | `OPTIONAL` (User Opt-in) | 15 minutes before scheduled IST departure of an explicit user-selected trip leg. | *"Mo Bus Route 10 departs Master Canteen in 15 mins (Scheduled · 09:30 IST)."* |
| **Active Trip Next Stop Alert** | `OPTIONAL` (User Opt-in) | Scheduled arrival time at next itinerary destination. | *"Next: Dhauli Shanti Stupa. Scheduled visit window: 10:00 - 11:30 IST."* |
| **Severe Weather Warning** | `ESSENTIAL` (Active Trip) | Open-Meteo severe cyclone or heavy thunderstorm warning detected in the active trip's district. | *"Weather Alert: Heavy squall reported in Puri District. Review indoor recommendations."* |
| **Contribution Review Approved** | `OPTIONAL` (Contributor) | Curator approves a staged photo or stop correction. | *"Your contribution for 'Nuapatna Weavers' has been published to the Cultural Atlas."* |
| **Ride Check-In Consensus Met** | `OPTIONAL` (Contributor) | Stop candidate reaches consensus check-in threshold ($\ge 5$). | *"Patia Square Crossing has been verified by 5 riders! Staged for promotion."* |
| **Generic Marketing Prompts** | `DO_NOT_NOTIFY` (BANNED) | Inactivity timer or weekend push. | **STRICTLY PROHIBITED**. |
| **Unsolicited Deal / Promo Alerts**| `DO_NOT_NOTIFY` (BANNED) | Promotional partner offers. | **STRICTLY PROHIBITED**. |
