import SwiftUI

/// Minimal semantic bootstrap placeholder surface.
struct BootstrapPlaceholderView: View {
    let destination: TabDestination

    var body: some View {
        ZStack {
            ColorTokens.canvas
                .ignoresSafeArea()

            VStack(spacing: SpacingTokens.space4) {
                Text(destination.titleKey)
                    .font(TypographyTokens.headlineLarge)
                    .foregroundStyle(ColorTokens.textPrimary)

                Text("bootstrap_subtitle")
                    .font(TypographyTokens.titleMedium)
                    .foregroundStyle(ColorTokens.terracotta)

                Text("bootstrap_status")
                    .font(TypographyTokens.bodyMedium)
                    .foregroundStyle(ColorTokens.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, SpacingTokens.space6)
            }
            .padding(SpacingTokens.space6)
        }
    }
}