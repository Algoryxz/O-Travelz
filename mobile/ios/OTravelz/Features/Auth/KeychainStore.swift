import Foundation
import Security

/// Protocol for secure credential storage on iOS.
/// Tokens are NEVER persisted in UserDefaults or SwiftData.
public protocol KeychainStoreProtocol: Sendable {
    func saveToken(_ token: String) -> Bool
    func getToken() -> String?
    func deleteToken() -> Bool
    func hasToken() -> Bool
}

/// In-memory mock keychain store for testing.
public final class InMemoryKeychainStore: KeychainStoreProtocol, @unchecked Sendable {
    private var storage: String? = nil
    private let lock = NSLock()

    public init() {}

    public func saveToken(_ token: String) -> Bool {
        lock.lock()
        defer { lock.unlock() }
        storage = token
        return true
    }

    public func getToken() -> String? {
        lock.lock()
        defer { lock.unlock() }
        return storage
    }

    public func deleteToken() -> Bool {
        lock.lock()
        defer { lock.unlock() }
        storage = nil
        return true
    }

    public func hasToken() -> Bool {
        lock.lock()
        defer { lock.unlock() }
        return storage != null && storage?.isEmpty == false
    }
}

/// Native Apple Keychain Services store for O-TRAVELZ session credentials.
public final class KeychainStore: KeychainStoreProtocol, @unchecked Sendable {

    public static let shared = KeychainStore()

    private let service: String
    private let account: String

    public init(service: String = "com.otravelz.ios.auth", account: String = "session_token") {
        self.service = service
        self.account = account
    }

    @discardableResult
    public func saveToken(_ token: String) -> Bool {
        guard let data = token.data(using: .utf8) else { return false }

        // Clear existing item first
        deleteToken()

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]

        let status = SecItemAdd(query as CFDictionary, nil)
        return status == errSecSuccess
    }

    public func getToken() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status == errSecSuccess, let data = item as? Data else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }

    @discardableResult
    public func deleteToken() -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]

        let status = SecItemDelete(query as CFDictionary)
        return status == errSecSuccess || status == errSecItemNotFound
    }

    public func hasToken() -> Bool {
        return getToken() != nil
    }
}
