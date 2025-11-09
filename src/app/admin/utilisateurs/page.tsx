'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { UsersTable } from '@/components/admin/UsersTable';
import { UserModal, UserFormData } from '@/components/admin/UserModal';
import { UserDetailsModal } from '@/components/admin/UserDetailsModal';
import { DeleteUserConfirmation } from '@/components/admin/DeleteUserConfirmation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUsersByRole,
} from '@/lib/firestore/users';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';

function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Deleting state
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { users: fetchedUsers } = await getAllUsers(100);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(search) ||
          user.lastName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsUserModalOpen(true);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleUserSubmit = async (data: UserFormData) => {
    try {
      if (modalMode === 'create') {
        await createUser(data.email, data.firstName, data.lastName, data.role);
      } else if (selectedUser) {
        await updateUser(selectedUser.uid, {
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
        });
      }
      await loadUsers();
      setIsUserModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      await deleteUser(selectedUser.uid);
      await loadUsers();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Gestion des utilisateurs
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gérer tous les comptes utilisateurs de l&apos;application
            </p>
          </div>
          <Button onClick={handleCreateUser} className="flex items-center space-x-2">
            <FiPlus className="w-5 h-5" />
            <span>Nouvel utilisateur</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {users.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total utilisateurs
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {users.filter((u) => u.role === 'admin').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Administrateurs
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {users.filter((u) => u.role === 'agendaManager').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestionnaires
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                {users.filter((u) => u.role === 'user').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Utilisateurs
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-64">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Tous les rôles' },
                { value: 'admin', label: 'Administrateur' },
                { value: 'agendaManager', label: 'Gestionnaire' },
                { value: 'user', label: 'Utilisateur' },
              ]}
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{filteredUsers.length}</span> utilisateur(s) trouvé(s)
            {(searchTerm || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                }}
                className="ml-2 text-accent hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </p>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Chargement des utilisateurs...
            </p>
          </div>
        ) : (
          <UsersTable
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onViewDetails={handleViewDetails}
            currentUserId={currentUser?.uid}
          />
        )}
      </Card>

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleUserSubmit}
        user={selectedUser}
        mode={modalMode}
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        user={selectedUser}
      />

      <DeleteUserConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default function UsersManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <UsersPage />
    </ProtectedRoute>
  );
}
