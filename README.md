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

## Architettura UX

```
/welcome           ACCESSO: Apple · Google · email (mock) · "Ho già un codice invito"
/onboarding/room   1/2 PRIMA STANZA: nome (precompilato) + Sprint o Maratona
/onboarding/invite 2/2 INVITA: codice di 6 lettere, Condividi, persone che conosci
   ▼
/                  LOBBY alla Clubhouse (nessuna navbar)
                   saluto + carriera · "Le tue stanze" (card con chi c'è dentro) · nuovo evento
                   pillola flottante "+ Crea stanza" · bottone tondo "Entra con codice"
   │ tap su stanza          ├─► /room/new  (modale)
   ▼                        └─► /room/join (modale)
/game/[gameId]/*   PARTITA
                   header in alto con countdown: aperto sulla Dashboard,
                   striscia "● in partita / da iniziare / conclusa" sugli altri tab
                   navbar flottante: Dashboard · Regolamento · + Punti · Classifica · Profilo
                   Dashboard: da votare · carta del giorno ×2 · capitano · podio e MVP di oggi · ultimi punti
                   /feed (nascosto): cronaca completa, da "Vedi tutto"
   │ tap su una storia
   ▼
/call/[eventId]    CONFERMA PUNTO (modale a schermo intero): Rifiuta · Conferma · Decido dopo
/player/[id]       PROFILO GIOCATORE (modale): carriera, stanze in comune, amicizia, Esci
```

- **Dinamiche FantaSanremo.** La partita è divisa in giornate (Sprint: 24 ore; Maratona: settimane).
  Ogni giornata ha una *carta del giorno* che vale doppio, ogni squadra sceglie un *capitano* i cui punti
  di oggi contano due volte, e la Dashboard mostra podio e MVP della giornata.
- La sessione (mock) resta salvata nel browser: riaprendo la demo si salta il login. "Esci" dal profilo la azzera.
- La **navbar esiste solo nel layout `game/[gameId]/_layout.tsx`**: la Lobby non può mostrarla nemmeno per errore.
- Il tab centrale **▶ Aggiungi punti** non apre una pagina: apre un bottom sheet sopra qualsiasi tab
  (chi → quale carta → chiama, tre tocchi, zero tastiera).
- **I punti sono chiamate, non sentenze.** Chi assegna punti crea una *chiamata* (`status: 'pending'`)
  che compare nelle storie del Feed; il gruppo la vota in "Conferma punto". Classifica e profilo
  contano solo le chiamate confermate. Così il gioco resta sociale e nessuno si autoassegna +50.
  Una chiamata diventa ufficiale (o scartata) quando una parte raggiunge la maggioranza di chi può
  votare, cioè tutti tranne il giocatore chiamato.
- **Ogni persona è toccabile** (Feed, Classifica, Profilo, Conferma punto) e apre il suo profilo:
  da lì si chiede l'amicizia, e tra amici si crea una stanza insieme (gli amici si invitano con un tocco).
- Ogni azione che cambia lo stato mostra un toast in alto con **Annulla**.

## Albero delle directory

```
src/
├── app/                          # SOLO route (Expo Router): file = schermata
│   ├── _layout.tsx               # Root Stack: separa Lobby, Dashboard e modali
│   ├── index.tsx                 # /            → Lobby (senza sessione → /welcome)
│   ├── welcome.tsx               # /welcome     → Accesso
│   ├── onboarding/               # room.tsx, invite.tsx → prima stanza e inviti
│   ├── room/
│   │   ├── new.tsx               # /room/new    → Crea stanza (modale)
│   │   └── join.tsx              # /room/join   → Entra con codice (modale)
│   ├── call/[eventId].tsx        # /call/:id    → Conferma punto (voto del gruppo)
│   ├── player/[playerId].tsx     # /player/:id  → Profilo giocatore e amicizia
│   └── game/[gameId]/
│       ├── _layout.tsx           # GameHeader + Tabs a 5 + Aggiungi punti
│       ├── index.tsx             # Dashboard della partita
│       ├── feed.tsx              # Cronaca completa (nascosta dalla navbar)
│       ├── rules.tsx             # Regolamento + Superpoteri
│       ├── action.tsx            # Tab "fantasma" (la navbar apre il bottom sheet)
│       ├── leaderboard.tsx       # Classifica
│       └── profile.tsx           # Profilo in-game
├── screens/                      # Schermate complete (logica + layout), montate dalle route
│   ├── LobbyScreen.tsx
│   ├── CreateRoomScreen.tsx
│   ├── JoinRoomScreen.tsx
│   ├── CallScreen.tsx
│   ├── PlayerProfileScreen.tsx
│   ├── onboarding/               # WelcomeScreen, OnboardingRoomScreen, OnboardingInviteScreen
│   └── game/
│       ├── DashboardScreen.tsx
│       ├── FeedScreen.tsx
│       ├── RulesScreen.tsx
│       ├── LeaderboardScreen.tsx
│       └── ProfileScreen.tsx
├── components/
│   ├── ui/                       # Primitive: AppText, Button, TopBar, SectionHeader, StepHeader, Avatar, StatusBadge, Brand, ToastHost, PressableScale
│   ├── icons/                    # Icone SVG in stile Vuesax (come nel Figma)
│   ├── illustrations/            # Mascotte "Retro Rubber-Hose" + RuleSticker (emoji delle carte)
│   ├── lobby/                    # RoomCard, FormatCarousel, LobbyActions, EmptyLobby
│   └── game/                     # GameHeader, GameTabBar, QuickActionSheet, StoriesRow, FeedItem
├── store/                        # Zustand: useGameStore (dominio), useSessionStore (login, persistito), useUiStore (stato UI)
├── data/                         # Mock, dizionario regole, format evento (→ Supabase in Fase 2)
├── types/                        # Modello di dominio (Game, Rule, FeedEvent…)
├── hooks/                        # useNow (countdown), useCurrentGame, useOpenPlayer
├── lib/                          # haptics, formattazione tempi
└── theme/                        # Design tokens (colori, spazi, raggi, tipografia)
```

Regola: `app/` contiene solo routing sottile; tutto il resto vive fuori, così si può cambiare
navigazione senza toccare le schermate.

**Previsto nelle prossime fasi:** `services/supabase/` (client, query, canali realtime),
`services/notifications/` (push con cronaca sportiva), `services/monetization/` (RevenueCat, ads).

## Design system

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
| `layout` | margini 16 · sezioni 24 · padding card 16 | Stessa griglia in tutte le schermate |
| tipografia | 3 pesi (400 · 600 · 800), 4 taglie (12 · 15 · 17 · 22) + display 34; **Fraunces** per saluti, onboarding e carte | Gerarchia chiara, serif morbido coerente con le mascotte |
| forme | avatar squircle (come Clubhouse), bottoni a pillola alti 56 | Cerchi solo nelle storie |

Carte: ogni carta ha la sua emoji di sistema in grande (su iPhone e Mac sono le emoji 3D di Apple),
con un'ombra morbida che la "posa" sulla carta. Le mascotte rubber-hose restano solo negli stati vuoti.

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
