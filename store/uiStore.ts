import { create } from 'zustand';

interface UIState {
    activeOverlays: number;
    incrementOverlays: () => void;
    decrementOverlays: () => void;
    getIsOverlayOpen: () => boolean;
}

export const useUIStore = create<UIState>((set, get) => ({
    activeOverlays: 0,
    incrementOverlays: () => set((state) => ({ activeOverlays: state.activeOverlays + 1 })),
    decrementOverlays: () => set((state) => ({ activeOverlays: Math.max(0, state.activeOverlays - 1) })),
    getIsOverlayOpen: () => get().activeOverlays > 0,
}));
