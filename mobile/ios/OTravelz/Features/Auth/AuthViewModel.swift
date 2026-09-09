import Foundation
import SwiftUI
#if canImport(AuthenticationServices)
import AuthenticationServices
#endif

/// Presentation model managing authentication state, deep link resolution,
/// and OAuth session orchestration for O-TRAVELZ on iOS.
///
/// Anti-vibe invariants:
/// 1. Deep link validation strictly verifies scheme ("otravelz"), host ("auth"), and path ("/callback").
/// 2. Local-first persistence in SwiftData is never wiped or gated on sign-out.
@MainActor
@Observable
public final class AuthViewModel: NSObject {

    public var authState: AuthState = .signedOut
    public var errorMessage: String? = nil

    private let repository: AuthRepository

    public init(repository: AuthRepository = AuthRepository.shared) {
        self.repository = repository
        super.init()
        self.authState = repository.authState
        Task {
            await restoreSession()
        }
    }

    /// Asynchronous launch session restoration.
    public func restoreSession() async {
        let restored = await repository.restoreSession()
        self.authState = restored
    }

    /// Validate and process deep-link callback (e.g. otravelz://auth/callback?auth_ticket=...)
    @discardableResult
    public func handleAuthCallback(url: URL) -> Bool {
        guard let scheme = url.scheme?.lowercased(), scheme == "otravelz",
              let host = url.host?.lowercased(), host == "auth",
              url.path.isEmpty || url.path == "/callback" else {
            return false
        }

        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            return false
        }

        if let error = components.queryItems?.first(where: { $0.name == "auth_error" })?.value {
            self.errorMessage = "Sign-in cancelled or failed: \(error)"
            self.authState = .signedOut
            return true
        }

        if let ticket = components.queryItems?.first(where: { $0.name == "auth_ticket" })?.value, !ticket.isEmpty {
            self.authState = .authenticating
            Task {
                do {
                    _ = try await repository.exchangeTicket(ticket)
                    self.authState = repository.authState
                    self.errorMessage = nil
                } catch {
                    self.authState = .error("Failed to exchange auth ticket")
                    self.errorMessage = error.localizedDescription
                }
            }
            return true
        }

        return false
    }

    /// Initiate system browser / ASWebAuthenticationSession OAuth.
    public func initiateSignIn() {
        guard let authURL = URL(string: "http://127.0.0.1:8000/auth/google/start?redirect_uri=otravelz://auth/callback") else { return }

        #if canImport(AuthenticationServices)
        let session = ASWebAuthenticationSession(
            url: authURL,
            callbackURLScheme: "otravelz"
        ) { [weak self] callbackURL, error in
            guard let self = self else { return }
            if let callbackURL = callbackURL {
                Task { @MainActor in
                    self.handleAuthCallback(url: callbackURL)
                }
            } else if let error = error {
                Task { @MainActor in
                    if (error as NSError).code != ASWebAuthenticationSessionError.canceledLogin.rawValue {
                        self.errorMessage = "Authentication failed: \(error.localizedDescription)"
                    }
                    self.authState = .signedOut
                }
            }
        }
        session.presentationContextProvider = self
        session.prefersEphemeralWebBrowserSession = false
        session.start()
        #endif
    }

    /// Sign out: revokes credentials, keeps SwiftData completely intact.
    public func signOut() {
        Task {
            await repository.logout()
            self.authState = .signedOut
            self.errorMessage = nil
        }
    }

    /// Mock sign-in for testing in non-production environments.
    public func devSignIn() {
        Task {
            do {
                _ = try await repository.devMockLogin()
                self.authState = repository.authState
                self.errorMessage = nil
            } catch {
                self.authState = .error("Dev sign-in failed")
                self.errorMessage = error.localizedDescription
            }
        }
    }
}

#if canImport(AuthenticationServices)
extension AuthViewModel: ASWebAuthenticationPresentationContextProviding {
    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        #if canImport(UIKit)
        return UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow } ?? ASPresentationAnchor()
        #else
        return ASPresentationAnchor()
        #endif
    }
}
#endif
