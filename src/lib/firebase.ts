import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCq3vOgspR1zCvEk5bh9pw8bq7Yrzsw0v4",
  authDomain: "si-labaku-d7687.firebaseapp.com",
  projectId: "si-labaku-d7687",
  storageBucket: "si-labaku-d7687.firebasestorage.app",
  messagingSenderId: "64748198123",
  appId: "1:64748198123:web:4cbdbc0ded0dabb4446ae",
  measurementId: "G-MFM4TBTH1J"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);