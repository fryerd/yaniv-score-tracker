'use client';

import Link from 'next/link';

export default function GamePlayPage() {
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

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-8">
        {/* Placeholder content */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-6 flex justify-center gap-2">
            <span className="text-[#8B1E3A]">♥</span>
            <span className="text-[#1A1A1A]">♠</span>
            <span className="text-[#8B1E3A]">♦</span>
            <span className="text-[#1A1A1A]">♣</span>
          </div>
          <h1 className="text-3xl font-bold text-[#E5B94A] mb-4 font-display">
            Game Screen
          </h1>
          <p className="text-[#D4CBBA]/70 font-body max-w-xs mx-auto">
            The scoring interface will go here. Coming soon!
          </p>
        </div>

        {/* Restart button */}
        <Link
          href="/game/new"
          className="px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-150 active:translate-y-[2px] active:shadow-none text-[#F5F0E1] tracking-wide font-body"
          style={{
            background: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 4px 0 #047857, 0 6px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          Restart Flow
        </Link>

        {/* Back to home */}
        <Link
          href="/"
          className="mt-6 text-[#F4D68C]/60 hover:text-[#F4D68C] text-sm font-body transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
