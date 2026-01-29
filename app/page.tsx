'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved game in localStorage
    const saved = localStorage.getItem('yaniv-current-game');
    setHasSavedGame(!!saved);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B3D2E] relative overflow-hidden">
      {/* Noise texture overlay for felt effect */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Ambient golden glow - warm casino lighting */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(201, 151, 45, 0.12) 0%, rgba(201, 151, 45, 0.04) 40%, transparent 70%)'
        }}
      />

      {/* Secondary ambient glow - lower */}
      <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(201, 151, 45, 0.06) 0%, transparent 60%)'
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div
          className={`w-full max-w-md transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Header / Logo */}
          <header className="text-center mb-10">
            <h1
              className="text-5xl sm:text-6xl font-bold text-[#E5B94A] tracking-wider font-display"
              style={{
                textShadow: '0 0 8px rgba(229, 185, 74, 0.4), 0 0 16px rgba(229, 185, 74, 0.2)'
              }}
            >
              YANIV
            </h1>

            {/* Tagline with suits */}
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="text-xl text-[#C41E3A]" aria-hidden="true">♥</span>
              <p className="text-[#F4D68C]/80 text-sm tracking-[0.25em] uppercase font-body">
                Score Keeper
              </p>
              <span className="text-xl text-[#1A1A1A]" aria-hidden="true">♠</span>
            </div>
          </header>

          {/* Main Card / Table Surface */}
          <main
            className="relative bg-[#0F5740] rounded-2xl p-8 sm:p-10"
            style={{
              border: '3px solid rgba(201, 151, 45, 0.25)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04), inset 0 -4px 20px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Inner felt texture */}
            <div
              className="absolute inset-0 rounded-2xl opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
              }}
            />

            {/* Corner suit decorations */}
            <div className="absolute top-4 left-4 text-3xl text-[#8B1E3A]/20 select-none" aria-hidden="true">♦</div>
            <div className="absolute top-4 right-4 text-3xl text-[#1A1A1A]/20 select-none" aria-hidden="true">♣</div>
            <div className="absolute bottom-4 left-4 text-3xl text-[#1A1A1A]/20 select-none" aria-hidden="true">♠</div>
            <div className="absolute bottom-4 right-4 text-3xl text-[#8B1E3A]/20 select-none" aria-hidden="true">♥</div>

            <div className="relative space-y-4">
              {/* Primary Button: New Game */}
              <Link
                href="/game/new"
                className="group w-full relative py-5 px-8 rounded-xl transition-all duration-150 active:translate-y-[2px] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#F4D68C] focus:ring-offset-2 focus:ring-offset-[#0F5740] block text-center"
                style={{
                  background: 'linear-gradient(to bottom, #E5B94A, #C9972D)',
                  border: '2px solid rgba(244, 214, 140, 0.4)',
                  boxShadow: '0 4px 0 #8B6914, 0 6px 20px rgba(0, 0, 0, 0.3)'
                }}
              >
                {/* Shine overlay */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent rounded-t-xl pointer-events-none" />

                <span className="relative text-[#1A1A1A] font-semibold text-xl tracking-[0.15em] uppercase font-body">
                  Start New Game
                </span>
              </Link>

              {/* Secondary Button: Continue Game */}
              {hasSavedGame ? (
                <Link
                  href="/game/play"
                  className="group w-full relative py-4 px-8 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#F4D68C] focus:ring-offset-2 focus:ring-offset-[#0F5740] active:translate-y-[2px] hover:brightness-110 hover:border-[#E5B94A]/40 cursor-pointer block text-center"
                  style={{
                    background: 'linear-gradient(to bottom, #14785A, #0F5740)',
                    border: '2px solid rgba(201, 151, 45, 0.2)',
                    boxShadow: '0 3px 0 #0B3D2E, 0 5px 16px rgba(0, 0, 0, 0.25)'
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/8 to-transparent rounded-t-xl pointer-events-none" />

                  <span className="relative text-[#F5F0E1] font-medium text-base tracking-[0.1em] uppercase font-body">
                    Continue Game
                  </span>
                </Link>
              ) : (
                <div
                  className="group w-full relative py-4 px-8 rounded-xl opacity-50 cursor-not-allowed text-center"
                  style={{
                    background: 'linear-gradient(to bottom, #0F5740, #0B3D2E)',
                    border: '2px solid rgba(201, 151, 45, 0.2)'
                  }}
                >
                  <span className="relative text-[#F5F0E1] font-medium text-base tracking-[0.1em] uppercase font-body">
                    No Saved Game
                  </span>
                </div>
              )}

              {/* Decorative Divider */}
              <div className="flex items-center gap-4 py-5" role="separator">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#C9972D]/25 to-transparent" />
                <span className="text-[#C9972D]/50 text-xs tracking-[0.2em] uppercase font-body">
                  Est. 2026
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#C9972D]/25 to-transparent" />
              </div>

              {/* Tagline */}
              <p className="text-center text-[#D4CBBA]/50 text-sm italic font-body">
                "The house always tracks the score"
              </p>
            </div>
          </main>

          {/* Footer decoration */}
          <footer className="text-center mt-8 flex items-center justify-center gap-8" aria-hidden="true">
            {['♥', '♦', '♣', '♠'].map((suit, i) => (
              <span
                key={suit}
                className={`text-2xl animate-fade-pulse ${
                  suit === '♥' || suit === '♦' ? 'text-[#8B1E3A]/30' : 'text-[#1A1A1A]/20'
                }`}
                style={{
                  animationDelay: `${i * 0.5}s`
                }}
              >
                {suit}
              </span>
            ))}
          </footer>
        </div>
      </div>
    </div>
  );
}
