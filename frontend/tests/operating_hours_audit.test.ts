import { describe, expect, it } from "vitest";
import {
  getPlaceOperatingHours,
  getPlaceRatingMetadata,
  VERIFIED_PLACE_SCHEDULES,
} from "../src/utils/operatingHoursService";

describe("Live Data Audit: Place-Specific Operating Hours & Real Ratings", () => {
  it("1. Verifies Monday closure rule for Odisha museums, planetarium, and zoological parks", () => {
    // Construct a Monday at 12:00 PM (e.g., 2026-08-24 is a Monday)
    const mondayNoon = new Date("2026-08-24T12:00:00");
    expect(mondayNoon.getDay()).toBe(1); // 1 = Monday

    const museumStatus = getPlaceOperatingHours("Odisha State Museum", "museum", mondayNoon);
    expect(museumStatus.isOpen).toBe(false);
    expect(museumStatus.status).toContain("Closed Today (Monday)");

    const tribalMuseumStatus = getPlaceOperatingHours("Museum of Tribal Arts and Artifacts", "museum", mondayNoon);
    expect(tribalMuseumStatus.isOpen).toBe(false);
    expect(tribalMuseumStatus.status).toContain("Closed Today (Monday)");

    const planetariumStatus = getPlaceOperatingHours("Pathani Samanta Planetarium", "planetarium", mondayNoon);
    expect(planetariumStatus.isOpen).toBe(false);
    expect(planetariumStatus.status).toContain("Closed Today (Monday)");

    const zooStatus = getPlaceOperatingHours("Nandankanan Zoological Park", "wildlife", mondayNoon);
    expect(zooStatus.isOpen).toBe(false);
    expect(zooStatus.status).toContain("Closed Today (Monday)");

    // On Tuesday at 12:00 PM (2026-08-25), they should be open
    const tuesdayNoon = new Date("2026-08-25T12:00:00");
    const museumTuesday = getPlaceOperatingHours("Odisha State Museum", "museum", tuesdayNoon);
    expect(museumTuesday.isOpen).toBe(true);
    expect(museumTuesday.status).toContain("Open Now · Closes 17:00");
  });

  it("2. Verifies morning and evening darshan shifts for historic temples", () => {
    // Tuesday 08:00 AM (during morning darshan)
    const morningTime = new Date("2026-08-25T08:00:00");
    const lingarajMorning = getPlaceOperatingHours("Lingaraj Temple", "spirituality", morningTime);
    expect(lingarajMorning.isOpen).toBe(true);
    expect(lingarajMorning.status).toContain("Open Now · Closes 12:30");

    // Tuesday 14:00 (during afternoon Pahada break)
    const afternoonBreak = new Date("2026-08-25T14:00:00");
    const lingarajAfternoon = getPlaceOperatingHours("Lingaraj Temple", "spirituality", afternoonBreak);
    expect(lingarajAfternoon.isOpen).toBe(false);
    expect(lingarajAfternoon.status).toContain("Afternoon Break · Reopens 15:30");

    // Tuesday 18:00 (during evening darshan)
    const eveningTime = new Date("2026-08-25T18:00:00");
    const lingarajEvening = getPlaceOperatingHours("Lingaraj Temple", "spirituality", eveningTime);
    expect(lingarajEvening.isOpen).toBe(true);
    expect(lingarajEvening.status).toContain("Open Now · Closes 21:30");
  });

  it("3. Verifies 24/7 places are consistently open day and night", () => {
    const midnight = new Date("2026-08-25T00:30:00");
    const beachStatus = getPlaceOperatingHours("Puri Golden Beach", "beach", midnight);
    expect(beachStatus.isOpen).toBe(true);
    expect(beachStatus.status).toBe("Open 24 Hours");

    const erStatus = getPlaceOperatingHours("AIIMS Bhubaneswar", "hospital", midnight);
    expect(erStatus.isOpen).toBe(true);
    expect(erStatus.status).toBe("Open 24 Hours");
  });

  it("4. Verifies honest fallback for places without verified schedule", () => {
    const randomPlace = getPlaceOperatingHours("Some Unregistered Local Shop", "shopping");
    expect(randomPlace.isOpen).toBeNull();
    expect(randomPlace.status).toBe("Hours unavailable · Check locally");
  });

  it("5. Verifies place ratings are not fabricated when no backend authority exists", () => {
    const konarkMeta = getPlaceRatingMetadata("Konark Sun Temple");
    expect(konarkMeta.rating).toBeNull();
    expect(konarkMeta.reviewCount).toBeNull();

    const jagannathMeta = getPlaceRatingMetadata("Shree Jagannath Temple, Puri");
    expect(jagannathMeta.rating).toBeNull();
    expect(jagannathMeta.reviewCount).toBeNull();
  });
});
