import SwiftUI

/// Structural container for Plan root on iOS.
/// Owns its navigation hierarchy and responsive presentation.
struct PlanRootView: View {
    var body: some View {
        NavigationStack {
            ZStack {
                ColorTokens.canvas
                    .ignoresSafeArea()

                VStack(spacing: SpacingTokens.space4) {
                    Text("Deterministic Itinerary Planner")
                        .font(TypographyTokens.titleMedium)
                        .foregroundStyle(ColorTokens.terracotta)
                        .multilineTextAlignment(.center)

                    Text(LocalizedStringKey("root_plan_desc"))
                        .font(TypographyTokens.bodyMedium)
                        .foregroundStyle(ColorTokens.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, SpacingTokens.space6)

                    Text(LocalizedStringKey("bootstrap_status"))
                        .font(TypographyTokens.caption)
                        .foregroundStyle(ColorTokens.textSecondary.opacity(0.7))
                        .multilineTextAlignment(.center)
                }
                .padding(SpacingTokens.space6)
                .frame(maxWidth: 600)
            }
            .navigationTitle(LocalizedStringKey(TabDestination.plan.titleKey))
            .navigationBarTitleDisplayMode(.large)
        }
    }
}
