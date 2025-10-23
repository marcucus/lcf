'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FiCheckCircle } from 'react-icons/fi';

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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-dark-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
            Réinitialiser le mot de passe
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <Card>
          {success ? (
            <div className="text-center py-8">
              <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Email envoyé !
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
              </p>
              <Link href="/login">
                <Button variant="outline" fullWidth>
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-accent hover:underline">
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
