'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HouseRules } from '@/types/game';
import { useGameStore } from '@/lib/store';

// Avatar colors - rich, saturated palette
const AVATAR_COLORS = [
  '#3B82F6', // blue
  '#14B8A6', // teal
  '#A855F7', // purple
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // emerald
  '#EF4444', // red
  '#8B5CF6', // violet
];

// Get initials from name (1 letter for single name, 2 for multiple)
function getInitials(name: string): string {
  const words = name.trim().split(' ').filter(w => w.length > 0);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Get first name only
function getFirstName(name: string): string {
  const words = name.trim().split(' ').filter(w => w.length > 0);
  return words[0] || name;
}

// Format player names for display (Oxford comma)
function formatPlayerNames(players: string[]): string {
  const firstNames = players.map(getFirstName);
  if (firstNames.length <= 2) return firstNames.join(' and ');
  return firstNames.slice(0, -1).join(', ') + ', and ' + firstNames[firstNames.length - 1];
}

export default function NewGamePage() {
  const router = useRouter();
  const createGame = useGameStore(state => state.createGame);
  const [step, setStep] = useState(1);

  // Step 1: Player count
  const [playerCount, setPlayerCount] = useState(4);

  // Step 2: Player names
  const [players, setPlayers] = useState<string[]>([]);

  // Step 3: House rules
  const [houseRules, setHouseRules] = useState<HouseRules>({
    falseYanivPenalty: 25,
    bystandersScoreOnFalseYaniv: false,
    bonusType: 'subtract25',
    endGameMode: 'highScore',
    maxScore: 150,
    maxRounds: 10
  });

  const [expandedRule, setExpandedRule] = useState<'falseYaniv' | 'bonus' | 'endGame' | null>(null);

  const toggleRule = (rule: 'falseYaniv' | 'bonus' | 'endGame') => {
    setExpandedRule(expandedRule === rule ? null : rule);
  };

  // Handlers
  const handlePlayerCountContinue = () => {
    setPlayers(Array(playerCount).fill(''));
    setStep(2);
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const canContinueFromNames = players.every(p => p.trim().length > 0);

  const handleStartGame = () => {
    createGame(players, houseRules);
    router.push('/game/play');
  };

  // Shared button styles
  const primaryButtonStyle = {
    background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
    boxShadow: '0 4px 0 #047857, 0 6px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
  };

  const goldButtonStyle = {
    background: 'linear-gradient(180deg, #F4D68C 0%, #E5B94A 50%, #C9972D 100%)',
    boxShadow: '0 4px 0 #8B6914, 0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
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

      {/* Ambient glow */}
      <div
        className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[140%] aspect-square pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(229, 185, 74, 0.08) 0%, transparent 50%)'
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col px-6 py-8 max-w-md mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <Link
            href={step === 1 ? '/' : '#'}
            onClick={(e) => {
              if (step > 1) {
                e.preventDefault();
                setStep(step - 1);
              }
            }}
            className="flex items-center gap-2 text-[#E5B94A] hover:text-[#F4D68C] transition-colors duration-200 group"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span className="text-sm font-medium tracking-wide uppercase font-body opacity-80">Back</span>
          </Link>

          <span className="text-[#F4D68C]/40 text-sm font-body tracking-wider">
            {step}/4
          </span>
        </header>

        {/* Progress bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="flex-1 h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{
                background: s <= step
                  ? 'linear-gradient(90deg, #E5B94A, #F4D68C)'
                  : 'rgba(229, 185, 74, 0.15)',
                boxShadow: s <= step ? '0 0 8px rgba(229, 185, 74, 0.4)' : 'none'
              }}
            />
          ))}
        </div>

        {/* Content area - grows to fill space */}
        <div className="flex-1 flex flex-col">

          {/* Step 1: Player Count */}
          {step === 1 && (
            <div className="flex-1 flex flex-col animate-card-enter">
              <div className="flex-1 flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-[#F5F0E1] mb-16 font-display text-center leading-tight">
                  How many players<br />at the table?
                </h1>

                <div className="flex items-center justify-center gap-6 mb-16">
                  <button
                    onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
                    disabled={playerCount <= 2}
                    className="w-16 h-16 rounded-full text-3xl font-bold transition-all duration-150 active:translate-y-[2px] active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      ...goldButtonStyle,
                      color: '#1A1A1A',
                    }}
                  >
                    −
                  </button>

                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(180deg, #0F5740 0%, #0B3D2E 100%)',
                      border: '3px solid rgba(229, 185, 74, 0.3)',
                      boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    <span className="text-6xl font-bold text-[#E5B94A] font-display">
                      {playerCount}
                    </span>
                  </div>

                  <button
                    onClick={() => setPlayerCount(Math.min(8, playerCount + 1))}
                    disabled={playerCount >= 8}
                    className="w-16 h-16 rounded-full text-3xl font-bold transition-all duration-150 active:translate-y-[2px] active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      ...goldButtonStyle,
                      color: '#1A1A1A',
                    }}
                  >
                    +
                  </button>
                </div>

                <p className="text-[#D4CBBA]/60 text-sm font-body">
                  2–8 players
                </p>
              </div>

              <button
                onClick={handlePlayerCountContinue}
                className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:translate-y-[2px] active:shadow-none text-[#F5F0E1] tracking-wide font-body"
                style={primaryButtonStyle}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Player Names */}
          {step === 2 && (
            <div className="flex-1 flex flex-col animate-card-enter">
              <h1 className="text-3xl font-bold text-[#F5F0E1] mb-10 font-display text-center">
                Who's playing?
              </h1>

              <div className="flex-1 space-y-3 mb-8 overflow-y-auto">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 animate-card-enter"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg font-body flex-shrink-0 transition-all duration-300"
                      style={{
                        backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                        boxShadow: `0 4px 12px ${AVATAR_COLORS[index % AVATAR_COLORS.length]}40`
                      }}
                    >
                      {getInitials(player) || '?'}
                    </div>
                    <input
                      type="text"
                      value={player}
                      onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                      placeholder={`Player ${index + 1}`}
                      className="flex-1 px-5 py-4 rounded-xl bg-[#0F5740] border-2 border-[#C9972D]/20 text-[#F5F0E1] placeholder:text-[#F4D68C]/30 font-body text-lg focus:outline-none focus:border-[#E5B94A]/60 focus:bg-[#14785A]/50 transition-all duration-200"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!canContinueFromNames}
                className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:translate-y-[2px] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 text-[#F5F0E1] tracking-wide font-body"
                style={canContinueFromNames ? primaryButtonStyle : { background: '#0F5740' }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: House Rules */}
          {step === 3 && (
            <div className="flex-1 flex flex-col animate-card-enter">
              <h1 className="text-3xl font-bold text-[#F5F0E1] mb-2 font-display text-center">
                House Rules
              </h1>
              <p className="text-[#D4CBBA]/60 text-sm font-body text-center mb-8">
                Tap to customize
              </p>

              <div className="flex-1 space-y-3 mb-8">
                {/* False Yaniv Card */}
                <div
                  onClick={() => toggleRule('falseYaniv')}
                  className="rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #F4D68C 0%, #E5B94A 100%)',
                    border: '3px solid #C9972D',
                    boxShadow: expandedRule === 'falseYaniv'
                      ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                      : '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
                  }}
                >
                  <div className="px-5 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-[#8B1E3A]">♥</span>
                      <span className="text-[#1A1A1A] font-semibold text-lg font-body">False Yaniv</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#1A1A1A] font-bold text-xl font-score">+{houseRules.falseYanivPenalty}</span>
                      <span className={`text-[#1A1A1A]/50 transition-transform duration-300 ${expandedRule === 'falseYaniv' ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </div>

                  <div
                    className="transition-all duration-300 ease-out"
                    style={{
                      maxHeight: expandedRule === 'falseYaniv' ? '280px' : '0',
                      opacity: expandedRule === 'falseYaniv' ? 1 : 0
                    }}
                  >
                    <div className="px-5 pb-5 pt-3 border-t-2 border-[#C9972D]/30" onClick={(e) => e.stopPropagation()}>
                      <p className="text-[#1A1A1A]/60 text-sm mb-5 font-body leading-relaxed">
                        Penalty when you call Yaniv but another player has equal or lower.
                      </p>

                      <div className="flex items-center justify-center gap-4 mb-5">
                        <button
                          onClick={() => setHouseRules({ ...houseRules, falseYanivPenalty: Math.max(0, houseRules.falseYanivPenalty - 5) })}
                          className="w-12 h-12 rounded-xl bg-[#C9972D] text-[#1A1A1A] font-bold text-xl active:scale-95 transition-transform"
                        >
                          −
                        </button>
                        <div className="w-20 h-12 rounded-xl bg-white/90 flex items-center justify-center">
                          <span className="text-[#1A1A1A] font-bold text-2xl font-score">{houseRules.falseYanivPenalty}</span>
                        </div>
                        <button
                          onClick={() => setHouseRules({ ...houseRules, falseYanivPenalty: houseRules.falseYanivPenalty + 5 })}
                          className="w-12 h-12 rounded-xl bg-[#C9972D] text-[#1A1A1A] font-bold text-xl active:scale-95 transition-transform"
                        >
                          +
                        </button>
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                        <input
                          type="checkbox"
                          checked={houseRules.bystandersScoreOnFalseYaniv}
                          onChange={(e) => setHouseRules({ ...houseRules, bystandersScoreOnFalseYaniv: e.target.checked })}
                          className="w-5 h-5 rounded accent-[#8B6914]"
                        />
                        <span className="text-[#1A1A1A]/80 text-sm font-body">Bystanders also score their hands</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bonus Card */}
                <div
                  onClick={() => toggleRule('bonus')}
                  className="rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #F4D68C 0%, #E5B94A 100%)',
                    border: '3px solid #C9972D',
                    boxShadow: expandedRule === 'bonus'
                      ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                      : '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
                  }}
                >
                  <div className="px-5 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-[#8B1E3A]">♦</span>
                      <span className="text-[#1A1A1A] font-semibold text-lg font-body">x50 Bonus</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#1A1A1A] font-bold text-xl font-score">
                        {houseRules.bonusType === 'subtract25' ? '−25' : houseRules.bonusType === 'divide2' ? '÷2' : 'Off'}
                      </span>
                      <span className={`text-[#1A1A1A]/50 transition-transform duration-300 ${expandedRule === 'bonus' ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </div>

                  <div
                    className="transition-all duration-300 ease-out"
                    style={{
                      maxHeight: expandedRule === 'bonus' ? '280px' : '0',
                      opacity: expandedRule === 'bonus' ? 1 : 0
                    }}
                  >
                    <div className="px-5 pb-5 pt-3 border-t-2 border-[#C9972D]/30" onClick={(e) => e.stopPropagation()}>
                      <p className="text-[#1A1A1A]/60 text-sm mb-5 font-body leading-relaxed">
                        Reward when landing exactly on 50, 100, 150...
                      </p>

                      <div className="space-y-2">
                        {[
                          { value: 'subtract25', label: 'Subtract 25', example: '100 → 75' },
                          { value: 'divide2', label: 'Divide by 2', example: '100 → 50' },
                          { value: 'none', label: 'No bonus', example: 'Stays same' }
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setHouseRules({ ...houseRules, bonusType: opt.value as HouseRules['bonusType'] })}
                            className={`w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                              houseRules.bonusType === opt.value ? 'bg-white/80 shadow-sm' : 'bg-white/20 hover:bg-white/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                houseRules.bonusType === opt.value ? 'border-[#8B6914] bg-[#8B6914]' : 'border-[#C9972D]/50'
                              }`}>
                                {houseRules.bonusType === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <span className="text-[#1A1A1A] font-medium font-body">{opt.label}</span>
                            </div>
                            <span className="text-[#1A1A1A]/50 text-sm font-score">{opt.example}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* End Game Card */}
                <div
                  onClick={() => toggleRule('endGame')}
                  className="rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #F4D68C 0%, #E5B94A 100%)',
                    border: '3px solid #C9972D',
                    boxShadow: expandedRule === 'endGame'
                      ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                      : '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
                  }}
                >
                  <div className="px-5 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-[#1A1A1A]">♠</span>
                      <span className="text-[#1A1A1A] font-semibold text-lg font-body">End Game</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#1A1A1A] font-bold text-xl font-score">
                        {houseRules.endGameMode === 'highScore' ? houseRules.maxScore : `${houseRules.maxRounds}R`}
                      </span>
                      <span className={`text-[#1A1A1A]/50 transition-transform duration-300 ${expandedRule === 'endGame' ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </div>

                  <div
                    className="transition-all duration-300 ease-out"
                    style={{
                      maxHeight: expandedRule === 'endGame' ? '320px' : '0',
                      opacity: expandedRule === 'endGame' ? 1 : 0
                    }}
                  >
                    <div className="px-5 pb-5 pt-3 border-t-2 border-[#C9972D]/30" onClick={(e) => e.stopPropagation()}>
                      <p className="text-[#1A1A1A]/60 text-sm mb-5 font-body leading-relaxed">
                        When does the game end?
                      </p>

                      {/* Mode toggle */}
                      <div className="flex rounded-xl bg-white/30 p-1 mb-5">
                        <button
                          onClick={() => setHouseRules({ ...houseRules, endGameMode: 'highScore' })}
                          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold font-body transition-all duration-200 ${
                            houseRules.endGameMode === 'highScore'
                              ? 'bg-white text-[#1A1A1A] shadow-sm'
                              : 'text-[#1A1A1A]/60'
                          }`}
                        >
                          Score Limit
                        </button>
                        <button
                          onClick={() => setHouseRules({ ...houseRules, endGameMode: 'numRounds' })}
                          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold font-body transition-all duration-200 ${
                            houseRules.endGameMode === 'numRounds'
                              ? 'bg-white text-[#1A1A1A] shadow-sm'
                              : 'text-[#1A1A1A]/60'
                          }`}
                        >
                          Fixed Rounds
                        </button>
                      </div>

                      {houseRules.endGameMode === 'highScore' ? (
                        <>
                          <p className="text-[#1A1A1A]/50 text-xs mb-4 font-body text-center">
                            Game ends when someone exceeds this score
                          </p>
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => setHouseRules({ ...houseRules, maxScore: Math.max(50, houseRules.maxScore - 25) })}
                              className="w-12 h-12 rounded-xl bg-[#C9972D] text-[#1A1A1A] font-bold text-xl active:scale-95 transition-transform"
                            >
                              −
                            </button>
                            <div className="w-24 h-12 rounded-xl bg-white/90 flex items-center justify-center">
                              <span className="text-[#1A1A1A] font-bold text-2xl font-score">{houseRules.maxScore}</span>
                            </div>
                            <button
                              onClick={() => setHouseRules({ ...houseRules, maxScore: houseRules.maxScore + 25 })}
                              className="w-12 h-12 rounded-xl bg-[#C9972D] text-[#1A1A1A] font-bold text-xl active:scale-95 transition-transform"
                            >
                              +
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-[#1A1A1A]/50 text-xs mb-4 font-body text-center">
                            Game ends after this many rounds
                          </p>
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => setHouseRules({ ...houseRules, maxRounds: Math.max(1, houseRules.maxRounds - 1) })}
                              className="w-12 h-12 rounded-xl bg-[#C9972D] text-[#1A1A1A] font-bold text-xl active:scale-95 transition-transform"
                            >
                              −
                            </button>
                            <div className="w-24 h-12 rounded-xl bg-white/90 flex items-center justify-center">
                              <span className="text-[#1A1A1A] font-bold text-2xl font-score">{houseRules.maxRounds}</span>
                            </div>
                            <button
                              onClick={() => setHouseRules({ ...houseRules, maxRounds: houseRules.maxRounds + 1 })}
                              className="w-12 h-12 rounded-xl bg-[#C9972D] text-[#1A1A1A] font-bold text-xl active:scale-95 transition-transform"
                            >
                              +
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(4)}
                className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:translate-y-[2px] active:shadow-none text-[#F5F0E1] tracking-wide font-body"
                style={primaryButtonStyle}
              >
                Confirm Rules
              </button>
            </div>
          )}

          {/* Step 4: Get Started */}
          {step === 4 && (
            <div className="flex-1 flex flex-col animate-card-enter">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h1 className="text-3xl font-bold text-[#F5F0E1] mb-8 font-display">
                  Let's go!
                </h1>

                {/* Player avatars */}
                <div className="flex justify-center gap-3 mb-10">
                  {players.map((player, index) => (
                    <div
                      key={index}
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg font-body animate-card-enter"
                      style={{
                        backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                        boxShadow: `0 4px 12px ${AVATAR_COLORS[index % AVATAR_COLORS.length]}50`,
                        animationDelay: `${index * 80}ms`
                      }}
                    >
                      {getInitials(player)}
                    </div>
                  ))}
                </div>

                <div className="space-y-5 max-w-xs">
                  <p className="text-xl font-body text-[#F5F0E1] leading-relaxed">
                    <span className="text-[#E5B94A] font-semibold">{formatPlayerNames(players)}</span>
                    {' '}will battle it out for Yaniv glory.
                  </p>

                  <p className="text-base font-body text-[#D4CBBA]/80 leading-relaxed">
                    Input the scores of each player's hand after each round — we'll manage the rest for you.
                  </p>

                  <p className="text-sm font-body text-[#F4D68C]/60 italic">
                    Good luck!
                  </p>
                </div>
              </div>

              <button
                onClick={handleStartGame}
                className="w-full py-5 rounded-2xl font-bold text-xl transition-all duration-150 active:translate-y-[2px] active:shadow-none text-[#1A1A1A] tracking-wide font-body"
                style={goldButtonStyle}
              >
                Let's Play
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
