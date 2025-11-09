'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { db, auth } from '@/lib/firebase/config';
import { collection, query, getDocs, Timestamp } from 'firebase/firestore';
import { GoogleOAuthConfig } from '@/types';

function GoogleReviewsPage() {
  const [oauthConfig, setOauthConfig] = useState<GoogleOAuthConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load OAuth configuration
  useEffect(() => {
    loadOAuthConfig();
  }, []);

  const loadOAuthConfig = async () => {
    try {
      setLoading(true);
      if (!db) {
        setError('Firebase non configuré');
        return;
      }
      
      const configQuery = query(collection(db, 'googleOAuthConfig'));
      const snapshot = await getDocs(configQuery);
      
      if (!snapshot.empty) {
        const configData = snapshot.docs[0].data() as GoogleOAuthConfig;
        setOauthConfig({
          ...configData,
          configId: snapshot.docs[0].id,
        });
      }
    } catch (err) {
      console.error('Error loading OAuth config:', err);
      setError('Erreur lors du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Get user auth token
      if (!auth?.currentUser) {
        setError('Vous devez être connecté');
        return;
      }
      
      const token = await auth.currentUser.getIdToken();
      
      // Call Cloud Function to initiate OAuth flow
      const response = await fetch('/api/oauth/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to initiate OAuth flow');
      }
      
      const { authUrl } = await response.json();
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error initiating OAuth:', err);
      setError('Erreur lors de la connexion à Google');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter Google Business Profile ?')) {
      return;
    }
    
    try {
      setIsConnecting(true);
      setError(null);
      
      // Get user auth token
      if (!auth?.currentUser) {
        setError('Vous devez être connecté');
        return;
      }
      
      const token = await auth.currentUser.getIdToken();
      
      // Call Cloud Function to revoke access
      const response = await fetch('/api/oauth/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }
      
      setOauthConfig(null);
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError('Erreur lors de la déconnexion');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefreshToken = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Get user auth token
      if (!auth?.currentUser) {
        setError('Vous devez être connecté');
        return;
      }
      
      const token = await auth.currentUser.getIdToken();
      
      const response = await fetch('/api/oauth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      
      await loadOAuthConfig();
    } catch (err) {
      console.error('Error refreshing token:', err);
      setError('Erreur lors du rafraîchissement du token');
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  const isConnected = oauthConfig?.isConnected && oauthConfig.accessToken;
  const isTokenExpired = oauthConfig?.tokenExpiresAt 
    ? oauthConfig.tokenExpiresAt.toMillis() < Date.now() 
    : false;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Avis Google Business Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Gérez vos avis clients et répondez directement depuis cette interface
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <p className="text-red-800 dark:text-red-200 font-medium">Erreur</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* OAuth Configuration Card */}
      <Card className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Configuration Google Business Profile
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connectez votre compte Google Business Profile pour gérer vos avis
            </p>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            isConnected && !isTokenExpired
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}>
            {isConnected && !isTokenExpired ? (
              <>
                <FiCheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Connecté</span>
              </>
            ) : (
              <>
                <FiAlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Non connecté</span>
              </>
            )}
          </div>
        </div>

        {isConnected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Dernière synchronisation
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {oauthConfig.lastSync 
                    ? new Date(oauthConfig.lastSync.toMillis()).toLocaleString('fr-FR')
                    : 'Jamais'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Expiration du token
                </p>
                <p className={`font-medium ${isTokenExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {oauthConfig.tokenExpiresAt
                    ? new Date(oauthConfig.tokenExpiresAt.toMillis()).toLocaleString('fr-FR')
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleRefreshToken}
                variant="secondary"
                disabled={isConnecting}
              >
                <FiRefreshCw className={`w-4 h-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
                Rafraîchir le token
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="secondary"
                disabled={isConnecting}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Déconnecter
              </Button>
            </div>

            {isTokenExpired && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  ⚠️ Le token a expiré. Veuillez rafraîchir le token ou vous reconnecter.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">
                <strong>Configuration OAuth 2.0 requise</strong>
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Pour gérer vos avis Google, vous devez d&apos;abord connecter votre compte Google Business Profile. 
                Cette opération est sécurisée et ne nécessite qu&apos;une seule configuration.
              </p>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connexion...' : 'Se connecter avec Google'}
            </Button>
          </div>
        )}
      </Card>

      {/* Reviews Section - Only shown when connected */}
      {isConnected && !isTokenExpired && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Avis récents
          </h2>
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <p className="mb-2">Aucun avis à afficher pour le moment</p>
            <p className="text-sm">
              Les avis seront synchronisés automatiquement une fois la configuration terminée
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function AdminGoogleReviewsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <GoogleReviewsPage />
    </ProtectedRoute>
  );
}
