import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FiTool, FiSettings, FiZap } from 'react-icons/fi';

export default function Home() {
  const services = [
    {
      icon: <FiTool className="w-12 h-12 text-accent" />,
      title: 'Entretien',
      description: 'Service complet d\'entretien pour maintenir votre véhicule en parfait état. Révision, vidange, filtres et plus encore.',
      href: '/services/entretien',
    },
    {
      icon: <FiSettings className="w-12 h-12 text-accent" />,
      title: 'Réparation',
      description: 'Diagnostic et réparation de tous types de pannes avec du matériel professionnel et des pièces de qualité.',
      href: '/services/reparation',
    },
    {
      icon: <FiZap className="w-12 h-12 text-accent" />,
      title: 'Re-programmation',
      description: 'Optimisation des performances de votre moteur avec reprogrammation ECU professionnelle.',
      href: '/services/reprogrammation',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-dark-bg py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
              LCF Auto Performance
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
              Votre garage de confiance pour l&apos;entretien, la réparation et l&apos;optimisation de votre véhicule
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/rendez-vous">
                <Button size="lg">
                  Prendre rendez-vous
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg">
                  Découvrir nos services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white dark:bg-dark-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Nos Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Une gamme complète de prestations pour prendre soin de votre véhicule
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service) => (
              <Link key={service.title} href={service.href}>
                <Card hover>
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      {service.icon}
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {service.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50 dark:bg-dark-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Pourquoi nous choisir ?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Expertise Professionnelle
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Une équipe de mécaniciens qualifiés et expérimentés
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Service Rapide
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Intervention efficace pour minimiser votre temps d&apos;immobilisation
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💯</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Qualité Garantie
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pièces de qualité et travail garanti pour votre satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Prêt à prendre rendez-vous ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Réservez en ligne en quelques clics et profitez d&apos;un service de qualité
          </p>
          <Link href="/rendez-vous">
            <button className="bg-white text-accent hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl">
              Prendre rendez-vous maintenant
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
