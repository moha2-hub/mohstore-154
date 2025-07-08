import React, { useState } from 'react';

import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';

// TODO: Replace with your Firebase config (should match your main config)
const firebaseConfig = {
  apiKey: 'AIzaSyCxEBWqELTHTzNnDSKFJrhtlOT0MVwaGWE',
  authDomain: 'mohamed145-e59c1.firebaseapp.com',
  projectId: 'mohamed145-e59c1',
  storageBucket: 'mohamed145-e59c1.firebasestorage.app',
  messagingSenderId: '650058299808',
  appId: '1:650058299808:web:31d77c85d2e93a64d18cc5',
};

export default function GoogleRegisterButton({ onRegister }: { onRegister: (user: any) => void }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Ensure Firebase is initialized
      if (!getApps().length) {
        initializeApp(firebaseConfig);
      }
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setMessage(`Welcome, ${user.displayName || user.email}!`);
      if (onRegister) onRegister(user);
    } catch (error) {
      // @ts-ignore
      setMessage(error.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16, textAlign: 'center' }}>
      <button
        onClick={handleRegister}
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
        {loading ? 'Registering...' : 'Register with Google'}
      </button>
      <div style={{ marginTop: 8, color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</div>
    </div>
  );
}
