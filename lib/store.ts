import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, HouseRules, Player, Round } from '@/types/game';

// Avatar colors palette
export const AVATAR_COLORS = [
  '#3B82F6', // blue
  '#14B8A6', // teal
  '#A855F7', // purple
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // emerald
  '#EF4444', // red
  '#8B5CF6', // violet
];

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Get initials from name
export function getInitials(name: string): string {
  const words = name.trim().split(' ').filter(w => w.length > 0);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Get first name only
export function getFirstName(name: string): string {
  const words = name.trim().split(' ').filter(w => w.length > 0);
  return words[0] || name;
}

interface GameStore {
  // Current game state
  currentGame: GameState | null;

  // Actions
  createGame: (playerNames: string[], houseRules: HouseRules) => void;
  addRound: (playerHands: { playerId: string; handTotal: number }[], yanivCallerId: string) => void;
  endGame: () => void;
  resetGame: () => void;

  // Computed helpers
  getPlayerById: (id: string) => Player | undefined;
  getRoundWinner: (round: Round) => string | null;
  getLeader: () => Player | null;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentGame: null,

      createGame: (playerNames: string[], houseRules: HouseRules) => {
        const players: Player[] = playerNames.map((name, index) => ({
          id: generateId(),
          name,
          cumulativeScore: 0,
          color: AVATAR_COLORS[index % AVATAR_COLORS.length],
        }));

        const game: GameState = {
          id: generateId(),
          houseRules,
          players,
          rounds: [],
          gameEnded: false,
          createdAt: new Date().toISOString(),
        };

        set({ currentGame: game });
      },

      addRound: (playerHands, yanivCallerId) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const roundNumber = currentGame.rounds.length + 1;
        const { houseRules, players, rounds } = currentGame;

        // Find Yaniv caller's hand total
        const callerHand = playerHands.find(h => h.playerId === yanivCallerId);
        if (!callerHand) return;

        // Find players with equal or lower hand total (False Yaniv detection)
        const equalOrLower = playerHands.filter(
          h => h.playerId !== yanivCallerId && h.handTotal <= callerHand.handTotal
        );

        const isFalseYaniv = equalOrLower.length > 0;
        const falseYanivVictimIds = equalOrLower.map(h => h.playerId);

        // Check for 3-win streak bonus (caller won last 2 rounds + this one makes 3)
        let hasWinStreak = false;
        if (houseRules.winStreakBonus && !isFalseYaniv) {
          // Count consecutive Yaniv wins for the caller (looking backwards)
          let consecutiveWins = 0;
          for (let i = rounds.length - 1; i >= 0; i--) {
            const prevRound = rounds[i];
            // Check if caller won this round (was yanivCallerId and no False Yaniv)
            if (prevRound.yanivCallerId === yanivCallerId && !prevRound.isFalseYaniv) {
              consecutiveWins++;
            } else {
              break; // Streak broken
            }
          }
          // If they won the last 2 rounds, this will be their 3rd consecutive win
          hasWinStreak = consecutiveWins >= 2;
        }

        // Calculate scores for each player
        const scoresAdded: Round['scoresAdded'] = [];

        for (const player of players) {
          const hand = playerHands.find(h => h.playerId === player.id);
          if (!hand) continue;

          let pointsAdded = 0;
          let reason: string = 'hand-total';

          if (isFalseYaniv) {
            // FALSE YANIV SCENARIO
            if (player.id === yanivCallerId) {
              // Yaniv caller gets penalty
              pointsAdded = houseRules.falseYanivPenalty;
              reason = 'false-yaniv-penalty';
            } else if (falseYanivVictimIds.includes(player.id)) {
              // Players with equal/lower score get 0 (they win)
              pointsAdded = 0;
              reason = 'false-yaniv-winner';
            } else {
              // Bystanders: depends on house rules
              pointsAdded = houseRules.bystandersScoreOnFalseYaniv ? hand.handTotal : 0;
              reason = 'bystander';
            }
          } else {
            // NORMAL YANIV SCENARIO
            if (player.id === yanivCallerId) {
              // Caller wins, gets 0
              pointsAdded = 0;
              reason = 'yaniv-winner';
            } else {
              // Everyone else adds their hand total
              pointsAdded = hand.handTotal;
              reason = 'hand-total';
            }
          }

          // Calculate new score and check for bonus
          const oldScore = player.cumulativeScore;
          let newScore = oldScore + pointsAdded;
          let bonusApplied = false;
          let bonusAmount = 0;
          let streakBonusApplied = false;

          // Check if hit multiple of 50 (bonus trigger)
          if (newScore > 0 && newScore % 50 === 0 && houseRules.bonusType !== 'none') {
            bonusApplied = true;
            if (houseRules.bonusType === 'subtract25') {
              bonusAmount = -25;
              newScore = newScore - 25;
            } else if (houseRules.bonusType === 'divide2') {
              bonusAmount = -(newScore / 2);
              newScore = newScore / 2;
            }
          }

          // Apply 3-win streak bonus to the Yaniv caller
          if (player.id === yanivCallerId && hasWinStreak) {
            streakBonusApplied = true;
            newScore = newScore - 25;
          }

          scoresAdded.push({
            playerId: player.id,
            pointsAdded,
            bonusApplied,
            bonusAmount,
            streakBonusApplied,
            finalScore: newScore,
          });
        }

        // Create the round
        const round: Round = {
          roundNumber,
          playerHands,
          yanivCallerId,
          isFalseYaniv,
          falseYanivVictimIds,
          scoresAdded,
        };

        // Update player cumulative scores
        const updatedPlayers = players.map(player => {
          const scoreEntry = scoresAdded.find(s => s.playerId === player.id);
          return {
            ...player,
            cumulativeScore: scoreEntry?.finalScore ?? player.cumulativeScore,
          };
        });

        // Check if game ended
        let gameEnded = false;
        let winnerId: string | undefined;

        if (houseRules.endGameMode === 'highScore') {
          // Game ends when any player exceeds max score
          const loser = updatedPlayers.find(p => p.cumulativeScore > houseRules.maxScore);
          if (loser) {
            gameEnded = true;
            // Winner is player with lowest score
            const sortedPlayers = [...updatedPlayers].sort((a, b) => a.cumulativeScore - b.cumulativeScore);
            winnerId = sortedPlayers[0].id;
          }
        } else if (houseRules.endGameMode === 'numRounds') {
          // Game ends after max rounds
          if (roundNumber >= houseRules.maxRounds) {
            gameEnded = true;
            // Winner is player with lowest score
            const sortedPlayers = [...updatedPlayers].sort((a, b) => a.cumulativeScore - b.cumulativeScore);
            winnerId = sortedPlayers[0].id;
          }
        }

        set({
          currentGame: {
            ...currentGame,
            players: updatedPlayers,
            rounds: [...currentGame.rounds, round],
            gameEnded,
            winnerId,
          },
        });
      },

      endGame: () => {
        const { currentGame } = get();
        if (!currentGame) return;

        const sortedPlayers = [...currentGame.players].sort((a, b) => a.cumulativeScore - b.cumulativeScore);

        set({
          currentGame: {
            ...currentGame,
            gameEnded: true,
            winnerId: sortedPlayers[0].id,
          },
        });
      },

      resetGame: () => {
        set({ currentGame: null });
      },

      getPlayerById: (id: string) => {
        const { currentGame } = get();
        return currentGame?.players.find(p => p.id === id);
      },

      getRoundWinner: (round: Round) => {
        // Winner is the player who scored 0 (either Yaniv caller or False Yaniv victim)
        const winner = round.scoresAdded.find(
          s => s.pointsAdded === 0 &&
          (round.yanivCallerId === s.playerId || round.falseYanivVictimIds?.includes(s.playerId))
        );
        return winner?.playerId ?? null;
      },

      getLeader: () => {
        const { currentGame } = get();
        if (!currentGame || currentGame.players.length === 0) return null;

        return [...currentGame.players].sort((a, b) => a.cumulativeScore - b.cumulativeScore)[0];
      },
    }),
    {
      name: 'yaniv-current-game',
    }
  )
);
