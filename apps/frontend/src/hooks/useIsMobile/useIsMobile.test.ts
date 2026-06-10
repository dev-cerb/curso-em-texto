import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { MOBILE_BREAKPOINT, useIsMobile } from '.';

describe('useIsMobile', () => {
  function setupMatchMedia(matches: boolean) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  }

  it('should return true when the viewport is within the mobile breakpoint', () => {
    setupMatchMedia(true);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should return false when the viewport is above the mobile breakpoint', () => {
    setupMatchMedia(false);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should query the media using the mobile breakpoint', () => {
    const matchMediaSpy = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaSpy,
    });

    renderHook(() => useIsMobile());

    expect(matchMediaSpy).toHaveBeenCalledWith(
      `(max-width: ${MOBILE_BREAKPOINT}px)`
    );
  });
});
