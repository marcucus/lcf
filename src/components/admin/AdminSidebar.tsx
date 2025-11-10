'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiTruck,
  FiStar,
  FiFileText,
  FiDollarSign,
} from 'react-icons/fi';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      label: 'Tableau de bord',
      href: '/admin',
      icon: <FiHome className="w-5 h-5" />,
    },
    {
      label: 'Calendrier',
      href: '/admin/calendrier',
      icon: <FiCalendar className="w-5 h-5" />,
    },
    {
      label: 'Chiffre d\'affaires',
      href: '/admin/chiffre-affaires',
      icon: <FiDollarSign className="w-5 h-5" />,
      adminOnly: true,
    },
    {
      label: 'Utilisateurs',
      href: '/admin/utilisateurs',
      icon: <FiUsers className="w-5 h-5" />,
      adminOnly: true,
    },
    {
      label: 'Véhicules',
      href: '/admin/vehicules',
      icon: <FiTruck className="w-5 h-5" />,
      adminOnly: true,
    },
    {
      label: 'Factures',
      href: '/admin/factures',
      icon: <FiFileText className="w-5 h-5" />,
      adminOnly: true,
    },
    {
      label: 'Déclaration Fiscale',
      href: '/admin/declaration-fiscale',
      icon: <FiDollarSign className="w-5 h-5" />,
      adminOnly: true,
    },
    {
      label: 'Avis Google',
      href: '/admin/avis',
      icon: <FiStar className="w-5 h-5" />,
      adminOnly: true,
    },
    {
      label: 'Devis',
      href: '/admin/devis',
      icon: <FiFileText className="w-5 h-5" />,
      adminOnly: true,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <aside className="w-64 bg-white dark:bg-dark-bg-secondary border-r border-light-border dark:border-dark-border">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          Administration
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {user?.role === 'admin' ? 'Administrateur' : 'Gestionnaire'}
        </p>
      </div>

      <nav className="px-3">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
