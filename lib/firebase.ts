import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCYaiyyfVG7HiLu0t1azKnCwiBpepuuQbA",
  authDomain: "a42-diary.firebaseapp.com",
  projectId: "a42-diary",
  storageBucket: "a42-diary.firebasestorage.app",
  messagingSenderId: "994727796586",
  appId: "1:994727796586:web:7d172ec0e6731b7d714f13",
  measurementId: "G-JSG62LXY00"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { app, db };
