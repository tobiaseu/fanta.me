# Fanta.me

> La platformizzazione del gioco sociale: Fantacalcio e FantaSanremo applicati alla vita reale.
> Vacanze, ufficio, scuola: gli amici sono allo stesso tempo fantallenatori e protagonisti.

**Demo web (Fase 1):** https://tobiaseu.github.io/fanta.me/
Aprila dal telefono: è la stessa app Expo esportata per il web. `?demo=empty` mostra l'empty state della Lobby.

Progetto portfolio di UX/UI + sviluppo mobile. Questa è la **Fase 1**: architettura, routing e Lobby,
con Dashboard in-game già navigabile su dati finti.

---

## Stack

| Livello | Scelta | Perché |
| --- | --- | --- |
| App | **Expo SDK 57 + React Native + TypeScript** | Un codice per iOS, Android e web (demo portfolio). |
| Routing | **Expo Router** (file-based, sopra React Navigation) | Le cartelle *sono* la mappa dell'app: la separazione Lobby/Dashboard si vede nell'albero. Deep link gratis (`fantame://game/123`) per inviti e notifiche push. |
| Styling | **StyleSheet + design tokens** (`src/theme/tokens.ts`) | Alternativa motivata a NativeWind: zero config Babel/Metro, nessun runtime di classi, e i token sono 1:1 con le variabili Figma. Flexbox con `gap` emula l'Auto Layout. |
| Stato | **Zustand** | Store minimale, selettori senza boilerplate, facile da collegare al Realtime. |
| Animazioni | **Reanimated 4** | Card in ingresso, tap elastici, badge "live" pulsante, bottom sheet a molla. |
| Aptica | **expo-haptics** | Feedback per ogni punto assegnato (successo = bonus, warning = malus). |
| Illustrazioni | **react-native-svg** | Mascotte rubber-hose vettoriali, ricolorabili per stanza. |
| Backend (Fase 2) | **Supabase** | Postgres + Realtime per Feed live e classifiche; Auth; Edge Functions per le notifiche. |
| Monetizzazione (Fase 3) | **RevenueCat + Rewarded Ads** | Superpoteri (Veto, Moltiplicatore) sbloccati guardando un video. |

## Architettura UX: i due mondi

```
/                  LOBBY (nessuna navbar)
                   header carriera · lista partite · CTA "Crea Nuova Stanza"
   │ tap su card                         └─► /room/new (modale)
   ▼
/game/[gameId]/*   DASHBOARD IN-GAME
                   top bar (nome partita + "In partita")
                   bottom navbar: Feed · Regole · ⚡ Azione · Classifica · Profilo
```

- La **navbar esiste solo nel layout `game/[gameId]/_layout.tsx`**: la Lobby non può mostrarla nemmeno per errore.
- Il tab centrale **⚡ Azione Veloce** non apre una pagina: apre un bottom sheet sopra qualsiasi tab
  (chi → cosa → conferma, tre tocchi, zero tastiera).

## Albero delle directory

```
src/
├── app/                          # SOLO route (Expo Router): file = schermata
│   ├── _layout.tsx               # Root Stack: separa Lobby, Dashboard e modali
│   ├── index.tsx                 # /            → Lobby
│   ├── room/
│   │   └── new.tsx               # /room/new    → Crea stanza (modale)
│   └── game/[gameId]/
│       ├── _layout.tsx           # Tabs a 5 + Top Bar + Azione Veloce
│       ├── index.tsx             # Feed live
│       ├── rules.tsx             # Regolamento + Superpoteri
│       ├── action.tsx            # Tab "fantasma" (la navbar apre il bottom sheet)
│       ├── leaderboard.tsx       # Classifica
│       └── profile.tsx           # Profilo in-game
├── screens/                      # Schermate complete (logica + layout), montate dalle route
│   ├── LobbyScreen.tsx
│   ├── CreateRoomScreen.tsx
│   └── game/
│       ├── FeedScreen.tsx
│       ├── RulesScreen.tsx
│       ├── LeaderboardScreen.tsx
│       └── ProfileScreen.tsx
├── components/
│   ├── ui/                       # Primitive: AppText, Avatar, StatusBadge, PressableScale
│   ├── icons/                    # Set icone SVG
│   ├── illustrations/            # Mascotte "Retro Rubber-Hose"
│   ├── lobby/                    # CareerHeader, GameCard, EmptyLobby, CreateRoomButton
│   └── game/                     # GameTopBar, GameTabBar, QuickActionSheet, FeedItem, CountdownHero
├── store/                        # Zustand: useGameStore (dominio), useUiStore (stato UI)
├── data/                         # Mock + dizionario regole (→ Supabase in Fase 2)
├── types/                        # Modello di dominio (Game, Rule, FeedEvent…)
├── hooks/                        # useNow (countdown), useCurrentGame
├── lib/                          # haptics, formattazione tempi
└── theme/                        # Design tokens (colori, spazi, raggi, tipografia)
```

Regola: `app/` contiene solo routing sottile; tutto il resto vive fuori, così si può cambiare
navigazione senza toccare le schermate.

**Previsto nelle prossime fasi:** `services/supabase/` (client, query, canali realtime),
`services/notifications/` (push con cronaca sportiva), `services/monetization/` (RevenueCat, ads).

## Design system

| Token | Valore | Uso |
| --- | --- | --- |
| `background` | `#F2F2F7` | Sfondo off-white |
| `live` / `liveSoft` | `#34C759` / `#D6F5DE` | Stato "In partita", tab attivo |
| `cta` | `#FF9F1C` | CTA primarie (Crea stanza, ⚡, conferma) |
| `bonus` / `malus` | verde / rosso | Punteggi |
| `space` | 4 · 8 · 12 · **16** · **24** · 32 · 48 | Gap costanti, niente "muro di mattoni" |
| `radius` | 12 · 16 · **24** · 32 · pill | Card morbide |

Illustrazioni: personaggi rubber-hose anni '30, due colori vibranti + inchiostro, bordo bianco
spesso da sticker fustellato. UI pulita, mascotte irriverenti.

## Requisiti di gioco: stato

- [x] Modalità **Sprint** (countdown a ore) e **Maratona** (settimane)
- [x] Motore regole: dizionario Bonus/Malus per categoria (`src/data/rules.ts`)
- [x] Azione Veloce con feedback aptico
- [x] Superpoteri visibili e bloccati (sblocco con Rewarded Ad in Fase 3)
- [ ] Sincronizzazione realtime (Supabase) · Fase 2
- [ ] Notifiche push "cronaca sportiva" · Fase 2
- [ ] RevenueCat / Rewarded Ads · Fase 3

## Sviluppo

```bash
npm install
npm start            # Expo Go / simulatori
npm run web          # browser
npm run typecheck
npm run build:web    # export statico in dist/
```

Ogni push su `main` pubblica la demo web su GitHub Pages (`.github/workflows/pages.yml`).
