import { NextRequest, NextResponse } from 'next/server';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp, getApps } from 'firebase/app';

// Initialize Firebase for server-side API routes
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export async function POST(req: NextRequest) {
  try {
    // Get authorization token from request headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call Cloud Function
    const functions = getFunctions(app);
    const disconnectOAuthFn = httpsCallable(functions, 'disconnectOAuth');
    await disconnectOAuthFn();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error disconnecting OAuth:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect OAuth' },
      { status: 500 }
    );
  }
}
