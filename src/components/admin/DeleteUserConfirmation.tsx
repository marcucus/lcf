'use client';

import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface DeleteUserConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  user: User | null;
  isDeleting?: boolean;
}

export function DeleteUserConfirmation({
  isOpen,
  onClose,
  onConfirm,
  user,
  isDeleting = false,
}: DeleteUserConfirmationProps) {
  if (!isOpen || !user) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Confirmer la suppression
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Êtes-vous sûr de vouloir supprimer l&apos;utilisateur suivant ?
          </p>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Nom complet
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </p>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 mb-1">
              Email
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {user.email}
            </p>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 mb-1">
              Rôle
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {user.role === 'admin' ? 'Administrateur' : 
               user.role === 'agendaManager' ? 'Gestionnaire d\'Agenda' : 
               'Utilisateur'}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">
              ⚠️ Attention : Cette action est irréversible
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-2">
              Le compte utilisateur et toutes ses données seront définitivement supprimés.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="secondary"
              fullWidth
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              fullWidth
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
