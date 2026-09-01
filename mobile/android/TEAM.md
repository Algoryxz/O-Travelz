# Android Team Operating Rules & Ownership — O-TRAVELZ

## 1. Team Directory
| Member | Branch | Primary Ownership | Package Focus |
|---|---|---|---|
| **Smarak** | `mobile/core-smarak` | Architecture, App Navigation, Build & CI | `MainActivity.kt`, `OTravelzApp.kt`, `app/` |
| **Deeptiman** | `mobile/ui-deeptiman` | UI/UX Lead, Design System, Themes | `core/design/`, `feature/home/` |
| **Rudra** | `mobile/maps-rudra` | Maps, GPS Location, First-Mile Transit | `core/location/`, `feature/map/`, `feature/transit/` |
| **Susmita** | `mobile/notifications-susmita`| Notifications, Permissions, Deep Links | `core/notifications/` |
| **Akriti** | `mobile/data-akriti` | OpenAPI Contracts, Networking, Repos | `data/api/`, `data/model/`, `data/repository/` |
| **Punam** | `mobile/features-punam` | Planner, AI Integration, Error States, Tests | `feature/planner/`, `app/src/test/` |

---

## 2. Operating Rules
1. **Everyone may write Compose UI**, but Deeptiman maintains overall visual consistency and theme compliance.
2. **Never invent travel facts**: Do not display fake bus arrival timers or unauthorized fare estimates.
3. **Strict Nullability**: DTO models in `data/model/` must match `shared/openapi/openapi.json` exactly.
4. **Clean Commits**: Commit frequently with descriptive messages.
5. **Feature Freeze**: Absolute freeze 2–3 hours before morning acceptance demo.
