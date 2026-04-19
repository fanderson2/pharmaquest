import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBxjAZGzlgLmKi6VrQ9vOHEH4USI-c-Vxk",
  authDomain: "pharmaquiz-app.firebaseapp.com",
  projectId: "pharmaquiz-app",
  storageBucket: "pharmaquiz-app.appspot.com",
  messagingSenderId: "450912894302",
  appId: "1:450912894302:web:3e9b9b9b9b9b9b9b9b9b9b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);