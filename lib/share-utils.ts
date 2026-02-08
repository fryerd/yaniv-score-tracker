/**
 * Share Utilities
 *
 * Helpers for formatting and sharing game results
 */

export interface SharePlayer {
  name: string;
  cumulativeScore: number;
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.)
 */
export function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Format a date like "Sun 8th Feb 2026"
 */
export function formatShareDate(date: Date): string {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();

  return `${dayName} ${getOrdinal(day)} ${month} ${year}`;
}

/**
 * Generate share text for game results
 */
export function generateShareText(
  sortedPlayers: SharePlayer[],
  getFirstName: (name: string) => string,
  date: Date = new Date(),
  appUrl: string = 'https://yaniv-score-tracker-ten.vercel.app/'
): string {
  const medals = ['🥇', '🥈', '🥉'];
  const lines = sortedPlayers.map((player, index) => {
    const medal = index < 3 ? medals[index] : '♥️';
    return `${medal} ${getFirstName(player.name)} - ${player.cumulativeScore}`;
  });

  const formattedDate = formatShareDate(date);
  return `Yaniv - ${formattedDate}\n\n${lines.join('\n')}\n\n${appUrl}`;
}
