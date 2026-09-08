import SwiftUI

/// Frozen 5-tab root navigation destinations for O-TRAVELZ Mobile V4.
enum TabDestination: String, CaseIterable, Identifiable {
    case discover
    case map
    case plan
    case trips
    case you

    var id: String { rawValue }

    var titleKey: LocalizedStringKey {
        switch self {
        case .discover: return "nav_discover"
        case .map: return "nav_map"
        case .plan: return "nav_plan"
        case .trips: return "nav_trips"
        case .you: return "nav_you"
        }
    }

    var systemImage: String {
        switch self {
        case .discover: return "sparkles"
        case .map: return "map"
        case .plan: return "calendar.badge.clock"
        case .trips: return "suitcase"
        case .you: return "person"
        }
    }
}