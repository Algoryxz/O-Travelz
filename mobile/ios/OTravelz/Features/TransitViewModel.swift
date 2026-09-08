import Foundation
import SwiftUI

@MainActor
public final class TransitViewModel: ObservableObject {
    @Published public var allRoutes: [TransitRouteSummary] = []
    @Published public var filteredRoutes: [TransitRouteSummary] = []
    @Published public var searchQuery: String = ""
    @Published public var selectedRegion: TransitRegion? = nil
    @Published public var isLoading: Bool = true
    @Published public var selectedRouteDetail: TransitRouteDetail? = nil
    @Published public var isRouteDetailLoading: Bool = false
    @Published public var selectedDirectionIndex: Int = 0
    @Published public var selectedStopForSheet: TransitStop? = nil
    @Published public var userLat: Double? = nil
    @Published public var userLon: Double? = nil
    @Published public var isRealGps: Bool = false

    private let repository: TransitRepositoryProtocol

    public init(repository: TransitRepositoryProtocol = TransitRepository.shared) {
        self.repository = repository
        loadRoutes()
    }

    public func loadRoutes() {
        isLoading = true
        Task {
            let routes = await repository.getRoutes()
            self.allRoutes = routes
            self.applyFilters()
            self.isLoading = false
        }
    }

    public func onSearchQueryChanged(_ query: String) {
        self.searchQuery = query
        applyFilters()
    }

    public func onRegionSelected(_ region: TransitRegion?) {
        if self.selectedRegion == region {
            self.selectedRegion = nil
        } else {
            self.selectedRegion = region
        }
        applyFilters()
    }

    public func clearFilters() {
        self.searchQuery = ""
        self.selectedRegion = nil
        applyFilters()
    }

    public func selectRoute(routeId: String) {
        isRouteDetailLoading = true
        selectedDirectionIndex = 0
        Task {
            let detail = await repository.getRouteDetail(routeId: routeId)
            self.selectedRouteDetail = detail
            self.isRouteDetailLoading = false
        }
    }

    public func clearSelectedRoute() {
        self.selectedRouteDetail = nil
        self.selectedStopForSheet = nil
    }

    public func selectDirection(index: Int) {
        self.selectedDirectionIndex = index
    }

    public func selectStop(_ stop: TransitStop) {
        self.selectedStopForSheet = stop
    }

    public func dismissStopSheet() {
        self.selectedStopForSheet = nil
    }

    public func updateUserLocation(lat: Double?, lon: Double?, isReal: Bool) {
        self.userLat = lat
        self.userLon = lon
        self.isRealGps = isReal
    }

    private func applyFilters() {
        self.filteredRoutes = TransitSearchEngine.filterAndRank(
            routes: allRoutes,
            query: searchQuery,
            selectedRegion: selectedRegion
        )
    }

    public var hasActiveFilters: Bool {
        !searchQuery.trimmingCharacters(in: .whitespaces).isEmpty || selectedRegion != nil
    }
}
