import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCYaiyyfVG7HiLu0t1azKnCwiBpepuuQbA",
  authDomain: "a42-diary.firebaseapp.com",
  projectId: "a42-diary",
  storageBucket: "a42-diary.firebasestorage.app",
  messagingSenderId: "994727796586",
  appId: "1:994727796586:web:7d172ec0e6731b7d714f13",
  measurementId: "G-JSG62LXY00"
};

// Initialize Firebase with persistent cache for better performance
let app: FirebaseApp;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Use the new persistentLocalCache for better offline support and performance
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
      })
    });
  } catch (e) {
    // Fallback to regular getFirestore if initializeFirestore fails
    console.warn('Failed to initialize Firestore with persistent cache, using default:', e);
    db = getFirestore(app);
  }
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

export { app, db };
