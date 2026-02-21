import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — LCF Auto Performance',
  description:
    'Comment LCF Auto Performance collecte, utilise et protège vos données personnelles.',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
          Dernière mise à jour : février 2026
        </p>

        <div className="space-y-10 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Identité du responsable de traitement</h2>
            <p>
              LCF Auto Performance, 6 Rue de la Forteresse, 41330 Saint-Bohaire, France.<br />
              Contact : <a href="mailto:lcfautoperformance@outlook.fr" className="text-accent hover:underline">lcfautoperformance@outlook.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Données collectées</h2>
            <p className="mb-2">Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Données d'identité :</strong> prénom, nom</li>
              <li><strong>Données de contact :</strong> adresse email, numéro de téléphone (si renseigné)</li>
              <li><strong>Données de véhicule :</strong> marque, modèle, immatriculation</li>
              <li><strong>Données de rendez-vous :</strong> type de prestation, date et heure, notes</li>
              <li><strong>Données de facturation :</strong> devis et factures associés à votre compte</li>
              <li><strong>Données de connexion :</strong> adresse IP, date et heure de connexion (journaux serveur)</li>
              <li><strong>Données de fidélité :</strong> points cumulés, récompenses obtenues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Finalités et bases légales</h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="text-left p-2 border border-gray-200 dark:border-gray-700">Finalité</th>
                  <th className="text-left p-2 border border-gray-200 dark:border-gray-700">Base légale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-gray-200 dark:border-gray-700">Gestion des comptes et authentification</td>
                  <td className="p-2 border border-gray-200 dark:border-gray-700">Exécution du contrat</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td className="p-2 border border-gray-200 dark:border-gray-700">Prise et gestion des rendez-vous</td>
                  <td className="p-2 border border-gray-200 dark:border-gray-700">Exécution du contrat</td>
                </tr>
                <tr>
                  <td className="p-2 border border-gray-200 dark:border-gray-700">Émission de devis et factures</td>
                  <td className="p-2 border border-gray-200 dark:border-gray-700">Obligation légale (comptabilité)</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td className="p-2 border border-gray-200 dark:border-gray-700">Envoi d'emails transactionnels (confirmations, rappels)</td>
                  <td className="p-2 border border-gray-200 dark:border-gray-700">Exécution du contrat / intérêt légitime</td>
                </tr>
                <tr>
                  <td className="p-2 border border-gray-200 dark:border-gray-700">Programme de fidélité</td>
                  <td className="p-2 border border-gray-200 dark:border-gray-700">Consentement</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td className="p-2 border border-gray-200 dark:border-gray-700">Sécurité et lutte contre la fraude</td>
                  <td className="p-2 border border-gray-200 dark:border-gray-700">Intérêt légitime</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Sous-traitants et transferts</h2>
            <p className="mb-2">Nous faisons appel aux sous-traitants suivants :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Google Firebase</strong> (authentification, base de données, notifications push) — États-Unis, couvert par les clauses contractuelles types de la Commission européenne</li>
              <li><strong>Resend Inc.</strong> (envoi d'emails transactionnels) — États-Unis, couvert par les clauses contractuelles types</li>
              <li><strong>Vercel Inc.</strong> (hébergement du site) — États-Unis, couvert par les clauses contractuelles types</li>
            </ul>
            <p className="mt-2">Aucune donnée n'est revendue à des tiers à des fins commerciales.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Durée de conservation</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Données de compte :</strong> durée de vie du compte + 3 ans après la dernière activité</li>
              <li><strong>Rendez-vous :</strong> 5 ans (obligation légale de traçabilité commerciale)</li>
              <li><strong>Factures :</strong> 10 ans (obligation comptable légale)</li>
              <li><strong>Journaux de connexion :</strong> 12 mois</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Vos droits (RGPD)</h2>
            <p className="mb-2">Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> supprimer vos données dans les cas prévus par la loi</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
              <li><strong>Droit à la limitation :</strong> restreindre un traitement en cours</li>
            </ul>
            <p className="mt-3">
              Pour exercer vos droits, contactez-nous à :{' '}
              <a href="mailto:lcfautoperformance@outlook.fr" className="text-accent hover:underline">
                lcfautoperformance@outlook.fr
              </a>
              . Vous pouvez également introduire une réclamation auprès de la{' '}
              <a href="https://www.cnil.fr" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                CNIL
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
              chiffrement des communications (HTTPS/TLS), authentification sécurisée via Firebase Auth,
              règles d'accès Firestore restrictives, et accès limité aux données par rôle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Cookies</h2>
            <p>
              Ce site utilise uniquement des cookies techniques strictement nécessaires au fonctionnement
              (session d'authentification Firebase, préférence de thème). Aucun cookie publicitaire
              ou de suivi comportemental n'est déposé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique à tout moment. La date de dernière
              mise à jour est indiquée en haut de cette page. En cas de modification substantielle,
              nous vous en informerons par email.
            </p>
          </section>

        </div>

        <div className="mt-12 flex gap-4 text-sm">
          <Link href="/mentions-legales" className="text-accent hover:underline">→ Mentions légales</Link>
          <Link href="/conditions-utilisation" className="text-accent hover:underline">→ Conditions d'utilisation</Link>
        </div>
      </div>
    </div>
  );
}
