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
  const [animatingWinner, setAnimatingWinner] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'enter' | 'exit' | null>(null);
  const [animatingRoundIndex, setAnimatingRoundIndex] = useState<number | null>(null);
  const [animatedScores, setAnimatedScores] = useState<{ [playerId: string]: number }>({});
  const [animatedTotals, setAnimatedTotals] = useState<{ [playerId: string]: number }>({});
  const [winnerPopId, setWinnerPopId] = useState<string | null>(null);
  const [showYanivWarning, setShowYanivWarning] = useState(false);

  // Redirect if no game - go to homepage, not /game/new
  useEffect(() => {
    if (!currentGame) {
      router.push('/');
    }
  }, [currentGame, router]);

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
  const handleSubmitPlayerScore = (confirmedHighScore = false) => {
    const currentPlayer = playerInputOrder[currentPlayerIndex];
    const rawValue = parseInt(inputValue) || 0;
    const score = isNegative ? -rawValue : rawValue;

    // Check if this is the Yaniv caller (first player) and their score is > 5
    if (currentPlayerIndex === 0 && score > 5 && !confirmedHighScore) {
      setShowYanivWarning(true);
      return;
    }

    setShowYanivWarning(false);
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

          // Find who won this round (scored 0 in the final calculation)
          // The actual winner will be determined after addRound processes false yaniv etc.
          // For now, we'll trigger pop for the yaniv caller if their hand was lowest
          const callerScore = newScores[yanivCallerId] ?? 0;
          const otherScores = Object.entries(newScores)
            .filter(([id]) => id !== yanivCallerId)
            .map(([, score]) => score);
          const someoneHasLowerOrEqual = otherScores.some(s => s <= callerScore);
          // If no one has lower/equal, yaniv caller wins and scores 0
          const roundWinnerForPop = someoneHasLowerOrEqual ? null : yanivCallerId;

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

                  // If this is the last player and they scored 0, trigger winner pop
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

                              // If last player's total animation done, trigger winner pop
                              if (idx === players.length - 1) {
                                // Trigger winner pop for player who won (scored 0)
                                if (roundWinnerForPop) {
                                  setWinnerPopId(roundWinnerForPop);
                                  setTimeout(() => {
                                    setWinnerPopId(null);
                                    setAnimatingRoundIndex(null);
                                  }, 600);
                                } else {
                                  setAnimatingRoundIndex(null);
                                }
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

  // Get round winner (player who scored 0)
  const getRoundWinnerId = (round: typeof rounds[0]) => {
    return round.scoresAdded.find(s => s.pointsAdded === 0)?.playerId;
  };

  // Check if round had False Yaniv
  const hasFalseYaniv = (round: typeof rounds[0]) => round.isFalseYaniv;

  // Check if player got bonus in round
  const hasBonus = (round: typeof rounds[0], playerId: string) => {
    return round.scoresAdded.find(s => s.playerId === playerId)?.bonusApplied;
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
            className="text-[#E5B94A] text-sm font-body"
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
          <div className="space-y-1 overflow-y-auto max-h-[50vh]">
            {rounds.map((round, roundIndex) => {
              const winnerId = getRoundWinnerId(round);
              const isFalse = hasFalseYaniv(round);
              const isAnimating = animatingRoundIndex === roundIndex;

              return (
                <div key={round.roundNumber} className={`flex items-center transition-all ${isAnimating ? 'bg-[#E5B94A]/10 rounded-lg py-1 -mx-1 px-1' : ''}`}>
                  <div className="w-10 flex-shrink-0 text-[#F4D68C]/50 text-xs font-body">
                    R{round.roundNumber}
                  </div>
                  {players.map((player) => {
                    const actualScore = getRoundScore(round, player.id);
                    const displayScore = isAnimating
                      ? (animatedScores[player.id] ?? 0)
                      : actualScore;
                    const isWinner = winnerId === player.id;
                    const gotBonus = hasBonus(round, player.id);
                    const isFalseYanivCaller = isFalse && round.yanivCallerId === player.id;
                    const isWinnerPopping = isAnimating && winnerPopId === player.id && actualScore === 0;

                    return (
                      <div
                        key={player.id}
                        className={`flex-1 flex justify-center items-center gap-1 transition-all ${
                          isWinnerPopping ? 'animate-winner-pop' : ''
                        }`}
                      >
                        {isWinner && (
                          <span className={`text-xs text-[#F4D68C] ${isWinnerPopping ? 'animate-bounce' : ''}`}>♔</span>
                        )}
                        {isFalseYanivCaller && (
                          <span className="text-xs text-[#C41E3A]">✗</span>
                        )}
                        {gotBonus && (
                          <span className="text-xs text-[#10B981]">★</span>
                        )}
                        <span
                          className={`font-score text-lg transition-all ${
                            isWinnerPopping
                              ? 'text-[#10B981] font-bold scale-125'
                              : isAnimating
                              ? 'text-[#E5B94A] font-bold scale-105'
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

        {/* Game ended state */}
        {gameEnded && winnerId && (
          <div className="text-center mb-4 p-4 rounded-xl bg-[#E5B94A]/20">
            <p className="text-[#E5B94A] font-bold font-display text-xl mb-2">
              Game Over!
            </p>
            <p className="text-[#F5F0E1] font-body">
              {getFirstName(players.find(p => p.id === winnerId)?.name ?? '')} wins with {players.find(p => p.id === winnerId)?.cumulativeScore} points!
            </p>
            <button
              onClick={() => {
                resetGame();
                router.push('/game/new');
              }}
              className="mt-4 px-6 py-2 rounded-lg bg-[#E5B94A] text-[#1A1A1A] font-semibold font-body"
            >
              New Game
            </button>
          </div>
        )}

        {/* Add round button */}
        {!gameEnded && (
          <button
            onClick={handleStartInput}
            className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:translate-y-[2px] text-[#F5F0E1] tracking-wide font-body"
            style={{
              background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 4px 0 #047857, 0 6px 12px rgba(0,0,0,0.25)',
            }}
          >
            Add Round {currentRoundNumber} Scores
          </button>
        )}
      </div>

      {/* Score Input Modal */}
      {isInputting && (
        <div className="fixed inset-0 z-50 bg-[#0B3D2E] flex flex-col">
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
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0B3D2E]/95">
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
                    className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 text-[#F5F0E1] font-body"
                    style={{
                      background: 'linear-gradient(180deg, #14785A 0%, #0F5740 100%)',
                      border: '1px solid rgba(229, 185, 74, 0.2)',
                    }}
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => handleSubmitPlayerScore(true)}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 text-white font-body"
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

          <div className="relative z-0 flex-1 flex flex-col max-w-lg mx-auto w-full p-6">
            {/* Header with close button and progress */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setIsInputting(false)}
                className="text-[#F4D68C]/60 text-sm font-body"
              >
                ← Cancel
              </button>

              {/* Progress dots at top */}
              <div className="flex items-center gap-2">
                {/* Yaniv caller step dot */}
                <div
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: inputStep === 'enterScores' ? '#E5B94A' : 'rgba(229, 185, 74, 0.6)',
                  }}
                />
                <div className="w-4 h-px bg-[#E5B94A]/30" />
                {/* Player score dots - one per player */}
                {playerInputOrder.map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full transition-all"
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
                      className="flex flex-col items-center p-4 rounded-xl transition-all active:scale-95"
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
                      {isNegative && inputValue ? '-' : ''}{inputValue || '0'}
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
                      className="py-4 rounded-xl text-2xl font-bold text-[#F5F0E1] font-score transition-all active:scale-95"
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
                    className={`py-4 rounded-xl text-lg font-bold font-body transition-all active:scale-95 ${
                      isNegative ? 'text-[#10B981]' : 'text-[#F4D68C]/60'
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
                    className="py-4 rounded-xl text-2xl font-bold text-[#F5F0E1] font-score transition-all active:scale-95"
                    style={{
                      background: 'linear-gradient(180deg, #14785A 0%, #0F5740 100%)',
                      boxShadow: '0 2px 0 #0B3D2E',
                    }}
                  >
                    0
                  </button>
                  <button
                    onClick={handleBackspace}
                    className="py-4 rounded-xl text-lg font-bold text-[#F4D68C]/60 font-body transition-all active:scale-95"
                    style={{
                      background: 'linear-gradient(180deg, #0F5740 0%, #0B3D2E 100%)',
                    }}
                  >
                    ←
                  </button>
                </div>

                {/* Submit button */}
                <button
                  onClick={() => handleSubmitPlayerScore()}
                  className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:translate-y-[2px] text-[#1A1A1A] tracking-wide font-body"
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
