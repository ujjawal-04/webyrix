'use client';

import { useState, useEffect } from 'react';

export type PanelState = {
  visible: boolean;
  expanded: boolean;
  minimized: boolean;
};

export type PanelStates = {
  chat: PanelState;
  preview: PanelState;
  settings: PanelState;
};

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export function usePanelState() {
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  const [panelStates, setPanelStates] = useState<PanelStates>({
    chat: { visible: true, expanded: false, minimized: false },
    preview: { visible: true, expanded: false, minimized: false },
    settings: { visible: true, expanded: false, minimized: false },
  });

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
        // On mobile, show only preview by default
        setPanelStates({
          chat: { visible: true, expanded: false, minimized: true },
          preview: { visible: true, expanded: false, minimized: false },
          settings: { visible: true, expanded: false, minimized: true },
        });
      } else if (width < 1024) {
        setScreenSize('tablet');
        // On tablet, show chat and preview
        setPanelStates({
          chat: { visible: true, expanded: false, minimized: false },
          preview: { visible: true, expanded: false, minimized: false },
          settings: { visible: true, expanded: false, minimized: true },
        });
      } else {
        setScreenSize('desktop');
        // On desktop, show all panels
        setPanelStates({
          chat: { visible: true, expanded: false, minimized: false },
          preview: { visible: true, expanded: false, minimized: false },
          settings: { visible: true, expanded: false, minimized: false },
        });
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const togglePanel = (panel: keyof PanelStates) => {
    setPanelStates((prev) => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        minimized: !prev[panel].minimized,
      },
    }));
  };

  const expandPanel = (panel: keyof PanelStates) => {
    setPanelStates((prev) => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        expanded: true,
        minimized: false,
      },
    }));
  };

  const minimizePanel = (panel: keyof PanelStates) => {
    setPanelStates((prev) => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        expanded: false,
        minimized: true,
      },
    }));
  };

  const resetPanel = (panel: keyof PanelStates) => {
    setPanelStates((prev) => ({
      ...prev,
      [panel]: {
        ...prev[panel],
        expanded: false,
        minimized: false,
      },
    }));
  };

  const getPanelWidth = (panel: keyof PanelStates): string => {
    const state = panelStates[panel];
    
    if (screenSize === 'mobile') {
      if (state.minimized) return 'w-0';
      return 'w-full';
    }

    if (state.minimized) return 'w-12';
    if (state.expanded) {
      if (panel === 'preview') return 'w-full';
      return screenSize === 'tablet' ? 'w-1/2' : 'w-2/5';
    }

    // Default widths
    if (panel === 'chat') return screenSize === 'tablet' ? 'w-80' : 'w-96';
    if (panel === 'preview') return 'w-full';
    if (panel === 'settings') return screenSize === 'tablet' ? 'w-80' : 'w-96';
    
    return 'w-auto';
  };

  return {
    screenSize,
    panelStates,
    togglePanel,
    expandPanel,
    minimizePanel,
    resetPanel,
    getPanelWidth,
  };
}
