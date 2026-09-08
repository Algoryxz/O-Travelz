import Foundation
import CoreLocation
import MapKit
import SwiftUI

@Observable
@MainActor
final class MapViewModel: NSObject, CLLocationManagerDelegate {
    var productState: MapProductState = .loading
    var layers: MapLayersState = MapLayersState()
    var destinations: [PlaceCardModel] = []
    var verifiedStops: [TransitStopMarker] = []
    var candidateStops: [TransitStopMarker] = []
    var civicServices: [CivicServiceMarker] = []
    var selectedEntity: SelectedMapEntity = .none
    var locationStatus: LocationStatus = .unknown
    var searchQuery: String = ""
    var selectedDistrict: String? = nil
    var isListAlternativeVisible: Bool = false
    var cameraPosition: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 20.27, longitude: 84.85),
            span: MKCoordinateSpan(latitudeDelta: 4.5, longitudeDelta: 4.5)
        )
    )

    private let locationManager = CLLocationManager()

    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    }

    var visibleDestinations: [PlaceCardModel] {
        guard layers.showDestinations else { return [] }
        var result = destinations
        if let district = selectedDistrict {
            result = result.filter { $0.district?.caseInsensitiveCompare(district) == .orderedSame }
        }
        if !searchQuery.trimmingCharacters(in: .whitespaces).isEmpty {
            let q = searchQuery.lowercased().trimmingCharacters(in: .whitespaces)
            result = result.filter { place in
                place.name.lowercased().contains(q) ||
                (place.odiaName?.lowercased().contains(q) == true) ||
                place.category.lowercased().contains(q) ||
                (place.district?.lowercased().contains(q) == true)
            }
        }
        return result
    }

    var visibleStops: [TransitStopMarker] {
        var list: [TransitStopMarker] = []
        if layers.showVerifiedStops {
            list.append(contentsOf: verifiedStops.filter { $0.canRenderMarker })
        }
        if layers.showCandidateStops {
            list.append(contentsOf: candidateStops.filter { $0.canRenderCandidateMarker })
        }
        return list
    }

    var visibleServices: [CivicServiceMarker] {
        guard layers.showEssentials else { return [] }
        return civicServices
    }

    func loadDestinations() async {
        productState = .loading
        do {
            let dtos = try await APIClient.shared.fetchPlaces()
            let models = dtos
                .compactMap { PlaceDomainMapper.toCardModel(dto: $0) }
                .filter { $0.isEligibleLeisure && $0.coordinate != nil }
            self.destinations = models
            self.productState = .ready
        } catch {
            if destinations.isEmpty {
                self.productState = .dataUnavailable(error.localizedDescription)
            } else {
                self.productState = .ready
            }
        }
    }

    func toggleDestinations() {
        layers.toggleDestinations()
    }

    func toggleEssentials() {
        layers.toggleEssentials()
    }

    func toggleVerifiedStops() {
        layers.showVerifiedStops.toggle()
    }

    func toggleCandidateStops() {
        layers.showCandidateStops.toggle()
    }

    func toggleListAlternative() {
        isListAlternativeVisible.toggle()
    }

    func selectDestination(_ place: PlaceCardModel) {
        selectedEntity = .destination(place)
        if let coord = place.coordinate {
            cameraPosition = .region(
                MKCoordinateRegion(
                    center: CLLocationCoordinate2D(latitude: coord.latitude, longitude: coord.longitude),
                    span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
                )
            )
        }
    }

    func selectStop(_ stop: TransitStopMarker) {
        selectedEntity = .transitStop(stop)
        if let coord = stop.coordinate {
            cameraPosition = .region(
                MKCoordinateRegion(
                    center: coord.clCoordinate,
                    span: MKCoordinateSpan(latitudeDelta: 0.02, longitudeDelta: 0.02)
                )
            )
        }
    }

    func selectService(_ service: CivicServiceMarker) {
        selectedEntity = .civicService(service)
        cameraPosition = .region(
            MKCoordinateRegion(
                center: service.coordinate.clCoordinate,
                span: MKCoordinateSpan(latitudeDelta: 0.02, longitudeDelta: 0.02)
            )
        )
    }

    func clearSelection() {
        selectedEntity = .none
    }

    func requestLocation() {
        switch locationManager.authorizationStatus {
        case .notDetermined:
            locationManager.requestWhenInUseAuthorization()
        case .authorizedWhenInUse, .authorizedAlways:
            locationManager.requestLocation()
        case .denied, .restricted:
            locationStatus = .permissionDenied
        @unknown default:
            locationStatus = .unknown
        }
    }

    // MARK: - CLLocationManagerDelegate

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            switch manager.authorizationStatus {
            case .authorizedWhenInUse, .authorizedAlways:
                manager.requestLocation()
            case .denied, .restricted:
                self.locationStatus = .permissionDenied
            default:
                break
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        Task { @MainActor in
            guard let loc = locations.last else { return }
            if GeoCoordinate.isValid(latitude: loc.coordinate.latitude, longitude: loc.coordinate.longitude) {
                self.locationStatus = .live(
                    latitude: loc.coordinate.latitude,
                    longitude: loc.coordinate.longitude,
                    accuracyMeters: loc.horizontalAccuracy
                )
                self.layers.showUserLocation = true
                self.cameraPosition = .region(
                    MKCoordinateRegion(
                        center: loc.coordinate,
                        span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
                    )
                )
            } else {
                self.locationStatus = .locationUnavailable
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in
            self.locationStatus = .locationUnavailable
        }
    }
}
