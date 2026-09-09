import Testing
import Foundation
@testable import OTravelz

@Suite("Wave M17 Local Notifications & Transit Reminder Parity Tests")
struct NotificationDomainTests {

    let istTimeZone = TimeZone(identifier: "Asia/Kolkata") ?? TimeZone(secondsFromGMT: 19800)!

    @Test("TransitReminderCalculator calculates accurate 15m trigger in IST")
    func test15mOffsetCalculation() {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = istTimeZone

        var components = DateComponents()
        components.year = 2026
        components.month = 9
        components.day = 9
        components.hour = 8
        components.minute = 0
        components.second = 0

        let referenceDate = calendar.date(from: components)!

        let triggerEpochMs = TransitReminderCalculator.calculateTriggerEpochMs(
            departureTime: "08:30",
            offsetMinutes: 15,
            referenceDate: referenceDate,
            timeZone: istTimeZone
        )

        #expect(triggerEpochMs != nil)

        components.minute = 15 // 08:15 IST
        let expectedDate = calendar.date(from: components)!
        let expectedEpochMs = Int64(expectedDate.timeIntervalSince1970 * 1000)

        #expect(triggerEpochMs == expectedEpochMs)
    }

    @Test("TransitReminderCalculator rejects passed departure")
    func testPastDepartureRejection() {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = istTimeZone

        var components = DateComponents()
        components.year = 2026
        components.month = 9
        components.day = 9
        components.hour = 9
        components.minute = 0

        let referenceDate = calendar.date(from: components)!

        // Attempting to schedule reminder for 08:30 departure at 09:00
        let triggerEpochMs = TransitReminderCalculator.calculateTriggerEpochMs(
            departureTime: "08:30",
            offsetMinutes: 15,
            referenceDate: referenceDate,
            timeZone: istTimeZone
        )

        #expect(triggerEpochMs == nil)
        #expect(TransitReminderCalculator.isDeparturePassed(departureTime: "08:30", referenceDate: referenceDate, timeZone: istTimeZone))
    }

    @Test("Notification copy rules enforce Scheduled departure and forbid live telemetry words")
    func testNotificationCopyTruth() {
        let req = TransitReminderRequest(
            routeId: "mo_bus_10",
            routeNumber: "10",
            origin: "Master Canteen",
            departureTime: "08:30",
            offsetMinutes: 15
        )

        #expect(req.title.contains("Scheduled departure"))
        #expect(req.body.contains("IST"))
        #expect(req.body.contains("check operator before travel"))

        let forbiddenWords = ["arriving", "nearby", "live", "approaching", "real-time", "delay"]
        for word in forbiddenWords {
            #expect(!req.title.lowercased().contains(word))
            #expect(!req.body.lowercased().contains(word))
        }
    }

    @Test("Deterministic notification ID and cancellation")
    func testDeterministicNotificationId() {
        let req1 = TransitReminderRequest(
            routeId: "mo_bus_10",
            routeNumber: "10",
            origin: "Master Canteen",
            departureTime: "08:30",
            offsetMinutes: 15
        )

        let req2 = TransitReminderRequest(
            routeId: "mo_bus_10",
            routeNumber: "10",
            origin: "Master Canteen",
            departureTime: "08:30",
            offsetMinutes: 15
        )

        #expect(req1.notificationId == req2.notificationId)
        #expect(req1.notificationId == "rem_tr_mo_bus_10_0830_15m")
    }

    @Test("InMemoryReminderStore accurately tracks and clears active reminders")
    func testInMemoryReminderStore() {
        let store = InMemoryReminderStore()

        let info = ActiveReminderInfo(
            id: "rem_tr_mo_bus_10_0830_15m",
            routeId: "mo_bus_10",
            departureTime: "08:30",
            offsetMinutes: 15,
            scheduledAtEpochMs: 123456789
        )

        #expect(!store.isReminderActive(routeId: "mo_bus_10", departureTime: "08:30"))

        store.saveReminder(info)
        #expect(store.isReminderActive(routeId: "mo_bus_10", departureTime: "08:30"))
        #expect(store.getAllReminders().count == 1)

        store.removeReminder(routeId: "mo_bus_10", departureTime: "08:30")
        #expect(!store.isReminderActive(routeId: "mo_bus_10", departureTime: "08:30"))
        #expect(store.getAllReminders().isEmpty)
    }

    @Test("Route deep link conforms to canonical URI scheme")
    func testRouteDeepLinkUri() {
        let req = TransitReminderRequest(
            routeId: "mo_bus_10",
            routeNumber: "10",
            origin: "Master Canteen",
            departureTime: "08:30",
            offsetMinutes: 15
        )

        let url = URL(string: req.deepLinkUri)
        #expect(url?.scheme == "otravelz")
        #expect(url?.host == "route")
        #expect(url?.path == "/mo_bus_10")
    }
}
