/**
 * Unit Tests for Share Utilities
 *
 * These tests verify the share text formatting works correctly
 */

import { getOrdinal, formatShareDate, generateShareText, SharePlayer } from '@/lib/share-utils';
import { getFirstName } from '@/lib/store';

describe('Share Utilities', () => {
  describe('getOrdinal', () => {
    it('returns correct ordinal for 1-13', () => {
      expect(getOrdinal(1)).toBe('1st');
      expect(getOrdinal(2)).toBe('2nd');
      expect(getOrdinal(3)).toBe('3rd');
      expect(getOrdinal(4)).toBe('4th');
      expect(getOrdinal(11)).toBe('11th');
      expect(getOrdinal(12)).toBe('12th');
      expect(getOrdinal(13)).toBe('13th');
    });

    it('returns correct ordinal for 21-23', () => {
      expect(getOrdinal(21)).toBe('21st');
      expect(getOrdinal(22)).toBe('22nd');
      expect(getOrdinal(23)).toBe('23rd');
      expect(getOrdinal(24)).toBe('24th');
    });

    it('returns correct ordinal for 31', () => {
      expect(getOrdinal(31)).toBe('31st');
    });

    it('handles special cases correctly', () => {
      expect(getOrdinal(111)).toBe('111th');
      expect(getOrdinal(112)).toBe('112th');
      expect(getOrdinal(113)).toBe('113th');
      expect(getOrdinal(121)).toBe('121st');
    });
  });

  describe('formatShareDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2026-02-08'); // Feb 8th, 2026
      const formatted = formatShareDate(date);

      // Should match pattern like "Sun 8th Feb 2026"
      expect(formatted).toMatch(/\w{3} \d{1,2}(st|nd|rd|th) \w{3} \d{4}/);
      expect(formatted).toContain('8th');
      expect(formatted).toContain('Feb');
      expect(formatted).toContain('2026');
    });

    it('handles 1st correctly', () => {
      const date = new Date('2026-03-01'); // Mar 1st, 2026
      const formatted = formatShareDate(date);
      expect(formatted).toContain('1st');
    });

    it('handles 2nd correctly', () => {
      const date = new Date('2026-03-02'); // Mar 2nd, 2026
      const formatted = formatShareDate(date);
      expect(formatted).toContain('2nd');
    });

    it('handles 3rd correctly', () => {
      const date = new Date('2026-03-03'); // Mar 3rd, 2026
      const formatted = formatShareDate(date);
      expect(formatted).toContain('3rd');
    });

    it('handles 21st correctly', () => {
      const date = new Date('2026-03-21'); // Mar 21st, 2026
      const formatted = formatShareDate(date);
      expect(formatted).toContain('21st');
    });
  });

  describe('generateShareText', () => {
    const mockPlayers: SharePlayer[] = [
      { name: 'Alice Smith', cumulativeScore: 45 },
      { name: 'Bob Jones', cumulativeScore: 78 },
      { name: 'Charlie Brown', cumulativeScore: 102 },
      { name: 'Diana Prince', cumulativeScore: 135 },
    ];

    it('includes correct medals for top 3 and heart for rest', () => {
      const text = generateShareText(mockPlayers, getFirstName);

      expect(text).toContain('🥇 Alice - 45');
      expect(text).toContain('🥈 Bob - 78');
      expect(text).toContain('🥉 Charlie - 102');
      expect(text).toContain('♥️ Diana - 135');
    });

    it('includes Yaniv title with date', () => {
      const date = new Date('2026-02-08');
      const text = generateShareText(mockPlayers, getFirstName, date);

      expect(text).toContain('Yaniv -');
      expect(text).toContain('8th');
      expect(text).toContain('Feb');
      expect(text).toContain('2026');
    });

    it('includes app URL at the end', () => {
      const text = generateShareText(mockPlayers, getFirstName);

      expect(text).toContain('https://yaniv-score-tracker-ten.vercel.app/');
      expect(text.endsWith('https://yaniv-score-tracker-ten.vercel.app/')).toBe(true);
    });

    it('has correct structure with blank lines', () => {
      const text = generateShareText(mockPlayers, getFirstName);

      // Should have format: Title\n\nPlayers\n\nURL
      const lines = text.split('\n');
      expect(lines[0]).toContain('Yaniv -');
      expect(lines[1]).toBe(''); // blank line
      expect(lines[2]).toContain('🥇');
      expect(lines[lines.length - 2]).toBe(''); // blank line before URL
      expect(lines[lines.length - 1]).toContain('https://');
    });

    it('uses only first names', () => {
      const text = generateShareText(mockPlayers, getFirstName);

      expect(text).toContain('Alice');
      expect(text).toContain('Bob');
      expect(text).not.toContain('Smith');
      expect(text).not.toContain('Jones');
    });

    it('handles 2 players correctly', () => {
      const twoPlayers: SharePlayer[] = [
        { name: 'Alice', cumulativeScore: 50 },
        { name: 'Bob', cumulativeScore: 100 },
      ];

      const text = generateShareText(twoPlayers, getFirstName);

      expect(text).toContain('🥇 Alice - 50');
      expect(text).toContain('🥈 Bob - 100');
      expect(text).not.toContain('🥉');
    });

    it('handles more than 4 players with hearts', () => {
      const manyPlayers: SharePlayer[] = [
        { name: 'P1', cumulativeScore: 10 },
        { name: 'P2', cumulativeScore: 20 },
        { name: 'P3', cumulativeScore: 30 },
        { name: 'P4', cumulativeScore: 40 },
        { name: 'P5', cumulativeScore: 50 },
        { name: 'P6', cumulativeScore: 60 },
      ];

      const text = generateShareText(manyPlayers, getFirstName);

      expect(text).toContain('🥇 P1 - 10');
      expect(text).toContain('🥈 P2 - 20');
      expect(text).toContain('🥉 P3 - 30');
      expect(text).toContain('♥️ P4 - 40');
      expect(text).toContain('♥️ P5 - 50');
      expect(text).toContain('♥️ P6 - 60');
    });
  });
});
