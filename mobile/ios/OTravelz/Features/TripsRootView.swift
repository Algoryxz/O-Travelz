import SwiftUI
import SwiftData

/// Structural container for Trips root on iOS (Wave M14).
/// Displays Active Trip execution, Saved Itineraries, and Saved Places backed by SwiftData.
public struct TripsRootView: View {
    @Environment(\.modelContext) private var modelContext

    @Query(sort: \SavedTripModel.updatedAt, order: .reverse)
    private var savedTrips: [SavedTripModel]

    @Query(sort: \SavedPlaceModel.savedAt, order: .reverse)
    private var savedPlaces: [SavedPlaceModel]

    @Query
    private var allProgress: [TripProgressModel]

    @State private var selectedPlaceId: String? = nil
    @State private var tripToDelete: SavedTripModel? = nil

    public var onNavigateToPlan: (() -> Void)? = nil
    public var onNavigateToDiscover: (() -> Void)? = nil

    public init(
        onNavigateToPlan: (() -> Void)? = nil,
        onNavigateToDiscover: (() -> Void)? = nil
    ) {
        self.onNavigateToPlan = onNavigateToPlan
        self.onNavigateToDiscover = onNavigateToDiscover
    }

    private var activeTripPair: (SavedTripModel, TripProgressModel)? {
        guard let progress = allProgress.first(where: { $0.isActive }),
              let trip = savedTrips.first(where: { $0.tripId == progress.tripId }) else {
            return nil
        }
        return (trip, progress)
    }

    private var isAllEmpty: Bool {
        activeTripPair == nil && savedTrips.isEmpty && savedPlaces.isEmpty
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                ColorTokens.canvas
                    .ignoresSafeArea()

                if isAllEmpty {
                    emptyStateView
                } else {
                    ScrollView {
                        VStack(spacing: SpacingTokens.space5) {
                            // Section 1: Active Trip
                            if let (trip, progress) = activeTripPair {
                                activeTripCard(trip: trip, progress: progress)
                            }

                            // Section 2: Saved Itineraries
                            if !savedTrips.isEmpty {
                                savedTripsSection
                            }

                            // Section 3: Saved Places
                            if !savedPlaces.isEmpty {
                                savedPlacesSection
                            }

                            Spacer(minLength: SpacingTokens.space6)
                        }
                        .padding(SpacingTokens.space4)
                    }
                }
            }
            .navigationTitle(LocalizedStringKey(TabDestination.trips.titleKey))
            .navigationBarTitleDisplayMode(.large)
            .sheet(item: Binding<IdentifiablePlaceId?>(
                get: { selectedPlaceId.map { IdentifiablePlaceId(id: $0) } },
                set: { selectedPlaceId = $0?.id }
            )) { identifiable in
                PlaceDetailView(placeId: identifiable.id)
            }
            .alert(
                LocalizedStringKey("trips_confirm_delete_title"),
                isPresented: Binding<Bool>(
                    get: { tripToDelete != nil },
                    set: { if !$0 { tripToDelete = nil } }
                ),
                presenting: tripToDelete
            ) { trip in
                Button(LocalizedStringKey("trips_action_delete_trip"), role: .destructive) {
                    let repo = PersistenceRepository(context: modelContext)
                    repo.deleteTrip(tripId: trip.tripId)
                    tripToDelete = nil
                }
                Button(LocalizedStringKey("transit_action_close"), role: .cancel) {
                    tripToDelete = nil
                }
            } message: { _ in
                Text(LocalizedStringKey("trips_confirm_delete_msg"))
            }
        }
    }

    // MARK: - Empty State View
    private var emptyStateView: some View {
        VStack(spacing: SpacingTokens.space4) {
            Image(systemName: "bookmark")
                .font(.system(size: 52))
                .foregroundStyle(ColorTokens.terracotta)

            Text(LocalizedStringKey("trips_empty_saved_trips_title"))
                .font(TypographyTokens.titleLarge)
                .foregroundStyle(ColorTokens.textPrimary)
                .multilineTextAlignment(.center)

            Text(LocalizedStringKey("trips_empty_saved_trips_desc"))
                .font(TypographyTokens.bodyMedium)
                .foregroundStyle(ColorTokens.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, SpacingTokens.space4)

            HStack(spacing: SpacingTokens.space3) {
                if let onNavigateToPlan = onNavigateToPlan {
                    Button(action: onNavigateToPlan) {
                        Text(LocalizedStringKey("plan_screen_title"))
                            .font(TypographyTokens.labelMedium)
                            .padding(.horizontal, SpacingTokens.space4)
                            .padding(.vertical, SpacingTokens.space3)
                            .background(ColorTokens.terracotta)
                            .foregroundColor(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                }

                if let onNavigateToDiscover = onNavigateToDiscover {
                    Button(action: onNavigateToDiscover) {
                        Text(LocalizedStringKey("nav_discover"))
                            .font(TypographyTokens.labelMedium)
                            .padding(.horizontal, SpacingTokens.space4)
                            .padding(.vertical, SpacingTokens.space3)
                            .background(Color(uiColor: .secondarySystemBackground))
                            .foregroundColor(ColorTokens.textPrimary)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                }
            }
            .padding(.top, SpacingTokens.space2)
        }
        .padding(SpacingTokens.space6)
        .frame(maxWidth: 500)
    }

    // MARK: - Active Trip Card
    private func activeTripCard(trip: SavedTripModel, progress: TripProgressModel) -> some View {
        let dayStops = trip.sortedStops.filter { $0.dayNumber == progress.activeDay }
        let visitedIds = parseJsonIds(progress.completedStopIdsJson)
        let currentStop = dayStops.first(where: { !visitedIds.contains($0.canonicalPlaceId) }) ?? dayStops.last

        return VStack(alignment: .leading, spacing: SpacingTokens.space3) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(LocalizedStringKey("trips_section_active"))
                        .font(TypographyTokens.labelSmall)
                        .foregroundStyle(ColorTokens.terracotta)
                    Text(trip.title)
                        .font(TypographyTokens.titleMedium)
                        .foregroundStyle(ColorTokens.textPrimary)
                }

                Spacer()

                Text("Day \(progress.activeDay) of \(trip.daysCount)")
                    .font(TypographyTokens.labelMedium)
                    .foregroundStyle(ColorTokens.forest)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(ColorTokens.forest.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            if let stop = currentStop {
                Button(action: { selectedPlaceId = stop.canonicalPlaceId }) {
                    VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                        Text("Next: \(stop.placeName)")
                            .font(TypographyTokens.bodyMedium)
                            .fontWeight(.bold)
                            .foregroundStyle(ColorTokens.textPrimary)

                        HStack(spacing: SpacingTokens.space2) {
                            Text(stop.category.capitalized)
                                .font(TypographyTokens.labelSmall)
                                .foregroundStyle(ColorTokens.textSecondary)

                            if let arrival = stop.plannedArrival, let departure = stop.plannedDeparture {
                                Text("· \(arrival) – \(departure)")
                                    .font(TypographyTokens.labelSmall)
                                    .foregroundStyle(ColorTokens.terracotta)
                            }
                        }

                        // Operational Actions: Mark Visited & Skip
                        HStack(spacing: SpacingTokens.space2) {
                            Button(action: {
                                let repo = PersistenceRepository(context: modelContext)
                                repo.markStopVisited(tripId: trip.tripId, placeId: stop.canonicalPlaceId)
                            }) {
                                HStack(spacing: 4) {
                                    Image(systemName: "checkmark")
                                    Text(LocalizedStringKey("trips_action_mark_visited"))
                                }
                                .font(TypographyTokens.labelMedium)
                                .frame(maxWidth: .infinity, minHeight: 38)
                                .background(ColorTokens.forest)
                                .foregroundColor(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            }
                            .buttonStyle(.plain)

                            Button(action: {
                                let repo = PersistenceRepository(context: modelContext)
                                repo.skipStop(tripId: trip.tripId, placeId: stop.canonicalPlaceId)
                            }) {
                                HStack(spacing: 4) {
                                    Image(systemName: "xmark")
                                    Text(LocalizedStringKey("trips_action_skip_stop"))
                                }
                                .font(TypographyTokens.labelMedium)
                                .frame(maxWidth: .infinity, minHeight: 38)
                                .background(Color(uiColor: .systemBackground))
                                .foregroundColor(ColorTokens.textPrimary)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color.secondary.opacity(0.3), lineWidth: 1)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(SpacingTokens.space3)
                    .background(Color(uiColor: .systemBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .buttonStyle(.plain)
            }

            HStack {
                Spacer()
                Button(action: {
                    let repo = PersistenceRepository(context: modelContext)
                    repo.endActiveTrip(tripId: trip.tripId)
                }) {
                    Text(LocalizedStringKey("trips_action_end_trip"))
                        .font(TypographyTokens.labelMedium)
                        .foregroundStyle(Color.secondary)
                }
            }
        }
        .padding(SpacingTokens.space4)
        .background(ColorTokens.terracotta.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(ColorTokens.terracotta.opacity(0.3), lineWidth: 1.5)
        )
    }

    // MARK: - Saved Trips Section
    private var savedTripsSection: some View {
        VStack(alignment: .leading, spacing: SpacingTokens.space3) {
            Text("\(NSLocalizedString("trips_section_saved_trips", comment: "")) (\(savedTrips.count))")
                .font(TypographyTokens.titleMedium)
                .foregroundStyle(ColorTokens.textPrimary)

            ForEach(savedTrips) { trip in
                let isActive = activeTripPair?.0.tripId == trip.tripId
                VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                    HStack {
                        Text(trip.title)
                            .font(TypographyTokens.titleSmall)
                            .foregroundStyle(ColorTokens.textPrimary)
                        Spacer()
                        Button(action: { tripToDelete = trip }) {
                            Image(systemName: "trash")
                                .font(.caption)
                                .foregroundStyle(Color.secondary)
                        }
                        .buttonStyle(.plain)
                    }

                    Text("\(trip.daysCount) Days · \(trip.stops.count) Confirmed Stops")
                        .font(TypographyTokens.bodySmall)
                        .foregroundStyle(ColorTokens.textSecondary)

                    // Preview Chips
                    HStack(spacing: 4) {
                        ForEach(trip.sortedStops.prefix(3), id: \.stopId) { stop in
                            Button(action: { selectedPlaceId = stop.canonicalPlaceId }) {
                                Text(stop.placeName)
                                    .font(TypographyTokens.labelSmall)
                                    .lineLimit(1)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 3)
                                    .background(Color(uiColor: .systemBackground))
                                    .clipShape(RoundedRectangle(cornerRadius: 6))
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    if !isActive {
                        Button(action: {
                            let repo = PersistenceRepository(context: modelContext)
                            repo.startTrip(tripId: trip.tripId)
                        }) {
                            HStack(spacing: 6) {
                                Image(systemName: "play.fill")
                                Text(LocalizedStringKey("trips_action_start_trip"))
                            }
                            .font(TypographyTokens.labelMedium)
                            .frame(maxWidth: .infinity, minHeight: 36)
                            .background(ColorTokens.terracotta)
                            .foregroundColor(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                        .buttonStyle(.plain)
                        .padding(.top, 4)
                    }
                }
                .padding(SpacingTokens.space4)
                .background(Color(uiColor: .secondarySystemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    // MARK: - Saved Places Section
    private var savedPlacesSection: some View {
        VStack(alignment: .leading, spacing: SpacingTokens.space3) {
            Text("\(NSLocalizedString("trips_section_saved_places", comment: "")) (\(savedPlaces.count))")
                .font(TypographyTokens.titleMedium)
                .foregroundStyle(ColorTokens.textPrimary)

            ForEach(savedPlaces, id: \.canonicalPlaceId) { place in
                HStack(spacing: SpacingTokens.space3) {
                    if let urlStr = place.imageUrl, let url = URL(string: urlStr) {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .success(let image):
                                image.resizable().scaledToFill()
                            default:
                                initialAvatar(name: place.placeName)
                            }
                        }
                        .frame(width: 54, height: 54)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    } else {
                        initialAvatar(name: place.placeName)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(place.placeName)
                            .font(TypographyTokens.titleSmall)
                            .foregroundStyle(ColorTokens.textPrimary)
                            .lineLimit(1)

                        Text("\(place.category.capitalized)\(place.district.map { ", \($0)" } ?? "")")
                            .font(TypographyTokens.bodySmall)
                            .foregroundStyle(ColorTokens.textSecondary)
                            .lineLimit(1)
                    }

                    Spacer()

                    Button(action: {
                        let repo = PersistenceRepository(context: modelContext)
                        repo.unsavePlace(placeId: place.canonicalPlaceId)
                    }) {
                        Image(systemName: "bookmark.fill")
                            .font(.system(size: 20))
                            .foregroundStyle(ColorTokens.terracotta)
                    }
                    .buttonStyle(.plain)
                }
                .padding(SpacingTokens.space3)
                .background(Color(uiColor: .secondarySystemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .contentShape(Rectangle())
                .onTapGesture {
                    selectedPlaceId = place.canonicalPlaceId
                }
            }
        }
    }

    private func initialAvatar(name: String) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(ColorTokens.terracotta.opacity(0.15))
                .frame(width: 54, height: 54)

            Text(String(name.prefix(1)))
                .font(TypographyTokens.titleMedium)
                .foregroundStyle(ColorTokens.terracotta)
        }
    }

    private func parseJsonIds(_ json: String) -> [String] {
        let trimmed = json.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.count > 2 else { return [] }
        let inner = String(trimmed.dropFirst().dropLast())
        if inner.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty { return [] }
        return inner.split(separator: ",").map {
            $0.trimmingCharacters(in: .whitespacesAndNewlines).trimmingCharacters(in: CharacterSet(charactersIn: "\""))
        }.filter { !$0.isEmpty }
    }
}

private struct IdentifiablePlaceId: Identifiable {
    let id: String
}
