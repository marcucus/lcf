'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  verifyPasswordResetCode, 
  confirmPasswordReset,
  applyActionCode,
  checkActionCode
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FiCheckCircle, FiAlertCircle, FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';

function AuthActionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [mode, setMode] = useState<string | null>(null);
  const [actionCode, setActionCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const codeParam = searchParams.get('oobCode');
    
    setMode(modeParam);
    setActionCode(codeParam);

    if (modeParam && codeParam && auth) {
      verifyActionCode(modeParam, codeParam);
    } else {
      setVerifying(false);
      setError('Lien invalide ou expiré');
    }
  }, [searchParams]);

  const verifyActionCode = async (mode: string, code: string) => {
    if (!auth) {
      setVerifying(false);
      setError('Service d\'authentification non disponible');
      return;
    }

    try {
      if (mode === 'resetPassword') {
        const userEmail = await verifyPasswordResetCode(auth, code);
        setEmail(userEmail);
      } else if (mode === 'verifyEmail') {
        const info = await checkActionCode(auth, code);
        setEmail(info.data.email || '');
      }
      setVerifying(false);
    } catch (err: any) {
      console.error('Error verifying action code:', err);
      setVerifying(false);
      if (err.code === 'auth/invalid-action-code') {
        setError('Ce lien a expiré ou a déjà été utilisé');
      } else {
        setError('Une erreur s\'est produite. Veuillez réessayer.');
      }
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!actionCode || !auth) return;
    
    // Validation
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/invalid-action-code') {
        setError('Ce lien a expiré ou a déjà été utilisé');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe est trop faible');
      } else {
        setError('Erreur lors de la réinitialisation. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = async () => {
    if (!actionCode || !auth) return;

    setLoading(true);
    setError('');

    try {
      await applyActionCode(auth, actionCode);
      setSuccess(true);
    } catch (err: any) {
      console.error('Email verification error:', err);
      if (err.code === 'auth/invalid-action-code') {
        setError('Ce lien a expiré ou a déjà été utilisé');
      } else {
        setError('Erreur lors de la vérification. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Faible', color: 'bg-red-500' };
    if (password.length < 10) return { strength: 2, label: 'Moyen', color: 'bg-yellow-500' };
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: 'Fort', color: 'bg-green-500' };
    }
    return { strength: 2, label: 'Moyen', color: 'bg-yellow-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Loading State
  if (verifying) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-bg-secondary">
        <Card className="w-full max-w-md text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Vérification en cours...</p>
        </Card>
      </div>
    );
  }

  // Error State (Invalid/Expired Link)
  if (error && !mode) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-bg-secondary">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <div className="relative w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <FiAlertCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
              Lien invalide
            </h1>
          </div>
          
          <Card>
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <Link href="/reset-password">
                <Button fullWidth>
                  Demander un nouveau lien
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" fullWidth>
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Password Reset Mode
  if (mode === 'resetPassword') {
    if (success) {
      return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-bg-secondary">
          <div className="w-full max-w-md animate-fade-in">
            <Card>
              <div className="text-center py-8 space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full animate-ping" />
                  </div>
                  <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto relative" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Mot de passe réinitialisé !
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Votre mot de passe a été modifié avec succès.
                  </p>
                </div>

                <Button fullWidth onClick={() => router.push('/login')}>
                  Se connecter
                </Button>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-bg-secondary">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 flex items-center justify-center shadow-lg">
                <FiLock className="w-10 h-10 text-accent" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-accent to-cyan-400 bg-clip-text text-transparent">
              Nouveau mot de passe
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Définissez un nouveau mot de passe pour <span className="font-semibold text-accent">{email}</span>
            </p>
          </div>

          <Card>
            <form onSubmit={handlePasswordReset} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  <p className="font-medium">❌ {error}</p>
                </div>
              )}

              <div className="relative">
                <Input
                  label="Nouveau mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Force du mot de passe</span>
                    <span className={`font-medium ${
                      passwordStrength.strength === 1 ? 'text-red-500' :
                      passwordStrength.strength === 2 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Utilisez au moins 10 caractères avec des majuscules et des chiffres pour un mot de passe fort
                  </p>
                </div>
              )}

              <Input
                label="Confirmer le mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
              />

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mise à jour...
                  </span>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Email Verification Mode
  if (mode === 'verifyEmail') {
    if (success) {
      return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-bg-secondary">
          <div className="w-full max-w-md animate-fade-in">
            <Card>
              <div className="text-center py-8 space-y-6">
                <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Email vérifié !
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Votre adresse email a été vérifiée avec succès.
                  </p>
                </div>
                <Button fullWidth onClick={() => router.push('/dashboard')}>
                  Accéder au tableau de bord
                </Button>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-bg-secondary">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-accent/20 to-accent/10 flex items-center justify-center shadow-lg">
                <FiMail className="w-10 h-10 text-accent" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-accent to-cyan-400 bg-clip-text text-transparent">
              Vérification d'email
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Cliquez sur le bouton ci-dessous pour vérifier votre email
            </p>
          </div>

          <Card>
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button fullWidth onClick={handleEmailVerification} disabled={loading}>
                {loading ? 'Vérification...' : 'Vérifier mon email'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Default/Unknown Mode
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md text-center">
        <p className="text-gray-600 dark:text-gray-400">Action non reconnue</p>
        <Link href="/login" className="mt-4 inline-block">
          <Button variant="outline">Retour à la connexion</Button>
        </Link>
      </Card>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
      </div>
    }>
      <AuthActionContent />
    </Suspense>
  );
}
