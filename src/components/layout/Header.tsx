'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiCalendar, FiTruck } from 'react-icons/fi';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-light-border dark:border-dark-border shadow-sm transition-all duration-300">
      <nav className="container mx-auto px-4 py-3" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden ring-2 ring-accent/20 group-hover:ring-accent/40 transition-all duration-300">
              <Image 
                src="/logo.jpg" 
                alt="LCF Auto Performance Logo" 
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-accent bg-clip-text text-transparent">
              LCF AUTO
            </span>
          </Link>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <ThemeToggle />
            
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                >
                  <FiUser className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span className="text-sm font-medium">
                    {user.firstName || user.email}
                  </span>
                </button>
                
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl border border-light-border dark:border-dark-border py-2 z-50 animate-slide-down"
                      role="menu"
                      aria-label="User menu"
                    >
                      <Link
                        href="/dashboard"
                        className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-accent/10 hover:text-accent transition-all duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        Mon tableau de bord
                      </Link>
                      <Link
                        href="/vehicules"
                        className="flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-accent/10 hover:text-accent transition-all duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        <FiTruck className="w-4 h-4" aria-hidden="true" />
                        <span>Mes véhicules</span>
                      </Link>
                      {(user.role === 'admin' || user.role === 'agendaManager') && (
                        <Link
                          href="/admin/calendrier"
                          className="flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-accent/10 hover:text-accent transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                          role="menuitem"
                        >
                          <FiCalendar className="w-4 h-4" aria-hidden="true" />
                          <span>Calendrier</span>
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-accent/10 hover:text-accent transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                          role="menuitem"
                        >
                          Administration
                        </Link>
                      )}
                      <hr className="my-2 border-light-border dark:border-dark-border" role="separator" />
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center space-x-2 transition-all duration-200"
                        role="menuitem"
                      >
                        <FiLogOut className="w-4 h-4" aria-hidden="true" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden md:block">
                  <button className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    Connexion
                  </button>
                </Link>
                <Link href="/rendez-vous" className="hidden md:block">
                  <button className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-accent text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200">
                    Prendre RDV
                  </button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FiX className="w-6 h-6" aria-hidden="true" /> : <FiMenu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 animate-slide-down" role="menu">
            <div className="flex flex-col space-y-2 pt-4 border-t border-light-border dark:border-dark-border">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-3 text-sm font-medium text-left rounded-lg hover:bg-accent/10 hover:text-accent transition-all duration-200" role="menuitem">
                      Mon tableau de bord
                    </button>
                  </Link>
                  <Link href="/vehicules" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-3 text-sm font-medium text-left rounded-lg hover:bg-accent/10 hover:text-accent transition-all duration-200 flex items-center space-x-2" role="menuitem">
                      <FiTruck className="w-4 h-4" aria-hidden="true" />
                      <span>Mes véhicules</span>
                    </button>
                  </Link>
                  {(user.role === 'admin' || user.role === 'agendaManager') && (
                    <Link href="/admin/calendrier" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full px-4 py-3 text-sm font-medium text-left rounded-lg hover:bg-accent/10 hover:text-accent transition-all duration-200 flex items-center space-x-2" role="menuitem">
                        <FiCalendar className="w-4 h-4" aria-hidden="true" />
                        <span>Calendrier</span>
                      </button>
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full px-4 py-3 text-sm font-medium text-left rounded-lg hover:bg-accent/10 hover:text-accent transition-all duration-200" role="menuitem">
                        Administration
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 text-sm font-medium text-left text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200"
                    role="menuitem"
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-3 text-sm font-medium text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200" role="menuitem">
                      Connexion
                    </button>
                  </Link>
                  <Link href="/rendez-vous" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-accent text-white rounded-lg hover:shadow-lg transition-all duration-200" role="menuitem">
                      Prendre RDV
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
