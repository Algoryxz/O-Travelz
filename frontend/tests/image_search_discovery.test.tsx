import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ImageIdentifyButton } from '../src/components/discovery/ImageIdentifyButton';
import { ImageIdentifyModal } from '../src/components/discovery/ImageIdentifyModal';
import { LocationProvider } from '../src/context/LocationContext';

describe('Search Bar Image Scan & Visual Landmark Identification', () => {
  it('renders ImageIdentifyButton with camera icon and tooltip', () => {
    const html = renderToString(<ImageIdentifyButton onImageSelected={() => {}} />);

    expect(html).toContain('data-testid="search-bar-image-scan-btn"');
    expect(html).toContain('photo_camera');
    expect(html).toContain('Scan / Upload Image');
  });

  it('renders ImageIdentifyModal with title and dialog attributes', () => {
    const html = renderToString(
      <LocationProvider>
        <ImageIdentifyModal
          isOpen={true}
          onClose={() => {}}
          imageData="data:image/jpeg;base64,sample"
          fileName="konark_sample.jpg"
          onNavigate={() => {}}
        />
      </LocationProvider>
    );

    expect(html).toContain('data-testid="image-identify-modal"');
    expect(html).toContain('Visual Landmark Identification');
  });
});
