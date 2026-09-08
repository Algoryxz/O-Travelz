import SwiftUI

/// Editorial Cultural Atlas Place Card for iOS.
/// Strictly enforces truth: Displays authentic verified imagery when present,
/// or a dignified cultural typography card when verification is pending.
/// NEVER fabricates imagery or stock photos.
struct PlaceCardView: View {
    let place: DiscoverPlace
    var distanceString: String? = nil
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            VStack(alignment: .leading, spacing: 0) {
                // Header Media / Typographic Banner
                if let photo = place.primaryPhoto {
                    ZStack(alignment: .topTrailing) {
                        AsyncImage(url: URL(string: photo.cardUrl ?? photo.url)) { phase in
                            switch phase {
                            case .empty:
                                Rectangle()
                                    .fill(ColorTokens.sandstoneLight.opacity(0.6))
                                    .overlay {
                                        ProgressView()
                                            .tint(ColorTokens.terracotta)
                                    }
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(16 / 10, contentMode: .fill)
                                    .clipped()
                            case .failure:
                                FallbackCulturalBanner(place: place)
                            @unknown default:
                                FallbackCulturalBanner(place: place)
                            }
                        }
                        .frame(height: 180)
                        .frame(maxWidth: .infinity)

                        // Verified Badge
                        HStack(spacing: SpacingTokens.space1) {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 11))
                            Text(LocalizedStringKey("badge_verified"))
                                .font(TypographyTokens.labelSmall)
                        }
                        .padding(.horizontal, SpacingTokens.space3)
                        .padding(.vertical, SpacingTokens.space1)
                        .background(ColorTokens.truthVerified.opacity(0.9))
                        .foregroundStyle(.white)
                        .clipShape(Capsule())
                        .padding(SpacingTokens.space3)
                    }
                } else {
                    FallbackCulturalBanner(place: place)
                        .frame(height: 140)
                        .frame(maxWidth: .infinity)
                }

                // Metadata Section
                VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                    // Category & District Badges
                    HStack(spacing: SpacingTokens.space2) {
                        Text(place.category.replacingOccurrences(of: "_", with: " ").capitalized)
                            .font(TypographyTokens.labelSmall)
                            .padding(.horizontal, SpacingTokens.space2)
                            .padding(.vertical, SpacingTokens.space1)
                            .background(ColorTokens.terracotta.opacity(0.12))
                            .foregroundStyle(ColorTokens.terracotta)
                            .clipShape(RoundedRectangle(cornerRadius: 4))

                        if let district = place.normalizedDistrict ?? place.district, !district.isEmpty {
                            Text(district.capitalized)
                                .font(TypographyTokens.labelSmall)
                                .foregroundStyle(ColorTokens.textSecondary)
                        }

                        if let dist = distanceString, !dist.isEmpty {
                            Text("• \(dist)")
                                .font(TypographyTokens.labelSmall)
                                .foregroundStyle(ColorTokens.terracotta)
                        }

                        Spacer()

                        // Rating if truthful
                        if let rating = place.rating, rating > 0 {
                            HStack(spacing: 2) {
                                Image(systemName: "star.fill")
                                    .font(.system(size: 10))
                                    .foregroundStyle(ColorTokens.terracotta)
                                Text(String(format: "%.1f", rating))
                                    .font(TypographyTokens.labelSmall)
                                    .foregroundStyle(ColorTokens.textPrimary)
                            }
                        }
                    }

                    // Primary English Name
                    Text(place.name)
                        .font(TypographyTokens.titleMedium)
                        .foregroundStyle(ColorTokens.textPrimary)
                        .lineLimit(1)

                    // Authentic Odia Script Name
                    if let odia = place.odiaName, !odia.isEmpty {
                        Text(odia)
                            .font(TypographyTokens.bodyMedium)
                            .foregroundStyle(ColorTokens.chilika)
                            .lineLimit(1)
                    }
                }
                .padding(SpacingTokens.space4)
            }
            .background(ColorTokens.canvas)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(ColorTokens.textSecondary.opacity(0.15), lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.04), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(.plain)
    }
}

/// Cultural Atlas Sandstone Banner for unverified destinations.
/// Elevates authentic Odia cultural typography rather than hiding or using fake imagery.
private struct FallbackCulturalBanner: View {
    let place: DiscoverPlace

    var body: some View {
        ZStack {
            ColorTokens.sandstoneLight

            VStack(spacing: SpacingTokens.space2) {
                if let odia = place.odiaName, !odia.isEmpty {
                    Text(odia)
                        .font(.system(size: 24, weight: .semibold, design: .serif))
                        .foregroundStyle(ColorTokens.terracotta.opacity(0.85))
                        .multilineTextAlignment(.center)
                        .lineLimit(1)
                        .padding(.horizontal, SpacingTokens.space4)
                }

                HStack(spacing: SpacingTokens.space1) {
                    Image(systemName: "photo.badge.exclamationmark")
                        .font(.system(size: 11))
                    Text(LocalizedStringKey("badge_pending"))
                        .font(TypographyTokens.labelSmall)
                }
                .padding(.horizontal, SpacingTokens.space3)
                .padding(.vertical, SpacingTokens.space1)
                .background(ColorTokens.truthCandidate.opacity(0.15))
                .foregroundStyle(ColorTokens.truthCandidate)
                .clipShape(Capsule())
            }
            .padding(SpacingTokens.space3)
        }
    }
}
