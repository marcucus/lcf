'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FiMail, FiUser, FiPhone, FiMessageSquare } from 'react-icons/fi';

interface ContactFormProps {
  vehicleName: string;
  vehicleId: string;
}

export function ContactForm({ vehicleName, vehicleId }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      // Here we would normally send the data to a backend API
      // For now, we'll simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real implementation, you would call an API endpoint:
      // const response = await fetch('/api/vehicle-inquiry', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formData, vehicleId, vehicleName }),
      // });
      // if (!response.ok) throw new Error('Failed to send message');

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      // Show success message for 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(
        'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Intéressé par ce véhicule ?
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Remplissez le formulaire ci-dessous et nous vous contacterons rapidement.
      </p>

      {submitSuccess ? (
        <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
          <div className="text-green-600 dark:text-green-400 text-4xl mb-3">✓</div>
          <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
            Message envoyé avec succès !
          </h3>
          <p className="text-green-700 dark:text-green-300">
            Nous avons bien reçu votre demande concernant <strong>{vehicleName}</strong>.
            Nous vous contacterons dans les plus brefs délais.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute left-3 top-[42px] text-gray-400">
                <FiUser className="w-5 h-5" />
              </div>
              <Input
                label="Nom complet *"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jean Dupont"
                required
                className="pl-10"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-[42px] text-gray-400">
                <FiMail className="w-5 h-5" />
              </div>
              <Input
                label="Email *"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jean.dupont@email.com"
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-[42px] text-gray-400">
              <FiPhone className="w-5 h-5" />
            </div>
            <Input
              label="Téléphone *"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
              required
              className="pl-10"
            />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-[42px] text-gray-400">
              <FiMessageSquare className="w-5 h-5" />
            </div>
            <Textarea
              label="Message *"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={`Je suis intéressé(e) par ${vehicleName}. J'aimerais avoir plus d'informations...`}
              required
              rows={5}
              className="pl-10"
            />
          </div>

          {submitError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{submitError}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <FiMail className="w-5 h-5" />
                <span>Envoyer la demande</span>
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            * Champs obligatoires
          </p>
        </form>
      )}
    </Card>
  );
}
