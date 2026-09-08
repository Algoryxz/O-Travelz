import SwiftUI
import CoreLocation

/// Observable contextual location requester for iOS.
/// Zero prompts on launch; only requests authorization when traveler explicitly taps "Near Me".
@MainActor
final class DiscoverLocationRequester: NSObject, ObservableObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    @Published var coordinate: CLLocationCoordinate2D? = nil
    @Published var isAuthorized: Bool = false
    @Published var isDenied: Bool = false

    override init() {
        super.init()
        manager.delegate = self
        updateStatus(manager.authorizationStatus)
    }

    func requestNearby() {
        let status = manager.authorizationStatus
        switch status {
        case .notDetermined:
            manager.requestWhenInUseAuthorization()
        case .authorizedWhenInUse, .authorizedAlways:
            isAuthorized = true
            isDenied = false
            manager.requestLocation()
        case .denied, .restricted:
            isAuthorized = false
            isDenied = true
        @unknown default:
            break
        }
    }

    private func updateStatus(_ status: CLAuthorizationStatus) {
        switch status {
        case .authorizedWhenInUse, .authorizedAlways:
            isAuthorized = true
            isDenied = false
        case .denied, .restricted:
            isAuthorized = false
            isDenied = true
        default:
            isAuthorized = false
            isDenied = false
        }
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let status = manager.authorizationStatus
        Task { @MainActor in
            self.updateStatus(status)
            if status == .authorizedWhenInUse || status == .authorizedAlways {
                manager.requestLocation()
            }
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let loc = locations.last else { return }
        Task { @MainActor in
            self.coordinate = loc.coordinate
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        // Degrade gracefully without crashing
    }
}

/// Structural container for Discover root on iOS.
/// Implements the Editorial Cultural Atlas Discover browse screen with M9 discovery intelligence:
/// - Deterministic tiered ranking & Odia search matching via DiscoverSearchEngine
/// - Multi-dimensional category & district filtering
/// - Contextual opt-in spatial proximity sorting (Haversine great-circle distance)
/// - Zero-result recovery chips
struct DiscoverRootView: View {
    @State private var places: [DiscoverPlace] = []
    @State private var isLoading = true
    @State private var errorMessage: String? = nil
    @State private var selectedCategory: String? = nil
    @State private var selectedDistrict: String? = nil
    @State private var searchQuery: String = ""
    @State private var isNearbyActive: Bool = false

    @StateObject private var locationRequester = DiscoverLocationRequester()

    private let apiClient = APIClient()

    private let categories = [
        ("all", "filter_all_categories"),
        ("heritage", "Heritage"),
        ("nature", "Nature"),
        ("beach", "Beach"),
        ("temple", "Temple"),
        ("culture", "Culture"),
        ("crafts", "Crafts")
    ]

    private var availableDistricts: [String] {
        let set = Set(places.compactMap { $0.normalizedDistrict })
        return set.sorted()
    }

    private var filteredPlaces: [DiscoverPlace] {
        DiscoverSearchEngine.filterAndRank(
            catalog: places,
            query: searchQuery,
            selectedCategory: selectedCategory,
            selectedDistrict: selectedDistrict,
            userLat: isNearbyActive ? locationRequester.coordinate?.latitude : nil,
            userLon: isNearbyActive ? locationRequester.coordinate?.longitude : nil,
            sortByDistance: isNearbyActive && locationRequester.coordinate != nil
        )
    }

    var body: some View {
        NavigationStack {
            ZStack {
                ColorTokens.canvas
                    .ignoresSafeArea()

                if isLoading && places.isEmpty {
                    VStack(spacing: SpacingTokens.space4) {
                        ProgressView()
                            .tint(ColorTokens.terracotta)
                        Text(LocalizedStringKey("state_loading"))
                            .font(TypographyTokens.bodyMedium)
                            .foregroundStyle(ColorTokens.textSecondary)
                    }
                } else if let error = errorMessage, places.isEmpty {
                    VStack(spacing: SpacingTokens.space4) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 40))
                            .foregroundStyle(ColorTokens.terracotta)

                        Text(LocalizedStringKey("state_error_title"))
                            .font(TypographyTokens.titleLarge)
                            .foregroundStyle(ColorTokens.textPrimary)

                        Text(error)
                            .font(TypographyTokens.bodyMedium)
                            .foregroundStyle(ColorTokens.textSecondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, SpacingTokens.space6)

                        Button(action: { loadPlaces() }) {
                            Text(LocalizedStringKey("action_retry"))
                                .font(TypographyTokens.labelLarge)
                                .foregroundStyle(.white)
                                .padding(.horizontal, SpacingTokens.space6)
                                .padding(.vertical, SpacingTokens.space3)
                                .background(ColorTokens.terracotta)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                    }
                    .padding(SpacingTokens.space6)
                } else {
                    ScrollView {
                        VStack(alignment: .leading, spacing: SpacingTokens.space4) {
                            // Row 1: "Near Me" + Category Filter Chips
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: SpacingTokens.space2) {
                                    // Near Me toggle chip
                                    Button(action: {
                                        if isNearbyActive {
                                            isNearbyActive = false
                                        } else {
                                            isNearbyActive = true
                                            locationRequester.requestNearby()
                                        }
                                    }) {
                                        HStack(spacing: 4) {
                                            Image(systemName: isNearbyActive ? "location.fill" : "location")
                                                .font(.system(size: 11))
                                            Text(LocalizedStringKey("filter_nearby"))
                                                .font(TypographyTokens.labelSmall)
                                        }
                                        .padding(.horizontal, SpacingTokens.space4)
                                        .padding(.vertical, SpacingTokens.space2)
                                        .background(isNearbyActive ? ColorTokens.terracotta : ColorTokens.canvas)
                                        .foregroundStyle(isNearbyActive ? .white : ColorTokens.textPrimary)
                                        .clipShape(Capsule())
                                        .overlay(
                                            Capsule()
                                                .stroke(isNearbyActive ? ColorTokens.terracotta : ColorTokens.textSecondary.opacity(0.2), lineWidth: 1)
                                        )
                                    }
                                    .buttonStyle(.plain)

                                    // Category chips
                                    ForEach(categories, id: \.0) { catKey, label in
                                        let isSelected = (selectedCategory == nil && catKey == "all") || (selectedCategory == catKey)
                                        Button(action: {
                                            if catKey == "all" {
                                                selectedCategory = nil
                                            } else {
                                                selectedCategory = catKey
                                            }
                                        }) {
                                            Text(catKey == "all" ? LocalizedStringKey(label) : LocalizedStringKey(stringLiteral: label))
                                                .font(TypographyTokens.labelSmall)
                                                .padding(.horizontal, SpacingTokens.space4)
                                                .padding(.vertical, SpacingTokens.space2)
                                                .background(isSelected ? ColorTokens.terracotta : ColorTokens.canvas)
                                                .foregroundStyle(isSelected ? .white : ColorTokens.textPrimary)
                                                .clipShape(Capsule())
                                                .overlay(
                                                    Capsule()
                                                        .stroke(isSelected ? ColorTokens.terracotta : ColorTokens.textSecondary.opacity(0.2), lineWidth: 1)
                                                )
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal, SpacingTokens.space5)
                                .padding(.vertical, SpacingTokens.space1)
                            }

                            // Row 2: District Filter Chips
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: SpacingTokens.space2) {
                                    // All Districts chip
                                    let isAllDistricts = (selectedDistrict == nil)
                                    Button(action: { selectedDistrict = nil }) {
                                        Text(LocalizedStringKey("filter_district"))
                                            .font(TypographyTokens.labelSmall)
                                            .padding(.horizontal, SpacingTokens.space3)
                                            .padding(.vertical, SpacingTokens.space1)
                                            .background(isAllDistricts ? ColorTokens.chilika : ColorTokens.canvas)
                                            .foregroundStyle(isAllDistricts ? .white : ColorTokens.textSecondary)
                                            .clipShape(Capsule())
                                            .overlay(
                                                Capsule()
                                                    .stroke(isAllDistricts ? ColorTokens.chilika : ColorTokens.textSecondary.opacity(0.2), lineWidth: 1)
                                            )
                                    }
                                    .buttonStyle(.plain)

                                    ForEach(availableDistricts, id: \.self) { districtName in
                                        let isSelected = (selectedDistrict == districtName)
                                        Button(action: {
                                            selectedDistrict = (selectedDistrict == districtName) ? nil : districtName
                                        }) {
                                            Text(districtName)
                                                .font(TypographyTokens.labelSmall)
                                                .padding(.horizontal, SpacingTokens.space3)
                                                .padding(.vertical, SpacingTokens.space1)
                                                .background(isSelected ? ColorTokens.chilika : ColorTokens.canvas)
                                                .foregroundStyle(isSelected ? .white : ColorTokens.textSecondary)
                                                .clipShape(Capsule())
                                                .overlay(
                                                    Capsule()
                                                        .stroke(isSelected ? ColorTokens.chilika : ColorTokens.textSecondary.opacity(0.2), lineWidth: 1)
                                                )
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal, SpacingTokens.space5)
                                .padding(.vertical, SpacingTokens.space1)
                            }

                            // Results Count / Active Filter Summary
                            HStack {
                                if isNearbyActive && locationRequester.coordinate != nil {
                                    Text("\(filteredPlaces.count) ")
                                        .font(TypographyTokens.labelMedium)
                                        .foregroundStyle(ColorTokens.terracotta)
                                    + Text(LocalizedStringKey("places_near_you"))
                                        .font(TypographyTokens.labelMedium)
                                        .foregroundStyle(ColorTokens.textSecondary)
                                } else {
                                    Text("\(filteredPlaces.count) ")
                                        .font(TypographyTokens.labelMedium)
                                        .foregroundStyle(ColorTokens.terracotta)
                                    + Text(LocalizedStringKey("places_found_count"))
                                        .font(TypographyTokens.labelMedium)
                                        .foregroundStyle(ColorTokens.textSecondary)
                                }

                                Spacer()

                                if selectedCategory != nil || selectedDistrict != nil || !searchQuery.isEmpty || isNearbyActive {
                                    Button(action: {
                                        selectedCategory = nil
                                        selectedDistrict = nil
                                        searchQuery = ""
                                        isNearbyActive = false
                                    }) {
                                        Text(LocalizedStringKey("action_clear_filters"))
                                            .font(TypographyTokens.labelSmall)
                                            .foregroundStyle(ColorTokens.terracotta)
                                    }
                                }
                            }
                            .padding(.horizontal, SpacingTokens.space5)

                            // Empty State / Zero-Result Recovery
                            if filteredPlaces.isEmpty {
                                VStack(spacing: SpacingTokens.space4) {
                                    Image(systemName: "magnifyingglass")
                                        .font(.system(size: 36))
                                        .foregroundStyle(ColorTokens.textSecondary)

                                    Text(LocalizedStringKey("state_empty_title"))
                                        .font(TypographyTokens.titleMedium)
                                        .foregroundStyle(ColorTokens.textPrimary)

                                    Text(LocalizedStringKey("state_empty_desc"))
                                        .font(TypographyTokens.bodyMedium)
                                        .foregroundStyle(ColorTokens.textSecondary)
                                        .multilineTextAlignment(.center)
                                        .padding(.horizontal, SpacingTokens.space6)

                                    // Contextual Recovery Chips
                                    VStack(spacing: SpacingTokens.space2) {
                                        if !searchQuery.isEmpty {
                                            Button(action: { searchQuery = "" }) {
                                                Text(LocalizedStringKey("action_clear_search"))
                                                    .font(TypographyTokens.labelMedium)
                                                    .foregroundStyle(ColorTokens.terracotta)
                                            }
                                        }

                                        if selectedDistrict != nil {
                                            Button(action: { selectedDistrict = nil }) {
                                                Text(LocalizedStringKey("action_clear_district"))
                                                    .font(TypographyTokens.labelMedium)
                                                    .foregroundStyle(ColorTokens.terracotta)
                                            }
                                        }

                                        if selectedCategory != nil {
                                            Button(action: { selectedCategory = nil }) {
                                                Text(LocalizedStringKey("action_clear_category"))
                                                    .font(TypographyTokens.labelMedium)
                                                    .foregroundStyle(ColorTokens.terracotta)
                                            }
                                        }

                                        if isNearbyActive {
                                            Button(action: { isNearbyActive = false }) {
                                                Text(LocalizedStringKey("action_disable_nearby"))
                                                    .font(TypographyTokens.labelMedium)
                                                    .foregroundStyle(ColorTokens.terracotta)
                                            }
                                        }
                                    }
                                }
                                .frame(maxWidth: .infinity, minHeight: 240)
                                .padding(SpacingTokens.space6)
                            } else {
                                // Content Grid
                                LazyVGrid(
                                    columns: [GridItem(.adaptive(minimum: 300, maximum: 500), spacing: SpacingTokens.space4)],
                                    spacing: SpacingTokens.space4
                                ) {
                                    ForEach(filteredPlaces) { place in
                                        let distStr: String? = {
                                            if let coord = locationRequester.coordinate, isNearbyActive {
                                                if let km = place.distanceKmFrom(userLat: coord.latitude, userLon: coord.longitude) {
                                                    return place.formattedDistance(km)
                                                }
                                            }
                                            return nil
                                        }()

                                        NavigationLink(value: place) {
                                            PlaceCardView(place: place, distanceString: distStr, onSelect: {})
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal, SpacingTokens.space5)
                                .padding(.bottom, SpacingTokens.space8)
                            }
                        }
                    }
                    .refreshable {
                        loadPlaces()
                    }
                }
            }
            .navigationTitle(LocalizedStringKey(TabDestination.discover.titleKey))
            .navigationBarTitleDisplayMode(.large)
            .searchable(text: $searchQuery, prompt: LocalizedStringKey("search_places_hint"))
            .navigationDestination(for: DiscoverPlace.self) { place in
                PlaceDetailView(placeId: place.id, initialPlace: place)
            }
            .task {
                if places.isEmpty {
                    loadPlaces()
                }
            }
        }
    }

    private func loadPlaces() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                let dtos = try await apiClient.getPlaces(limit: 300)
                let mapped = dtos.map { PlaceDomainMapper.toDiscoverPlace($0) }
                await MainActor.run {
                    self.places = mapped
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }
}
