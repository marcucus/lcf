import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function VehiculesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-dark-bg py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
            Véhicules d&apos;occasion
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Découvrez notre sélection de véhicules de qualité, contrôlés et garantis
          </p>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🚗</div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  Catalogue en préparation
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Notre catalogue de véhicules d&apos;occasion sera bientôt disponible. 
                  Nous sélectionnons pour vous les meilleures opportunités.
                </p>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    En attendant, n&apos;hésitez pas à nous contacter pour connaître nos véhicules disponibles.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact">
                      <Button>
                        Nous contacter
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline">
                        Retour à l&apos;accueil
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-dark-bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
            Ce que nous proposons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Véhicules contrôlés
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tous nos véhicules sont contrôlés et révisés avant la vente
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Garantie incluse
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Garantie constructeur ou extension de garantie disponible
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Financement
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Solutions de financement adaptées à votre budget
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
