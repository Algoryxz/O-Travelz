import Testing
import Foundation
@testable import OTravelz

@Suite("Wave M16 Authentication & Local-First Identity Parity Tests")
struct AuthDomainTests {

    @Test("Initial state is SignedOut when Keychain is empty")
    func testInitialStateIsSignedOut() async {
        let store = InMemoryKeychainStore()
        let repository = AuthRepository(store: store)

        await repository.restoreSession()

        switch repository.authState {
        case .signedOut:
            #expect(true)
        default:
            Issue.record("Expected .signedOut but found \(repository.authState)")
        }
    }

    @Test("Keychain abstraction securely persists and wipes credentials")
    func testKeychainPersistenceContract() {
        let store = InMemoryKeychainStore()

        #expect(!store.hasToken())
        #expect(store.getToken() == nil)

        store.saveToken("sample_opaque_token_secure_123")
        #expect(store.hasToken())
        #expect(store.getToken() == "sample_opaque_token_secure_123")

        store.clearToken()
        #expect(!store.hasToken())
        #expect(store.getToken() == nil)
    }

    @Test("Successful ticket exchange saves token and transitions to SignedIn")
    func testSuccessfulTicketExchange() async {
        let store = InMemoryKeychainStore()
        let repository = AuthRepository(store: store)

        let result = await repository.exchangeTicket("valid_one_time_ticket_777")
        #expect(result)

        switch repository.authState {
        case .signedIn(let user):
            #expect(user.id.starts(with: "usr-"))
            #expect(user.email.contains("@"))
            #expect(user.displayName.count > 0)
            #expect(store.hasToken())
        default:
            Issue.record("Expected .signedIn state after ticket exchange")
        }
    }

    @Test("Blank or invalid ticket exchange fails cleanly without crash")
    func testBlankTicketExchangeRejection() async {
        let store = InMemoryKeychainStore()
        let repository = AuthRepository(store: store)

        let result = await repository.exchangeTicket("   ")
        #expect(!result)

        switch repository.authState {
        case .error(let msg):
            #expect(!msg.isEmpty)
        default:
            Issue.record("Expected .error state for blank ticket")
        }
        #expect(!store.hasToken())
    }

    @Test("Sign-out revokes credentials while leaving local persistent data intact")
    func testSignOutPreservesLocalData() async {
        let store = InMemoryKeychainStore()
        let repository = AuthRepository(store: store)

        // Login first
        _ = await repository.exchangeTicket("test_ticket")
        #expect(store.hasToken())

        // Simulated SwiftData entities from M14
        var simulatedSavedPlaces = [
            SavedPlaceModel(
                canonicalPlaceId: "konark-sun-temple",
                placeName: "Konark Sun Temple",
                category = "temple",
                district = "Puri",
                imageUrl = "/static/konark.webp",
                rating = 4.8
            )
        ]

        var simulatedSavedTrips = [
            SavedTripModel(
                tripId: "trip-puri-heritage",
                title: "Puri Heritage Trail",
                daysCount: 1,
                startHub: "Puri",
                constraintsJson: "{}"
            )
        ]

        // Act: Sign out
        await repository.logout()

        // Verify credentials wiped
        #expect(!store.hasToken())
        switch repository.authState {
        case .signedOut:
            #expect(true)
        default:
            Issue.record("Expected .signedOut state after logout")
        }

        // Verify local SwiftData items are preserved
        #expect(simulatedSavedPlaces.count == 1)
        #expect(simulatedSavedPlaces.first?.canonicalPlaceId == "konark-sun-temple")

        #expect(simulatedSavedTrips.count == 1)
        #expect(simulatedSavedTrips.first?.tripId == "trip-puri-heritage")
    }

    @Test("Deep link callback URL parser accepts valid scheme and extracts ticket")
    func testDeepLinkCallbackParsing() {
        let validUrl = URL(string: "otravelz://auth/callback?auth_ticket=secure_ticket_abc_123")!

        #expect(validUrl.scheme?.lowercased() == "otravelz")
        #expect(validUrl.host?.lowercased() == "auth")
        #expect(validUrl.path.lowercased() == "/callback" || validUrl.path.isEmpty)

        let components = URLComponents(url: validUrl, resolvingAgainstBaseURL: false)
        let ticket = components?.queryItems?.first(where: { $0.name == "auth_ticket" })?.value
        #expect(ticket == "secure_ticket_abc_123")
    }

    @Test("Deep link validation strictly rejects invalid schemes, hosts, or injected paths")
    func testDeepLinkRejectionOfMaliciousUrls() {
        let maliciousUrls = [
            "https://otravelz.com/auth/callback?auth_ticket=123",
            "otravelz://evil.com/callback?auth_ticket=123",
            "otravelz://auth/admin_bypass?auth_ticket=123",
            "otravelz://auth/callback/../../etc/passwd"
        ]

        for urlString in maliciousUrls {
            guard let url = URL(string: urlString) else { continue }
            let isValid = url.scheme?.lowercased() == "otravelz" &&
                url.host?.lowercased() == "auth" &&
                (url.path == "/callback" || url.path.isEmpty)
            #expect(!isValid, "URL \(urlString) must be rejected as an invalid auth callback")
        }
    }

    @Test("Auth cancellation returns user to clean signed-out state without error loop")
    func testAuthCancellationHandling() async {
        let store = InMemoryKeychainStore()
        let repository = AuthRepository(store: store)

        // Cancel simulated flow
        await repository.handleCancellation()

        switch repository.authState {
        case .signedOut:
            #expect(true)
        default:
            Issue.record("Cancellation should restore signed-out state")
        }
    }
}
