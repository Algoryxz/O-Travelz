import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ImageIdentifyModal } from '../src/components/discovery/ImageIdentifyModal';
import { LocationProvider } from '../src/context/LocationContext';
import type { ImageIdentifyResponse } from '../src/types/api';

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, '');
}

describe('Multimodal Landmark Identification UI (Checkpoint 5A)', () => {
  it('renders ImageIdentifyModal with dialog attributes and image preview', () => {
    const html = renderClean(
      <LocationProvider>
        <ImageIdentifyModal
          isOpen={true}
          onClose={() => {}}
          imageData="data:image/jpeg;base64,sample_preview_data"
          fileName="sample.jpg"
          onNavigate={() => {}}
        />
      </LocationProvider>
    );

    expect(html).toContain('data-testid="image-identify-modal"');
    expect(html).toContain('Visual Landmark Identification');
  });

  it('renders closed modal as null when isOpen is false', () => {
    const html = renderClean(
      <LocationProvider>
        <ImageIdentifyModal
          isOpen={false}
          onClose={() => {}}
          imageData="data:image/jpeg;base64,sample"
          fileName="sample.jpg"
          onNavigate={() => {}}
        />
      </LocationProvider>
    );

    expect(html).toBe('');
  });
});
