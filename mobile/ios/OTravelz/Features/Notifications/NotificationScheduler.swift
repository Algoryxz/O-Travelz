import Foundation
import UserNotifications

/// Native iOS notification scheduler for scheduled transit departure countdown alerts.
/// Utilizes UserNotifications framework without third-party push dependencies.
public final class NotificationScheduler: @unchecked Sendable {

    private let center: UNUserNotificationCenter
    private let reminderStore: ReminderStoreProtocol

    public init(
        center: UNUserNotificationCenter = .current(),
        reminderStore: ReminderStoreProtocol = UserDefaultsReminderStore()
    ) {
        self.center = center
        self.reminderStore = reminderStore
    }

    /// Requests user authorization contextually upon tapping "Remind me".
    public func requestAuthorization() async -> Bool {
        do {
            let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
            return granted
        } catch {
            return false
        }
    }

    /// Checks whether notification permission is currently granted.
    public func isAuthorized() async -> Bool {
        let settings = await center.notificationSettings()
        return settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional
    }

    /// Schedules a local transit departure reminder.
    public func scheduleReminder(request: TransitReminderRequest) async -> ReminderScheduleResult {
        // Calculate trigger timestamp in IST
        guard let triggerEpochMs = TransitReminderCalculator.calculateTriggerEpochMs(
            departureTime: request.departureTime,
            offsetMinutes: request.offsetMinutes
        ) else {
            return .passedDeparture
        }

        let isGranted = await requestAuthorization()
        guard isGranted else {
            return .permissionDenied
        }

        let triggerDate = Date(timeIntervalSince1970: TimeInterval(triggerEpochMs) / 1000.0)
        let timeInterval = triggerDate.timeIntervalSinceNow

        guard timeInterval > 0 else {
            return .passedDeparture
        }

        let content = UNMutableNotificationContent()
        content.title = request.title
        content.body = request.body
        content.sound = .default
        content.userInfo = [
            "deepLink": request.deepLinkUri,
            "routeId": request.routeId,
            "departureTime": request.departureTime,
            "truthClass": "SCHEDULED"
        ]

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: false)
        let unRequest = UNNotificationRequest(
            identifier: request.notificationId,
            content: content,
            trigger: trigger
        )

        do {
            try await center.add(unRequest)

            let info = ActiveReminderInfo(
                id: request.notificationId,
                routeId: request.routeId,
                departureTime: request.departureTime,
                offsetMinutes: request.offsetMinutes,
                scheduledAtEpochMs: triggerEpochMs
            )
            reminderStore.saveReminder(info)

            return .success(
                notificationId: request.notificationId,
                scheduledEpochMs: triggerEpochMs,
                message: "Reminder scheduled \(request.offsetMinutes)m before departure"
            )
        } catch {
            return .error("Failed to add notification request: \(error.localizedDescription)")
        }
    }

    /// Cancels a scheduled departure reminder.
    public func cancelReminder(routeId: String, departureTime: String) {
        if let existing = reminderStore.getActiveReminder(routeId: routeId, departureTime: departureTime) {
            center.removePendingNotificationRequests(withIdentifiers: [existing.id])
            reminderStore.removeReminder(routeId: routeId, departureTime: departureTime)
        }
    }

    public func isReminderActive(routeId: String, departureTime: String) -> Bool {
        return reminderStore.isReminderActive(routeId: routeId, departureTime: departureTime)
    }

    public func getActiveReminder(routeId: String, departureTime: String) -> ActiveReminderInfo? {
        return reminderStore.getActiveReminder(routeId: routeId, departureTime: departureTime)
    }

    public func getAllReminders() -> [ActiveReminderInfo] {
        return reminderStore.getAllReminders()
    }
}
