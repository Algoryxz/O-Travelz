import SwiftUI
import MapKit

/// Native spatial map product on iOS using MapKit and SwiftUI.Map.
/// Integrates destination markers, layer filters, destination preview sheet,
/// external Apple Maps launch, and linear accessible list alternative.
struct MapRootView: View {
    @State private var viewModel = MapViewModel()
    @State private var selectedDestinationForDetail: String? = nil

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottom) {
                // Base MapKit View
                Map(position: $viewModel.cameraPosition) {
                    // Cultural Leisure Destinations
                    if viewModel.layers.showDestinations {
                        ForEach(viewModel.visibleDestinations) { place in
                            if let coord = place.coordinate {
                                Marker(place.name, coordinate: coord.clCoordinate)
                                    .tint(ColorTokens.terracotta)
                            }
                        }
                    }

                    // Transit Stops
                    ForEach(viewModel.visibleStops) { stop in
                        if let coord = stop.coordinate {
                            Marker(stop.name, coordinate: coord.clCoordinate)
                                .tint(stop.tier.isVerifiedPhysicalPole ? Color.blue : Color.orange)
                        }
                    }

                    // Civic Essentials
                    if viewModel.layers.showEssentials {
                        ForEach(viewModel.visibleServices) { service in
                            Marker(service.name, coordinate: service.coordinate.clCoordinate)
                                .tint(Color.red)
                        }
                    }
                }
                .mapStyle(.standard(elevation: .realistic))
                .mapControls {
                    MapCompass()
                    MapScaleView()
                }
                .ignoresSafeArea(edges: .bottom)

                // Top Floating Search & Layer Controls
                VStack(spacing: SpacingTokens.space2) {
                    // Search bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(ColorTokens.terracotta)
                        TextField(LocalizedStringKey("search_places_hint"), text: $viewModel.searchQuery)
                            .textFieldStyle(.plain)
                        if !viewModel.searchQuery.isEmpty {
                            Button(action: { viewModel.searchQuery = "" }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundStyle(ColorTokens.textSecondary)
                            }
                        }
                    }
                    .padding(SpacingTokens.space3)
                    .background(ColorTokens.surface)
                    .clipShape(RoundedRectangle(cornerRadius: 24))
                    .shadow(radius: 2)

                    // Layer Filter Chips
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: SpacingTokens.space2) {
                            LayerChip(
                                titleKey: "map_layer_destinations",
                                isSelected: viewModel.layers.showDestinations,
                                action: { viewModel.toggleDestinations() }
                            )
                            LayerChip(
                                titleKey: "map_layer_essentials",
                                isSelected: viewModel.layers.showEssentials,
                                action: { viewModel.toggleEssentials() }
                            )
                            LayerChip(
                                titleKey: "map_layer_stops",
                                isSelected: viewModel.layers.showVerifiedStops,
                                action: { viewModel.toggleVerifiedStops() }
                            )
                            LayerChip(
                                titleKey: "map_layer_candidates",
                                isSelected: viewModel.layers.showCandidateStops,
                                action: { viewModel.toggleCandidateStops() }
                            )
                            LayerChip(
                                titleKey: "map_action_list_view",
                                isSelected: viewModel.isListAlternativeVisible,
                                action: { viewModel.toggleListAlternative() }
                            )
                        }
                    }
                }
                .padding(.horizontal, SpacingTokens.space4)
                .padding(.top, SpacingTokens.space2)
                .frame(maxHeight: .infinity, alignment: .top)

                // Floating Action Buttons (My Location)
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Button(action: { viewModel.requestLocation() }) {
                            Image(systemName: "location.fill")
                                .font(.title3)
                                .foregroundStyle(ColorTokens.terracotta)
                                .frame(width: 48, height: 48)
                                .background(ColorTokens.surface)
                                .clipShape(Circle())
                                .shadow(radius: 4)
                        }
                        .accessibilityLabel(LocalizedStringKey("map_action_my_location"))
                        .padding(.trailing, SpacingTokens.space4)
                        .padding(.bottom, viewModel.selectedEntity != .none ? 200 : SpacingTokens.space6)
                    }
                }

                // Selected Entity Preview Card
                if case .destination(let place) = viewModel.selectedEntity {
                    VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(place.name)
                                    .font(TypographyTokens.titleMedium)
                                    .fontWeight(.bold)
                                    .foregroundStyle(ColorTokens.textPrimary)

                                if let odia = place.odiaName, !odia.isEmpty {
                                    Text(odia)
                                        .font(TypographyTokens.bodySmall)
                                        .foregroundStyle(ColorTokens.terracotta)
                                }

                                Text("\(place.category) · \(place.district ?? "")")
                                    .font(TypographyTokens.caption)
                                    .foregroundStyle(ColorTokens.textSecondary)
                            }
                            Spacer()
                            Button(action: { viewModel.clearSelection() }) {
                                Image(systemName: "xmark")
                                    .foregroundStyle(ColorTokens.textSecondary)
                            }
                        }

                        HStack(spacing: SpacingTokens.space3) {
                            Button(action: { selectedDestinationForDetail = place.id }) {
                                Text(LocalizedStringKey("map_action_open_details"))
                                    .font(TypographyTokens.button)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, SpacingTokens.space3)
                                    .background(ColorTokens.terracotta)
                                    .foregroundStyle(.white)
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                            }

                            if let coord = place.coordinate {
                                Button(action: {
                                    if let url = URL(string: "maps://?daddr=\(coord.latitude),\(coord.longitude)") {
                                        UIApplication.shared.open(url)
                                    }
                                }) {
                                    Text(LocalizedStringKey("map_action_navigate"))
                                        .font(TypographyTokens.button)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, SpacingTokens.space3)
                                        .background(ColorTokens.surfaceVariant)
                                        .foregroundStyle(ColorTokens.textPrimary)
                                        .clipShape(RoundedRectangle(cornerRadius: 12))
                                }
                            }
                        }
                    }
                    .padding(SpacingTokens.space4)
                    .background(ColorTokens.surface)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .shadow(radius: 8)
                    .padding(SpacingTokens.space4)
                }
            }
            .navigationTitle(LocalizedStringKey(TabDestination.map.titleKey))
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(item: $selectedDestinationForDetail) { placeId in
                PlaceDetailView(placeId: placeId)
            }
            .sheet(isPresented: $viewModel.isListAlternativeVisible) {
                NavigationStack {
                    VStack(alignment: .leading, spacing: 0) {
                        Text(LocalizedStringKey("offline_map_tiles_unavailable"))
                            .font(TypographyTokens.caption)
                            .foregroundStyle(ColorTokens.mutedCharcoal)
                            .padding(.horizontal, SpacingTokens.space4)
                            .padding(.vertical, SpacingTokens.space2)
                            .background(ColorTokens.warmStone.opacity(0.85))

                        List(viewModel.visibleDestinations) { place in
                            Button(action: {
                                viewModel.isListAlternativeVisible = false
                                selectedDestinationForDetail = place.id
                            }) {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(place.name)
                                        .font(TypographyTokens.headline)
                                        .foregroundStyle(ColorTokens.textPrimary)
                                    if let odia = place.odiaName, !odia.isEmpty {
                                        Text(odia)
                                            .font(TypographyTokens.bodySmall)
                                            .foregroundStyle(ColorTokens.terracotta)
                                    }
                                    Text("\(place.category) · \(place.district ?? "")")
                                        .font(TypographyTokens.caption)
                                        .foregroundStyle(ColorTokens.textSecondary)
                                }
                            }
                        }
                    }
                    .navigationTitle(LocalizedStringKey("map_places_in_area"))
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button("Done") { viewModel.isListAlternativeVisible = false }
                        }
                    }
                }
            }
            .task {
                await viewModel.loadDestinations()
            }
        }
    }
}

private struct LayerChip: View {
    let titleKey: LocalizedStringKey
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(titleKey)
                .font(TypographyTokens.caption)
                .fontWeight(isSelected ? .bold : .normal)
                .padding(.horizontal, SpacingTokens.space3)
                .padding(.vertical, SpacingTokens.space2)
                .background(isSelected ? ColorTokens.terracotta : ColorTokens.surface)
                .foregroundStyle(isSelected ? .white : ColorTokens.textPrimary)
                .clipShape(Capsule())
                .shadow(radius: 1)
        }
    }
}
