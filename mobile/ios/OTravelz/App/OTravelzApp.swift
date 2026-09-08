import SwiftUI
import SwiftData

/// O-TRAVELZ iOS V4 Application Entry Point.
/// Native SwiftUI App targeting iOS 17.0+ baseline.
@main
struct OTravelzApp: App {
    var body: some Scene {
        WindowGroup {
            RootTabView()
        }
        .modelContainer(for: [
            SavedPlaceModel.self,
            SavedTripModel.self,
            SavedTripStopModel.self,
            TripProgressModel.self
        ])
    }
}