import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { getLocationImage, getLocationImageUrl, CANONICAL_HUB_IMAGES } from '../src/utils/imageService';
import { CurrentLocationInfographic } from '../src/components/location/CurrentLocationInfographic';

describe('Current Location Infographic & Spatial Hub Image Resolution', () => {
  it('resolves authentic verified images for all 11 canonical Odisha hubs', () => {
    const hubs = [
      { key: 'bhubaneswar', name: 'Bhubaneswar (Capital)', expectedKeyword: 'Lingaraj' },
      { key: 'puri', name: 'Puri (Jagannath & Coast)', expectedKeyword: 'Jagannath' },
      { key: 'konark', name: 'Konark (Sun Temple)', expectedKeyword: 'Konark' },
      { key: 'cuttack', name: 'Cuttack (Silver City)', expectedKeyword: 'Barabati' },
      { key: 'chilika', name: 'Chilika (Satapada Lagoon)', expectedKeyword: 'Chilika' },
      { key: 'sambalpur', name: 'Sambalpur (Hirakud)', expectedKeyword: 'Sambalpur' },
      { key: 'rourkela', name: 'Rourkela (Steel City)', expectedKeyword: 'Rourkela' },
      { key: 'keonjhar', name: 'Keonjhar (Waterfalls)', expectedKeyword: 'Keonjhar' },
      { key: 'berhampur', name: 'Berhampur (Silk City)', expectedKeyword: 'Gopalpur' },
      { key: 'koraput', name: 'Koraput (Deomali Peaks)', expectedKeyword: 'Deomali' },
      { key: 'daringbadi', name: 'Daringbadi (Coffee Valleys)', expectedKeyword: 'Daringbadi' },
    ];

    for (const hub of hubs) {
      const img = getLocationImage(hub.name, hub.key);
      expect(img).toBeDefined();
      expect(img.src).toBeTruthy();
      expect(img.isFallback).toBe(false);
      expect(img.alt.length).toBeGreaterThan(5);

      const url = getLocationImageUrl(hub.name, hub.key);
      expect(url).toBeTruthy();
      expect(url).toBe(img.src);
    }
  });

  it('ensures distinct images are used for distinct locations without contamination', () => {
    const bbsrUrl = getLocationImageUrl('Bhubaneswar (Capital)', 'Bhubaneswar');
    const puriUrl = getLocationImageUrl('Puri (Jagannath & Coast)', 'Puri');
    const cuttackUrl = getLocationImageUrl('Cuttack (Silver City)', 'Cuttack');
    const sambalpurUrl = getLocationImageUrl('Sambalpur (Hirakud)', 'Sambalpur');
    const daringbadiUrl = getLocationImageUrl('Daringbadi (Coffee Valleys)', 'Daringbadi');
    const koraputUrl = getLocationImageUrl('Koraput (Deomali Peaks)', 'Koraput');

    expect(bbsrUrl).not.toBe(puriUrl);
    expect(puriUrl).not.toBe(cuttackUrl);
    expect(cuttackUrl).not.toBe(sambalpurUrl);
    expect(sambalpurUrl).not.toBe(daringbadiUrl);
    expect(daringbadiUrl).not.toBe(koraputUrl);
  });

  it('renders CurrentLocationInfographic with live status and correct attributes', () => {
    const htmlBbsr = renderToString(
      <CurrentLocationInfographic
        locationName="Master Canteen · Bhubaneswar"
        city="Bhubaneswar"
        district="Khordha"
        lat={20.2667}
        lon={85.8436}
        isLive={true}
        locationType="LIVE_GPS"
      />
    );

    expect(htmlBbsr).toContain('data-testid="current-location-infographic"');
    expect(htmlBbsr).toContain('data-testid="current-location-infographic-image"');
    expect(htmlBbsr).toContain('Live GPS Location');
    expect(htmlBbsr).toContain('Khordha');
    expect(htmlBbsr).toContain('Master Canteen · Bhubaneswar');
    expect(htmlBbsr).toContain(CANONICAL_HUB_IMAGES.bhubaneswar.imageUrl.slice(0, 30));

    // Dynamic rendering for Puri
    const htmlPuri = renderToString(
      <CurrentLocationInfographic
        locationName="Puri (Jagannath & Coast)"
        city="Puri"
        district="Puri"
        lat={19.8135}
        lon={85.8312}
        isLive={false}
        locationType="MANUAL_LOCATION"
      />
    );

    expect(htmlPuri).toContain('Selected Hub');
    expect(htmlPuri).toContain('Puri (Jagannath &amp; Coast)');
    expect(htmlPuri).toContain(CANONICAL_HUB_IMAGES.puri.imageUrl.slice(0, 30));
  });

  it('handles unknown location with graceful default without breaking layout', () => {
    const htmlUnknown = renderToString(
      <CurrentLocationInfographic
        locationName="Unknown Village"
        city="Unknown"
        isLive={false}
      />
    );

    expect(htmlUnknown).toContain('data-testid="current-location-infographic"');
    expect(htmlUnknown).toContain('data-testid="current-location-infographic-image"');
    expect(htmlUnknown).toContain('Unknown Village');
  });
});
