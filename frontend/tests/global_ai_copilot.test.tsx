import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateActiveContextLabel,
  generateContextualPrompts,
} from '../src/context/AIContext';
import { FloatingAICopilotTrigger } from '../src/components/ai/FloatingAICopilotTrigger';
import { AISidebar } from '../src/components/ai/AISidebar';
import { ApiClient } from '../src/api/client';
import type { AppContextPayload, GroundedConversationResponse, ConversationTurn } from '../src/api/contracts';

function renderClean(element: React.ReactElement): string {
  return renderToString(element).replace(/<!--.*?-->/g, '');
}

describe('Global Multilingual AI Copilot Context Awareness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // 1. ACTIVE CONTEXT LABEL RESOLUTION
  // ============================================================================
  describe('Active Context Label Generation', () => {
    it('generates correct label for Destination context', () => {
      const destContext: AppContextPayload = {
        page: 'destinations',
        destination: { name: 'Konark Sun Temple', district: 'Puri' },
      };
      expect(generateActiveContextLabel(destContext)).toBe('Viewing: Konark Sun Temple · Puri');
    });

    it('generates correct label for Map Transit mode with selected route', () => {
      const transitContext: AppContextPayload = {
        page: 'map',
        map: { mode: 'transit', selected_route_name: 'Mo Bus Route 10' },
      };
      expect(generateActiveContextLabel(transitContext)).toBe('Map: Mo Bus Route 10');
    });

    it('generates correct label for Map Medical mode', () => {
      const medicalContext: AppContextPayload = {
        page: 'map',
        map: { mode: 'medical' },
      };
      expect(generateActiveContextLabel(medicalContext)).toBe('Map: Medical & Emergency Facilities');
    });

    it('generates correct label for Map ATM mode', () => {
      const atmContext: AppContextPayload = {
        page: 'map',
        map: { mode: 'atms' },
      };
      expect(generateActiveContextLabel(atmContext)).toBe('Map: 24/7 ATMs & Cash Recyclers');
    });

    it('generates correct label for Planner context with days and origin', () => {
      const plannerContext: AppContextPayload = {
        page: 'planner',
        planner: { days: 3, start: 'Puri' },
      };
      expect(generateActiveContextLabel(plannerContext)).toBe('Planner: 3-Day Plan from Puri');
    });

    it('generates correct label for Saved Sanctuaries context', () => {
      const savedContext: AppContextPayload = {
        page: 'saved',
        saved: { saved_count: 4 },
      };
      expect(generateActiveContextLabel(savedContext)).toBe('Saved: 4 Sanctuary Places');
    });

    it('returns null for empty or unspecified context', () => {
      expect(generateActiveContextLabel(null)).toBeNull();
      expect(generateActiveContextLabel({})).toBeNull();
    });
  });

  // ============================================================================
  // 2. DYNAMIC CONTEXTUAL QUICK PROMPTS
  // ============================================================================
  describe('Dynamic Multilingual Contextual Prompts Generation', () => {
    it('generates destination-centric prompts when viewing a place', () => {
      const prompts = generateContextualPrompts({
        page: 'destinations',
        destination: { name: 'Chilika Lake' },
      });
      expect(prompts).toHaveLength(4);
      expect(prompts[0]).toContain('Chilika Lake');
      expect(prompts[1]).toContain('What is nearby Chilika Lake?');
    });

    it('generates medical & emergency prompts in medical map mode', () => {
      const prompts = generateContextualPrompts({
        page: 'map',
        map: { mode: 'medical' },
      });
      expect(prompts.some((p) => p.toLowerCase().includes('hospital'))).toBe(true);
      expect(prompts.some((p) => p.toLowerCase().includes('ambulance') || p.toLowerCase().includes('medical'))).toBe(true);
    });

    it('generates transit & bus schedule prompts in transit mode', () => {
      const prompts = generateContextualPrompts({
        page: 'map',
        map: { mode: 'transit', selected_route_name: 'Route 10' },
      });
      expect(prompts.some((p) => p.includes('Route 10'))).toBe(true);
      expect(prompts.some((p) => p.toLowerCase().includes('bus stop'))).toBe(true);
    });

    it('generates itinerary optimization prompts on planner page', () => {
      const prompts = generateContextualPrompts({
        page: 'planner',
        planner: { days: 2 },
      });
      expect(prompts.some((p) => p.includes('3-day'))).toBe(true);
      expect(prompts.some((p) => p.toLowerCase().includes('itinerary'))).toBe(true);
    });

    it('generates saved places aggregation prompts on saved page', () => {
      const prompts = generateContextualPrompts({
        page: 'saved',
        saved: { saved_count: 3 },
      });
      expect(prompts.some((p) => p.toLowerCase().includes('saved places') || p.toLowerCase().includes('saved destinations'))).toBe(true);
    });
  });

  // ============================================================================
  // 3. FLOATING COPILOT TRIGGER COMPONENT
  // ============================================================================
  describe('FloatingAICopilotTrigger Component', () => {
    it('renders floating AI trigger with high-visibility icon and badge', () => {
      const html = renderClean(<FloatingAICopilotTrigger isOpen={false} onClick={() => {}} />);
      expect(html).toContain('data-testid="floating-ai-copilot-trigger"');
      expect(html).toContain('AI');
      expect(html).toContain('fixed bottom-6 right-6');
    });

    it('hides trigger button when copilot drawer is currently open', () => {
      const html = renderClean(<FloatingAICopilotTrigger isOpen={true} onClick={() => {}} />);
      expect(html).toBe('');
    });
  });

  // ============================================================================
  // 4. AISIDEBAR COMPONENT WITH CONTEXT PILL & MULTILINGUAL SUPPORT
  // ============================================================================
  describe('AISidebar Component', () => {
    it('renders closed state returning null', () => {
      const html = renderClean(
        <AISidebar
          isOpen={false}
          onClose={() => {}}
          isLoading={false}
          history={[]}
        />
      );
      expect(html).toBe('');
    });

    it('renders open drawer with active context chip, language indicator, and quick suggestions', () => {
      const history: ConversationTurn[] = [
        { role: 'user', message: 'What is near Konark?' },
        {
          role: 'assistant',
          message: 'Chandrabhaga Beach and Ramchandi Temple are nearby.',
          is_grounded: true,
          language: 'en',
        },
      ];

      const html = renderClean(
        <AISidebar
          isOpen={true}
          onClose={() => {}}
          isLoading={false}
          history={history}
          activeContextLabel="Viewing: Konark Sun Temple · Puri"
          contextualPrompts={['Plan a trip around Konark Sun Temple', 'How do I get to Konark?']}
          language="en"
        />
      );

      expect(html).toContain('data-testid="ai-travel-sidebar"');
      expect(html).toContain('Travel Copilot');
      expect(html).toContain('Global Multilingual Assistant');
      expect(html).toContain('data-testid="sidebar-active-context-chip"');
      expect(html).toContain('Viewing: Konark Sun Temple · Puri');
      expect(html).toContain('data-testid="sidebar-suggestion-0"');
      expect(html).toContain('Plan a trip around Konark Sun Temple');
      expect(html).toContain('Chandrabhaga Beach and Ramchandi Temple are nearby.');
      expect(html).toContain('data-testid="sidebar-ai-input"');
      expect(html).toContain('data-testid="sidebar-ai-submit"');
    });

    it('renders Odia language badge when language is Odia', () => {
      const html = renderClean(
        <AISidebar
          isOpen={true}
          onClose={() => {}}
          isLoading={false}
          history={[]}
          language="or"
        />
      );
      expect(html).toContain('ଓଡ଼ିଆ');
    });

    it('renders Hindi language badge when language is Hindi', () => {
      const html = renderClean(
        <AISidebar
          isOpen={true}
          onClose={() => {}}
          isLoading={false}
          history={[]}
          language="hi"
        />
      );
      expect(html).toContain('हिन्दी');
    });
  });

  // ============================================================================
  // 5. API CLIENT CONVERSE WITH CONTEXT PAYLOAD CONTRACT
  // ============================================================================
  describe('ApiClient Converse Request with Context', () => {
    it('sends POST /ai/converse with optional context payload', async () => {
      const mockData: GroundedConversationResponse = {
        message: 'Verified Puri response',
        status: 'success',
        language: 'en',
        is_grounded: true,
        places: [],
      };

      const fetchFn = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify(mockData)),
      } as unknown as Response);

      const client = new ApiClient({ baseUrl: 'http://127.0.0.1:8000', fetchFn });

      const response = await client.converseWithAi({
        messages: [{ role: 'user', content: 'What is nearby?' }],
        context: {
          page: 'destinations',
          destination: { name: 'Konark Sun Temple', district: 'Puri' },
        },
      });

      expect(response.status).toBe('success');
      expect(response.is_grounded).toBe(true);
      expect(fetchFn).toHaveBeenCalledTimes(1);

      const requestBody = JSON.parse(fetchFn.mock.calls[0][1]?.body as string);
      expect(requestBody.context).toEqual({
        page: 'destinations',
        destination: { name: 'Konark Sun Temple', district: 'Puri' },
      });
    });
  });

});
