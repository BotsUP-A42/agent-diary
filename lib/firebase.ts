import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  enableIndexedDbPersistence,
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
    db = getFirestore(app);
  }
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

// Enable offline persistence for older Firestore versions (fallback)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not available in this browser');
    }
  });
}

export { app, db };
