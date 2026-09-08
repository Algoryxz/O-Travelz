import SwiftUI

/// Structural container for Discover root on iOS.
/// Implements the Editorial Cultural Atlas Discover browse screen.
/// Truth-preserving: loads real catalog places, allows category & search filtering,
/// and navigates to the PlaceDetailView.
struct DiscoverRootView: View {
    @State private var places: [DiscoverPlace] = []
    @State private var isLoading = true
    @State private var errorMessage: String? = nil
    @State private var selectedCategory: String? = nil
    @State private var searchQuery: String = ""

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

    private var filteredPlaces: [DiscoverPlace] {
        places.filter { place in
            // Leisure eligibility
            guard place.isEligibleLeisure else { return false }

            // Category filter
            if let cat = selectedCategory, !cat.isEmpty && cat != "all" {
                if !place.category.lowercased().contains(cat.lowercased()) {
                    return false
                }
            }

            // Search query filter (matches English name, Odia name, or district)
            if !searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                let q = searchQuery.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
                let matchesName = place.name.lowercased().contains(q)
                let matchesOdia = place.odiaName?.contains(q) ?? false
                let matchesDistrict = place.district?.lowercased().contains(q) ?? false
                if !matchesName && !matchesOdia && !matchesDistrict {
                    return false
                }
            }

            return true
        }
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
                            // Category Filter Chips
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: SpacingTokens.space2) {
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

                            // Empty State
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

                                    if selectedCategory != nil || !searchQuery.isEmpty {
                                        Button(action: {
                                            selectedCategory = nil
                                            searchQuery = ""
                                        }) {
                                            Text(LocalizedStringKey("action_clear_filters"))
                                                .font(TypographyTokens.labelMedium)
                                                .foregroundStyle(ColorTokens.terracotta)
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
                                        NavigationLink(value: place) {
                                            PlaceCardView(place: place, onSelect: {})
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
