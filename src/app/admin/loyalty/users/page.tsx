'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiSearch, FiPlus, FiMinus } from 'react-icons/fi';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User } from '@/types';
import { awardLoyaltyPoints } from '@/lib/firestore/loyalty';
import { useAuth } from '@/contexts/AuthContext';

function AdminUsersPointsContent() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjusting, setAdjusting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    points: 0,
    description: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(u => 
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      if (!db) throw new Error('Database not initialized');
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const usersData = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User));
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      points: 0,
      description: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !currentUser) return;
    
    if (formData.points === 0) {
      alert('Veuillez entrer un nombre de points différent de 0');
      return;
    }

    setAdjusting(true);

    try {
      await awardLoyaltyPoints(
        selectedUser.uid,
        formData.points,
        'manual_adjustment',
        formData.description || (formData.points > 0 ? 'Ajustement manuel de points' : 'Déduction manuelle de points'),
        undefined,
        currentUser.uid
      );
      
      alert('Points ajustés avec succès');
      await loadUsers();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error adjusting points:', error);
      alert(error.message || 'Erreur lors de l\'ajustement des points');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 dark:bg-dark-bg py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Link href="/admin/loyalty" className="inline-flex items-center text-accent hover:underline mb-4">
            <FiArrowLeft className="mr-2" />
            Retour à la gestion fidélité
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Gestion des points clients
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ajuster manuellement les points de fidélité des utilisateurs
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un client (nom, email...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.uid}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded text-xs font-semibold">
                        {user.loyaltyPoints || 0} points
                      </span>
                      <span className="px-2 py-1 bg-gray-500/10 text-gray-600 dark:text-gray-400 rounded text-xs">
                        {user.role === 'admin' ? 'Admin' : user.role === 'agendaManager' ? 'Gestionnaire' : 'Client'}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenModal(user)}
                  >
                    Ajuster points
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ajuster les points
              </h2>
              
              <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Points actuels: <span className="font-bold text-purple-600 dark:text-purple-400">
                    {selectedUser.loyaltyPoints || 0}
                  </span>
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ajustement de points *
                  </label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setFormData({ ...formData, points: formData.points - 10 })}
                      className="px-3"
                    >
                      <FiMinus />
                    </Button>
                    <Input
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                      required
                      className="text-center"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setFormData({ ...formData, points: formData.points + 10 })}
                      className="px-3"
                    >
                      <FiPlus />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Utilisez des nombres positifs pour ajouter, négatifs pour retirer
                  </p>
                  {formData.points !== 0 && (
                    <p className="text-sm font-medium mt-2">
                      Nouveau total:{' '}
                      <span className={formData.points > 0 ? 'text-green-600' : 'text-red-600'}>
                        {(selectedUser.loyaltyPoints || 0) + formData.points}
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Raison de l&apos;ajustement *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Compensation pour problème, Bonus exceptionnel, etc."
                    rows={3}
                    required
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <Button type="submit" disabled={adjusting || formData.points === 0} className="flex-1">
                    {adjusting ? 'Ajustement...' : 'Confirmer l\'ajustement'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                    disabled={adjusting}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPointsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminUsersPointsContent />
    </ProtectedRoute>
  );
}
