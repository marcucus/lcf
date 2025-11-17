'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FiCheckCircle, FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Aucun compte n\'est associé à cette adresse email');
      } else {
        setError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.');
      }
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-bg-secondary">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header Section with Logo and Back Button */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <Link 
              href="/login" 
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
            >
              <FiArrowLeft className="mr-1" />
              Retour
            </Link>
            <div className="flex-1" />
          </div>
          
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 flex items-center justify-center shadow-lg">
              <FiLock className="w-10 h-10 text-accent" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-accent to-cyan-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Mot de passe oublié ?
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">
            Pas d'inquiétude, nous allons vous aider à le réinitialiser
          </p>
        </div>

        <Card className="animate-slide-up">
          {success ? (
            <div className="text-center py-8 space-y-6">
              {/* Success Animation */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full animate-ping" />
                </div>
                <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto relative animate-bounce-slow" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Email envoyé avec succès !
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Nous avons envoyé un lien de réinitialisation à
                  </p>
                  <p className="font-semibold text-accent">{email}</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left space-y-2">
                <div className="flex items-start">
                  <FiMail className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-medium mb-1">Vérifiez votre boîte de réception</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Cliquez sur le lien dans l'email pour créer un nouveau mot de passe. 
                      Le lien expirera dans 1 heure.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resend Option */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Vous n'avez pas reçu l'email ?{' '}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-accent hover:underline font-medium"
                >
                  Renvoyer
                </button>
              </div>

              <Link href="/login">
                <Button variant="outline" fullWidth>
                  <FiArrowLeft className="mr-2" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informational Banner */}
              <div className="bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/30 rounded-lg p-4">
                <div className="flex items-start">
                  <FiMail className="w-5 h-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-medium mb-1">Réinitialisation sécurisée</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Entrez votre adresse email et nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg text-sm animate-slide-down">
                  <p className="font-medium">❌ {error}</p>
                </div>
              )}

              <Input
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
                autoFocus
              />

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </span>
                ) : (
                  'Envoyer le lien de réinitialisation'
                )}
              </Button>

              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  href="/login" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent transition-colors inline-flex items-center"
                >
                  <FiArrowLeft className="mr-1" />
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </Card>

        {/* Footer Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Besoin d'aide ? Contactez-nous au{' '}
            <a href="tel:+33123456789" className="text-accent hover:underline font-medium">
              01 23 45 67 89
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
