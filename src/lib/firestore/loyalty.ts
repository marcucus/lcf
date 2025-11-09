import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  runTransaction,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  LoyaltyTransaction, 
  LoyaltyTransactionType, 
  Reward, 
  UserReward, 
  LoyaltySettings 
} from '@/types';

// Helper to check if db is initialized
function ensureDb() {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized');
  }
  return db;
}

// ============================================================================
// LOYALTY POINTS MANAGEMENT
// ============================================================================

/**
 * Get user's current loyalty points
 */
export async function getUserLoyaltyPoints(userId: string): Promise<number> {
  try {
    if (!db) throw new Error('Database not initialized');
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data()?.loyaltyPoints || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting user loyalty points:', error);
    throw error;
  }
}

/**
 * Award loyalty points to a user
 * @param userId - User ID
 * @param points - Number of points to award
 * @param type - Type of transaction
 * @param description - Description of the transaction
 * @param relatedId - Optional related appointment or reward ID
 * @param createdBy - Optional admin ID for manual adjustments
 */
export async function awardLoyaltyPoints(
  userId: string,
  points: number,
  type: LoyaltyTransactionType,
  description: string,
  relatedId?: string,
  createdBy?: string
): Promise<void> {
  try {
    if (!db) throw new Error('Database not initialized');
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db!, 'users', userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      // Update user's points
      transaction.update(userRef, {
        loyaltyPoints: increment(points)
      });

      // Create transaction record
      const transactionRef = doc(collection(db!, 'loyaltyTransactions'));
      const transactionData: Omit<LoyaltyTransaction, 'transactionId'> = {
        userId,
        type,
        points,
        description,
        createdAt: Timestamp.now(),
        ...(relatedId && type === 'appointment_completed' && { relatedAppointmentId: relatedId }),
        ...(relatedId && type === 'reward_redemption' && { relatedRewardId: relatedId }),
        ...(createdBy && { createdBy })
      };

      transaction.set(transactionRef, transactionData);
    });
  } catch (error) {
    console.error('Error awarding loyalty points:', error);
    throw error;
  }
}

/**
 * Deduct loyalty points from a user (for reward redemption)
 */
export async function deductLoyaltyPoints(
  userId: string,
  points: number,
  rewardId: string,
  description: string
): Promise<void> {
  try {
    if (!db) throw new Error('Database not initialized');
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db!, 'users', userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentPoints = userDoc.data()?.loyaltyPoints || 0;
      
      if (currentPoints < points) {
        throw new Error('Insufficient loyalty points');
      }

      // Update user's points
      transaction.update(userRef, {
        loyaltyPoints: increment(-points)
      });

      // Create transaction record
      const transactionRef = doc(collection(db!, 'loyaltyTransactions'));
      const transactionData: Omit<LoyaltyTransaction, 'transactionId'> = {
        userId,
        type: 'reward_redemption',
        points: -points,
        description,
        relatedRewardId: rewardId,
        createdAt: Timestamp.now()
      };

      transaction.set(transactionRef, transactionData);
    });
  } catch (error) {
    console.error('Error deducting loyalty points:', error);
    throw error;
  }
}

/**
 * Get user's loyalty transaction history
 */
export async function getUserLoyaltyTransactions(
  userId: string,
  limitCount: number = 50
): Promise<LoyaltyTransaction[]> {
  try {
    if (!db) throw new Error('Database not initialized');
    const transactionsRef = collection(db, 'loyaltyTransactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      transactionId: doc.id,
      ...doc.data()
    } as LoyaltyTransaction));
  } catch (error) {
    console.error('Error getting loyalty transactions:', error);
    throw error;
  }
}

// ============================================================================
// REWARDS MANAGEMENT
// ============================================================================

/**
 * Get all active rewards
 */
export async function getActiveRewards(): Promise<Reward[]> {
  try {
    if (!db) throw new Error('Database not initialized');
    const rewardsRef = collection(db, 'rewards');
    const q = query(
      rewardsRef,
      where('isActive', '==', true),
      orderBy('pointsCost', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      rewardId: doc.id,
      ...doc.data()
    } as Reward));
  } catch (error) {
    console.error('Error getting active rewards:', error);
    throw error;
  }
}

/**
 * Get all rewards (admin function)
 */
export async function getAllRewards(): Promise<Reward[]> {
  try {
    if (!db) throw new Error('Database not initialized');
    const rewardsRef = collection(db, 'rewards');
    const q = query(rewardsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      rewardId: doc.id,
      ...doc.data()
    } as Reward));
  } catch (error) {
    console.error('Error getting all rewards:', error);
    throw error;
  }
}

/**
 * Get a specific reward by ID
 */
export async function getRewardById(rewardId: string): Promise<Reward | null> {
  try {
    if (!db) throw new Error('Database not initialized');
    const rewardRef = doc(db, 'rewards', rewardId);
    const rewardSnap = await getDoc(rewardRef);
    
    if (rewardSnap.exists()) {
      return {
        rewardId: rewardSnap.id,
        ...rewardSnap.data()
      } as Reward;
    }
    return null;
  } catch (error) {
    console.error('Error getting reward:', error);
    throw error;
  }
}

/**
 * Create a new reward (admin function)
 */
export async function createReward(rewardData: Omit<Reward, 'rewardId' | 'createdAt'>): Promise<string> {
  try {
    if (!db) throw new Error('Database not initialized');
    const rewardsRef = collection(db, 'rewards');
    const docRef = await addDoc(rewardsRef, {
      ...rewardData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating reward:', error);
    throw error;
  }
}

/**
 * Update a reward (admin function)
 */
export async function updateReward(rewardId: string, updates: Partial<Reward>): Promise<void> {
  try {
    if (!db) throw new Error('Database not initialized');
    const rewardRef = doc(db, 'rewards', rewardId);
    await updateDoc(rewardRef, updates);
  } catch (error) {
    console.error('Error updating reward:', error);
    throw error;
  }
}

// ============================================================================
// REWARD REDEMPTION
// ============================================================================

/**
 * Claim a reward for a user
 */
export async function claimReward(userId: string, rewardId: string): Promise<string> {
  try {
    if (!db) throw new Error('Database not initialized');
    let userRewardId: string = '';
    
    await runTransaction(ensureDb(), async (transaction) => {
      // Get reward details
      const rewardRef = doc(db!, 'rewards', rewardId);
      const rewardDoc = await transaction.get(rewardRef);
      
      if (!rewardDoc.exists()) {
        throw new Error('Reward not found');
      }
      
      const reward = rewardDoc.data() as Reward;
      
      if (!reward.isActive) {
        throw new Error('Reward is not active');
      }
      
      if (reward.stock !== undefined && reward.stock <= 0) {
        throw new Error('Reward is out of stock');
      }
      
      // Get user's current points
      const userRef = doc(db!, 'users', userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const currentPoints = userDoc.data()?.loyaltyPoints || 0;
      
      if (currentPoints < reward.pointsCost) {
        throw new Error('Insufficient loyalty points');
      }
      
      // Deduct points
      transaction.update(userRef, {
        loyaltyPoints: increment(-reward.pointsCost)
      });
      
      // Update reward stock if applicable
      if (reward.stock !== undefined) {
        transaction.update(rewardRef, {
          stock: increment(-1)
        });
      }
      
      // Create user reward record
      const userRewardRef = doc(collection(db!, 'userRewards'));
      const userRewardData: Omit<UserReward, 'userRewardId'> = {
        userId,
        rewardId,
        rewardName: reward.name,
        pointsSpent: reward.pointsCost,
        status: 'available',
        claimedAt: Timestamp.now(),
        ...(reward.validUntil && { expiresAt: reward.validUntil })
      };
      
      transaction.set(userRewardRef, userRewardData);
      userRewardId = userRewardRef.id;
      
      // Create transaction record
      const transactionRef = doc(collection(db!, 'loyaltyTransactions'));
      const transactionData: Omit<LoyaltyTransaction, 'transactionId'> = {
        userId,
        type: 'reward_redemption',
        points: -reward.pointsCost,
        description: `Redeemed: ${reward.name}`,
        relatedRewardId: rewardId,
        createdAt: Timestamp.now()
      };
      
      transaction.set(transactionRef, transactionData);
    });
    
    return userRewardId;
  } catch (error) {
    console.error('Error claiming reward:', error);
    throw error;
  }
}

/**
 * Get user's claimed rewards
 */
export async function getUserRewards(userId: string): Promise<UserReward[]> {
  try {
    if (!db) throw new Error('Database not initialized');
    const userRewardsRef = collection(db, 'userRewards');
    const q = query(
      userRewardsRef,
      where('userId', '==', userId),
      orderBy('claimedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      userRewardId: doc.id,
      ...doc.data()
    } as UserReward));
  } catch (error) {
    console.error('Error getting user rewards:', error);
    throw error;
  }
}

/**
 * Mark a user reward as used
 */
export async function markRewardAsUsed(userRewardId: string): Promise<void> {
  try {
    if (!db) throw new Error('Database not initialized');
    const userRewardRef = doc(db, 'userRewards', userRewardId);
    await updateDoc(userRewardRef, {
      status: 'used',
      usedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error marking reward as used:', error);
    throw error;
  }
}

// ============================================================================
// LOYALTY SETTINGS
// ============================================================================

/**
 * Get loyalty program settings
 */
export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  try {
    if (!db) throw new Error('Database not initialized');
    const settingsRef = doc(db, 'loyaltySettings', 'default');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      return settingsSnap.data() as LoyaltySettings;
    }
    
    // Return default settings if not found
    return {
      pointsPerAppointment: 10,
      welcomeBonusPoints: 50,
      minPointsForRedemption: 100
    };
  } catch (error) {
    console.error('Error getting loyalty settings:', error);
    throw error;
  }
}

/**
 * Update loyalty program settings (admin function)
 */
export async function updateLoyaltySettings(settings: Partial<LoyaltySettings>): Promise<void> {
  try {
    if (!db) throw new Error('Database not initialized');
    const settingsRef = doc(db, 'loyaltySettings', 'default');
    await updateDoc(settingsRef, settings);
  } catch (error) {
    console.error('Error updating loyalty settings:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Award points for a completed appointment
 */
export async function awardPointsForAppointment(userId: string, appointmentId: string): Promise<void> {
  try {
    const settings = await getLoyaltySettings();
    const points = settings.pointsPerAppointment;
    
    await awardLoyaltyPoints(
      userId,
      points,
      'appointment_completed',
      `Points earned for completed appointment`,
      appointmentId
    );
  } catch (error) {
    console.error('Error awarding points for appointment:', error);
    throw error;
  }
}

/**
 * Award welcome bonus points to new user
 */
export async function awardWelcomeBonus(userId: string): Promise<void> {
  try {
    const settings = await getLoyaltySettings();
    const points = settings.welcomeBonusPoints || 0;
    
    if (points > 0) {
      await awardLoyaltyPoints(
        userId,
        points,
        'bonus',
        'Welcome bonus - Thank you for joining!'
      );
    }
  } catch (error) {
    console.error('Error awarding welcome bonus:', error);
    throw error;
  }
}
