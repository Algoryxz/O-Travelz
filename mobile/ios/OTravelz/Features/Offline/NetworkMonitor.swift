import Foundation
import Network

/// Advisory, presentation-focused network connectivity state.
public enum NetworkState: Sendable, Equatable {
    case online
    case offline
    case unknown
}

/// Lightweight NWPathMonitor wrapper for iOS.
/// Zero polling, zero analytics, zero wake locks.
@MainActor
public final class NetworkMonitor: ObservableObject {
    public static let shared = NetworkMonitor()

    @Published public private(set) var state: NetworkState = .online

    private var monitor: NWPathMonitor?
    private let queue = DispatchQueue(label: "com.otravelz.networkmonitor", qos: .utility)

    public init(monitor: NWPathMonitor? = NWPathMonitor()) {
        self.monitor = monitor
        start()
    }

    private func start() {
        guard let monitor = monitor else {
            self.state = .online
            return
        }

        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor [weak self] in
                guard let self = self else { return }
                if path.status == .satisfied {
                    self.state = .online
                } else {
                    self.state = .offline
                }
            }
        }
        monitor.start(queue: queue)
    }

    deinit {
        monitor?.cancel()
    }

    /// Test seam for unit testing state transitions.
    public func setSimulatedState(_ newState: NetworkState) {
        self.state = newState
    }
}
