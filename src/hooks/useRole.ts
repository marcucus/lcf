import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export function useRole() {
  const { user } = useAuth();

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const isUser = hasRole('user');
  const isAgendaManager = hasRole(['agendaManager', 'admin']);
  const isAdmin = hasRole('admin');

  return {
    user,
    hasRole,
    isUser,
    isAgendaManager,
    isAdmin,
  };
}
