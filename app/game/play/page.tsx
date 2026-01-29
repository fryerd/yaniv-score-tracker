'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGameStore, getInitials, getFirstName } from '@/lib/store';

export default function GamePlayPage() {
  const router = useRouter();
  const { currentGame, addRound, resetGame } = useGameStore();

  // Score input modal state
  const [isInputting, setIsInputting] = useState(false);
  const [inputStep, setInputStep] = useState<'selectYaniv' | 'enterScores'>('selectYaniv');
  const [yanivCallerId, setYanivCallerId] = useState<string | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [roundScores, setRoundScores] = useState<{ [playerId: string]: number }>({});
  const [inputValue, setInputValue] = useState('');
  const [isNegative, setIsNegative] = useState(false);

  // Animation states
  const [showRawScores, setShowRawScores] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'enter' | 'exit' | null>(null);
  const [animatingRoundIndex, setAnimatingRoundIndex] = useState<number | null>(null);
  const [animatedScores, setAnimatedScores] = useState<{ [playerId: string]: number }>({});
  const [animatedTotals, setAnimatedTotals] = useState<{ [playerId: string]: number }>({});
  const [showYanivWarning, setShowYanivWarning] = useState(false);
  const [showHighScoreWarning, setShowHighScoreWarning] = useState(false);

  // State for showing hand scores when tapping a round
  const [showingHandScoresForRound, setShowingHandScoresForRound] = useState<number | null>(null);

  // Post-game states
  const [postGamePhase, setPostGamePhase] = useState<'confirmation' | 'podium' | 'results' | null>(null);
  const [podiumStep, setPodiumStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [previewingHighlightRound, setPreviewingHighlightRound] = useState<number | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  // Redirect if no game - go to homepage, not /game/new
  useEffect(() => {
    if (!currentGame) {
      router.push('/');
    }
  }, [currentGame, router]);

  // Track if game just ended (for triggering post-game flow)
  const [hasShownEndConfirmation, setHasShownEndConfirmation] = useState(false);

  useEffect(() => {
    if (currentGame?.gameEnded && !hasShownEndConfirmation && !postGamePhase) {
      // Delay showing confirmation until after score animations complete
      const timer = setTimeout(() => {
        setPostGamePhase('confirmation');
        setHasShownEndConfirmation(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentGame?.gameEnded, hasShownEndConfirmation, postGamePhase]);

  if (!currentGame) {
    return null;
  }

  const { players, rounds, houseRules, gameEnded, winnerId } = currentGame;
  const currentRoundNumber = rounds.length + 1;

  // Start inputting scores for a new round
  const handleStartInput = () => {
    setRoundScores({});
    setYanivCallerId(null);
    setInputStep('selectYaniv');
    setCurrentPlayerIndex(0);
    setInputValue('');
    setIsNegative(false);
    setIsInputting(true);
    setSlideDirection(null);
  };

  // Handle selecting who called Yaniv
  const handleSelectYaniv = (playerId: string) => {
    setYanivCallerId(playerId);
    setInputStep('enterScores');
    setCurrentPlayerIndex(0);
    setSlideDirection('enter');
  };

  // Get player input order - Yaniv caller first, then rest in order
  const getPlayerInputOrder = () => {
    if (!yanivCallerId) return players;
    const callerIndex = players.findIndex(p => p.id === yanivCallerId);
    if (callerIndex === -1) return players;
    // Rotate array so caller is first
    return [...players.slice(callerIndex), ...players.slice(0, callerIndex)];
  };

  const playerInputOrder = getPlayerInputOrder();

  // Handle number input
  const handleNumberInput = (num: string) => {
    if (inputValue.length < 2) {
      setInputValue(inputValue + num);
    }
  };

  const handleBackspace = () => {
    setInputValue(inputValue.slice(0, -1));
  };

  const handleClear = () => {
    setInputValue('');
    setIsNegative(false);
  };

  const handleToggleNegative = () => {
    setIsNegative(!isNegative);
  };

  // Submit current player's score and move to next
  const handleSubmitPlayerScore = (confirmedWarning = false) => {
    const currentPlayer = playerInputOrder[currentPlayerIndex];
    const rawValue = parseInt(inputValue) || 0;
    const score = isNegative ? -rawValue : rawValue;

    // Check if this is the Yaniv caller (first player) and their score is > 5
    if (currentPlayerIndex === 0 && score > 5 && !confirmedWarning) {
      setShowYanivWarning(true);
      return;
    }

    // Check if score is unusually high (> 30) for any player
    if (score > 30 && !confirmedWarning) {
      setShowHighScoreWarning(true);
      return;
    }

    setShowYanivWarning(false);
    setShowHighScoreWarning(false);
    const newScores = { ...roundScores, [currentPlayer.id]: score };
    setRoundScores(newScores);

    if (currentPlayerIndex < playerInputOrder.length - 1) {
      // Move to next player with animation (exit left, enter from right)
      setSlideDirection('exit');
      setTimeout(() => {
        setCurrentPlayerIndex(currentPlayerIndex + 1);
        setInputValue('');
        setIsNegative(false);
        setSlideDirection('enter');
      }, 400);
    } else {
      // All scores entered, show raw scores briefly then close
      setShowRawScores(true);

      setTimeout(() => {
        // Use the yanivCallerId that was already selected
        if (yanivCallerId) {
          const playerHands = Object.entries(newScores).map(([playerId, handTotal]) => ({
            playerId,
            handTotal,
          }));

          // Store old totals before adding round
          const oldTotals: { [id: string]: number } = {};
          players.forEach(p => {
            oldTotals[p.id] = p.cumulativeScore;
          });

          addRound(playerHands, yanivCallerId);

          // Close modal and start counter animation
          setShowRawScores(false);
          setIsInputting(false);

          // Set the round we're animating (will be the new last round)
          setAnimatingRoundIndex(rounds.length); // This will be the index of the new round

          // Initialize animated scores at 0
          const initialScores: { [id: string]: number } = {};
          players.forEach(p => {
            initialScores[p.id] = 0;
          });
          setAnimatedScores(initialScores);
          setAnimatedTotals(oldTotals);

          // Animate round scores counting up - STAGGERED by player
          const baseDuration = 600;
          const staggerDelay = 150; // Each player starts 150ms after previous
          const steps = 15;
          const stepTime = baseDuration / steps;

          // Start staggered animations for each player
          players.forEach((player, playerIndex) => {
            const delay = playerIndex * staggerDelay;

            setTimeout(() => {
              let step = 0;
              const targetScore = newScores[player.id] ?? 0;

              const playerInterval = setInterval(() => {
                step++;
                const progress = step / steps;

                setAnimatedScores(prev => ({
                  ...prev,
                  [player.id]: Math.round(targetScore * progress),
                }));

                if (step >= steps) {
                  clearInterval(playerInterval);
                  setAnimatedScores(prev => ({
                    ...prev,
                    [player.id]: targetScore,
                  }));

                  // If this is the last player, start total animations
                  if (playerIndex === players.length - 1) {
                    // All round scores done, now animate totals with stagger
                    setTimeout(() => {
                      players.forEach((p, idx) => {
                        setTimeout(() => {
                          let totalStep = 0;
                          const totalInterval = setInterval(() => {
                            totalStep++;
                            const totalProgress = totalStep / steps;
                            const oldTotal = oldTotals[p.id] ?? 0;
                            const scoreAdded = newScores[p.id] ?? 0;
                            const newTotal = oldTotal + scoreAdded;

                            setAnimatedTotals(prev => ({
                              ...prev,
                              [p.id]: Math.round(oldTotal + (newTotal - oldTotal) * totalProgress),
                            }));

                            if (totalStep >= steps) {
                              clearInterval(totalInterval);

                              // If last player's total animation done, end animation state
                              if (idx === players.length - 1) {
                                setAnimatingRoundIndex(null);
                              }
                            }
                          }, stepTime);
                        }, idx * staggerDelay);
                      });
                    }, 200);
                  }
                }
              }, stepTime);
            }, delay);
          });
        }
      }, 1200);
    }
  };

  // Get round winner - in False Yaniv, it's the victim(s); in normal Yaniv, it's the caller
  const getRoundWinnerId = (round: typeof rounds[0]) => {
    if (round.isFalseYaniv && round.falseYanivVictimIds?.length) {
      // In False Yaniv, the victim(s) with lower/equal hand win
      return round.falseYanivVictimIds[0];
    }
    // In normal Yaniv, the caller wins
    return round.yanivCallerId;
  };

  // Get hand score (what they actually had) for player in round
  const getHandScore = (round: typeof rounds[0], playerId: string) => {
    return round.playerHands.find(h => h.playerId === playerId)?.handTotal ?? 0;
  };

  // Handle tapping a round row to show hand scores
  const handleRoundTap = (roundIndex: number) => {
    if (showingHandScoresForRound === roundIndex) {
      setShowingHandScoresForRound(null);
    } else {
      setShowingHandScoresForRound(roundIndex);
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setShowingHandScoresForRound(null);
      }, 2000);
    }
  };

  // Check if round had False Yaniv
  const hasFalseYaniv = (round: typeof rounds[0]) => round.isFalseYaniv;

  // Check if player got bonus in round
  const hasBonus = (round: typeof rounds[0], playerId: string) => {
    return round.scoresAdded.find(s => s.playerId === playerId)?.bonusApplied;
  };

  // Check if player got streak bonus in round
  const hasStreakBonus = (round: typeof rounds[0], playerId: string) => {
    return round.scoresAdded.find(s => s.playerId === playerId)?.streakBonusApplied;
  };

  // Get score for player in round
  const getRoundScore = (round: typeof rounds[0], playerId: string) => {
    return round.scoresAdded.find(s => s.playerId === playerId)?.pointsAdded ?? 0;
  };

  // Get leader and last place players (only when game has rounds)
  const getLeaderId = () => {
    if (players.length === 0) return null;
    const sorted = [...players].sort((a, b) => a.cumulativeScore - b.cumulativeScore);
    return sorted[0].id;
  };

  const getLastPlaceId = () => {
    if (players.length === 0) return null;
    const sorted = [...players].sort((a, b) => b.cumulativeScore - a.cumulativeScore);
    // Only show last place if there's a meaningful difference
    if (sorted[0].cumulativeScore === sorted[sorted.length - 1].cumulativeScore) return null;
    return sorted[0].id;
  };

  const leaderId = rounds.length > 0 ? getLeaderId() : null;
  const lastPlaceId = rounds.length > 0 ? getLastPlaceId() : null;

  // Get sorted players by score (for podium)
  const getSortedPlayers = () => {
    return [...players].sort((a, b) => a.cumulativeScore - b.cumulativeScore);
  };

  // Compute game highlights/stats
  const getGameHighlights = () => {
    if (rounds.length === 0) return null;

    // Count Yaniv wins per player
    const yanivWins: { [id: string]: number } = {};
    const falseYanivs: { [id: string]: number } = {};
    const bonusCounts: { [id: string]: number } = {};

    players.forEach(p => {
      yanivWins[p.id] = 0;
      falseYanivs[p.id] = 0;
      bonusCounts[p.id] = 0;
    });

    let lowestHand = { playerId: '', score: Infinity, roundIndex: 0 };
    let worstHand = { playerId: '', score: -Infinity, roundIndex: 0 };
    let worstRound = { totalScore: -Infinity, roundIndex: 0 };
    let bestRound = { totalScore: Infinity, roundIndex: 0 };

    rounds.forEach((round, roundIndex) => {
      // Count Yaniv wins (successful, not false)
      if (!round.isFalseYaniv) {
        yanivWins[round.yanivCallerId] = (yanivWins[round.yanivCallerId] || 0) + 1;
      } else {
        // Count false Yanivs
        falseYanivs[round.yanivCallerId] = (falseYanivs[round.yanivCallerId] || 0) + 1;
      }

      // Count bonuses
      round.scoresAdded.forEach(s => {
        if (s.bonusApplied) {
          bonusCounts[s.playerId] = (bonusCounts[s.playerId] || 0) + 1;
        }
        if (s.streakBonusApplied) {
          bonusCounts[s.playerId] = (bonusCounts[s.playerId] || 0) + 1;
        }
      });

      // Find lowest and worst individual hands
      round.playerHands.forEach(hand => {
        if (hand.handTotal < lowestHand.score) {
          lowestHand = { playerId: hand.playerId, score: hand.handTotal, roundIndex };
        }
        if (hand.handTotal > worstHand.score) {
          worstHand = { playerId: hand.playerId, score: hand.handTotal, roundIndex };
        }
      });

      // Calculate round total (excluding Yaniv caller)
      const roundTotal = round.playerHands
        .filter(h => h.playerId !== round.yanivCallerId)
        .reduce((sum, h) => sum + h.handTotal, 0);

      if (roundTotal > worstRound.totalScore) {
        worstRound = { totalScore: roundTotal, roundIndex };
      }
      if (roundTotal < bestRound.totalScore) {
        bestRound = { totalScore: roundTotal, roundIndex };
      }
    });

    // Find player with most Yaniv wins
    const mostYanivs = Object.entries(yanivWins).reduce((best, [id, count]) =>
      count > best.count ? { playerId: id, count } : best, { playerId: '', count: 0 });

    // Find player with most false Yanivs
    const mostFalseYanivs = Object.entries(falseYanivs).reduce((best, [id, count]) =>
      count > best.count ? { playerId: id, count } : best, { playerId: '', count: 0 });

    // Find player with most bonuses
    const mostBonuses = Object.entries(bonusCounts).reduce((best, [id, count]) =>
      count > best.count ? { playerId: id, count } : best, { playerId: '', count: 0 });

    return {
      yanivWins,
      falseYanivs,
      mostYanivs,
      mostFalseYanivs,
      lowestHand,
      worstHand,
      worstRound,
      bestRound,
      mostBonuses,
    };
  };

  const highlights = getGameHighlights();

  // Handle starting podium animation
  const handleSeeResults = () => {
    setPostGamePhase('podium');
    setPodiumStep(0);

    const sortedPlayers = getSortedPlayers();
    const delays = sortedPlayers.length === 2
      ? [0, 800] // 2 players: just show winner
      : [0, 800, 1600]; // 3+ players: bronze, silver, gold

    // Animate podium steps
    delays.forEach((delay, index) => {
      setTimeout(() => {
        setPodiumStep(index + 1);
        // Show confetti on the last (winner) reveal
        if (index === delays.length - 1) {
          setTimeout(() => {
            setShowConfetti(true);
            // After confetti, show results
            setTimeout(() => {
              setShowConfetti(false);
              setPostGamePhase('results');
            }, 2000);
          }, 600);
        }
      }, delay);
    });
  };

  // Handle clicking a highlight to preview that round (use inline preview)
  const handleHighlightClick = (roundIndex: number) => {
    setPreviewingHighlightRound(roundIndex);
    setTimeout(() => setPreviewingHighlightRound(null), 5000);
  };

  // Handle share button
  const handleShare = async () => {
    const sortedPlayers = getSortedPlayers();
    const medals = ['🥇', '🥈', '🥉'];
    const lines = sortedPlayers.map((player, index) => {
      const medal = index < 3 ? medals[index] : '♥️';
      return `${medal} ${getFirstName(player.name)} - ${player.cumulativeScore}`;
    });
    const text = `Yaniv Game Results\n${lines.join('\n')}`;

    try {
      await navigator.clipboard.writeText(text);
      setShareMessage('Copied to clipboard!');
      setTimeout(() => setShareMessage(null), 2000);
    } catch {
      setShareMessage('Could not copy');
      setTimeout(() => setShareMessage(null), 2000);
    }
  };

  // Get loser name (player who busted)
  const getLoserInfo = () => {
    if (!gameEnded || houseRules.endGameMode !== 'highScore') return null;
    const loser = players.find(p => p.cumulativeScore > houseRules.maxScore);
    return loser ? getFirstName(loser.name) : null;
  };

  return (
    <div className="min-h-screen bg-[#0B3D2E] relative overflow-hidden">
      {/* Felt texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col p-4 max-w-lg mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (confirm('Leave game? Progress will be saved.')) {
                router.push('/');
              }
            }}
            className="text-[#E5B94A] text-sm font-body px-2 py-2 -mx-2 -my-2 rounded-lg hover:bg-[#E5B94A]/10 active:bg-[#E5B94A]/20 transition-colors"
          >
            ← Exit
          </Link>
          <span className="text-[#F4D68C]/60 text-sm font-body">
            {houseRules.endGameMode === 'highScore'
              ? `First to ${houseRules.maxScore}`
              : `Round ${rounds.length}/${houseRules.maxRounds}`}
          </span>
        </header>

        {/* Tally Screen */}
        <div
          className="flex-1 rounded-2xl p-4 mb-4"
          style={{
            background: 'linear-gradient(180deg, #0F5740 0%, #0B3D2E 100%)',
            border: '2px solid rgba(229, 185, 74, 0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {/* Player avatars header */}
          <div className="flex mb-2">
            <div className="w-10 flex-shrink-0" /> {/* Space for round labels */}
            {players.map((player) => {
              const isLeader = player.id === leaderId;
              const isLastPlace = player.id === lastPlaceId;

              return (
                <div key={player.id} className="flex-1 flex justify-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm font-body relative ${
                      isLeader ? 'animate-pulse-subtle' : ''
                    }`}
                    style={{
                      backgroundColor: player.color,
                      boxShadow: isLeader
                        ? `0 0 0 3px #10B981, 0 0 12px #10B98180, 0 2px 8px ${player.color}40`
                        : isLastPlace
                        ? `0 0 0 3px #EF4444, 0 2px 8px ${player.color}40`
                        : `0 2px 8px ${player.color}40`,
                    }}
                  >
                    {getInitials(player.name)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total row - always visible at top */}
          <div className="flex items-center pb-2 mb-2 border-b border-[#C9972D]/30">
            <div className="w-10 flex-shrink-0 text-[#F4D68C]/60 text-xs font-body">
              Tot.
            </div>
            {players.map((player) => {
              const displayScore = animatingRoundIndex !== null
                ? (animatedTotals[player.id] ?? player.cumulativeScore)
                : player.cumulativeScore;
              return (
                <div key={player.id} className="flex-1 flex justify-center">
                  <span className={`font-score text-lg font-semibold transition-all ${
                    animatingRoundIndex !== null ? 'text-[#E5B94A] scale-110' : 'text-[#F4D68C]'
                  }`}>
                    {displayScore}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rounds grid */}
          <div className="space-y-1 overflow-hidden flex-1 overflow-y-auto">
            {rounds.length === 0 && (
              <div className="text-center py-8 text-[#F4D68C]/40 text-sm font-body">
                Tap below to add first round
              </div>
            )}
            {rounds.map((round, roundIndex) => {
              const winnerId = getRoundWinnerId(round);
              const isFalse = hasFalseYaniv(round);
              const isAnimating = animatingRoundIndex === roundIndex;
              const showingHands = showingHandScoresForRound === roundIndex;

              return (
                <div
                  key={round.roundNumber}
                  onClick={() => !isAnimating && handleRoundTap(roundIndex)}
                  className={`flex items-center transition-all cursor-pointer rounded-lg py-1 hover:bg-[#F4D68C]/10 active:bg-[#E5B94A]/15 ${
                    isAnimating ? 'bg-[#E5B94A]/10' :
                    showingHands ? 'bg-[#3B82F6]/15' : ''
                  }`}
                >
                  <div className={`w-10 flex-shrink-0 text-xs font-body ${showingHands ? 'text-[#3B82F6]' : 'text-[#F4D68C]/50'}`}>
                    {showingHands ? 'Hand' : `R${round.roundNumber}`}
                  </div>
                  {players.map((player) => {
                    const actualScore = getRoundScore(round, player.id);
                    const handScore = getHandScore(round, player.id);
                    const displayScore = isAnimating
                      ? (animatedScores[player.id] ?? 0)
                      : showingHands
                      ? handScore
                      : actualScore;
                    const isWinner = winnerId === player.id;
                    const gotBonus = hasBonus(round, player.id);
                    const gotStreakBonus = hasStreakBonus(round, player.id);
                    const isFalseYanivCaller = isFalse && round.yanivCallerId === player.id;

                    return (
                      <div
                        key={player.id}
                        className="flex-1 flex justify-center items-center gap-1 transition-all"
                      >
                        <span className="min-w-[1rem] text-center">
                          {!showingHands && isWinner && (
                            <span className="text-xs text-[#F4D68C] inline-block animate-crown-float">♔</span>
                          )}
                          {!showingHands && isFalseYanivCaller && (
                            <span className="text-xs text-[#C41E3A]">✗</span>
                          )}
                          {!showingHands && gotBonus && (
                            <span className="text-xs text-[#10B981]">★</span>
                          )}
                          {!showingHands && gotStreakBonus && (
                            <span className="text-xs text-[#F59E0B]">🔥</span>
                          )}
                        </span>
                        <span
                          className={`font-score text-lg transition-all ${
                            showingHands
                              ? 'text-[#3B82F6] font-medium'
                              : isAnimating
                              ? 'text-[#E5B94A] font-bold'
                              : isWinner
                              ? 'text-[#E5B94A] font-bold'
                              : isFalseYanivCaller
                              ? 'text-[#C41E3A]'
                              : 'text-[#F5F0E1]'
                          }`}
                        >
                          {displayScore}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Game ended - show "See Results" button if not in post-game flow */}
        {gameEnded && !postGamePhase && (
          <button
            onClick={() => setPostGamePhase('confirmation')}
            className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:translate-y-[2px] hover:brightness-110 text-[#1A1A1A] tracking-wide font-body mb-4"
            style={{
              background: 'linear-gradient(180deg, #F4D68C 0%, #E5B94A 50%, #C9972D 100%)',
              boxShadow: '0 4px 0 #8B6914, 0 6px 12px rgba(0,0,0,0.3)',
            }}
          >
            See Results
          </button>
        )}

        {/* Add round button */}
        {!gameEnded && (
          <button
            onClick={handleStartInput}
            className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:translate-y-[2px] hover:brightness-110 text-[#F5F0E1] tracking-wide font-body"
            style={{
              background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 4px 0 #047857, 0 6px 12px rgba(0,0,0,0.25)',
            }}
          >
            Add Round {currentRoundNumber} Scores
          </button>
        )}
      </div>

      {/* Post-Game Modal */}
      {postGamePhase && (
        <div className="fixed inset-0 z-50 bg-[#0B3D2E]/95 flex flex-col animate-modal-enter backdrop-blur-sm overflow-y-auto">
          {/* Felt texture */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
            }}
          />

          <div className="relative z-10 flex-1 flex flex-col max-w-lg mx-auto w-full p-6">
            {/* Confirmation Phase */}
            {postGamePhase === 'confirmation' && (
              <div className="flex-1 flex flex-col animate-card-enter">
                {/* Cancel button */}
                <button
                  onClick={() => setPostGamePhase(null)}
                  className="text-[#F4D68C]/60 text-sm font-body px-2 py-2 -mx-2 -my-2 rounded-lg hover:bg-[#F4D68C]/10 active:bg-[#F4D68C]/20 transition-colors self-start mb-6"
                >
                  ← Cancel
                </button>

                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="text-5xl mb-6">🎴</div>
                  <h2 className="text-[#F4D68C] text-2xl font-display font-bold mb-4">
                    Game Ended
                  </h2>
                  <p className="text-[#F5F0E1]/80 text-lg font-body mb-2">
                    {getLoserInfo()
                      ? `${getLoserInfo()} passed ${houseRules.maxScore} points which ends the game.`
                      : `All ${houseRules.maxRounds} rounds complete!`}
                  </p>
                  <p className="text-[#F5F0E1]/60 text-sm font-body mb-10">
                    Click see results to see where everyone finished and game highlights.
                  </p>
                  <button
                    onClick={handleSeeResults}
                    className="px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:translate-y-[2px] hover:brightness-110 text-[#1A1A1A] tracking-wide font-body"
                    style={{
                      background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                      boxShadow: '0 4px 0 #047857, 0 6px 12px rgba(0,0,0,0.25)',
                      color: '#F5F0E1',
                    }}
                  >
                    See results
                  </button>
                </div>
              </div>
            )}

            {/* Podium Phase */}
            {postGamePhase === 'podium' && (
              <div className="flex-1 flex flex-col items-center justify-start pt-8">
                {/* Celebration effects - only when winner revealed */}
                {showConfetti && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Radial burst from center */}
                    <div
                      className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full animate-radial-burst"
                      style={{ background: 'radial-gradient(circle, rgba(229, 185, 74, 0.5) 0%, rgba(229, 185, 74, 0.2) 40%, transparent 70%)' }}
                    />
                    {/* Rotating rays behind podium */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 animate-rays-rotate opacity-20">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-1/2 left-1/2 w-0.5 h-32 origin-top"
                          style={{
                            background: 'linear-gradient(to bottom, #E5B94A, transparent)',
                            transform: `rotate(${i * 30}deg) translateX(-50%)`,
                          }}
                        />
                      ))}
                    </div>
                    {/* Floating particles */}
                    {[...Array(20)].map((_, i) => {
                      const angle = (i / 20) * 360;
                      const distance = 100 + Math.random() * 80;
                      const tx = Math.cos(angle * Math.PI / 180) * distance;
                      const ty = Math.sin(angle * Math.PI / 180) * distance - 50;
                      return (
                        <div
                          key={i}
                          className="absolute top-1/3 left-1/2 w-2 h-2 rounded-full"
                          style={{
                            background: ['#E5B94A', '#F4D68C', '#C9972D', '#FFD700'][i % 4],
                            boxShadow: `0 0 6px ${['#E5B94A', '#F4D68C', '#C9972D', '#FFD700'][i % 4]}`,
                            '--tx': `${tx}px`,
                            '--ty': `${ty}px`,
                            animation: `particle-float 1.5s ease-out forwards`,
                            animationDelay: `${i * 0.05}s`,
                          } as React.CSSProperties}
                        />
                      );
                    })}
                    {/* Twinkling sparkles */}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`sparkle-${i}`}
                        className="absolute animate-sparkle-twinkle"
                        style={{
                          top: `${20 + Math.random() * 30}%`,
                          left: `${25 + Math.random() * 50}%`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="#F4D68C"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                )}

                {/* Podium container - uses relative positioning with fixed layout */}
                <div className="relative w-full max-w-xs h-64 mt-12">
                  {(() => {
                    const sorted = getSortedPlayers();
                    const isTwoPlayers = sorted.length === 2;

                    if (isTwoPlayers) {
                      const winner = sorted[0];
                      return (
                        <>
                          {/* Gold - centered for 2 players */}
                          {podiumStep >= 1 && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                              {/* Avatar */}
                              <div
                                className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl font-body mb-3 animate-avatar-drop ${showConfetti ? 'animate-winner-glow' : ''}`}
                                style={{
                                  backgroundColor: winner.color,
                                  animationDelay: '0.3s',
                                }}
                              >
                                {getInitials(winner.name)}
                              </div>
                              {/* Plinth */}
                              <div
                                className={`w-28 h-36 rounded-t-xl flex flex-col items-center justify-start pt-4 animate-gold-plinth-rise ${showConfetti ? 'animate-winner-spotlight' : ''}`}
                                style={{
                                  background: 'linear-gradient(180deg, #F4D68C 0%, #E5B94A 40%, #C9972D 100%)',
                                  boxShadow: '0 -4px 20px rgba(229, 185, 74, 0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
                                }}
                              >
                                <span className="text-3xl drop-shadow-lg">🥇</span>
                                <span className="text-[#1A1A1A] font-bold text-sm font-body mt-2">{getFirstName(winner.name)}</span>
                                <span className="text-[#1A1A1A]/60 font-score text-lg">{winner.cumulativeScore}</span>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    }

                    // 3+ players - positioned podium
                    const [first, second, third] = sorted;
                    return (
                      <>
                        {/* Bronze (3rd) - RIGHT side, appears first */}
                        {podiumStep >= 1 && third && (
                          <div className="absolute bottom-0 right-4 flex flex-col items-center">
                            <div
                              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg font-body mb-2 animate-avatar-drop"
                              style={{
                                backgroundColor: third.color,
                                animationDelay: '0.25s',
                              }}
                            >
                              {getInitials(third.name)}
                            </div>
                            <div
                              className="w-20 h-20 rounded-t-lg flex flex-col items-center justify-start pt-2 animate-plinth-rise"
                              style={{
                                background: 'linear-gradient(180deg, #DDA15E 0%, #CD7F32 50%, #A0522D 100%)',
                                boxShadow: '0 -2px 12px rgba(205, 127, 50, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                              }}
                            >
                              <span className="text-xl">🥉</span>
                              <span className="text-white font-bold text-xs font-body truncate max-w-16 mt-0.5">{getFirstName(third.name)}</span>
                              <span className="text-white/70 font-score text-xs">{third.cumulativeScore}</span>
                            </div>
                          </div>
                        )}

                        {/* Silver (2nd) - LEFT side, appears second */}
                        {podiumStep >= 2 && second && (
                          <div className="absolute bottom-0 left-4 flex flex-col items-center">
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl font-body mb-2 animate-avatar-drop"
                              style={{
                                backgroundColor: second.color,
                                animationDelay: '0.25s',
                              }}
                            >
                              {getInitials(second.name)}
                            </div>
                            <div
                              className="w-24 h-28 rounded-t-lg flex flex-col items-center justify-start pt-3 animate-plinth-rise"
                              style={{
                                background: 'linear-gradient(180deg, #E8E8E8 0%, #C0C0C0 50%, #A0A0A0 100%)',
                                boxShadow: '0 -2px 16px rgba(192, 192, 192, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
                              }}
                            >
                              <span className="text-2xl">🥈</span>
                              <span className="text-[#1A1A1A] font-bold text-xs font-body mt-1 truncate max-w-20">{getFirstName(second.name)}</span>
                              <span className="text-[#1A1A1A]/60 font-score text-sm">{second.cumulativeScore}</span>
                            </div>
                          </div>
                        )}

                        {/* Gold (1st) - CENTER, appears last with fanfare */}
                        {podiumStep >= 3 && first && (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                            <div
                              className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl font-body mb-3 animate-avatar-drop ${showConfetti ? 'animate-winner-glow' : ''}`}
                              style={{
                                backgroundColor: first.color,
                                animationDelay: '0.35s',
                              }}
                            >
                              {getInitials(first.name)}
                            </div>
                            <div
                              className={`w-28 h-36 rounded-t-xl flex flex-col items-center justify-start pt-4 animate-gold-plinth-rise ${showConfetti ? 'animate-winner-spotlight' : ''}`}
                              style={{
                                background: 'linear-gradient(180deg, #F4D68C 0%, #E5B94A 40%, #C9972D 100%)',
                                boxShadow: '0 -4px 20px rgba(229, 185, 74, 0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
                              }}
                            >
                              <span className="text-3xl drop-shadow-lg">🥇</span>
                              <span className="text-[#1A1A1A] font-bold text-sm font-body mt-2">{getFirstName(first.name)}</span>
                              <span className="text-[#1A1A1A]/60 font-score text-lg">{first.cumulativeScore}</span>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* "Winner!" text that fades in */}
                {showConfetti && (
                  <div className="mt-8 animate-results-reveal" style={{ animationDelay: '0.5s' }}>
                    <h2 className="text-[#E5B94A] text-2xl font-display font-bold text-center tracking-wide">
                      🎉 Winner! 🎉
                    </h2>
                  </div>
                )}
              </div>
            )}

            {/* Results Phase */}
            {postGamePhase === 'results' && (
              <div className="flex-1 flex flex-col py-4 overflow-y-auto">
                {/* Mini podium at top */}
                <div
                  className="flex items-end justify-center gap-1 mb-5 animate-results-reveal"
                  style={{ animationDelay: '0s' }}
                >
                  {(() => {
                    const sorted = getSortedPlayers();
                    const isTwoPlayers = sorted.length === 2;

                    if (isTwoPlayers) {
                      const winner = sorted[0];
                      return (
                        <div className="flex flex-col items-center">
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg font-body mb-1 animate-winner-glow"
                            style={{ backgroundColor: winner.color }}
                          >
                            {getInitials(winner.name)}
                          </div>
                          <span className="text-xl">🥇</span>
                        </div>
                      );
                    }

                    const [first, second, third] = sorted;
                    return (
                      <>
                        {second && (
                          <div className="flex flex-col items-center">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm font-body mb-1"
                              style={{ backgroundColor: second.color }}
                            >
                              {getInitials(second.name)}
                            </div>
                            <div className="w-14 h-12 rounded-t-md flex items-start justify-center pt-1" style={{ background: 'linear-gradient(180deg, #E8E8E8 0%, #A0A0A0 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}>
                              <span className="text-sm">🥈</span>
                            </div>
                          </div>
                        )}
                        {first && (
                          <div className="flex flex-col items-center -mx-0.5">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base font-body mb-1 animate-winner-glow"
                              style={{ backgroundColor: first.color }}
                            >
                              {getInitials(first.name)}
                            </div>
                            <div className="w-16 h-16 rounded-t-md flex items-start justify-center pt-1" style={{ background: 'linear-gradient(180deg, #F4D68C 0%, #C9972D 100%)', boxShadow: '0 0 15px rgba(229, 185, 74, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
                              <span className="text-lg">🥇</span>
                            </div>
                          </div>
                        )}
                        {third && (
                          <div className="flex flex-col items-center">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs font-body mb-1"
                              style={{ backgroundColor: third.color }}
                            >
                              {getInitials(third.name)}
                            </div>
                            <div className="w-12 h-8 rounded-t-md flex items-start justify-center pt-0.5" style={{ background: 'linear-gradient(180deg, #DDA15E 0%, #A0522D 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                              <span className="text-xs">🥉</span>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                <h2
                  className="text-[#F4D68C] text-lg font-display font-bold text-center mb-4 animate-results-reveal"
                  style={{ animationDelay: '0.1s' }}
                >
                  Final Tally
                </h2>

                {/* Final standings table */}
                <div
                  className="rounded-xl p-4 mb-6 animate-results-reveal"
                  style={{
                    background: 'linear-gradient(180deg, #0F5740 0%, #0B3D2E 100%)',
                    border: '2px solid rgba(229, 185, 74, 0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    animationDelay: '0.15s',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center text-[#F4D68C]/60 text-xs font-body mb-3 pb-2 border-b border-[#C9972D]/20">
                    <div className="flex-1">Player</div>
                    <div className="w-12 text-center">👑</div>
                    <div className="w-12 text-center">☠️</div>
                    <div className="w-16 text-right">Tot.</div>
                  </div>

                  {/* Player rows */}
                  {getSortedPlayers().map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center py-2 animate-results-reveal"
                      style={{ animationDelay: `${0.25 + index * 0.08}s` }}
                    >
                      <div className="flex-1 flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm font-body ${index === 0 ? 'ring-2 ring-[#E5B94A]/50' : ''}`}
                          style={{ backgroundColor: player.color }}
                        >
                          {getInitials(player.name)}
                        </div>
                        <span className="text-[#F5F0E1] font-body">{getFirstName(player.name)}</span>
                      </div>
                      <div className="w-12 text-center text-[#10B981] font-score">
                        {highlights?.yanivWins[player.id] || 0}
                      </div>
                      <div className="w-12 text-center text-[#C41E3A] font-score">
                        {highlights?.falseYanivs[player.id] || 0}
                      </div>
                      <div className={`w-16 text-right font-score font-bold ${index === 0 ? 'text-[#E5B94A]' : 'text-[#F4D68C]'}`}>
                        {player.cumulativeScore}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Yan Highlights */}
                <div
                  className="flex items-center justify-center gap-2 mb-4 animate-results-reveal"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="flex-1 h-px bg-[#C9972D]/20" />
                  <span className="text-[#F4D68C]/60 text-sm font-body">Yan Highlights</span>
                  <span className="text-[#F4D68C]/40">▼</span>
                  <div className="flex-1 h-px bg-[#C9972D]/20" />
                </div>

                <div
                  className="rounded-xl p-4 space-y-3 animate-results-reveal"
                  style={{
                    background: 'linear-gradient(180deg, #0F5740 0%, #0B3D2E 100%)',
                    border: '2px solid rgba(229, 185, 74, 0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    animationDelay: '0.55s',
                  }}
                >
                  {highlights && (
                    <>
                      {/* Most Yans */}
                      {highlights.mostYanivs.count > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#F5F0E1]/70 font-body">Most Yans</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[#10B981] font-score font-bold">{highlights.mostYanivs.count}</span>
                            <span className="text-[#E5B94A] font-body">{getFirstName(players.find(p => p.id === highlights.mostYanivs.playerId)?.name || '')}</span>
                          </div>
                        </div>
                      )}

                      {/* False Yans */}
                      {highlights.mostFalseYanivs.count > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#F5F0E1]/70 font-body">False Yans</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[#C41E3A] font-score font-bold">{highlights.mostFalseYanivs.count}</span>
                            <span className="text-[#E5B94A] font-body">{getFirstName(players.find(p => p.id === highlights.mostFalseYanivs.playerId)?.name || '')}</span>
                          </div>
                        </div>
                      )}

                      {/* Lowest hand */}
                      <div className="space-y-2">
                        <div
                          className={`flex items-center justify-between cursor-pointer -mx-2 px-2 py-1 rounded-lg transition-colors ${
                            previewingHighlightRound === highlights.lowestHand.roundIndex ? 'bg-[#3B82F6]/15' : 'hover:bg-[#F4D68C]/10'
                          }`}
                          onClick={() => handleHighlightClick(highlights.lowestHand.roundIndex)}
                        >
                          <span className="text-[#F5F0E1]/70 font-body">Lowest hand</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[#10B981] font-score font-bold">{highlights.lowestHand.score}</span>
                            <span className="text-[#E5B94A] font-body">{getFirstName(players.find(p => p.id === highlights.lowestHand.playerId)?.name || '')}</span>
                          </div>
                        </div>
                        {previewingHighlightRound === highlights.lowestHand.roundIndex && (
                          <div className="flex items-center gap-2 py-2 px-2 -mx-2 bg-[#3B82F6]/10 rounded-lg animate-card-enter">
                            <span className="text-[#3B82F6] text-xs font-body w-8">R{highlights.lowestHand.roundIndex + 1}</span>
                            {players.map((player) => {
                              const handScore = rounds[highlights.lowestHand.roundIndex]?.playerHands.find(h => h.playerId === player.id)?.handTotal ?? 0;
                              return (
                                <div key={player.id} className="flex-1 text-center">
                                  <span className="text-[#3B82F6] font-score text-sm">{handScore}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Worst hand */}
                      <div className="space-y-2">
                        <div
                          className={`flex items-center justify-between cursor-pointer -mx-2 px-2 py-1 rounded-lg transition-colors ${
                            previewingHighlightRound === highlights.worstHand.roundIndex ? 'bg-[#3B82F6]/15' : 'hover:bg-[#F4D68C]/10'
                          }`}
                          onClick={() => handleHighlightClick(highlights.worstHand.roundIndex)}
                        >
                          <span className="text-[#F5F0E1]/70 font-body">Worst hand</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[#C41E3A] font-score font-bold">{highlights.worstHand.score}</span>
                            <span className="text-[#E5B94A] font-body">{getFirstName(players.find(p => p.id === highlights.worstHand.playerId)?.name || '')}</span>
                          </div>
                        </div>
                        {previewingHighlightRound === highlights.worstHand.roundIndex && (
                          <div className="flex items-center gap-2 py-2 px-2 -mx-2 bg-[#3B82F6]/10 rounded-lg animate-card-enter">
                            <span className="text-[#3B82F6] text-xs font-body w-8">R{highlights.worstHand.roundIndex + 1}</span>
                            {players.map((player) => {
                              const handScore = rounds[highlights.worstHand.roundIndex]?.playerHands.find(h => h.playerId === player.id)?.handTotal ?? 0;
                              return (
                                <div key={player.id} className="flex-1 text-center">
                                  <span className="text-[#3B82F6] font-score text-sm">{handScore}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Worst round */}
                      <div className="space-y-2">
                        <div
                          className={`flex items-center justify-between cursor-pointer -mx-2 px-2 py-1 rounded-lg transition-colors ${
                            previewingHighlightRound === highlights.worstRound.roundIndex ? 'bg-[#3B82F6]/15' : 'hover:bg-[#F4D68C]/10'
                          }`}
                          onClick={() => handleHighlightClick(highlights.worstRound.roundIndex)}
                        >
                          <span className="text-[#F5F0E1]/70 font-body">Worst round</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[#C41E3A] font-score font-bold">{highlights.worstRound.totalScore}</span>
                            <span className="text-[#E5B94A] font-body">R{highlights.worstRound.roundIndex + 1}</span>
                          </div>
                        </div>
                        {previewingHighlightRound === highlights.worstRound.roundIndex && (
                          <div className="flex items-center gap-2 py-2 px-2 -mx-2 bg-[#3B82F6]/10 rounded-lg animate-card-enter">
                            <span className="text-[#3B82F6] text-xs font-body w-8">R{highlights.worstRound.roundIndex + 1}</span>
                            {players.map((player) => {
                              const handScore = rounds[highlights.worstRound.roundIndex]?.playerHands.find(h => h.playerId === player.id)?.handTotal ?? 0;
                              return (
                                <div key={player.id} className="flex-1 text-center">
                                  <span className="text-[#3B82F6] font-score text-sm">{handScore}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Best round */}
                      <div className="space-y-2">
                        <div
                          className={`flex items-center justify-between cursor-pointer -mx-2 px-2 py-1 rounded-lg transition-colors ${
                            previewingHighlightRound === highlights.bestRound.roundIndex ? 'bg-[#3B82F6]/15' : 'hover:bg-[#F4D68C]/10'
                          }`}
                          onClick={() => handleHighlightClick(highlights.bestRound.roundIndex)}
                        >
                          <span className="text-[#F5F0E1]/70 font-body">Best round</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[#10B981] font-score font-bold">{highlights.bestRound.totalScore}</span>
                            <span className="text-[#E5B94A] font-body">R{highlights.bestRound.roundIndex + 1}</span>
                          </div>
                        </div>
                        {previewingHighlightRound === highlights.bestRound.roundIndex && (
                          <div className="flex items-center gap-2 py-2 px-2 -mx-2 bg-[#3B82F6]/10 rounded-lg animate-card-enter">
                            <span className="text-[#3B82F6] text-xs font-body w-8">R{highlights.bestRound.roundIndex + 1}</span>
                            {players.map((player) => {
                              const handScore = rounds[highlights.bestRound.roundIndex]?.playerHands.find(h => h.playerId === player.id)?.handTotal ?? 0;
                              return (
                                <div key={player.id} className="flex-1 text-center">
                                  <span className="text-[#3B82F6] font-score text-sm">{handScore}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Most bonuses */}
                      {highlights.mostBonuses.count > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#F5F0E1]/70 font-body">Most Bonuses</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[#10B981] font-score font-bold">{highlights.mostBonuses.count}</span>
                            <span className="text-[#E5B94A] font-body">{getFirstName(players.find(p => p.id === highlights.mostBonuses.playerId)?.name || '')}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>


                {/* Share and New Game buttons */}
                <div
                  className="mt-auto pt-6 space-y-3 animate-results-reveal"
                  style={{ animationDelay: '0.7s' }}
                >
                  <button
                    onClick={handleShare}
                    className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:translate-y-[2px] hover:brightness-110 text-[#F5F0E1] tracking-wide font-body"
                    style={{
                      background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
                      boxShadow: '0 4px 0 #047857, 0 6px 12px rgba(0,0,0,0.25)',
                    }}
                  >
                    {shareMessage || 'Share Results'}
                  </button>
                  <button
                    onClick={() => {
                      resetGame();
                      router.push('/game/new');
                    }}
                    className="w-full py-3 rounded-xl font-semibold text-base transition-all hover:bg-[#F4D68C]/10 text-[#F4D68C] font-body"
                  >
                    New Game
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Score Input Modal */}
      {isInputting && (
        <div className="fixed inset-0 z-50 bg-[#0B3D2E] flex flex-col animate-modal-enter">
          {/* Felt texture */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
            }}
          />

          {/* Raw scores display after all inputs */}
          {showRawScores && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B3D2E]/95">
              <div className="text-center animate-card-enter">
                <p className="text-[#F4D68C] text-lg mb-6 font-body">Round {currentRoundNumber} scores</p>
                <div className="flex justify-center gap-6">
                  {players.map((player) => (
                    <div key={player.id} className="text-center">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold font-body mx-auto mb-2"
                        style={{ backgroundColor: player.color }}
                      >
                        {getInitials(player.name)}
                      </div>
                      <span className="text-[#F5F0E1] font-score text-2xl">
                        {roundScores[player.id] ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Yaniv high score warning */}
          {showYanivWarning && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0B3D2E]/95 animate-modal-enter backdrop-blur-sm">
              <div className="text-center animate-card-enter p-6 rounded-2xl max-w-xs"
                style={{
                  background: 'linear-gradient(180deg, #0F5740 0%, #0B3D2E 100%)',
                  border: '2px solid rgba(239, 68, 68, 0.4)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <div className="text-3xl mb-3">⚠️</div>
                <p className="text-[#F4D68C] text-lg mb-2 font-body font-semibold">
                  High Yaniv Call
                </p>
                <p className="text-[#F5F0E1]/80 text-sm mb-6 font-body">
                  You can only call Yaniv with 5 or less. Are you sure {getFirstName(playerInputOrder[0]?.name)} had {inputValue} points?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowYanivWarning(false)}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 hover:brightness-110 text-[#F5F0E1] font-body focus-visible:ring-2 focus-visible:ring-[#F4D68C]"
                    style={{
                      background: 'linear-gradient(180deg, #14785A 0%, #0F5740 100%)',
                      border: '1px solid rgba(229, 185, 74, 0.2)',
                    }}
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => handleSubmitPlayerScore(true)}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 hover:brightness-110 text-white font-body focus-visible:ring-2 focus-visible:ring-[#EF4444]"
                    style={{
                      background: 'linear-gradient(180deg, #EF4444 0%, #B91C1C 100%)',
                    }}
                  >
                    Yes, Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Unusually high hand score warning */}
          {showHighScoreWarning && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0B3D2E]/95 animate-modal-enter backdrop-blur-sm">
              <div className="text-center animate-card-enter p-6 rounded-2xl max-w-xs"
                style={{
                  background: 'linear-gradient(180deg, #0F5740 0%, #0B3D2E 100%)',
                  border: '2px solid rgba(245, 158, 11, 0.4)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <div className="text-3xl mb-3">🤔</div>
                <p className="text-[#F4D68C] text-lg mb-2 font-body font-semibold">
                  Very High Score
                </p>
                <p className="text-[#F5F0E1]/80 text-sm mb-6 font-body">
                  That&apos;s a very high score for one hand. Are you sure {getFirstName(playerInputOrder[currentPlayerIndex]?.name)} had {inputValue} points?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowHighScoreWarning(false)}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 hover:brightness-110 text-[#F5F0E1] font-body focus-visible:ring-2 focus-visible:ring-[#F4D68C]"
                    style={{
                      background: 'linear-gradient(180deg, #14785A 0%, #0F5740 100%)',
                      border: '1px solid rgba(229, 185, 74, 0.2)',
                    }}
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => handleSubmitPlayerScore(true)}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 hover:brightness-110 text-white font-body focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
                    style={{
                      background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
                    }}
                  >
                    Yes, Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="relative z-0 flex-1 flex flex-col max-w-lg mx-auto w-full p-6">
            {/* Header with close button and progress */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setIsInputting(false)}
                className="text-[#F4D68C]/60 text-sm font-body px-2 py-2 -mx-2 -my-2 rounded-lg hover:bg-[#F4D68C]/10 active:bg-[#F4D68C]/20 transition-colors"
              >
                ← Cancel
              </button>

              {/* Progress dots at top */}
              <div className="flex items-center gap-2">
                {/* Yaniv caller step dot */}
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    inputStep === 'enterScores' ? 'scale-125' : ''
                  }`}
                  style={{
                    background: inputStep === 'enterScores' ? '#E5B94A' : 'rgba(229, 185, 74, 0.6)',
                  }}
                />
                <div className="w-4 h-px bg-[#E5B94A]/30" />
                {/* Player score dots - one per player */}
                {playerInputOrder.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      inputStep === 'enterScores' && index === currentPlayerIndex ? 'scale-125' : ''
                    }`}
                    style={{
                      background: inputStep === 'enterScores' && index <= currentPlayerIndex
                        ? '#E5B94A'
                        : 'rgba(229, 185, 74, 0.2)',
                    }}
                  />
                ))}
              </div>

              <div className="w-12" /> {/* Spacer for balance */}
            </div>

            {/* Step 1: Select Yaniv Caller */}
            {inputStep === 'selectYaniv' && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-[#F4D68C] text-xl mb-8 font-body text-center">
                  Who called Yaniv?
                </p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                  {players.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handleSelectYaniv(player.id)}
                      className="flex flex-col items-center p-4 rounded-xl transition-all active:scale-95 hover:scale-[1.02] hover:border-[#E5B94A]/50"
                      style={{
                        background: 'linear-gradient(180deg, #14785A 0%, #0F5740 100%)',
                        border: '2px solid rgba(229, 185, 74, 0.2)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg font-body mb-2"
                        style={{
                          backgroundColor: player.color,
                          boxShadow: `0 2px 8px ${player.color}40`,
                        }}
                      >
                        {getInitials(player.name)}
                      </div>
                      <span className="text-[#F5F0E1] text-sm font-body">
                        {getFirstName(player.name)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Enter Scores */}
            {inputStep === 'enterScores' && (
              <>
                {/* Player info with animation */}
                <div
                  className={`flex-1 flex flex-col items-center justify-center transition-all duration-400 ease-out ${
                    slideDirection === 'exit' ? 'opacity-0 -translate-x-12' :
                    slideDirection === 'enter' ? 'opacity-100 translate-x-0' : 'opacity-100'
                  }`}
                  style={{
                    transitionDuration: '400ms',
                    transform: slideDirection === 'enter' ? 'translateX(0)' :
                               slideDirection === 'exit' ? 'translateX(-3rem)' : 'none',
                  }}
                >
                  <p className="text-[#F4D68C]/80 text-lg mb-4 font-body">
                    {getFirstName(playerInputOrder[currentPlayerIndex]?.name)}&apos;s hand total
                  </p>

                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl font-body mb-6"
                    style={{
                      backgroundColor: playerInputOrder[currentPlayerIndex]?.color,
                      boxShadow: `0 4px 16px ${playerInputOrder[currentPlayerIndex]?.color}50`,
                    }}
                  >
                    {getInitials(playerInputOrder[currentPlayerIndex]?.name ?? '')}
                  </div>

                  {/* Score display */}
                  <div className="text-center mb-6">
                    <span className={`font-score text-7xl ${isNegative ? 'text-[#10B981]' : 'text-[#F5F0E1]'}`}>
                      {isNegative ? '-' : ''}{inputValue || '0'}
                    </span>
                    <div className={`w-24 h-1 mx-auto mt-2 rounded-full ${isNegative ? 'bg-[#10B981]' : 'bg-[#E5B94A]'}`} />
                  </div>
                </div>

                {/* Numeric keyboard */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleNumberInput(num.toString())}
                      className="py-4 rounded-xl text-2xl font-bold text-[#F5F0E1] font-score transition-all active:scale-95 active:translate-y-[2px] hover:brightness-110"
                      style={{
                        background: 'linear-gradient(180deg, #14785A 0%, #0F5740 100%)',
                        boxShadow: '0 2px 0 #0B3D2E',
                      }}
                    >
                      {num}
                    </button>
                  ))}
                  {/* +/- toggle for negative scores (jokers) */}
                  <button
                    onClick={handleToggleNegative}
                    className={`py-4 rounded-xl text-lg font-bold font-body transition-all active:scale-95 hover:brightness-110 ${
                      isNegative ? 'text-[#10B981]' : 'text-[#F4D68C]/60 hover:text-[#F4D68C]'
                    }`}
                    style={{
                      background: isNegative
                        ? 'linear-gradient(180deg, #10B981 0%, #059669 100%)'
                        : 'linear-gradient(180deg, #0F5740 0%, #0B3D2E 100%)',
                    }}
                  >
                    +/−
                  </button>
                  <button
                    onClick={() => handleNumberInput('0')}
                    className="py-4 rounded-xl text-2xl font-bold text-[#F5F0E1] font-score transition-all active:scale-95 active:translate-y-[2px] hover:brightness-110"
                    style={{
                      background: 'linear-gradient(180deg, #14785A 0%, #0F5740 100%)',
                      boxShadow: '0 2px 0 #0B3D2E',
                    }}
                  >
                    0
                  </button>
                  <button
                    onClick={handleBackspace}
                    className="py-4 rounded-xl text-lg font-bold text-[#F4D68C]/60 font-body transition-all active:scale-95 hover:text-[#F4D68C] hover:bg-[#C41E3A]/20"
                    style={{
                      background: 'linear-gradient(180deg, #0F5740 0%, #0B3D2E 100%)',
                    }}
                  >
                    ⌫
                  </button>
                </div>

                {/* Submit button */}
                <button
                  onClick={() => handleSubmitPlayerScore()}
                  className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:translate-y-[2px] hover:brightness-110 text-[#1A1A1A] tracking-wide font-body"
                  style={{
                    background: 'linear-gradient(180deg, #F4D68C 0%, #E5B94A 50%, #C9972D 100%)',
                    boxShadow: '0 4px 0 #8B6914, 0 6px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  {currentPlayerIndex < playerInputOrder.length - 1 ? 'Next' : 'Done'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
