import { create } from 'zustand';

/** Stato UI effimero (non persistito). */
interface UiState {
  quickActionOpen: boolean;
  openQuickAction: () => void;
  closeQuickAction: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  quickActionOpen: false,
  openQuickAction: () => set({ quickActionOpen: true }),
  closeQuickAction: () => set({ quickActionOpen: false }),
}));
