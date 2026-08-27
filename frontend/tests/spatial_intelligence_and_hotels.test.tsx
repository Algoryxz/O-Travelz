import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { evaluateOpeningStatus, getCurrentISTTime } from '../src/utils/openingHoursUtils';
import { ODISHA_ESSENTIALS } from '../src/data/odishaEssentials';
import { VERIFIED_TRANSIT_TIMETABLES } from '../src/data/transitTimetables';
import { PlaceInfoCard } from '../src/components/place/PlaceInfoCard';
import { TransitStopDetailPanel } from '../src/components/transit/TransitStopDetailPanel';
import { TransitTimetableModal } from '../src/components/transit/TransitTimetableModal';
import { VERIFIED_TRANSIT_STOPS } from '../src/data/staticTransitStops';
import { LocationProvider } from '../src/context/LocationContext';

describe('Spatial Intelligence, Data Quality, Ratings, Hotels & Transit Suite', () => {
  it('correctly calculates IST opening status with strict source validation', () => {
    // 1. 24x7 place is always Open now
    const status24x7 = evaluateOpeningStatus({ is24x7: true });
    expect(status24x7.status).toBe('open');
    expect(status24x7.badgeText).toBe('Open 24/7');
    expect(status24x7.is24x7).toBe(true);

    // 2. Missing hours returns honest 'Hours unavailable' without inference
    const statusMissing = evaluateOpeningStatus({ is24x7: false, openingHours: undefined });
    expect(statusMissing.status).toBe('unknown');
    expect(statusMissing.badgeText).toBe('Hours unavailable');
    expect(statusMissing.is24x7).toBe(false);

    // 3. IST current time returns valid time components
    const ist = getCurrentISTTime();
    expect(ist.hour).toBeGreaterThanOrEqual(0);
    expect(ist.hour).toBeLessThanOrEqual(23);
    expect(ist.minute).toBeGreaterThanOrEqual(0);
    expect(ist.minute).toBeLessThanOrEqual(59);
  });

  it('contains 18 verified Odisha hotels across major hubs with source provenance', () => {
    const hotels = ODISHA_ESSENTIALS.filter((e) => e.category === 'hotel');
    expect(hotels.length).toBeGreaterThanOrEqual(18);

    // Verify key hubs
    const hotelNames = hotels.map((h) => h.name);
    expect(hotelNames).toContain('Mayfair Lagoon');
    expect(hotelNames).toContain('Trident Hotel Bhubaneswar');
    expect(hotelNames).toContain('Mayfair Waves Puri');
    expect(hotelNames).toContain('Lotus Eco Resort Konark');
    expect(hotelNames).toContain('Swosti Chilika Resort');

    // Verify every hotel has verified status and valid coordinates
    for (const h of hotels) {
      expect(h.verified).toBe(true);
      expect(h.lat).toBeGreaterThan(17.0);
      expect(h.lat).toBeLessThan(23.0);
      expect(h.lon).toBeGreaterThan(81.0);
      expect(h.lon).toBeLessThan(88.0);
      expect(h.dataSource).toBeTruthy();
    }
  });

  it('contains official CRUT transit timetables with source attribution', () => {
    const route10 = VERIFIED_TRANSIT_TIMETABLES['10'];
    expect(route10).toBeDefined();
    expect(route10.route_number).toBe('10');
    expect(route10.origin).toBe('Biju Patnaik International Airport (BBI)');
    expect(route10.destination).toBe('Nandankanan Zoological Park');
    expect(route10.departures_weekday.length).toBeGreaterThan(10);
    expect(route10.source_name).toContain('CRUT');

    const route11 = VERIFIED_TRANSIT_TIMETABLES['11'];
    expect(route11).toBeDefined();
    expect(route11.route_number).toBe('11');
  });

  it('renders PlaceInfoCard with sourced ratings and stay nearby recommendations', () => {
    const mockHotel = ODISHA_ESSENTIALS.find((e) => e.category === 'hotel')!;

    const html = renderToString(
      <LocationProvider>
        <PlaceInfoCard
          place={{
            id: mockHotel.id,
            name: mockHotel.name,
            category: 'hotel',
            district: mockHotel.district,
            address: mockHotel.address,
            lat: mockHotel.lat,
            lon: mockHotel.lon,
            rating: mockHotel.rating,
            ratingCount: mockHotel.ratingCount,
            ratingSource: mockHotel.ratingSource,
            openingHours: mockHotel.openingHours,
            amenities: mockHotel.amenities,
            verified: true,
          }}
          onClose={() => {}}
          onNavigate={() => {}}
          onDrawRoute={() => {}}
        />
      </LocationProvider>
    );

    expect(html).toContain(mockHotel.name);
    expect(html).toContain('Route');
    expect(html).toContain('Plan Trip');
  });

  it('renders TransitStopDetailPanel and TransitTimetableModal', () => {
    const mockStop = VERIFIED_TRANSIT_STOPS[0];

    const panelHtml = renderToString(
      <LocationProvider>
        <TransitStopDetailPanel
          stop={mockStop}
          onClose={() => {}}
        />
      </LocationProvider>
    );

    expect(panelHtml).toContain('data-testid="transit-stop-detail-panel"');
    expect(panelHtml).toContain('CRUT Ama Bus Stop');
    expect(panelHtml).toContain('Routes');

    const modalHtml = renderToString(
      <TransitTimetableModal
        routeNumber="10"
        onClose={() => {}}
      />
    );

    expect(modalHtml).toContain('data-testid="transit-timetable-modal"');
    expect(modalHtml).toContain('Nandankanan Zoological Park');
    expect(modalHtml).toContain('CRUT');
  });
});
