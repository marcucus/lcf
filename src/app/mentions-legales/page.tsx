import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions légales — LCF Auto Performance',
  description: 'Mentions légales de LCF Auto Performance, garage automobile à Saint-Bohaire.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Mentions légales</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Dernière mise à jour : février 2026</p>

        <div className="space-y-10 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Éditeur du site</h2>
            <p>
              <strong>Raison sociale :</strong> LCF Auto Performance<br />
              <strong>Forme juridique :</strong> Entreprise individuelle<br />
              <strong>Adresse :</strong> 6 Rue de la Forteresse, 41330 Saint-Bohaire, France<br />
              <strong>Téléphone :</strong> 07 61 88 82 63<br />
              <strong>Email :</strong> lcfautoperformance@outlook.fr<br />
              <strong>Responsable de publication :</strong> Gerant de LCF Auto Performance
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Hébergement</h2>
            <p>
              Ce site est hébergé par :<br />
              <strong>Vercel Inc.</strong><br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
              <a href="https://vercel.com" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, logos, icônes, etc.) est protégé par le droit d'auteur.
              Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation préalable écrite de
              LCF Auto Performance est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Données personnelles</h2>
            <p>
              Le traitement des données personnelles collectées via ce site est décrit dans notre{' '}
              <Link href="/politique-confidentialite" className="text-accent hover:underline">
                Politique de confidentialité
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Cookies</h2>
            <p>
              Ce site utilise des cookies techniques nécessaires à son fonctionnement (authentification, préférences
              d'affichage). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Liens hypertextes</h2>
            <p>
              LCF Auto Performance ne peut être tenu responsable du contenu des sites accessibles via des liens
              hypertextes présents sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français
              seront seuls compétents.
            </p>
          </section>

        </div>

        <div className="mt-12 flex gap-4 text-sm">
          <Link href="/politique-confidentialite" className="text-accent hover:underline">→ Politique de confidentialité</Link>
          <Link href="/conditions-utilisation" className="text-accent hover:underline">→ Conditions d'utilisation</Link>
        </div>
      </div>
    </div>
  );
}
