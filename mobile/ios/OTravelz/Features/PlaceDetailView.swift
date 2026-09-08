import SwiftUI
import SwiftData

/// Editorial Place Detail Screen for iOS.
/// Implements full cultural atlas inspection with authentic photography,
/// sourced practical facts, live weather with fallback, and provenance tracking.
/// Never presents unverified claims or fake opening hours.
struct PlaceDetailView: View {
    let placeId: String
    var initialPlace: DiscoverPlace? = nil
    var onBack: (() -> Void)? = nil

    @Environment(\.modelContext) private var modelContext
    @Query private var savedPlaces: [SavedPlaceModel]

    @State private var detail: PlaceDetail? = nil
    @State private var weather: WeatherResponseDTO? = nil
    @State private var isLoading = true
    @State private var isWeatherLoading = false
    @State private var errorMessage: String? = nil

    private let apiClient = APIClient()

    private var isSaved: Bool {
        savedPlaces.contains(where: { $0.canonicalPlaceId == placeId })
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: SpacingTokens.space6) {
                if isLoading && detail == nil {
                    VStack(spacing: SpacingTokens.space4) {
                        ProgressView()
                            .tint(ColorTokens.terracotta)
                        Text(LocalizedStringKey("state_loading"))
                            .font(TypographyTokens.bodyMedium)
                            .foregroundStyle(ColorTokens.textSecondary)
                    }
                    .frame(maxWidth: .infinity, minHeight: 300)
                } else if let error = errorMessage, detail == nil {
                    VStack(spacing: SpacingTokens.space4) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 36))
                            .foregroundStyle(ColorTokens.terracotta)

                        Text(error)
                            .font(TypographyTokens.bodyMedium)
                            .foregroundStyle(ColorTokens.textSecondary)
                            .multilineTextAlignment(.center)

                        Button(action: { loadDetail() }) {
                            Text(LocalizedStringKey("action_retry"))
                                .font(TypographyTokens.labelLarge)
                                .foregroundStyle(.white)
                                .padding(.horizontal, SpacingTokens.space6)
                                .padding(.vertical, SpacingTokens.space3)
                                .background(ColorTokens.terracotta)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                    }
                    .frame(maxWidth: .infinity, minHeight: 300)
                    .padding(SpacingTokens.space6)
                } else if let place = detail ?? initialPlace.map({ PlaceDomainMapper.toPlaceDetail(PlaceDTO(id: $0.id, researchId: nil, name: $0.name, category: $0.category, description: nil, lat: nil, lon: nil, district: $0.district, region: $0.region, avgVisitMinutes: nil, priceTier: nil, rating: $0.rating, ratingCount: $0.ratingCount, interests: nil, source: nil, sourceUrl: nil, verificationStatus: nil, contactPhone: nil, emergencyPhone: nil, address: nil, images: nil, localizedNames: LocalizedNamesDTO(en: $0.name, or: $0.odiaName, hi: $0.hindiName))) }) {
                    VStack(alignment: .leading, spacing: SpacingTokens.space5) {
                        // Title & Cultural Header (Always visible immediately at top)
                        headerSection(place: place)

                        // Hero Media
                        heroSection(place: place)

                        // Location Action: External Map Navigation Handoff (Phase 26)
                        if place.hasCoordinates {
                            mapActionButton(place: place)
                        }

                        // Live Weather Card
                        weatherSection(place: place)

                        // Description
                        if let desc = place.descriptionText, !desc.isEmpty {
                            VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                                Text(LocalizedStringKey("section_about"))
                                    .font(TypographyTokens.titleMedium)
                                    .foregroundStyle(ColorTokens.textPrimary)

                                Text(desc)
                                    .font(TypographyTokens.bodyLarge)
                                    .foregroundStyle(ColorTokens.textSecondary)
                                    .lineSpacing(4)
                            }
                        }

                        // Verified Photos Gallery (Rendered only when distinct photos > 1)
                        if place.hasMultiplePhotos {
                            photoGallerySection(place: place)
                        }

                        // Practical Information
                        practicalInfoSection(place: place)

                        // Provenance & Source Metadata
                        provenanceSection(place: place)
                    }
                    .padding(.horizontal, SpacingTokens.space5)
                    .padding(.top, SpacingTokens.space4)
                    .padding(.bottom, SpacingTokens.space8)
                }
            }
        }
        .background(ColorTokens.canvas.ignoresSafeArea())
        .navigationTitle(detail?.name ?? initialPlace?.name ?? "")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if let place = detail ?? initialPlace.map({ PlaceDomainMapper.toPlaceDetail(PlaceDTO(id: $0.id, researchId: nil, name: $0.name, category: $0.category, description: nil, lat: nil, lon: nil, district: $0.district, region: $0.region, avgVisitMinutes: nil, priceTier: nil, rating: $0.rating, ratingCount: $0.ratingCount, interests: nil, source: nil, sourceUrl: nil, verificationStatus: nil, contactPhone: nil, emergencyPhone: nil, address: nil, images: nil, localizedNames: LocalizedNamesDTO(en: $0.name, or: $0.odiaName, hi: $0.hindiName))) }) {
                ToolbarItem(placement: .topBarTrailing) {
                    HStack(spacing: SpacingTokens.space3) {
                        Button(action: {
                            toggleSave(place: place)
                        }) {
                            Image(systemName: isSaved ? "bookmark.fill" : "bookmark")
                                .foregroundStyle(ColorTokens.terracotta)
                        }

                        ShareLink(
                            item: "\(place.name)\(place.district.map { ", \($0)" } ?? "") — Odisha Cultural Atlas"
                        ) {
                            Image(systemName: "square.and.arrow.up")
                                .foregroundStyle(ColorTokens.terracotta)
                        }
                    }
                }
            }
        }
        .task {
            loadDetail()
        }
    }

    // MARK: - Subviews

    @ViewBuilder
    private func heroSection(place: PlaceDetail) -> some View {
        if let photo = place.primaryPhoto {
            ZStack(alignment: .bottomLeading) {
                AsyncImage(url: URL(string: photo.url)) { phase in
                    switch phase {
                    case .empty:
                        Rectangle()
                            .fill(ColorTokens.sandstoneLight)
                            .overlay { ProgressView().tint(ColorTokens.terracotta) }
                    case .success(let img):
                        img
                            .resizable()
                            .aspectRatio(16 / 10, contentMode: .fill)
                            .clipped()
                    case .failure:
                        fallbackHero(place: place)
                    @unknown default:
                        fallbackHero(place: place)
                    }
                }
                .frame(maxWidth: .infinity)
                .clipShape(RoundedRectangle(cornerRadius: 12))

                // Verification Badge
                HStack(spacing: SpacingTokens.space1) {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 12))
                    Text(LocalizedStringKey("badge_verified"))
                        .font(TypographyTokens.labelSmall)
                }
                .padding(.horizontal, SpacingTokens.space3)
                .padding(.vertical, SpacingTokens.space1)
                .background(ColorTokens.truthVerified.opacity(0.9))
                .foregroundStyle(.white)
                .clipShape(Capsule())
                .padding(SpacingTokens.space4)
            }
        } else {
            fallbackHero(place: place)
                .frame(maxWidth: .infinity)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    @ViewBuilder
    private func mapActionButton(place: PlaceDetail) -> some View {
        if let lat = place.lat, let lon = place.lon {
            Button(action: {
                let nameEncoded = place.name.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
                let urlString = "maps://?q=\(nameEncoded)&ll=\(lat),\(lon)"
                if let url = URL(string: urlString), UIApplication.shared.canOpenURL(url) {
                    UIApplication.shared.open(url)
                } else if let webUrl = URL(string: "https://maps.apple.com/?q=\(lat),\(lon)") {
                    UIApplication.shared.open(webUrl)
                }
            }) {
                HStack(spacing: SpacingTokens.space2) {
                    Image(systemName: "mappin.and.ellipse")
                    Text(LocalizedStringKey("action_open_in_maps"))
                }
                .font(TypographyTokens.labelLarge)
                .foregroundStyle(ColorTokens.terracotta)
                .frame(maxWidth: .infinity, minHeight: 44)
                .background(ColorTokens.canvas)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(ColorTokens.terracotta, lineWidth: 1)
                )
            }
        }
    }

    private func fallbackHero(place: PlaceDetail) -> some View {
        ZStack {
            ColorTokens.sandstoneLight

            VStack(spacing: SpacingTokens.space2) {
                if let odia = place.odiaName, !odia.isEmpty {
                    Text(odia)
                        .font(.system(size: 28, weight: .bold, design: .serif))
                        .foregroundStyle(ColorTokens.terracotta.opacity(0.85))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, SpacingTokens.space4)
                }

                Text(LocalizedStringKey("badge_photo_pending"))
                    .font(TypographyTokens.labelMedium)
                    .foregroundStyle(ColorTokens.textPrimary)

                Text(LocalizedStringKey("photo_pending_desc"))
                    .font(TypographyTokens.bodySmall)
                    .foregroundStyle(ColorTokens.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, SpacingTokens.space4)
            }
            .padding(SpacingTokens.space6)
        }
    }

    @ViewBuilder
    private func headerSection(place: PlaceDetail) -> some View {
        VStack(alignment: .leading, spacing: SpacingTokens.space2) {
            // Badges
            HStack(spacing: SpacingTokens.space2) {
                Text(place.category.replacingOccurrences(of: "_", with: " ").capitalized)
                    .font(TypographyTokens.labelSmall)
                    .padding(.horizontal, SpacingTokens.space2)
                    .padding(.vertical, SpacingTokens.space1)
                    .background(ColorTokens.terracotta.opacity(0.12))
                    .foregroundStyle(ColorTokens.terracotta)
                    .clipShape(RoundedRectangle(cornerRadius: 4))

                if let district = place.district, !district.isEmpty {
                    Text(district.capitalized)
                        .font(TypographyTokens.labelSmall)
                        .padding(.horizontal, SpacingTokens.space2)
                        .padding(.vertical, SpacingTokens.space1)
                        .background(ColorTokens.textSecondary.opacity(0.08))
                        .foregroundStyle(ColorTokens.textSecondary)
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                }

                if let region = place.region, !region.isEmpty {
                    Text(region)
                        .font(TypographyTokens.labelSmall)
                        .foregroundStyle(ColorTokens.textSecondary)
                }
            }

            // Names
            Text(place.name)
                .font(TypographyTokens.headlineLarge)
                .foregroundStyle(ColorTokens.textPrimary)

            if let odia = place.odiaName, !odia.isEmpty {
                Text(odia)
                    .font(TypographyTokens.titleLarge)
                    .foregroundStyle(ColorTokens.chilika)
            }
        }
    }

    @ViewBuilder
    private func weatherSection(place: PlaceDetail) -> some View {
        VStack(alignment: .leading, spacing: SpacingTokens.space2) {
            Text(LocalizedStringKey("section_weather"))
                .font(TypographyTokens.titleMedium)
                .foregroundStyle(ColorTokens.textPrimary)

            if let w = weather {
                HStack(spacing: SpacingTokens.space4) {
                    Image(systemName: "sun.max.fill")
                        .font(.system(size: 28))
                        .foregroundStyle(ColorTokens.terracotta)

                    VStack(alignment: .leading, spacing: 2) {
                        HStack {
                            Text(String(format: "%.1f°C", w.temperatureC))
                                .font(TypographyTokens.titleLarge)
                                .foregroundStyle(ColorTokens.textPrimary)

                            Text("• \(w.condition)")
                                .font(TypographyTokens.bodyMedium)
                                .foregroundStyle(ColorTokens.textSecondary)
                        }

                        HStack(spacing: SpacingTokens.space3) {
                            Text("Humidity: \(w.humidityPct)%")
                                .font(TypographyTokens.caption)
                                .foregroundStyle(ColorTokens.textSecondary)
                            Text("Wind: \(String(format: "%.1f", w.windSpeedKmh)) km/h")
                                .font(TypographyTokens.caption)
                                .foregroundStyle(ColorTokens.textSecondary)
                        }
                    }
                    Spacer()
                }
                .padding(SpacingTokens.space4)
                .background(ColorTokens.canvas)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(ColorTokens.textSecondary.opacity(0.15), lineWidth: 1)
                )
            } else if isWeatherLoading {
                HStack(spacing: SpacingTokens.space3) {
                    ProgressView().tint(ColorTokens.terracotta)
                    Text(LocalizedStringKey("weather_loading"))
                        .font(TypographyTokens.bodyMedium)
                        .foregroundStyle(ColorTokens.textSecondary)
                }
                .padding(SpacingTokens.space4)
            } else {
                HStack(spacing: SpacingTokens.space2) {
                    Image(systemName: "cloud.slash")
                        .foregroundStyle(ColorTokens.truthUnavailable)
                    Text(LocalizedStringKey("weather_unavailable"))
                        .font(TypographyTokens.bodyMedium)
                        .foregroundStyle(ColorTokens.truthUnavailable)
                }
                .padding(SpacingTokens.space4)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(ColorTokens.canvas)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(ColorTokens.truthUnavailable.opacity(0.2), lineWidth: 1)
                )
            }
        }
    }

    @ViewBuilder
    private func practicalInfoSection(place: PlaceDetail) -> some View {
        VStack(alignment: .leading, spacing: SpacingTokens.space3) {
            Text(LocalizedStringKey("section_practical"))
                .font(TypographyTokens.titleMedium)
                .foregroundStyle(ColorTokens.textPrimary)

            VStack(spacing: SpacingTokens.space3) {
                if let minutes = place.avgVisitMinutes, minutes > 0 {
                    infoRow(icon: "clock", label: "label_visit_duration", value: "\(minutes) minutes")
                }

                if let price = place.priceTier, !price.isEmpty {
                    infoRow(icon: "tag", label: "label_price_tier", value: price.capitalized)
                }

                if let phone = place.contactPhone, !phone.isEmpty {
                    infoRow(icon: "phone", label: "label_contact", value: phone)
                }

                if let emergency = place.emergencyPhone, !emergency.isEmpty {
                    infoRow(icon: "cross.case", label: "label_emergency", value: emergency)
                }

                if let address = place.address, !address.isEmpty {
                    infoRow(icon: "mappin.and.ellipse", label: "label_address", value: address)
                }
            }
            .padding(SpacingTokens.space4)
            .background(ColorTokens.canvas)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(ColorTokens.textSecondary.opacity(0.15), lineWidth: 1)
            )
        }
    }

    private func infoRow(icon: String, label: String, value: String) -> some View {
        HStack(alignment: .top, spacing: SpacingTokens.space3) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundStyle(ColorTokens.terracotta)
                .frame(width: 20)

            Text(LocalizedStringKey(label))
                .font(TypographyTokens.labelSmall)
                .foregroundStyle(ColorTokens.textSecondary)
                .frame(width: 100, alignment: .leading)

            Text(value)
                .font(TypographyTokens.bodyMedium)
                .foregroundStyle(ColorTokens.textPrimary)

            Spacer()
        }
    }

    @ViewBuilder
    private func photoGallerySection(place: PlaceDetail) -> some View {
        if !place.photos.isEmpty {
            VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                HStack {
                    Text(LocalizedStringKey("section_gallery"))
                        .font(TypographyTokens.titleMedium)
                        .foregroundStyle(ColorTokens.textPrimary)

                    Spacer()

                    Text("\(place.photos.count) \(place.photos.count == 1 ? "Photo" : "Photos")")
                        .font(TypographyTokens.labelSmall)
                        .foregroundStyle(ColorTokens.textSecondary)
                }

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: SpacingTokens.space3) {
                        ForEach(place.photos) { photo in
                            VStack(alignment: .leading, spacing: SpacingTokens.space1) {
                                AsyncImage(url: URL(string: photo.thumbnailUrl ?? photo.url)) { phase in
                                    switch phase {
                                    case .empty:
                                        Rectangle().fill(ColorTokens.sandstoneLight)
                                    case .success(let img):
                                        img.resizable().aspectRatio(1, contentMode: .fill).clipped()
                                    case .failure:
                                        Rectangle().fill(ColorTokens.sandstoneLight)
                                    @unknown default:
                                        Rectangle().fill(ColorTokens.sandstoneLight)
                                    }
                                }
                                .frame(width: 120, height: 120)
                                .clipShape(RoundedRectangle(cornerRadius: 8))

                                if let attribution = photo.attribution ?? photo.sourceName {
                                    Text(attribution)
                                        .font(.system(size: 10))
                                        .foregroundStyle(ColorTokens.textSecondary)
                                        .lineLimit(1)
                                        .frame(width: 120, alignment: .leading)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func provenanceSection(place: PlaceDetail) -> some View {
        VStack(alignment: .leading, spacing: SpacingTokens.space2) {
            Text(LocalizedStringKey("section_provenance"))
                .font(TypographyTokens.titleMedium)
                .foregroundStyle(ColorTokens.textPrimary)

            VStack(alignment: .leading, spacing: SpacingTokens.space2) {
                if let src = place.source, !src.isEmpty {
                    HStack(spacing: SpacingTokens.space2) {
                        Text("Source:")
                            .font(TypographyTokens.labelSmall)
                            .foregroundStyle(ColorTokens.textSecondary)
                        Text(src)
                            .font(TypographyTokens.bodyMedium)
                            .foregroundStyle(ColorTokens.textPrimary)
                    }
                }

                if let rid = place.researchId, !rid.isEmpty {
                    HStack(spacing: SpacingTokens.space2) {
                        Text("Research ID:")
                            .font(TypographyTokens.labelSmall)
                            .foregroundStyle(ColorTokens.textSecondary)
                        Text(rid)
                            .font(TypographyTokens.bodyMedium)
                            .foregroundStyle(ColorTokens.textPrimary)
                    }
                }

                if let status = place.verificationStatus, !status.isEmpty {
                    HStack(spacing: SpacingTokens.space2) {
                        Text("Status:")
                            .font(TypographyTokens.labelSmall)
                            .foregroundStyle(ColorTokens.textSecondary)
                        Text(status.capitalized)
                            .font(TypographyTokens.bodyMedium)
                            .foregroundStyle(status.lowercased() == "verified" ? ColorTokens.truthVerified : ColorTokens.truthCandidate)
                    }
                }
            }
            .padding(SpacingTokens.space4)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(ColorTokens.canvas)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(ColorTokens.textSecondary.opacity(0.15), lineWidth: 1)
            )
        }
    }

    // MARK: - Networking

    private func loadDetail() {
        isLoading = true
        errorMessage = nil

        Task {
            do {
                let dto = try await apiClient.getPlaceDetail(id: placeId)
                let mapped = PlaceDomainMapper.toPlaceDetail(dto)
                await MainActor.run {
                    self.detail = mapped
                    self.isLoading = false
                }

                // Load weather if coordinates are truthful
                if let lat = mapped.lat, let lon = mapped.lon {
                    await MainActor.run { isWeatherLoading = true }
                    do {
                        let w = try await apiClient.getWeatherCurrent(lat: lat, lon: lon)
                        await MainActor.run {
                            self.weather = w
                            self.isWeatherLoading = false
                        }
                    } catch {
                        await MainActor.run {
                            self.weather = nil
                            self.isWeatherLoading = false
                        }
                    }
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                    self.isLoading = false
                }
            }
        }
    }

    private func toggleSave(place: PlaceDetail) {
        if let existing = savedPlaces.first(where: { $0.canonicalPlaceId == place.id }) {
            modelContext.delete(existing)
        } else {
            let newSave = SavedPlaceModel(
                canonicalPlaceId: place.id,
                savedAt: Date(),
                placeName: place.name,
                category: place.category,
                district: place.district,
                imageUrl: place.heroImageUrl,
                rating: place.rating
            )
            modelContext.insert(newSave)
        }
        try? modelContext.save()
    }
}
