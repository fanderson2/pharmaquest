import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBGZ4nahnJDgXFYejYx4t3TUbJ35DK_us",
  authDomain: "pharmaquiz-app.firebaseapp.com",
  projectId: "pharmaquiz-app",
  storageBucket: "pharmaquiz-app.firebasestorage.app",
  messagingSenderId: "826445337870",
  appId: "1:826445337870:web:2cab81b0b059e52462b35f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);