'use client';

import Link from 'next/link';
import { GameState } from '@/types/game';
import { getInitials, getFirstName } from '@/lib/store';
import { formatShareDate } from '@/lib/share-utils';

interface PlayerClaim {
  player_id: string;
  user_id: string;
  player_name: string;
}

interface GameViewClientProps {
  gameData: GameState;
  claims: PlayerClaim[];
  playedAt: string;
}

export function GameViewClient({ gameData, claims, playedAt }: GameViewClientProps) {
  const { players, rounds, houseRules } = gameData;

  const sortedPlayers = [...players].sort(
    (a, b) => a.cumulativeScore - b.cumulativeScore
  );

  // Compute highlights
  const yanivWins: Record<string, number> = {};
  const falseYanivs: Record<string, number> = {};
  players.forEach((p) => {
    yanivWins[p.id] = 0;
    falseYanivs[p.id] = 0;
  });
  rounds.forEach((round) => {
    if (!round.isFalseYaniv) {
      yanivWins[round.yanivCallerId] = (yanivWins[round.yanivCallerId] || 0) + 1;
    } else {
      falseYanivs[round.yanivCallerId] = (falseYanivs[round.yanivCallerId] || 0) + 1;
    }
  });

  const dateStr = formatShareDate(new Date(playedAt));

  return (
    <div className="min-h-dvh bg-[#0B3D2E] relative overflow-hidden">
      {/* Felt texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 min-h-dvh flex flex-col p-6 max-w-lg mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-[#E5B94A] text-sm font-body px-2 py-2 -mx-2 -my-2 rounded-lg hover:bg-[#E5B94A]/10 active:bg-[#E5B94A]/20 transition-colors"
          >
            ← Home
          </Link>
          <span className="text-[#F4D68C]/60 text-sm font-body">{dateStr}</span>
        </header>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-[#F4D68C] text-xl font-display font-bold mb-1">
            Yaniv Results
          </h1>
          <p className="text-[#F5F0E1]/50 text-sm font-body">
            {rounds.length} rounds &middot; {players.length} players
            {houseRules.endGameMode === 'highScore'
              ? ` \u00b7 First to ${houseRules.maxScore}`
              : ''}
          </p>
        </div>

        {/* Mini Podium */}
        <div className="flex items-end justify-center gap-1 mb-6">
          {(() => {
            const isTwoPlayers = sortedPlayers.length === 2;

            if (isTwoPlayers) {
              const winner = sortedPlayers[0];
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

            const [first, second, third] = sortedPlayers;
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
                    <div
                      className="w-14 h-12 rounded-t-md flex items-start justify-center pt-1"
                      style={{
                        background:
                          'linear-gradient(180deg, #E8E8E8 0%, #A0A0A0 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
                      }}
                    >
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
                    <div
                      className="w-16 h-16 rounded-t-md flex items-start justify-center pt-1"
                      style={{
                        background:
                          'linear-gradient(180deg, #F4D68C 0%, #C9972D 100%)',
                        boxShadow:
                          '0 0 15px rgba(229, 185, 74, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                      }}
                    >
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
                    <div
                      className="w-12 h-8 rounded-t-md flex items-start justify-center pt-0.5"
                      style={{
                        background:
                          'linear-gradient(180deg, #DDA15E 0%, #A0522D 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                      }}
                    >
                      <span className="text-xs">🥉</span>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Final Tally */}
        <h2 className="text-[#F4D68C] text-lg font-display font-bold text-center mb-4">
          Final Tally
        </h2>

        <div
          className="rounded-xl p-4 mb-6"
          style={{
            background: 'linear-gradient(180deg, #0F5740 0%, #0B3D2E 100%)',
            border: '2px solid rgba(229, 185, 74, 0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
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
          {sortedPlayers.map((player, index) => {
            const claimed = claims.find((c) => c.player_id === player.id);
            return (
              <div key={player.id} className="flex items-center py-2">
                <div className="flex-1 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm font-body ${
                      index === 0 ? 'ring-2 ring-[#E5B94A]/50' : ''
                    }`}
                    style={{ backgroundColor: player.color }}
                  >
                    {getInitials(player.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#F5F0E1] font-body">
                      {getFirstName(player.name)}
                    </span>
                    {claimed && (
                      <span className="text-[#F4D68C]/40 text-xs font-body">
                        claimed
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-12 text-center text-[#10B981] font-score">
                  {yanivWins[player.id] || 0}
                </div>
                <div className="w-12 text-center text-[#C41E3A] font-score">
                  {falseYanivs[player.id] || 0}
                </div>
                <div
                  className={`w-16 text-right font-score font-bold ${
                    index === 0 ? 'text-[#E5B94A]' : 'text-[#F4D68C]'
                  }`}
                >
                  {player.cumulativeScore}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-4 space-y-3">
          <Link
            href="/game/new"
            className="block w-full py-4 rounded-2xl font-semibold text-lg text-center transition-all duration-150 active:translate-y-[2px] hover:brightness-110 text-[#F5F0E1] tracking-wide font-body"
            style={{
              background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 4px 0 #047857, 0 6px 12px rgba(0,0,0,0.25)',
            }}
          >
            Start Your Own Game
          </Link>
        </div>
      </div>
    </div>
  );
}
