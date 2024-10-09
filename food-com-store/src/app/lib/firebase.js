import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration object
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app if no apps have been initialized yet
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];  // Reuse the initialized app
}

// Initialize Firestore and Auth services
const db = getFirestore(app);
const auth = getAuth(app);  // Ensure getAuth uses the initialized app

export { db, auth };

// //import { initializeApp, getApps } from 'firebase/app';
// import { getFirestore, collection, getDocs } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';
// import { openDB } from 'idb';

// // Firebase configuration object
// const firebaseConfig = {
//     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

// // Initialize Firebase app if no apps have been initialized yet
// let app;
// if (!getApps().length) {
//     app = initializeApp(firebaseConfig);
// } else {
//     app = getApps()[0]; // Reuse the initialized app
// }

// // Initialize Firestore and Auth services
// const db = getFirestore(app);
// const auth = getAuth(app);

// // Open IndexedDB
// const dbPromise = openDB('my-database', 1, {
//     upgrade(db) {
//         db.createObjectStore('firebase-data'); // Create an object store for caching
//     },
// });

// // Function to save data to IndexedDB
// async function saveDataToIndexedDB(data) {
//     const db = await dbPromise;
//     await db.put('firebase-data', data, 'my-data-key'); // Store data with a specific key
// }

// // Function to retrieve data from IndexedDB
// async function getDataFromIndexedDB() {
//     const db = await dbPromise;
//     return await db.get('firebase-data', 'my-data-key'); // Retrieve data by key
// }

// // Function to fetch data from Firestore and cache it
// async function fetchAndCacheData() {
//     const querySnapshot = await getDocs(collection(db, 'your-collection')); // Replace with your collection name
//     const data = querySnapshot.docs.map(doc => doc.data());

//     // Save fetched data to IndexedDB
//     await saveDataToIndexedDB(data);
//     return data; // Return the fetched data
// }

// // Export the Firestore and Auth instances, as well as the data fetching functions
// export { db, auth, fetchAndCacheData, getDataFromIndexedDB };
