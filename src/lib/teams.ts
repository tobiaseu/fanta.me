import { colors } from '@/theme/tokens';
import type { Game } from '@/types/game';

/** Colori degli stemmi di squadra, nell'ordine in cui sono definite nella lega. */
const TEAM_COLORS = [colors.toonBlue, colors.toonPurple, colors.toonGreen, colors.toonRed, '#FF9F1C'];

export const teamColor = (game: Game, teamId: string) =>
  TEAM_COLORS[Math.max(0, game.teams?.findIndex((t) => t.id === teamId) ?? 0) % TEAM_COLORS.length];
