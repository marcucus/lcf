'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { getLoyaltySettings, updateLoyaltySettings } from '@/lib/firestore/loyalty';
import { LoyaltySettings } from '@/types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

function AdminSettingsContent() {
  const [settings, setSettings] = useState<LoyaltySettings>({
    pointsPerAppointment: 10,
    minPointsForRedemption: 100,
    welcomeBonusPoints: 50
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getLoyaltySettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!db) {
        throw new Error('Firebase non configuré');
      }
      
      // Create or update the settings document
      const settingsRef = doc(db, 'loyaltySettings', 'default');
      await setDoc(settingsRef, settings, { merge: true });
      
      alert('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/admin/loyalty" className="inline-flex items-center text-accent hover:underline mb-4">
            <FiArrowLeft className="mr-2" />
            Retour à la gestion fidélité
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Paramètres du programme de fidélité
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Configurez les règles et bonus du programme
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Points et bonus
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Points par rendez-vous complété *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.pointsPerAppointment}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      pointsPerAppointment: parseInt(e.target.value) || 0 
                    })}
                    required
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Nombre de points gagnés automatiquement à chaque rendez-vous terminé
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bonus de bienvenue
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.welcomeBonusPoints || 0}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      welcomeBonusPoints: parseInt(e.target.value) || undefined 
                    })}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Points offerts lors de la création d&apos;un nouveau compte (0 pour désactiver)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bonus d&apos;anniversaire
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.birthdayBonusPoints || 0}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      birthdayBonusPoints: parseInt(e.target.value) || undefined 
                    })}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Points offerts le jour de l&apos;anniversaire du client (0 pour désactiver)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bonus de parrainage
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.referralBonusPoints || 0}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      referralBonusPoints: parseInt(e.target.value) || undefined 
                    })}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Points offerts pour chaque client parrainé (0 pour désactiver)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Points par euro dépensé
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={settings.pointsPerEuroSpent || 0}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      pointsPerEuroSpent: parseFloat(e.target.value) || undefined 
                    })}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Points gagnés pour chaque euro dépensé (0 pour désactiver)
                  </p>
                </div>
              </div>
            </Card>

            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Règles d&apos;échange
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Points minimum pour échanger *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.minPointsForRedemption}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      minPointsForRedemption: parseInt(e.target.value) || 0 
                    })}
                    required
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Nombre minimum de points nécessaires pour échanger une récompense
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <Link href="/admin/loyalty">
                <Button type="button" variant="secondary">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                <FiSave className="mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminSettingsContent />
    </ProtectedRoute>
  );
}
