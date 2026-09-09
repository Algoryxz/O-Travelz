import SwiftUI

/// Wave M15: You Root Screen on iOS.
/// Comprehensive 4-section view:
/// 1. Emergency Helplines quick card with safe dialer confirmation
/// 2. Nearby Civic Facilities launcher opening EssentialsSheetView
/// 3. Living Heritage & Artisan Clusters with GI-tagged craft histories
/// 4. App Preferences, Offline Storage footprint, and Platform Truth Transparency
struct YouRootView: View {
    var onPlaceClick: ((String) -> Void)? = nil

    @State private var showEssentialsSheet: Bool = false
    @State private var pendingCallTarget: (name: String, number: String)? = nil
    @State private var showCallAlert: Bool = false

    private let helplines = EssentialsRepository.shared.getEmergencyHelplines()
    private let artisanClusters = EssentialsRepository.shared.getArtisanClusters()

    var body: some View {
        NavigationStack {
            ZStack {
                ColorTokens.canvas
                    .ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: SpacingTokens.space4) {
                        // ==========================================
                        // SECTION 1: EMERGENCY HELPLINES QUICK CARD
                        // ==========================================
                        VStack(alignment: .leading, spacing: SpacingTokens.space1) {
                            HStack(spacing: SpacingTokens.space2) {
                                Image(systemName: "cross.case.fill")
                                    .foregroundStyle(ColorTokens.terracotta)
                                Text(LocalizedStringKey("you_section_emergency"))
                                    .font(TypographyTokens.titleSmall)
                                    .fontWeight(.bold)
                                    .foregroundStyle(ColorTokens.textPrimary)
                            }
                            Text(LocalizedStringKey("you_section_emergency_desc"))
                                .font(TypographyTokens.caption)
                                .foregroundStyle(ColorTokens.textSecondary)
                        }
                        .padding(.horizontal, SpacingTokens.space4)
                        .padding(.top, SpacingTokens.space2)

                        // Emergency quick dial buttons
                        VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                            HStack(spacing: SpacingTokens.space2) {
                                ForEach(helplines.prefix(3)) { helpline in
                                    Button {
                                        pendingCallTarget = (helpline.label, helpline.number)
                                        showCallAlert = true
                                    } label: {
                                        VStack(spacing: 2) {
                                            Text(helpline.number)
                                                .font(TypographyTokens.titleSmall)
                                                .fontWeight(.bold)
                                            Text(helpline.label.components(separatedBy: " ").first ?? "")
                                                .font(TypographyTokens.labelSmall)
                                                .lineLimit(1)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, SpacingTokens.space2)
                                        .background(helpline.number == "112" ? Color.red : ColorTokens.terracotta)
                                        .foregroundStyle(.white)
                                        .clipShape(RoundedRectangle(cornerRadius: 8))
                                    }
                                }
                            }

                            Text("Calls use your device dialer with sanitized numbers. Zero background permissions.")
                                .font(TypographyTokens.caption)
                                .foregroundStyle(ColorTokens.textSecondary)
                        }
                        .padding(SpacingTokens.space3)
                        .background(Color.red.opacity(0.08))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.red.opacity(0.2), lineWidth: 1)
                        )
                        .padding(.horizontal, SpacingTokens.space4)

                        // ==========================================
                        // SECTION 2: NEARBY CIVIC FACILITIES LAUNCHER
                        // ==========================================
                        Button {
                            showEssentialsSheet = true
                        } label: {
                            HStack(spacing: SpacingTokens.space3) {
                                Image(systemName: "cross.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundStyle(ColorTokens.chilika)
                                    .frame(width: 40, height: 40)
                                    .background(ColorTokens.chilika.opacity(0.12))
                                    .clipShape(RoundedRectangle(cornerRadius: 8))

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(LocalizedStringKey("you_action_view_nearby_civic"))
                                        .font(TypographyTokens.bodySmall)
                                        .fontWeight(.bold)
                                        .foregroundStyle(ColorTokens.textPrimary)
                                    Text("Verified district hospitals, police stations, fuel & ATMs")
                                        .font(TypographyTokens.caption)
                                        .foregroundStyle(ColorTokens.textSecondary)
                                }

                                Spacer()

                                Image(systemName: "chevron.right")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundStyle(ColorTokens.textSecondary)
                            }
                            .padding(SpacingTokens.space3)
                            .background(ColorTokens.surface)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(ColorTokens.surfaceVariant, lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                        .padding(.horizontal, SpacingTokens.space4)

                        // ==========================================
                        // SECTION 3: LIVING HERITAGE & ARTISAN CLUSTERS
                        // ==========================================
                        VStack(alignment: .leading, spacing: SpacingTokens.space1) {
                            HStack(spacing: SpacingTokens.space2) {
                                Image(systemName: "paintpalette.fill")
                                    .foregroundStyle(ColorTokens.chilika)
                                Text(LocalizedStringKey("you_section_artisan_clusters"))
                                    .font(TypographyTokens.titleSmall)
                                    .fontWeight(.bold)
                                    .foregroundStyle(ColorTokens.textPrimary)
                            }
                            Text(LocalizedStringKey("you_section_artisan_clusters_desc"))
                                .font(TypographyTokens.caption)
                                .foregroundStyle(ColorTokens.textSecondary)
                        }
                        .padding(.horizontal, SpacingTokens.space4)
                        .padding(.top, SpacingTokens.space2)

                        ForEach(artisanClusters) { cluster in
                            ArtisanClusterCard(cluster: cluster) {
                                if let placeId = cluster.canonicalPlaceId {
                                    onPlaceClick?(placeId)
                                }
                            }
                            .padding(.horizontal, SpacingTokens.space4)
                        }

                        // ==========================================
                        // SECTION 4: PREFERENCES & TRANSPARENCY
                        // ==========================================
                        VStack(alignment: .leading, spacing: SpacingTokens.space1) {
                            HStack(spacing: SpacingTokens.space2) {
                                Image(systemName: "shield.fill")
                                    .foregroundStyle(ColorTokens.forest)
                                Text(LocalizedStringKey("you_section_preferences"))
                                    .font(TypographyTokens.titleSmall)
                                    .fontWeight(.bold)
                                    .foregroundStyle(ColorTokens.textPrimary)
                            }
                        }
                        .padding(.horizontal, SpacingTokens.space4)
                        .padding(.top, SpacingTokens.space2)

                        VStack(spacing: SpacingTokens.space2) {
                            PreferenceCard(
                                title: LocalizedStringKey("you_pref_language_title"),
                                subtitle: LocalizedStringKey("you_pref_language_value")
                            )

                            PreferenceCard(
                                title: LocalizedStringKey("you_pref_offline_title"),
                                subtitle: LocalizedStringKey("you_pref_offline_desc")
                            )

                            PreferenceCard(
                                title: LocalizedStringKey("you_pref_trust_title"),
                                subtitle: LocalizedStringKey("you_pref_trust_desc")
                            )
                        }
                        .padding(.horizontal, SpacingTokens.space4)

                        // Provenance footer
                        VStack(spacing: 4) {
                            Text("O-TRAVELZ V4 • Modern Odisha Cultural Atlas")
                                .font(TypographyTokens.caption)
                                .fontWeight(.semibold)
                                .foregroundStyle(ColorTokens.textSecondary)

                            Text("Built by Algoryxz with verified data and zero hallucinated transit telemetry.")
                                .font(.system(size: 11))
                                .foregroundStyle(ColorTokens.textSecondary.opacity(0.7))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, SpacingTokens.space4)
                    }
                    .padding(.bottom, SpacingTokens.space8)
                }
            }
            .navigationTitle(LocalizedStringKey(TabDestination.you.titleKey))
            .navigationBarTitleDisplayMode(.large)
            .sheet(isPresented: $showEssentialsSheet) {
                // Default coordinates center at Bhubaneswar hub
                EssentialsSheetView(queryLat: 20.2961, queryLon: 85.8245)
            }
            .alert(LocalizedStringKey("essentials_dial_confirm_title"), isPresented: $showCallAlert) {
                Button(LocalizedStringKey("essentials_action_dial")) {
                    if let target = pendingCallTarget {
                        launchSafeDialer(rawNumber: target.number)
                    }
                }
                Button(LocalizedStringKey("transit_action_close"), role: .cancel) {
                    pendingCallTarget = nil
                }
            } message: {
                if let target = pendingCallTarget {
                    Text("You are about to call \(target.name) (\(target.number)). This will open your phone dialer.")
                }
            }
        }
    }

    private func launchSafeDialer(rawNumber: String) {
        let sanitized = rawNumber.filter { $0.isNumber || $0 == "+" }
        guard !sanitized.isEmpty, let url = URL(string: "tel://\(sanitized)") else { return }
        #if canImport(UIKit)
        UIApplication.shared.open(url, options: [:], completionHandler: nil)
        #endif
    }
}

private struct ArtisanClusterCard: View {
    let cluster: ArtisanCluster
    let onClick: () -> Void

    var body: some View {
        Button(action: onClick) {
            VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(cluster.name)
                            .font(TypographyTokens.bodySmall)
                            .fontWeight(.bold)
                            .foregroundStyle(ColorTokens.textPrimary)

                        Text("\(cluster.craftName) • \(cluster.district)")
                            .font(TypographyTokens.caption)
                            .fontWeight(.medium)
                            .foregroundStyle(ColorTokens.chilika)
                    }

                    Spacer()

                    if cluster.giTagged {
                        HStack(spacing: 3) {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 10))
                            Text("GI Tag")
                                .font(.system(size: 10, weight: .bold))
                        }
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(ColorTokens.terracotta.opacity(0.12))
                        .foregroundStyle(ColorTokens.terracotta)
                        .clipShape(Capsule())
                    }
                }

                Text(cluster.description)
                    .font(TypographyTokens.caption)
                    .foregroundStyle(ColorTokens.textSecondary)
                    .lineLimit(3)

                if cluster.canonicalPlaceId != nil {
                    HStack {
                        Spacer()
                        Text("Explore Destination")
                            .font(TypographyTokens.caption)
                            .fontWeight(.semibold)
                            .foregroundStyle(ColorTokens.terracotta)
                        Image(systemName: "chevron.right")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(ColorTokens.terracotta)
                    }
                    .padding(.top, 2)
                }
            }
            .padding(SpacingTokens.space3)
            .background(ColorTokens.surface)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(ColorTokens.surfaceVariant, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

private struct PreferenceCard: View {
    let title: LocalizedStringKey
    let subtitle: LocalizedStringKey

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(TypographyTokens.bodySmall)
                .fontWeight(.semibold)
                .foregroundStyle(ColorTokens.textPrimary)

            Text(subtitle)
                .font(TypographyTokens.caption)
                .foregroundStyle(ColorTokens.textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(SpacingTokens.space3)
        .background(ColorTokens.surface)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(ColorTokens.surfaceVariant, lineWidth: 1)
        )
    }
}
