'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Véhicules', href: '/vehicules' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-light-border dark:border-dark-border">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
              LCF AUTO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-accent transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/login" className="hidden md:block">
              <button className="btn-secondary text-sm">
                Connexion
              </button>
            </Link>
            <Link href="/rendez-vous" className="hidden md:block">
              <button className="btn-primary text-sm">
                Prendre RDV
              </button>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-gray-700 dark:text-gray-300 hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-4 border-t border-light-border dark:border-dark-border">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="btn-secondary w-full text-sm">
                  Connexion
                </button>
              </Link>
              <Link href="/rendez-vous" onClick={() => setIsMenuOpen(false)}>
                <button className="btn-primary w-full text-sm">
                  Prendre RDV
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
