import XCTest
@testable import OTravelz

final class RootNavigationTests: XCTestCase {

    func testFrozenRootsCount() {
        XCTAssertEqual(TabDestination.allCases.count, 5, Root destinations must be exactly 5)
    }

    func testFrozenRootsOrder() {
        let expected = [discover, map, plan, trips, you]
        let actual = TabDestination.allCases.map { .rawValue }
        XCTAssertEqual(expected, actual, Tab order must match frozen navigation model)
    }

    func testTabDestinationUniqueIDs() {
        let ids = Set(TabDestination.allCases.map { .id })
        XCTAssertEqual(ids.count, 5, All tab destination IDs must be unique)
    }

    func testTabDestinationSFSymbols() {
        for tab in TabDestination.allCases {
            XCTAssertFalse(tab.systemImage.isEmpty, SF symbol for \(tab.rawValue) must not be empty)
        }
    }
}
