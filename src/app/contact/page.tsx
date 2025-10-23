import { Card } from '@/components/ui/Card';
import { FiMapPin, FiPhone, FiMail, FiClock, FiFacebook, FiInstagram } from 'react-icons/fi';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-dark-bg py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Contact Cards */}
            <div className="space-y-6">
              <Card>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <FiMapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      Adresse
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      123 Rue de l&apos;Automobile<br />
                      75000 Paris<br />
                      France
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <FiPhone className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      Téléphone
                    </h3>
                    <a href="tel:+33123456789" className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                      01 23 45 67 89
                    </a>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <FiMail className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      Email
                    </h3>
                    <a href="mailto:contact@lcf-auto.fr" className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                      contact@lcf-auto.fr
                    </a>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <FiClock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      Horaires d&apos;ouverture
                    </h3>
                    <div className="text-gray-600 dark:text-gray-400 space-y-1">
                      <p><strong>Lundi - Vendredi</strong></p>
                      <p>10:00 - 12:00</p>
                      <p>14:00 - 18:00</p>
                      <p className="mt-2"><strong>Samedi - Dimanche</strong></p>
                      <p>Fermé</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <FiFacebook className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      Suivez-nous
                    </h3>
                    <div className="flex space-x-4">
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-accent hover:text-white transition-colors"
                      >
                        <FiFacebook className="w-5 h-5" />
                      </a>
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-accent hover:text-white transition-colors"
                      >
                        <FiInstagram className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Map */}
            <div className="h-[600px] rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937586!2d2.292292615674447!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fec70fb1483%3A0x40b82c3688c9460!2sParis%2C%20France!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="LCF Auto Performance Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Une question ? Un devis ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            N&apos;hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais
          </p>
          <a href="tel:+33123456789">
            <button className="bg-white text-accent hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl">
              Appelez-nous
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}
