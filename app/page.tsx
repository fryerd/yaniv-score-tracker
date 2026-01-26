export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Yaniv Score Tracker</h1>
          <p className="text-gray-600">Track your card game scores with ease</p>
        </div>

        <div className="space-y-3">
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            New Game
          </button>

          <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors">
            Continue Game
          </button>
        </div>

        <div className="text-center text-sm text-gray-500 pt-4">
          Built with Next.js & TypeScript
        </div>
      </div>
    </div>
  );
}
