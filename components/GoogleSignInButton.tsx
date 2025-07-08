import React, { useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { registerWithGoogle } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyCxEBWqELTHTzNnDSKFJrhtlOT0MVwaGWE',
  authDomain: 'mohamed145-e59c1.firebaseapp.com',
  projectId: 'mohamed145-e59c1',
  storageBucket: 'mohamed145-e59c1.appspot.com', // <-- fixed here
  messagingSenderId: '650058299808',
  appId: '1:650058299808:web:31d77c85d2e93a64d18cc5',
};

// Initialize Firebase only once
if (!getApps().length) {
  initializeApp(firebaseConfig);
}



export default function GoogleSignInButton() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // No WhatsApp or pendingUser state needed for login
  const router = useRouter();
  const { t } = useTranslation('common');

  const handleSignIn = async () => {
    setMessage('');
    setLoading(true);
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Check if user exists in your DB
      const res = await registerWithGoogle({
        email: user.email || '',
        displayName: user.displayName || undefined,
        whatsapp: undefined, // No whatsapp in login
        checkOnly: true // Custom flag to only check existence
      });
      if (res.success) {
        // Auto sign in after Google login if user exists (call API route)
        const apiRes = await fetch('/api/auth/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email || '' }),
        });
        const loginRes = await apiRes.json();
        if (loginRes.success) {
          setMessage(t('loginSuccess'));
          // Optionally redirect to dashboard
          // router.push('/customer');
        } else {
          setMessage(loginRes.message || t('loginFailed'));
        }
      } else if (res.message === 'User not found') {
        // Redirect to register page with prefilled info
        router.push(`/register?email=${encodeURIComponent(user.email || '')}&name=${encodeURIComponent(user.displayName || '')}`);
      } else {
        setMessage(res.message || t('loginFailed'));
      }
    } catch (error) {
      // @ts-ignore
      const errorCode = error.code;
      // @ts-ignore
      const errorMessage = error.message;
      // @ts-ignore
      const email = error.customData?.email;
      if (errorCode === 'auth/account-exists-with-different-credential') {
        setMessage(`Error: An account with ${email} already exists. Please sign in with your other method.`);
      } else if (errorCode === 'auth/popup-closed-by-user') {
        setMessage('Sign-in popup was closed.');
      } else {
        setMessage(`Error: ${errorMessage}`);
      }
    }
    setLoading(false);
  };

  // No WhatsApp submit handler for login

  return (
    <div>
      <button
        onClick={handleSignIn}
        disabled={loading}
        style={{
          background: '#fff',
          color: '#444',
          border: '1px solid #ccc',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {loading ? t('loading') : t('signIn')}
      </button>
      <div id="auth-message" style={{ marginTop: 12, color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</div>
    </div>
  );
}
