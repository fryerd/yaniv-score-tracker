/**
 * Unit Tests for Save Game Utilities
 *
 * Tests share token generation and share URL integration
 */

import { generateShareToken, SHARE_CHARS } from '@/lib/share-token';
import { generateShareText, SharePlayer } from '@/lib/share-utils';
import { getFirstName } from '@/lib/store';

describe('Share Token', () => {
  describe('generateShareToken', () => {
    it('generates an 8-character token', () => {
      const token = generateShareToken();
      expect(token).toHaveLength(8);
    });

    it('only uses allowed characters', () => {
      // Generate many tokens to increase coverage
      for (let i = 0; i < 100; i++) {
        const token = generateShareToken();
        for (const char of token) {
          expect(SHARE_CHARS).toContain(char);
        }
      }
    });

    it('does not contain confusable characters', () => {
      const confusable = ['0', 'O', '1', 'l', 'I', 'i', 'o'];
      for (let i = 0; i < 100; i++) {
        const token = generateShareToken();
        for (const char of confusable) {
          expect(token).not.toContain(char);
        }
      }
    });

    it('generates unique tokens', () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        tokens.add(generateShareToken());
      }
      // With 8 chars from 53-char alphabet, collisions in 1000 tokens are near-impossible
      expect(tokens.size).toBe(1000);
    });
  });

  describe('SHARE_CHARS', () => {
    it('does not contain confusable characters', () => {
      expect(SHARE_CHARS).not.toContain('0');
      expect(SHARE_CHARS).not.toContain('O');
      expect(SHARE_CHARS).not.toContain('1');
      expect(SHARE_CHARS).not.toContain('l');
      expect(SHARE_CHARS).not.toContain('I');
      expect(SHARE_CHARS).not.toContain('i');
      expect(SHARE_CHARS).not.toContain('o');
    });

    it('contains digits 2-9', () => {
      for (let d = 2; d <= 9; d++) {
        expect(SHARE_CHARS).toContain(d.toString());
      }
    });

    it('contains uppercase and lowercase letters', () => {
      expect(SHARE_CHARS).toMatch(/[A-Z]/);
      expect(SHARE_CHARS).toMatch(/[a-z]/);
    });
  });
});

describe('Share Text with Token URL', () => {
  const mockPlayers: SharePlayer[] = [
    { name: 'Alice Smith', cumulativeScore: 45 },
    { name: 'Bob Jones', cumulativeScore: 78 },
    { name: 'Charlie Brown', cumulativeScore: 102 },
  ];

  it('uses share token URL when provided', () => {
    const shareUrl = 'https://yaniv-score-tracker-ten.vercel.app/game/view/Ab3kX9mN';
    const text = generateShareText(mockPlayers, getFirstName, new Date(), shareUrl);

    expect(text).toContain('/game/view/Ab3kX9mN');
    expect(text.endsWith(shareUrl)).toBe(true);
  });

  it('uses default app URL when no share token URL provided', () => {
    const text = generateShareText(mockPlayers, getFirstName);

    expect(text).toContain('https://yaniv-score-tracker-ten.vercel.app/');
    expect(text).not.toContain('/game/view/');
  });

  it('still includes player scores with share token URL', () => {
    const shareUrl = 'https://example.com/game/view/testtoken';
    const text = generateShareText(mockPlayers, getFirstName, new Date(), shareUrl);

    expect(text).toContain('🥇 Alice - 45');
    expect(text).toContain('🥈 Bob - 78');
    expect(text).toContain('🥉 Charlie - 102');
  });
});
