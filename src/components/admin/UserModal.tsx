'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FiX } from 'react-icons/fi';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  user?: User | null;
  mode: 'create' | 'edit';
}

export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode,
}: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        setFormData({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        });
      } else {
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          role: 'user',
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.role) {
      newErrors.role = 'Le rôle est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error handling could be improved with a toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border sticky top-0 bg-white dark:bg-dark-bg-secondary z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Créer un utilisateur' : 'Modifier l\'utilisateur'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Email */}
            <Input
              label="Adresse email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="exemple@email.com"
              required
              disabled={mode === 'edit'} // Email shouldn't be editable
            />

            {/* First Name */}
            <Input
              label="Prénom"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={errors.firstName}
              placeholder="Jean"
              required
            />

            {/* Last Name */}
            <Input
              label="Nom"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={errors.lastName}
              placeholder="Dupont"
              required
            />

            {/* Role */}
            <Select
              label="Rôle"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value as UserRole)}
              error={errors.role}
              required
              options={[
                { value: 'user', label: 'Utilisateur' },
                { value: 'agendaManager', label: 'Gestionnaire d\'Agenda' },
                { value: 'admin', label: 'Administrateur' },
              ]}
            />

            {/* Info note for create mode */}
            {mode === 'create' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  ℹ️ Note : L&apos;utilisateur recevra un email pour définir son mot de passe.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-6 pt-6 border-t border-light-border dark:border-dark-border">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              fullWidth
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting
                ? mode === 'create'
                  ? 'Création...'
                  : 'Mise à jour...'
                : mode === 'create'
                ? 'Créer'
                : 'Mettre à jour'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
