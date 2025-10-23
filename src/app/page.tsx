export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            LCF Auto Performance
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Votre garage de confiance pour l&apos;entretien, la réparation et la re-programmation de votre véhicule.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🔧</div>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                Entretien
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Service complet d&apos;entretien pour maintenir votre véhicule en parfait état.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🛠️</div>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                Réparation
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Diagnostic et réparation de tous types de pannes avec du matériel professionnel.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                Re-programmation
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Optimisation des performances de votre moteur avec reprogrammation ECU.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <button className="bg-cyan-400 hover:bg-cyan-500 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl">
              Prendre rendez-vous
            </button>
          </div>
        </div>
      </main>
      
      <footer className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>&copy; 2024 LCF Auto Performance - Tous droits réservés</p>
      </footer>
    </div>
  );
}
