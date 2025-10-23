import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FiTool, FiSettings, FiZap, FiCheckCircle } from 'react-icons/fi';

export default function ServicesPage() {
  const services = [
    {
      id: 'entretien',
      icon: <FiTool className="w-16 h-16 text-accent" />,
      title: 'Entretien',
      description: 'Service complet d\'entretien pour maintenir votre véhicule en parfait état',
      details: [
        'Vidange moteur et filtres',
        'Contrôle des niveaux',
        'Vérification des freins',
        'Contrôle de la climatisation',
        'Diagnostic électronique',
      ],
      href: '/services/entretien',
    },
    {
      id: 'reparation',
      icon: <FiSettings className="w-16 h-16 text-accent" />,
      title: 'Réparation',
      description: 'Diagnostic et réparation de tous types de pannes avec du matériel professionnel',
      details: [
        'Diagnostic électronique complet',
        'Réparation mécanique',
        'Remplacement de pièces',
        'Réparation électrique',
        'Garantie sur les pièces et main d\'œuvre',
      ],
      href: '/services/reparation',
    },
    {
      id: 'reprogrammation',
      icon: <FiZap className="w-16 h-16 text-accent" />,
      title: 'Re-programmation',
      description: 'Optimisation des performances de votre moteur avec reprogrammation ECU professionnelle',
      details: [
        'Reprogrammation ECU Stage 1 & 2',
        'Optimisation du couple et de la puissance',
        'Amélioration de la consommation',
        'Suppression FAP/EGR',
        'Garantie moteur incluse',
      ],
      href: '/services/reprogrammation',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-dark-bg py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
            Nos Services
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Des prestations complètes pour l&apos;entretien, la réparation et l&apos;optimisation de votre véhicule
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service) => (
              <Card key={service.id} hover>
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {service.icon}
                  </div>
                  <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {service.description}
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  {service.details.map((detail, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <FiCheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>

                <Link href={service.href}>
                  <Button fullWidth variant="outline">
                    En savoir plus
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Besoin d&apos;un service pour votre véhicule ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Prenez rendez-vous en ligne en quelques clics
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
