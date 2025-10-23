import Link from 'next/link';
import { FiFacebook, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-dark-bg-secondary border-t border-light-border dark:border-dark-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
              LCF AUTO PERFORMANCE
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Votre garage de confiance pour l&apos;entretien, la réparation et l&apos;optimisation de votre véhicule.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Liens Rapides
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services" className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  Nos Services
                </Link>
              </li>
              <li>
                <Link href="/vehicules" className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  Véhicules d&apos;occasion
                </Link>
              </li>
              <li>
                <Link href="/rendez-vous" className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  Prendre rendez-vous
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <FiMapPin className="w-4 h-4 mt-1 text-accent flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">
                  123 Rue de l&apos;Automobile, 75000 Paris
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <FiPhone className="w-4 h-4 text-accent flex-shrink-0" />
                <a href="tel:+33123456789" className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  01 23 45 67 89
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <FiMail className="w-4 h-4 text-accent flex-shrink-0" />
                <a href="mailto:contact@lcf-auto.fr" className="text-gray-600 dark:text-gray-400 hover:text-accent transition-colors">
                  contact@lcf-auto.fr
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours & Social */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">
              Horaires
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Lundi - Vendredi<br />
              10:00 - 12:00<br />
              14:00 - 18:00
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-accent hover:text-white transition-colors"
              >
                <FiFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-accent hover:text-white transition-colors"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-light-border dark:border-dark-border text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} LCF AUTO PERFORMANCE - Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
}
