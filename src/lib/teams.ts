import { colors } from '@/theme/tokens';
import type { Game } from '@/types/game';

/** Colori degli stemmi di squadra, nell'ordine in cui sono definite nella lega. */
const TEAM_COLORS = [colors.teamBlue, colors.teamPurple, colors.teamGreen, colors.teamRed, '#FF9F1C'];

export const teamColor = (game: Game, teamId: string) =>
  TEAM_COLORS[Math.max(0, game.teams?.findIndex((t) => t.id === teamId) ?? 0) % TEAM_COLORS.length];

/** Stemma della squadra: un'emoji fissa per squadra, come la foto profilo di un gruppo. */
const TEAM_CRESTS = ['🦊', '🐺', '🦁', '🐙', '🦅', '🐝', '🦄', '🐊'];

export const teamEmoji = (game: Game, teamId: string) =>
  TEAM_CRESTS[Math.max(0, game.teams?.findIndex((t) => t.id === teamId) ?? 0) % TEAM_CRESTS.length];

/** Le squadre in cui gioca un giocatore (può stare in più squadre). */
export const teamsOf = (game: Game, playerId: string) =>
  game.teams?.filter((t) => t.memberIds.includes(playerId)) ?? [];

/** Riga sotto il nome di un giocatore: le sue squadre, oppure quella che allena. */
export function playerTeamLine(game: Game, playerId: string) {
  if (!game.teams?.length) return undefined;
  const plays = teamsOf(game, playerId).map((t) => t.name);
  const coaches = game.teams.filter((t) => t.ownerId === playerId).map((t) => t.name);
  if (plays.length) return plays.join(' · ');
  if (coaches.length) return `Fantallenatore di ${coaches.join(', ')}`;
  return 'Senza squadra';
}

/** Riga sotto il nome di una squadra: chi l'ha creata e la allena (è la stessa persona). */
export function teamByline(game: Game, team: { ownerId: string }, players: { id: string; name: string }[]) {
  const owner = players.find((p) => p.id === team.ownerId);
  const name = owner ? (game.nicknames?.[owner.id] ?? owner.name) : 'qualcuno';
  return `Creata e allenata da ${name}`;
}
