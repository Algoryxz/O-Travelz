import SwiftUI

/// Calm, accessible, native SwiftUI status banner for degraded network connectivity.
/// Non-modal, unobtrusive, displays offline mode and continuity assurance.
public struct OfflineBannerView: View {
    public init() {}

    public var body: some View {
        HStack(spacing: Spacing.space3) {
            Image(systemName: "wifi.slash")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(ColorTokens.terracotta)
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 2) {
                Text(LocalizedStringKey("offline_banner_title"))
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(ColorTokens.deepBasalt)

                Text(LocalizedStringKey("offline_banner_desc"))
                    .font(.caption2)
                    .foregroundColor(ColorTokens.mutedCharcoal)
                    .lineLimit(2)
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, Spacing.space4)
        .padding(.vertical, Spacing.space2)
        .background(ColorTokens.warmStone.opacity(0.85))
        .cornerRadius(8)
        .padding(.horizontal, Spacing.space4)
        .padding(.top, Spacing.space2)
        .accessibilityElement(children: .combine)
    }
}
