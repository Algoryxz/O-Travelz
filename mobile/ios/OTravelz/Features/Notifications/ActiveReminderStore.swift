import Foundation

public protocol ReminderStoreProtocol: Sendable {
    func saveReminder(_ info: ActiveReminderInfo)
    func removeReminder(routeId: String, departureTime: String)
    func removeReminderById(_ notificationId: String)
    func isReminderActive(routeId: String, departureTime: String) -> Bool
    func getActiveReminder(routeId: String, departureTime: String) -> ActiveReminderInfo?
    func getAllReminders() -> [ActiveReminderInfo]
}

/// Lightweight UserDefaults-backed active reminder store for iOS.
/// Synchronously tracks active departure reminders to power immediate UI toggle state.
public final class UserDefaultsReminderStore: ReminderStoreProtocol, @unchecked Sendable {

    private let userDefaults: UserDefaults
    private let keyPrefix = "otravelz_rem_"
    private let lock = NSLock()

    public init(userDefaults: UserDefaults = .standard) {
        self.userDefaults = userDefaults
    }

    public func saveReminder(_ info: ActiveReminderInfo) {
        lock.lock()
        defer { lock.unlock() }
        let key = makeKey(routeId: info.routeId, departureTime: info.departureTime)
        if let encoded = try? JSONEncoder().encode(info) {
            userDefaults.set(encoded, forKey: key)
        }
    }

    public func removeReminder(routeId: String, departureTime: String) {
        lock.lock()
        defer { lock.unlock() }
        let key = makeKey(routeId: routeId, departureTime: departureTime)
        userDefaults.removeObject(forKey: key)
    }

    public func removeReminderById(_ notificationId: String) {
        lock.lock()
        defer { lock.unlock() }
        for reminder in getAllReminders() {
            if reminder.id == notificationId {
                let key = makeKey(routeId: reminder.routeId, departureTime: reminder.departureTime)
                userDefaults.removeObject(forKey: key)
            }
        }
    }

    public func isReminderActive(routeId: String, departureTime: String) -> Bool {
        lock.lock()
        defer { lock.unlock() }
        let key = makeKey(routeId: routeId, departureTime: departureTime)
        return userDefaults.object(forKey: key) != nil
    }

    public func getActiveReminder(routeId: String, departureTime: String) -> ActiveReminderInfo? {
        lock.lock()
        defer { lock.unlock() }
        let key = makeKey(routeId: routeId, departureTime: departureTime)
        guard let data = userDefaults.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(ActiveReminderInfo.self, from: data)
    }

    public func getAllReminders() -> [ActiveReminderInfo] {
        lock.lock()
        defer { lock.unlock() }
        var list: [ActiveReminderInfo] = []
        let allKeys = userDefaults.dictionaryRepresentation().keys
        for key in allKeys where key.hasPrefix(keyPrefix) {
            if let data = userDefaults.data(forKey: key),
               let item = try? JSONDecoder().decode(ActiveReminderInfo.self, from: data) {
                list.append(item)
            }
        }
        return list
    }

    private func makeKey(routeId: String, departureTime: String) -> String {
        let cleanTime = departureTime.replacingOccurrences(of: ":", with: "")
        return "\(keyPrefix)\(routeId)_\(cleanTime)"
    }
}

/// Fast in-memory implementation for testing without touching persistent UserDefaults.
public final class InMemoryReminderStore: ReminderStoreProtocol, @unchecked Sendable {
    private var memory: [String: ActiveReminderInfo] = [:]
    private let lock = NSLock()

    public init() {}

    public func saveReminder(_ info: ActiveReminderInfo) {
        lock.lock()
        defer { lock.unlock() }
        memory["\(info.routeId)_\(info.departureTime)"] = info
    }

    public func removeReminder(routeId: String, departureTime: String) {
        lock.lock()
        defer { lock.unlock() }
        memory.removeValue(forKey: "\(routeId)_\(departureTime)")
    }

    public func removeReminderById(_ notificationId: String) {
        lock.lock()
        defer { lock.unlock() }
        memory = memory.filter { $0.value.id != notificationId }
    }

    public func isReminderActive(routeId: String, departureTime: String) -> Bool {
        lock.lock()
        defer { lock.unlock() }
        return memory["\(routeId)_\(departureTime)"] != nil
    }

    public func getActiveReminder(routeId: String, departureTime: String) -> ActiveReminderInfo? {
        lock.lock()
        defer { lock.unlock() }
        return memory["\(routeId)_\(departureTime)"]
    }

    public func getAllReminders() -> [ActiveReminderInfo] {
        lock.lock()
        defer { lock.unlock() }
        return Array(memory.values)
    }
}
