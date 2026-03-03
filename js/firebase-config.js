// Firebase Configuration - Initialize Firebase
// NOTE: Replace with your Firebase config from Firebase Console
// Steps to get your config:
// 1. Go to https://console.firebase.google.com
// 2. Click "Create a project" or select existing project
// 3. Go to Project Settings (gear icon)
// 4. Copy the config object below with your values

// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
// Firebase Configuration - Initialize Firebase
// NOTE: Replace with your Firebase config from Firebase Console
// This file no longer uses ES modules; it relies on the global `firebase`
// object loaded via the CDN scripts in the HTML pages.

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDQq-uRV5V-tTPTlEVG5Lx0uBvc_GptGt0",
    authDomain: "raj-sweet-mart-603d6.firebaseapp.com",
    databaseURL: "https://raj-sweet-mart-603d6-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "raj-sweet-mart-603d6",
    storageBucket: "raj-sweet-mart-603d6.firebasestorage.app",
    messagingSenderId: "503099076120",
    appId: "1:503099076120:web:c17e2adff5642a3ff55d6d"
};

// Initialize Firebase using the global namespace
firebase.initializeApp(firebaseConfig);

// convenience reference
var db = firebase.database();

// export for modules if needed (some files may still import)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { db };
}
