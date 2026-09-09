import Foundation

/// Repository coordinating iOS authentication state, Keychain persistence,
/// session restoration, and single-use ticket exchange.
///
/// Anti-vibe invariants:
/// 1. Signing out NEVER erases SwiftData entities (SavedPlaceItem, SavedTripItem, TripProgressItem).
/// 2. Session tokens are stored strictly in Keychain Services, never logged or stored in UserDefaults.
/// 3. Offline launch continues seamlessly without blocking on remote auth checks.
public final class AuthRepository: @unchecked Sendable {

    public static let shared = AuthRepository()

    private let keychainStore: KeychainStoreProtocol
    private let baseURL: URL

    private var _authState: AuthState = .signedOut
    private let stateLock = NSLock()

    public var authState: AuthState {
        stateLock.lock()
        defer { stateLock.unlock() }
        return _authState
    }

    public init(
        keychainStore: KeychainStoreProtocol = KeychainStore.shared,
        baseURL: URL = URL(string: "http://127.0.0.1:8000")!
    ) {
        self.keychainStore = keychainStore
        self.baseURL = baseURL
    }

    /// Restore session asynchronously on app launch.
    /// Never gates the local app.
    public func restoreSession() async -> AuthState {
        guard let token = keychainStore.getToken(), !token.isEmpty else {
            updateState(.signedOut)
            return .signedOut
        }

        updateState(.authenticating)

        var request = URLRequest(url: baseURL.appendingPathComponent("auth/me"))
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse else {
                updateState(.signedOut)
                return .signedOut
            }

            if httpResponse.statusCode == 200 {
                let meResponse = try JSONDecoder().decode(AuthMeResponseDTO.self, from: data)
                if meResponse.authenticated, let userDto = meResponse.user {
                    let profile = userDto.toDomain()
                    updateState(.signedIn(profile))
                    return .signedIn(profile)
                } else {
                    keychainStore.deleteToken()
                    updateState(.expired)
                    return .expired
                }
            } else if httpResponse.statusCode == 401 || httpResponse.statusCode == 403 {
                keychainStore.deleteToken()
                updateState(.expired)
                return .expired
            } else {
                // Server error / offline: keep app signed out or in grace
                updateState(.signedOut)
                return .signedOut
            }
        } catch {
            // Offline: fail open, do NOT lock local app
            updateState(.signedOut)
            return .signedOut
        }
    }

    /// Exchanges single-use (60s) auth ticket for native session token.
    public func exchangeTicket(_ ticket: String) async throws -> UserProfile {
        guard !ticket.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            updateState(.error("Invalid auth ticket"))
            throw URLError(.badServerResponse)
        }

        updateState(.authenticating)

        var request = URLRequest(url: baseURL.appendingPathComponent("auth/session/exchange"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let payload = AuthTicketExchangeRequestDTO(ticket: ticket.trimmingCharacters(in: .whitespacesAndNewlines))
        request.httpBody = try JSONEncoder().encode(payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            updateState(.error("Ticket verification rejected by server"))
            throw URLError(.userAuthenticationRequired)
        }

        let exchangeResponse = try JSONDecoder().decode(AuthExchangeResponseDTO.self, from: data)
        guard exchangeResponse.authenticated,
              let userDto = exchangeResponse.user,
              let sessionToken = exchangeResponse.sessionToken, !sessionToken.isEmpty else {
            updateState(.error("Incomplete session response"))
            throw URLError(.cannotParseResponse)
        }

        keychainStore.saveToken(sessionToken)
        let profile = userDto.toDomain()
        updateState(.signedIn(profile))
        return profile
    }

    /// Development mock login for testing.
    public func devMockLogin(email: String = "traveler@odisha.in", name: String = "Odisha Traveler") async throws -> UserProfile {
        updateState(.authenticating)

        var request = URLRequest(url: baseURL.appendingPathComponent("auth/dev/mock-login"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload = ["email": email, "name": name]
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            updateState(.error("Dev login unavailable"))
            throw URLError(.badServerResponse)
        }

        let exchangeResponse = try JSONDecoder().decode(AuthExchangeResponseDTO.self, from: data)
        guard exchangeResponse.authenticated,
              let userDto = exchangeResponse.user,
              let sessionToken = exchangeResponse.sessionToken else {
            updateState(.error("Incomplete dev response"))
            throw URLError(.cannotParseResponse)
        }

        keychainStore.saveToken(sessionToken)
        let profile = userDto.toDomain()
        updateState(.signedIn(profile))
        return profile
    }

    /// Sign out: revokes remote session, purges Keychain credentials.
    /// SwiftData local storage remains strictly intact.
    public func logout() async {
        if let token = keychainStore.getToken(), !token.isEmpty {
            var request = URLRequest(url: baseURL.appendingPathComponent("auth/logout"))
            request.httpMethod = "POST"
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            _ = try? await URLSession.shared.data(for: request)
        }

        keychainStore.deleteToken()
        updateState(.signedOut)
    }

    private func updateState(_ state: AuthState) {
        stateLock.lock()
        _authState = state
        stateLock.unlock()
    }
}
