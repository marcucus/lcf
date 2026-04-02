'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VehicleGrid } from '@/components/admin/VehicleGrid';
import { Vehicle } from '@/types';
import { getVehiclesForSale } from '@/lib/firestore/vehicles';
import { 
  FiTool, 
  FiSettings, 
  FiZap, 
  FiCheckCircle,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiInstagram,
  FiArrowRight,
  FiAlertTriangle,
  FiTruck,
  FiCheck,
  FiShield,
  FiDollarSign,
  FiAward
} from 'react-icons/fi';

import { MdOutlineConnectWithoutContact } from "react-icons/md";


export default function Home() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, [loadingVehicles, vehicles]);

  // Fetch vehicles for sale
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoadingVehicles(true);
        setVehiclesError(null);
        const data = await getVehiclesForSale();
        setVehicles(data);
      } catch (error) {
        console.error('Error loading vehicles:', error);
        setVehiclesError('Impossible de charger les véhicules');
      } finally {
        setLoadingVehicles(false);
      }
    };

    loadVehicles();
  }, []);

  const services = [
    {
      icon: <FiTool className="w-12 h-12 text-accent" />,
      title: 'Entretien',
      description: 'Service complet d\'entretien pour maintenir votre véhicule en parfait état. Révision, vidange, filtres et plus encore.',
      details: [
        'Vidange moteur et filtres',
        'Contrôle des niveaux',
        'Vérification des freins',
        'Contrôle de la climatisation',
        'Diagnostic électronique',
      ],
      href: '/services/entretien',
    },
    {
      icon: <FiSettings className="w-12 h-12 text-accent" />,
      title: 'Réparation',
      description: 'Diagnostic et réparation de tous types de pannes avec du matériel professionnel et des pièces de qualité.',
      details: [
        'Diagnostic électronique complet',
        'Réparation mécanique',
        'Remplacement de pièces',
        'Réparation électrique',
        'Garantie sur les pièces et main d\'œuvre',
      ],
      href: '/services/reparation',
    },
    {
      icon: <FiZap className="w-12 h-12 text-accent" />,
      title: 'Re-programmation',
      description: 'Optimisation des performances de votre moteur avec reprogrammation ECU professionnelle.',
      details: [
        'Reprogrammation ECU Stage 1 & 2',
        'Optimisation du couple et de la puissance',
        'Amélioration de la consommation',
        'Suppression FAP/EGR',
        'Garantie moteur incluse',
      ],
      href: '/services/reprogrammation',
    },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="accueil" className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-dark-bg dark:to-blue-950/20" aria-label="Hero section">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8 flex justify-center animate-fade-in">
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Image 
                  src="/logo.jpg" 
                  alt="LCF Auto Performance" 
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-blue-600 via-accent to-blue-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                LCF Auto Performance
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-12 animate-slide-up animation-delay-200 leading-relaxed">
              Votre garage de confiance pour l&apos;entretien, la réparation et l&apos;optimisation de votre véhicule
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up animation-delay-400">
              <Link href="/rendez-vous">
                <Button size="lg" className="group">
                  Prendre rendez-vous
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                onClick={() => scrollToSection('services')}
                className="btn-outline btn-lg group"
                variant='outline'
              >
                Découvrir nos services
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" aria-hidden="true">
          <div className="w-6 h-10 border-2 border-accent rounded-full flex justify-center">
            <div className="w-1 h-3 bg-accent rounded-full mt-2 animate-scroll" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white dark:bg-dark-bg scroll-mt-16" aria-labelledby="services-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 id="services-heading" className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Nos Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Une gamme complète de prestations pour prendre soin de votre véhicule
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <div 
                key={service.title} 
                className="animate-on-scroll"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card hover className="h-full group">
                  <div className="text-center mb-6">
                    <div className="flex justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      {service.icon}
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {service.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {service.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start space-x-3 group/item">
                        <FiCheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link href={service.href}>
                    <Button fullWidth variant="outline" className="group/btn">
                      En savoir plus
                      <FiArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="expertise" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-dark-bg-secondary dark:to-blue-950/10 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Pourquoi nous choisir ?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: FiTool,
                title: 'Expertise Professionnelle',
                description: 'Une équipe de mécaniciens qualifiés et expérimentés à votre service'
              },
              {
                icon: FiZap,
                title: 'Service Rapide',
                description: 'Intervention efficace pour minimiser votre temps d\'immobilisation'
              },
              {
                icon: FiAward,
                title: 'Qualité Garantie',
                description: 'Pièces de qualité et travail garanti pour votre satisfaction totale'
              }
            ].map((item, index) => (
              <div 
                key={item.title}
                className="text-center group animate-on-scroll"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-6 flex justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <item.icon className="w-16 h-16 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles Section */}
      <section id="vehicules" className="py-24 bg-white dark:bg-dark-bg scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Véhicules d&apos;occasion
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Découvrez notre sélection de véhicules de qualité, contrôlés et garantis
              </p>
            </div>

            {loadingVehicles ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Chargement des véhicules...
                </p>
              </div>
            ) : vehiclesError ? (
              <Card className="animate-on-scroll">
                <div className="text-center py-16">
                  <FiAlertTriangle className="w-20 h-20 mx-auto mb-8 text-amber-500" />
                  <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                    Erreur de chargement
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                    {vehiclesError}. Veuillez réessayer plus tard.
                  </p>
                </div>
              </Card>
            ) : vehicles.length === 0 ? (
              <Card className="animate-on-scroll">
                <div className="text-center py-16">
                  <FiTruck className="w-20 h-20 mx-auto mb-8 text-gray-400 dark:text-gray-500 animate-bounce-slow" />
                  <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                    Aucun véhicule disponible
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                    Notre catalogue de véhicules d&apos;occasion sera bientôt disponible. 
                    Nous sélectionnons pour vous les meilleures opportunités.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="animate-on-scroll mb-12">
                <VehicleGrid vehicles={vehicles} isAdmin={false} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                { icon: FiCheck, title: 'Véhicules contrôlés', desc: 'Tous nos véhicules sont contrôlés et révisés avant la vente' },
                { icon: FiShield, title: 'Garantie incluse', desc: 'Garantie constructeur ou extension de garantie disponible' },
                { icon: FiDollarSign, title: 'Financement', desc: 'Solutions de financement adaptées à votre budget' }
              ].map((feature, index) => (
                <div 
                  key={feature.title}
                  className="text-center animate-on-scroll"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-center mb-4"><feature.icon className="w-12 h-12 text-accent" /></div>
                  <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-dark-bg-secondary dark:to-blue-950/10 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Contactez-nous
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Notre équipe est à votre disposition pour répondre à toutes vos questions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Contact Cards */}
            <div className="space-y-6">
              {[
                {
                  icon: <FiMapPin className="w-6 h-6 text-accent" />,
                  title: 'Adresse',
                  content: <>6 Rue de la Forteresse<br/> 41330 Saint-Bohaire<br />France</>
                },
                {
                  icon: <FiPhone className="w-6 h-6 text-accent" />,
                  title: 'Téléphone',
                  content: <a href="tel:+33761888263" className="hover:text-accent transition-colors">07 61 88 82 63</a>
                },
                {
                  icon: <FiMail className="w-6 h-6 text-accent" />,
                  title: 'Email',
                  content: <a href="mailto:lcfautoperformance@outlook.fr" className="hover:text-accent transition-colors break-all">lcfautoperformance@outlook.fr</a>
                },
                {
                  icon: <FiClock className="w-6 h-6 text-accent" />,
                  title: 'Horaires d\'ouverture',
                  content: (
                    <>
                      <p><strong>Lundi - Vendredi</strong></p>
                      <p>10:00 - 12:00 | 14:00 - 18:00</p>
                      <p className="mt-2"><strong>Samedi - Dimanche:</strong> Fermé</p>
                    </>
                  )
                }
              ].map((item, index) => (
                <Card 
                  key={item.title}
                  className="animate-on-scroll hover-lift"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-accent/10 rounded-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <div className="text-gray-600 dark:text-gray-400">
                        {item.content}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Social Media */}
              <Card className="animate-on-scroll">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-accent/10 rounded-lg flex-shrink-0">
                    <MdOutlineConnectWithoutContact className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                      Suivez-nous
                    </h3>
                    <div className="flex space-x-4">
                      <a
                        href="https://www.instagram.com/lcf_auto_performance/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-accent hover:text-white transition-all duration-300 transform hover:scale-110"
                      >
                        <FiInstagram className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Map */}
            <div className="h-[600px] rounded-2xl overflow-hidden shadow-2xl animate-on-scroll hover-lift">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2688.333827724315!2d1.2197938770005707!3d47.63907937119286!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e35b0076ed074b%3A0xdc744fb61db73af3!2sLCF%20AUTO%20PERFORMANCE!5e0!3m2!1sfr!2sfr!4v1771265745970!5m2!1sfr!2sfr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="LCF Auto Performance Location"
                aria-label="Google Maps location of LCF Auto Performance"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-accent to-blue-500 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white animate-on-scroll">
            Prêt à prendre rendez-vous ?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto animate-on-scroll animation-delay-200">
            Réservez en ligne en quelques clics et profitez d&apos;un service de qualité
          </p>
          <Link href="/rendez-vous">
            <button className="bg-white text-accent hover:bg-gray-100 font-bold px-10 py-5 rounded-xl text-xl transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform duration-300 animate-on-scroll animation-delay-400 group">
              Prendre rendez-vous maintenant
              <FiArrowRight className="inline-block ml-2 group-hover:translate-x-2 transition-transform" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
