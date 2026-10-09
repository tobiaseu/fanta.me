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
                   carriera · le tue leghe · nuovo evento (format)
                   pannello fisso: Entra con codice · Crea stanza
   │ tap su lega            ├─► /room/new  (modale)
   ▼                        └─► /room/join (modale)
/game/[gameId]/*   DASHBOARD IN-GAME
                   top bar bianca (nome lega + "● in partita")
                   navbar flottante: Feed · Regolamento · ▶ Punti · Classifica · Profilo
   │ tap su una storia
   ▼
/call/[eventId]    CONFERMA PUNTO (modale a schermo intero): Rifiuta · Conferma · Ignora
```

- La **navbar esiste solo nel layout `game/[gameId]/_layout.tsx`**: la Lobby non può mostrarla nemmeno per errore.
- Il tab centrale **▶ Aggiungi punti** non apre una pagina: apre un bottom sheet sopra qualsiasi tab
  (chi → quale carta → chiama, tre tocchi, zero tastiera).
- **I punti sono chiamate, non sentenze.** Chi assegna punti crea una *chiamata* (`status: 'pending'`)
  che compare nelle storie del Feed; il gruppo la vota in "Conferma punto". Classifica e profilo
  contano solo le chiamate confermate. Così il gioco resta sociale e nessuno si autoassegna +50.

## Albero delle directory

```
src/
├── app/                          # SOLO route (Expo Router): file = schermata
│   ├── _layout.tsx               # Root Stack: separa Lobby, Dashboard e modali
│   ├── index.tsx                 # /            → Lobby
│   ├── room/
│   │   ├── new.tsx               # /room/new    → Crea stanza (modale)
│   │   └── join.tsx              # /room/join   → Entra con codice (modale)
│   ├── call/[eventId].tsx        # /call/:id    → Conferma punto (voto del gruppo)
│   └── game/[gameId]/
│       ├── _layout.tsx           # Tabs a 5 + Top Bar + Aggiungi punti
│       ├── index.tsx             # Feed live
│       ├── rules.tsx             # Regolamento + Superpoteri
│       ├── action.tsx            # Tab "fantasma" (la navbar apre il bottom sheet)
│       ├── leaderboard.tsx       # Classifica
│       └── profile.tsx           # Profilo in-game
├── screens/                      # Schermate complete (logica + layout), montate dalle route
│   ├── LobbyScreen.tsx
│   ├── CreateRoomScreen.tsx
│   ├── JoinRoomScreen.tsx
│   ├── CallScreen.tsx
│   └── game/
│       ├── FeedScreen.tsx
│       ├── RulesScreen.tsx
│       ├── LeaderboardScreen.tsx
│       └── ProfileScreen.tsx
├── components/
│   ├── ui/                       # Primitive: AppText, Button, TopBar, Avatar, StatusBadge, Brand, PressableScale
│   ├── icons/                    # Icone SVG in stile Vuesax (come nel Figma)
│   ├── illustrations/            # Mascotte "Retro Rubber-Hose" + RuleSticker (sticker delle carte)
│   ├── lobby/                    # CareerHeader, LeagueCard, FormatCarousel, LobbyActions, EmptyLobby
│   └── game/                     # GameTabBar, QuickActionSheet, StoriesRow, CountdownStrip, FeedItem, PlayerCard
├── store/                        # Zustand: useGameStore (dominio), useUiStore (stato UI)
├── data/                         # Mock, dizionario regole, format evento (→ Supabase in Fase 2)
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
Token presi dal file Figma (pagina *Prototype* e *Component master*).

| Token | Valore | Uso |
| --- | --- | --- |
| `background` | `#F2F2F7` | Sfondo off-white |
| `cta` | `#FFE382` | CTA 1 (giallo pieno) e bordo della CTA 2 |
| `live` | `#0B8200` su verde al 20% | Leghe in partita, "● in partita" |
| `ctaSoft` / `ended` | giallo / grigio al 20% | Leghe in attesa / concluse |
| `bonusBright` / `malus` | `#1CB100` / `#D92D20` | Punti di una carta |
| `space` | 4 · 8 · 12 · **16** · **24** · 32 · 48 | Gap costanti |
| `radius` | 12 · 16 · **24** · 28 · 36 (top bar) · pill | Card morbide |
| tipografia | SF/system 600, titoli carta in serif | Le carte trofeo parlano "da trofeo" |

Illustrazioni: sticker rubber-hose anni '30 (corpo crema, inchiostro, accenti blu, bordo bianco
fustellato). Lo sticker della Smurratona viene dal Figma; le altre carte usano la mascotte vettoriale.

## Requisiti di gioco: stato

- [x] Modalità **Sprint** (countdown a ore) e **Maratona** (settimane)
- [x] Motore regole: dizionario Bonus/Malus per categoria (`src/data/rules.ts`)
- [x] Aggiungi punti con feedback aptico
- [x] Chiamate votate dal gruppo (Conferma / Rifiuta) prima di contare in classifica
- [x] Classifica a podio, squadre e individuale, con trend delle ultime 2 ore
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

Ogni push su `main` esegue typecheck ed export web, poi pubblica `dist/` sul branch `gh-pages`
(`.github/workflows/pages.yml`). Demo: https://tobiaseu.github.io/fanta.me/
