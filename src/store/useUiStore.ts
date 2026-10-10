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
  /** Apre "Chiama un punto", con una carta già scelta se arriva da una carta */
  openQuickAction: (ruleId?: string) => void;
  quickRuleId?: string;
  closeQuickAction: () => void;
  toast?: Toast;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: () => void;
  /** Menù rapido su un giocatore (stile Clash): formazione, profilo, amicizia */
  playerMenu?: { playerId: string; gameId?: string };
  openPlayerMenu: (playerId: string, gameId?: string) => void;
  closePlayerMenu: () => void;
  /** Cresce a ogni nuova chiamata inviata: le pagine mostrano la rotellina di aggiornamento */
  refreshTick: number;
  pulseRefresh: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  quickActionOpen: false,
  openQuickAction: (ruleId) => set({ quickActionOpen: true, quickRuleId: ruleId }),
  closeQuickAction: () => set({ quickActionOpen: false, quickRuleId: undefined }),
  toast: undefined,
  showToast: (toast) => set({ toast: { ...toast, id: Date.now() } }),
  hideToast: () => set({ toast: undefined }),
  playerMenu: undefined,
  openPlayerMenu: (playerId, gameId) => set({ playerMenu: { playerId, gameId } }),
  closePlayerMenu: () => set({ playerMenu: undefined }),
  refreshTick: 0,
  pulseRefresh: () => set((s) => ({ refreshTick: s.refreshTick + 1 })),
}));
