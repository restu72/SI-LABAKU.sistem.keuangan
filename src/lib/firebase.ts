import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAGx_tM7z7gCtinEu9-zub_QcMRn95F7r0",
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