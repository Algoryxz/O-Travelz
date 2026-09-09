import SwiftUI

/// Root navigation shell hosting the 5 frozen navigation tabs.
/// Implements adaptive chrome:
/// - Compact width (iPhone portrait / split): Standard TabView with bottom bar.
/// - Regular width (iPad full screen / regular landscape): NavigationSplitView with sidebar.
/// Maintains independent NavigationStack per root destination.
struct RootTabView: View {
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @ObservedObject private var networkMonitor = NetworkMonitor.shared
    @State private var selectedTab: TabDestination = .discover

    var body: some View {
        Group {
            if horizontalSizeClass == .regular {
                // Adaptive regular width: NavigationSplitView sidebar navigation
                NavigationSplitView {
                    List(TabDestination.allCases, selection: $selectedTab) { tab in
                        NavigationLink(value: tab) {
                            Label(tab.titleKey, systemImage: tab.systemImage)
                        }
                    }
                    .navigationTitle(LocalizedStringKey("app_name"))
                    .listStyle(.sidebar)
                } detail: {
                    RootDetailHost(tab: selectedTab, onNavigateToTab: { selectedTab = $0 })
                }
                .tint(ColorTokens.terracotta)
            } else {
                // Adaptive compact width: Standard TabView bottom navigation
                TabView(selection: $selectedTab) {
                    DiscoverRootView()
                        .tabItem {
                            Label(TabDestination.discover.titleKey, systemImage: TabDestination.discover.systemImage)
                        }
                        .tag(TabDestination.discover)

                    MapRootView()
                        .tabItem {
                            Label(TabDestination.map.titleKey, systemImage: TabDestination.map.systemImage)
                        }
                        .tag(TabDestination.map)

                    PlanRootView(onTripStarted: { selectedTab = .trips })
                        .tabItem {
                            Label(TabDestination.plan.titleKey, systemImage: TabDestination.plan.systemImage)
                        }
                        .tag(TabDestination.plan)

                    TripsRootView(
                        onNavigateToPlan: { selectedTab = .plan },
                        onNavigateToDiscover: { selectedTab = .discover }
                    )
                    .tabItem {
                        Label(TabDestination.trips.titleKey, systemImage: TabDestination.trips.systemImage)
                    }
                    .tag(TabDestination.trips)

                    YouRootView()
                        .tabItem {
                            Label(TabDestination.you.titleKey, systemImage: TabDestination.you.systemImage)
                        }
                        .tag(TabDestination.you)
                }
                .tint(ColorTokens.terracotta)
            }
        }
        .safeAreaInset(edge: .top) {
            if networkMonitor.state == .offline {
                OfflineBannerView()
            }
        }
    }
}

/// Host for displaying the selected root destination in split detail
private struct RootDetailHost: View {
    let tab: TabDestination
    let onNavigateToTab: (TabDestination) -> Void

    var body: some View {
        switch tab {
        case .discover:
            DiscoverRootView()
        case .map:
            MapRootView()
        case .plan:
            PlanRootView(onTripStarted: { onNavigateToTab(.trips) })
        case .trips:
            TripsRootView(
                onNavigateToPlan: { onNavigateToTab(.plan) },
                onNavigateToDiscover: { onNavigateToTab(.discover) }
            )
        case .you:
            YouRootView()
        }
    }
}
