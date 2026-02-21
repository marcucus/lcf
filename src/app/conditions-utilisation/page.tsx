import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Conditions d'utilisation — LCF Auto Performance",
  description: "Conditions générales d'utilisation du site et des services de LCF Auto Performance.",
};

export default function ConditionsUtilisationPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Conditions d'utilisation
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
          Dernière mise à jour : février 2026
        </p>

        <div className="space-y-10 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Objet</h2>
            <p>
              Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation
              du site internet et de l'application web de LCF Auto Performance (ci-après « le Service »),
              éditée par LCF Auto Performance, 6 Rue de la Forteresse, 41330 Saint-Bohaire, France.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Acceptation</h2>
            <p>
              L'utilisation du Service implique l'acceptation pleine et entière des présentes CGU.
              Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Accès au Service</h2>
            <p className="mb-2">
              L'accès à certaines fonctionnalités (prise de rendez-vous, espace client, programme de fidélité)
              nécessite la création d'un compte. Vous devez :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Être âgé(e) d'au moins 18 ans ou avoir l'autorisation d'un responsable légal</li>
              <li>Fournir des informations exactes, complètes et à jour</li>
              <li>Maintenir la confidentialité de vos identifiants</li>
              <li>Notifier immédiatement LCF Auto Performance en cas d'utilisation non autorisée de votre compte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Prise de rendez-vous</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>La prise de rendez-vous en ligne constitue une demande de réservation soumise à confirmation de notre part.</li>
              <li>Vous pouvez annuler ou modifier un rendez-vous <strong>au moins 24 heures avant</strong> la date prévue via votre espace client. En deçà de ce délai, contactez-nous directement par téléphone.</li>
              <li>En cas de rendez-vous manqué sans annulation préalable, LCF Auto Performance se réserve le droit de restreindre la prise de rendez-vous en ligne.</li>
              <li>Un maximum de <strong>3 rendez-vous simultanés</strong> à venir peut être réservé par utilisateur.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Programme de fidélité</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Les points de fidélité sont attribués selon les règles en vigueur, susceptibles d'être modifiées.</li>
              <li>Les points n'ont aucune valeur monétaire et ne peuvent être ni cédés ni échangés contre de l'argent.</li>
              <li>LCF Auto Performance se réserve le droit de modifier ou de clôturer le programme de fidélité avec un préavis de 30 jours.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Comportement de l'utilisateur</h2>
            <p className="mb-2">Il est interdit de :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fournir de fausses informations lors de l'inscription ou des prises de rendez-vous</li>
              <li>Utiliser le Service à des fins illicites ou frauduleuses</li>
              <li>Tenter d'accéder illégalement aux systèmes ou aux données d'autres utilisateurs</li>
              <li>Perturber ou surcharger les serveurs du Service</li>
              <li>Reproduire ou exploiter commercialement le contenu du site sans autorisation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Responsabilité</h2>
            <p className="mb-2">
              LCF Auto Performance met tout en œuvre pour assurer la disponibilité et la fiabilité du Service,
              mais ne peut garantir une disponibilité ininterrompue. LCF Auto Performance ne saurait être tenu
              responsable :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Des interruptions temporaires de service dues à des maintenances ou incidents techniques</li>
              <li>Des dommages indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le Service</li>
              <li>Du contenu de sites tiers accessibles par des liens présents sur le Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Résiliation du compte</h2>
            <p>
              Vous pouvez demander la suppression de votre compte à tout moment en nous contactant à{' '}
              <a href="mailto:lcfautoperformance@outlook.fr" className="text-accent hover:underline">
                lcfautoperformance@outlook.fr
              </a>.
              LCF Auto Performance se réserve également le droit de suspendre ou supprimer tout compte
              en cas de violation des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Modifications des CGU</h2>
            <p>
              LCF Auto Performance peut modifier ces CGU à tout moment. Les modifications entrent en vigueur
              dès leur publication sur cette page. Votre utilisation continue du Service après modification
              vaut acceptation des nouvelles CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Droit applicable — Litiges</h2>
            <p>
              Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable
              sera recherchée en priorité. À défaut, les tribunaux compétents du ressort de Blois
              (41000, France) seront saisis.
            </p>
            <p className="mt-2">
              Conformément à l'article L. 612-1 du Code de la consommation, vous pouvez également recourir
              gratuitement à un médiateur de la consommation.
            </p>
          </section>

        </div>

        <div className="mt-12 flex gap-4 text-sm">
          <Link href="/politique-confidentialite" className="text-accent hover:underline">→ Politique de confidentialité</Link>
          <Link href="/mentions-legales" className="text-accent hover:underline">→ Mentions légales</Link>
        </div>
      </div>
    </div>
  );
}
