import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FiSettings, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function ReparationPage() {
  const services = [
    'Diagnostic électronique complet avec valise multimarque',
    'Réparation moteur (distribution, joint de culasse, etc.)',
    'Réparation et remplacement de l\'embrayage',
    'Système de freinage (plaquettes, disques, étriers)',
    'Suspension et amortisseurs',
    'Système électrique et électronique',
    'Climatisation (recharge, réparation)',
    'Échappement et catalyseur',
    'Boîte de vitesses',
    'Système de refroidissement',
    'Direction assistée',
    'Remplacement de pneumatiques',
  ];

  const diagnosticSteps = [
    {
      step: '1',
      title: 'Diagnostic précis',
      description: 'Analyse complète avec notre équipement professionnel',
    },
    {
      step: '2',
      title: 'Devis détaillé',
      description: 'Explication claire des réparations nécessaires et des coûts',
    },
    {
      step: '3',
      title: 'Réparation',
      description: 'Intervention rapide avec des pièces de qualité',
    },
    {
      step: '4',
      title: 'Garantie',
      description: 'Garantie sur les pièces et la main d\'œuvre',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-dark-bg py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <FiSettings className="w-20 h-20 text-accent" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
              Réparation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Diagnostic et réparation de tous types de pannes avec du matériel professionnel et des techniciens qualifiés
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
              Nos interventions de réparation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <FiCheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-gray-50 dark:bg-dark-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
              Notre processus de réparation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {diagnosticSteps.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Warning Signs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
              Signes d&apos;alerte
            </h2>
            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-6 rounded-lg">
              <div className="flex items-start space-x-4">
                <FiAlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Consultez-nous rapidement si vous constatez :
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• Voyants d&apos;alerte allumés sur le tableau de bord</li>
                    <li>• Bruits inhabituels (grincements, claquements, sifflements)</li>
                    <li>• Perte de puissance ou consommation excessive</li>
                    <li>• Vibrations anormales</li>
                    <li>• Fumée excessive à l&apos;échappement</li>
                    <li>• Fuites de liquide sous le véhicule</li>
                    <li>• Difficulté au démarrage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Un problème avec votre véhicule ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Prenez rendez-vous pour un diagnostic gratuit et un devis détaillé
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
