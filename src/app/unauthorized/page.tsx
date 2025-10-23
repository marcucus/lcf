import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FiAlertTriangle } from 'react-icons/fi';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-dark-bg">
      <div className="text-center max-w-md">
        <FiAlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          Accès refusé
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline">
              Retour à l&apos;accueil
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button>
              Mon tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
