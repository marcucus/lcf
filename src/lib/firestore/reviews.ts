import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc,
  deleteDoc,
  query, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { GoogleReview, ResponseTemplate } from '@/types';

// ============================================================================
// RESPONSE TEMPLATES MANAGEMENT
// ============================================================================

/**
 * Get all response templates
 */
export async function getAllResponseTemplates(): Promise<ResponseTemplate[]> {
  try {
    if (!db) throw new Error('Database not initialized');
    const templatesRef = collection(db, 'responseTemplates');
    const q = query(templatesRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      templateId: doc.id,
      ...doc.data()
    } as ResponseTemplate));
  } catch (error) {
    console.error('Error getting response templates:', error);
    throw error;
  }
}

/**
 * Create a new response template
 */
export async function createResponseTemplate(
  templateData: Omit<ResponseTemplate, 'templateId' | 'createdAt'>
): Promise<string> {
  try {
    if (!db) throw new Error('Database not initialized');
    const templatesRef = collection(db, 'responseTemplates');
    const docRef = await addDoc(templatesRef, {
      ...templateData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating response template:', error);
    throw error;
  }
}

/**
 * Update a response template
 */
export async function updateResponseTemplate(
  templateId: string, 
  updates: Partial<Omit<ResponseTemplate, 'templateId' | 'createdAt'>>
): Promise<void> {
  try {
    if (!db) throw new Error('Database not initialized');
    const templateRef = doc(db, 'responseTemplates', templateId);
    await updateDoc(templateRef, updates);
  } catch (error) {
    console.error('Error updating response template:', error);
    throw error;
  }
}

/**
 * Delete a response template
 */
export async function deleteResponseTemplate(templateId: string): Promise<void> {
  try {
    if (!db) throw new Error('Database not initialized');
    const templateRef = doc(db, 'responseTemplates', templateId);
    await deleteDoc(templateRef);
  } catch (error) {
    console.error('Error deleting response template:', error);
    throw error;
  }
}

// ============================================================================
// GOOGLE REVIEWS (Placeholder functions - will be replaced by Cloud Functions)
// ============================================================================

/**
 * Get Google reviews
 * Note: In production, this would call a Cloud Function that fetches from Google Business Profile API
 * For now, returns mock data for development
 */
export async function getGoogleReviews(): Promise<GoogleReview[]> {
  try {
    // TODO: Replace with actual Cloud Function call
    // This is a placeholder that returns mock data for development
    console.warn('Using mock Google Reviews data. Implement Cloud Function for production.');
    
    // Return mock data for testing
    const mockReviews: GoogleReview[] = [
      {
        reviewId: 'review_1',
        starRating: 5,
        comment: 'Service excellent ! L\'équipe est très professionnelle et le travail est impeccable. Je recommande vivement LCF AUTO PERFORMANCE.',
        reviewer: {
          displayName: 'Jean Dupont',
          profilePhotoUrl: undefined
        },
        createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        reviewReply: {
          comment: 'Merci beaucoup pour votre retour positif ! Nous sommes ravis que notre service vous ait satisfait.',
          updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        reviewId: 'review_2',
        starRating: 4,
        comment: 'Bon garage, travail sérieux. Prix un peu élevé mais qualité au rendez-vous.',
        reviewer: {
          displayName: 'Marie Martin',
          profilePhotoUrl: undefined
        },
        createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        updateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        reviewId: 'review_3',
        starRating: 5,
        comment: 'Parfait ! Intervention rapide et efficace. Le personnel est très accueillant et prend le temps d\'expliquer.',
        reviewer: {
          displayName: 'Pierre Lefebvre',
          profilePhotoUrl: undefined
        },
        createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        updateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        reviewId: 'review_4',
        starRating: 3,
        comment: 'Service correct mais délai d\'attente un peu long. Travail bien fait sinon.',
        reviewer: {
          displayName: 'Sophie Bernard',
          profilePhotoUrl: undefined
        },
        createTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        updateTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    return mockReviews;
  } catch (error) {
    console.error('Error getting Google reviews:', error);
    throw error;
  }
}

/**
 * Reply to a Google review
 * Note: In production, this would call a Cloud Function that posts to Google Business Profile API
 */
export async function replyToGoogleReview(
  reviewId: string, 
  replyText: string
): Promise<void> {
  try {
    // TODO: Replace with actual Cloud Function call
    console.warn('Reply functionality requires Cloud Function implementation.');
    console.log('Would reply to review', reviewId, 'with text:', replyText);
    
    // Placeholder - actual implementation would call Cloud Function
    throw new Error('Cloud Function not yet implemented. Please set up Google Business Profile API integration.');
  } catch (error) {
    console.error('Error replying to Google review:', error);
    throw error;
  }
}
