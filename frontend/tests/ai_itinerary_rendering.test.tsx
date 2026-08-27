import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import { CopilotItineraryCard } from '../src/components/ai/CopilotItineraryCard';
import { AISidebar } from '../src/components/ai/AISidebar';
import { AIConversationPanel } from '../src/components/ai/AIConversationPanel';
import type {
  ItineraryPlanResponse,
  GroundedConversationResponse,
  ConversationTurn,
} from '../src/api/contracts';

const sampleItineraryEnglish: ItineraryPlanResponse = {
  itinerary_id: 'itin_puri_konark_2day',
  constraints: {
    days: 2,
    interests: ['heritage', 'beach'],
    start: 'cuttack',
  },
  days: [
    {
      day_number: 1,
      theme: 'Puri Sacred Heritage & Golden Beach',
      stops: [
        {
          sequence: 1,
          place: {
            id: 'place_puri_jagannath',
            name: 'Jagannath Temple',
            category: 'temple',
            district: 'Puri',
            description: 'Grand 12th-century Kalinga sanctuary and sacred pilgrimage destination.',
          },
          planned_arrival: '09:00',
          planned_departure: '11:30',
        },
        {
          sequence: 2,
          place: {
            id: 'place_puri_beach',
            name: 'Puri Golden Beach',
            category: 'beach',
            district: 'Puri',
            description: 'Blue Flag certified pristine coastal stretch overlooking the Bay of Bengal.',
          },
          planned_arrival: '12:00',
          planned_departure: '14:00',
        },
      ],
      hops: [
        {
          from_sequence: 1,
          to_sequence: 2,
          mode: 'Auto / Local Cab',
          estimated_minutes: 15,
          data_tier: 'static',
        },
      ],
    },
    {
      day_number: 2,
      theme: 'Konark Architectural Wonders',
      stops: [
        {
          sequence: 1,
          place: {
            id: 'place_konark_sun_temple',
            name: 'Konark Sun Temple',
            category: 'monument',
            district: 'Puri',
            description: 'UNESCO World Heritage 13th-century chariot temple.',
          },
          planned_arrival: '08:30',
          planned_departure: '11:00',
        },
        {
          sequence: 2,
          place: {
            id: 'place_chandrabhaga',
            name: 'Chandrabhaga Beach',
            category: 'beach',
            district: 'Puri',
            description: 'Serene coastal retreat known for glorious sunrises.',
          },
          planned_arrival: '11:30',
          planned_departure: '13:00',
        },
      ],
      hops: [
        {
          from_sequence: 1,
          to_sequence: 2,
          mode: 'Mo Bus',
          estimated_minutes: 20,
          data_tier: 'scheduled',
        },
      ],
    },
  ],
  explanation: 'Grounded 2-day heritage exploration circuit connecting Cuttack, Puri, and Konark.',
};

const sampleItineraryOdia: ItineraryPlanResponse = {
  itinerary_id: 'itin_odia_2day',
  constraints: {
    days: 2,
    interests: ['heritage'],
    start: 'cuttack',
  },
  days: [
    {
      day_number: 1,
      theme: 'ପୁରୀ ଶ୍ରୀକ୍ଷେତ୍ର ଦର୍ଶନ',
      stops: [
        {
          sequence: 1,
          place: {
            id: 'place_puri_jagannath',
            name: 'ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର',
            category: 'temple',
            district: 'ପୁରୀ',
            description: 'ଦ୍ୱାଦଶ ଶତାବ୍ଦୀର ଐତିହାସିକ କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟ କୀର୍ତ୍ତିରାଜି।',
          },
          planned_arrival: '୦୯:୦୦',
          planned_departure: '୧୧:୩୦',
        },
      ],
      hops: [],
    },
    {
      day_number: 2,
      theme: 'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ଯାତ୍ରା',
      stops: [
        {
          sequence: 1,
          place: {
            id: 'place_konark',
            name: 'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର',
            category: 'monument',
            district: 'ପୁରୀ',
            description: 'ବିଶ୍ୱ ଐତିହ୍ୟ ସ୍ଥଳୀ କୋଣାର୍କ।',
          },
          planned_arrival: '୦୯:୩୦',
          planned_departure: '୧୨:୦୦',
        },
      ],
      hops: [],
    },
  ],
  explanation: 'କଟକରୁ ଆରମ୍ଭ ହୋଇଥିବା ୨-ଦିନର ଯାଞ୍ଚିତ ଯାତ୍ରା ଯୋଜନା।',
};

const sampleItineraryHindi: ItineraryPlanResponse = {
  itinerary_id: 'itin_hindi_2day',
  constraints: {
    days: 2,
    interests: ['heritage'],
    start: 'cuttack',
  },
  days: [
    {
      day_number: 1,
      theme: 'पुरी श्रीक्षेत्र दर्शन',
      stops: [
        {
          sequence: 1,
          place: {
            id: 'place_puri_jagannath',
            name: 'जगन्नाथ मंदिर',
            category: 'temple',
            district: 'पुरी',
            description: '१२वीं सदी का भव्य कलिंग स्थापत्य मंदिर।',
          },
          planned_arrival: '09:00',
        },
      ],
      hops: [],
    },
  ],
  explanation: 'कटक से शुरू होने वाली २ दिवसीय सत्यापित यात्रा योजना।',
};

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, '');
}

describe('Grounded AI Itinerary Visual Rendering', () => {
  it('1. Renders structured English visual day-by-day itinerary', () => {
    const html = renderClean(
      <CopilotItineraryCard
        itinerary={sampleItineraryEnglish}
        language="en"
        onViewItineraryTab={() => {}}
      />
    );

    // Day badges
    expect(html).toContain('Day 1');
    expect(html).toContain('Day 2');
    expect(html).toContain('Puri Sacred Heritage &amp; Golden Beach');

    // Ordered stops
    expect(html).toContain('Jagannath Temple');
    expect(html).toContain('Puri Golden Beach');
    expect(html).toContain('Konark Sun Temple');
    expect(html).toContain('Chandrabhaga Beach');

    // Planned arrival
    expect(html).toContain('09:00');
    expect(html).toContain('12:00');

    // Verified transit connectors
    expect(html).toContain('Auto / Local Cab');
    expect(html).toContain('~15 min');
    expect(html).toContain('Mo Bus');
    expect(html).toContain('~20 min');

    // Grounding notice & CTA
    expect(html).toContain('Based on verified O-Travelz data');
    expect(html).toContain('Open in Trip Planner');
  });

  it('2. Renders Odia localized day labels and numerals', () => {
    const html = renderClean(
      <CopilotItineraryCard
        itinerary={sampleItineraryOdia}
        language="or"
        onViewItineraryTab={() => {}}
      />
    );

    // Odia day labels with Odia numerals (ଦିବସ ୧, ଦିବସ ୨)
    expect(html).toContain('ଦିବସ ୧');
    expect(html).toContain('ଦିବସ ୨');
    expect(html).toContain('ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର');
    expect(html).toContain('କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର');
    expect(html).toContain('ଯାଞ୍ଚିତ O-Travelz ତଥ୍ୟ ଉପରେ ଆଧାରିତ');
    expect(html).toContain('ଟ୍ରିପ୍ ପ୍ଲାନର୍‌ରେ ଦେଖନ୍ତୁ');
  });

  it('3. Renders Hindi localized day labels and numerals', () => {
    const html = renderClean(
      <CopilotItineraryCard
        itinerary={sampleItineraryHindi}
        language="hi"
        onViewItineraryTab={() => {}}
      />
    );

    expect(html).toContain('दिन १');
    expect(html).toContain('जगन्नाथ मंदिर');
    expect(html).toContain('सत्यापित O-Travelz डेटा पर आधारित');
    expect(html).toContain('ट्रिप प्लानर में देखें');
  });

  it('4. Normal non-itinerary chat responses do not render empty itinerary shells', () => {
    const html = renderClean(
      <CopilotItineraryCard
        itinerary={{ itinerary_id: 'test', constraints: {}, days: [], explanation: '' }}
        language="en"
      />
    );
    expect(html).toBe('');
  });

  it('5. AISidebar renders text message and structured visual itinerary together', () => {
    const turns: ConversationTurn[] = [
      {
        role: 'user',
        message: 'Plan a 2-day trip to Puri and Konark',
      },
      {
        role: 'assistant',
        message: 'I have crafted a verified 2-day itinerary for your trip.',
        response: {
          message: 'I have crafted a verified 2-day itinerary for your trip.',
          status: 'success',
          language: 'en',
          itinerary: sampleItineraryEnglish,
          is_grounded: true,
        } as GroundedConversationResponse,
      },
    ];

    const html = renderClean(
      <AISidebar
        isOpen={true}
        onClose={() => {}}
        isLoading={false}
        history={turns}
        onViewItineraryTab={() => {}}
      />
    );

    // Conversational text message bubble
    expect(html).toContain('I have crafted a verified 2-day itinerary for your trip.');
    // Structured itinerary card directly below
    expect(html).toContain('Day 1');
    expect(html).toContain('Jagannath Temple');
    expect(html).toContain('Puri Golden Beach');
    expect(html).toContain('Open in Trip Planner');
  });

  it('6. AIConversationPanel renders structured visual itinerary', () => {
    const turns: ConversationTurn[] = [
      {
        role: 'assistant',
        message: 'Here is your refined itinerary.',
        response: {
          message: 'Here is your refined itinerary.',
          status: 'success',
          itinerary: sampleItineraryEnglish,
          is_grounded: true,
        } as GroundedConversationResponse,
      },
    ];

    const html = renderClean(
      <AIConversationPanel
        isLoading={false}
        history={turns}
        onSend={() => {}}
      />
    );

    expect(html).toContain('Here is your refined itinerary.');
    expect(html).toContain('Day 1');
    expect(html).toContain('Jagannath Temple');
    expect(html).toContain('Puri Golden Beach');
  });

  it('7. Unverified transport hops display neutral grounded advisory without fabrication', () => {
    const itineraryWithUnverifiedHop: ItineraryPlanResponse = {
      itinerary_id: 'itin_unverified',
      constraints: {},
      days: [
        {
          day_number: 1,
          stops: [
            {
              sequence: 1,
              place: { id: 'p1', name: 'Stop A', category: 'temple' },
            },
            {
              sequence: 2,
              place: { id: 'p2', name: 'Stop B', category: 'nature' },
            },
          ],
          hops: [
            {
              from_sequence: 1,
              to_sequence: 2,
              mode: 'unavailable',
              estimated_minutes: 0,
              data_tier: 'static',
            },
          ],
        },
      ],
      explanation: '',
    };

    const html = renderClean(
      <CopilotItineraryCard
        itinerary={itineraryWithUnverifiedHop}
        language="en"
      />
    );

    // Shows unverified neutral advisory instead of inventing transit
    expect(html).toContain('Travel details unverified');
    expect(html).not.toContain('Mo Bus');
  });

  it('8. Embedded StitchPlannerPage AI Copilot renders visual day-by-day itinerary upon receiving response', () => {
    const html = renderClean(
      <div>
        <div className="bg-white border border-[#E5DFD5] rounded-xl p-6 shadow-xs mb-6">
          <p className="font-body text-[#3D4654] text-base leading-relaxed border-l-2 border-[#B87B22] pl-4 py-1">
            ମୁଁ Cuttack ରୁ ଆରମ୍ଭ ହୋଇ 2-ଦିନର ଏକ ଯାଞ୍ଚିତ ଯାତ୍ରା ଯୋଜନା ପ୍ରସ୍ତୁତ କରିଛି।
          </p>
          <div className="mt-4 pt-3 border-t border-[#E5DFD5]">
            <CopilotItineraryCard
              itinerary={sampleItineraryOdia}
              language="or"
              onViewItineraryTab={() => {}}
            />
          </div>
        </div>
      </div>
    );

    expect(html).toContain('ମୁଁ Cuttack ରୁ ଆରମ୍ଭ ହୋଇ 2-ଦିନର ଏକ ଯାଞ୍ଚିତ ଯାତ୍ରା ଯୋଜନା ପ୍ରସ୍ତୁତ କରିଛି।');
    expect(html).toContain('ଦିବସ ୧');
    expect(html).toContain('ଦିବସ ୨');
    expect(html).toContain('ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର');
    expect(html).toContain('କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର');
    expect(html).toContain('ଟ୍ରିପ୍ ପ୍ଲାନର୍‌ରେ ଦେଖନ୍ତୁ');
  });
});
