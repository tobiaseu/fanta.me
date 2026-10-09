import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

export type SignInMethod = 'apple' | 'google' | 'email';
/** Chi vede trofei, scudi e carte nel profilo: si parte da privato */
export type Visibility = 'private' | 'friends' | 'everyone';
export type NotificationKind = 'calls' | 'phases' | 'friends';

/**
 * Sessione utente (mock). Fase 2: Supabase Auth con Sign in with Apple / Google.
 * Sul web resta salvata nel browser, così riaprendo la demo si salta il login.
 */
interface SessionState {
  signedIn: boolean;
  method?: SignInMethod;
  /** Ha già creato (o saltato) la prima stanza */
  onboarded: boolean;
  /** Ultima stanza aperta: la Home la propone per rientrare al volo */
  lastGameId?: string;
  setLastGame: (gameId: string) => void;
  collectionVisibility: Visibility;
  /** Notifiche per tipo: chiamate da votare, inizio/fine partita, richieste d'amicizia */
  notifications: Record<NotificationKind, boolean>;
  toggleNotification: (kind: NotificationKind) => void;
  hapticsOn: boolean;
  setHaptics: (on: boolean) => void;
  setCollectionVisibility: (v: Visibility) => void;
  signIn: (method: SignInMethod) => void;
  finishOnboarding: () => void;
  signOut: () => void;
}

const memory = new Map<string, string>();
const storage: StateStorage = {
  getItem: (k) => {
    try {
      return globalThis.localStorage?.getItem(k) ?? memory.get(k) ?? null;
    } catch {
      return memory.get(k) ?? null;
    }
  },
  setItem: (k, v) => {
    memory.set(k, v);
    try {
      globalThis.localStorage?.setItem(k, v);
    } catch {}
  },
  removeItem: (k) => {
    memory.delete(k);
    try {
      globalThis.localStorage?.removeItem(k);
    } catch {}
  },
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      signedIn: false,
      onboarded: false,
      setLastGame: (gameId) => set({ lastGameId: gameId }),
      collectionVisibility: 'private',
      notifications: { calls: true, phases: true, friends: true },
      toggleNotification: (kind) =>
        set((s) => ({ notifications: { ...s.notifications, [kind]: !s.notifications[kind] } })),
      hapticsOn: true,
      setHaptics: (hapticsOn) => set({ hapticsOn }),
      setCollectionVisibility: (collectionVisibility) => set({ collectionVisibility }),
      signIn: (method) => set({ signedIn: true, method }),
      finishOnboarding: () => set({ onboarded: true }),
      signOut: () => set({ signedIn: false, onboarded: false, method: undefined }),
    }),
    { name: 'fantame-session', storage: createJSONStorage(() => storage) },
  ),
);
