import SwiftUI

/// Wave M15: Material / iOS HIG compliant Sheet for Emergency Essentials and Civic Facilities.
/// Provides verified 24x7 state helplines, nearby hospitals, police stations, fuel, and ATMs.
/// Strictly enforces safe dialer handoff with user confirmation dialog and sanitized tel:// URLs.
struct EssentialsSheetView: View {
    @Environment(\.dismiss) private var dismiss

    let queryLat: Double
    let queryLon: Double

    @State private var selectedCategory: CivicCategory = .all
    @State private var services: [CivicServiceItem] = []
    @State private var isLoading: Bool = false
    @State private var errorMessage: String? = nil
    @State private var pendingCallTarget: (name: String, number: String)? = nil
    @State private var showCallAlert: Bool = false

    private let helplines = EssentialsRepository.shared.getEmergencyHelplines()

    var body: some View {
        NavigationStack {
            ZStack {
                ColorTokens.canvas
                    .ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: SpacingTokens.space4) {
                        // Category selector
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: SpacingTokens.space2) {
                                ForEach(CivicCategory.allCases) { category in
                                    let isSelected = selectedCategory == category
                                    Button {
                                        selectedCategory = category
                                        loadServices()
                                    } label: {
                                        Text(category.displayName)
                                            .font(TypographyTokens.caption)
                                            .fontWeight(isSelected ? .bold : .medium)
                                            .padding(.horizontal, SpacingTokens.space3)
                                            .padding(.vertical, SpacingTokens.space2)
                                            .background(isSelected ? ColorTokens.terracotta : ColorTokens.surface)
                                            .foregroundStyle(isSelected ? .white : ColorTokens.textPrimary)
                                            .clipShape(Capsule())
                                            .overlay(
                                                Capsule()
                                                    .stroke(isSelected ? ColorTokens.terracotta : ColorTokens.surfaceVariant, lineWidth: 1)
                                            )
                                    }
                                }
                            }
                            .padding(.horizontal, SpacingTokens.space4)
                        }
                        .padding(.top, SpacingTokens.space2)

                        if isLoading {
                            HStack {
                                Spacer()
                                ProgressView()
                                    .tint(ColorTokens.terracotta)
                                    .padding(.vertical, SpacingTokens.space8)
                                Spacer()
                            }
                        } else {
                            // Helplines section when .all is selected
                            if selectedCategory == .all {
                                VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                                    Text(LocalizedStringKey("essentials_state_helplines_title"))
                                        .font(TypographyTokens.titleSmall)
                                        .fontWeight(.bold)
                                        .foregroundStyle(ColorTokens.terracotta)
                                        .padding(.horizontal, SpacingTokens.space4)

                                    ForEach(helplines) { helpline in
                                        HelplineRow(helpline: helpline) {
                                            pendingCallTarget = (helpline.label, helpline.number)
                                            showCallAlert = true
                                        }
                                        .padding(.horizontal, SpacingTokens.space4)
                                    }
                                }

                                Text(LocalizedStringKey("essentials_nearby_facilities_title"))
                                    .font(TypographyTokens.titleSmall)
                                    .fontWeight(.bold)
                                    .foregroundStyle(ColorTokens.textPrimary)
                                    .padding(.horizontal, SpacingTokens.space4)
                                    .padding(.top, SpacingTokens.space2)
                            }

                            // Civic services list
                            if services.isEmpty && selectedCategory != .all {
                                VStack(spacing: SpacingTokens.space3) {
                                    Image(systemName: "mappin.slash.circle")
                                        .font(.system(size: 36))
                                        .foregroundStyle(ColorTokens.textSecondary)
                                    Text(LocalizedStringKey("essentials_empty_services"))
                                        .font(TypographyTokens.bodySmall)
                                        .foregroundStyle(ColorTokens.textSecondary)
                                        .multilineTextAlignment(.center)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, SpacingTokens.space8)
                                .padding(.horizontal, SpacingTokens.space4)
                            } else {
                                ForEach(services) { service in
                                    CivicServiceRow(service: service) {
                                        if let phone = service.phone, !phone.isEmpty {
                                            pendingCallTarget = (service.name, phone)
                                            showCallAlert = true
                                        }
                                    }
                                    .padding(.horizontal, SpacingTokens.space4)
                                }
                            }
                        }
                    }
                    .padding(.bottom, SpacingTokens.space8)
                }
            }
            .navigationTitle(LocalizedStringKey("essentials_sheet_title"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(LocalizedStringKey("transit_action_close")) {
                        dismiss()
                    }
                    .tint(ColorTokens.terracotta)
                }
            }
            .task {
                loadServices()
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

    private func loadServices() {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let items = try await EssentialsRepository.shared.getNearbyServices(
                    lat: queryLat,
                    lon: queryLon,
                    category: selectedCategory
                )
                await MainActor.run {
                    self.services = items
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = error.localizedDescription
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

private struct HelplineRow: View {
    let helpline: EmergencyHelpline
    let onDial: () -> Void

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: SpacingTokens.space2) {
                    Text(helpline.label)
                        .font(TypographyTokens.bodySmall)
                        .fontWeight(.bold)
                        .foregroundStyle(ColorTokens.textPrimary)

                    if helpline.is24x7 {
                        Text("24x7")
                            .font(.system(size: 10, weight: .bold))
                            .padding(.horizontal, 4)
                            .padding(.vertical, 1)
                            .background(ColorTokens.forestGreen.opacity(0.15))
                            .foregroundStyle(ColorTokens.forestGreen)
                            .clipShape(RoundedRectangle(cornerRadius: 3))
                    }
                }

                Text(helpline.description)
                    .font(TypographyTokens.caption)
                    .foregroundStyle(ColorTokens.textSecondary)
                    .lineLimit(1)
            }

            Spacer()

            Button(action: onDial) {
                HStack(spacing: 4) {
                    Image(systemName: "phone.fill")
                        .font(.system(size: 12))
                    Text(helpline.number)
                        .font(TypographyTokens.caption)
                        .fontWeight(.bold)
                }
                .padding(.horizontal, SpacingTokens.space3)
                .padding(.vertical, SpacingTokens.space2)
                .background(ColorTokens.terracotta)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
        .padding(SpacingTokens.space3)
        .background(ColorTokens.surface)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(ColorTokens.surfaceVariant, lineWidth: 1)
        )
    }
}

private struct CivicServiceRow: View {
    let service: CivicServiceItem
    let onDial: () -> Void

    var body: some View {
        HStack(spacing: SpacingTokens.space3) {
            Image(systemName: service.category.systemIcon)
                .font(.system(size: 20))
                .foregroundStyle(ColorTokens.terracotta)
                .frame(width: 32, height: 32)
                .background(ColorTokens.terracotta.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 6))

            VStack(alignment: .leading, spacing: 2) {
                Text(service.name)
                    .font(TypographyTokens.bodySmall)
                    .fontWeight(.semibold)
                    .foregroundStyle(ColorTokens.textPrimary)
                    .lineLimit(1)

                Text(service.address.isEmpty ? service.category.displayName : service.address)
                    .font(TypographyTokens.caption)
                    .foregroundStyle(ColorTokens.textSecondary)
                    .lineLimit(1)

                if !service.distanceFormatted.isEmpty {
                    Text(service.distanceFormatted)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(ColorTokens.chilikaBlue)
                }
            }

            Spacer()

            if let phone = service.phone, !phone.isEmpty {
                Button(action: onDial) {
                    Image(systemName: "phone.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(ColorTokens.forestGreen)
                }
            }
        }
        .padding(SpacingTokens.space3)
        .background(ColorTokens.surface)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(ColorTokens.surfaceVariant, lineWidth: 1)
        )
    }
}
