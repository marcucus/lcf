import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FiTool, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function EntretienPage() {
  const services = [
    'Vidange moteur avec huile de qualité',
    'Remplacement du filtre à huile',
    'Remplacement du filtre à air',
    'Remplacement du filtre à carburant',
    'Contrôle et remplacement des bougies',
    'Contrôle des niveaux (liquide de refroidissement, frein, direction)',
    'Vérification de la batterie',
    'Contrôle du système de freinage',
    'Vérification des pneumatiques et pression',
    'Contrôle de la climatisation',
    'Diagnostic électronique complet',
    'Réinitialisation du témoin d\'entretien',
  ];

  const benefits = [
    {
      icon: <FiCheckCircle className="w-8 h-8 text-accent" />,
      title: 'Longévité du véhicule',
      description: 'Un entretien régulier prolonge la durée de vie de votre moteur',
    },
    {
      icon: <FiClock className="w-8 h-8 text-accent" />,
      title: 'Économies à long terme',
      description: 'Prévenir les pannes coûteuses grâce à un entretien préventif',
    },
    {
      icon: <FiTool className="w-8 h-8 text-accent" />,
      title: 'Performance optimale',
      description: 'Maintenez les performances d\'origine de votre véhicule',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-dark-bg py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <FiTool className="w-20 h-20 text-accent" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
              Entretien
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Service complet d&apos;entretien automobile pour maintenir votre véhicule en parfait état de fonctionnement
            </p>
          </div>
        </div>
      </section>

      {/* Services Included */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
              Notre prestation d&apos;entretien inclut
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

      {/* Benefits */}
      <section className="py-16 bg-gray-50 dark:bg-dark-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
              Pourquoi un entretien régulier ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Frequency Recommendation */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-accent/10 dark:bg-accent/20 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Fréquence recommandée
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Nous recommandons un entretien complet tous les <strong>15 000 km</strong> ou <strong>une fois par an</strong>, selon ce qui arrive en premier.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consultez le carnet d&apos;entretien de votre véhicule pour les recommandations spécifiques du constructeur.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Votre véhicule a besoin d&apos;un entretien ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Prenez rendez-vous dès maintenant pour un service d&apos;entretien complet
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
