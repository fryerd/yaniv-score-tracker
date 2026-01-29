// House rules configuration
export interface HouseRules {
  falseYanivPenalty: number;     // Default: 25
  bystandersScoreOnFalseYaniv: boolean;  // Default: false
  bonusType: 'subtract25' | 'divide2' | 'none';  // Default: 'subtract25'
  winStreakBonus: boolean;       // Default: false - 3 consecutive Yaniv wins = -25
  endGameMode: 'highScore' | 'numRounds';  // Default: 'highScore'
  maxScore: number;              // Default: 150 (used when endGameMode is 'highScore')
  maxRounds: number;             // Default: 10 (used when endGameMode is 'numRounds')
}

// Player in the game
export interface Player {
  id: string;
  name: string;
  cumulativeScore: number;       // Running total
  color: string;                 // Avatar color
}

// Individual round data
export interface Round {
  roundNumber: number;
  playerHands: {
    playerId: string;
    handTotal: number;           // 0-50+ points
  }[];
  yanivCallerId: string;         // Who called Yaniv
  isFalseYaniv: boolean;         // Auto-detected
  falseYanivVictimIds?: string[]; // Players with equal/lower score
  scoresAdded: {
    playerId: string;
    pointsAdded: number;         // Could be 0, hand total, or penalty
    bonusApplied?: boolean;      // Did they hit multiple of 50?
    bonusAmount?: number;        // -25 or ÷2
    streakBonusApplied?: boolean; // Did they get 3-win streak bonus?
    finalScore: number;          // Score after this round
  }[];
}

// Complete game state
export interface GameState {
  id: string;
  houseRules: HouseRules;
  players: Player[];
  rounds: Round[];
  gameEnded: boolean;
  winnerId?: string;
  createdAt: string;
}
