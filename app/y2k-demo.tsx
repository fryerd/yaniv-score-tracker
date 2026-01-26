'use client';

export default function Y2KDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-300 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 2 + 1}s`
            }}
          >
            ✦
          </div>
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Bouncy header */}
          <div className="text-center mb-8 animate-bounce">
            <div className="inline-block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 p-1 rounded-3xl shadow-[0_8px_0_rgba(0,0,0,0.2)] mb-6 transform rotate-2">
              <div className="bg-white px-8 py-3 rounded-3xl">
                <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-transparent bg-clip-text" style={{
                  fontFamily: 'Comic Sans MS, cursive',
                  textShadow: '3px 3px 0 rgba(0,0,0,0.1)'
                }}>
                  YANIV!
                </h1>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl animate-spin-slow">🎮</span>
              <p className="text-white font-bold text-lg drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]" style={{
                fontFamily: 'Comic Sans MS, cursive'
              }}>
                Super Score Tracker 2000
              </p>
              <span className="text-2xl animate-spin-slow">🎲</span>
            </div>

            <div className="flex items-center justify-center gap-1">
              {['⭐', '✨', '💫'].map((emoji, i) => (
                <span key={i} className="text-xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{emoji}</span>
              ))}
            </div>
          </div>

          {/* Main card with extreme depth */}
          <div className="bg-white rounded-3xl shadow-[0_12px_0_rgba(0,0,0,0.15),0_15px_30px_rgba(0,0,0,0.2)] p-8 transform hover:translate-y-1 hover:shadow-[0_8px_0_rgba(0,0,0,0.15),0_12px_25px_rgba(0,0,0,0.2)] transition-all duration-200 border-4 border-purple-300">
            {/* Glossy highlight */}
            <div className="absolute inset-x-8 top-8 h-20 bg-gradient-to-b from-white/60 to-transparent rounded-t-3xl"></div>

            <div className="relative space-y-4">
              {/* New Game Button - Glossy gel effect */}
              <button className="group w-full relative bg-gradient-to-b from-pink-400 to-pink-600 hover:from-pink-300 hover:to-pink-500 text-white font-black text-2xl py-6 px-8 rounded-2xl shadow-[0_6px_0_#be185d,0_8px_20px_rgba(190,24,93,0.4)] active:shadow-[0_2px_0_#be185d] active:translate-y-1 transition-all duration-150 border-4 border-pink-300 overflow-hidden" style={{
                fontFamily: 'Comic Sans MS, cursive'
              }}>
                {/* Glossy shine */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-xl"></div>
                {/* Bevel effect */}
                <div className="absolute inset-0 rounded-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.2)]"></div>

                <span className="relative flex items-center justify-center gap-2 drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
                  <span className="text-3xl animate-spin-slow">🎯</span>
                  NEW GAME
                  <span className="text-3xl animate-spin-slow">🎯</span>
                </span>
              </button>

              {/* Continue Button - Different color scheme */}
              <button className="group w-full relative bg-gradient-to-b from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500 text-white font-black text-xl py-5 px-8 rounded-2xl shadow-[0_5px_0_#0e7490,0_7px_18px_rgba(14,116,144,0.4)] active:shadow-[0_2px_0_#0e7490] active:translate-y-1 transition-all duration-150 border-4 border-cyan-300 overflow-hidden" style={{
                fontFamily: 'Comic Sans MS, cursive'
              }}>
                {/* Glossy shine */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-xl"></div>
                <div className="absolute inset-0 rounded-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.2)]"></div>

                <span className="relative flex items-center justify-center gap-2 drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
                  <span className="text-2xl">💾</span>
                  CONTINUE GAME
                  <span className="text-2xl">💾</span>
                </span>
              </button>

              {/* Decorative divider */}
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="flex-1 h-2 bg-gradient-to-r from-transparent via-purple-300 to-transparent rounded-full"></div>
                <div className="text-2xl animate-spin-slow">⚡</div>
                <div className="flex-1 h-2 bg-gradient-to-r from-transparent via-purple-300 to-transparent rounded-full"></div>
              </div>

              {/* Info text in box */}
              <div className="bg-gradient-to-br from-yellow-200 to-yellow-300 border-4 border-yellow-400 rounded-xl p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                <p className="text-center text-purple-800 font-bold text-sm" style={{
                  fontFamily: 'Comic Sans MS, cursive'
                }}>
                  ✨ Track your scores the COOL way! ✨
                </p>
              </div>

              {/* Bottom stickers */}
              <div className="flex items-center justify-center gap-3 pt-2">
                {['🌟', '🎪', '🎨', '🎭', '🎸'].map((emoji, i) => (
                  <span
                    key={i}
                    className="text-3xl transform hover:scale-125 transition-transform cursor-pointer animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s`, animationDuration: '2s' }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom marquee-style text */}
          <div className="mt-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-1 rounded-full shadow-lg">
            <div className="bg-white rounded-full px-6 py-2">
              <p className="text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-black text-xs animate-pulse" style={{
                fontFamily: 'Comic Sans MS, cursive',
                letterSpacing: '0.1em'
              }}>
                ♪ MADE WITH LOVE IN 2026 ♪
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
