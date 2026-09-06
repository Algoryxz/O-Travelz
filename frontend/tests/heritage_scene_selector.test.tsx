// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, act, cleanup } from '@testing-library/react';
import { HeritageSceneViewer } from '../src/components/heritage/HeritageSceneViewer';
import { Heritage3DSection } from '../src/components/home/Heritage3DSection';
import { FALLBACK_HERITAGE_SCENES } from '../src/api/heritageApi';

vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three');
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      setPixelRatio: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      toneMapping: 0,
      toneMappingExposure: 1,
      shadowMap: { enabled: false, type: 0 },
    })),
  };
});

describe('Heritage Scene Selector & Monument Synchronization Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('1. Initial selector value equals Konark scene ID', () => {
    const onSelectScene = vi.fn();
    render(
      <HeritageSceneViewer
        scene={FALLBACK_HERITAGE_SCENES[0]}
        availableScenes={FALLBACK_HERITAGE_SCENES}
        onSelectScene={onSelectScene}
      />
    );

    const selector = screen.getByTestId('heritage-monument-selector') as HTMLSelectElement;
    expect(selector).toBeDefined();
    expect(selector.value).toBe('konark-sun-temple');
  });

  it('2. Selecting Puri Jagannath invokes onSelectScene with puri-jagannath-temple', () => {
    const onSelectScene = vi.fn();
    render(
      <HeritageSceneViewer
        scene={FALLBACK_HERITAGE_SCENES[0]}
        availableScenes={FALLBACK_HERITAGE_SCENES}
        onSelectScene={onSelectScene}
      />
    );

    const selector = screen.getByTestId('heritage-monument-selector') as HTMLSelectElement;
    fireEvent.change(selector, { target: { value: 'puri-jagannath-temple' } });
    expect(onSelectScene).toHaveBeenCalledWith('puri-jagannath-temple');
  });

  it('3. Selecting Lingaraj invokes onSelectScene with lingaraj-temple', () => {
    const onSelectScene = vi.fn();
    render(
      <HeritageSceneViewer
        scene={FALLBACK_HERITAGE_SCENES[0]}
        availableScenes={FALLBACK_HERITAGE_SCENES}
        onSelectScene={onSelectScene}
      />
    );

    const selector = screen.getByTestId('heritage-monument-selector') as HTMLSelectElement;
    fireEvent.change(selector, { target: { value: 'lingaraj-temple' } });
    expect(onSelectScene).toHaveBeenCalledWith('lingaraj-temple');
  });

  it('4. Selecting Brahmeswar invokes onSelectScene with brahmeswara-temple', () => {
    const onSelectScene = vi.fn();
    render(
      <HeritageSceneViewer
        scene={FALLBACK_HERITAGE_SCENES[0]}
        availableScenes={FALLBACK_HERITAGE_SCENES}
        onSelectScene={onSelectScene}
      />
    );

    const selector = screen.getByTestId('heritage-monument-selector') as HTMLSelectElement;
    fireEvent.change(selector, { target: { value: 'brahmeswara-temple' } });
    expect(onSelectScene).toHaveBeenCalledWith('brahmeswara-temple');
  });

  it('5. Switching back to Konark works', () => {
    const onSelectScene = vi.fn();
    render(
      <HeritageSceneViewer
        scene={FALLBACK_HERITAGE_SCENES[3]}
        availableScenes={FALLBACK_HERITAGE_SCENES}
        onSelectScene={onSelectScene}
      />
    );

    const selector = screen.getByTestId('heritage-monument-selector') as HTMLSelectElement;
    expect(selector.value).toBe('brahmeswara-temple');
    fireEvent.change(selector, { target: { value: 'konark-sun-temple' } });
    expect(onSelectScene).toHaveBeenCalledWith('konark-sun-temple');
  });

  it('6. Top tabs and dropdown remain synchronized through unified parent state in Heritage3DSection', async () => {
    render(<Heritage3DSection />);

    // Wait for suspense/lazy load
    const selector = await screen.findByTestId('heritage-monument-selector') as HTMLSelectElement;
    expect(selector.value).toBe('konark-sun-temple');

    // Click top tab chip for Puri Jagannath Temple
    const puriTab = screen.getByRole('button', { name: /Puri Jagannath Temple/i });
    fireEvent.click(puriTab);

    // Selector updates to Puri Jagannath Temple
    expect(selector.value).toBe('puri-jagannath-temple');

    // Now change dropdown to Lingaraj Temple
    fireEvent.change(selector, { target: { value: 'lingaraj-temple' } });

    // Both selector and title update
    expect(selector.value).toBe('lingaraj-temple');
    expect(screen.getAllByText('Lingaraj Temple').length).toBeGreaterThanOrEqual(1);

    // Now change dropdown to Brahmeswara Temple
    fireEvent.change(selector, { target: { value: 'brahmeswara-temple' } });
    expect(selector.value).toBe('brahmeswara-temple');
    expect(screen.getAllByText('Brahmeswara Temple').length).toBeGreaterThanOrEqual(1);
  });

  it('7. onSelectScene receives the exact selected scene ID string', () => {
    const onSelectScene = vi.fn();
    render(
      <HeritageSceneViewer
        scene={FALLBACK_HERITAGE_SCENES[1]}
        availableScenes={FALLBACK_HERITAGE_SCENES}
        onSelectScene={onSelectScene}
      />
    );

    const selector = screen.getByTestId('heritage-monument-selector') as HTMLSelectElement;
    fireEvent.change(selector, { target: { value: 'konark-sun-temple' } });
    expect(onSelectScene).toHaveBeenCalledWith('konark-sun-temple');
    expect(typeof onSelectScene.mock.calls[0][0]).toBe('string');
  });

  it('8. Selector has accessible name and remains keyboard accessible', () => {
    const onSelectScene = vi.fn();
    render(
      <HeritageSceneViewer
        scene={FALLBACK_HERITAGE_SCENES[0]}
        availableScenes={FALLBACK_HERITAGE_SCENES}
        onSelectScene={onSelectScene}
      />
    );

    const selector = screen.getByLabelText('Select heritage monument');
    expect(selector).toBeDefined();
    selector.focus();
    expect(document.activeElement).toBe(selector);
  });

  it('9. Pointer and mouse events on selector stop propagation to avoid swallowing by viewer/canvas', () => {
    const onSelectScene = vi.fn();
    render(
      <HeritageSceneViewer
        scene={FALLBACK_HERITAGE_SCENES[0]}
        availableScenes={FALLBACK_HERITAGE_SCENES}
        onSelectScene={onSelectScene}
      />
    );

    const selector = screen.getByTestId('heritage-monument-selector');
    const pointerEvent = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
    const pointerSpy = vi.spyOn(pointerEvent, 'stopPropagation');
    selector.dispatchEvent(pointerEvent);
    expect(pointerSpy).toHaveBeenCalled();

    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    const mouseSpy = vi.spyOn(mouseDownEvent, 'stopPropagation');
    selector.dispatchEvent(mouseDownEvent);
    expect(mouseSpy).toHaveBeenCalled();
  });

  it('10. No duplicate active-scene state is introduced', () => {
    const onSelectScene = vi.fn();
    const { rerender } = render(
      <HeritageSceneViewer
        scene={FALLBACK_HERITAGE_SCENES[0]}
        availableScenes={FALLBACK_HERITAGE_SCENES}
        onSelectScene={onSelectScene}
      />
    );

    let selector = screen.getByTestId('heritage-monument-selector') as HTMLSelectElement;
    expect(selector.value).toBe('konark-sun-temple');

    // Rerendering with updated scene prop immediately reflects that single source of truth
    rerender(
      <HeritageSceneViewer
        scene={FALLBACK_HERITAGE_SCENES[2]}
        availableScenes={FALLBACK_HERITAGE_SCENES}
        onSelectScene={onSelectScene}
      />
    );
    selector = screen.getByTestId('heritage-monument-selector') as HTMLSelectElement;
    expect(selector.value).toBe('lingaraj-temple');
  });
});
