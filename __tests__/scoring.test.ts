/**
 * Unit Tests for Yaniv Scoring Logic
 *
 * These tests verify the core scoring rules work correctly:
 * - Normal Yaniv (caller wins, gets 0, others get hand total)
 * - False Yaniv (caller penalized, equal/lower players win)
 * - Bonus triggers (hitting multiples of 50)
 * - 3-win streak bonus
 * - Game end detection
 */

import { useGameStore, getInitials, getFirstName } from '@/lib/store';
import { HouseRules } from '@/types/game';

// Reset store before each test
beforeEach(() => {
  useGameStore.setState({ currentGame: null });
});

// Default house rules for testing
const defaultRules: HouseRules = {
  falseYanivPenalty: 25,
  bystandersScoreOnFalseYaniv: false,
  bonusType: 'subtract25',
  winStreakBonus: false,
  endGameMode: 'highScore',
  maxScore: 150,
  maxRounds: 10,
};

describe('Helper Functions', () => {
  describe('getInitials', () => {
    it('returns single letter for single name', () => {
      expect(getInitials('Dan')).toBe('D');
    });

    it('returns two letters for two names', () => {
      expect(getInitials('Dan Fryer')).toBe('DF');
    });

    it('handles extra whitespace', () => {
      expect(getInitials('  Dan   Fryer  ')).toBe('DF');
    });

    it('returns empty string for empty input', () => {
      expect(getInitials('')).toBe('');
      expect(getInitials('   ')).toBe('');
    });
  });

  describe('getFirstName', () => {
    it('returns first name from full name', () => {
      expect(getFirstName('Dan Fryer')).toBe('Dan');
    });

    it('returns the name if single word', () => {
      expect(getFirstName('Dan')).toBe('Dan');
    });

    it('handles whitespace', () => {
      expect(getFirstName('  Dan   Fryer  ')).toBe('Dan');
    });
  });
});

describe('Game Creation', () => {
  it('creates a game with correct initial state', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob', 'Charlie'], defaultRules);

    const game = useGameStore.getState().currentGame;
    expect(game).not.toBeNull();
    expect(game!.players).toHaveLength(3);
    expect(game!.players[0].name).toBe('Alice');
    expect(game!.players[0].cumulativeScore).toBe(0);
    expect(game!.rounds).toHaveLength(0);
    expect(game!.gameEnded).toBe(false);
  });

  it('assigns different colors to each player', () => {
    const store = useGameStore.getState();
    store.createGame(['A', 'B', 'C', 'D'], defaultRules);

    const game = useGameStore.getState().currentGame;
    const colors = game!.players.map(p => p.color);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(4);
  });
});

describe('Normal Yaniv Scoring', () => {
  it('caller gets 0, others get their hand totals', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob', 'Charlie'], defaultRules);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob, charlie] = game.players;

    // Alice calls Yaniv with 5, Bob has 20, Charlie has 15
    store.addRound(
      [
        { playerId: alice.id, handTotal: 5 },
        { playerId: bob.id, handTotal: 20 },
        { playerId: charlie.id, handTotal: 15 },
      ],
      alice.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    expect(updatedGame.players.find(p => p.id === alice.id)!.cumulativeScore).toBe(0);
    expect(updatedGame.players.find(p => p.id === bob.id)!.cumulativeScore).toBe(20);
    expect(updatedGame.players.find(p => p.id === charlie.id)!.cumulativeScore).toBe(15);
  });

  it('correctly marks round as not False Yaniv', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], defaultRules);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    store.addRound(
      [
        { playerId: alice.id, handTotal: 5 },
        { playerId: bob.id, handTotal: 10 },
      ],
      alice.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    expect(updatedGame.rounds[0].isFalseYaniv).toBe(false);
  });
});

describe('False Yaniv Detection', () => {
  it('detects False Yaniv when another player has lower hand', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], defaultRules);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    // Alice calls Yaniv with 5, but Bob has 3 (lower!)
    store.addRound(
      [
        { playerId: alice.id, handTotal: 5 },
        { playerId: bob.id, handTotal: 3 },
      ],
      alice.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    expect(updatedGame.rounds[0].isFalseYaniv).toBe(true);
  });

  it('detects False Yaniv when another player has equal hand', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], defaultRules);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    // Alice calls Yaniv with 5, Bob also has 5 (equal!)
    store.addRound(
      [
        { playerId: alice.id, handTotal: 5 },
        { playerId: bob.id, handTotal: 5 },
      ],
      alice.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    expect(updatedGame.rounds[0].isFalseYaniv).toBe(true);
  });

  it('applies penalty to False Yaniv caller', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], defaultRules);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    // Alice calls Yaniv with 5, but Bob has 3
    store.addRound(
      [
        { playerId: alice.id, handTotal: 5 },
        { playerId: bob.id, handTotal: 3 },
      ],
      alice.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    // Alice gets 25 point penalty
    expect(updatedGame.players.find(p => p.id === alice.id)!.cumulativeScore).toBe(25);
    // Bob gets 0 (winner of False Yaniv)
    expect(updatedGame.players.find(p => p.id === bob.id)!.cumulativeScore).toBe(0);
  });

  it('bystanders score 0 by default during False Yaniv', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob', 'Charlie'], defaultRules);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob, charlie] = game.players;

    // Alice calls Yaniv with 5, Bob has 3 (wins), Charlie has 20 (bystander)
    store.addRound(
      [
        { playerId: alice.id, handTotal: 5 },
        { playerId: bob.id, handTotal: 3 },
        { playerId: charlie.id, handTotal: 20 },
      ],
      alice.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    // Charlie is a bystander - default rule is they score 0
    expect(updatedGame.players.find(p => p.id === charlie.id)!.cumulativeScore).toBe(0);
  });

  it('bystanders score their hand when rule enabled', () => {
    const rulesWithBystanders: HouseRules = {
      ...defaultRules,
      bystandersScoreOnFalseYaniv: true,
    };

    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob', 'Charlie'], rulesWithBystanders);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob, charlie] = game.players;

    store.addRound(
      [
        { playerId: alice.id, handTotal: 5 },
        { playerId: bob.id, handTotal: 3 },
        { playerId: charlie.id, handTotal: 20 },
      ],
      alice.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    // Charlie scores their hand (20)
    expect(updatedGame.players.find(p => p.id === charlie.id)!.cumulativeScore).toBe(20);
  });
});

describe('Bonus Calculation (Multiples of 50)', () => {
  it('applies -25 bonus when hitting exactly 50', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], defaultRules);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    // Bob calls Yaniv, Alice gets 50 points
    store.addRound(
      [
        { playerId: alice.id, handTotal: 50 },
        { playerId: bob.id, handTotal: 5 },
      ],
      bob.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    // Alice hit 50, gets -25 bonus, ends up at 25
    expect(updatedGame.players.find(p => p.id === alice.id)!.cumulativeScore).toBe(25);
  });

  it('applies divide by 2 bonus when configured', () => {
    const rulesWithDivide: HouseRules = {
      ...defaultRules,
      bonusType: 'divide2',
    };

    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], rulesWithDivide);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    // Bob calls Yaniv, Alice gets 100 points (after accumulating)
    // First round: Alice gets 50
    store.addRound(
      [
        { playerId: alice.id, handTotal: 50 },
        { playerId: bob.id, handTotal: 5 },
      ],
      bob.id
    );

    // After bonus: 50 / 2 = 25
    let updatedGame = useGameStore.getState().currentGame!;
    expect(updatedGame.players.find(p => p.id === alice.id)!.cumulativeScore).toBe(25);

    // Second round: Alice gets 75 more, total 100
    store.addRound(
      [
        { playerId: alice.id, handTotal: 75 },
        { playerId: bob.id, handTotal: 5 },
      ],
      bob.id
    );

    // 25 + 75 = 100, divided by 2 = 50
    updatedGame = useGameStore.getState().currentGame!;
    expect(updatedGame.players.find(p => p.id === alice.id)!.cumulativeScore).toBe(50);
  });

  it('does not apply bonus when bonusType is none', () => {
    const rulesNoBonus: HouseRules = {
      ...defaultRules,
      bonusType: 'none',
    };

    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], rulesNoBonus);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    store.addRound(
      [
        { playerId: alice.id, handTotal: 50 },
        { playerId: bob.id, handTotal: 5 },
      ],
      bob.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    // No bonus applied, stays at 50
    expect(updatedGame.players.find(p => p.id === alice.id)!.cumulativeScore).toBe(50);
  });
});

describe('3-Win Streak Bonus', () => {
  it('applies -25 bonus after 3 consecutive Yaniv wins', () => {
    const rulesWithStreak: HouseRules = {
      ...defaultRules,
      winStreakBonus: true,
    };

    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], rulesWithStreak);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    // Alice wins 3 rounds in a row
    for (let i = 0; i < 3; i++) {
      store.addRound(
        [
          { playerId: alice.id, handTotal: 3 },
          { playerId: bob.id, handTotal: 20 },
        ],
        alice.id
      );
    }

    const updatedGame = useGameStore.getState().currentGame!;
    // Alice: 0 + 0 + 0 - 25 (streak bonus) = -25
    expect(updatedGame.players.find(p => p.id === alice.id)!.cumulativeScore).toBe(-25);
    // Bob: 20 + 20 + 20 = 60
    expect(updatedGame.players.find(p => p.id === bob.id)!.cumulativeScore).toBe(60);
  });

  it('does not apply streak bonus if streak is broken', () => {
    const rulesWithStreak: HouseRules = {
      ...defaultRules,
      winStreakBonus: true,
    };

    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], rulesWithStreak);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    // Alice wins 2, Bob wins 1, Alice wins 1 (no streak)
    store.addRound([{ playerId: alice.id, handTotal: 3 }, { playerId: bob.id, handTotal: 20 }], alice.id);
    store.addRound([{ playerId: alice.id, handTotal: 3 }, { playerId: bob.id, handTotal: 20 }], alice.id);
    store.addRound([{ playerId: alice.id, handTotal: 20 }, { playerId: bob.id, handTotal: 3 }], bob.id); // Bob wins
    store.addRound([{ playerId: alice.id, handTotal: 3 }, { playerId: bob.id, handTotal: 20 }], alice.id);

    const updatedGame = useGameStore.getState().currentGame!;
    // Alice: 0 + 0 + 20 + 0 = 20 (no streak bonus because Bob broke it)
    expect(updatedGame.players.find(p => p.id === alice.id)!.cumulativeScore).toBe(20);
  });
});

describe('Game End Detection', () => {
  it('ends game when player exceeds max score', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], { ...defaultRules, maxScore: 50 });

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    // Bob calls Yaniv, Alice gets 60 (exceeds 50)
    store.addRound(
      [
        { playerId: alice.id, handTotal: 60 },
        { playerId: bob.id, handTotal: 5 },
      ],
      bob.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    expect(updatedGame.gameEnded).toBe(true);
    expect(updatedGame.winnerId).toBe(bob.id);
  });

  it('does not end game when at exactly max score', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], { ...defaultRules, maxScore: 50 });

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    // Alice gets exactly 50, then -25 bonus = 25
    store.addRound(
      [
        { playerId: alice.id, handTotal: 50 },
        { playerId: bob.id, handTotal: 5 },
      ],
      bob.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    expect(updatedGame.gameEnded).toBe(false);
  });

  it('ends game after max rounds in fixed rounds mode', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], {
      ...defaultRules,
      endGameMode: 'numRounds',
      maxRounds: 3,
    });

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    // Play 3 rounds
    for (let i = 0; i < 3; i++) {
      store.addRound(
        [
          { playerId: alice.id, handTotal: 10 },
          { playerId: bob.id, handTotal: 5 },
        ],
        bob.id
      );
    }

    const updatedGame = useGameStore.getState().currentGame!;
    expect(updatedGame.gameEnded).toBe(true);
    expect(updatedGame.rounds).toHaveLength(3);
  });

  it('declares winner with lowest score', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob', 'Charlie'], { ...defaultRules, maxScore: 50 });

    const game = useGameStore.getState().currentGame!;
    const [alice, bob, charlie] = game.players;

    // Charlie calls Yaniv, Alice gets 60 (bust), Bob has 30
    store.addRound(
      [
        { playerId: alice.id, handTotal: 60 },
        { playerId: bob.id, handTotal: 30 },
        { playerId: charlie.id, handTotal: 5 },
      ],
      charlie.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    expect(updatedGame.gameEnded).toBe(true);
    // Charlie has 0, lowest score, should be winner
    expect(updatedGame.winnerId).toBe(charlie.id);
  });
});

describe('Edge Cases', () => {
  it('handles zero hand totals correctly', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob'], defaultRules);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob] = game.players;

    // Alice calls Yaniv with 0
    store.addRound(
      [
        { playerId: alice.id, handTotal: 0 },
        { playerId: bob.id, handTotal: 10 },
      ],
      alice.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    expect(updatedGame.players.find(p => p.id === alice.id)!.cumulativeScore).toBe(0);
    expect(updatedGame.rounds[0].isFalseYaniv).toBe(false);
  });

  it('multiple players can tie for False Yaniv victim', () => {
    const store = useGameStore.getState();
    store.createGame(['Alice', 'Bob', 'Charlie'], defaultRules);

    const game = useGameStore.getState().currentGame!;
    const [alice, bob, charlie] = game.players;

    // Alice calls Yaniv with 5, both Bob and Charlie have 3
    store.addRound(
      [
        { playerId: alice.id, handTotal: 5 },
        { playerId: bob.id, handTotal: 3 },
        { playerId: charlie.id, handTotal: 3 },
      ],
      alice.id
    );

    const updatedGame = useGameStore.getState().currentGame!;
    expect(updatedGame.rounds[0].isFalseYaniv).toBe(true);
    expect(updatedGame.rounds[0].falseYanivVictimIds).toContain(bob.id);
    expect(updatedGame.rounds[0].falseYanivVictimIds).toContain(charlie.id);
    // Both Bob and Charlie score 0
    expect(updatedGame.players.find(p => p.id === bob.id)!.cumulativeScore).toBe(0);
    expect(updatedGame.players.find(p => p.id === charlie.id)!.cumulativeScore).toBe(0);
  });
});
