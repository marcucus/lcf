import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FiZap, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

export default function ReprogrammationPage() {
  const benefits = [
    'Augmentation de la puissance (+20 à +40%)',
    'Amélioration du couple moteur',
    'Réduction de la consommation de carburant',
    'Meilleure réactivité à l\'accélération',
    'Optimisation des paramètres moteur',
    'Suppression des limitations constructeur',
  ];

  const stages = [
    {
      title: 'Stage 1',
      description: 'Optimisation logicielle de base',
      power: '+20-30%',
      torque: '+25-35%',
      features: [
        'Reprogrammation ECU optimisée',
        'Amélioration progressive',
        'Compatible avec pièces d\'origine',
        'Garantie moteur incluse',
      ],
    },
    {
      title: 'Stage 2',
      description: 'Performance maximale',
      power: '+30-40%',
      torque: '+35-45%',
      features: [
        'Optimisation poussée',
        'Modifications matérielles possibles',
        'Downpipe et admission préconisés',
        'Garantie moteur incluse',
      ],
    },
  ];

  const vehicles = [
    'Toutes marques essence (Turbo)',
    'Tous véhicules diesel',
    'Véhicules agricoles',
    'Véhicules utilitaires',
    'Poids lourds',
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-dark-bg py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <FiZap className="w-20 h-20 text-accent" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
              Re-programmation ECU
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Optimisation professionnelle des performances de votre moteur avec reprogrammation ECU de qualité
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
              Les avantages de la reprogrammation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <FiCheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stages */}
      <section className="py-16 bg-gray-50 dark:bg-dark-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
              Nos formules de reprogrammation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {stages.map((stage, index) => (
                <div key={index} className="bg-white dark:bg-dark-bg p-8 rounded-2xl shadow-lg">
                  <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    {stage.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {stage.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-accent/10 dark:bg-accent/20 rounded-lg">
                      <FiTrendingUp className="w-8 h-8 text-accent mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stage.power}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Puissance
                      </div>
                    </div>
                    <div className="text-center p-4 bg-accent/10 dark:bg-accent/20 rounded-lg">
                      <FiZap className="w-8 h-8 text-accent mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stage.torque}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Couple
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {stage.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <FiCheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compatible Vehicles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
              Véhicules compatibles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((vehicle, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-dark-bg-secondary rounded-lg">
                  <FiCheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {vehicle}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Warranty */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Garantie moteur incluse
            </h2>
            <p className="text-xl text-white/90 mb-6">
              Toutes nos reprogrammations sont garanties et réalisées dans le respect total de la mécanique de votre véhicule.
            </p>
            <p className="text-white/80">
              Nous utilisons les meilleurs outils de reprogrammation du marché et nos fichiers sont développés sur banc de puissance.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Libérez le potentiel de votre moteur
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Contactez-nous pour un devis personnalisé et découvrez les gains possibles sur votre véhicule
          </p>
          <Link href="/rendez-vous">
            <button className="bg-white text-accent hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl">
              Prendre rendez-vous
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
