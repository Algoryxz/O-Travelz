import SwiftUI

/// Root navigation shell hosting the 5 frozen navigation tabs.
/// Implements adaptive chrome:
/// - Compact width (iPhone portrait / split): Standard TabView with bottom bar.
/// - Regular width (iPad full screen / regular landscape): NavigationSplitView with sidebar.
/// Maintains independent NavigationStack per root destination.
struct RootTabView: View {
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @State private var selectedTab: TabDestination = .discover

    var body: some View {
        if horizontalSizeClass == .regular {
            // Adaptive regular width: NavigationSplitView sidebar navigation
            NavigationSplitView {
                List(TabDestination.allCases, selection: ) { tab in
                    NavigationLink(value: tab) {
                        Label(tab.titleKey, systemImage: tab.systemImage)
                    }
                }
                .navigationTitle(LocalizedStringKey(app_name))
                .listStyle(.sidebar)
            } detail: {
                RootDetailHost(tab: selectedTab)
            }
            .tint(ColorTokens.terracotta)
        } else {
            // Adaptive compact width: Standard TabView bottom navigation
            TabView(selection: ) {
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

                PlanRootView()
                    .tabItem {
                        Label(TabDestination.plan.titleKey, systemImage: TabDestination.plan.systemImage)
                    }
                    .tag(TabDestination.plan)

                TripsRootView()
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
}

/// Host for displaying the selected root destination in split detail
private struct RootDetailHost: View {
    let tab: TabDestination

    var body: some View {
        switch tab {
        case .discover:
            DiscoverRootView()
        case .map:
            MapRootView()
        case .plan:
            PlanRootView()
        case .trips:
            TripsRootView()
        case .you:
            YouRootView()
        }
    }
}
