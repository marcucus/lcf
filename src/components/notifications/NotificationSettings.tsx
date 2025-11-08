'use client';

import { useState, useEffect } from 'react';
import { FiBell, FiBellOff, FiCheck, FiX } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NotificationPreferences } from '@/types';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/firestore/notifications';
import {
  isNotificationSupported,
  getNotificationPermission,
  getFCMToken,
  removeFCMToken,
} from '@/lib/firebase/messaging';

interface NotificationSettingsProps {
  userId: string;
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    appointmentReminders: true,
    newVehicles: true,
    generalUpdates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [hasToken, setHasToken] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
    checkPermissionStatus();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences(userId);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissionStatus = () => {
    if (isNotificationSupported()) {
      const permission = getNotificationPermission();
      setPermissionStatus(permission);
      setHasToken(permission === 'granted');
    }
  };

  const handleTogglePreference = async (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await updateNotificationPreferences(userId, preferences);
      setMessage({ type: 'success', text: 'Préférences enregistrées avec succès' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement des préférences' });
    } finally {
      setSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const token = await getFCMToken(userId);
      if (token) {
        setHasToken(true);
        setPermissionStatus('granted');
        setMessage({ type: 'success', text: 'Notifications activées avec succès' });
      } else {
        setMessage({ type: 'error', text: 'Impossible d\'activer les notifications. Vérifiez les autorisations de votre navigateur.' });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'activation des notifications' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDisableNotifications = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await removeFCMToken(userId);
      setHasToken(false);
      setMessage({ type: 'success', text: 'Notifications désactivées' });
    } catch (error) {
      console.error('Error disabling notifications:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la désactivation des notifications' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!isNotificationSupported()) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiBellOff className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold">Notifications Push</h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Les notifications push ne sont pas supportées par votre navigateur.
          </p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1CCEFF]"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <FiBell className="w-6 h-6 text-[#1CCEFF]" />
          <h2 className="text-xl font-semibold">Notifications Push</h2>
        </div>

        {/* Permission Status */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1">Statut des notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {permissionStatus === 'granted' && hasToken && 'Notifications activées'}
                {permissionStatus === 'granted' && !hasToken && 'Autorisées mais non configurées'}
                {permissionStatus === 'denied' && 'Notifications bloquées par votre navigateur'}
                {permissionStatus === 'default' && 'Notifications non configurées'}
              </p>
            </div>
            {!hasToken && permissionStatus !== 'denied' && (
              <Button
                onClick={handleEnableNotifications}
                disabled={saving}
                className="whitespace-nowrap"
              >
                Activer
              </Button>
            )}
            {hasToken && (
              <Button
                onClick={handleDisableNotifications}
                disabled={saving}
                variant="secondary"
                className="whitespace-nowrap"
              >
                Désactiver
              </Button>
            )}
          </div>
        </div>

        {/* Message feedback */}
        {message && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <FiCheck className="w-5 h-5 flex-shrink-0" />
            ) : (
              <FiX className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Notification Preferences */}
        {hasToken && (
          <>
            <div className="space-y-4 mb-6">
              <h3 className="font-medium mb-3">Types de notifications</h3>

              {/* Appointment Reminders */}
              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="font-medium">Rappels de rendez-vous</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Recevez une notification 24h avant votre rendez-vous
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.appointmentReminders}
                  onChange={() => handleTogglePreference('appointmentReminders')}
                  className="w-5 h-5 text-[#1CCEFF] rounded focus:ring-[#1CCEFF]"
                />
              </label>

              {/* New Vehicles */}
              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="font-medium">Nouveaux véhicules</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Soyez informé quand un nouveau véhicule est disponible à la vente
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.newVehicles}
                  onChange={() => handleTogglePreference('newVehicles')}
                  className="w-5 h-5 text-[#1CCEFF] rounded focus:ring-[#1CCEFF]"
                />
              </label>

              {/* General Updates */}
              <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="font-medium">Actualités générales</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Recevez les actualités et promotions du garage
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.generalUpdates}
                  onChange={() => handleTogglePreference('generalUpdates')}
                  className="w-5 h-5 text-[#1CCEFF] rounded focus:ring-[#1CCEFF]"
                />
              </label>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSavePreferences} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
              </Button>
            </div>
          </>
        )}

        {/* Help text */}
        {permissionStatus === 'denied' && (
          <div className="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
            <p className="text-sm">
              <strong>Notifications bloquées :</strong> Vous avez bloqué les notifications pour ce site.
              Pour les activer, cliquez sur l'icône de cadenas dans la barre d'adresse de votre navigateur
              et autorisez les notifications.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
