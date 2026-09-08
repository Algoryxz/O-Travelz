import XCTest
@testable import OTravelz

final class OTravelzTests: XCTestCase {
    func testFrozenRootDestinationsCount() {
        XCTAssertEqual(TabDestination.allCases.count, 5, "Root destinations must be exactly 5")
    }

    func testFrozenRootDestinationsOrder() {
        let expected = ["discover", "map", "plan", "trips", "you"]
        let actual = TabDestination.allCases.map { $0.rawValue }
        XCTAssertEqual(actual, expected, "Root tabs must match frozen IA")
    }

    func testBrandColorValues() {
        XCTAssertNotNil(ColorTokens.terracotta)
        XCTAssertNotNil(ColorTokens.chilika)
        XCTAssertNotNil(ColorTokens.forest)
    }
}