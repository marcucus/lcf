'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FcGoogle } from 'react-icons/fc';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/[a-z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }
    if (!/[0-9]/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Cette adresse email est déjà utilisée');
      } else {
        setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError('Erreur lors de l\'inscription avec Google');
      console.error('Google sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-dark-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
            Inscription
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Créez votre compte LCF Auto Performance
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Jean"
                required
                autoComplete="given-name"
              />

              <Input
                label="Nom"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Dupont"
                required
                autoComplete="family-name"
              />
            </div>

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              required
              autoComplete="email"
            />

            <Input
              label="Mot de passe"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <div className="text-xs text-gray-600 dark:text-gray-400">
              Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.
            </div>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-bg-secondary text-gray-500 dark:text-gray-400">
                  Ou s&apos;inscrire avec
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <FcGoogle className="w-5 h-5" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Google
              </span>
            </button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Déjà un compte ?{' '}
            </span>
            <Link href="/login" className="text-accent hover:underline font-medium">
              Se connecter
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
