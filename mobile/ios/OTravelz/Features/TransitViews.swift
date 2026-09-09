import SwiftUI
import CoreLocation

/// Wave M12: Odisha Transit Directory root view for iOS.
public struct TransitDirectoryView: View {
    @StateObject private var viewModel: TransitViewModel
    @Environment(\.dismiss) private var dismiss
    public var onSelectRouteForMap: ((String) -> Void)?

    public init(viewModel: TransitViewModel = TransitViewModel(), onSelectRouteForMap: ((String) -> Void)? = nil) {
        _viewModel = StateObject(wrappedValue: viewModel)
        self.onSelectRouteForMap = onSelectRouteForMap
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search Field
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondary)
                    TextField(LocalizedStringKey("transit_search_hint"), text: Binding(
                        get: { viewModel.searchQuery },
                        set: { viewModel.onSearchQueryChanged($0) }
                    ))
                    if !viewModel.searchQuery.isEmpty {
                        Button(action: { viewModel.onSearchQueryChanged("") }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding(10)
                .background(Color(.secondarySystemBackground))
                .cornerRadius(10)
                .padding(.horizontal)
                .padding(.top, 8)

                // Regional Filter Chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        Button(action: { viewModel.onRegionSelected(nil) }) {
                            Text(LocalizedStringKey("transit_filter_all_regions"))
                                .font(.caption.weight(.medium))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(viewModel.selectedRegion == nil ? Color.accentColor : Color(.secondarySystemBackground))
                                .foregroundColor(viewModel.selectedRegion == nil ? .white : .primary)
                                .cornerRadius(16)
                        }

                        ForEach(TransitRegion.allCases) { reg in
                            let isSelected = viewModel.selectedRegion == reg
                            Button(action: { viewModel.onRegionSelected(reg) }) {
                                Text(LocalizedStringKey(regionStringKey(reg)))
                                    .font(.caption.weight(.medium))
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(isSelected ? Color.accentColor : Color(.secondarySystemBackground))
                                    .foregroundColor(isSelected ? .white : .primary)
                                    .cornerRadius(16)
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }

                // Results count and clear button
                HStack {
                    Text(String(format: NSLocalizedString("transit_routes_count", comment: ""), viewModel.filteredRoutes.count))
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    if viewModel.hasActiveFilters {
                        Button(action: { viewModel.clearFilters() }) {
                            Text(LocalizedStringKey("transit_action_clear_filters"))
                                .font(.caption.weight(.semibold))
                        }
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, 4)

                // Route List / Empty State
                if viewModel.isLoading {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else if viewModel.filteredRoutes.isEmpty {
                    Spacer()
                    VStack(spacing: 12) {
                        Text(LocalizedStringKey("transit_no_routes_found"))
                            .font(.body)
                            .foregroundColor(.secondary)
                        Button(action: { viewModel.clearFilters() }) {
                            Text(LocalizedStringKey("transit_action_clear_filters"))
                                .font(.subheadline.weight(.semibold))
                        }
                    }
                    .padding()
                    Spacer()
                } else {
                    List {
                        ForEach(viewModel.filteredRoutes) { route in
                            Button(action: { viewModel.selectRoute(routeId: route.routeId) }) {
                                TransitRouteCardRow(route: route)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle(LocalizedStringKey("transit_directory_title"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(action: { dismiss() }) {
                        Text(LocalizedStringKey("action_back"))
                    }
                }
            }
            .navigationDestination(isPresented: Binding(
                get: { viewModel.selectedRouteDetail != nil },
                set: { if !$0 { viewModel.clearSelectedRoute() } }
            )) {
                if let detail = viewModel.selectedRouteDetail {
                    RouteDetailView(
                        route: detail,
                        selectedDirectionIndex: viewModel.selectedDirectionIndex,
                        onDirectionSelected: { viewModel.selectDirection(index: $0) },
                        onStopClick: { viewModel.selectStop($0) },
                        onViewOnMap: {
                            onSelectRouteForMap?($0)
                            dismiss()
                        }
                    )
                }
            }
            .sheet(item: Binding(
                get: { viewModel.selectedStopForSheet },
                set: { if $0 == nil { viewModel.dismissStopSheet() } }
            )) { stop in
                StopDetailSheetView(
                    stop: stop,
                    userLat: viewModel.userLat,
                    userLon: viewModel.userLon,
                    isRealGps: viewModel.isRealGps,
                    onRouteClick: { rNum in
                        viewModel.dismissStopSheet()
                        if let target = viewModel.allRoutes.first(where: { $0.routeNumber.caseInsensitiveCompare(rNum) == .orderedSame }) {
                            viewModel.selectRoute(routeId: target.routeId)
                        }
                    }
                )
            }
        }
    }

    private func regionStringKey(_ reg: TransitRegion) -> String {
        switch reg {
        case .capitalRegion: return "transit_region_capital"
        case .rourkela: return "transit_region_rourkela"
        case .sambalpur: return "transit_region_sambalpur"
        case .berhampur: return "transit_region_berhampur"
        case .keonjhar: return "transit_region_keonjhar"
        }
    }
}

/// Route card row in directory.
public struct TransitRouteCardRow: View {
    public let route: TransitRouteSummary

    public var body: some View {
        HStack(spacing: 12) {
            // Route Number Badge
            Text(route.routeNumber)
                .font(.headline.weight(.bold))
                .foregroundColor(.white)
                .frame(width: 52, height: 44)
                .background(Color.accentColor)
                .cornerRadius(8)

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(route.region.displayName)
                        .font(.caption2.weight(.semibold))
                        .foregroundColor(.accentColor)
                    Text("•")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Text(route.networkType)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }

                Text("\(route.origin) → \(route.destination)")
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.primary)
                    .lineLimit(1)

                if let via = route.via, !via.isEmpty {
                    Text("via \(via)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

/// Route detail view with stop timeline and timetable evaluation.
public struct RouteDetailView: View {
    public let route: TransitRouteDetail
    public let selectedDirectionIndex: Int
    public let onDirectionSelected: (Int) -> Void
    public let onStopClick: (TransitStop) -> Void
    public let onViewOnMap: (String) -> Void

    @State private var scheduler = NotificationScheduler()
    @State private var reminderStatusMessage: String? = nil

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Header Card
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(route.routeNumber)
                            .font(.title3.weight(.bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Color.accentColor)
                            .cornerRadius(6)

                        Spacer()

                        Text(route.region.displayName)
                            .font(.caption.weight(.semibold))
                            .foregroundColor(.accentColor)
                    }

                    Text(route.routeName)
                        .font(.headline)
                        .foregroundColor(.primary)

                    Text(LocalizedStringKey("transit_operator_crut"))
                        .font(.caption)
                        .foregroundColor(.secondary)

                    if let via = route.via, !via.isEmpty {
                        Text("via \(via)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Button(action: { onViewOnMap(route.routeId) }) {
                        HStack {
                            Image(systemName: "map")
                            Text(LocalizedStringKey("transit_action_view_on_map"))
                        }
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(Color(.secondarySystemBackground))
                        .cornerRadius(8)
                    }
                    .padding(.top, 4)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.04), radius: 4, x: 0, y: 2)

                // Timetable Disclaimer
                HStack(spacing: 8) {
                    Image(systemName: "info.circle")
                        .foregroundColor(.secondary)
                    Text(LocalizedStringKey("transit_disclaimer_scheduled"))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(.secondarySystemBackground))
                .cornerRadius(8)

                // Direction Selector
                if route.schedules.count > 1 {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(LocalizedStringKey("transit_direction_selector_title"))
                            .font(.caption.weight(.semibold))
                            .foregroundColor(.secondary)

                        Picker("Direction", selection: Binding(
                            get: { selectedDirectionIndex },
                            set: { onDirectionSelected($0) }
                        )) {
                            ForEach(0..<route.schedules.count, id: \.self) { idx in
                                let label = route.schedules[idx].groupLabel.replacingOccurrences(of: "from_", with: "From ").replacingOccurrences(of: "_", with: " ")
                                Text(label).tag(idx)
                            }
                        }
                        .pickerStyle(.segmented)
                    }
                }

                // Next Scheduled Departure Card
                let currentSchedule = route.schedules.indices.contains(selectedDirectionIndex)
                    ? route.schedules[selectedDirectionIndex]
                    : route.schedules.first

                let nowIst = currentIstTime()
                let departureResult = currentSchedule?.evaluateNextDeparture(currentTimeIst: nowIst)

                VStack(alignment: .leading, spacing: 8) {
                    if let result = departureResult, let nextTime = result.nextDepartureTime {
                        let waitText = result.minutesUntilDeparture.map { "in \($0)m" } ?? ""
                        HStack {
                            Text(String(format: NSLocalizedString("transit_next_departure_label", comment: ""), nextTime, waitText))
                                .font(.subheadline.weight(.bold))
                                .foregroundColor(.accentColor)

                            Spacer()

                            Button {
                                Task {
                                    if scheduler.isReminderActive(routeId: route.routeId, departureTime: nextTime) {
                                        scheduler.cancelReminder(routeId: route.routeId, departureTime: nextTime)
                                        reminderStatusMessage = "Reminder cancelled"
                                    } else {
                                        let req = TransitReminderRequest(
                                            routeId: route.routeId,
                                            routeNumber: route.routeNumber,
                                            origin: route.origin,
                                            departureTime: nextTime,
                                            offsetMinutes: 15
                                        )
                                        let res = await scheduler.scheduleReminder(request: req)
                                        switch res {
                                        case .success:
                                            reminderStatusMessage = "Reminder set for 15m before departure"
                                        case .passedDeparture:
                                            reminderStatusMessage = "This scheduled departure has already passed."
                                        case .permissionDenied:
                                            reminderStatusMessage = "Notifications disabled in Settings."
                                        case .error(let msg):
                                            reminderStatusMessage = msg
                                        }
                                    }
                                }
                            } label: {
                                let isActive = scheduler.isReminderActive(routeId: route.routeId, departureTime: nextTime)
                                HStack(spacing: 4) {
                                    Image(systemName: isActive ? "bell.fill" : "bell")
                                    Text(isActive ? "Reminder set (15m)" : "Remind me")
                                }
                                .font(.caption.weight(.semibold))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(isActive ? Color.accentColor.opacity(0.15) : Color(.secondarySystemBackground))
                                .foregroundColor(isActive ? .accentColor : .primary)
                                .cornerRadius(8)
                            }
                        }

                        if let msg = reminderStatusMessage {
                            Text(msg)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    } else if departureResult?.isServiceFinishedForDay == true {
                        Text(LocalizedStringKey("transit_service_finished_today"))
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.secondary)
                    } else {
                        Text(LocalizedStringKey("transit_timetable_unavailable"))
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }

                    if let sched = currentSchedule, !sched.departureTimes.isEmpty {
                        Text(String(format: NSLocalizedString("transit_departure_times_title", comment: ""), sched.totalTrips))
                            .font(.caption2)
                            .foregroundColor(.secondary)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 6) {
                                ForEach(sched.departureTimes, id: \.self) { dep in
                                    Text(dep)
                                        .font(.caption.weight(dep == departureResult?.nextDepartureTime ? .bold : .regular))
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(dep == departureResult?.nextDepartureTime ? Color.accentColor : Color(.secondarySystemBackground))
                                        .foregroundColor(dep == departureResult?.nextDepartureTime ? .white : .primary)
                                        .cornerRadius(6)
                                }
                            }
                        }
                    }
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(.systemBackground))
                .cornerRadius(12)

                // Fare Pending Notice
                Text(LocalizedStringKey("transit_fare_notice"))
                    .font(.caption2)
                    .foregroundColor(.secondary)

                // Stops Timeline
                Text(String(format: NSLocalizedString("transit_stop_timeline_title", comment: ""), route.totalStopsCount))
                    .font(.headline)

                VStack(spacing: 0) {
                    ForEach(Array(route.stops.enumerated()), id: \.element.id) { index, stop in
                        Button(action: { onStopClick(stop) }) {
                            HStack(spacing: 12) {
                                // Indicator dot
                                Circle()
                                    .fill(stop.isVerifiedPhysicalPole ? Color.green : Color.gray)
                                    .frame(width: 10, height: 10)

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(stop.name)
                                        .font(.subheadline.weight(.medium))
                                        .foregroundColor(.primary)

                                    if stop.isVerifiedPhysicalPole {
                                        Text(LocalizedStringKey("transit_badge_verified_stop"))
                                            .font(.caption2.weight(.semibold))
                                            .foregroundColor(.green)
                                    } else {
                                        Text(LocalizedStringKey("transit_badge_locality_only"))
                                            .font(.caption2)
                                            .foregroundColor(.secondary)
                                    }
                                }

                                Spacer()

                                Image(systemName: "chevron.right")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                            .padding(.vertical, 8)
                        }
                        .buttonStyle(.plain)

                        if index < route.stops.count - 1 {
                            Divider()
                                .padding(.leading, 22)
                        }
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(LocalizedStringKey("transit_route_detail_title"))
    }

    private func currentIstTime() -> String {
        let formatter = DateFormatter()
        formatter.timeZone = TimeZone(identifier: "Asia/Kolkata")
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: Date())
    }
}

/// Stop detail sheet for iOS.
public struct StopDetailSheetView: View {
    public let stop: TransitStop
    public let userLat: Double?
    public let userLon: Double?
    public let isRealGps: Bool
    public let onRouteClick: (String) -> Void
    @Environment(\.dismiss) private var dismiss

    public var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(stop.name)
                .font(.title3.weight(.bold))

            // Verification Card
            VStack(alignment: .leading, spacing: 4) {
                Text(stop.isVerifiedPhysicalPole ? LocalizedStringKey("transit_badge_verified_stop") : LocalizedStringKey("transit_badge_locality_only"))
                    .font(.caption.weight(.bold))
                    .foregroundColor(stop.isVerifiedPhysicalPole ? .green : .primary)

                Text(stop.isVerifiedPhysicalPole ? LocalizedStringKey("transit_stop_verified_desc") : LocalizedStringKey("transit_stop_locality_desc"))
                    .font(.caption)
                    .foregroundColor(.secondary)

                if let coord = stop.coordinate {
                    Text(String(format: "GPS: %.5f, %.5f", coord.latitude, coord.longitude))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .padding(.top, 2)
                }
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(stop.isVerifiedPhysicalPole ? Color.green.opacity(0.1) : Color(.secondarySystemBackground))
            .cornerRadius(10)

            // First-Mile Multimodal Guidance (strictly gated)
            if let guidance = stop.evaluateFirstMile(userLat: userLat, userLon: userLon, isRealGps: isRealGps) {
                HStack(spacing: 8) {
                    Image(systemName: "figure.walk")
                        .foregroundColor(.accentColor)

                    let text: String = {
                        switch guidance.band {
                        case .walkReasonable:
                            let mins = max(1, Int(guidance.distanceMeters / 80.0))
                            let dStr = guidance.distanceMeters < 1000 ? "\(Int(guidance.distanceMeters)) m" : String(format: "%.1f km", guidance.distanceMeters / 1000.0)
                            return String(format: NSLocalizedString("transit_first_mile_walk", comment: ""), dStr, mins)
                        case .walkOrShortAuto:
                            let dStr = String(format: "%.1f km", guidance.distanceMeters / 1000.0)
                            return String(format: NSLocalizedString("transit_first_mile_short_auto", comment: ""), dStr)
                        case .autoOrCabRecommended:
                            let dStr = String(format: "%.1f km", guidance.distanceMeters / 1000.0)
                            return String(format: NSLocalizedString("transit_first_mile_cab_auto", comment: ""), dStr)
                        }
                    }()

                    Text(text)
                        .font(.caption)
                        .foregroundColor(.primary)
                }
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.accentColor.opacity(0.1))
                .cornerRadius(8)
            }

            // Serving Routes
            if !stop.routesServing.isEmpty {
                Text(LocalizedStringKey("transit_serving_routes_title"))
                    .font(.caption.weight(.semibold))

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(stop.routesServing, id: \.self) { rNum in
                            Button(action: { onRouteClick(rNum) }) {
                                Text(rNum)
                                    .font(.caption.weight(.bold))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(Color.accentColor)
                                    .foregroundColor(.white)
                                    .cornerRadius(6)
                            }
                        }
                    }
                }
            }

            // External Navigation Button (strictly for verified physical poles)
            if stop.allowsExternalNavigation, let lat = stop.latitude, let lon = stop.longitude {
                Button(action: {
                    if let url = URL(string: "http://maps.apple.com/?daddr=\(lat),\(lon)") {
                        UIApplication.shared.open(url)
                    }
                }) {
                    Text(LocalizedStringKey("transit_action_get_directions"))
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.accentColor)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }

            Spacer()
        }
        .padding()
        .presentationDetents([.medium, .large])
    }
}
