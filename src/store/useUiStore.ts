import { create } from 'zustand';

export interface Toast {
  id: number;
  text: string;
  /** Azione facoltativa (es. "Annulla") */
  action?: { label: string; onPress: () => void };
}

/** Stato UI effimero (non persistito). */
interface UiState {
  quickActionOpen: boolean;
  openQuickAction: () => void;
  closeQuickAction: () => void;
  toast?: Toast;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  quickActionOpen: false,
  openQuickAction: () => set({ quickActionOpen: true }),
  closeQuickAction: () => set({ quickActionOpen: false }),
  toast: undefined,
  showToast: (toast) => set({ toast: { ...toast, id: Date.now() } }),
  hideToast: () => set({ toast: undefined }),
}));
