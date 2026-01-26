'use client';

export default function VegasDemo() {
  return (
    <div className="min-h-screen bg-[#0a4d3c] relative overflow-hidden">
      {/* Felt texture overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Neon sign effect */}
          <div className="text-center mb-12 animate-[flicker_3s_infinite]">
            <div className="relative inline-block">
              <h1 className="text-7xl font-serif font-bold text-amber-400 tracking-wider drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                YANIV
              </h1>
              <div className="absolute -inset-4 bg-amber-400/20 blur-2xl -z-10 rounded-full"></div>
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-2xl text-red-500">♥</span>
              <p className="text-amber-100/80 text-sm tracking-[0.3em] uppercase font-serif">Score Keeper</p>
              <span className="text-2xl text-gray-800">♠</span>
            </div>
          </div>

          {/* Card table surface */}
          <div className="bg-[#0d6647] border-4 border-amber-600/40 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] p-8 backdrop-blur-sm relative overflow-hidden">
            {/* Inner shadow for depth */}
            <div className="absolute inset-0 shadow-[inset_0_4px_20px_rgba(0,0,0,0.4)] rounded-3xl pointer-events-none"></div>

            {/* Decorative corner suits */}
            <div className="absolute top-4 left-4 text-4xl text-amber-500/20">♦</div>
            <div className="absolute top-4 right-4 text-4xl text-amber-500/20">♣</div>
            <div className="absolute bottom-4 left-4 text-4xl text-amber-500/20">♠</div>
            <div className="absolute bottom-4 right-4 text-4xl text-amber-500/20">♥</div>

            <div className="relative space-y-5">
              {/* New Game Button */}
              <button className="group w-full relative bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-900 font-bold text-xl py-5 px-8 rounded-xl shadow-[0_6px_0_#92400e,0_8px_20px_rgba(0,0,0,0.4)] active:shadow-[0_2px_0_#92400e] active:translate-y-1 transition-all duration-150 border-2 border-amber-300/50">
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-xl"></div>
                <span className="relative flex items-center justify-center gap-3">
                  <span className="text-2xl">♠</span>
                  <span className="tracking-wider uppercase font-serif">Deal New Game</span>
                  <span className="text-2xl">♥</span>
                </span>
              </button>

              {/* Continue Game Button */}
              <button className="group w-full relative bg-gradient-to-b from-emerald-700 to-emerald-800 hover:from-emerald-600 hover:to-emerald-700 text-amber-100 font-semibold text-lg py-4 px-8 rounded-xl shadow-[0_4px_0_#064e3b,0_6px_20px_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_#064e3b] active:translate-y-0.5 transition-all duration-150 border-2 border-emerald-500/30">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-xl"></div>
                <span className="relative flex items-center justify-center gap-2 tracking-wide font-serif uppercase text-sm">
                  <span className="text-xl">♦</span>
                  Continue Last Hand
                  <span className="text-xl">♣</span>
                </span>
              </button>

              {/* Decorative divider */}
              <div className="flex items-center gap-4 py-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
                <div className="text-amber-400/60 text-xs tracking-widest uppercase font-serif">Est. 2026</div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
              </div>

              {/* Info text */}
              <p className="text-center text-amber-100/60 text-sm font-serif italic">
                "The house always tracks the score"
              </p>
            </div>
          </div>

          {/* Bottom decorative element */}
          <div className="text-center mt-6 flex items-center justify-center gap-6 text-amber-500/40">
            <span className="text-3xl animate-pulse">♥</span>
            <span className="text-3xl animate-pulse delay-100">♦</span>
            <span className="text-3xl animate-pulse delay-200">♣</span>
            <span className="text-3xl animate-pulse delay-300">♠</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          41%, 43% { opacity: 0.9; }
          42% { opacity: 0.95; }
          47%, 49% { opacity: 0.92; }
          48% { opacity: 0.88; }
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}
