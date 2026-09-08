import SwiftUI
import SwiftData

/// Structural container for Plan root on iOS.
/// Implements structured constraint-aware planning and grounded conversational companion.
public struct PlanRootView: View {
    @Environment(\.modelContext) private var modelContext
    @StateObject private var viewModel: PlannerViewModel
    public var onPlaceClick: ((String) -> Void)?
    public var onViewOnMap: (() -> Void)?
    public var onTripStarted: (() -> Void)?

    public init(
        viewModel: PlannerViewModel = PlannerViewModel(),
        onPlaceClick: ((String) -> Void)? = nil,
        onViewOnMap: (() -> Void)? = nil,
        onTripStarted: (() -> Void)? = nil
    ) {
        _viewModel = StateObject(wrappedValue: viewModel)
        self.onPlaceClick = onPlaceClick
        self.onViewOnMap = onViewOnMap
        self.onTripStarted = onTripStarted
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                ColorTokens.canvas
                    .ignoresSafeArea()

                if viewModel.showConstraintsForm || viewModel.planResult == nil {
                    constraintsForm
                } else if let plan = viewModel.planResult {
                    itineraryResultView(plan: plan)
                }
            }
            .navigationTitle(
                (!viewModel.showConstraintsForm && viewModel.planResult != nil)
                    ? LocalizedStringKey("plan_screen_title")
                    : LocalizedStringKey(TabDestination.plan.titleKey)
            )
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if !viewModel.showConstraintsForm && viewModel.planResult != nil {
                    ToolbarItem(placement: .cancellationAction) {
                        Button(action: { viewModel.modifyPlan() }) {
                            HStack(spacing: 4) {
                                Image(systemName: "chevron.left")
                                Text(LocalizedStringKey("action_back"))
                            }
                        }
                    }
                }
            }
        }
    }

    // MARK: - Constraints Form
    private var constraintsForm: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: SpacingTokens.space5) {
                // Natural Language Prompt Card
                VStack(alignment: .leading, spacing: SpacingTokens.space3) {
                    Text(LocalizedStringKey("plan_prompt_title"))
                        .font(TypographyTokens.labelMedium)
                        .foregroundStyle(ColorTokens.textPrimary)

                    TextField(
                        LocalizedStringKey("plan_prompt_hint"),
                        text: $viewModel.naturalLanguagePrompt,
                        axis: .vertical
                    )
                    .lineLimit(2...4)
                    .padding(10)
                    .background(Color(uiColor: .secondarySystemBackground))
                    .cornerRadius(12)

                    HStack {
                        Spacer()
                        Button(action: { viewModel.extractConstraintsWithAI() }) {
                            if viewModel.isAIExtracting {
                                HStack(spacing: 6) {
                                    ProgressView().tint(.white)
                                    Text(LocalizedStringKey("plan_extracting_loading"))
                                        .font(TypographyTokens.labelSmall)
                                }
                                .padding(.horizontal, SpacingTokens.space4)
                                .padding(.vertical, SpacingTokens.space2)
                                .background(ColorTokens.terracotta)
                                .foregroundStyle(.white)
                                .clipShape(Capsule())
                            } else {
                                Text(LocalizedStringKey("plan_action_extract_ai"))
                                    .font(TypographyTokens.labelSmall)
                                    .padding(.horizontal, SpacingTokens.space4)
                                    .padding(.vertical, SpacingTokens.space2)
                                    .background(viewModel.naturalLanguagePrompt.isEmpty ? Color.gray.opacity(0.3) : ColorTokens.terracotta)
                                    .foregroundStyle(.white)
                                    .clipShape(Capsule())
                            }
                        }
                        .disabled(viewModel.naturalLanguagePrompt.isEmpty || viewModel.isAIExtracting)
                    }
                }
                .padding(SpacingTokens.space4)
                .background(Color(uiColor: .secondarySystemBackground).opacity(0.6))
                .cornerRadius(16)

                // Duration Selector
                VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                    Text(LocalizedStringKey("plan_duration_title"))
                        .font(TypographyTokens.titleSmall)
                        .foregroundStyle(ColorTokens.textPrimary)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: SpacingTokens.space2) {
                            ForEach([1, 2, 3, 5], id: \.self) { d in
                                let isSelected = viewModel.constraints.days == d
                                Button(action: { viewModel.setDays(d) }) {
                                    Text(d == 1 ? LocalizedStringKey("plan_duration_1_day") : LocalizedStringKey("plan_duration_\(d)_days"))
                                        .font(TypographyTokens.labelSmall)
                                        .padding(.horizontal, SpacingTokens.space4)
                                        .padding(.vertical, SpacingTokens.space2)
                                        .background(isSelected ? ColorTokens.terracotta : Color(uiColor: .secondarySystemBackground))
                                        .foregroundStyle(isSelected ? .white : ColorTokens.textPrimary)
                                        .clipShape(Capsule())
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }

                // Starting Hub Selector
                VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                    Text(LocalizedStringKey("plan_start_hub_title"))
                        .font(TypographyTokens.titleSmall)
                        .foregroundStyle(ColorTokens.textPrimary)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: SpacingTokens.space2) {
                            ForEach(PlannerHubs.popularHubs, id: \.self) { hub in
                                let isSelected = viewModel.constraints.startHub?.caseInsensitiveCompare(hub) == .orderedSame
                                Button(action: { viewModel.setStartHub(hub) }) {
                                    Text(hub)
                                        .font(TypographyTokens.labelSmall)
                                        .padding(.horizontal, SpacingTokens.space4)
                                        .padding(.vertical, SpacingTokens.space2)
                                        .background(isSelected ? ColorTokens.chilika : Color(uiColor: .secondarySystemBackground))
                                        .foregroundStyle(isSelected ? .white : ColorTokens.textPrimary)
                                        .clipShape(Capsule())
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }

                // Interests Chips
                VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                    Text(LocalizedStringKey("plan_interests_title"))
                        .font(TypographyTokens.titleSmall)
                        .foregroundStyle(ColorTokens.textPrimary)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: SpacingTokens.space2) {
                            ForEach(PlanInterest.allCases) { interest in
                                let isSelected = viewModel.constraints.interests.contains(interest.rawValue)
                                Button(action: { viewModel.toggleInterest(interest.rawValue) }) {
                                    HStack(spacing: 4) {
                                        if isSelected {
                                            Image(systemName: "checkmark")
                                                .font(.system(size: 10, weight: .bold))
                                        }
                                        Text(interest.displayName)
                                    }
                                    .font(TypographyTokens.labelSmall)
                                    .padding(.horizontal, SpacingTokens.space4)
                                    .padding(.vertical, SpacingTokens.space2)
                                    .background(isSelected ? ColorTokens.terracotta : Color(uiColor: .secondarySystemBackground))
                                    .foregroundStyle(isSelected ? .white : ColorTokens.textPrimary)
                                    .clipShape(Capsule())
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }

                // Pace Selector
                VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                    Text(LocalizedStringKey("plan_pace_title"))
                        .font(TypographyTokens.titleSmall)
                        .foregroundStyle(ColorTokens.textPrimary)

                    HStack(spacing: SpacingTokens.space2) {
                        ForEach(PlanPace.allCases) { p in
                            let isSelected = viewModel.constraints.pace == p
                            Button(action: { viewModel.setPace(p) }) {
                                Text(LocalizedStringKey("plan_pace_\(p.rawValue)"))
                                    .font(TypographyTokens.labelSmall)
                                    .padding(.horizontal, SpacingTokens.space4)
                                    .padding(.vertical, SpacingTokens.space2)
                                    .background(isSelected ? ColorTokens.forest : Color(uiColor: .secondarySystemBackground))
                                    .foregroundStyle(isSelected ? .white : ColorTokens.textPrimary)
                                    .clipShape(Capsule())
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }

                // Transport & Walking Preferences
                VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                    Text(LocalizedStringKey("plan_transport_title"))
                        .font(TypographyTokens.titleSmall)
                        .foregroundStyle(ColorTokens.textPrimary)

                    HStack(spacing: SpacingTokens.space2) {
                        Button(action: { viewModel.togglePublicTransport(!viewModel.constraints.publicTransportPreferred) }) {
                            HStack(spacing: 4) {
                                Image(systemName: "bus.fill")
                                Text(LocalizedStringKey("plan_pref_public_transit"))
                            }
                            .font(TypographyTokens.labelSmall)
                            .padding(.horizontal, SpacingTokens.space3)
                            .padding(.vertical, SpacingTokens.space2)
                            .background(viewModel.constraints.publicTransportPreferred ? ColorTokens.chilika : Color(uiColor: .secondarySystemBackground))
                            .foregroundStyle(viewModel.constraints.publicTransportPreferred ? .white : ColorTokens.textPrimary)
                            .clipShape(Capsule())
                        }
                        .buttonStyle(.plain)

                        Button(action: { viewModel.toggleLowWalking(!viewModel.constraints.lowWalking) }) {
                            HStack(spacing: 4) {
                                Image(systemName: "figure.walk")
                                Text(LocalizedStringKey("plan_pref_low_walking"))
                            }
                            .font(TypographyTokens.labelSmall)
                            .padding(.horizontal, SpacingTokens.space3)
                            .padding(.vertical, SpacingTokens.space2)
                            .background(viewModel.constraints.lowWalking ? ColorTokens.forest : Color(uiColor: .secondarySystemBackground))
                            .foregroundStyle(viewModel.constraints.lowWalking ? .white : ColorTokens.textPrimary)
                            .clipShape(Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                }

                // Error Banner
                if let error = viewModel.errorMessage {
                    HStack(spacing: SpacingTokens.space2) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.orange)
                        Text(error)
                            .font(TypographyTokens.bodySmall)
                            .foregroundColor(.primary)
                    }
                    .padding(SpacingTokens.space3)
                    .background(Color.orange.opacity(0.12))
                    .cornerRadius(10)
                }

                // Generate Primary Action
                Button(action: { viewModel.generatePlan() }) {
                    HStack(spacing: SpacingTokens.space2) {
                        if viewModel.isLoading {
                            ProgressView().tint(.white)
                            Text(LocalizedStringKey("plan_generating_loading"))
                                .font(TypographyTokens.labelLarge)
                        } else {
                            Text(LocalizedStringKey("plan_action_generate"))
                                .font(TypographyTokens.labelLarge)
                        }
                    }
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .background(ColorTokens.terracotta)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .disabled(viewModel.isLoading)
                .buttonStyle(.plain)
            }
            .padding(SpacingTokens.space5)
        }
    }

    // MARK: - Itinerary Result View
    private func itineraryResultView(plan: PlanResult) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: SpacingTokens.space4) {
                // Header Summary Card
                VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                    Text(LocalizedStringKey(stringLiteral: "\(plan.constraints.days)-Day Itinerary · \(plan.constraints.startHub ?? "Odisha")"))
                        .font(TypographyTokens.titleLarge)
                        .foregroundStyle(ColorTokens.textPrimary)

                    Text("\(plan.totalStopsCount) Confirmed Stops")
                        .font(TypographyTokens.bodyMedium)
                        .foregroundStyle(ColorTokens.terracotta)

                    HStack {
                        Button(action: { viewModel.modifyPlan() }) {
                            HStack(spacing: 4) {
                                Image(systemName: "arrow.clockwise")
                                Text(LocalizedStringKey("plan_action_modify"))
                            }
                            .font(TypographyTokens.labelSmall)
                            .foregroundStyle(ColorTokens.terracotta)
                        }

                        Spacer()

                        Button(action: { onViewOnMap?() }) {
                            HStack(spacing: 4) {
                                Image(systemName: "map")
                                Text(LocalizedStringKey("plan_view_itinerary_map"))
                            }
                            .font(TypographyTokens.labelSmall)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(ColorTokens.chilika)
                            .foregroundColor(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                    }

                    Divider()

                    // Persistence Action Row (Wave M14)
                    HStack(spacing: SpacingTokens.space3) {
                        Button(action: {
                            let repo = PersistenceRepository(context: modelContext)
                            viewModel.saveCurrentPlan(persistenceRepo: repo)
                        }) {
                            HStack(spacing: 6) {
                                Image(systemName: viewModel.saveTripState == .saved ? "bookmark.fill" : "bookmark")
                                Text(viewModel.saveTripState == .saved ? LocalizedStringKey("trips_status_saved") : (viewModel.saveTripState == .saving ? LocalizedStringKey("trips_action_saving") : LocalizedStringKey("trips_action_save_itinerary")))
                                    .font(TypographyTokens.labelMedium)
                            }
                            .frame(maxWidth: .infinity, minHeight: 42)
                            .background(Color(uiColor: .systemBackground))
                            .foregroundColor(ColorTokens.terracotta)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(ColorTokens.terracotta.opacity(0.3), lineWidth: 1)
                            )
                        }
                        .disabled(viewModel.saveTripState == .saving)
                        .buttonStyle(.plain)

                        Button(action: {
                            let repo = PersistenceRepository(context: modelContext)
                            viewModel.startCurrentPlan(persistenceRepo: repo) {
                                onTripStarted?()
                            }
                        }) {
                            HStack(spacing: 6) {
                                Image(systemName: "play.fill")
                                Text(LocalizedStringKey("trips_action_start_trip"))
                                    .font(TypographyTokens.labelMedium)
                            }
                            .frame(maxWidth: .infinity, minHeight: 42)
                            .background(ColorTokens.terracotta)
                            .foregroundColor(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(SpacingTokens.space4)
                .background(Color(uiColor: .secondarySystemBackground))
                .cornerRadius(16)

                // Grounded AI Insights
                if let aiMessage = plan.aiCompanionMessage, !aiMessage.isEmpty {
                    VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                        HStack {
                            Text(LocalizedStringKey("plan_ai_companion_title"))
                                .font(TypographyTokens.labelMedium)
                                .foregroundStyle(ColorTokens.chilika)
                            Spacer()
                            Text(LocalizedStringKey("plan_ai_grounded_badge"))
                                .font(.caption2.weight(.semibold))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(ColorTokens.forest.opacity(0.15))
                                .foregroundStyle(ColorTokens.forest)
                                .clipShape(Capsule())
                        }
                        Text(aiMessage)
                            .font(TypographyTokens.bodySmall)
                            .foregroundStyle(ColorTokens.textPrimary)
                    }
                    .padding(SpacingTokens.space4)
                    .background(ColorTokens.chilika.opacity(0.08))
                    .cornerRadius(14)
                }

                // Days & Stops Timeline
                ForEach(plan.days) { day in
                    Text("Day \(day.dayNumber)")
                        .font(TypographyTokens.titleMedium)
                        .foregroundStyle(ColorTokens.textPrimary)

                    ForEach(day.stops) { stop in
                        if let hop = day.hops.first(where: { $0.toSequence == stop.sequence }) {
                            hopRow(hop: hop)
                        }
                        stopRow(stop: stop)
                    }
                }

                // Disclosures & Truth Notice Banner
                VStack(alignment: .leading, spacing: 4) {
                    Text(LocalizedStringKey("plan_disclaimer_title"))
                        .font(TypographyTokens.labelSmall)
                        .foregroundStyle(ColorTokens.textSecondary)

                    Text("• " + NSLocalizedString("plan_disclaimer_hours", comment: ""))
                        .font(.caption2)
                        .foregroundStyle(ColorTokens.textSecondary)

                    Text("• " + NSLocalizedString("plan_disclaimer_fares", comment: ""))
                        .font(.caption2)
                        .foregroundStyle(ColorTokens.textSecondary)
                }
                .padding(SpacingTokens.space3)
                .background(Color(uiColor: .secondarySystemBackground).opacity(0.5))
                .cornerRadius(12)
            }
            .padding(SpacingTokens.space5)
        }
    }

    private func stopRow(stop: PlanStop) -> some View {
        Button(action: { onPlaceClick?(stop.placeId) }) {
            HStack(spacing: SpacingTokens.space3) {
                ZStack {
                    Circle()
                        .fill(ColorTokens.terracotta)
                        .frame(width: 32, height: 32)
                    Text("\(stop.sequence)")
                        .font(.caption.weight(.bold))
                        .foregroundColor(.white)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(stop.placeName)
                        .font(TypographyTokens.titleSmall)
                        .foregroundStyle(ColorTokens.textPrimary)

                    HStack(spacing: 6) {
                        Text(stop.category.capitalized)
                            .font(.caption2)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color(uiColor: .secondarySystemBackground))
                            .cornerRadius(4)

                        if let win = stop.timeWindowDisplay {
                            Text(win)
                                .font(.caption2)
                                .foregroundStyle(ColorTokens.textSecondary)
                        }
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundColor(.secondary)
            }
            .padding(SpacingTokens.space3)
            .background(Color(uiColor: .secondarySystemBackground))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
    }

    private func hopRow(hop: JourneyLeg) -> some View {
        HStack(spacing: 8) {
            Rectangle()
                .fill(Color.secondary.opacity(0.3))
                .frame(width: 2, height: 24)
                .padding(.leading, 15)

            Image(systemName: hop.mode.lowercased() == "walk" ? "figure.walk" : "bus.fill")
                .font(.caption)
                .foregroundColor(hop.isUnavailable ? .red : .primary)

            Text(hop.legDetail ?? hop.displayModeTitle)
                .font(.caption)
                .foregroundColor(hop.isUnavailable ? .red : .secondary)

            Spacer()
        }
    }
}
