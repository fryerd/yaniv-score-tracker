/**
 * Dev Tools Utilities
 *
 * Helpers for testing and development
 */

import { Player, Round, HouseRules } from '@/types/game';

/**
 * Check if dev tools are enabled via URL parameter
 */
export function isDevToolsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const devtools = params.get('devtools');

  // devtools=true enables, devtools=false disables
  return devtools === 'true';
}

/**
 * Random cricketer names for testing
 */
const CRICKETER_NAMES = [
  'Virat Kohli',
  'Steve Smith',
  'Ben Stokes',
  'Kane Williamson',
  'Rohit Sharma',
  'Joe Root',
  'Babar Azam',
  'Pat Cummins',
  'Jasprit Bumrah',
  'Mitchell Starc',
  'Trent Boult',
  'Kagiso Rabada',
  'David Warner',
  'AB de Villiers',
  'MS Dhoni',
  'Ricky Ponting',
];

/**
 * Get random cricketer names for testing
 */
export function getRandomCricketerNames(count: number): string[] {
  // Shuffle and take first 'count' names
  const shuffled = [...CRICKETER_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Generate mock player hands for testing
 * Returns player hands and yaniv caller ID suitable for passing to addRound
 */
export function generateMockPlayerHands(
  players: { id: string; name: string }[]
): { playerHands: { playerId: string; handTotal: number }[]; yanivCallerId: string } {
  // Pick a random player to call Yaniv
  const yanivCallerIndex = Math.floor(Math.random() * players.length);
  const yanivCallerId = players[yanivCallerIndex].id;

  // Generate random hand scores
  const playerHands = players.map((player, index) => ({
    playerId: player.id,
    handTotal: index === yanivCallerIndex
      ? Math.floor(Math.random() * 6) // Yaniv caller: 0-5
      : 5 + Math.floor(Math.random() * 26) // Others: 5-30
  }));

  return { playerHands, yanivCallerId };
}
