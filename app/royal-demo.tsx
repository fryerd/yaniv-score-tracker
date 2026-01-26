'use client';

export default function RoyalDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1729] via-[#1a1f3a] to-[#2d1b4e] relative overflow-hidden">
      {/* Ornate background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z' fill='%23d4af37' /%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px'
      }}></div>

      {/* Luxury gradient overlays */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px]"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Crown emblem */}
          <div className="text-center mb-8 animate-[fadeIn_1s_ease-out]">
            <div className="inline-block relative">
              {/* Ornate border */}
              <div className="absolute -inset-8 border-2 border-amber-400/20 rounded-full"></div>
              <div className="absolute -inset-6 border border-amber-400/30 rounded-full"></div>

              <svg className="w-16 h-16 mx-auto mb-4 text-amber-400 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L15 9L23 9.5L16.5 15L18.5 23L12 18.5L5.5 23L7.5 15L1 9.5L9 9L12 1Z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12 space-y-3">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400/50"></div>
              <span className="text-amber-400/60 text-xs tracking-[0.5em] uppercase font-light">Royal Game of</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400/50"></div>
            </div>

            <h1 className="text-7xl font-serif font-light text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 tracking-wide relative">
              YANIV
              <div className="absolute inset-0 bg-gradient-to-b from-amber-400 to-amber-600 blur-xl opacity-30 -z-10"></div>
            </h1>

            <p className="text-amber-100/50 text-sm tracking-[0.3em] uppercase font-light">Score Registry</p>
          </div>

          {/* Main card */}
          <div className="relative">
            {/* Decorative corner elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-amber-400/40"></div>
            <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-amber-400/40"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-amber-400/40"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-amber-400/40"></div>

            <div className="bg-gradient-to-b from-[#1a1f3a]/80 to-[#0f1729]/80 backdrop-blur-xl border border-amber-400/20 p-10 relative overflow-hidden">
              {/* Silk texture overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(45deg, transparent 48%, rgba(212,175,55,0.5) 49%, rgba(212,175,55,0.5) 51%, transparent 52%)',
                backgroundSize: '10px 10px'
              }}></div>

              <div className="relative space-y-6">
                {/* New Game Button */}
                <button className="group w-full relative bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 text-[#0f1729] font-serif font-semibold text-xl py-6 px-8 transition-all duration-300 overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)]">
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  {/* Border accent */}
                  <div className="absolute inset-0 border-2 border-amber-300/50"></div>
                  <div className="absolute inset-[4px] border border-amber-200/30"></div>

                  <span className="relative tracking-[0.2em] uppercase flex items-center justify-center gap-3">
                    <span className="text-xs">◆</span>
                    Commence New Match
                    <span className="text-xs">◆</span>
                  </span>
                </button>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-amber-400/20"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#1a1f3a] px-4 text-amber-400/40 text-xs">OR</span>
                  </div>
                </div>

                {/* Continue Game Button */}
                <button className="group w-full relative bg-transparent hover:bg-white/5 text-amber-200 font-serif font-light text-lg py-5 px-8 border-2 border-amber-400/30 hover:border-amber-400/50 transition-all duration-300">
                  <span className="relative tracking-[0.15em] uppercase flex items-center justify-center gap-2 text-sm">
                    <span className="text-xs">✦</span>
                    Resume Previous Game
                    <span className="text-xs">✦</span>
                  </span>
                </button>

                {/* Decorative flourish */}
                <div className="flex items-center justify-center gap-3 pt-6 text-amber-400/30">
                  <span className="text-xs">❋</span>
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
                  <span className="text-xs">✦</span>
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"></div>
                  <span className="text-xs">❋</span>
                </div>

                {/* Footer text */}
                <p className="text-center text-amber-100/30 text-xs font-serif italic tracking-wide pt-2">
                  "Where nobility plays with honour"
                </p>
              </div>
            </div>
          </div>

          {/* Bottom crest */}
          <div className="text-center mt-8 opacity-30">
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs tracking-widest font-light">
              <span>EST</span>
              <span className="text-lg">◆</span>
              <span>MMXXVI</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
