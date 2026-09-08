import SwiftUI

/// Root TabView hosting the 5 frozen navigation tabs.
/// Native Apple HIG publication system shell.
struct RootTabView: View {
    @State private var selectedTab: TabDestination = .discover

    var body: some View {
        TabView(selection: $selectedTab) {
            ForEach(TabDestination.allCases) { tab in
                NavigationStack {
                    BootstrapPlaceholderView(destination: tab)
                        .navigationTitle(tab.titleKey)
                }
                .tabItem {
                    Label(tab.titleKey, systemImage: tab.systemImage)
                }
                .tag(tab)
            }
        }
        .tint(ColorTokens.terracotta)
    }
}