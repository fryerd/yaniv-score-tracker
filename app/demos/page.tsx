import Link from 'next/link';

export default function DemosPage() {
  const demos = [
    {
      name: 'Vegas (REFINED)',
      path: '/vegas-refined',
      description: 'Polished version with improved colors, typography, UX, and accessibility. THE CHOSEN DIRECTION.',
      color: 'from-[#0F5740] to-[#E5B94A]',
      badge: 'SELECTED'
    },
    {
      name: 'Vintage Vegas (Original)',
      path: '/vegas-demo',
      description: 'Original concept. Retro casino floor meets classic card table.',
      color: 'from-emerald-500 to-amber-500'
    },
    {
      name: 'Royal Court Prestige',
      path: '/royal-demo',
      description: 'Baccarat at Monaco. Luxurious, regal, impossibly elegant with gold accents.',
      color: 'from-purple-600 to-amber-400'
    },
    {
      name: 'Y2K Digital Playground',
      path: '/y2k-demo',
      description: 'Early 2000s internet vibes. Glossy buttons, chunky pixels, wild gradients.',
      color: 'from-cyan-400 via-purple-400 to-pink-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Design Explorations</h1>
          <p className="text-gray-400 text-lg">Choose your aesthetic adventure</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {demos.map((demo) => (
            <Link
              key={demo.path}
              href={demo.path}
              className={`group block bg-gray-800/50 rounded-2xl p-6 border transition-all hover:scale-105 hover:shadow-2xl ${
                demo.badge ? 'border-amber-500/50 ring-2 ring-amber-500/20' : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className={`h-32 rounded-lg bg-gradient-to-br ${demo.color} mb-4 group-hover:shadow-lg transition-shadow relative`}>
                {demo.badge && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-gray-900 text-xs font-bold px-2 py-1 rounded">
                    {demo.badge}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{demo.name}</h2>
              <p className="text-gray-400 text-sm">{demo.description}</p>
              <div className={`mt-4 text-sm font-semibold ${
                demo.badge ? 'text-amber-400 group-hover:text-amber-300' : 'text-indigo-400 group-hover:text-indigo-300'
              }`}>
                View Design →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block text-gray-400 hover:text-white transition-colors"
          >
            ← Back to current homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
